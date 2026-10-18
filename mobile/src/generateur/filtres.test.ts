import type { Contraintes } from '../catalogue/types';
import { fabriquerExercice, SANS_CONTRAINTE } from '../test-utils/fabrique';
import { filtrerCatalogue, respecteContraintes } from './filtres';

describe('respecteContraintes', () => {
  it('accepte tout quand rien ne limite', () => {
    const exigeant = fabriquerExercice({ sol: true, sauts: true, transpiration: 'elevee', espace: 'un_peu' });
    expect(respecteContraintes(exigeant, SANS_CONTRAINTE)).toBe(true);
  });

  it('en tenue de ville, refuse ce qui fait transpirer', () => {
    const ville: Contraintes = { ...SANS_CONTRAINTE, tenue: 'ville' };
    expect(respecteContraintes(fabriquerExercice({ transpiration: 'moyenne' }), ville)).toBe(false);
    expect(respecteContraintes(fabriquerExercice({ transpiration: 'faible' }), ville)).toBe(true);
  });

  it('en tenue de ville, refuse le sol même sans transpiration', () => {
    const ville: Contraintes = { ...SANS_CONTRAINTE, tenue: 'ville' };
    expect(respecteContraintes(fabriquerExercice({ transpiration: 'faible', sol: true }), ville)).toBe(false);
  });

  it('en silencieux, refuse les sauts', () => {
    const silencieux: Contraintes = { ...SANS_CONTRAINTE, bruit: 'silencieux' };
    expect(respecteContraintes(fabriquerExercice({ sauts: true }), silencieux)).toBe(false);
    expect(respecteContraintes(fabriquerExercice({ sauts: false }), silencieux)).toBe(true);
  });

  it('sur place, refuse ce qui demande de la place', () => {
    const surPlace: Contraintes = { ...SANS_CONTRAINTE, espace: 'sur_place' };
    expect(respecteContraintes(fabriquerExercice({ espace: 'un_peu' }), surPlace)).toBe(false);
    expect(respecteContraintes(fabriquerExercice({ espace: 'sur_place' }), surPlace)).toBe(true);
  });

  it('sans sol, refuse les exercices au sol', () => {
    const sansSol: Contraintes = { ...SANS_CONTRAINTE, sol: false };
    expect(respecteContraintes(fabriquerExercice({ sol: true }), sansSol)).toBe(false);
    expect(respecteContraintes(fabriquerExercice({ sol: false }), sansSol)).toBe(true);
  });
});

describe('filtrerCatalogue', () => {
  it('ne garde que les exercices compatibles, dans le même ordre', () => {
    const debout = fabriquerExercice({ id: 'debout', sol: false });
    const auSol = fabriquerExercice({ id: 'au-sol', sol: true });
    const deboutBis = fabriquerExercice({ id: 'debout-bis', sol: false });
    const resultat = filtrerCatalogue([debout, auSol, deboutBis], { ...SANS_CONTRAINTE, sol: false });
    expect(resultat.map((ex) => ex.id)).toEqual(['debout', 'debout-bis']);
  });
});
