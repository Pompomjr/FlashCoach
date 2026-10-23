import { DUREES } from '../catalogue/types';
import { dureePlanS, STRUCTURE_PAR_DUREE } from './structure';

describe('STRUCTURE_PAR_DUREE', () => {
  it('propose 5, 10, 15 et 30 minutes', () => {
    expect(Object.keys(STRUCTURE_PAR_DUREE).map(Number).sort((a, b) => a - b)).toEqual([5, 10, 15, 30]);
  });

  for (const duree of DUREES) {
    it(`remplit exactement ${duree} minutes`, () => {
      const total = STRUCTURE_PAR_DUREE[duree].reduce((somme, plan) => somme + dureePlanS(plan), 0);
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

  it('fait deux tours de cœur, soit 8 exercices, en 10 minutes', () => {
    expect(STRUCTURE_PAR_DUREE[10][1].nombre).toBe(8);
  });

  it('fait en 15 minutes 2 tours d’un cœur de 5 exercices, avec 1 min de repos entre les tours', () => {
    expect(STRUCTURE_PAR_DUREE[15][1]).toEqual({
      phase: 'coeur', nombre: 5, transitionS: 10, effortS: 45, tours: 2, reposEntreToursS: 60,
    });
  });

  it('fait en 30 minutes 4 tours du même cœur de 5 exercices', () => {
    expect(STRUCTURE_PAR_DUREE[30][1]).toEqual({
      phase: 'coeur', nombre: 5, transitionS: 10, effortS: 45, tours: 4, reposEntreToursS: 60,
    });
  });

  it('ne fait de tours que dans le cœur', () => {
    for (const duree of DUREES) {
      for (const plan of STRUCTURE_PAR_DUREE[duree].filter((p) => p.phase !== 'coeur')) {
        expect(plan.tours).toBeUndefined();
      }
    }
  });
});

describe('dureePlanS', () => {
  it('compte les tours et le repos entre eux', () => {
    expect(dureePlanS({ phase: 'coeur', nombre: 5, transitionS: 10, effortS: 45, tours: 4, reposEntreToursS: 60 })).toBe(
      4 * 5 * 55 + 3 * 60,
    );
    expect(dureePlanS({ phase: 'mise_en_route', nombre: 2, transitionS: 5, effortS: 20 })).toBe(50);
  });
});
