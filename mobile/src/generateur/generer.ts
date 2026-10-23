import { CONTRAINTES_MAISON } from '../catalogue/contextes';
import type { Exercice } from '../catalogue/types';
import { choisirAuHasard, creerAleatoire } from './aleatoire';
import { tailleAppariement } from './appariement';
import { cibleDePhase, correspond, type Cible } from './cibles';
import { exercicesPossibles } from './filtres';
import { STRUCTURE_PAR_DUREE, type PlanPhase } from './structure';
import type { Bloc, NiveauAssouplissement, ParametresSeance, Seance } from './types';

const PALIERS: NiveauAssouplissement[] = [0, 1, 2, 3, 4];

interface Situation {
  precedent: Exercice | undefined;
  cible: Cible;
  // Cibles des places restantes, après celle-ci, et exercices encore inutilisés pour les remplir.
  placesAVenir: Cible[];
  libres: Exercice[];
  // Cibles des phases suivantes : à appariement égal, on évite encore de leur prendre un exercice idéal.
  ciblesAVenir: Cible[];
  recents: Set<string>;
  // Niveau de la séance pour une place du cœur, null ailleurs : mise en route et retour au calme n'ont pas de préférence.
  niveauVise: number | null;
}

// 0 : idéal ; 1 : intensité hors plage ; 2 : autre effet accepté ; 3 : hors famille.
function distance(exercice: Exercice, cible: Cible): number {
  if (correspond(exercice, cible, 0)) return 0;
  if (correspond(exercice, cible, 1)) return 1;
  if (correspond(exercice, cible, 2)) return 2;
  return 3;
}

// Places restantes qui ne pourront plus être idéales si l'on prend cet exercice.
// Choisir à chaque place un exercice sans perte garantit le niveau 0 dès qu'un appariement complet existe.
function perte(exercice: Exercice, situation: Situation, appariementActuel: () => number): number {
  const { placesAVenir, libres } = situation;
  if (!libres.includes(exercice) || !placesAVenir.some((aVenir) => correspond(exercice, aVenir, 0))) return 0;
  return appariementActuel() - tailleAppariement(placesAVenir, libres.filter((libre) => libre !== exercice));
}

// Clé de préférence, comparée dans l'ordre : plus petit = mieux.
function cle(exercice: Exercice, situation: Situation, appariementActuel: () => number): number[] {
  const { precedent, cible, ciblesAVenir, recents } = situation;
  return [
    precedent !== undefined && precedent.id === exercice.id ? 1 : 0,
    distance(exercice, cible),
    perte(exercice, situation, appariementActuel),
    situation.niveauVise === null ? 0 : situation.niveauVise - exercice.niveau,
    recents.has(exercice.id) ? 1 : 0,
    ciblesAVenir.some((aVenir) => correspond(exercice, aVenir, 0)) ? 1 : 0,
    precedent !== undefined && precedent.zone === exercice.zone ? 1 : 0,
  ];
}

function comparerCles(a: number[], b: number[]): number {
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}

function departager(candidats: Exercice[], situation: Situation, alea: () => number): Exercice {
  // Calculé au plus une fois, et seulement si un candidat est idéal pour une place restante.
  let taille: number | undefined;
  const appariementActuel = () => (taille ??= tailleAppariement(situation.placesAVenir, situation.libres));
  const cles = candidats.map((exercice) => cle(exercice, situation, appariementActuel));
  const meilleure = cles.reduce((min, courante) => (comparerCles(courante, min) < 0 ? courante : min));
  return choisirAuHasard(
    candidats.filter((_, index) => comparerCles(cles[index], meilleure) === 0),
    alea,
  );
}

// Déplie les exercices choisis pour une phase : un bloc chacun, ou, en tours, le même enchaînement rejoué
// à chaque tour, le repos entre deux tours étant porté par la transition du premier poste.
function deplier(plan: PlanPhase, exercices: Exercice[]): Bloc[] {
  const { phase, transitionS, effortS } = plan;
  if (plan.tours === undefined) return exercices.map((exercice) => ({ exercice, phase, transitionS, effortS }));
  const total = plan.tours;
  return Array.from({ length: total }, (_, i) => i + 1).flatMap((numero) =>
    exercices.map((exercice, index) => ({
      exercice,
      phase,
      transitionS: index === 0 && numero > 1 ? (plan.reposEntreToursS ?? 0) + transitionS : transitionS,
      effortS,
      tour: { numero, total },
    })),
  );
}

export function genererSeance(params: ParametresSeance, catalogue: Exercice[]): Seance {
  // 1. Filtrer : les contraintes « maison », le plafond de niveau et l'objectif étirements ne sont jamais assouplis.
  const niveau = params.niveau ?? 1;
  const compatibles = exercicesPossibles(catalogue, params.objectif, niveau);
  if (compatibles.length === 0) {
    throw new Error(`Aucun exercice compatible avec l’objectif ${params.objectif} au niveau ${niveau}`);
  }

  const alea = creerAleatoire(params.graine);
  const recents = new Set(params.exclure ?? []);
  const utilises = new Set<string>();
  // Un exercice par place ; les tours rejouent ensuite les places du cœur.
  const choisis: Exercice[] = [];
  const blocs: Bloc[] = [];
  let assouplissement: NiveauAssouplissement = 0;
  const structure = STRUCTURE_PAR_DUREE[params.duree];
  const cibleDuPlan = (plan: PlanPhase) => cibleDePhase(plan.phase, params.objectif, niveau);
  const places = structure.flatMap((plan) => Array.from({ length: plan.nombre }, () => cibleDuPlan(plan)));

  structure.forEach((plan, indexPhase) => {
    const cible = cibleDuPlan(plan);
    const ciblesAVenir = structure.slice(indexPhase + 1).map(cibleDuPlan);
    const choisisDuPlan: Exercice[] = [];
    for (let i = 0; i < plan.nombre; i++) {
      const precedent = choisis.length > 0 ? choisis[choisis.length - 1] : undefined;
      const placesAVenir = places.slice(choisis.length + 1);
      const libres = compatibles.filter((exercice) => !utilises.has(exercice.id));
      let place = false;
      // 2-3. Classer selon la cible et choisir, en assouplissant niveau par niveau.
      for (const palier of PALIERS) {
        const candidats = compatibles.filter(
          (exercice) => (palier >= 3 || !utilises.has(exercice.id)) && correspond(exercice, cible, palier),
        );
        if (candidats.length === 0) continue;
        const exercice = departager(
          candidats,
          { precedent, cible, placesAVenir, libres, ciblesAVenir, recents, niveauVise: plan.phase === 'coeur' ? niveau : null },
          alea,
        );
        utilises.add(exercice.id);
        choisis.push(exercice);
        choisisDuPlan.push(exercice);
        if (palier > assouplissement) assouplissement = palier;
        place = true;
        break;
      }
      // Au niveau 4, tout exercice compatible est candidat : on n'arrive ici que si cet invariant est cassé.
      if (!place) throw new Error('Invariant cassé : aucun exercice placé alors que le catalogue est compatible');
    }
    blocs.push(...deplier(plan, choisisDuPlan));
  });

  return {
    objectif: params.objectif,
    contraintes: CONTRAINTES_MAISON,
    duree: params.duree,
    graine: params.graine,
    niveau,
    blocs,
    dureeTotaleS: blocs.reduce((total, bloc) => total + bloc.transitionS + bloc.effortS, 0),
    assouplissement,
  };
}
