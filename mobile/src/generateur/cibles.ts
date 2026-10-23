import type { Effet, Exercice, Intensite, Niveau } from '../catalogue/types';
import type { NiveauAssouplissement, ObjectifGenere, Phase } from './types';

// Une phase calme vise un effet (mobilité, détente) ; le cœur vise l'objectif choisi au départ.
export type Cible =
  | { effet: Effet; intensiteMin: Intensite; intensiteMax: Intensite }
  | { objectif: ObjectifGenere; intensiteMin: Intensite; intensiteMax: Intensite };

// Calories : l'intensité suit le niveau choisi (Léger 1-2, Moyen 2-3, Lourd 3).
// Étirements : 1-2 à tous les niveaux, le niveau ne fait que plafonner la difficulté des exercices.
const INTENSITES_CALORIES: Record<Niveau, [Intensite, Intensite]> = { 1: [1, 2], 2: [2, 3], 3: [3, 3] };
const INTENSITES_ETIREMENTS: [Intensite, Intensite] = [1, 2];

export const CIBLE_MISE_EN_ROUTE: Cible = { effet: 'mobilite', intensiteMin: 1, intensiteMax: 1 };
export const CIBLE_RETOUR_AU_CALME: Cible = { effet: 'detente', intensiteMin: 1, intensiteMax: 1 };

export function cibleDuCoeur(objectif: ObjectifGenere, niveau: Niveau): Cible {
  const [intensiteMin, intensiteMax] = objectif === 'calories' ? INTENSITES_CALORIES[niveau] : INTENSITES_ETIREMENTS;
  return { objectif, intensiteMin, intensiteMax };
}

export function cibleDePhase(phase: Phase, objectif: ObjectifGenere, niveau: Niveau): Cible {
  if (phase === 'mise_en_route') return CIBLE_MISE_EN_ROUTE;
  if (phase === 'retour_au_calme') return CIBLE_RETOUR_AU_CALME;
  return cibleDuCoeur(objectif, niveau);
}

const EFFETS_CALMES: readonly Effet[] = ['mobilite', 'detente'];
const TOUS_LES_EFFETS: readonly Effet[] = ['mobilite', 'detente', 'energie'];

// Une cible calme (mobilité, détente, étirements) ne reçoit jamais d'énergie avant le dernier recours (niveau 4).
function effetsAcceptables(cible: Cible): readonly Effet[] {
  const calme = 'effet' in cible ? EFFETS_CALMES.includes(cible.effet) : cible.objectif === 'etirements';
  return calme ? EFFETS_CALMES : TOUS_LES_EFFETS;
}

function vise(exercice: Exercice, cible: Cible): boolean {
  return 'effet' in cible ? exercice.effets.includes(cible.effet) : exercice.objectifs.includes(cible.objectif);
}

// Ordre d'assouplissement : intensité (1), effet dans la même famille (2), répétition (3, géré par le générateur),
// puis tout exercice compatible (4).
export function correspond(exercice: Exercice, cible: Cible, niveau: NiveauAssouplissement): boolean {
  if (niveau >= 4) return true;
  if (niveau >= 2) {
    const acceptables = effetsAcceptables(cible);
    return exercice.effets.some((effet) => acceptables.includes(effet));
  }
  const intensiteOk =
    niveau >= 1 || (exercice.intensite >= cible.intensiteMin && exercice.intensite <= cible.intensiteMax);
  return vise(exercice, cible) && intensiteOk;
}
