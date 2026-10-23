import type { Contraintes, Exercice } from '../catalogue/types';

// Exercice neutre pour les tests : chaque test surcharge seulement ce qui l’intéresse.
// Sans objectif précisé : « calories » pour un exercice d'énergie, « étirements » sinon.
export function fabriquerExercice(surcharge: Partial<Exercice> = {}): Exercice {
  const effets = surcharge.effets ?? ['energie'];
  return {
    id: 'exercice-test',
    nom: 'Exercice test',
    consigne: 'Consigne de test.',
    animation: 'test.json',
    sol: false,
    sauts: false,
    transpiration: 'faible',
    espace: 'sur_place',
    effets: ['energie'],
    intensite: 2,
    zone: 'global',
    bilateral: false,
    niveau: 1,
    objectifs: effets.includes('energie') ? ['calories'] : ['etirements'],
    ...surcharge,
  };
}

export const SANS_CONTRAINTE: Contraintes = {
  tenue: 'sport',
  bruit: 'normal',
  espace: 'un_peu',
  sol: true,
};
