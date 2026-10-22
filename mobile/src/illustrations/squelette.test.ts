import { calculerPoints, interpolerPose, poseALinstant, type Pose } from './squelette';

export const DEBOUT: Pose = {
  vue: 'profil', racine: { x: 100, y: 112 }, tronc: 0, tete: 0,
  brasGauche: { epaule: 0, coude: 0 }, brasDroit: { epaule: 0, coude: 0 },
  jambeGauche: { hanche: 0, genou: 0, cheville: 0 },
  jambeDroite: { hanche: 0, genou: 0, cheville: 0 },
};

test('cinématique debout : dimensions et articulations connues', () => {
  const p = calculerPoints(DEBOUT);
  for (const [nom, attendu] of Object.entries({ bassin: [100,112], cou: [100,64], tete: [100,53],
    epauleDroite: [103,70], coudeDroit: [103,96], mainDroite: [103,120],
    genouDroit: [103,146], chevilleDroite: [103,180], orteilsDroits: [116,180] })) {
    const point = p[nom as keyof typeof p];
    expect(point.x).toBeCloseTo(attendu[0], 0);
    expect(point.y).toBeCloseTo(attendu[1], 0);
  }
});

test('interpolation aux bornes et milieu, sans mutation', () => {
  const b = { ...DEBOUT, racine: { x: 120, y: 100 }, tronc: 40 };
  expect(interpolerPose(DEBOUT, b, 0)).toEqual(DEBOUT);
  expect(interpolerPose(DEBOUT, b, 1)).toEqual(b);
  expect(interpolerPose(DEBOUT, b, .5)).toMatchObject({ racine: { x: 110, y: 106 }, tronc: 20 });
  expect(DEBOUT.racine.y).toBe(112);
});

test('350 vers 10 traverse zéro pour chaque angle', () => {
  const a = { ...DEBOUT, tronc: 350, brasDroit: { epaule: 350, coude: 350 } };
  const b = { ...DEBOUT, tronc: 10, brasDroit: { epaule: 10, coude: 10 } };
  const p = interpolerPose(a, b, .5);
  expect(p.tronc % 360).toBe(0);
  expect(p.brasDroit.coude % 360).toBe(0);
});

test('boucle continue avec easing et clé unique', () => {
  const cles = [DEBOUT, { ...DEBOUT, tronc: 40 }];
  expect(poseALinstant(cles, .5).tronc).toBe(40);
  expect(poseALinstant(cles, .125).tronc).toBeCloseTo(5.857864);
  expect(poseALinstant(cles, 1 - 1e-7).tronc).toBeCloseTo(0, 5);
  expect(poseALinstant(cles, 1)).toEqual(poseALinstant(cles, 0));
  expect(poseALinstant([DEBOUT], .7)).toEqual(DEBOUT);
  expect(() => poseALinstant([], 0)).toThrow();
});

test('vitesse constante en mode continu', () => {
  const cles = [DEBOUT, { ...DEBOUT, tronc: 40 }];
  expect(poseALinstant(cles, .25, true).tronc).toBeCloseTo(20);
  expect(poseALinstant(cles, .125, true).tronc).toBeCloseTo(10);
});

test('la poitrine s’interpole comme le dos', () => {
  expect(interpolerPose(DEBOUT, { ...DEBOUT, poitrine: 1 }, .5).poitrine).toBeCloseTo(.5);
});

test('cibles de mains : le bras atteint l’appui sans changer de longueur, le pli suit le signe du coude', () => {
  const cible = { x: 103, y: 110 };
  for (const signe of [1, -1]) {
    const pose: Pose = { ...DEBOUT, brasDroit: { epaule: 0, coude: 30 * signe }, mains: { gauche: cible, droite: cible } };
    const p = calculerPoints(pose);
    expect(p.mainDroite.x).toBeCloseTo(cible.x, 5);
    expect(p.mainDroite.y).toBeCloseTo(cible.y, 5);
    expect(Math.hypot(p.coudeDroit.x - p.epauleDroite.x, p.coudeDroit.y - p.epauleDroite.y)).toBeCloseTo(26, 5);
    expect(Math.hypot(p.mainDroite.x - p.coudeDroit.x, p.mainDroite.y - p.coudeDroit.y)).toBeCloseTo(24, 5);
    // Coude positif : le coude part en arrière (vers les x négatifs pour une figurine de profil).
    expect(Math.sign(cible.x - p.coudeDroit.x)).toBe(signe);
  }
  // Hors de portée, le bras se tend vers la cible.
  const loin = calculerPoints({ ...DEBOUT, mains: { gauche: { x: 100, y: 170 }, droite: { x: 103, y: 170 } } });
  expect(loin.mainDroite.y).toBeCloseTo(120, 5);
});

test('raccourci : le buste fuit vers l’arrière, seule sa longueur projetée change', () => {
  const p = calculerPoints({ ...DEBOUT, vue: 'face', raccourci: .25 });
  expect(Math.hypot(p.epaules.x - p.bassin.x, p.epaules.y - p.bassin.y)).toBeCloseTo(42 * .25, 5);
  expect(Math.hypot(p.genouDroit.x - p.hancheDroite.x, p.genouDroit.y - p.hancheDroite.y)).toBeCloseTo(34, 5);
});

test('les cibles de mains et le raccourci s’interpolent', () => {
  const a: Pose = { ...DEBOUT, raccourci: .2, mains: { gauche: { x: 80, y: 180 }, droite: { x: 120, y: 180 } } };
  const b: Pose = { ...DEBOUT, raccourci: .4, mains: { gauche: { x: 90, y: 160 }, droite: { x: 120, y: 140 } } };
  const m = interpolerPose(a, b, .5);
  expect(m.raccourci).toBeCloseTo(.3);
  expect(m.mains).toEqual({ gauche: { x: 85, y: 170 }, droite: { x: 120, y: 160 } });
});
