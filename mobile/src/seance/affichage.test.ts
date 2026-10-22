import type { Bloc } from '../generateur/types';
import { fabriquerExercice } from '../test-utils/fabrique';
import { coteCourant, formaterTemps, LIBELLE_ECHAUFFEMENT, libelleEtape, minutesEffectuees } from './affichage';
import { creerEtatInitial, lecteur } from './lecteur';

const blocDeuxCotes: Bloc = { exercice: fabriquerExercice({ bilateral: true }), phase: 'coeur', transitionS: 10, effortS: 40 };
const blocSimple: Bloc = { exercice: fabriquerExercice({ bilateral: false }), phase: 'coeur', transitionS: 10, effortS: 40 };

describe('coteCourant', () => {
  it('fait le côté gauche puis le côté droit pendant l’effort', () => {
    const effort = lecteur(creerEtatInitial([blocDeuxCotes]), { type: 'avancer', ms: 10000 });
    expect(coteCourant(lecteur(effort, { type: 'avancer', ms: 10000 }))).toBe('gauche');
    expect(coteCourant(lecteur(effort, { type: 'avancer', ms: 20000 }))).toBe('droite');
  });

  it('ne parle pas de côté pendant la transition ni pour un exercice simple', () => {
    expect(coteCourant(creerEtatInitial([blocDeuxCotes]))).toBeNull();
    expect(coteCourant(lecteur(creerEtatInitial([blocSimple]), { type: 'avancer', ms: 15000 }))).toBeNull();
  });

  it('impose le côté du bloc pendant tout l’effort, et aucun en transition', () => {
    for (const cote of ['gauche', 'droite'] as const) {
      const bloc: Bloc = { ...blocDeuxCotes, cote };
      const transition = creerEtatInitial([bloc]);
      const effort = lecteur(transition, { type: 'avancer', ms: 10000 });
      expect(coteCourant(transition)).toBeNull();
      expect(coteCourant(effort)).toBe(cote);
      expect(coteCourant(lecteur(effort, { type: 'avancer', ms: 20000 }))).toBe(cote);
      expect(coteCourant(lecteur(effort, { type: 'avancer', ms: 39000 }))).toBe(cote);
    }
  });
});

describe('libelleEtape', () => {
  it('annonce le tour quand le bloc en fait partie', () => {
    expect(libelleEtape({ ...blocSimple, tour: { numero: 2, total: 4 } })).toBe('Tour 2 / 4');
    expect(libelleEtape({ ...blocSimple, tour: { numero: 1, total: 3 } })).toBe('Tour 1 / 3');
  });

  it('reprend le libellé de la phase sinon', () => {
    expect(libelleEtape({ ...blocSimple, phase: 'coeur' })).toBe('On y va');
    expect(libelleEtape({ ...blocSimple, phase: 'mise_en_route' })).toBe('Mise en route');
    expect(libelleEtape({ ...blocSimple, phase: 'retour_au_calme' })).toBe('Retour au calme');
  });

  it('fournit le libellé de l’échauffement des circuits', () => {
    expect(LIBELLE_ECHAUFFEMENT).toBe('Échauffement');
  });
});

describe('formaterTemps', () => {
  it('affiche minutes et secondes, arrondies à la seconde supérieure', () => {
    expect(formaterTemps(21000)).toBe('0:21');
    expect(formaterTemps(20001)).toBe('0:21');
    expect(formaterTemps(65000)).toBe('1:05');
    expect(formaterTemps(0)).toBe('0:00');
  });
});

describe('minutesEffectuees', () => {
  it('arrondit à la minute la plus proche', () => {
    expect(minutesEffectuees(299000)).toBe(5);
    expect(minutesEffectuees(90000)).toBe(2);
    expect(minutesEffectuees(20000)).toBe(0);
  });
});
