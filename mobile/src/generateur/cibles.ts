import type { Effet, Exercice, Intensite, Ressenti } from '../catalogue/types';
import type { NiveauAssouplissement, Phase } from './types';

export interface Cible {
  effet: Effet;
  intensiteMin: Intensite;
  intensiteMax: Intensite;
}

export const CIBLE_PAR_RESSENTI: Record<Ressenti, Cible> = {
  raide: { effet: 'mobilite', intensiteMin: 1, intensiteMax: 2 },
  stresse: { effet: 'detente', intensiteMin: 1, intensiteMax: 1 },
  mou: { effet: 'energie', intensiteMin: 1, intensiteMax: 2 },
  en_forme: { effet: 'energie', intensiteMin: 2, intensiteMax: 3 },
};

export const CIBLE_MISE_EN_ROUTE: Cible = { effet: 'mobilite', intensiteMin: 1, intensiteMax: 1 };
export const CIBLE_RETOUR_AU_CALME: Cible = { effet: 'detente', intensiteMin: 1, intensiteMax: 1 };

export function cibleDePhase(phase: Phase, ressenti: Ressenti): Cible {
  if (phase === 'mise_en_route') return CIBLE_MISE_EN_ROUTE;
  if (phase === 'retour_au_calme') return CIBLE_RETOUR_AU_CALME;
  return CIBLE_PAR_RESSENTI[ressenti];
}

const EFFETS_CALMES: readonly Effet[] = ['mobilite', 'detente'];
const TOUS_LES_EFFETS: readonly Effet[] = ['mobilite', 'detente', 'energie'];

// Une phase calme (mobilité, détente) ne reçoit jamais d'énergie avant le dernier recours (niveau 4).
function effetsAcceptables(cible: Cible): readonly Effet[] {
  return EFFETS_CALMES.includes(cible.effet) ? EFFETS_CALMES : TOUS_LES_EFFETS;
}

// Ordre d'assouplissement : intensité (1), effet dans la même famille (2), répétition (3, géré par le générateur),
// puis tout exercice compatible (4).
export function correspond(exercice: Exercice, cible: Cible, niveau: NiveauAssouplissement): boolean {
  if (niveau >= 4) return true;
  if (niveau >= 2) {
    const acceptables = effetsAcceptables(cible);
    return exercice.effets.some((effet) => acceptables.includes(effet));
  }
  const effetOk = exercice.effets.includes(cible.effet);
  const intensiteOk =
    niveau >= 1 || (exercice.intensite >= cible.intensiteMin && exercice.intensite <= cible.intensiteMax);
  return effetOk && intensiteOk;
}
