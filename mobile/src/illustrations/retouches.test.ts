import { posesPour } from './poses';
import { calculerPoints, poseALinstant, SOL_Y, type Point } from './squelette';

const flexion = (a: Point, b: Point, c: Point) => 180 - Math.acos(Math.max(-1, Math.min(1,
  ((a.x - b.x) * (c.x - b.x) + (a.y - b.y) * (c.y - b.y))
  / (Math.hypot(a.x - b.x, a.y - b.y) * Math.hypot(c.x - b.x, c.y - b.y))))) * 180 / Math.PI;

test.each(['gauche', 'droite'] as const)('pont : la jambe %s est levée pendant tout le cycle', cote => {
  const a = posesPour('pont-une-jambe', cote);
  for (let i = 0; i < 120; i++) {
    const p = calculerPoints(poseALinstant(a.cles, i / 120));
    const levee = cote === 'gauche' ? p.chevilleGauche : p.chevilleDroite;
    const appui = cote === 'gauche' ? p.chevilleDroite : p.chevilleGauche;
    expect(levee.y).toBeLessThan(p.bassin.y - 55);
    expect(appui.y).toBeCloseTo(SOL_Y, 5);
  }
});

test('le côté ne change pas les autres exercices ni le repli', () => {
  for (const id of ['pompe-classique', 'bird-dog', 'inconnu']) {
    expect(posesPour(id, 'droite')).toBe(posesPour(id));
  }
});

test('bird-dog : extensions opposées proches de l’horizontale et dégagées du sol', () => {
  for (const index of [0, 4]) {
    const p = calculerPoints(posesPour('bird-dog').cles[index]);
    const [main, epaule, cheville, hanche] = index === 0
      ? [p.mainDroite, p.epauleDroite, p.chevilleGauche, p.hancheGauche]
      : [p.mainGauche, p.epauleGauche, p.chevilleDroite, p.hancheDroite];
    expect(cheville.y).toBeLessThanOrEqual(SOL_Y - 30);
    expect(Math.abs(main.y - epaule.y)).toBeLessThan(9);
    expect(Math.abs(cheville.y - hanche.y)).toBeLessThan(12);
    expect(Math.abs(hanche.y - p.bassin.y)).toBeLessThan(1);
  }
});

test('pompe tempo : pause immobile en bas durant au moins une seconde', () => {
  const a = posesPour('pompe-tempo');
  expect(a.dureeCycleMs).toBeGreaterThanOrEqual(6000);
  const debut = calculerPoints(poseALinstant(a.cles, .4));
  const fin = calculerPoints(poseALinstant(a.cles, .55));
  expect(fin).toEqual(debut);
  expect(debut.epaules.y).toBeGreaterThan(145);
});

test('pompe large : mains et coudes visiblement plus ouverts que la classique', () => {
  const large = calculerPoints(posesPour('pompe-large').cles[1]);
  const classique = calculerPoints(posesPour('pompe-classique').cles[1]);
  expect(large.mainDroite.x - large.mainGauche.x).toBeGreaterThanOrEqual(14);
  expect(large.mainDroite.x).toBeGreaterThan(classique.mainDroite.x + 8);
  expect(Math.abs(large.coudeDroit.x - large.coudeGauche.x)).toBeGreaterThan(10);
});

test('pompe genoux : les deux bras sont presque tendus en haut', () => {
  const p = calculerPoints(posesPour('pompe-genoux').cles[0]);
  expect(flexion(p.epauleGauche, p.coudeGauche, p.mainGauche)).toBeLessThanOrEqual(25);
  expect(flexion(p.epauleDroite, p.coudeDroit, p.mainDroite)).toBeLessThanOrEqual(25);
});
