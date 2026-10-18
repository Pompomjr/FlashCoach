import { EXERCICES } from '../catalogue/exercices';
import { cadrer, capsule, contourTronc, dessinerFigurine, MUR, RAYONS } from './dessin';
import { POSES_PAR_EXERCICE, posesPour } from './poses';
import { calculerPoints, LONGUEURS, poseALinstant, SOL_Y, type Pose } from './squelette';

const ANIMATIONS = [...EXERCICES.map((e) => e.id), 'inconnu'];
const instants = (n: number) => Array.from({ length: n }, (_, i) => i / n);
const largeur = (points: { x: number }[]) => Math.max(...points.map((p) => p.x)) - Math.min(...points.map((p) => p.x));
const hauteurMin = (points: { y: number }[]) => Math.min(...points.map((p) => p.y));

test.each(ANIMATIONS)('%s : tout le dessin reste dans le cadre et rien ne passe sous le sol', (id) => {
  const animation = posesPour(id);
  const cadre = cadrer(animation.cles, animation.continu, animation.accessoire === 'mur');
  expect(cadre.taille).toBeGreaterThanOrEqual(150);
  expect(cadre.taille).toBeLessThanOrEqual(200);
  for (const t of instants(48)) {
    const dessin = dessinerFigurine(poseALinstant(animation.cles, t, animation.continu));
    const { minX, minY, maxX, maxY } = dessin.bornes;
    expect(minX).toBeGreaterThanOrEqual(cadre.x);
    expect(minY).toBeGreaterThanOrEqual(cadre.y);
    expect(maxX).toBeLessThanOrEqual(cadre.x + cadre.taille);
    expect(maxY).toBeLessThanOrEqual(cadre.y + cadre.taille);
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

test('planche : cadrée au milieu de la carte, pas tassée en bas', () => {
  const animation = posesPour('planche');
  const cadre = cadrer(animation.cles);
  const sol = (SOL_Y - cadre.y) / cadre.taille;
  expect(sol).toBeLessThan(0.75);
});
