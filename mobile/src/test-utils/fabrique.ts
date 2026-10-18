import type { Contraintes, Exercice } from '../catalogue/types';

// Exercice neutre pour les tests : chaque test surcharge seulement ce qui l’intéresse.
export function fabriquerExercice(surcharge: Partial<Exercice> = {}): Exercice {
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
    ...surcharge,
  };
}

export const SANS_CONTRAINTE: Contraintes = {
  tenue: 'sport',
  bruit: 'normal',
  espace: 'un_peu',
  sol: true,
};
