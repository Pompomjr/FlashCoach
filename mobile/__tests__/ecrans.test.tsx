/// <reference path="../node_modules/expo-router/build/ts-declarations/expect.d.ts" />
import { fireEvent, waitFor } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { act, renderRouter, screen } from 'expo-router/testing-library';
import { AccessibilityInfo } from 'react-native';

import Layout from '../app/_layout';
import Depart from '../app/index';
import Bravo from '../app/bravo';
import EcranSeance from '../app/seance';
import { stockageTelephone } from '../src/preferences/stockage';

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

const memoire = stockageTelephone as unknown as { contenu: Record<string, string> };
const ROUTES = { _layout: Layout, index: Depart, seance: EcranSeance, bravo: Bravo };
const SEANCE = '/seance?contexte=maison&ressenti=mou&duree=5&graine=1';

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

  it('lance la séance en un seul tap et retient les choix', async () => {
    await renderRouter(ROUTES, { initialUrl: '/' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Lancer ma séance' }));
    await waitFor(() => expect(screen).toHavePathname('/seance'));
    expect(JSON.parse(memoire.contenu['flashcoach.choix'])).toEqual({ contexteId: 'maison', ressenti: 'mou', duree: 5 });
  });

  it('annonce Premium sans changer la sélection', async () => {
    await renderRouter(ROUTES, { initialUrl: '/' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Au bureau, Premium' }));
    expect(screen.getByText('Bientôt avec Premium 🔒')).toBeTruthy();
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
    expect(screen.getByText('Bientôt avec Premium 🔒')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Raide' }));
    expect(screen.queryByText('Bientôt avec Premium 🔒')).toBeNull();
  });

  it('annonce le message Premium aux lecteurs d’écran', async () => {
    const annonce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => undefined);
    await renderRouter(ROUTES, { initialUrl: '/' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Au bureau, Premium' }));
    expect(annonce).toHaveBeenCalledWith('Bientôt avec Premium 🔒');
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

  it('annonce la pause aux lecteurs d’écran', async () => {
    const annonce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => undefined);
    await renderRouter(ROUTES, { initialUrl: SEANCE });
    await fireEvent.press(await screen.findByRole('button', { name: 'Pause' }));
    expect(screen.getByText('En pause')).toBeTruthy();
    expect(annonce).toHaveBeenCalledWith('En pause');
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
    expect(getSearchParams()).toEqual({ minutes: '5', exercices: '8' });
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
