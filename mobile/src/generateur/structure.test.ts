import { DUREES } from '../catalogue/types';
import { STRUCTURE_PAR_DUREE } from './structure';

describe('STRUCTURE_PAR_DUREE', () => {
  for (const duree of DUREES) {
    it(`remplit exactement ${duree} minutes`, () => {
      const total = STRUCTURE_PAR_DUREE[duree].reduce(
        (somme, plan) => somme + plan.nombre * (plan.transitionS + plan.effortS),
        0,
      );
      expect(total).toBe(duree * 60);
    });

    it(`enchaîne mise en route, cœur et retour au calme en ${duree} minutes`, () => {
      expect(STRUCTURE_PAR_DUREE[duree].map((plan) => plan.phase)).toEqual([
        'mise_en_route',
        'coeur',
        'retour_au_calme',
      ]);
    });
  }

  it('fait un cœur de 4 exercices de 40 s + 10 s de transition en 5 minutes', () => {
    expect(STRUCTURE_PAR_DUREE[5][1]).toEqual({ phase: 'coeur', nombre: 4, transitionS: 10, effortS: 40 });
  });

  it('réduit le cœur à 2 exercices en 3 minutes', () => {
    expect(STRUCTURE_PAR_DUREE[3][1].nombre).toBe(2);
  });

  it('fait deux tours de cœur, soit 8 exercices, en 10 minutes', () => {
    expect(STRUCTURE_PAR_DUREE[10][1].nombre).toBe(8);
  });
});
