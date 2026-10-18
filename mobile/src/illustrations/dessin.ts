import { calculerPoints, LONGUEURS, poseALinstant, SOL_Y, type Point, type Pose } from './squelette';

/** Dessin de la figurine à partir d'une pose : données pures (chemins SVG), sans React.
 * Les membres sont des capsules effilées (épaisses à la racine, fines à l'extrémité), le tronc un
 * contour organique qui suit la courbure du dos, mains et pieds de petites formes arrondies. */

/** `separation` : liseré de la couleur du fond de carte, posé sous le bras proche pour le détacher
 * du tronc quand il passe devant (même orange, il s'y fondrait). */
export type Teinte = 'proche' | 'loin' | 'cheveux' | 'separation';
export type FormeFigurine = { d: string; teinte: Teinte };
export type Ombre = { cx: number; cy: number; rx: number; ry: number; opacite: number };
export type Bornes = { minX: number; minY: number; maxX: number; maxY: number };
export type DessinFigurine = { formes: FormeFigurine[]; ombre: Ombre; bornes: Bornes };

/** Mur des pompes : la face touchée par les mains est en `x`. */
export const MUR = { x: 168, haut: 26, largeur: 22 } as const;

// Rayons aux articulations (unités du cadre 200 × 200).
export const RAYONS = {
  epaule: 5.6, coude: 4.2, poignet: 3.1, main: 4.4,
  hancheFace: 6.6, hancheProfil: 7.6, genou: 5.2, cheville: 3.7, talon: 3.7, orteils: 2.9,
  cou: 4.4,
} as const;

const plus = (a: Point, b: Point): Point => ({ x: a.x + b.x, y: a.y + b.y });
const moins = (a: Point, b: Point): Point => ({ x: a.x - b.x, y: a.y - b.y });
const fois = (a: Point, k: number): Point => ({ x: a.x * k, y: a.y * k });
const norme = (a: Point) => Math.hypot(a.x, a.y);
const unitaire = (a: Point): Point => { const n = norme(a) || 1; return { x: a.x / n, y: a.y / n }; };
const f = (n: number) => Math.round(n * 100) / 100;
const pt = (p: Point) => `${f(p.x)} ${f(p.y)}`;

type Cercle = { c: Point; r: number };

/** Capsule effilée entre deux cercles : tangentes extérieures et deux arcs. */
export function capsule(a: Point, ra: number, b: Point, rb: number): string {
  const d = norme(moins(b, a));
  if (d <= Math.abs(ra - rb) + 0.01) {
    const grand = ra >= rb ? { c: a, r: ra } : { c: b, r: rb };
    return cercle(grand.c, grand.r);
  }
  const u = unitaire(moins(b, a));
  const n = { x: -u.y, y: u.x };
  const sin = (ra - rb) / d;
  const cos = Math.sqrt(1 - sin * sin);
  const v1 = plus(fois(n, cos), fois(u, sin));
  const v2 = plus(fois(n, -cos), fois(u, sin));
  const a1 = plus(a, fois(v1, ra)), b1 = plus(b, fois(v1, rb));
  const b2 = plus(b, fois(v2, rb)), a2 = plus(a, fois(v2, ra));
  // Arc côté b : moins d'un demi-tour quand a est plus épais ; l'inverse côté a.
  const grandB = sin < 0 ? 1 : 0, grandA = sin > 0 ? 1 : 0;
  return `M${pt(a1)}L${pt(b1)}A${f(rb)} ${f(rb)} 0 ${grandB} 0 ${pt(b2)}L${pt(a2)}A${f(ra)} ${f(ra)} 0 ${grandA} 0 ${pt(a1)}Z`;
}

export function cercle(c: Point, r: number): string {
  return `M${f(c.x - r)} ${f(c.y)}a${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0a${f(r)} ${f(r)} 0 1 0 ${f(-2 * r)} 0Z`;
}

/** Courbe fermée lisse (Catmull-Rom → Bézier cubiques) passant par tous les points. */
function contourLisse(points: Point[]): string {
  const n = points.length;
  let d = `M${pt(points[0])}`;
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n], p1 = points[i], p2 = points[(i + 1) % n], p3 = points[(i + 2) % n];
    const c1 = plus(p1, fois(moins(p2, p0), 1 / 6));
    const c2 = moins(p2, fois(moins(p3, p1), 1 / 6));
    d += `C${pt(c1)} ${pt(c2)} ${pt(p2)}`;
  }
  return `${d}Z`;
}

// Silhouette du tronc : position le long de la colonne (0 bassin, 1 épaules) et demi-largeurs.
// Face : épaules nettement plus larges que la taille. Profil : poitrine devant, fessiers derrière.
const TRONC_FACE = [
  { s: -0.14, l: 8 }, { s: 0.06, l: 12.5 }, { s: 0.42, l: 10 }, { s: 0.74, l: 13 }, { s: 0.95, l: 15.5 }, { s: 1.1, l: 9 },
];
const TRONC_PROFIL = [
  { s: -0.15, av: 3, ar: -5.5 }, { s: 0.06, av: 8.5, ar: -9.8 }, { s: 0.42, av: 7.5, ar: -8 },
  { s: 0.72, av: 10.5, ar: -9.5 }, { s: 0.95, av: 8, ar: -9 }, { s: 1.1, av: 3.5, ar: -5 },
];

/** Colonne : courbe de Bézier quadratique du bassin aux épaules, bombée côté dos selon `dos`. */
function colonne(pose: Pose, bassin: Point, epaules: Point) {
  const axe = unitaire(moins(epaules, bassin));
  const avant = { x: -axe.y, y: axe.x };
  const milieu = fois(plus(bassin, epaules), 0.5);
  // La flèche au milieu d'une quadratique vaut la moitié du déplacement du point de contrôle.
  const controle = plus(milieu, fois(avant, -2 * (pose.dos ?? 0)));
  return (s: number) => {
    const t = Math.max(0, Math.min(1, s));
    const point = plus(plus(fois(bassin, (1 - t) * (1 - t)), fois(controle, 2 * (1 - t) * t)), fois(epaules, t * t));
    const tangente = unitaire(plus(fois(moins(controle, bassin), 2 * (1 - t)), fois(moins(epaules, controle), 2 * t)));
    // Au-delà des extrémités, on prolonge le long de la tangente.
    const prolongement = s < 0 ? s : s > 1 ? s - 1 : 0;
    return { point: plus(point, fois(tangente, prolongement * LONGUEURS.tronc)), avant: { x: -tangente.y, y: tangente.x } };
  };
}

export function contourTronc(pose: Pose, bassin: Point, epaules: Point): Point[] {
  const sur = colonne(pose, bassin, epaules);
  const souffle = pose.poitrine ?? 0;
  // L'inspiration ouvre la poitrine et les épaules, pas la taille.
  const ampleur = (s: number) => 1 + 0.12 * souffle * Math.max(0, Math.min(1, (s - 0.45) / 0.4));
  if (pose.vue === 'face') {
    const droite = TRONC_FACE.map(({ s, l }) => { const c = sur(s); return plus(c.point, fois(c.avant, l * ampleur(s))); });
    const gauche = TRONC_FACE.map(({ s, l }) => { const c = sur(s); return plus(c.point, fois(c.avant, -l * ampleur(s))); });
    return [...droite, ...gauche.reverse()];
  }
  const devant = TRONC_PROFIL.map(({ s, av }) => { const c = sur(s); return plus(c.point, fois(c.avant, av * ampleur(s))); });
  const derriere = TRONC_PROFIL.map(({ s, ar }) => { const c = sur(s); return plus(c.point, fois(c.avant, ar)); });
  return [...devant, ...derriere.reverse()];
}

/** Calotte de cheveux sur l'arrière et le haut du crâne (profil) ou le haut (face). */
function cheveux(pose: Pose, centre: Point, haut: Point, r: number): string {
  const avant = { x: -haut.y, y: haut.x };
  const dir = (degres: number) => {
    // 0° = haut de la tête, positif vers l'avant du visage.
    const a = degres * Math.PI / 180;
    return plus(fois(haut, Math.cos(a)), fois(avant, Math.sin(a)));
  };
  const face = pose.vue === 'face';
  const [debut, fin] = face ? [-100, 100] : [-150, 38];
  const R = r + 0.8;
  const p1 = plus(centre, fois(dir(debut), R));
  const p2 = plus(centre, fois(dir(fin), R));
  // Ligne des cheveux : de face, elle remonte au milieu du front ; de profil, elle descend vers la nuque.
  const ligne = face ? plus(centre, fois(haut, r * 0.62)) : plus(centre, plus(fois(haut, r * 0.35), fois(avant, -r * 0.1)));
  const grand = fin - debut > 180 ? 1 : 0;
  return `M${pt(p1)}A${f(R)} ${f(R)} 0 ${grand} 1 ${pt(p2)}Q${pt(ligne)} ${pt(p1)}Z`;
}

/** Ombre au sol, sous les appuis ; plus petite et plus pâle quand la figurine est en l'air. */
function ombre(points: ReturnType<typeof calculerPoints>): Ombre {
  const appuis = Object.values(points).filter(p => p.y >= SOL_Y - 6).map(p => p.x);
  if (!appuis.length) return { cx: points.bassin.x, cy: SOL_Y + 4, rx: 20, ry: 3, opacite: 0.08 };
  const min = Math.min(...appuis), max = Math.max(...appuis);
  return { cx: (min + max) / 2, cy: SOL_Y + 4, rx: (max - min) / 2 + 16, ry: 4.5, opacite: 0.14 };
}

export function dessinerFigurine(pose: Pose): DessinFigurine {
  const p = calculerPoints(pose);
  const profil = pose.vue === 'profil';
  const cercles: Cercle[] = [];
  const capsuleNotee = (a: Point, ra: number, b: Point, rb: number) => {
    cercles.push({ c: a, r: ra }, { c: b, r: rb });
    return capsule(a, ra, b, rb);
  };
  const cercleNote = (c: Point, r: number) => { cercles.push({ c, r }); return cercle(c, r); };

  const jambe = (gauche: boolean): string[] => {
    const hanche = gauche ? p.hancheGauche : p.hancheDroite;
    const genou = gauche ? p.genouGauche : p.genouDroit;
    const cheville = gauche ? p.chevilleGauche : p.chevilleDroite;
    const orteils = gauche ? p.orteilsGauches : p.orteilsDroits;
    const pied = moins(orteils, cheville);
    // De face, le pied se voit en raccourci ; de profil, le talon dépasse un peu derrière la cheville.
    const talon = profil ? moins(cheville, fois(pied, 0.22)) : cheville;
    const pointe = profil ? orteils : plus(cheville, fois(pied, 0.45));
    return [
      capsuleNotee(hanche, profil ? RAYONS.hancheProfil : RAYONS.hancheFace, genou, RAYONS.genou),
      capsuleNotee(genou, RAYONS.genou, cheville, RAYONS.cheville),
      capsuleNotee(talon, RAYONS.talon, pointe, RAYONS.orteils),
    ];
  };
  const bras = (gauche: boolean): string[] => {
    const epaule = gauche ? p.epauleGauche : p.epauleDroite;
    const coude = gauche ? p.coudeGauche : p.coudeDroit;
    const main = gauche ? p.mainGauche : p.mainDroite;
    return [
      capsuleNotee(epaule, RAYONS.epaule, coude, RAYONS.coude),
      capsuleNotee(coude, RAYONS.coude, main, RAYONS.poignet),
      cercleNote(main, RAYONS.main),
    ];
  };

  const contour = contourTronc(pose, p.bassin, p.epaules);
  const haut = unitaire(moins(p.tete, p.cou));
  const r = LONGUEURS.rayonTete;
  // De profil, le membre gauche est éloigné : plus foncé, dessiné derrière le tronc.
  const loin: Teinte = profil ? 'loin' : 'proche';
  // De face, les deux bras sont au premier plan, devant le tronc ; de profil, le bras gauche passe derrière.
  const devant = profil ? [bras(false)] : [bras(true), bras(false)];
  const formes: FormeFigurine[] = [
    ...jambe(true).map(d => ({ d, teinte: loin })),
    ...(profil ? bras(true).map(d => ({ d, teinte: loin })) : []),
    { d: capsuleNotee(p.epaules, RAYONS.cou, plus(p.tete, fois(haut, -r * 0.6)), RAYONS.cou), teinte: 'proche' },
    { d: contourLisse(contour), teinte: 'proche' },
    ...jambe(false).map(d => ({ d, teinte: 'proche' as const })),
    { d: cercleNote(p.tete, r), teinte: 'proche' },
    { d: cheveux(pose, p.tete, haut, r), teinte: 'cheveux' },
    ...devant.flatMap(membre => [
      ...membre.map(d => ({ d, teinte: 'separation' as const })),
      ...membre.map(d => ({ d, teinte: 'proche' as const })),
    ]),
  ];
  if (profil) {
    // Le nez indique de quel côté regarde la figurine.
    const avant = { x: -haut.y, y: haut.x };
    formes.splice(formes.length - 6 * devant.length, 0, { d: cercleNote(plus(p.tete, plus(fois(avant, r - 0.5), fois(haut, -1.5))), 2.6), teinte: 'proche' });
  }

  const xs = [...cercles.map(c => c.c.x - c.r), ...cercles.map(c => c.c.x + c.r), ...contour.map(c => c.x)];
  const ys = [...cercles.map(c => c.c.y - c.r - 1), ...cercles.map(c => c.c.y + c.r), ...contour.map(c => c.y)];
  return {
    formes,
    ombre: ombre(p),
    bornes: { minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) },
  };
}

export type Cadre = { x: number; y: number; taille: number };
// Échelle d'affichage bornée : jamais plus petite que le cadre d'origine, jamais plus d'un tiers de zoom.
const CADRE_MIN = 150, CADRE_MAX = 200, MARGE_CADRE = 12;

/** Cadre carré (viewBox) centré sur tout ce que l'animation dessine au long de son cycle : une planche
 * ou un chat-vache, couchés près du sol, se retrouvent au milieu de la carte, pas tassés en bas. */
export function cadrer(cles: Pose[], continu = false, mur = false): Cadre {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (let i = 0; i < 24; i++) {
    const d = dessinerFigurine(poseALinstant(cles, i / 24, continu));
    minX = Math.min(minX, d.bornes.minX, d.ombre.cx - d.ombre.rx);
    maxX = Math.max(maxX, d.bornes.maxX, d.ombre.cx + d.ombre.rx);
    minY = Math.min(minY, d.bornes.minY);
    maxY = Math.max(maxY, d.bornes.maxY, d.ombre.cy + d.ombre.ry);
  }
  if (mur) { maxX = Math.max(maxX, MUR.x + MUR.largeur); minY = Math.min(minY, MUR.haut); }
  const taille = Math.min(CADRE_MAX, Math.max(CADRE_MIN, maxX - minX + 2 * MARGE_CADRE, maxY - minY + 2 * MARGE_CADRE));
  return { x: f((minX + maxX - taille) / 2), y: f((minY + maxY - taille) / 2), taille: f(taille) };
}
