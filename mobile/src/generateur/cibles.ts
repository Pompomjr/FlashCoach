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

const CIBLE_MISE_EN_ROUTE: Cible = { effet: 'mobilite', intensiteMin: 1, intensiteMax: 1 };
const CIBLE_RETOUR_AU_CALME: Cible = { effet: 'detente', intensiteMin: 1, intensiteMax: 1 };

export function cibleDePhase(phase: Phase, ressenti: Ressenti): Cible {
  if (phase === 'mise_en_route') return CIBLE_MISE_EN_ROUTE;
  if (phase === 'retour_au_calme') return CIBLE_RETOUR_AU_CALME;
  return CIBLE_PAR_RESSENTI[ressenti];
}

// Ordre d'assouplissement de la fiche technique : l'intensité d'abord (niveau 1), puis l'effet (niveau 2).
export function correspond(exercice: Exercice, cible: Cible, niveau: NiveauAssouplissement): boolean {
  const effetOk = niveau >= 2 || exercice.effets.includes(cible.effet);
  const intensiteOk =
    niveau >= 1 || (exercice.intensite >= cible.intensiteMin && exercice.intensite <= cible.intensiteMax);
  return effetOk && intensiteOk;
}
