import { CONTRAINTES_MAISON } from '../catalogue/contextes';
import type { Contraintes, Exercice, Niveau } from '../catalogue/types';
import type { ObjectifGenere } from './types';

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

// Exercices dont dispose une séance générée : contraintes « maison », plafond de niveau, et pour les étirements,
// seulement des exercices d'étirement, à toutes les phases et même au dernier recours.
export function exercicesPossibles(catalogue: Exercice[], objectif: ObjectifGenere, niveau: Niveau): Exercice[] {
  return filtrerCatalogue(catalogue, CONTRAINTES_MAISON).filter(
    (exercice) => exercice.niveau <= niveau && (objectif !== 'etirements' || exercice.objectifs.includes('etirements')),
  );
}
