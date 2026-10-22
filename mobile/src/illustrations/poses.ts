import { CHAISE, MUR, RAYONS, TABLE } from './dessin';
import { calculerPoints, interpolerPose, LONGUEURS, SOL_Y, type Bras, type Jambe, type Point, type Pose } from './squelette';

/** `continu` : vitesse constante d'une clé à l'autre, pour un geste circulaire sans à-coups. */
export type AnimationFigurine = {
  cles: Pose[]; dureeCycleMs: number; accessoire?: 'mur' | 'chaise' | 'table'; murX?: number; chaiseX?: number; continu?: boolean;
  /** Dossier du côté opposé au corps pour les mains en appui sur l'assise. */
  chaiseDossierDroite?: boolean;
};
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

// ——— Niveaux Tonique et Costaud ———
const deg = (r: number) => r * 180 / Math.PI;
const CORPS = LONGUEURS.cuisse + LONGUEURS.tibia + LONGUEURS.tronc;
/** Jambe dont le pied pointe dans la direction `pied` (0 vers le bas, 90 vers l'avant), quel que soit le pli. */
const jambePied = (hanche: number, genou: number, pied: number): Jambe => ({ hanche, genou, cheville: pied - 90 - hanche - genou });
/** Orientation du pied qui pose les orteils au sol depuis une cheville à la hauteur `y`. */
const piedSol = (y: number, sol: number = SOL_Y) => deg(Math.acos((sol - y) / LONGUEURS.pied));
const troncVers = (bassin: Point, epaules: Point) => deg(Math.atan2(epaules.x - bassin.x, bassin.y - epaules.y));
/** Point à `ra` de `a` et à `rb` de `b`, du côté haut de l'écran (ou bas). */
function croisement(a: Point, ra: number, b: Point, rb: number, haut = true): Point {
  const d = Math.hypot(b.x - a.x, b.y - a.y);
  const l = (ra * ra - rb * rb + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, ra * ra - l * l));
  const ux = (b.x - a.x) / d, uy = (b.y - a.y) / d;
  const m = { x: a.x + ux * l, y: a.y + uy * l };
  const p1 = { x: m.x - uy * h, y: m.y + ux * h }, p2 = { x: m.x + uy * h, y: m.y - ux * h };
  return (p1.y < p2.y) === haut ? p1 : p2;
}
/** Épaules d'un corps gainé de longueur fixe, à la hauteur `y`, devant (`sens` 1) ou derrière la cheville. */
const epaulesA = (cheville: Point, y: number, sens = 1): Point =>
  ({ x: cheville.x + sens * Math.sqrt(CORPS ** 2 - (y - cheville.y) ** 2), y });

/** Corps gainé de profil : bassin sur la droite cheville – épaules, jambes tendues, aucun creux. */
function gaine(cheville: Point, epaules: Point, pied: number): Pose {
  const k = (LONGUEURS.cuisse + LONGUEURS.tibia) / Math.hypot(epaules.x - cheville.x, epaules.y - cheville.y);
  const bassin = { x: cheville.x + (epaules.x - cheville.x) * k, y: cheville.y + (epaules.y - cheville.y) * k };
  const hanche = deg(Math.atan2(cheville.x - bassin.x, cheville.y - bassin.y));
  return { ...debout(), racine: bassin, tronc: troncVers(bassin, epaules),
    jambeGauche: jambePied(hanche, 0, pied), jambeDroite: jambePied(hanche, 0, pied) };
}
/** Appuis des mains (main droite en `x`, la gauche décalée comme l'épaule éloignée) ; coudes vers l'arrière. */
const appuiMains = (pose: Pose, x: number, y: number = SOL_Y, ecart = 6, coude = 30): Pose => ({ ...pose,
  mains: { gauche: { x: x - ecart, y }, droite: { x, y } }, brasGauche: bras(0, coude), brasDroit: bras(0, coude) });

/** Pompe de profil : le corps gainé pivote sur la pointe des pieds, mains fixes. `main` : décalage de la main
 * droite par rapport à l'épaule droite en haut (négatif : sous la poitrine). */
function pompes(cheville: Point, haut: number, bas: number, main: number, pied = piedSol(cheville.y)): [Pose, Pose] {
  const x = epaulesA(cheville, haut).x + 3 + main;
  return [appuiMains(gaine(cheville, epaulesA(cheville, haut), pied), x),
    appuiMains(gaine(cheville, epaulesA(cheville, bas), pied), x)];
}
const CHEVILLE_POMPE = { x: 36, y: 171 };
const pompeClassique = pompes(CHEVILLE_POMPE, 132, 150, 10);
// Mains en losange sous le sternum : les coudes longent les côtes.
const pompeDiamant = pompes(CHEVILLE_POMPE, 132, 156, -9);
// Mains larges, un peu devant les épaules : la poitrine descend plus bas entre les mains.
const pompeLarge = pompes(CHEVILLE_POMPE, 134, 152, 17);
// Pieds sur l'assise : orteils posés sur le dessus de la chaise.
const CHAISE_DECLINEE = 26;
const chevilleDeclinee = { x: CHAISE_DECLINEE + 28, y: 140 };
const pompeDeclinee = pompes(chevilleDeclinee, 132, 152, 10, piedSol(chevilleDeclinee.y, CHAISE.assise - RAYONS.orteils));

// Spider-man : en bas de la pompe, le genou vient frôler le coude du même côté, pied décollé.
// Le genou vient frôler le coude, le tibia replié de 140° vers l'arrière.
const genouAuCoude = (pose: Pose, droite: boolean): Pose => {
  const p = calculerPoints(pose);
  const hanche = droite ? p.hancheDroite : p.hancheGauche, coude = droite ? p.coudeDroit : p.coudeGauche;
  // Cuisse presque horizontale, vers le coude ; le pied reste du côté du plafond.
  const cuisse = Math.atan2(coude.x - hanche.x, Math.min(coude.y, hanche.y + 4) - hanche.y);
  const genou = { x: hanche.x + LONGUEURS.cuisse * Math.sin(cuisse), y: hanche.y + LONGUEURS.cuisse * Math.cos(cuisse) };
  const replis = [cuisse - rad(140), cuisse + rad(140)]
    .map(t => ({ x: genou.x + LONGUEURS.tibia * Math.sin(t), y: genou.y + LONGUEURS.tibia * Math.cos(t) }));
  const pied = replis[0].y < replis[1].y ? replis[0] : replis[1];
  const plie = (j: Jambe, signe: number): Jambe => jambePied(j.hanche, signe * 40, j.hanche + j.genou + 90 + j.cheville);
  // Le pli du genou (signe du genou) est choisi pour que le genou passe du côté du coude.
  const essai = (signe: number) => {
    const q = calculerPoints({ ...pose, chevilles: { gauche: droite ? p.chevilleGauche : pied, droite: droite ? pied : p.chevilleDroite },
      [droite ? 'jambeDroite' : 'jambeGauche']: plie(droite ? pose.jambeDroite : pose.jambeGauche, signe) });
    return Math.hypot((droite ? q.genouDroit : q.genouGauche).x - genou.x, (droite ? q.genouDroit : q.genouGauche).y - genou.y);
  };
  const signe = essai(1) < essai(-1) ? 1 : -1;
  return { ...pose, chevilles: { gauche: droite ? p.chevilleGauche : pied, droite: droite ? pied : p.chevilleDroite },
    [droite ? 'jambeDroite' : 'jambeGauche']: plie(droite ? pose.jambeDroite : pose.jambeGauche, signe) };
};
const spiderHaut = fixerChevilles(pompeClassique[0]);
const spiderBas = fixerChevilles(pompeClassique[1]);

// Pompe en V : bassin au sommet, jambes et bras-tronc tendus ; en bas, le haut du crâne vient vers le sol.
const CHEVILLE_V = { x: 40, y: 171 };
const enV = (cheville: Point, main: Point, vers: Point, distance: number, tete = 0): Pose => {
  const bassin = croisement(cheville, LONGUEURS.cuisse + LONGUEURS.tibia, vers, distance);
  const hanche = deg(Math.atan2(cheville.x - bassin.x, cheville.y - bassin.y));
  return appuiMains({ ...debout(), racine: bassin, tronc: troncVers(bassin, vers), tete,
    jambeGauche: jambePied(hanche, 0, piedSol(cheville.y)), jambeDroite: jambePied(hanche, 0, piedSol(cheville.y)),
    chevilles: { gauche: { x: cheville.x - 3, y: cheville.y }, droite: { x: cheville.x + 3, y: cheville.y } } }, main.x + 3);
};
const mainV = { x: 125, y: SOL_Y };
const vHaut = enV(CHEVILLE_V, mainV, mainV, LONGUEURS.tronc + 49.8);
const vBas = enV(CHEVILLE_V, mainV, { x: mainV.x + 5, y: SOL_Y - LONGUEURS.rayonTete - 4 }, LONGUEURS.tronc + LONGUEURS.cou + LONGUEURS.tete);

// Pompe hindoue : V, plongée poitrine au ras du sol, cobra bras tendus ; pointes de pieds fixes.
const CHEVILLE_HINDOUE = { x: 34, y: 171 };
const mainHindoue = { x: 143, y: SOL_Y };
const hindoueV = enV(CHEVILLE_HINDOUE, mainHindoue, mainHindoue, LONGUEURS.tronc + 49.8);
const hindouePlongee = enV(CHEVILLE_HINDOUE, mainHindoue, { x: mainHindoue.x - 8, y: 156 }, LONGUEURS.tronc, -30);
const cobra = (() => {
  const bassin = { x: CHEVILLE_HINDOUE.x + 66.4, y: 158 };
  const epaules = croisement(bassin, LONGUEURS.tronc, mainHindoue, 49.8);
  const hanche = deg(Math.atan2(CHEVILLE_HINDOUE.x - bassin.x, CHEVILLE_HINDOUE.y - bassin.y));
  return { ...hindoueV, racine: bassin, tronc: troncVers(bassin, epaules), tete: -40,
    jambeGauche: jambePied(hanche, 0, piedSol(CHEVILLE_HINDOUE.y)), jambeDroite: jambePied(hanche, 0, piedSol(CHEVILLE_HINDOUE.y)) };
})();

// Dips : mains au bord avant de l'assise, dos contre le bord, talons au sol devant.
const CHAISE_DIPS = 45;
const dips = (epaules: Point, tronc: number): Pose => {
  const bassin = { x: epaules.x - LONGUEURS.tronc * Math.sin(rad(tronc)), y: epaules.y + LONGUEURS.tronc * Math.cos(rad(tronc)) };
  return { ...appuiMains({ ...debout(), racine: bassin, tronc, tete: -tronc,
    jambeGauche: jambePied(60, -40, 120), jambeDroite: jambePied(60, -40, 120),
    chevilles: { gauche: { x: 150, y: 178 }, droite: { x: 156, y: 178 } } },
  CHAISE_DIPS + CHAISE.largeur - 1, CHAISE.assise - RAYONS.main) };
};

// Tractions australiennes : sur le dos, talons au sol, corps gainé suspendu au bord de la table.
const MAIN_TABLE = { x: TABLE.x + 7, y: TABLE.plateau + TABLE.epaisseur + RAYONS.main - 1 };
const tractions = (hauteurEpaules: number, tete: number): Pose => {
  const cheville = { x: MAIN_TABLE.x - 3 + Math.sqrt(CORPS ** 2 - (SOL_Y - 4 - MAIN_TABLE.y - 49.8) ** 2), y: SOL_Y - 4 };
  const pose = gaine(cheville, epaulesA(cheville, hauteurEpaules, -1), 165);
  return { ...appuiMains(pose, MAIN_TABLE.x, MAIN_TABLE.y), tete };
};

// Superman tirage : à plat ventre, bras tendus devant puis coudes tirés vers les côtes.
const ventrePlat: Pose = { ...debout(), racine: { x: 98, y: 166 }, tronc: 84, tete: -8,
  jambeGauche: jambePied(-80, 0, -95), jambeDroite: jambePied(-80, 0, -95) };

// Squat avec pause : pieds fixes, cuisses parallèles au sol en bas, bras devant pour l'équilibre.
const squatPauseHaut = fixerChevilles({ ...debout(), jambeGauche: jambePied(0, 0, 90), jambeDroite: jambePied(0, 0, 90),
  brasGauche: bras(75, 10), brasDroit: bras(75, 10) });
const squatPauseBas: Pose = { ...squatPauseHaut, racine: { x: 78, y: 148 }, tronc: 40, tete: -25,
  brasGauche: bras(130), brasDroit: bras(130) };

// Squat bulgare : cou-de-pied arrière sur l'assise, pied avant à plat, genou avant au-dessus de la cheville.
const CHAISE_BULGARE = 30;
const bulgare = (racine: Point, tronc: number): Pose => ({ ...debout(), racine, tronc, tete: -tronc / 2,
  jambeGauche: jambePied(-60, -60, -95), jambeDroite: jambePied(30, -60, 90),
  chevilles: { gauche: { x: CHAISE_BULGARE + 36, y: 146 }, droite: { x: 150, y: SOL_Y } },
  brasGauche: bras(tronc + 10, 25), brasDroit: bras(tronc - 5, 25) });

// Planche, toucher d'épaules (profil) : corps gainé, une main quitte le sol pour l'épaule opposée.
const CHEVILLE_TOUCHER = { x: 36, y: 171 };
const plancheTendue = (() => {
  const epaules = epaulesA(CHEVILLE_TOUCHER, SOL_Y - 49.8);
  return appuiMains(gaine(CHEVILLE_TOUCHER, epaules, piedSol(CHEVILLE_TOUCHER.y)), epaules.x + 3);
})();
// La main proche vient devant l'épaule éloignée, et inversement ; le pli choisi met le coude vers le sol.
const toucher = (droite: boolean, coude: number): Pose => {
  const p = calculerPoints(plancheTendue);
  const cible = droite ? { x: p.epauleGauche.x + 2, y: p.epauleGauche.y + 4 } : { x: p.epauleDroite.x - 2, y: p.epauleDroite.y + 4 };
  return { ...plancheTendue, [droite ? 'brasDroit' : 'brasGauche']: bras(0, coude),
    mains: { gauche: droite ? plancheTendue.mains!.gauche : cible, droite: droite ? cible : plancheTendue.mains!.droite } };
};
const pliVersLeSol = (droite: boolean) => {
  const coude = (pose: Pose) => { const q = calculerPoints(pose); return droite ? q.coudeDroit.y : q.coudeGauche.y; };
  return coude(toucher(droite, 30)) > coude(toucher(droite, -30)) ? 30 : -30;
};
// Le bras d'appui garde le même sens de pli que pendant le toucher : pas de saut du coude entre les clés.
const plancheToucher: Pose = { ...plancheTendue, brasDroit: bras(0, pliVersLeSol(true)), brasGauche: bras(0, pliVersLeSol(false)) };
const toucheEpaule = (droite: boolean): Pose => ({ ...toucher(droite, pliVersLeSol(droite)),
  [droite ? 'brasGauche' : 'brasDroit']: droite ? plancheToucher.brasGauche : plancheToucher.brasDroit });
// Pompe archer (profil) : le bras proche se plie, la poitrine descend vers sa main ; le bras éloigné reste
// tendu et glisse loin devant sur le sol. Un seul côté montré : l'exercice se fait de chaque côté.
const brasEloigneTendu = (pose: Pose): Pose => {
  const p = calculerPoints(pose);
  const devant = { x: p.epauleGauche.x + Math.sqrt(49.9 ** 2 - (SOL_Y - p.epauleGauche.y) ** 2), y: SOL_Y };
  return { ...pose, mains: { gauche: devant, droite: pose.mains!.droite } };
};
const [archerHaut, archerBas] = pompes(CHEVILLE_POMPE, 132, 150, 10).map(brasEloigneTendu);

// Gainage commando : avant-bras au sol, puis une main, puis l'autre ; pointes de pieds fixes.
const CHEVILLE_COMMANDO = { x: 36, y: 171 };
const commando = (hauteurEpaules: number, mainDroite: number, mainGauche: number): Pose =>
  ({ ...gaine(CHEVILLE_COMMANDO, epaulesA(CHEVILLE_COMMANDO, hauteurEpaules), piedSol(CHEVILLE_COMMANDO.y)),
    mains: { gauche: { x: mainGauche, y: SOL_Y }, droite: { x: mainDroite, y: SOL_Y } },
    brasGauche: bras(0, 30), brasDroit: bras(0, 30) });
const surCoudes = (() => {
  const x = epaulesA(CHEVILLE_COMMANDO, SOL_Y - LONGUEURS.bras).x;
  return commando(SOL_Y - LONGUEURS.bras, x + 3 + LONGUEURS.avantBras, x - 3 + LONGUEURS.avantBras);
})();
const surMains = commando(SOL_Y - 49.8, 143.5, 137.5);
const uneMain = commando(146, 143.5, epaulesA(CHEVILLE_COMMANDO, 146).x - 3 + LONGUEURS.avantBras);

// Fentes sautées : envol entre deux fentes, les jambes se croisent en l'air.
// La jambe avant recule, la jambe arrière avance : chacune garde le pli qu'elle avait au sol.
const envol = (versGauche: boolean): Pose => ({ ...debout(), racine: { x: 100, y: 98 }, tronc: 5,
  jambeDroite: versGauche ? jambe(40, -70) : jambe(10, -90), jambeGauche: versGauche ? jambe(10, -90) : jambe(40, -70),
  brasGauche: bras(versGauche ? 40 : -10, 70), brasDroit: bras(versGauche ? -10 : 40, 70) });

// Burpee complet : mains fixes au sol de l'accroupi à la pompe, puis saut bras en l'air.
const CHEVILLE_BURPEE = { x: 34.8, y: 171 };
const [burpeePlanche, burpeePompe] = pompes(CHEVILLE_BURPEE, SOL_Y - 49.8, 152, 0).map(fixerChevilles);
const burpeeAccroupi: Pose = { ...burpeePlanche, racine: { x: 95, y: 148 }, tronc: 70, tete: -30,
  jambeGauche: jambePied(60, -120, 60), jambeDroite: jambePied(60, -120, 60),
  chevilles: { gauche: { x: 102, y: SOL_Y - 6.5 }, droite: { x: 108, y: SOL_Y - 6.5 } } };
const burpeeSaut: Pose = fixerChevilles({ ...debout(), racine: { x: 104, y: 100 },
  jambeGauche: jambePied(25, -60, -25), jambeDroite: jambePied(25, -60, -25),
  mains: { gauche: { x: 112, y: 10 }, droite: { x: 118, y: 10 } }, brasGauche: bras(0, -30), brasDroit: bras(0, -30) });

const NIVEAUX_SUPERIEURS: Record<string, AnimationFigurine> = {
  'pompe-large': { cles: pompeLarge, dureeCycleMs: 1800 },
  // Quatre secondes pour descendre, quatre pour remonter.
  'pompe-tempo': { cles: pompeClassique, dureeCycleMs: 8000 },
  'pike-pushup': { cles: [vHaut, vBas], dureeCycleMs: 1800 },
  'dips-chaise': { cles: [dips({ x: 102, y: 100.6 }, 0), dips({ x: 104, y: 120 }, 6)], dureeCycleMs: 1800,
    accessoire: 'chaise', chaiseX: CHAISE_DIPS },
  'tractions-australiennes': { cles: [tractions(MAIN_TABLE.y + 49.8, 0), tractions(134, 15)], dureeCycleMs: 1800, accessoire: 'table' },
  'superman-tirage': { cles: [
    appuiMains(ventrePlat, 181, 143, 6, -30),
    appuiMains({ ...ventrePlat, tronc: 80, tete: -15 }, 134, 147, 6, -30),
  ], dureeCycleMs: 2000 },
  'squat-pause': { cles: [squatPauseHaut, squatPauseBas, squatPauseBas], dureeCycleMs: 7500 },
  'squat-bulgare': { cles: [bulgare({ x: 120, y: 120 }, 8), bulgare({ x: 112.8, y: 146 }, 18)], dureeCycleMs: 2000,
    accessoire: 'chaise', chaiseX: CHAISE_BULGARE },
  'planche-epaules': { cles: [plancheToucher, toucheEpaule(true), plancheToucher, toucheEpaule(false)], dureeCycleMs: 2000 },
  'hollow-hold': { cles: [
    { ...debout(), racine: { x: 110, y: 172 }, tronc: -70, tete: 10, dos: 4, brasGauche: bras(-175), brasDroit: bras(-175),
      jambeGauche: jambePied(112, 0, 122), jambeDroite: jambePied(112, 0, 122) },
    { ...debout(), racine: { x: 110, y: 172 }, tronc: -72, tete: 10, dos: 4.5, poitrine: .4, brasGauche: bras(-177), brasDroit: bras(-177),
      jambeGauche: jambePied(110, 0, 120), jambeDroite: jambePied(110, 0, 120) },
  ], dureeCycleMs: 6000 },
  'releves-jambes': { cles: [
    { ...debout(), racine: { x: 104, y: 171 }, tronc: -90, brasGauche: bras(-5), brasDroit: bras(-5),
      jambeGauche: jambePied(98, 0, 143), jambeDroite: jambePied(98, 0, 143) },
    { ...debout(), racine: { x: 104, y: 171 }, tronc: -90, brasGauche: bras(-5), brasDroit: bras(-5),
      jambeGauche: jambePied(178, 0, 223), jambeDroite: jambePied(178, 0, 223) },
  ], dureeCycleMs: 2000 },
  'pompe-diamant': { cles: pompeDiamant, dureeCycleMs: 1800 },
  'pompe-archer': { cles: [archerHaut, archerBas], dureeCycleMs: 2000 },
  'pompe-pieds-sureleves': { cles: pompeDeclinee, dureeCycleMs: 1800, accessoire: 'chaise', chaiseX: CHAISE_DECLINEE },
  'pompe-hindoue': { cles: [hindoueV, hindouePlongee, cobra], dureeCycleMs: 2000 },
  'pompe-spiderman': { cles: [spiderHaut, genouAuCoude(spiderBas, true), spiderHaut, genouAuCoude(spiderBas, false)], dureeCycleMs: 2000 },
  // Planche penchée : on tient, seul le souffle bouge.
  'planche-penchee': { cles: (() => {
    const cheville = { x: 30, y: 168 };
    const epaules = epaulesA(cheville, SOL_Y - Math.sqrt(49.8 ** 2 - 22 ** 2));
    const pose = appuiMains(gaine(cheville, epaules, piedSol(cheville.y)), epaules.x + 3 - 22);
    return [pose, { ...pose, poitrine: .5 }];
  })(), dureeCycleMs: 6000 },
  'gainage-commando': { cles: [surCoudes, uneMain, surMains, uneMain], dureeCycleMs: 2000 },
  'fentes-sautees': { cles: [fenteDroite, envol(true), fenteGauche, envol(false)], dureeCycleMs: 2000 },
  'burpee-complet': { cles: [burpeeAccroupi, burpeePlanche, burpeePompe, burpeePlanche, burpeeAccroupi, burpeeSaut], dureeCycleMs: 3600 },
};

// Circuits : variantes indépendantes des tempos et clés des exercices existants.
const CHAISE_INCLINEE = 143;
const pompeInclinee = [106, 124].map(y => appuiMains(
  gaine(CHEVILLE_POMPE, epaulesA(CHEVILLE_POMPE, y), piedSol(CHEVILLE_POMPE.y)),
  155, CHAISE.assise - RAYONS.main));
const pompeGenoux = [60, 77].map(inclinaison => {
  // Pivot autour des genoux ; tibias horizontaux posés derrière eux.
  const pose: Pose = { ...debout(), tronc: inclinaison,
    racine: { x: 68 + 34 * Math.sin(rad(inclinaison)), y: SOL_Y - 34 * Math.cos(rad(inclinaison)) },
    jambeGauche: jambe(-inclinaison, inclinaison - 90, -90),
    jambeDroite: jambe(-inclinaison, inclinaison - 90, -90) };
  return appuiMains(pose, 145);
});
// Les cuisses sont plus courtes que les bras : un dos plat incliné de 20°
// laisse les mains sous les épaules et le coude porteur presque tendu.
const birdBase: Pose = { ...quatrePattes, racine: { x: 88, y: SOL_Y - LONGUEURS.cuisse }, tete: 55, dos: 0 };
const birdPoints = calculerPoints(birdBase);
const birdRepos = appuiMains(birdBase, birdPoints.epauleDroite.x);
const birdExtension = (gauche: boolean): Pose => {
  // Bras complètement allongé, légèrement au-dessus du dos ; regard au sol
  // pour dégager le visage. La jambe opposée prolonge exactement le tronc.
  const epaule = gauche ? birdPoints.epauleGauche : birdPoints.epauleDroite;
  const longueur = LONGUEURS.bras + LONGUEURS.avantBras;
  const main = { x: epaule.x + longueur * Math.cos(rad(40)), y: epaule.y - longueur * Math.sin(rad(40)) };
  const jambeLevee = jambe(-birdBase.tronc, 0, birdBase.tronc - 180);
  return { ...birdRepos,
    mains: { gauche: gauche ? main : birdRepos.mains!.gauche,
      droite: gauche ? birdRepos.mains!.droite : main },
    jambeGauche: gauche ? birdRepos.jambeGauche : jambeLevee,
    jambeDroite: gauche ? jambeLevee : birdRepos.jambeDroite };
};
// Entre appui et extension, la main passe par un point avancé et bas (bras presque tendu, main juste au-dessus du sol)
// plutôt que par la ligne droite, qui la ferait balayer le visage. La jambe est à mi-course.
const birdMilieu = (gauche: boolean): Pose => {
  const epaule = gauche ? birdPoints.epauleGauche : birdPoints.epauleDroite;
  const longueur = LONGUEURS.bras + LONGUEURS.avantBras;
  const dy = SOL_Y - 9.4 - epaule.y;
  const main = { x: epaule.x + Math.sqrt(longueur * longueur - dy * dy), y: epaule.y + dy };
  const pose = interpolerPose(birdRepos, birdExtension(gauche), .5);
  return { ...pose, mains: { gauche: gauche ? main : birdRepos.mains!.gauche, droite: gauche ? birdRepos.mains!.droite : main } };
};
const pontUneJambe = [-90, -115].map(tronc => {
  const racine = { x: 50 - 42 * Math.sin(rad(tronc)), y: 164 + 42 * Math.cos(rad(tronc)) };
  return appuiMains({ ...pontBas, racine, tronc, tete: -90 - tronc,
    jambeGauche: jambe(160, 0), jambeDroite: jambe(125, -160),
    chevilles: { gauche: { x: racine.x - 3 + 68 * Math.sin(rad(160)), y: racine.y + 68 * Math.cos(rad(160)) },
      droite: { x: 133, y: SOL_Y } } }, 98);
});
// Vue de face couchée (projection du dessus) : les deux bras dessinent réellement Y puis T.
// De profil, leur balayage ressemblait à une élévation verticale des bras.
const tirageYT: Pose[] = [0, 1].map(t => ({ ...ventreSol, vue: 'face', racine: { x: 98, y: 100 },
  brasGauche: bras(215 + 55 * t), brasDroit: bras(145 - 55 * t),
  jambeGauche: jambe(-90, 0, -90), jambeDroite: jambe(-90, 0, -90) }));

export const POSES_PAR_EXERCICE: Record<string, AnimationFigurine> = {
  'pompe-inclinee': { cles: pompeInclinee, dureeCycleMs: 2600, accessoire: 'chaise', chaiseX: CHAISE_INCLINEE, chaiseDossierDroite: true },
  'pompe-genoux': { cles: pompeGenoux, dureeCycleMs: 2600 },
  'pompe-classique': { cles: pompeClassique, dureeCycleMs: 2600 },
  'tirage-yt': { cles: tirageYT, dureeCycleMs: 3600 },
  'bird-dog': { cles: [birdExtension(false), birdMilieu(false), birdRepos, birdMilieu(true), birdExtension(true), birdMilieu(true), birdRepos, birdMilieu(false)], dureeCycleMs: 4000 },
  'pont-une-jambe': { cles: pontUneJambe, dureeCycleMs: 3600 },
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
  ...NIVEAUX_SUPERIEURS,
};

export function posesPour(exerciceId: string): AnimationFigurine {
  return Object.prototype.hasOwnProperty.call(POSES_PAR_EXERCICE, exerciceId) ? POSES_PAR_EXERCICE[exerciceId] : REPLI;
}
