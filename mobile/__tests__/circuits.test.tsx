/// <reference path="../node_modules/expo-router/build/ts-declarations/expect.d.ts" />
import { fireEvent, waitFor, within } from '@testing-library/react-native';
import { router } from 'expo-router';
import { act, renderRouter, screen } from 'expo-router/testing-library';
import { AccessibilityInfo, Platform } from 'react-native';

import Layout from '../app/_layout';
import Depart from '../app/index';
import Bravo from '../app/bravo';
import DetailCircuit from '../app/circuit/[id]';
import Circuits from '../app/circuits';
import Journal from '../app/journal';
import EcranSeance from '../app/seance';
import { CLE_JOURNAL } from '../src/journal/journal';
import { stockageTelephone } from '../src/preferences/stockage';
import { fabriquerEntree } from '../src/test-utils/journal';

jest.mock('../src/preferences/stockage', () => {
  const { creerStockageMemoire } = jest.requireActual('../src/test-utils/stockageMemoire');
  return { stockageTelephone: creerStockageMemoire() };
});
jest.mock('../src/synchro/instance', () => ({ authApp: null, moteurApp: null, demanderSynchro: jest.fn() }));
jest.mock('expo-keep-awake', () => ({
  activateKeepAwakeAsync: jest.fn(() => Promise.resolve()),
  deactivateKeepAwake: jest.fn(() => Promise.resolve()),
}));
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Medium: 'medium' },
  NotificationFeedbackType: { Success: 'success' },
}));

const memoire = stockageTelephone as unknown as { contenu: Record<string, string> };
const ROUTES = {
  _layout: Layout,
  index: Depart,
  circuits: Circuits,
  'circuit/[id]': DetailCircuit,
  seance: EcranSeance,
  bravo: Bravo,
  journal: Journal,
};
const TOUTES = { includeHiddenElements: true };
const journalEnMemoire = () => JSON.parse(memoire.contenu[CLE_JOURNAL] ?? '[]');
const CONSEIL = 'Conseil : 2 séances par semaine, jours non consécutifs. Garde 1 à 3 répétitions en réserve.';
const PRUDENCE = 'Utilise une chaise ou une table stable, ni pliante ni vitrée.';
const PAS_DE_MEUBLE = 'Je n’ai pas de meuble stable';
const DERNIER_TOUR = 'Dernier tour ! Va au bout si la technique reste propre.';
const circuitUrl = (id: string, options = '') => `/seance?circuit=${id}&sansMateriel=0&tourEnPlus=0&graine=7${options}`;

beforeEach(() => {
  for (const cle of Object.keys(memoire.contenu)) delete memoire.contenu[cle];
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('départ : accès aux séances prêtes', () => {
  it('montre un bouton icône « Séances prêtes » en haut à gauche, symétrique de « Mon journal »', async () => {
    await renderRouter(ROUTES, { initialUrl: '/' });
    const circuits = await screen.findByRole('button', { name: 'Séances prêtes' });
    const journal = screen.getByRole('button', { name: 'Mon journal' });
    expect(within(circuits).getByTestId('icone-circuit', TOUTES)).toBeTruthy();
    // Hors du flux, comme « Mon journal » : l'en-tête ne gagne aucune ligne.
    expect(circuits).toHaveStyle({ width: 48, height: 48, borderRadius: 24, position: 'absolute', top: -4, left: -8 });
    expect(journal).toHaveStyle({ width: 48, height: 48, borderRadius: 24, position: 'absolute', top: -4, right: -8 });
    expect(screen.queryByText('Séances prêtes')).toBeNull();
  });

  it('garde l’en-tête empilé : le logo au-dessus du nom, le slogan dessous', async () => {
    await renderRouter(ROUTES, { initialUrl: '/' });
    const marque = await screen.findByRole('header', { name: 'Flash Coach' });
    expect(within(marque).getByText('Flash Coach', TOUTES)).toBeTruthy();
    expect(within(marque).getByLabelText('Flash Coach', TOUTES)).toBeTruthy();
    expect(screen.getByText('Où que tu sois, 5 minutes pour te sentir mieux.')).toBeTruthy();
  });

  it('ouvre la liste des séances prêtes', async () => {
    await renderRouter(ROUTES, { initialUrl: '/' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Séances prêtes' }));
    await waitFor(() => expect(screen).toHavePathname('/circuits'));
  });

  it('n’ouvre qu’une seule liste malgré un double appui', async () => {
    await renderRouter(ROUTES, { initialUrl: '/' });
    const bouton = await screen.findByRole('button', { name: 'Séances prêtes' });
    await fireEvent.press(bouton);
    await fireEvent.press(bouton);
    await waitFor(() => expect(screen).toHavePathname('/circuits'));
    await fireEvent.press(await screen.findByRole('button', { name: 'Retour' }));
    await waitFor(() => expect(screen).toHavePathname('/'));
    expect(router.canGoBack()).toBe(false);
  });
});

describe('liste des séances prêtes', () => {
  const NOM_CARTE = /, (Doux|Tonique|Costaud), \d tours, \d+ minutes$/;
  const cartes = () => screen.getAllByRole('button', { name: NOM_CARTE }).map((carte) => carte.props.accessibilityLabel as string);

  it('s’appelle « Séances prêtes » et finit par le conseil', async () => {
    await renderRouter(ROUTES, { initialUrl: '/circuits' });
    expect(await screen.findByRole('header', { name: 'Séances prêtes' })).toBeTruthy();
    expect(screen.getByText(CONSEIL)).toBeTruthy();
  });

  it('présélectionne le niveau enregistré, « Doux » par défaut, avec ses quatre circuits', async () => {
    await renderRouter(ROUTES, { initialUrl: '/circuits' });
    expect(await screen.findByRole('button', { name: 'Doux' })).toBeSelected();
    expect(screen.getByRole('button', { name: 'Tonique' })).not.toBeSelected();
    expect(screen.getByRole('button', { name: 'Costaud' })).not.toBeSelected();
    expect(cartes()).toEqual([
      'Full body, Doux, 3 tours, 16 minutes',
      'Poussée, Doux, 3 tours, 16 minutes',
      'Jambes, Doux, 3 tours, 16 minutes',
      'Dos et tronc, Doux, 3 tours, 16 minutes',
    ]);
  });

  it('présélectionne « Tonique » quand c’est le niveau enregistré : cinq circuits, le cardio avec', async () => {
    memoire.contenu['flashcoach.niveau'] = '2';
    await renderRouter(ROUTES, { initialUrl: '/circuits' });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Tonique' })).toBeSelected());
    expect(cartes()).toEqual([
      'Full body, Tonique, 4 tours, 21 minutes',
      'Poussée, Tonique, 4 tours, 21 minutes',
      'Jambes, Tonique, 4 tours, 21 minutes',
      'Dos, Tonique, 4 tours, 21 minutes',
      'Cardio athlétique, Tonique, 3 tours, 16 minutes',
    ]);
  });

  it('montre les quatre circuits « Costaud » quand c’est le niveau enregistré', async () => {
    memoire.contenu['flashcoach.niveau'] = '3';
    await renderRouter(ROUTES, { initialUrl: '/circuits' });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Costaud' })).toBeSelected());
    expect(cartes()).toEqual([
      'Full body, Costaud, 4 tours, 21 minutes',
      'Poussée, Costaud, 4 tours, 21 minutes',
      'Jambes, Costaud, 4 tours, 21 minutes',
      'Dos, Costaud, 4 tours, 21 minutes',
    ]);
  });

  it('change de liste avec les puces, sans toucher au niveau enregistré', async () => {
    memoire.contenu['flashcoach.niveau'] = '2';
    await renderRouter(ROUTES, { initialUrl: '/circuits' });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Tonique' })).toBeSelected());
    await fireEvent.press(screen.getByRole('button', { name: 'Costaud' }));
    expect(screen.getByRole('button', { name: 'Costaud' })).toBeSelected();
    expect(screen.getByRole('button', { name: 'Tonique' })).not.toBeSelected();
    expect(cartes()).toHaveLength(4);
    expect(cartes().every((nom) => nom.includes('Costaud'))).toBe(true);
    await fireEvent.press(screen.getByRole('button', { name: 'Doux' }));
    expect(cartes()[0]).toBe('Full body, Doux, 3 tours, 16 minutes');
    expect(memoire.contenu['flashcoach.niveau']).toBe('2');
  });

  it('ne laisse pas la lecture du niveau écraser une puce déjà choisie', async () => {
    memoire.contenu['flashcoach.niveau'] = '2';
    const stockage = stockageTelephone as unknown as { lire: (cle: string) => Promise<string | null> };
    const lireOrigine = stockage.lire;
    let liberer: () => void = () => undefined;
    const porte = new Promise<void>((resolve) => {
      liberer = resolve;
    });
    stockage.lire = async (cle) => {
      await porte;
      return lireOrigine(cle);
    };
    try {
      await renderRouter(ROUTES, { initialUrl: '/circuits' });
      await fireEvent.press(await screen.findByRole('button', { name: 'Costaud' }));
      await act(async () => {
        liberer();
        await porte;
      });
      expect(screen.getByRole('button', { name: 'Costaud' })).toBeSelected();
    } finally {
      stockage.lire = lireOrigine;
    }
  });

  it('résume chaque carte : tours et minutes, puis le matériel', async () => {
    memoire.contenu['flashcoach.niveau'] = '2';
    await renderRouter(ROUTES, { initialUrl: '/circuits' });
    const carte = async (nom: string) => within(await screen.findByRole('button', { name: nom }));
    const fullBody = await carte('Full body, Tonique, 4 tours, 21 minutes');
    expect(fullBody.getByText('Full body')).toBeTruthy();
    expect(fullBody.getByText('4 tours · 21 min')).toBeTruthy();
    expect(fullBody.getByText('table')).toBeTruthy();
    expect((await carte('Poussée, Tonique, 4 tours, 21 minutes')).getByText('chaise')).toBeTruthy();
    const cardio = await carte('Cardio athlétique, Tonique, 3 tours, 16 minutes');
    expect(cardio.getByText('3 tours · 16 min')).toBeTruthy();
    expect(cardio.getByText('sans matériel')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Costaud' }));
    expect((await carte('Full body, Costaud, 4 tours, 21 minutes')).getByText('chaise et table')).toBeTruthy();
  });

  it('dessine l’icône « circuit » sur chaque carte', async () => {
    await renderRouter(ROUTES, { initialUrl: '/circuits' });
    await screen.findByRole('button', { name: 'Full body, Doux, 3 tours, 16 minutes' });
    expect(screen.getAllByTestId('icone-circuit', TOUTES)).toHaveLength(4);
  });

  it('garde cartes et puces à 48 dp au moins', async () => {
    await renderRouter(ROUTES, { initialUrl: '/circuits' });
    const carte = await screen.findByRole('button', { name: 'Full body, Doux, 3 tours, 16 minutes' });
    expect(carte).toHaveStyle({ minHeight: 48, borderRadius: 16 });
    expect(screen.getByRole('button', { name: 'Doux' })).toHaveStyle({ minHeight: 48 });
  });

  it('ouvre le détail du circuit touché', async () => {
    await renderRouter(ROUTES, { initialUrl: '/circuits' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Poussée, Doux, 3 tours, 16 minutes' }));
    await waitFor(() => expect(screen).toHavePathname('/circuit/poussee-doux'));
  });

  it('n’ouvre qu’un seul détail malgré un double appui sur une carte', async () => {
    await renderRouter(ROUTES, { initialUrl: '/circuits' });
    const carte = await screen.findByRole('button', { name: 'Jambes, Doux, 3 tours, 16 minutes' });
    await fireEvent.press(carte);
    await fireEvent.press(carte);
    await waitFor(() => expect(screen).toHavePathname('/circuit/jambes-doux'));
    await fireEvent.press(await screen.findByRole('button', { name: 'Retour' }));
    await waitFor(() => expect(screen).toHavePathname('/circuits'));
  });

  it('revient au départ avec « Retour » quand il n’y a rien derrière', async () => {
    await renderRouter(ROUTES, { initialUrl: '/circuits' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Retour' }));
    await waitFor(() => expect(screen).toHavePathname('/'));
  });
});

describe('détail d’un circuit', () => {
  const postes = () => screen.getAllByLabelText(/^[1-5], /).map((poste) => poste.props.accessibilityLabel as string);

  it('renvoie à la liste quand le circuit est inconnu', async () => {
    await renderRouter(ROUTES, { initialUrl: '/circuit/lune' });
    await waitFor(() => expect(screen).toHavePathname('/circuits'));
  });

  it('montre le nom, le niveau, la durée et les cinq postes numérotés, côtés compris', async () => {
    await renderRouter(ROUTES, { initialUrl: '/circuit/dos-tonique' });
    expect(await screen.findByRole('header', { name: 'Dos' })).toBeTruthy();
    expect(screen.getByText('Tonique')).toBeTruthy();
    expect(screen.getByText('4 tours · 21 min')).toBeTruthy();
    expect(postes()).toEqual([
      '1, Tractions sous la table',
      '2, Planche sur le côté (gauche)',
      '3, Pont fessier',
      '4, Tractions sous la table',
      '5, Planche sur le côté (droite)',
    ]);
  });

  it('revient à la liste avec « Retour »', async () => {
    await renderRouter(ROUTES, { initialUrl: '/circuits' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Full body, Doux, 3 tours, 16 minutes' }));
    await fireEvent.press(await screen.findByRole('button', { name: 'Retour' }));
    await waitFor(() => expect(screen).toHavePathname('/circuits'));
  });

  it('prévient et propose l’interrupteur quand un poste demande un meuble', async () => {
    await renderRouter(ROUTES, { initialUrl: '/circuit/dos-tonique' });
    expect(await screen.findByText(PRUDENCE)).toBeTruthy();
    expect(screen.getByRole('switch', { name: PAS_DE_MEUBLE })).not.toBeChecked();
  });

  it('n’en parle pas quand aucun poste ne demande de meuble', async () => {
    await renderRouter(ROUTES, { initialUrl: '/circuit/cardio-athletique' });
    await screen.findByRole('header', { name: 'Cardio athlétique' });
    expect(screen.queryByText(PRUDENCE)).toBeNull();
    expect(screen.queryByRole('switch')).toBeNull();
  });

  it('remplace les postes à meuble quand on active « Je n’ai pas de meuble stable », et le retient', async () => {
    await renderRouter(ROUTES, { initialUrl: '/circuit/dos-tonique' });
    const interrupteur = await screen.findByRole('switch', { name: PAS_DE_MEUBLE });
    await fireEvent.press(interrupteur);
    expect(postes()).toEqual([
      '1, Y-T au sol',
      '2, Planche sur le côté (gauche)',
      '3, Pont fessier',
      '4, Y-T au sol',
      '5, Planche sur le côté (droite)',
    ]);
    expect(screen.queryByText('Tractions sous la table')).toBeNull();
    expect(screen.getByRole('switch', { name: PAS_DE_MEUBLE })).toBeChecked();
    await waitFor(() => expect(memoire.contenu['flashcoach.sansMateriel']).toBe('true'));
    await fireEvent.press(screen.getByRole('switch', { name: PAS_DE_MEUBLE }));
    expect(postes()[0]).toBe('1, Tractions sous la table');
    await waitFor(() => expect(memoire.contenu['flashcoach.sansMateriel']).toBe('false'));
  });

  it('garde le côté du poste quand le squat bulgare devient des fentes arrière', async () => {
    await renderRouter(ROUTES, { initialUrl: '/circuit/jambes-tonique' });
    expect(postes()[0]).toBe('1, Squat bulgare (gauche)');
    await fireEvent.press(screen.getByRole('switch', { name: PAS_DE_MEUBLE }));
    expect(postes()[0]).toBe('1, Fentes arrière (gauche)');
    expect(postes()[2]).toBe('3, Fentes arrière (droite)');
  });

  it('reprend la préférence « sans meuble » enregistrée', async () => {
    memoire.contenu['flashcoach.sansMateriel'] = 'true';
    await renderRouter(ROUTES, { initialUrl: '/circuit/dos-tonique' });
    await waitFor(() => expect(screen.getByRole('switch', { name: PAS_DE_MEUBLE })).toBeChecked());
    expect(postes()[0]).toBe('1, Y-T au sol');
  });

  it('ne propose pas le 5e tour aux circuits qui n’en ont pas', async () => {
    await renderRouter(ROUTES, { initialUrl: '/circuit/full-body-tonique' });
    await screen.findByRole('header', { name: 'Full body' });
    expect(screen.queryByRole('switch', { name: 'Ajouter un 5e tour' })).toBeNull();
  });

  it('propose le 5e tour aux circuits Costaud, met la durée à jour et ne le retient pas', async () => {
    await renderRouter(ROUTES, { initialUrl: '/circuit/jambes-costaud' });
    expect(await screen.findByText('4 tours · 21 min')).toBeTruthy();
    const interrupteur = screen.getByRole('switch', { name: 'Ajouter un 5e tour' });
    expect(interrupteur).not.toBeChecked();
    await fireEvent.press(interrupteur);
    expect(screen.getByText('5 tours · 26 min')).toBeTruthy();
    expect(screen.queryByText('4 tours · 21 min')).toBeNull();
    await fireEvent.press(screen.getByRole('switch', { name: 'Ajouter un 5e tour' }));
    expect(screen.getByText('4 tours · 21 min')).toBeTruthy();
    expect(Object.keys(memoire.contenu)).toEqual([]);
  });

  it('lance le circuit avec ses options', async () => {
    await renderRouter(ROUTES, { initialUrl: '/circuit/jambes-costaud' });
    await fireEvent.press(await screen.findByRole('switch', { name: PAS_DE_MEUBLE }));
    await fireEvent.press(screen.getByRole('switch', { name: 'Ajouter un 5e tour' }));
    await fireEvent.press(screen.getByRole('button', { name: 'C’est parti' }));
    await waitFor(() => expect(screen).toHavePathname('/seance'));
    expect(screen).toHaveSearchParams({
      circuit: 'jambes-costaud',
      sansMateriel: '1',
      tourEnPlus: '1',
      graine: expect.stringMatching(/^\d+$/),
    });
  });

  it('lance sans option par défaut', async () => {
    await renderRouter(ROUTES, { initialUrl: '/circuit/full-body-doux' });
    await fireEvent.press(await screen.findByRole('button', { name: 'C’est parti' }));
    await waitFor(() => expect(screen).toHavePathname('/seance'));
    expect(screen).toHaveSearchParams({
      circuit: 'full-body-doux',
      sansMateriel: '0',
      tourEnPlus: '0',
      graine: expect.stringMatching(/^\d+$/),
    });
    expect(await screen.findByText('Échauffement · ')).toBeTruthy();
  });

  it('ne lance qu’une séance malgré un double appui', async () => {
    await renderRouter(ROUTES, { initialUrl: '/circuit/full-body-doux' });
    const lancer = await screen.findByRole('button', { name: 'C’est parti' });
    await fireEvent.press(lancer);
    await fireEvent.press(lancer);
    await waitFor(() => expect(screen).toHavePathname('/seance'));
    await fireEvent.press(await screen.findByRole('button', { name: 'Quitter la séance' }));
    await waitFor(() => expect(screen).toHavePathname('/circuit/full-body-doux'));
  });
});

describe('séance d’un circuit', () => {
  const passer = async (fois: number) => {
    for (let i = 0; i < fois; i += 1) await fireEvent.press(screen.getByRole('button', { name: 'Passer' }));
  };
  const avancer = (ms: number) =>
    act(async () => {
      jest.advanceTimersByTime(ms);
    });
  // Le texte annoncé aux lecteurs d'écran : une zone vive en haut de la carte de séance.
  type Noeud = { props: { accessibilityLiveRegion?: string }; parent: Noeud | null };
  const estDansUneZoneVive = (texte: string) => {
    let noeud: Noeud | null = screen.getByText(texte) as unknown as Noeud;
    while (noeud !== null) {
      if (noeud.props.accessibilityLiveRegion === 'polite') return true;
      noeud = noeud.parent;
    }
    return false;
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  it('commence par l’échauffement, puis passe au tour 1', async () => {
    await renderRouter(ROUTES, { initialUrl: circuitUrl('full-body-doux') });
    expect(await screen.findByText('Échauffement · ')).toBeTruthy();
    expect(screen.queryByText('Mise en route · ')).toBeNull();
    // 4 postes d'échauffement, 15 de tours, 2 de retour au calme : le compteur existant reste.
    expect(screen.getByText('1 / 21')).toBeTruthy();
    await passer(4);
    expect(screen.getByText('Tour 1 / 3 · ')).toBeTruthy();
    expect(screen.getByText('5 / 21')).toBeTruthy();
    expect(screen.queryByText('Échauffement · ')).toBeNull();
    // Premier poste du premier tour : l'aperçu habituel, pas de repos.
    expect(screen.getByText('À suivre : Pompes inclinées')).toBeTruthy();
    expect(screen.getByText('0:10')).toBeTruthy();
  });

  it('finit par le retour au calme', async () => {
    await renderRouter(ROUTES, { initialUrl: circuitUrl('full-body-doux') });
    await screen.findByText('Échauffement · ');
    await passer(19);
    expect(screen.getByText('Retour au calme · ')).toBeTruthy();
    expect(screen.getByText('20 / 21')).toBeTruthy();
  });

  it('annonce le repos entre deux tours, avec le compte à rebours de 1 min 40', async () => {
    await renderRouter(ROUTES, { initialUrl: circuitUrl('full-body-doux') });
    await screen.findByText('Échauffement · ');
    await passer(9);
    expect(screen.getByText('Tour 2 / 3 · ')).toBeTruthy();
    expect(screen.getByText('Repos · À suivre : Pompes inclinées')).toBeTruthy();
    expect(screen.getByText('1:40')).toBeTruthy();
    expect(screen.queryByText(DERNIER_TOUR)).toBeNull();
    // Le repos fini, l'exercice commence : plus de « Repos ».
    await avancer(100_000);
    expect(screen.queryByText(/^Repos/)).toBeNull();
    expect(screen.getByText('Pompes inclinées')).toBeTruthy();
    expect(screen.getByText('0:30')).toBeTruthy();
  });

  it('encourage au début du dernier tour seulement, dans une zone annoncée', async () => {
    await renderRouter(ROUTES, { initialUrl: circuitUrl('full-body-doux') });
    await screen.findByText('Échauffement · ');
    await passer(14);
    expect(screen.getByText('Tour 3 / 3 · ')).toBeTruthy();
    expect(screen.getByText('Repos · À suivre : Pompes inclinées')).toBeTruthy();
    expect(screen.getByText(DERNIER_TOUR)).toBeTruthy();
    expect(estDansUneZoneVive(DERNIER_TOUR)).toBe(true);
    // L'effort commence : la ligne s'efface.
    await avancer(100_000);
    expect(screen.queryByText(DERNIER_TOUR)).toBeNull();
    // Et les postes suivants du dernier tour n'y reviennent pas.
    await passer(1);
    expect(screen.queryByText(DERNIER_TOUR)).toBeNull();
  });

  it('annonce le repos et le dernier tour aux lecteurs d’écran (iOS)', async () => {
    jest.replaceProperty(Platform, 'OS', 'ios');
    const annonce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => undefined);
    await renderRouter(ROUTES, { initialUrl: circuitUrl('full-body-doux') });
    await screen.findByText('Échauffement · ');
    await passer(9);
    expect(annonce).toHaveBeenLastCalledWith('Repos · À suivre : Pompes inclinées');
    await passer(5);
    expect(annonce).toHaveBeenLastCalledWith(`Repos · À suivre : Pompes inclinées. ${DERNIER_TOUR}`);
    await passer(1);
    expect(annonce).toHaveBeenLastCalledWith('Squat lent');
  });

  it('impose le côté du poste pendant l’effort : gauche, puis droite', async () => {
    await renderRouter(ROUTES, { initialUrl: circuitUrl('jambes-tonique') });
    await screen.findByText('Échauffement · ');
    await passer(4);
    expect(screen.queryByText(/^Côté/)).toBeNull();
    await avancer(10_000);
    expect(screen.getByText('Squat bulgare')).toBeTruthy();
    expect(screen.getByText('Côté gauche')).toBeTruthy();
    await passer(2);
    await avancer(10_000);
    expect(screen.getByText('Squat bulgare')).toBeTruthy();
    expect(screen.getByText('Côté droit')).toBeTruthy();
    expect(screen.queryByText('Côté gauche')).toBeNull();
  });

  it('joue les remplaçants quand on n’a pas de meuble stable, côté conservé', async () => {
    await renderRouter(ROUTES, { initialUrl: circuitUrl('jambes-tonique').replace('sansMateriel=0', 'sansMateriel=1') });
    await screen.findByText('Échauffement · ');
    await passer(4);
    expect(screen.getByText('À suivre : Fentes arrière')).toBeTruthy();
    await avancer(10_000);
    expect(screen.getByText('Côté gauche')).toBeTruthy();
    expect(screen.queryByText('Squat bulgare')).toBeNull();
  });

  it('joue quatre tours sans le 5e', async () => {
    await renderRouter(ROUTES, { initialUrl: circuitUrl('full-body-costaud') });
    expect(await screen.findByText('1 / 26')).toBeTruthy();
    await passer(4);
    expect(screen.getByText('Tour 1 / 4 · ')).toBeTruthy();
  });

  it('ajoute un 5e tour sur demande, pour les circuits Costaud', async () => {
    await renderRouter(ROUTES, { initialUrl: circuitUrl('full-body-costaud').replace('tourEnPlus=0', 'tourEnPlus=1') });
    expect(await screen.findByText('1 / 31')).toBeTruthy();
    await passer(4);
    expect(screen.getByText('Tour 1 / 5 · ')).toBeTruthy();
  });

  it('renvoie au départ pour un circuit inconnu', async () => {
    await renderRouter(ROUTES, { initialUrl: '/seance?circuit=lune&sansMateriel=0&tourEnPlus=0&graine=7' });
    await waitFor(() => expect(screen).toHavePathname('/'));
  });

  it('renvoie au départ pour une graine invalide', async () => {
    await renderRouter(ROUTES, { initialUrl: '/seance?circuit=dos-doux&sansMateriel=0&tourEnPlus=0&graine=abc' });
    await waitFor(() => expect(screen).toHavePathname('/'));
  });

  it('inscrit le circuit au journal, avec sa durée en minutes et son niveau', async () => {
    await renderRouter(ROUTES, { initialUrl: circuitUrl('full-body-costaud') });
    await waitFor(() => expect(journalEnMemoire()).toHaveLength(1));
    expect(journalEnMemoire()[0]).toMatchObject({
      circuitId: 'full-body-costaud',
      contexteId: 'maison',
      duree: 21,
      niveau: 3,
      graine: 7,
      terminee: false,
      apres: null,
      effort: null,
    });
    expect(journalEnMemoire()[0].exercices).toHaveLength(26);
  });

  it('inscrit la durée du 5e tour au journal', async () => {
    await renderRouter(ROUTES, { initialUrl: circuitUrl('dos-costaud').replace('tourEnPlus=0', 'tourEnPlus=1') });
    await waitFor(() => expect(journalEnMemoire()).toHaveLength(1));
    expect(journalEnMemoire()[0]).toMatchObject({ circuitId: 'dos-costaud', duree: 26 });
  });

  it('laisse intact le souvenir des derniers exercices de la séance flash', async () => {
    memoire.contenu['flashcoach.derniers-exercices'] = JSON.stringify(['squat-lent']);
    await renderRouter(ROUTES, { initialUrl: circuitUrl('full-body-doux') });
    await waitFor(() => expect(journalEnMemoire()).toHaveLength(1));
    expect(JSON.parse(memoire.contenu['flashcoach.derniers-exercices'])).toEqual(['squat-lent']);
  });

  it('va jusqu’au bilan, marque le circuit terminé et passe son niveau à Bravo', async () => {
    const { getSearchParams } = await renderRouter(ROUTES, { initialUrl: circuitUrl('dos-tonique') });
    await screen.findByText('Échauffement · ');
    await avancer(1_300_000);
    await waitFor(() => expect(screen).toHavePathname('/bravo'));
    const [entree] = journalEnMemoire();
    expect(journalEnMemoire()).toHaveLength(1);
    expect(entree).toMatchObject({ circuitId: 'dos-tonique', duree: 21, niveau: 2, terminee: true, exercicesFaits: 26, ecouleMs: 1_250_000 });
    expect(getSearchParams()).toEqual({ minutes: '21', exercices: '26', secondes: '1250', seance: entree.id, niveau: '2' });
  });
});

describe('journal : séances en circuit', () => {
  const circuit = (surcharge = {}) =>
    fabriquerEntree({ id: 'c', circuitId: 'dos-tonique', duree: 21, niveau: 2, ecouleMs: 1_250_000, exercicesFaits: 26, terminee: true, ...surcharge });

  it('affiche le nom du circuit et son niveau à la place du contexte', async () => {
    memoire.contenu[CLE_JOURNAL] = JSON.stringify([circuit({ apres: 'mieux' }), fabriquerEntree({ id: 'f' })]);
    await renderRouter(ROUTES, { initialUrl: '/journal' });
    expect(await screen.findByText('Dos · Tonique → Mieux')).toBeTruthy();
    expect(screen.getByText('21 min · 26 exercices')).toBeTruthy();
    // La séance flash garde son contexte et son ressenti.
    expect(screen.getByText('À la maison · Mou')).toBeTruthy();
  });

  it('marque la ligne de l’icône « circuit », sans celle du contexte', async () => {
    memoire.contenu[CLE_JOURNAL] = JSON.stringify([circuit()]);
    await renderRouter(ROUTES, { initialUrl: '/journal' });
    await screen.findByText('Dos · Tonique');
    expect(screen.getAllByTestId('icone-circuit', TOUTES)).toHaveLength(1);
    expect(screen.queryByTestId('icone-maison', TOUTES)).toBeNull();
    expect(screen.queryByText('À la maison')).toBeNull();
  });

  it('ne met l’icône « circuit » que sur les séances de circuit', async () => {
    memoire.contenu[CLE_JOURNAL] = JSON.stringify([fabriquerEntree({ id: 'f' })]);
    await renderRouter(ROUTES, { initialUrl: '/journal' });
    await screen.findByText('À la maison · Mou');
    expect(screen.queryByTestId('icone-circuit', TOUTES)).toBeNull();
    expect(screen.getAllByTestId('icone-maison', TOUTES)).toHaveLength(1);
  });

  it('se lit d’un seul bloc, avec le nom du circuit et son niveau', async () => {
    memoire.contenu[CLE_JOURNAL] = JSON.stringify([circuit({ apres: 'mieux' })]);
    await renderRouter(ROUTES, { initialUrl: '/journal' });
    expect(await screen.findByLabelText('dim. 18 oct. à 7h05, Dos, niveau Tonique, puis Mieux, 21 min, 26 exercices')).toBeTruthy();
  });

  it('garde un nom neutre pour un circuit que cette version ne connaît pas', async () => {
    memoire.contenu[CLE_JOURNAL] = JSON.stringify([circuit({ circuitId: 'circuit-du-futur' })]);
    await renderRouter(ROUTES, { initialUrl: '/journal' });
    expect(await screen.findByText('Séance prête · Tonique')).toBeTruthy();
  });
});
