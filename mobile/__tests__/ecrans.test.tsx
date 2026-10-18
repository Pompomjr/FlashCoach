/// <reference path="../node_modules/expo-router/build/ts-declarations/expect.d.ts" />
import { fireEvent, waitFor, within } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { act, renderRouter, screen } from 'expo-router/testing-library';
import { AccessibilityInfo, Platform } from 'react-native';

import Layout from '../app/_layout';
import Depart from '../app/index';
import Bravo from '../app/bravo';
import Journal from '../app/journal';
import EcranSeance from '../app/seance';
import { CLE_JOURNAL } from '../src/journal/journal';
import { stockageTelephone } from '../src/preferences/stockage';
import { fabriquerEntree } from '../src/test-utils/journal';

jest.mock('../src/preferences/stockage', () => {
  const { creerStockageMemoire } = jest.requireActual('../src/test-utils/stockageMemoire');
  return { stockageTelephone: creerStockageMemoire() };
});
jest.mock('expo-keep-awake', () => ({
  activateKeepAwakeAsync: jest.fn(() => Promise.resolve()),
  deactivateKeepAwake: jest.fn(() => Promise.resolve()),
}));
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Medium: 'medium' },
}));

// Pictogrammes et emoji : plus aucun dans l'interface.
const EMOJI = new RegExp(String.raw`\p{Extended_Pictographic}|[✓‹]`, 'u');

const memoire = stockageTelephone as unknown as { contenu: Record<string, string> };
const ROUTES = { _layout: Layout, index: Depart, seance: EcranSeance, bravo: Bravo, journal: Journal };
const SEANCE = '/seance?contexte=maison&ressenti=mou&duree=5&graine=1';
const journalEnMemoire = () => JSON.parse(memoire.contenu[CLE_JOURNAL] ?? '[]');

// Le compteur est remis à zéro : un espion déjà posé par un test précédent garderait son historique.
function espionnerAnnonces() {
  const espion = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => undefined);
  espion.mockClear();
  return espion;
}

beforeEach(() => {
  for (const cle of Object.keys(memoire.contenu)) delete memoire.contenu[cle];
  jest.mocked(Haptics.impactAsync).mockClear();
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('écran de départ', () => {
  it('présélectionne À la maison, Mou et 5 min au premier lancement', async () => {
    await renderRouter(ROUTES, { initialUrl: '/' });
    expect(await screen.findByRole('button', { name: 'À la maison' })).toBeSelected();
    expect(screen.getByRole('button', { name: 'Mou' })).toBeSelected();
    expect(screen.getByRole('button', { name: '5 min' })).toBeSelected();
  });

  it('reprend les derniers choix', async () => {
    memoire.contenu['flashcoach.choix'] = JSON.stringify({ contexteId: 'reveil', ressenti: 'raide', duree: 3 });
    await renderRouter(ROUTES, { initialUrl: '/' });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Au réveil' })).toBeSelected());
    expect(screen.getByRole('button', { name: 'Raide' })).toBeSelected();
    expect(screen.getByRole('button', { name: '3 min' })).toBeSelected();
  });

  it('affiche la marque en titre, avec le slogan dessous', async () => {
    await renderRouter(ROUTES, { initialUrl: '/' });
    expect(await screen.findByRole('header', { name: 'Flash Coach' })).toBeTruthy();
    expect(screen.getByText('Où que tu sois, 5 minutes pour te sentir mieux.')).toBeTruthy();
  });

  it('centre le logo et le nom, avec « Mon journal » en bouton icône et des titres de section', async () => {
    await renderRouter(ROUTES, { initialUrl: '/' });
    const marque = await screen.findByRole('header', { name: 'Flash Coach' });
    expect(within(marque).getByText('Flash Coach', { includeHiddenElements: true })).toBeTruthy();
    const journal = screen.getByRole('button', { name: 'Mon journal' });
    expect(within(journal).getByTestId('icone-journal', { includeHiddenElements: true })).toBeTruthy();
    expect(journal).toHaveStyle({ width: 48, height: 48, position: 'absolute' });
    expect(screen.queryByText('Mon journal')).toBeNull();
    for (const titre of ['Où es-tu ?', 'Comment tu te sens ?', 'Combien de temps ?']) {
      expect(screen.getByRole('header', { name: titre })).toBeTruthy();
    }
  });

  it('dessine une icône sur chaque carte de contexte et de ressenti, sans emoji', async () => {
    await renderRouter(ROUTES, { initialUrl: '/' });
    await screen.findByRole('button', { name: 'À la maison' });
    for (const nom of ['reveil', 'maison', 'cadenas', 'raide', 'stresse', 'mou', 'en_forme', 'journal']) {
      expect(screen.getAllByTestId(`icone-${nom}`, { includeHiddenElements: true }).length).toBeGreaterThan(0);
    }
    // Les trois contextes Premium montrent le cadenas, pas leur icône.
    expect(screen.getAllByTestId('icone-cadenas', { includeHiddenElements: true })).toHaveLength(3);
    for (const nom of ['bureau', 'voyage', 'dehors']) {
      expect(screen.queryByTestId(`icone-${nom}`, { includeHiddenElements: true })).toBeNull();
    }
    expect(screen.queryAllByText(EMOJI)).toHaveLength(0);
  });

  it('lance la séance en un seul tap et retient les choix', async () => {
    await renderRouter(ROUTES, { initialUrl: '/' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Lancer ma séance' }));
    await waitFor(() => expect(screen).toHavePathname('/seance'));
    expect(JSON.parse(memoire.contenu['flashcoach.choix'])).toEqual({ contexteId: 'maison', ressenti: 'mou', duree: 5 });
  });

  it('annonce Premium sans changer la sélection', async () => {
    await renderRouter(ROUTES, { initialUrl: '/' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Au bureau, Premium' }));
    expect(screen.getByText('Bientôt avec Premium')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'À la maison' })).toBeSelected();
  });

  it('ne laisse pas la lecture des préférences écraser un choix déjà fait', async () => {
    memoire.contenu['flashcoach.choix'] = JSON.stringify({ contexteId: 'reveil', ressenti: 'raide', duree: 3 });
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
      await renderRouter(ROUTES, { initialUrl: '/' });
      await fireEvent.press(await screen.findByRole('button', { name: 'En forme' }));
      await act(async () => {
        liberer();
        await porte;
      });
      expect(screen.getByRole('button', { name: 'En forme' })).toBeSelected();
      expect(screen.getByRole('button', { name: 'À la maison' })).toBeSelected();
    } finally {
      stockage.lire = lireOrigine;
    }
  });

  it('efface le message Premium dès qu’on fait un autre choix', async () => {
    await renderRouter(ROUTES, { initialUrl: '/' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Au bureau, Premium' }));
    expect(screen.getByText('Bientôt avec Premium')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Raide' }));
    expect(screen.queryByText('Bientôt avec Premium')).toBeNull();
  });

  it('accompagne « Bientôt avec Premium » du cadenas', async () => {
    await renderRouter(ROUTES, { initialUrl: '/' });
    expect(screen.queryByText('Bientôt avec Premium')).toBeNull();
    await fireEvent.press(await screen.findByRole('button', { name: 'Au bureau, Premium' }));
    const message = screen.getByText('Bientôt avec Premium');
    expect(message).toBeTruthy();
    // 3 cartes verrouillées + le cadenas du message.
    expect(screen.getAllByTestId('icone-cadenas', { includeHiddenElements: true })).toHaveLength(4);
  });

  it('annonce le message Premium aux lecteurs d’écran (iOS)', async () => {
    jest.replaceProperty(Platform, 'OS', 'ios');
    const annonce = espionnerAnnonces();
    await renderRouter(ROUTES, { initialUrl: '/' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Au bureau, Premium' }));
    expect(annonce).toHaveBeenCalledWith('Bientôt avec Premium');
  });

  it('n’annonce pas deux fois le message Premium sur Android (zone live déjà en place)', async () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    const annonce = espionnerAnnonces();
    await renderRouter(ROUTES, { initialUrl: '/' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Au bureau, Premium' }));
    expect(screen.getByText('Bientôt avec Premium')).toBeTruthy();
    expect(annonce).not.toHaveBeenCalled();
  });

  it('ne lance qu’une séance malgré un double appui', async () => {
    await renderRouter(ROUTES, { initialUrl: '/' });
    const lancer = await screen.findByRole('button', { name: 'Lancer ma séance' });
    await fireEvent.press(lancer);
    await fireEvent.press(lancer);
    await waitFor(() => expect(screen).toHavePathname('/seance'));
    await fireEvent.press(await screen.findByRole('button', { name: 'Quitter la séance' }));
    await waitFor(() => expect(screen).toHavePathname('/'));
    expect(router.canGoBack()).toBe(false);
  });
});

describe('écran de séance', () => {
  it('démarre la séance avec le compteur et le minuteur', async () => {
    await renderRouter(ROUTES, { initialUrl: '/seance?contexte=maison&ressenti=mou&duree=5&graine=1' });
    expect(await screen.findByText('1 / 8')).toBeTruthy();
    expect(screen.getByText('0:05')).toBeTruthy();
  });

  it('renvoie au départ si les paramètres sont invalides', async () => {
    await renderRouter(ROUTES, { initialUrl: '/seance?contexte=bureau&ressenti=mou&duree=5&graine=1' });
    await waitFor(() => expect(screen).toHavePathname('/'));
  });

  it('termine la séance et affiche le bilan', async () => {
    await renderRouter(ROUTES, { initialUrl: '/seance?contexte=maison&ressenti=mou&duree=5&graine=1' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Terminer la séance' }));
    await waitFor(() => expect(screen).toHavePathname('/bravo'));
    expect(screen.getByText('Pas grave, on remet ça quand tu veux.')).toBeTruthy();
  });

  it('annonce la pause aux lecteurs d’écran (iOS)', async () => {
    jest.replaceProperty(Platform, 'OS', 'ios');
    const annonce = espionnerAnnonces();
    await renderRouter(ROUTES, { initialUrl: SEANCE });
    await fireEvent.press(await screen.findByRole('button', { name: 'Pause' }));
    expect(screen.getByText('En pause')).toBeTruthy();
    expect(annonce).toHaveBeenCalledWith('En pause');
  });

  it('n’annonce pas la pause deux fois sur Android', async () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    const annonce = espionnerAnnonces();
    await renderRouter(ROUTES, { initialUrl: SEANCE });
    await fireEvent.press(await screen.findByRole('button', { name: 'Pause' }));
    expect(screen.getByText('En pause')).toBeTruthy();
    expect(annonce).not.toHaveBeenCalled();
  });

  it('quitte vers le départ sur un lien direct, sans historique', async () => {
    await renderRouter(ROUTES, { initialUrl: SEANCE });
    await fireEvent.press(await screen.findByRole('button', { name: 'Quitter la séance' }));
    await waitFor(() => expect(screen).toHavePathname('/'));
  });
});

describe('effets de la séance', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  it('ne vibre pas au démarrage, puis vibre au passage de la transition à l’effort', async () => {
    await renderRouter(ROUTES, { initialUrl: SEANCE });
    expect(await screen.findByText('0:05')).toBeTruthy();
    expect(Haptics.impactAsync).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    expect(Haptics.impactAsync).toHaveBeenCalledTimes(1);
  });

  it('annonce l’exercice à chaque changement d’étape sur iOS, pas au démarrage', async () => {
    jest.replaceProperty(Platform, 'OS', 'ios');
    const annonce = espionnerAnnonces();
    await renderRouter(ROUTES, { initialUrl: SEANCE });
    expect(await screen.findByText('0:05')).toBeTruthy();
    expect(annonce).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    expect(annonce).toHaveBeenCalledTimes(1);
    expect(annonce).toHaveBeenCalledWith(expect.stringMatching(/\S/));
  });

  it('retient les exercices de la séance pour la prochaine fois', async () => {
    await renderRouter(ROUTES, { initialUrl: SEANCE });
    expect(await screen.findByText('1 / 8')).toBeTruthy();
    const ids = JSON.parse(memoire.contenu['flashcoach.derniers-exercices']) as string[];
    expect(ids).toHaveLength(8);
    expect(ids.every((id) => typeof id === 'string' && id !== '')).toBe(true);
  });

  it('mène au bilan quand la séance va jusqu’au bout', async () => {
    const { getSearchParams } = await renderRouter(ROUTES, { initialUrl: SEANCE });
    expect(await screen.findByText('1 / 8')).toBeTruthy();
    await act(async () => {
      jest.advanceTimersByTime(300_000);
    });
    expect(screen).toHavePathname('/bravo');
    expect(getSearchParams()).toEqual({ minutes: '5', exercices: '8', secondes: '300', seance: journalEnMemoire()[0].id });
  });
});

describe('écran Bravo', () => {
  it('résume la séance', async () => {
    await renderRouter(ROUTES, { initialUrl: '/bravo?minutes=5&exercices=8' });
    expect(await screen.findByText('Bravo !')).toBeTruthy();
    expect(screen.getByText('5 min · 8 exercices')).toBeTruthy();
  });

  it('remercie après la réponse à « Tu te sens mieux ? »', async () => {
    await renderRouter(ROUTES, { initialUrl: '/bravo?minutes=5&exercices=8' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Mieux' }));
    expect(screen.getByText('Merci !')).toBeTruthy();
  });

  it('félicite après des minutes d’effort sans exercice complet', async () => {
    await renderRouter(ROUTES, { initialUrl: '/bravo?minutes=3&exercices=0' });
    expect(await screen.findByText('Bravo !')).toBeTruthy();
    expect(screen.getByText('3 min')).toBeTruthy();
    expect(screen.queryByText('À bientôt !')).toBeNull();
  });

  it('reste doux quand rien n’a été fait', async () => {
    await renderRouter(ROUTES, { initialUrl: '/bravo?minutes=0&exercices=0' });
    expect(await screen.findByText('À bientôt !')).toBeTruthy();
    expect(screen.getByText('Pas grave, on remet ça quand tu veux.')).toBeTruthy();
  });

  it('cache la coche décorative aux lecteurs d’écran', async () => {
    await renderRouter(ROUTES, { initialUrl: '/bravo?minutes=5&exercices=8' });
    expect(await screen.findByText('Bravo !')).toBeTruthy();
    expect(screen.queryByText('✓')).toBeNull();
  });

  it('repart vers le départ', async () => {
    await renderRouter(ROUTES, { initialUrl: '/bravo?minutes=5&exercices=8' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Et on est repartis' }));
    await waitFor(() => expect(screen).toHavePathname('/'));
  });
});

describe('retour au départ après une séance', () => {
  it('revient au départ existant sans empiler un second écran', async () => {
    await renderRouter(ROUTES, { initialUrl: '/' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Lancer ma séance' }));
    await fireEvent.press(await screen.findByRole('button', { name: 'Terminer la séance' }));
    await waitFor(() => expect(screen).toHavePathname('/bravo'));
    await fireEvent.press(screen.getByRole('button', { name: 'Et on est repartis' }));
    await waitFor(() => expect(screen).toHavePathname('/'));
    expect(router.canGoBack()).toBe(false);
  });

  it('efface le message Premium au retour sur le départ', async () => {
    await renderRouter(ROUTES, { initialUrl: '/' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Au bureau, Premium' }));
    expect(screen.getByText('Bientôt avec Premium')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Lancer ma séance' }));
    await fireEvent.press(await screen.findByRole('button', { name: 'Terminer la séance' }));
    await waitFor(() => expect(screen).toHavePathname('/bravo'));
    await fireEvent.press(screen.getByRole('button', { name: 'Et on est repartis' }));
    await waitFor(() => expect(screen).toHavePathname('/'));
    expect(screen.queryByText('Bientôt avec Premium')).toBeNull();
  });

  it('relit les derniers exercices au retour : ceux de la séance qui vient d’avoir lieu', async () => {
    const { getSearchParams } = await renderRouter(ROUTES, { initialUrl: '/' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Lancer ma séance' }));
    await fireEvent.press(await screen.findByRole('button', { name: 'Terminer la séance' }));
    await waitFor(() => expect(screen).toHavePathname('/bravo'));
    const vus = JSON.parse(memoire.contenu['flashcoach.derniers-exercices']) as string[];
    expect(vus.length).toBeGreaterThan(0);

    await fireEvent.press(screen.getByRole('button', { name: 'Et on est repartis' }));
    await waitFor(() => expect(screen).toHavePathname('/'));
    await fireEvent.press(await screen.findByRole('button', { name: 'Lancer ma séance' }));
    await waitFor(() => expect(screen).toHavePathname('/seance'));
    expect(getSearchParams().exclure).toBe(vus.join(','));
  });
});

describe('journal : enregistrement', () => {
  it('crée une entrée écourtée dès le début de la séance', async () => {
    await renderRouter(ROUTES, { initialUrl: SEANCE });
    await waitFor(() => expect(journalEnMemoire()).toHaveLength(1));
    expect(journalEnMemoire()[0]).toMatchObject({
      contexteId: 'maison',
      ressenti: 'mou',
      duree: 5,
      graine: 1,
      terminee: false,
      apres: null,
      ecouleMs: 0,
      exercicesFaits: 0,
    });
    expect(journalEnMemoire()[0].exercices).toHaveLength(8);
  });

  it('marque la séance allée au bout et passe son identifiant à Bravo', async () => {
    jest.useFakeTimers();
    const { getSearchParams } = await renderRouter(ROUTES, { initialUrl: SEANCE });
    await act(async () => {
      jest.advanceTimersByTime(301000);
    });
    await waitFor(() => expect(screen).toHavePathname('/bravo'));
    const [entree] = journalEnMemoire();
    expect(journalEnMemoire()).toHaveLength(1);
    expect(entree).toMatchObject({ terminee: true, exercicesFaits: 8, ecouleMs: 300000 });
    expect(getSearchParams().seance).toBe(entree.id);
  });

  it('garde la séance écourtée quand on termine avant la fin', async () => {
    jest.useFakeTimers();
    await renderRouter(ROUTES, { initialUrl: SEANCE });
    await act(async () => {
      jest.advanceTimersByTime(7000);
    });
    await fireEvent.press(screen.getByRole('button', { name: 'Terminer la séance' }));
    await waitFor(() => expect(screen).toHavePathname('/bravo'));
    expect(journalEnMemoire()).toHaveLength(1);
    expect(journalEnMemoire()[0]).toMatchObject({ terminee: false, ecouleMs: 7000, exercicesFaits: 0 });
  });

  it('garde le temps fait quand on quitte la séance', async () => {
    jest.useFakeTimers();
    await renderRouter(ROUTES, { initialUrl: SEANCE });
    await act(async () => {
      jest.advanceTimersByTime(7000);
    });
    await fireEvent.press(screen.getByRole('button', { name: 'Quitter la séance' }));
    await waitFor(() => expect(journalEnMemoire()[0]).toMatchObject({ terminee: false, ecouleMs: 7000 }));
    expect(journalEnMemoire()).toHaveLength(1);
  });

  it('garde la séance écourtée quand on enchaîne « Passer » jusqu’à la fin', async () => {
    jest.useFakeTimers();
    await renderRouter(ROUTES, { initialUrl: SEANCE });
    for (let i = 0; i < 8; i += 1) {
      await fireEvent.press(await screen.findByRole('button', { name: 'Passer' }));
    }
    await waitFor(() => expect(screen).toHavePathname('/bravo'));
    expect(journalEnMemoire()).toHaveLength(1);
    expect(journalEnMemoire()[0]).toMatchObject({ terminee: false, exercicesFaits: 0 });
  });

  it('enregistre la réponse « Pareil »', async () => {
    memoire.contenu[CLE_JOURNAL] = JSON.stringify([fabriquerEntree({ id: 'e1' })]);
    await renderRouter(ROUTES, { initialUrl: '/bravo?minutes=5&exercices=8&seance=e1' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Pareil' }));
    await waitFor(() => expect(journalEnMemoire()[0].apres).toBe('pareil'));
    expect(screen.getByText('Merci !')).toBeTruthy();
  });

  it('remercie sans rien écrire quand Bravo n’a pas d’identifiant de séance', async () => {
    await renderRouter(ROUTES, { initialUrl: '/bravo?minutes=5&exercices=8' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Mieux' }));
    expect(screen.getByText('Merci !')).toBeTruthy();
    expect(memoire.contenu[CLE_JOURNAL]).toBeUndefined();
  });

  it('enregistre la réponse à « Tu te sens mieux ? »', async () => {
    memoire.contenu[CLE_JOURNAL] = JSON.stringify([fabriquerEntree({ id: 'e1' })]);
    await renderRouter(ROUTES, { initialUrl: '/bravo?minutes=5&exercices=8&seance=e1' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Mieux' }));
    await waitFor(() => expect(journalEnMemoire()[0].apres).toBe('mieux'));
    expect(screen.getByText('Merci !')).toBeTruthy();
  });

  it('pose la question dès 10 secondes d’activité, même sans minute ni exercice complet', async () => {
    memoire.contenu[CLE_JOURNAL] = JSON.stringify([fabriquerEntree({ id: 'e1', terminee: false })]);
    await renderRouter(ROUTES, { initialUrl: '/bravo?minutes=0&exercices=0&secondes=20&seance=e1' });
    expect(await screen.findByText('Bravo !')).toBeTruthy();
    expect(screen.getByText('Moins d’une minute')).toBeTruthy();
    await fireEvent.press(await screen.findByRole('button', { name: 'Mieux' }));
    await waitFor(() => expect(journalEnMemoire()[0].apres).toBe('mieux'));
    expect(screen.getByText('Merci !')).toBeTruthy();
  });

  it('ne pose pas la question sous 10 secondes sans exercice', async () => {
    await renderRouter(ROUTES, { initialUrl: '/bravo?minutes=0&exercices=0&secondes=3&seance=e1' });
    expect(await screen.findByText('À bientôt !')).toBeTruthy();
    expect(screen.queryByText('Tu te sens mieux ?')).toBeNull();
  });

  it('ne pose pas la question quand rien n’a été fait', async () => {
    await renderRouter(ROUTES, { initialUrl: '/bravo?minutes=0&exercices=0' });
    expect(await screen.findByText('À bientôt !')).toBeTruthy();
    expect(screen.queryByText('Tu te sens mieux ?')).toBeNull();
  });
});

describe('écran Mon journal', () => {
  it('s’ouvre depuis le départ sans gêner le lancement', async () => {
    await renderRouter(ROUTES, { initialUrl: '/' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Mon journal' }));
    await waitFor(() => expect(screen).toHavePathname('/journal'));
  });

  it('n’ouvre qu’un seul journal malgré un double appui', async () => {
    await renderRouter(ROUTES, { initialUrl: '/' });
    const lien = await screen.findByRole('button', { name: 'Mon journal' });
    await fireEvent.press(lien);
    await fireEvent.press(lien);
    await waitFor(() => expect(screen).toHavePathname('/journal'));
    await fireEvent.press(await screen.findByRole('button', { name: 'Retour' }));
    await waitFor(() => expect(screen).toHavePathname('/'));
    expect(router.canGoBack()).toBe(false);
  });

  it('rend chaque séance lisible d’un seul bloc par les lecteurs d’écran', async () => {
    memoire.contenu[CLE_JOURNAL] = JSON.stringify([fabriquerEntree({ id: 'a', apres: 'mieux' })]);
    await renderRouter(ROUTES, { initialUrl: '/journal' });
    expect(await screen.findByLabelText('dim. 18 oct. à 7h05, À la maison, Mou, puis Mieux, 5 min, 8 exercices')).toBeTruthy();
  });

  it('invite à faire une première séance quand il est vide', async () => {
    await renderRouter(ROUTES, { initialUrl: '/journal' });
    expect(await screen.findByText('Ta première séance apparaîtra ici.')).toBeTruthy();
  });

  it('montre la preuve de la promesse et les séances', async () => {
    memoire.contenu[CLE_JOURNAL] = JSON.stringify([
      fabriquerEntree({ id: 'a', apres: 'mieux' }),
      fabriquerEntree({ id: 'b', apres: 'pareil', contexteId: 'reveil', ressenti: 'raide' }),
      fabriquerEntree({ id: 'c', apres: null, terminee: false, ecouleMs: 20000, exercicesFaits: 0 }),
    ]);
    await renderRouter(ROUTES, { initialUrl: '/journal' });
    expect(await screen.findByText('Séances qui t’ont fait du bien : 1 sur 2')).toBeTruthy();
    expect(screen.getByText('À la maison · Mou → Mieux')).toBeTruthy();
    expect(screen.getByText('Au réveil · Raide → Pareil')).toBeTruthy();
    expect(screen.getByText('Moins d’une minute · écourtée')).toBeTruthy();
    expect(screen.getAllByText('dim. 18 oct. · 7h05')).toHaveLength(3);
  });

  it('remplace les emojis par les icônes du contexte et du ressenti', async () => {
    memoire.contenu[CLE_JOURNAL] = JSON.stringify([
      fabriquerEntree({ id: 'a', apres: 'mieux' }),
      fabriquerEntree({ id: 'b', apres: 'pareil', contexteId: 'reveil', ressenti: 'raide' }),
    ]);
    await renderRouter(ROUTES, { initialUrl: '/journal' });
    await screen.findByText('À la maison · Mou → Mieux');
    const toutes = { includeHiddenElements: true };
    for (const nom of ['maison', 'mou', 'mieux', 'reveil', 'raide', 'pareil']) {
      expect(screen.getAllByTestId(`icone-${nom}`, toutes)).toHaveLength(1);
    }
    expect(screen.queryAllByText(EMOJI)).toHaveLength(0);
  });
});
