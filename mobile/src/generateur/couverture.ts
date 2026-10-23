import { DUREES, NOMS_NIVEAU, NOMS_OBJECTIF, type Duree, type Effet, type Exercice, type Niveau } from '../catalogue/types';
import { apparier } from './appariement';
import { cibleDePhase, type Cible } from './cibles';
import { exercicesPossibles } from './filtres';
import { STRUCTURE_PAR_DUREE } from './structure';
import { OBJECTIFS_GENERES, type ObjectifGenere, type Phase } from './types';

export interface Manque {
  objectif: ObjectifGenere;
  duree: Duree;
  phase: Phase;
  cible: Cible;
  // Places de la phase remplies par des exercices idéaux, distincts de ceux des autres phases.
  disponibles: number;
  besoin: number;
}

const ORDRE_PHASES: readonly Phase[] = ['mise_en_route', 'coeur', 'retour_au_calme'];

// Places non remplies d'une séance, par phase. Vide si le niveau 0 suffit à toute la séance.
// En tours, une place du cœur est un poste : ses exercices sont rejoués à chaque tour.
function manquesDeSeance(possibles: Exercice[], objectif: ObjectifGenere, niveau: Niveau, duree: Duree): Manque[] {
  const plans = STRUCTURE_PAR_DUREE[duree];
  const places = plans.flatMap((plan) =>
    Array.from({ length: plan.nombre }, () => cibleDePhase(plan.phase, objectif, niveau)),
  );
  const remplies = apparier(places, possibles);

  const manques: Manque[] = [];
  let debut = 0;
  for (const plan of plans) {
    const disponibles = remplies.slice(debut, debut + plan.nombre).filter(Boolean).length;
    debut += plan.nombre;
    if (disponibles < plan.nombre) {
      const cible = cibleDePhase(plan.phase, objectif, niveau);
      manques.push({ objectif, duree, phase: plan.phase, cible, disponibles, besoin: plan.nombre });
    }
  }
  return manques;
}

// Analyse déterministe, sans tirage, pour une intensité (niveau). Ordre : objectif, phase, durée.
export function analyserCouverture(catalogue: Exercice[], niveau: Niveau = 1): Manque[] {
  const manques: Manque[] = [];
  for (const objectif of OBJECTIFS_GENERES) {
    const possibles = exercicesPossibles(catalogue, objectif, niveau);
    const parDuree = DUREES.flatMap((duree) => manquesDeSeance(possibles, objectif, niveau, duree));
    for (const phase of ORDRE_PHASES) {
      manques.push(...parDuree.filter((manque) => manque.phase === phase));
    }
  }
  return manques;
}

// Combinaison dont une partie du cœur n'a pas d'exercice idéal du niveau exact : le générateur la rabat sur un niveau inférieur.
// Seulement pour les calories : les étirements n'ont que des exercices de niveau 1, le niveau ne fait qu'y plafonner.
export interface Rabattement {
  objectif: 'calories';
  duree: Duree;
  // Places du cœur qui peuvent recevoir un exercice idéal de ce niveau exact.
  auNiveau: number;
  places: number;
}

// Ordre : durée.
export function analyserRabattements(catalogue: Exercice[], niveau: Niveau): Rabattement[] {
  const objectif = 'calories';
  const duNiveau = exercicesPossibles(catalogue, objectif, niveau).filter((e) => e.niveau === niveau);
  const rabattements: Rabattement[] = [];
  for (const duree of DUREES) {
    const plan = STRUCTURE_PAR_DUREE[duree].find((p) => p.phase === 'coeur');
    if (plan === undefined) continue;
    const places = Array.from({ length: plan.nombre }, () => cibleDePhase('coeur', objectif, niveau));
    const auNiveau = apparier(places, duNiveau).filter(Boolean).length;
    if (auNiveau < plan.nombre) rabattements.push({ objectif, duree, auNiveau, places: plan.nombre });
  }
  return rabattements;
}

export function formaterRabattements(rabattements: Rabattement[], niveau: Niveau): string {
  const nom = `Intensité ${NOMS_NIVEAU[niveau]}`;
  if (rabattements.length === 0) return `${nom} : cœur entièrement au niveau.`;
  return [
    `${nom} : ${rabattements.length} combinaison(s) rabattue(s) :`,
    ...rabattements.map(
      (r) => `- ${NOMS_OBJECTIF[r.objectif]}, ${r.duree} min : ${r.auNiveau}/${r.places} places au niveau, le reste est rabattu`,
    ),
  ].join('\n');
}

const LIBELLES_PHASE: Record<Phase, string> = {
  mise_en_route: 'mise en route',
  coeur: 'cœur',
  retour_au_calme: 'retour au calme',
};

const LIBELLES_EFFET: Record<Effet, string> = {
  mobilite: 'mobilité',
  detente: 'détente',
  energie: 'énergie',
};

const LIBELLES_OBJECTIF: Record<ObjectifGenere, string> = {
  calories: 'cardio',
  etirements: 'étirements',
};

function libelleCible(cible: Cible): string {
  const intensite =
    cible.intensiteMin === cible.intensiteMax
      ? `intensité ${cible.intensiteMin}`
      : `intensité ${cible.intensiteMin}-${cible.intensiteMax}`;
  const vise = 'effet' in cible ? LIBELLES_EFFET[cible.effet] : LIBELLES_OBJECTIF[cible.objectif];
  return `${vise}, ${intensite}`;
}

// Les durées voisines d'une même phase partagent une ligne quand elles ont autant d'exercices disponibles.
function memeLigne(a: Manque, b: Manque): boolean {
  return a.objectif === b.objectif && a.phase === b.phase && a.disponibles === b.disponibles;
}

export function formaterRapport(manques: Manque[]): string {
  if (manques.length === 0) return 'Catalogue complet : toutes les combinaisons sont idéales.';
  const lignes: Manque[][] = [];
  for (const manque of manques) {
    const derniere = lignes[lignes.length - 1];
    if (derniere !== undefined && memeLigne(derniere[0], manque)) derniere.push(manque);
    else lignes.push([manque]);
  }
  return [
    `${lignes.length} manque(s) à combler :`,
    ...lignes.map((ligne) => {
      const { objectif, phase, cible, disponibles } = ligne[0];
      const details = ligne.map((manque) => `${manque.besoin} en ${manque.duree} min`).join(', ');
      return `- ${NOMS_OBJECTIF[objectif]}, ${LIBELLES_PHASE[phase]} (${libelleCible(cible)}) : ${disponibles} disponible(s), il en faut ${details}`;
    }),
  ].join('\n');
}
