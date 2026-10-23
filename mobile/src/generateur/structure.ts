import type { Duree } from '../catalogue/types';
import type { Phase } from './types';

export interface PlanPhase {
  phase: Phase;
  // Exercices distincts de la phase ; en tours, ils sont rejoués dans le même ordre à chaque tour.
  nombre: number;
  transitionS: number;
  effortS: number;
  // Cœur de 15 et 30 min seulement : nombre de tours, et repos entre deux tours, porté par la transition
  // du premier poste des tours 2 et suivants.
  tours?: number;
  reposEntreToursS?: number;
}

// Chaque durée est remplie à la seconde près : 300, 600, 900 et 1800 s.
export const STRUCTURE_PAR_DUREE: Record<Duree, PlanPhase[]> = {
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
  // 140 + 2 × 275 + 60 + 150 = 900 s.
  15: [
    { phase: 'mise_en_route', nombre: 4, transitionS: 5, effortS: 30 },
    { phase: 'coeur', nombre: 5, transitionS: 10, effortS: 45, tours: 2, reposEntreToursS: 60 },
    { phase: 'retour_au_calme', nombre: 3, transitionS: 5, effortS: 45 },
  ],
  // 270 + 4 × 275 + 3 × 60 + 250 = 1800 s.
  30: [
    { phase: 'mise_en_route', nombre: 6, transitionS: 5, effortS: 40 },
    { phase: 'coeur', nombre: 5, transitionS: 10, effortS: 45, tours: 4, reposEntreToursS: 60 },
    { phase: 'retour_au_calme', nombre: 5, transitionS: 5, effortS: 45 },
  ],
};

export function dureePlanS(plan: PlanPhase): number {
  const tours = plan.tours ?? 1;
  return tours * plan.nombre * (plan.transitionS + plan.effortS) + (tours - 1) * (plan.reposEntreToursS ?? 0);
}
