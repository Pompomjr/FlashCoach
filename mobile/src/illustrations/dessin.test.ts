import { EXERCICES } from '../catalogue/exercices';
import { cadrer, capsule, cercle, CHAISE, contourTronc, dessinerFigurine, MUR, RAYONS, TABLE } from './dessin';
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
    for (const forme of dessin.formes) {
      const centre = centreDisque(forme.d);
      if (centre) for (const epaule of [p.epauleGauche, p.epauleDroite]) {
        expect(Math.hypot(centre.x - epaule.x, centre.y - epaule.y)).toBeGreaterThan(6);
      }
    }
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
  expect(face.filter((t) => t === 'cheveux')).toHaveLength(2); // Frange et queue de cheval.
  expect(face.filter((t) => t === 'oeil')).toHaveLength(2);
});


// Deux arcs fermés, relatifs ou absolus : détecte aussi un disque sans commande C.
function centreDisque(d: string) {
  if (!/^M[^a-z]+[aA][^a-z]+[aA][^a-z]+Z$/i.test(d)) return undefined;
  const v = d.match(/-?\d+(?:\.\d+)?/g)!.map(Number);
  if (v.length !== 16 || v[2] !== v[3] || v[9] !== v[10]) return undefined;
  if (d.includes('a')) return { x: v[0] + v[7] / 2, y: v[1] + v[8] / 2 };
  return { x: (v[0] + v[7]) / 2, y: (v[1] + v[8]) / 2 };
}

test('la détection des disques reconnaît les arcs SVG relatifs et absolus', () => {
  expect(centreDisque(cercle({ x: 86, y: 70 }, 5.6))).toEqual({ x: 86, y: 70 });
  expect(centreDisque('M80 70A6 6 0 1 0 92 70A6 6 0 1 0 80 70Z')).toEqual({ x: 86, y: 70 });
});

test.each(Object.keys(POSES_PAR_EXERCICE))('%s : aucun disque ajouté aux articulations sur le cycle', id => {
  const a = posesPour(id);
  for (const t of instants(48)) {
    const pose = poseALinstant(a.cles, t, a.continu), p = calculerPoints(pose);
    const articulations = [p.epauleGauche, p.epauleDroite, p.coudeGauche, p.coudeDroit,
      p.hancheGauche, p.hancheDroite, p.genouGauche, p.genouDroit];
    for (const forme of dessinerFigurine(pose).formes) {
      const centre = centreDisque(forme.d);
      if (centre) for (const articulation of articulations) {
        expect(Math.hypot(centre.x - articulation.x, centre.y - articulation.y)).toBeGreaterThan(.1);
      }
    }
  }
});

// Échantillonne le contour complet, y compris l'avant-bras et le raccord du coude.
function contourBras(d: string) {
  const nombres = (s: string) => s.match(/-?\d+(?:\.\d+)?/g)!.map(Number);
  const depart = nombres(d.split('C')[0]);
  let p = { x: depart[0], y: depart[1] };
  const points = [p];
  for (const commande of d.matchAll(/([CAQ])([^A-Z]+)/g)) {
    const v = nombres(commande[2]);
    if (commande[1] === 'C') {
      for (let i = 1; i <= 100; i++) {
        const t = i / 100, u = 1 - t;
        points.push({ x: u ** 3 * p.x + 3 * u * u * t * v[0] + 3 * u * t * t * v[2] + t ** 3 * v[4],
          y: u ** 3 * p.y + 3 * u * u * t * v[1] + 3 * u * t * t * v[3] + t ** 3 * v[5] });
      }
      p = { x: v[4], y: v[5] };
    } else if (commande[1] === 'Q') {
      for (let i = 1; i <= 100; i++) {
        const t = i / 100, u = 1 - t;
        points.push({ x: u * u * p.x + 2 * u * t * v[0] + t * t * v[2],
          y: u * u * p.y + 2 * u * t * v[1] + t * t * v[3] });
      }
      p = { x: v[2], y: v[3] };
    } else {
      const centre = { x: (p.x + v[5]) / 2, y: (p.y + v[6]) / 2 };
      const angle = Math.atan2(p.y - centre.y, p.x - centre.x);
      for (let i = 1; i <= 100; i++) {
        const a = angle - Math.PI * i / 100;
        points.push({ x: centre.x + v[0] * Math.cos(a), y: centre.y + v[1] * Math.sin(a) });
      }
      p = { x: v[5], y: v[6] };
    }
  }
  return points;
}

function verifierBras(pose: Pose) {
  const p = calculerPoints(pose);
  const haut = { x: (p.cou.x - p.epaules.x) / LONGUEURS.cou, y: (p.cou.y - p.epaules.y) / LONGUEURS.cou };
  const contours = dessinerFigurine(pose).formes.filter(f => f.partie === 'bras');
  expect(contours).toHaveLength(2);
  // Zone interdite : la colonne du cou jusqu'au centre de la tête, et le bas du visage (mâchoire, menton).
  // Bras tendu à la verticale, longer l'oreille reste permis.
  for (const forme of contours) for (const q of contourBras(forme.d)) {
    const hauteur = (q.x - p.epaules.x) * haut.x + (q.y - p.epaules.y) * haut.y;
    const lateral = Math.abs((q.x - p.epaules.x) * haut.y - (q.y - p.epaules.y) * haut.x);
    expect(hauteur > .1 && hauteur < LONGUEURS.cou + LONGUEURS.tete && lateral < RAYONS.cou).toBe(false);
    const dansTete = Math.hypot(q.x - p.tete.x, q.y - p.tete.y) < LONGUEURS.rayonTete;
    expect(dansTete && hauteur < LONGUEURS.cou + LONGUEURS.tete && lateral < .75 * LONGUEURS.rayonTete).toBe(false);
  }
}

test('tout le contour du haut du bras évite le cou et le menton sur la montée de face', () => {
  for (let angle = 0; angle <= 180; angle++) verifierBras({ ...posesPour('inconnu').cles[0],
    brasGauche: { epaule: -angle, coude: 0 }, brasDroit: { epaule: angle, coude: 0 } });
});

test.each(['jumping-jacks', 'inclinaison-laterale', 'etirement-ciel', 'bras-respiration'])('%s : deltoïdes hors du cou et de la tête entre les clés', id => {
  const a = posesPour(id);
  for (let i = 0; i < 100; i++) {
    const pose = poseALinstant(a.cles, i / 100, a.continu);
    verifierBras(pose);
    // Sur ces gestes, le haut du bras ne passe même pas devant la tête.
    const p = calculerPoints(pose);
    for (const forme of dessinerFigurine(pose).formes.filter(f => f.partie === 'bras')) {
      for (const q of contourBras(forme.d)) expect(Math.hypot(q.x - p.tete.x, q.y - p.tete.y)).toBeGreaterThan(LONGUEURS.rayonTete - .05);
    }
  }
});

test.each(['respiration-ventre', 'gainage-debout', 'rotation-poignets'])('%s : contour lisible du haut du bras devant le buste', id => {
  expect(dessinerFigurine(posesPour(id).cles[0]).formes.some(f => f.teinte === 'separation' && f.d.includes('C'))).toBe(true);
});

test('cadre : la chaise déplacée et la table y entrent', () => {
  const cles = posesPour('inconnu').cles;
  const chaise = cadrer(cles, false, false, true, undefined, { chaiseX: 20 });
  expect(chaise.x).toBeLessThanOrEqual(20);
  expect(chaise.x + chaise.largeur).toBeGreaterThanOrEqual(20 + CHAISE.largeur);
  const table = cadrer(cles, false, false, false, undefined, { table: true });
  expect(table.x).toBeLessThanOrEqual(TABLE.x);
  expect(table.x + table.largeur).toBeGreaterThanOrEqual(TABLE.x + TABLE.largeur);
  expect(table.y).toBeLessThanOrEqual(TABLE.plateau);
});
