import type { Bloc } from '../generateur/types';
import { fabriquerExercice } from '../test-utils/fabrique';
import { creerEtatInitial, lecteur, type EtatLecteur } from './lecteur';

const bloc = (id: string, transitionS: number, effortS: number): Bloc => ({
  exercice: fabriquerExercice({ id }),
  phase: 'coeur',
  transitionS,
  effortS,
});
const BLOCS = [bloc('a', 5, 20), bloc('b', 10, 40)];
const avancer = (etat: EtatLecteur, ms: number) => lecteur(etat, { type: 'avancer', ms });

describe('lecteur', () => {
  it('démarre sur la transition du premier exercice', () => {
    expect(creerEtatInitial(BLOCS)).toMatchObject({ index: 0, etape: 'transition', restantMs: 5000, enPause: false, termine: false, ecouleMs: 0, exercicesFaits: 0 });
  });

  it('refuse une séance vide', () => {
    expect(() => creerEtatInitial([])).toThrow();
  });

  it('passe à l’effort à la fin de la transition', () => {
    expect(avancer(creerEtatInitial(BLOCS), 5000)).toMatchObject({ index: 0, etape: 'effort', restantMs: 20000 });
  });

  it('enchaîne plusieurs étapes en un seul pas', () => {
    expect(avancer(creerEtatInitial(BLOCS), 28000)).toMatchObject({
      index: 1,
      etape: 'transition',
      restantMs: 7000,
      exercicesFaits: 1,
      ecouleMs: 28000,
    });
  });

  it('se termine à la fin du dernier exercice', () => {
    expect(avancer(creerEtatInitial(BLOCS), 75000)).toMatchObject({ termine: true, exercicesFaits: 2, ecouleMs: 75000 });
  });

  it('n’avance pas en pause, puis reprend', () => {
    const enPause = avancer(lecteur(creerEtatInitial(BLOCS), { type: 'pause' }), 3000);
    expect(enPause).toMatchObject({ enPause: true, restantMs: 5000, ecouleMs: 0 });
    expect(avancer(lecteur(enPause, { type: 'reprendre' }), 1000)).toMatchObject({ enPause: false, restantMs: 4000 });
  });

  it('passe au suivant sans compter l’exercice sauté', () => {
    const passe = lecteur(avancer(creerEtatInitial(BLOCS), 6000), { type: 'passer' });
    expect(passe).toMatchObject({ index: 1, etape: 'transition', restantMs: 10000, exercicesFaits: 0 });
    expect(lecteur(passe, { type: 'passer' })).toMatchObject({ termine: true });
  });

  it('relance le minuteur quand on passe pendant une pause', () => {
    const enPause = lecteur(creerEtatInitial(BLOCS), { type: 'pause' });
    expect(lecteur(enPause, { type: 'passer' }).enPause).toBe(false);
  });

  it('s’arrête quand on termine, et plus rien ne bouge ensuite', () => {
    const termine = lecteur(avancer(creerEtatInitial(BLOCS), 6000), { type: 'terminer' });
    expect(termine).toMatchObject({ termine: true, ecouleMs: 6000 });
    expect(avancer(termine, 5000)).toBe(termine);
    expect(lecteur(termine, { type: 'passer' })).toBe(termine);
  });

  it('ignore un pas nul ou négatif', () => {
    const depart = creerEtatInitial(BLOCS);
    expect(avancer(depart, 0)).toBe(depart);
    expect(avancer(depart, -100)).toBe(depart);
  });
});
