/** Repère 200 × 200, y vers le bas. Angles en degrés, positifs vers la droite.
 * Tronc : depuis la verticale haute. Bras : depuis la verticale basse du tronc.
 * Hanches : depuis la verticale basse du bassin (qui reste horizontal).
 * Coudes/genoux : relatifs au segment parent ; cheville : pied à 90° du tibia.
 * En profil, le côté gauche est éloigné ; le droit est au premier plan.
 */
export type Point = { x: number; y: number };
export type Bras = { epaule: number; coude: number };
export type Jambe = { hanche: number; genou: number; cheville: number };
export type Pose = {
  vue: 'face' | 'profil'; racine: Point; tronc: number; tete: number;
  brasGauche: Bras; brasDroit: Bras; jambeGauche: Jambe; jambeDroite: Jambe;
  /** Courbure du dos en unités du cadre (flèche au milieu du tronc), sans modifier les longueurs des
   * membres : positive, le dos s'arrondit (chat) ; négative, il se creuse (vache). */
  dos?: number;
  /** Ouverture de la poitrine, de 0 (repos) à 1 (inspiration pleine) : seul le dessin du tronc change. */
  poitrine?: number;
  /** Recale verticalement le pied porteur lors de l'échantillonnage du cycle. */
  appuiPieds?: boolean;
};

export const SOL_Y = 180;
export const LONGUEURS = {
  tronc: 42, cou: 6, tete: 11, rayonTete: 11.5,
  bras: 26, avantBras: 24, cuisse: 34, tibia: 34, pied: 13,
  demiEpaules: 14, demiBassin: 8,
} as const;

function avancer(p: Point, longueur: number, angle: number): Point {
  const radians = angle * Math.PI / 180;
  return { x: p.x + longueur * Math.sin(radians), y: p.y + longueur * Math.cos(radians) };
}

export function calculerPoints(pose: Pose) {
  const l = LONGUEURS;
  const bassin = { ...pose.racine };
  const epaules = avancer(bassin, l.tronc, 180 - pose.tronc);
  const cou = avancer(epaules, l.cou, 180 - pose.tronc);
  const tete = avancer(cou, l.tete, 180 - pose.tronc - pose.tete);
  const largeur = pose.vue === 'face' ? l.demiEpaules : 3;
  // En profil, le petit décalage horizontal révèle le membre éloigné sans
  // créer une différence de hauteur artificielle entre les appuis au sol.
  const epauleGauche = pose.vue === 'profil' ? { x: epaules.x - largeur, y: epaules.y } : avancer(epaules, -largeur, 90 - pose.tronc);
  const epauleDroite = pose.vue === 'profil' ? { x: epaules.x + largeur, y: epaules.y } : avancer(epaules, largeur, 90 - pose.tronc);
  const h = pose.vue === 'face' ? l.demiBassin : 3;
  const hancheGauche = { x: bassin.x - h, y: bassin.y };
  const hancheDroite = { x: bassin.x + h, y: bassin.y };
  // L'axe bas du tronc tourne à l'opposé de son inclinaison depuis l'axe haut.
  const bras = (origine: Point, b: Bras) => {
    const angle = b.epaule - pose.tronc;
    const coude = avancer(origine, l.bras, angle);
    return { coude, main: avancer(coude, l.avantBras, angle + b.coude) };
  };
  const jambe = (origine: Point, j: Jambe, gauche: boolean) => {
    const genou = avancer(origine, l.cuisse, j.hanche);
    const cheville = avancer(genou, l.tibia, j.hanche + j.genou);
    const sensPied = pose.vue === 'face' && gauche ? -90 : 90;
    return { genou, cheville, orteils: avancer(cheville, l.pied, j.hanche + j.genou + sensPied + j.cheville) };
  };
  const bg = bras(epauleGauche, pose.brasGauche), bd = bras(epauleDroite, pose.brasDroit);
  const jg = jambe(hancheGauche, pose.jambeGauche, true), jd = jambe(hancheDroite, pose.jambeDroite, false);
  return { bassin, epaules, cou, tete, epauleGauche, epauleDroite, hancheGauche, hancheDroite,
    coudeGauche: bg.coude, coudeDroit: bd.coude, mainGauche: bg.main, mainDroite: bd.main,
    genouGauche: jg.genou, genouDroit: jd.genou, chevilleGauche: jg.cheville,
    chevilleDroite: jd.cheville, orteilsGauches: jg.orteils, orteilsDroits: jd.orteils };
}

const modulo = (n: number, base: number) => ((n % base) + base) % base;
const melanger = (a: number, b: number, t: number) => a + (b - a) * t;
const angle = (a: number, b: number, t: number) => modulo(a + (modulo(b - a + 180, 360) - 180) * t, 360);

export function interpolerPose(a: Pose, b: Pose, t: number): Pose {
  if (t <= 0) return a;
  if (t >= 1) return b;
  const bras = (x: Bras, y: Bras): Bras => ({ epaule: angle(x.epaule, y.epaule, t), coude: angle(x.coude, y.coude, t) });
  const jambe = (x: Jambe, y: Jambe): Jambe => ({ hanche: angle(x.hanche, y.hanche, t),
    genou: angle(x.genou, y.genou, t), cheville: angle(x.cheville, y.cheville, t) });
  return { vue: a.vue, racine: { x: melanger(a.racine.x, b.racine.x, t), y: melanger(a.racine.y, b.racine.y, t) },
    tronc: angle(a.tronc, b.tronc, t), tete: angle(a.tete, b.tete, t),
    brasGauche: bras(a.brasGauche, b.brasGauche), brasDroit: bras(a.brasDroit, b.brasDroit),
    jambeGauche: jambe(a.jambeGauche, b.jambeGauche), jambeDroite: jambe(a.jambeDroite, b.jambeDroite),
    ...(a.dos !== undefined || b.dos !== undefined ? { dos: melanger(a.dos ?? 0, b.dos ?? 0, t) } : {}),
    ...(a.poitrine !== undefined || b.poitrine !== undefined
      ? { poitrine: melanger(a.poitrine ?? 0, b.poitrine ?? 0, t) } : {}),
    ...(a.appuiPieds && b.appuiPieds ? { appuiPieds: true } : {}),
  };
}

/** Clés de même vue, régulièrement espacées, dernière → première. Easing sinusoïdal (le geste marque
 * chaque clé) ou, pour un mouvement circulaire, vitesse constante (`continu`). */
export function poseALinstant(cles: Pose[], t: number, continu = false): Pose {
  if (!cles.length) throw new Error('Une animation doit contenir au moins une pose.');
  const position = modulo(t, 1) * cles.length;
  const i = Math.floor(position);
  const progression = continu ? position - i : (1 - Math.cos(Math.PI * (position - i))) / 2;
  const pose = interpolerPose(cles[i], cles[(i + 1) % cles.length], progression);
  if (!pose.appuiPieds) return pose;
  // La racine interpolée seule ferait pénétrer les pieds dans le sol lors d'un squat.
  // La correction appartient au cycle, pas à l'interpolation géométrique générique.
  const p = calculerPoints(pose);
  const decalage = SOL_Y - Math.max(p.orteilsGauches.y, p.orteilsDroits.y);
  return { ...pose, racine: { x: pose.racine.x, y: pose.racine.y + decalage } };
}
