import { fabriquerExercice } from '../test-utils/fabrique';
import { cibleDePhase, correspond, type Cible } from './cibles';

describe('cibleDePhase', () => {
  it('met en route en mobilité douce, quel que soit le ressenti', () => {
    expect(cibleDePhase('mise_en_route', 'en_forme')).toEqual({ effet: 'mobilite', intensiteMin: 1, intensiteMax: 1 });
  });

  it('termine en détente douce, quel que soit le ressenti', () => {
    expect(cibleDePhase('retour_au_calme', 'mou')).toEqual({ effet: 'detente', intensiteMin: 1, intensiteMax: 1 });
  });

  it('règle le cœur selon le ressenti', () => {
    expect(cibleDePhase('coeur', 'raide')).toEqual({ effet: 'mobilite', intensiteMin: 1, intensiteMax: 2 });
    expect(cibleDePhase('coeur', 'stresse')).toEqual({ effet: 'detente', intensiteMin: 1, intensiteMax: 1 });
    expect(cibleDePhase('coeur', 'mou')).toEqual({ effet: 'energie', intensiteMin: 1, intensiteMax: 2 });
    expect(cibleDePhase('coeur', 'en_forme')).toEqual({ effet: 'energie', intensiteMin: 2, intensiteMax: 3 });
  });
});

describe('correspond', () => {
  const cible: Cible = { effet: 'energie', intensiteMin: 2, intensiteMax: 2 };
  const ideal = fabriquerExercice({ effets: ['energie'], intensite: 2 });
  const tropIntense = fabriquerExercice({ effets: ['energie'], intensite: 3 });
  const autreEffet = fabriquerExercice({ effets: ['detente'], intensite: 1 });

  it('exige l’effet et l’intensité au niveau 0', () => {
    expect(correspond(ideal, cible, 0)).toBe(true);
    expect(correspond(tropIntense, cible, 0)).toBe(false);
    expect(correspond(autreEffet, cible, 0)).toBe(false);
  });

  it('assouplit l’intensité au niveau 1, mais garde l’effet', () => {
    expect(correspond(tropIntense, cible, 1)).toBe(true);
    expect(correspond(autreEffet, cible, 1)).toBe(false);
  });

  it('assouplit aussi l’effet à partir du niveau 2', () => {
    expect(correspond(autreEffet, cible, 2)).toBe(true);
    expect(correspond(autreEffet, cible, 3)).toBe(true);
  });
});
