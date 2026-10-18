import { calculerPoints, LONGUEURS, SOL_Y, type Bras, type Jambe, type Point, type Pose } from './squelette';

export type AnimationFigurine = { cles: Pose[]; dureeCycleMs: number; accessoire?: 'mur' };
const bras = (epaule = 0, coude = 0): Bras => ({ epaule, coude });
const jambe = (hanche = 0, genou = 0, cheville = -hanche - genou): Jambe => ({ hanche, genou, cheville });
const debout = (vue: Pose['vue'] = 'profil'): Pose => ({
  vue, racine: { x: 100, y: SOL_Y - 68 }, tronc: 0, tete: 0,
  brasGauche: bras(-8), brasDroit: bras(8), jambeGauche: jambe(), jambeDroite: jambe(),
});
const rad = (degres: number) => degres * Math.PI / 180;

/** Outil d'auteur : deux segments de longueurs constantes vers un appui connu.
 * Il ne s'exécute qu'à la création des clés, jamais dans la boucle d'animation. */
function brasVers(pose: Pose, gauche: Point, droite: Point): Pose {
  const p = calculerPoints(pose);
  const atteindre = (depart: Point, cible: Point): Bras => {
    const dx = cible.x - depart.x, dy = cible.y - depart.y;
    const a = LONGUEURS.bras, b = LONGUEURS.avantBras;
    const d = Math.max(Math.abs(a - b) + .001, Math.min(a + b, Math.hypot(dx, dy)));
    const coude = Math.acos(Math.max(-1, Math.min(1, (d * d - a * a - b * b) / (2 * a * b))));
    const epaule = Math.atan2(dx, dy) - Math.atan2(b * Math.sin(coude), a + b * Math.cos(coude));
    return bras(epaule * 180 / Math.PI + pose.tronc, coude * 180 / Math.PI);
  };
  return { ...pose, brasGauche: atteindre(p.epauleGauche, gauche), brasDroit: atteindre(p.epauleDroite, droite) };
}

const calme = debout('face');
const inspiration = { ...calme, brasGauche: bras(-18, -25), brasDroit: bras(18, 25), dos: -2 };
const REPLI: AnimationFigurine = { cles: [calme, inspiration], dureeCycleMs: 6000 };

const squatHaut = { ...debout(), appuiPieds: true, brasGauche: bras(65, 20), brasDroit: bras(65, 20) };
const squatBas: Pose = { ...squatHaut, racine: { x: 81, y: SOL_Y - 34 * (Math.cos(rad(70)) + Math.cos(rad(-25))) },
  tronc: 30, tete: -20, brasGauche: bras(115, 10), brasDroit: bras(115, 10),
  jambeGauche: jambe(70, -95), jambeDroite: jambe(70, -95) };

function pompe(inclinaison: number): Pose {
  const pose: Pose = { ...debout(), racine: { x: 110 + 68 * Math.sin(rad(inclinaison)), y: SOL_Y - 68 * Math.cos(rad(inclinaison)) },
    tronc: inclinaison, jambeGauche: jambe(-inclinaison), jambeDroite: jambe(-inclinaison) };
  return brasVers(pose, { x: 164, y: 82 }, { x: 164, y: 86 });
}

const marcheDroite: Pose = { ...debout(), appuiPieds: true, jambeDroite: jambe(90, -90),
  brasGauche: bras(35, 55), brasDroit: bras(-25, 55) };
const marcheGauche: Pose = { ...debout(), appuiPieds: true, jambeGauche: jambe(90, -90),
  brasDroit: bras(35, 55), brasGauche: bras(-25, 55) };

const fenteDroite: Pose = { ...debout(), appuiPieds: true, racine: { x: 100, y: SOL_Y - 34 * (1 + Math.cos(rad(80))) }, tronc: 5,
  jambeDroite: jambe(80, -80), jambeGauche: jambe(-20, -80, 10),
  brasGauche: bras(10, 90), brasDroit: bras(10, 90) };
const fenteGauche: Pose = { ...fenteDroite, jambeDroite: fenteDroite.jambeGauche, jambeGauche: fenteDroite.jambeDroite };

const quatrePattes: Pose = { ...debout(), racine: { x: 75, y: 146 }, tronc: 75,
  jambeGauche: jambe(0, -90, 90), jambeDroite: jambe(0, -90, 90) };
const chat = brasVers({ ...quatrePattes, tete: 35, dos: -13 }, { x: 133, y: SOL_Y }, { x: 139, y: SOL_Y });
const vache = brasVers({ ...quatrePattes, tete: -25, dos: 9 }, { x: 133, y: SOL_Y }, { x: 139, y: SOL_Y });

// Avant-bras horizontaux au sol, jambes tendues, pointe de pied en appui.
const anglePlanche = 80;
const planche: Pose = { ...debout(), racine: { x: 90, y: 180 - 26 + 42 * Math.cos(rad(anglePlanche)) },
  tronc: anglePlanche, tete: 0, brasDroit: bras(anglePlanche, 90), brasGauche: bras(anglePlanche, 90),
  jambeDroite: jambe(-anglePlanche, 0, 48), jambeGauche: jambe(-anglePlanche, 0, 48) };

export const POSES_PAR_EXERCICE: Record<string, AnimationFigurine> = {
  'rotation-epaules': { cles: [
    { ...calme, brasGauche: bras(-20, -125), brasDroit: bras(20, 125) },
    { ...calme, brasGauche: bras(-100, -90), brasDroit: bras(100, 90) },
    { ...calme, brasGauche: bras(-55, -135), brasDroit: bras(55, 135) },
  ], dureeCycleMs: 5000 },
  // Deux poses répétées donnent inspire / maintien / expire / maintien de 4 s.
  'respiration-carree': { cles: [calme, inspiration, inspiration, calme], dureeCycleMs: 16000 },
  'inclinaison-laterale': { cles: [
    { ...calme, tronc: -18, brasGauche: bras(-170, -10), brasDroit: bras(170, 10) },
    { ...calme, tronc: 18, brasGauche: bras(-170, -10), brasDroit: bras(170, 10) },
  ], dureeCycleMs: 6000 },
  'pompes-mur': { cles: [pompe(5), pompe(18)], dureeCycleMs: 2000, accessoire: 'mur' },
  'squat-lent': { cles: [squatHaut, squatBas], dureeCycleMs: 5000 },
  'marche-genoux-hauts': { cles: [marcheDroite, { ...debout(), appuiPieds: true }, marcheGauche, { ...debout(), appuiPieds: true }], dureeCycleMs: 1800 },
  'jumping-jacks': { cles: [calme, { ...calme, racine: { x: 100, y: 112 },
    brasGauche: bras(-155, -15), brasDroit: bras(155, 15),
    jambeGauche: jambe(-25), jambeDroite: jambe(25) }], dureeCycleMs: 1400 },
  'fentes-arriere': { cles: [{ ...debout(), appuiPieds: true }, fenteDroite, { ...debout(), appuiPieds: true }, fenteGauche], dureeCycleMs: 6000 },
  'chat-vache': { cles: [chat, vache], dureeCycleMs: 6000 },
  'planche': { cles: [planche, { ...planche, dos: -1.5 }], dureeCycleMs: 5000 },
};

export function posesPour(exerciceId: string): AnimationFigurine {
  return Object.prototype.hasOwnProperty.call(POSES_PAR_EXERCICE, exerciceId) ? POSES_PAR_EXERCICE[exerciceId] : REPLI;
}
