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
  /** Élévation de la ceinture scapulaire pour les haussements (unités du cadre). */
  haussement?: number;
  /** Cibles de chevilles pour les mouvements au sol : évite que l'interpolation
   * angulaire fasse traverser le sol aux pieds pendant un repli de jambe. */
  chevilles?: { gauche: Point; droite: Point };
  /** Cibles de mains pour les appuis (pompes, planches, dips) : le bras se plie pour atteindre le point,
   * du côté donné par le signe de `coude` (positif : coude vers l'arrière de profil). */
  mains?: { gauche: Point; droite: Point };
  /** Corps couché vu de face (planche vue de la tête) : fraction visible du tronc et du cou, qui fuient
   * vers l'arrière ; le bassin et les jambes passent alors derrière le buste. */
  raccourci?: number;
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
  const fuite = pose.raccourci ?? 1;
  const epaules = avancer(bassin, l.tronc * fuite + (pose.haussement ?? 0), 180 - pose.tronc);
  const cou = avancer(bassin, (l.tronc + l.cou) * fuite, 180 - pose.tronc);
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
  const bras = (origine: Point, b: Bras, gauche: boolean) => {
    const cible = gauche ? pose.mains?.gauche : pose.mains?.droite;
    let angle = b.epaule - pose.tronc, flexion = b.coude;
    if (cible) {
      const dx = cible.x - origine.x, dy = cible.y - origine.y;
      const distance = Math.max(Math.abs(l.bras - l.avantBras) + .001, Math.min(l.bras + l.avantBras, Math.hypot(dx, dy)));
      const pli = (Math.sin(b.coude * Math.PI / 180) > .000001 ? 1 : -1) * Math.acos(Math.max(-1, Math.min(1,
        (distance * distance - l.bras ** 2 - l.avantBras ** 2) / (2 * l.bras * l.avantBras))));
      angle = (Math.atan2(dx, dy) - Math.atan2(l.avantBras * Math.sin(pli), l.bras + l.avantBras * Math.cos(pli))) * 180 / Math.PI;
      flexion = pli * 180 / Math.PI;
    }
    const coude = avancer(origine, l.bras, angle);
    return { coude, main: avancer(coude, l.avantBras, angle + flexion) };
  };
  const jambe = (origine: Point, j: Jambe, gauche: boolean) => {
    const cible = gauche ? pose.chevilles?.gauche : pose.chevilles?.droite;
    let hanche = j.hanche, flexion = j.genou;
    if (cible) {
      const dx = cible.x - origine.x, dy = cible.y - origine.y;
      const distance = Math.min(l.cuisse + l.tibia, Math.hypot(dx, dy));
      const coude = (Math.sin(j.genou * Math.PI / 180) > .000001 ? 1 : -1) * Math.acos(Math.max(-1, Math.min(1,
        (distance * distance - l.cuisse ** 2 - l.tibia ** 2) / (2 * l.cuisse * l.tibia))));
      hanche = (Math.atan2(dx, dy) - Math.atan2(l.tibia * Math.sin(coude), l.cuisse + l.tibia * Math.cos(coude))) * 180 / Math.PI;
      flexion = coude * 180 / Math.PI;
    }
    const genou = avancer(origine, l.cuisse, hanche);
    const cheville = avancer(genou, l.tibia, hanche + flexion);
    const sensPied = pose.vue === 'face' && gauche ? -90 : 90;
    return { genou, cheville, orteils: avancer(cheville, l.pied, j.hanche + j.genou + sensPied + j.cheville) };
  };
  const bg = bras(epauleGauche, pose.brasGauche, true), bd = bras(epauleDroite, pose.brasDroit, false);
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
    ...(a.haussement !== undefined || b.haussement !== undefined
      ? { haussement: melanger(a.haussement ?? 0, b.haussement ?? 0, t) } : {}),
    ...(a.chevilles && b.chevilles ? { chevilles: {
      gauche: { x: melanger(a.chevilles.gauche.x, b.chevilles.gauche.x, t), y: melanger(a.chevilles.gauche.y, b.chevilles.gauche.y, t) },
      droite: { x: melanger(a.chevilles.droite.x, b.chevilles.droite.x, t), y: melanger(a.chevilles.droite.y, b.chevilles.droite.y, t) },
    } } : {}),
    ...(a.mains && b.mains ? { mains: {
      gauche: { x: melanger(a.mains.gauche.x, b.mains.gauche.x, t), y: melanger(a.mains.gauche.y, b.mains.gauche.y, t) },
      droite: { x: melanger(a.mains.droite.x, b.mains.droite.x, t), y: melanger(a.mains.droite.y, b.mains.droite.y, t) },
    } } : {}),
    ...(a.raccourci !== undefined || b.raccourci !== undefined
      ? { raccourci: melanger(a.raccourci ?? 1, b.raccourci ?? 1, t) } : {}),
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
