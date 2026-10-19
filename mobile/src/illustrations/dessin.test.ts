import { EXERCICES } from '../catalogue/exercices';
import { cadrer, capsule, contourTronc, dessinerFigurine, MUR, RAYONS } from './dessin';
import { POSES_PAR_EXERCICE, posesPour } from './poses';
import { calculerPoints, LONGUEURS, poseALinstant, SOL_Y, type Pose } from './squelette';

const ANIMATIONS = [...new Set([...EXERCICES.map((e) => e.id), ...Object.keys(POSES_PAR_EXERCICE), 'inconnu'])];
const instants = (n: number) => Array.from({ length: n }, (_, i) => i / n);
const largeur = (points: { x: number }[]) => Math.max(...points.map((p) => p.x)) - Math.min(...points.map((p) => p.x));
const hauteurMin = (points: { y: number }[]) => Math.min(...points.map((p) => p.y));

test.each(['face', 'profil'] as const)('épaules intégrées au buste en %s, sans capsule ni liseré autour de la racine', vue => {
  for (const angle of [0, 45, 90, 135, 180, 225, 270]) {
    const pose = { ...posesPour('inconnu').cles[0], vue,
      brasDroit: { epaule: angle, coude: 30 }, brasGauche: { epaule: -angle, coude: -30 } };
    const p = calculerPoints(pose);
    const dessin = dessinerFigurine(pose);
    for (const [epaule, coude] of [[p.epauleDroite, p.coudeDroit], [p.epauleGauche, p.coudeGauche]]) {
      expect(dessin.formes.map(f => f.d)).not.toContain(capsule(epaule, RAYONS.epaule, coude, RAYONS.coude));
    }
    expect(dessin.formes.filter(f => f.teinte === 'separation').every(f => !f.d.includes('C'))).toBe(true);
  }
});

test.each(ANIMATIONS)('%s : tout le dessin reste dans le cadre et rien ne passe sous le sol', (id) => {
  const animation = posesPour(id);
  const cadre = cadrer(animation.cles, animation.continu, animation.accessoire === 'mur', animation.accessoire === 'chaise', animation.murX);
  expect(Math.min(cadre.largeur, cadre.hauteur)).toBeGreaterThanOrEqual(110);
  expect(Math.max(cadre.largeur, cadre.hauteur)).toBeLessThanOrEqual(210);
  for (const t of instants(48)) {
    const dessin = dessinerFigurine(poseALinstant(animation.cles, t, animation.continu));
    const { minX, minY, maxX, maxY } = dessin.bornes;
    expect(minX).toBeGreaterThanOrEqual(cadre.x);
    expect(minY).toBeGreaterThanOrEqual(cadre.y);
    expect(maxX).toBeLessThanOrEqual(cadre.x + cadre.largeur);
    expect(maxY).toBeLessThanOrEqual(cadre.y + cadre.hauteur);
    expect(minX).toBeGreaterThanOrEqual(0);
    expect(maxX).toBeLessThanOrEqual(200);
    expect(minY).toBeGreaterThanOrEqual(0);
    // Un appui (pied, genou, main) a son centre sur le sol : rien ne descend plus bas que son rayon.
    expect(maxY).toBeLessThanOrEqual(SOL_Y + RAYONS.genou + 0.5);
    expect(dessin.formes.every((forme) => !forme.d.includes('NaN'))).toBe(true);
  }
});

test('les pieds de la figurine debout touchent le sol, l’ombre est sous eux', () => {
  for (const pose of posesPour('inconnu').cles) {
    const dessin = dessinerFigurine(pose);
    expect(dessin.bornes.maxY).toBeGreaterThan(SOL_Y + 2);
    expect(dessin.ombre.cy).toBeGreaterThan(SOL_Y);
    expect(Math.abs(dessin.ombre.cx - calculerPoints(pose).bassin.x)).toBeLessThan(6);
  }
});

test('membres effilés : chaque segment s’affine vers son extrémité', () => {
  expect(RAYONS.hancheProfil).toBeGreaterThan(RAYONS.genou);
  expect(RAYONS.genou).toBeGreaterThan(RAYONS.cheville);
  expect(RAYONS.epaule).toBeGreaterThan(RAYONS.coude);
  expect(RAYONS.coude).toBeGreaterThan(RAYONS.poignet);
  expect(RAYONS.main).toBeGreaterThan(RAYONS.poignet);
  expect(capsule({ x: 0, y: 0 }, 6, { x: 0, y: 30 }, 3)).toMatch(/^M.*A.*A.*Z$/);
});

test('le tronc a des épaules plus larges que la taille', () => {
  const pose = posesPour('inconnu').cles[0];
  const p = calculerPoints(pose);
  const contour = contourTronc(pose, p.bassin, p.epaules);
  const aHauteur = (y: number) => contour.filter((c) => Math.abs(c.y - y) < 6);
  const epaules = aHauteur(p.bassin.y - 0.95 * LONGUEURS.tronc);
  const taille = aHauteur(p.bassin.y - 0.42 * LONGUEURS.tronc);
  expect(largeur(epaules)).toBeGreaterThan(largeur(taille) + 6);
});

test('chat-vache : le dos s’arrondit nettement vers le haut, puis se creuse, et la tête suit', () => {
  const [chat, vache] = POSES_PAR_EXERCICE['chat-vache'].cles;
  const dos = (pose: Pose) => {
    const p = calculerPoints(pose);
    return hauteurMin(contourTronc(pose, p.bassin, p.epaules));
  };
  // y vers le bas : le dos du chat monte d'au moins 10 unités au-dessus de celui de la vache.
  expect(dos(vache) - dos(chat)).toBeGreaterThan(10);
  expect(calculerPoints(chat).tete.y).toBeGreaterThan(calculerPoints(vache).tete.y + 10);
});

test('pompes au mur : les mains restent posées sur le mur, la tête ne le traverse pas', () => {
  const animation = posesPour('pompes-mur');
  expect(animation.accessoire).toBe('mur');
  for (const pose of animation.cles) {
    const p = calculerPoints(pose);
    expect(Math.abs(p.mainDroite.x + RAYONS.main - MUR.x)).toBeLessThan(1);
    expect(Math.abs(p.mainGauche.x + RAYONS.main - MUR.x)).toBeLessThan(1);
  }
  for (const t of instants(40)) {
    const p = calculerPoints(poseALinstant(animation.cles, t));
    expect(p.mainDroite.x + RAYONS.main).toBeLessThanOrEqual(MUR.x + 1);
    expect(p.tete.x + LONGUEURS.rayonTete).toBeLessThan(MUR.x);
  }
});

test('rotation des épaules : le coude fait le tour complet de l’épaule', () => {
  const animation = posesPour('rotation-epaules');
  const quadrants = new Set<string>();
  for (const t of instants(40)) {
    const p = calculerPoints(poseALinstant(animation.cles, t, animation.continu));
    const dx = p.coudeDroit.x - p.epauleDroite.x, dy = p.coudeDroit.y - p.epauleDroite.y;
    quadrants.add(`${Math.sign(Math.round(dx))}${Math.sign(Math.round(dy))}`);
  }
  for (const q of ['1-1', '11', '-11', '-1-1']) expect(quadrants).toContain(q);
});

test('respiration : la poitrine s’ouvre et les bras montent légèrement', () => {
  const [calme, inspiration] = posesPour('respiration-carree').cles.slice(0, 2);
  const tronc = (pose: Pose) => {
    const p = calculerPoints(pose);
    return largeur(contourTronc(pose, p.bassin, p.epaules));
  };
  expect(tronc(inspiration)).toBeGreaterThan(tronc(calme) + 2);
  expect(calculerPoints(inspiration).mainDroite.y).toBeLessThan(calculerPoints(calme).mainDroite.y - 3);
});

test('cadre ajusté à la pose : large et bas pour la planche, haut et étroit debout', () => {
  const planche = posesPour('planche');
  const couche = cadrer(planche.cles);
  expect(couche.largeur / couche.hauteur).toBeGreaterThan(1.5);
  const debout = cadrer(posesPour('inconnu').cles);
  expect(debout.hauteur).toBeGreaterThan(debout.largeur);
});

test('un visage : cheveux avec queue de cheval et un œil de profil, frange et deux yeux de face', () => {
  const teintes = (pose: Pose) => dessinerFigurine(pose).formes.map((forme) => forme.teinte);
  const profil = teintes(posesPour('squat-lent').cles[0]);
  expect(profil.filter((t) => t === 'cheveux')).toHaveLength(3);
  expect(profil.filter((t) => t === 'oeil')).toHaveLength(1);
  const face = teintes(posesPour('inconnu').cles[0]);
  expect(face.filter((t) => t === 'cheveux')).toHaveLength(1);
  expect(face.filter((t) => t === 'oeil')).toHaveLength(2);
});
