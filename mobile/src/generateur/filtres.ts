import type { Contraintes, Exercice } from '../catalogue/types';

// Filtre strict : c'est la promesse de l'app, il n'est jamais assoupli.
export function respecteContraintes(exercice: Exercice, contraintes: Contraintes): boolean {
  if (contraintes.tenue === 'ville' && (exercice.transpiration !== 'faible' || exercice.sol)) return false;
  if (contraintes.bruit === 'silencieux' && exercice.sauts) return false;
  if (contraintes.espace === 'sur_place' && exercice.espace !== 'sur_place') return false;
  if (!contraintes.sol && exercice.sol) return false;
  return true;
}

export function filtrerCatalogue(catalogue: Exercice[], contraintes: Contraintes): Exercice[] {
  return catalogue.filter((exercice) => respecteContraintes(exercice, contraintes));
}
