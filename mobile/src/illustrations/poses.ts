import { MUR, RAYONS } from './dessin';
import { calculerPoints, LONGUEURS, SOL_Y, type Bras, type Jambe, type Point, type Pose } from './squelette';

/** `continu` : vitesse constante d'une clé à l'autre, pour un geste circulaire sans à-coups. */
export type AnimationFigurine = { cles: Pose[]; dureeCycleMs: number; accessoire?: 'mur' | 'chaise'; murX?: number; continu?: boolean };
const bras = (epaule = 0, coude = 0): Bras => ({ epaule, coude });
const jambe = (hanche = 0, genou = 0, cheville = -hanche - genou): Jambe => ({ hanche, genou, cheville });
const debout = (vue: Pose['vue'] = 'profil'): Pose => ({
  vue, racine: { x: 100, y: SOL_Y - 68 }, tronc: 0, tete: 0,
  brasGauche: bras(-8), brasDroit: bras(8), jambeGauche: jambe(), jambeDroite: jambe(),
});
const rad = (degres: number) => degres * Math.PI / 180;

/** Outil d'auteur : deux segments de longueurs constantes vers un appui connu.
 * Il ne s'exécute qu'à la création des clés, jamais dans la boucle d'animation. */
function brasVers(pose: Pose, gauche: Point, droite: Point, coudesDehors = false): Pose {
  const p = calculerPoints(pose);
  const atteindre = (depart: Point, cible: Point, sens = 1): Bras => {
    const dx = cible.x - depart.x, dy = cible.y - depart.y;
    const a = LONGUEURS.bras, b = LONGUEURS.avantBras;
    const d = Math.max(Math.abs(a - b) + .001, Math.min(a + b, Math.hypot(dx, dy)));
    const coude = sens * Math.acos(Math.max(-1, Math.min(1, (d * d - a * a - b * b) / (2 * a * b))));
    const epaule = Math.atan2(dx, dy) - Math.atan2(b * Math.sin(coude), a + b * Math.cos(coude));
    return bras(epaule * 180 / Math.PI + pose.tronc, coude * 180 / Math.PI);
  };
  // De face, `coudesDehors` plie les coudes vers l'extérieur (bras au-dessus ou derrière la tête).
  const sens = coudesDehors ? -1 : 1;
  return { ...pose, brasGauche: atteindre(p.epauleGauche, gauche, sens),
    brasDroit: atteindre(p.epauleDroite, droite, (pose.vue === 'face' ? -1 : 1) * sens) };
}

const calme = debout('face');
// La poitrine s'ouvre et les bras s'écartent un peu du corps, coudes souples.
const inspiration: Pose = { ...calme, poitrine: 1, brasGauche: bras(-26, -18), brasDroit: bras(26, 18) };
const REPLI: AnimationFigurine = { cles: [calme, inspiration], dureeCycleMs: 6000 };

const squatHaut = { ...debout(), appuiPieds: true, brasGauche: bras(65, 20), brasDroit: bras(65, 20) };
const squatBas: Pose = { ...squatHaut, racine: { x: 81, y: SOL_Y - 34 * (Math.cos(rad(70)) + Math.cos(rad(-25))) },
  tronc: 30, tete: -20, brasGauche: bras(115, 10), brasDroit: bras(115, 10),
  jambeGauche: jambe(70, -95), jambeDroite: jambe(70, -95) };

function pompe(inclinaison: number): Pose {
  const pose: Pose = { ...debout(), racine: { x: 110 + 68 * Math.sin(rad(inclinaison)), y: SOL_Y - 68 * Math.cos(rad(inclinaison)) },
    tronc: inclinaison, jambeGauche: jambe(-inclinaison), jambeDroite: jambe(-inclinaison) };
  // Mains à plat contre le mur, à hauteur d'épaules.
  const contact = MUR.x - RAYONS.main - 0.5;
  return brasVers(pose, { x: contact, y: 80 }, { x: contact, y: 84 });
}

const marcheDroite: Pose = { ...debout(), appuiPieds: true, jambeDroite: jambe(90, -90),
  brasGauche: bras(35, 55), brasDroit: bras(-25, 55) };
const marcheGauche: Pose = { ...debout(), appuiPieds: true, jambeGauche: jambe(90, -90),
  brasDroit: bras(35, 55), brasGauche: bras(-25, 55) };

const fenteDroite: Pose = { ...debout(), appuiPieds: true, racine: { x: 100, y: SOL_Y - 34 * (1 + Math.cos(rad(80))) }, tronc: 5,
  jambeDroite: jambe(80, -80), jambeGauche: jambe(-20, -80, 10),
  brasGauche: bras(10, 90), brasDroit: bras(10, 90) };
const fenteGauche: Pose = { ...fenteDroite, jambeDroite: fenteDroite.jambeGauche, jambeGauche: fenteDroite.jambeDroite };

// Genoux sous les hanches, mains sous les épaules, cou-de-pied à plat derrière.
const quatrePattes: Pose = { ...debout(), racine: { x: 70, y: SOL_Y - LONGUEURS.cuisse }, tronc: 70,
  jambeGauche: jambe(0, -90, -90), jambeDroite: jambe(0, -90, -90) };
const mainsAuSol = (pose: Pose) => brasVers(pose, { x: 110, y: SOL_Y }, { x: 115, y: SOL_Y });
// Chat : le dos s'arrondit vers le plafond, la tête rentre. Vache : le dos se creuse, le regard monte.
const chat = mainsAuSol({ ...quatrePattes, tete: 55, dos: 14 });
const vache = mainsAuSol({ ...quatrePattes, tete: -40, dos: -11 });

// Avant-bras horizontaux au sol, jambes tendues, pointe de pied en appui.
const anglePlanche = 80;
const planche: Pose = { ...debout(), racine: { x: 90, y: 180 - 26 + 42 * Math.cos(rad(anglePlanche)) },
  tronc: anglePlanche, tete: 0, brasDroit: bras(anglePlanche, 90), brasGauche: bras(anglePlanche, 90),
  jambeDroite: jambe(-anglePlanche, 0, 48), jambeGauche: jambe(-anglePlanche, 0, 48) };

// Les appuis sont recalés pendant tout le cycle, pas seulement aux clés.
const face: Pose = { ...calme, appuiPieds: true };
const profil: Pose = { ...debout(), appuiPieds: true };
const mains = (pose: Pose, x: number, y: number, ecart = 0) =>
  brasVers(pose, { x: x - ecart, y }, { x: x + ecart, y });
const hanches = (pose: Pose) => mains(pose, pose.racine.x, pose.racine.y - 4, 12);
const ciel = brasVers(face, { x: 97, y: 26 }, { x: 103, y: 26 }, true);
const ventre = mains(face, 100, 101, 3);
// Mains derrière la nuque, juste sous les oreilles ; coudes grands ouverts vers l'extérieur.
const nuque = (dx: number, dy: number, tete = 0) =>
  brasVers({ ...face, tete }, { x: 88 + dx, y: 61 + dy }, { x: 112 - dx, y: 61 + dy }, true);
const poignets = (x: number, y: number) => mains(face, x, y, 2);
const tourne = (sens: number): Pose => mains({ ...face, tronc: sens * 3 }, 100 + sens * 23, 90, 6);
const surMur = (pose: Pose): Pose => {
  const p = calculerPoints(pose);
  return { ...brasVers(pose, p.mainGauche, { x: MUR.x - RAYONS.main - .5, y: 85 }), brasGauche: bras(-8) };
};
const appuiMur = surMur({ ...profil, racine: { x: 120, y: 112 } });
const assis: Pose = { ...profil, racine: { x: 85, y: 146 },
  brasGauche: bras(65, 20), brasDroit: bras(65, 20),
  jambeGauche: jambe(90, -90), jambeDroite: jambe(90, -90) };
const chaiseMur: Pose = { ...assis, racine: { x: 92, y: 146 },
  brasGauche: bras(15, 65), brasDroit: bras(15, 65) };
const marcheFace = (gauche: boolean): Pose => ({ ...face,
  jambeGauche: jambe(gauche ? -35 : 0, gauche ? 55 : 0),
  jambeDroite: jambe(gauche ? 0 : 35, gauche ? 0 : -55),
  brasGauche: bras(-15, gauche ? -20 : -70), brasDroit: bras(15, gauche ? 70 : 20) });
// De profil, la montée du genou se lit sans raccourci : buste à peine penché (10°), appui stable,
// le coude opposé descend à la rencontre du genou haut.
const coudeGenou = (gauche: boolean): Pose => ({ ...profil, tronc: 10,
  jambeGauche: gauche ? jambe(125, -110) : jambe(),
  jambeDroite: gauche ? jambe() : jambe(125, -110),
  brasGauche: gauche ? bras(-25, 40) : bras(45, 110),
  brasDroit: gauche ? bras(45, 110) : bras(-25, 40) });
// Planche haute : colonne et jambes alignées, mains sous les épaules.
const hauteurBassinPlanche = 145.5;
const inclinaisonPlanche = Math.acos((hauteurBassinPlanche - 130) / 42) * 180 / Math.PI;
const pointePlanche = Math.acos((SOL_Y - hauteurBassinPlanche - 68 * Math.cos(rad(inclinaisonPlanche))) / 13) * 180 / Math.PI;
const plancheHaute: Pose = { ...debout(), racine: { x: 90, y: hauteurBassinPlanche }, tronc: inclinaisonPlanche,
  brasGauche: bras(inclinaisonPlanche), brasDroit: bras(inclinaisonPlanche),
  jambeGauche: jambe(-inclinaisonPlanche, 0, pointePlanche - 90 + inclinaisonPlanche),
  jambeDroite: jambe(-inclinaisonPlanche, 0, pointePlanche - 90 + inclinaisonPlanche) };
const fixerChevilles = (pose: Pose): Pose => {
  const p = calculerPoints(pose);
  return { ...pose, appuiPieds: false, chevilles: { gauche: p.chevilleGauche, droite: p.chevilleDroite } };
};
// Entre deux genoux, on repasse par la planche : une jambe reste toujours tendue.
const grimpeTendue = fixerChevilles(plancheHaute);
const grimpe = (gauche: boolean): Pose => ({ ...grimpeTendue, chevilles: {
  gauche: gauche ? { x: 104, y: 154 } : grimpeTendue.chevilles!.gauche,
  droite: gauche ? grimpeTendue.chevilles!.droite : { x: 110, y: 154 } } });
/** Patineur sans saut : un seul pied quitte le sol à la fois. `x`, `y` : bassin ; chevilles gauche et
 * droite (abscisse au sol, ou point en l'air) ; `poids` de -1 (sur la gauche) à 1 (sur la droite). */
const pas = (x: number, y: number, gauche: number | Point, droite: number | Point, poids: number): Pose => {
  const sol = (c: number | Point) => typeof c === 'number' ? { x: c, y: SOL_Y } : c;
  return { ...face, appuiPieds: false, racine: { x, y }, tronc: poids * 6,
    chevilles: { gauche: sol(gauche), droite: sol(droite) },
    jambeGauche: jambe(0, -1), jambeDroite: jambe(0, 1),
    brasGauche: bras(-30 - poids * 25, -35), brasDroit: bras(30 - poids * 25, 35) };
};
const pontBas: Pose = { ...debout(), racine: { x: 95, y: 164 }, tronc: -90,
  brasGauche: bras(-5), brasDroit: bras(-5),
  jambeGauche: jambe(125, -160), jambeDroite: jambe(125, -160),
  chevilles: { gauche: { x: 127, y: 180 }, droite: { x: 133, y: 180 } } };
const pontHaut: Pose = { ...pontBas, racine: { x: 93, y: 146 }, tronc: -115, tete: 25,
  brasGauche: bras(-30), brasDroit: bras(-30),
  jambeGauche: jambe(100, -125), jambeDroite: jambe(100, -125) };
const ventreSol: Pose = { ...debout(), racine: { x: 95, y: 163 }, tronc: 90,
  brasGauche: bras(155, 15), brasDroit: bras(155, 15),
  jambeGauche: jambe(-90), jambeDroite: jambe(-90) };
const lateral: Pose = { ...face, appuiPieds: false, racine: { x: 92, y: 147.5 }, tronc: 80,
  brasGauche: bras(260), brasDroit: bras(80, 90),
  jambeGauche: jambe(-65), jambeDroite: jambe(-65),
  chevilles: { gauche: { x: 28, y: 176 }, droite: { x: 40, y: 180 } } };
const velo = (gauche: boolean): Pose => ({ ...pontBas, chevilles: undefined, racine: { x: 94, y: 166 }, tronc: -65, tete: 15,
  brasGauche: bras(65, 140), brasDroit: bras(65, 140),
  jambeGauche: gauche ? jambe(165, -110) : jambe(85, -10),
  jambeDroite: gauche ? jambe(85, -10) : jambe(165, -110) });

export const POSES_PAR_EXERCICE: Record<string, AnimationFigurine> = {
  // De profil, bouts des doigts sur les épaules : le coude dessine un grand cercle (avant, haut, arrière, bas).
  // En haut, le coude passe un peu en arrière de la tête pour ne pas masquer le visage.
  'rotation-epaules': { cles: [0, 90, 200, 290].map(angle => ({ ...debout(),
    brasGauche: bras(angle - 4, -165), brasDroit: bras(angle + 4, -165) })), dureeCycleMs: 5000, continu: true },
  // Deux poses répétées donnent inspire / maintien / expire / maintien de 4 s.
  'respiration-carree': { cles: [calme, inspiration, inspiration, calme], dureeCycleMs: 16000 },
  'inclinaison-laterale': { cles: [
    { ...calme, tronc: -18, brasGauche: bras(-170, -10), brasDroit: bras(170, 10) },
    { ...calme, tronc: 18, brasGauche: bras(-170, -10), brasDroit: bras(170, 10) },
  ], dureeCycleMs: 6000 },
  'pompes-mur': { cles: [pompe(5), pompe(16)], dureeCycleMs: 2000, accessoire: 'mur' },
  'squat-lent': { cles: [squatHaut, squatBas], dureeCycleMs: 5000 },
  'marche-genoux-hauts': { cles: [marcheDroite, { ...debout(), appuiPieds: true }, marcheGauche, { ...debout(), appuiPieds: true }], dureeCycleMs: 1800 },
  'jumping-jacks': { cles: [calme, { ...calme, racine: { x: 100, y: 112 },
    brasGauche: bras(-155, -15), brasDroit: bras(155, 15),
    jambeGauche: jambe(-25), jambeDroite: jambe(25) }], dureeCycleMs: 1400 },
  'fentes-arriere': { cles: [{ ...debout(), appuiPieds: true }, fenteDroite, { ...debout(), appuiPieds: true }, fenteGauche], dureeCycleMs: 6000 },
  'chat-vache': { cles: [chat, vache], dureeCycleMs: 6000 },
  // On tient : seul le souffle soulève à peine le dos.
  'planche': { cles: [planche, { ...planche, dos: 1.2 }], dureeCycleMs: 5000 },
  'rotation-cou': { cles: [{ ...face, tete: -24 }, { ...face, tete: 0, dos: 1.5 }, { ...face, tete: 24 }], dureeCycleMs: 6000 },
  'haussement-epaules': { cles: [face, { ...face, haussement: 5, brasGauche: bras(-12, -12), brasDroit: bras(12, 12) }], dureeCycleMs: 4000 },
  'rotation-poignets': { cles: [poignets(96, 91), poignets(104, 91), poignets(100, 85)], dureeCycleMs: 4000, continu: true },
  'ouverture-poitrine': { cles: [mains(profil, 80, 105), mains({ ...profil, poitrine: 1 }, 72, 100)], dureeCycleMs: 5000 },
  'cercles-bras': { cles: [
    { ...face, brasGauche: bras(-80), brasDroit: bras(80) },
    { ...face, brasGauche: bras(-110, -8), brasDroit: bras(110, 8) },
    { ...face, brasGauche: bras(-90, 15), brasDroit: bras(90, -15) },
  ], dureeCycleMs: 5000, continu: true },
  'etirement-cou': { cles: [{ ...face, tete: -22 }, { ...face, tete: -28, poitrine: .5 }], dureeCycleMs: 6000 },
  'rotation-buste': { cles: [tourne(-1), tourne(1)], dureeCycleMs: 5000 },
  'cercles-hanches': { cles: [-1, 0, 1].map(s => hanches({ ...face, racine: { x: 100 + s * 7, y: 112 }, tronc: -s * 8,
    jambeGauche: s === 0 ? jambe(-20, 40) : jambe(-s * 6),
    jambeDroite: s === 0 ? jambe(20, -40) : jambe(-s * 6) })), dureeCycleMs: 5000, continu: true },
  'enroule-deroule': { cles: [profil, { ...profil, tronc: 45, tete: 25, dos: 8, brasGauche: bras(45), brasDroit: bras(45) },
    { ...profil, tronc: 95, tete: 20, dos: 12, brasGauche: bras(95), brasDroit: bras(95), jambeGauche: jambe(25, -50), jambeDroite: jambe(25, -50) }], dureeCycleMs: 6000 },
  'balancier-jambe': { cles: [{ ...appuiMur, jambeGauche: jambe(-28) }, { ...appuiMur, jambeGauche: jambe(35) }], dureeCycleMs: 5000, accessoire: 'mur' },
  'cercles-chevilles': { cles: [-25, 10, 35].map(a => ({ ...appuiMur, jambeGauche: jambe(20, -45, a) })), dureeCycleMs: 4000, accessoire: 'mur', continu: true },
  'etirement-mollet': { cles: [0, 1].map(s => mains({ ...profil, racine: { x: 117, y: 112 }, tronc: 10 + s,
    jambeGauche: jambe(-25), jambeDroite: jambe(35, -65), poitrine: s * .5 }, 163, 84, 0)), dureeCycleMs: 6000, accessoire: 'mur' },
  'respiration-ventre': { cles: [ventre, { ...ventre, poitrine: 1 }], dureeCycleMs: 6000 },
  'grand-soupir': { cles: [face, { ...inspiration, appuiPieds: true, poitrine: .5 }, { ...inspiration, appuiPieds: true, haussement: 2 }], dureeCycleMs: 6000 },
  'respiration-allongee': { cles: [face, { ...inspiration, appuiPieds: true }, face], dureeCycleMs: 6000 },
  'bras-respiration': { cles: [face, ciel], dureeCycleMs: 6000 },
  'epaules-lourdes': { cles: [{ ...face, haussement: 5, brasGauche: bras(-20, -110), brasDroit: bras(20, 110) }, face], dureeCycleMs: 6000 },
  'massage-nuque': { cles: [nuque(0, 0), nuque(1, -2, 5), nuque(-1, -1)], dureeCycleMs: 5000, continu: true },
  'secouer-bras': { cles: [{ ...face, brasGauche: bras(-20, 20), brasDroit: bras(20, -20) },
    { ...face, brasGauche: bras(-12, -25), brasDroit: bras(12, 25) }], dureeCycleMs: 4000 },
  'balancement-bras': { cles: [tourne(-1), face, tourne(1)], dureeCycleMs: 5000 },
  'etirement-ciel': { cles: [ciel, { ...ciel, poitrine: 1, haussement: 2 }], dureeCycleMs: 6000 },
  'ancrage-pieds': { cles: [{ ...profil, tronc: -3, jambeGauche: jambe(3), jambeDroite: jambe(3) },
    { ...profil, tronc: 3, jambeGauche: jambe(-3), jambeDroite: jambe(-3), poitrine: .5 }], dureeCycleMs: 6000 },
  // « Lentement », « en douceur » : cycle lent malgré l'effet énergie.
  'montees-pointes': { cles: [profil, { ...profil, jambeGauche: jambe(0, 0, -35), jambeDroite: jambe(0, 0, -35) }], dureeCycleMs: 4000 },
  'assis-debout': { cles: [assis, { ...squatHaut, racine: { x: 119, y: 112 } }], dureeCycleMs: 4000, accessoire: 'chaise' },
  'chaise-murale': { cles: [chaiseMur, { ...chaiseMur, poitrine: .6 }], dureeCycleMs: 2000, accessoire: 'mur', murX: 60 },
  'marche-sur-place': { cles: [marcheFace(true), face, marcheFace(false)], dureeCycleMs: 2000 },
  'genou-coude': { cles: [coudeGenou(true), profil, coudeGenou(false), profil], dureeCycleMs: 5000 },
  'gainage-debout': { cles: [mains(face, 100, 85, 1), mains({ ...face, poitrine: .8 }, 100, 82, 1)], dureeCycleMs: 2000 },
  // Le profil rend l'extension du poing lisible sans raccourci frontal.
  'boxe-air': { cles: [
    { ...profil, brasGauche: bras(25, 125), brasDroit: bras(30, 125) },
    { ...profil, brasGauche: bras(80, 10), brasDroit: bras(30, 125) },
    { ...profil, brasGauche: bras(25, 125), brasDroit: bras(80, 10) },
  ], dureeCycleMs: 1200 },
  'jambe-arriere': { cles: [appuiMur, { ...appuiMur, jambeGauche: jambe(-25) }], dureeCycleMs: 2000, accessoire: 'mur' },
  'squats-sautes': { cles: [squatBas, { ...squatHaut, appuiPieds: false, racine: { x: 100, y: 92 } }, squatHaut], dureeCycleMs: 1600 },
  'talons-fesses': { cles: [
    { ...profil, jambeGauche: jambe(-10, -115), brasDroit: bras(20, 65) },
    { ...profil, jambeDroite: jambe(-10, -115), brasGauche: bras(20, 65) },
  ], dureeCycleMs: 1200 },
  'patineur': { cles: [
    pas(118, 117, 128, 122, 1), pas(108, 115, { x: 102, y: 170 }, 122, .5), pas(100, 118, 78, 122, 0), pas(90, 115, 78, { x: 96, y: 170 }, -.5),
    pas(82, 117, 78, 72, -1), pas(90, 115, 78, { x: 100, y: 170 }, -.5), pas(100, 118, 78, 122, 0), pas(110, 115, { x: 104, y: 170 }, 122, .5),
  ], dureeCycleMs: 2000 },
  'pas-chasses': { cles: [-1, 0, 1].map(s => ({ ...face, racine: { x: 100 + s * 18, y: 112 },
    jambeGauche: jambe(s === 0 ? 0 : -15), jambeDroite: jambe(s === 0 ? 0 : 15),
    brasGauche: bras(-25, -60), brasDroit: bras(25, 60) })), dureeCycleMs: 1800 },
  'burpee-sans-saut': { cles: [fixerChevilles(profil), fixerChevilles({ ...squatBas, tronc: 70, brasGauche: bras(70), brasDroit: bras(70) }), fixerChevilles(plancheHaute)], dureeCycleMs: 2000 },
  'grimpeur': { cles: [grimpe(true), grimpeTendue, grimpe(false), grimpeTendue], dureeCycleMs: 2000 },
  'pont-fessier': { cles: [pontBas, pontHaut], dureeCycleMs: 2000 },
  'superman': { cles: [ventreSol, { ...ventreSol, tronc: 80, tete: 5, brasGauche: bras(170), brasDroit: bras(170),
    jambeGauche: jambe(-100), jambeDroite: jambe(-100) }], dureeCycleMs: 2000 },
  'planche-laterale': { cles: [lateral, { ...lateral, poitrine: .6 }], dureeCycleMs: 2000 },
  'crunch-velo': { cles: [velo(true), velo(false)], dureeCycleMs: 4000 },
};

export function posesPour(exerciceId: string): AnimationFigurine {
  return Object.prototype.hasOwnProperty.call(POSES_PAR_EXERCICE, exerciceId) ? POSES_PAR_EXERCICE[exerciceId] : REPLI;
}
