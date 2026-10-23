import { NIVEAUX } from '../catalogue/types';
import { fabriquerExercice } from '../test-utils/fabrique';
import { cibleDePhase, correspond, type Cible } from './cibles';

describe('cibleDePhase', () => {
  it('met en route en mobilité douce, quels que soient l’objectif et le niveau', () => {
    expect(cibleDePhase('mise_en_route', 'calories', 3)).toEqual({ effet: 'mobilite', intensiteMin: 1, intensiteMax: 1 });
    expect(cibleDePhase('mise_en_route', 'etirements', 1)).toEqual({ effet: 'mobilite', intensiteMin: 1, intensiteMax: 1 });
  });

  it('termine en détente douce, quels que soient l’objectif et le niveau', () => {
    expect(cibleDePhase('retour_au_calme', 'calories', 2)).toEqual({ effet: 'detente', intensiteMin: 1, intensiteMax: 1 });
    expect(cibleDePhase('retour_au_calme', 'etirements', 3)).toEqual({ effet: 'detente', intensiteMin: 1, intensiteMax: 1 });
  });

  it('règle le cœur « calories » selon l’intensité : Léger 1-2, Moyen 2-3, Lourd 3', () => {
    expect(cibleDePhase('coeur', 'calories', 1)).toEqual({ objectif: 'calories', intensiteMin: 1, intensiteMax: 2 });
    expect(cibleDePhase('coeur', 'calories', 2)).toEqual({ objectif: 'calories', intensiteMin: 2, intensiteMax: 3 });
    expect(cibleDePhase('coeur', 'calories', 3)).toEqual({ objectif: 'calories', intensiteMin: 3, intensiteMax: 3 });
  });

  it('garde le cœur « étirements » en intensité 1-2 à tous les niveaux', () => {
    for (const niveau of NIVEAUX) {
      expect(cibleDePhase('coeur', 'etirements', niveau)).toEqual({ objectif: 'etirements', intensiteMin: 1, intensiteMax: 2 });
    }
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

  it('assouplit l’intensité vers le bas au niveau 1, mais garde l’effet', () => {
    const tropDoux = fabriquerExercice({ effets: ['energie'], intensite: 1 });
    expect(correspond(tropDoux, cible, 1)).toBe(true);
    expect(correspond(autreEffet, cible, 1)).toBe(false);
  });

  it('ne dépasse jamais l’intensité maximale de la cible, à aucun niveau d’assouplissement', () => {
    for (const palier of [0, 1, 2, 3, 4] as const) {
      expect(correspond(tropIntense, cible, palier)).toBe(false);
    }
  });

  it('assouplit aussi l’effet à partir du niveau 2', () => {
    expect(correspond(autreEffet, cible, 2)).toBe(true);
    expect(correspond(autreEffet, cible, 3)).toBe(true);
  });

  it('ne donne jamais d’énergie à une cible calme avant le niveau 4', () => {
    const calme: Cible = { effet: 'detente', intensiteMin: 1, intensiteMax: 1 };
    const energie = fabriquerExercice({ effets: ['energie'], intensite: 1 });
    const mobilite = fabriquerExercice({ effets: ['mobilite'], intensite: 1 });
    expect(correspond(mobilite, calme, 2)).toBe(true);
    expect(correspond(energie, calme, 2)).toBe(false);
    expect(correspond(energie, calme, 3)).toBe(false);
    expect(correspond(energie, calme, 4)).toBe(true);
  });
});

describe('correspond : cible d’objectif', () => {
  const calories: Cible = { objectif: 'calories', intensiteMin: 2, intensiteMax: 3 };
  const etirements: Cible = { objectif: 'etirements', intensiteMin: 1, intensiteMax: 2 };
  const cardio = fabriquerExercice({ effets: ['energie'], objectifs: ['calories'], intensite: 2 });
  const cardioDoux = fabriquerExercice({ effets: ['energie'], objectifs: ['calories'], intensite: 1 });
  const renfo = fabriquerExercice({ effets: ['energie'], objectifs: ['masse'], intensite: 2 });
  const etirement = fabriquerExercice({ effets: ['mobilite'], objectifs: ['etirements'], intensite: 1 });

  it('exige l’objectif et l’intensité au niveau 0', () => {
    expect(correspond(cardio, calories, 0)).toBe(true);
    expect(correspond(cardioDoux, calories, 0)).toBe(false);
    expect(correspond(renfo, calories, 0)).toBe(false);
    expect(correspond(etirement, etirements, 0)).toBe(true);
    expect(correspond(cardio, etirements, 0)).toBe(false);
  });

  it('assouplit l’intensité au niveau 1, mais garde l’objectif', () => {
    expect(correspond(cardioDoux, calories, 1)).toBe(true);
    expect(correspond(renfo, calories, 1)).toBe(false);
  });

  it('reste dans l’objectif aux niveaux 2 et 3 ; n’en sort qu’au niveau 4, sans jamais dépasser l’intensité', () => {
    for (const palier of [2, 3] as const) {
      expect(correspond(cardioDoux, calories, palier)).toBe(true);
      expect(correspond(renfo, calories, palier)).toBe(false);
      expect(correspond(etirement, calories, palier)).toBe(false);
    }
    expect(correspond(renfo, calories, 4)).toBe(true);
    expect(correspond(etirement, calories, 4)).toBe(true);
    const tropFort = fabriquerExercice({ effets: ['energie'], objectifs: ['calories'], intensite: 3 });
    expect(correspond(tropFort, etirements, 4)).toBe(false);
    expect(correspond(cardio, etirements, 2)).toBe(false);
    expect(correspond(cardio, etirements, 3)).toBe(false);
    const detente = fabriquerExercice({ effets: ['detente'], objectifs: ['etirements'], intensite: 1 });
    expect(correspond(detente, etirements, 2)).toBe(true);
  });
});
