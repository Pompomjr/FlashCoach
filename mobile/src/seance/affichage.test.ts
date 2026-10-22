import type { Bloc } from '../generateur/types';
import { fabriquerExercice } from '../test-utils/fabrique';
import {
  coteCourant,
  formaterTemps,
  LIBELLE_ECHAUFFEMENT,
  libelleEnTete,
  libelleEtape,
  MESSAGE_DERNIER_TOUR,
  messageDernierTour,
  minutesEffectuees,
  texteAnnonce,
  titreExercice,
} from './affichage';
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

// Premier poste d'un tour 2 ou suivant : sa transition est le repos de 1 min 30 plus l'aperçu de 10 s.
const blocApresRepos = (numero: number, total: number): Bloc => ({ ...blocSimple, transitionS: 100, effortS: 30, tour: { numero, total } });
const blocDeTour = (numero: number, total: number): Bloc => ({ ...blocSimple, transitionS: 10, effortS: 30, tour: { numero, total } });

describe('libelleEnTete', () => {
  it('garde les libellés de phase d’une séance flash', () => {
    expect(libelleEnTete({ ...blocSimple, phase: 'mise_en_route' }, false)).toBe('Mise en route');
    expect(libelleEnTete({ ...blocSimple, phase: 'coeur' }, false)).toBe('On y va');
    expect(libelleEnTete({ ...blocSimple, phase: 'retour_au_calme' }, false)).toBe('Retour au calme');
  });

  it('dit « Échauffement », « Tour n / N » puis « Retour au calme » pour un circuit', () => {
    expect(libelleEnTete({ ...blocSimple, phase: 'mise_en_route' }, true)).toBe('Échauffement');
    expect(libelleEnTete(blocDeTour(2, 4), true)).toBe('Tour 2 / 4');
    expect(libelleEnTete({ ...blocSimple, phase: 'retour_au_calme' }, true)).toBe('Retour au calme');
  });
});

describe('titreExercice', () => {
  const nom = blocSimple.exercice.nom;

  it('donne le nom pendant l’effort, « À suivre » pendant la transition', () => {
    expect(titreExercice(blocSimple, 'effort')).toBe(nom);
    expect(titreExercice(blocSimple, 'transition')).toBe(`À suivre : ${nom}`);
    expect(titreExercice(blocDeTour(1, 4), 'transition')).toBe(`À suivre : ${nom}`);
  });

  it('ajoute « Repos » à la transition qui suit un tour terminé', () => {
    expect(titreExercice(blocApresRepos(2, 4), 'transition')).toBe(`Repos · À suivre : ${nom}`);
    expect(titreExercice(blocApresRepos(2, 4), 'effort')).toBe(nom);
  });
});

describe('messageDernierTour', () => {
  const debutDe = (bloc: Bloc) => creerEtatInitial([bloc]);

  it('a le texte attendu, avec une espace insécable avant le point d’exclamation', () => {
    expect(MESSAGE_DERNIER_TOUR).toBe('Dernier tour ! Va au bout si la technique reste propre.');
  });

  it('apparaît dans la transition du premier poste du dernier tour', () => {
    expect(messageDernierTour(debutDe(blocApresRepos(4, 4)))).toBe(MESSAGE_DERNIER_TOUR);
  });

  it('disparaît dès que l’effort commence', () => {
    const effort = lecteur(debutDe(blocApresRepos(4, 4)), { type: 'avancer', ms: 100000 });
    expect(effort.etape).toBe('effort');
    expect(messageDernierTour(effort)).toBeNull();
  });

  it('ne s’affiche ni avant le dernier tour ni sur les autres postes du dernier tour', () => {
    expect(messageDernierTour(debutDe(blocApresRepos(3, 4)))).toBeNull();
    expect(messageDernierTour(debutDe(blocDeTour(4, 4)))).toBeNull();
    expect(messageDernierTour(debutDe(blocDeTour(1, 4)))).toBeNull();
  });

  it('n’existe pas pour une séance flash', () => {
    expect(messageDernierTour(debutDe(blocSimple))).toBeNull();
  });
});

describe('texteAnnonce', () => {
  const nom = blocSimple.exercice.nom;
  const debutDe = (bloc: Bloc) => creerEtatInitial([bloc]);

  it('annonce le nom de l’exercice, comme avant, pour une séance flash et pour un poste ordinaire', () => {
    expect(texteAnnonce(debutDe(blocSimple))).toBe(nom);
    expect(texteAnnonce(debutDe(blocDeTour(2, 4)))).toBe(nom);
    expect(texteAnnonce(lecteur(debutDe(blocSimple), { type: 'avancer', ms: 10000 }))).toBe(nom);
  });

  it('annonce le repos entre deux tours', () => {
    expect(texteAnnonce(debutDe(blocApresRepos(2, 4)))).toBe(`Repos · À suivre\u00a0: ${nom}`);
  });

  it('ajoute l’encouragement au début du dernier tour', () => {
    expect(texteAnnonce(debutDe(blocApresRepos(4, 4)))).toBe(`Repos · À suivre\u00a0: ${nom}. ${MESSAGE_DERNIER_TOUR}`);
  });

  it('revient au nom de l’exercice une fois le repos fini', () => {
    expect(texteAnnonce(lecteur(debutDe(blocApresRepos(4, 4)), { type: 'avancer', ms: 100000 }))).toBe(nom);
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
