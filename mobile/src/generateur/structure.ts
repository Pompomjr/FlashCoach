import type { Duree } from '../catalogue/types';
import type { Phase } from './types';

export interface PlanPhase {
  phase: Phase;
  nombre: number;
  transitionS: number;
  effortS: number;
}

// Chaque durée est remplie à la seconde près : 180, 300 et 600 s.
export const STRUCTURE_PAR_DUREE: Record<Duree, PlanPhase[]> = {
  3: [
    { phase: 'mise_en_route', nombre: 1, transitionS: 5, effortS: 25 },
    { phase: 'coeur', nombre: 2, transitionS: 10, effortS: 40 },
    { phase: 'retour_au_calme', nombre: 2, transitionS: 5, effortS: 20 },
  ],
  5: [
    { phase: 'mise_en_route', nombre: 2, transitionS: 5, effortS: 20 },
    { phase: 'coeur', nombre: 4, transitionS: 10, effortS: 40 },
    { phase: 'retour_au_calme', nombre: 2, transitionS: 5, effortS: 20 },
  ],
  10: [
    { phase: 'mise_en_route', nombre: 3, transitionS: 5, effortS: 25 },
    { phase: 'coeur', nombre: 8, transitionS: 10, effortS: 45 },
    { phase: 'retour_au_calme', nombre: 2, transitionS: 5, effortS: 30 },
  ],
};
