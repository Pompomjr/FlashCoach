/// <reference path="../node_modules/expo-router/build/ts-declarations/expect.d.ts" />
import { waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { act, renderRouter, screen } from 'expo-router/testing-library';
import * as Layout from '../app/_layout';
import Depart from '../app/index';
import Go from '../app/go';
import EcranSeance from '../app/seance';
import { stockageTelephone } from '../src/preferences/stockage';
import { CLE_JOURNAL } from '../src/journal/journal';

jest.mock('../src/synchro/instance', () => ({ authApp: null, moteurApp: null, demanderSynchro: jest.fn() }));
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
  notificationAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Medium: 'medium' },
  NotificationFeedbackType: { Success: 'success' },
}));

const ROUTES = { _layout: Layout, index: Depart, go: Go, seance: EcranSeance };
const memoire = stockageTelephone as unknown as { contenu: Record<string, string> };

beforeEach(() => {
  for (const cle of Object.keys(memoire.contenu)) delete memoire.contenu[cle];
});
afterEach(() => jest.restoreAllMocks());

describe('lien direct go', () => {
  it('lance le réveil avec les paramètres communs et revient à / sans repasser par go', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(123456);
    memoire.contenu['flashcoach.derniers-exercices'] = JSON.stringify(['a', 'b']);
    const { getSearchParams } = await renderRouter(ROUTES, { initialUrl: '/go?contexte=reveil' });
    await waitFor(() => expect(screen).toHavePathname('/seance'));
    expect(getSearchParams()).toMatchObject({ contexte: 'reveil', ressenti: 'mou', duree: '5', graine: '123456', exclure: 'a,b' });
    expect(router.canGoBack()).toBe(true);
    await act(() => router.back());
    await waitFor(() => expect(screen).toHavePathname('/'));
    expect(router.canGoBack()).toBe(false);
  });

  it('reprend les derniers choix sans les modifier', async () => {
    const sauvegarde = JSON.stringify({ contexteId: 'reveil', ressenti: 'raide', duree: 5 });
    memoire.contenu['flashcoach.choix'] = sauvegarde;
    const { getSearchParams } = await renderRouter(ROUTES, { initialUrl: '/go' });
    await waitFor(() => expect(screen).toHavePathname('/seance'));
    expect(getSearchParams()).toMatchObject({ contexte: 'reveil', ressenti: 'raide', duree: '5' });
    expect(memoire.contenu['flashcoach.choix']).toBe(sauvegarde);
  });

  it('ne sauvegarde pas les choix explicites du lien', async () => {
    const sauvegarde = JSON.stringify({ contexteId: 'maison', ressenti: 'raide', duree: 5 });
    memoire.contenu['flashcoach.choix'] = sauvegarde;
    await renderRouter(ROUTES, { initialUrl: '/go?contexte=reveil&ressenti=stresse' });
    await waitFor(() => expect(screen).toHavePathname('/seance'));
    expect(memoire.contenu['flashcoach.choix']).toBe(sauvegarde);
  });

  it('renvoie un contexte Premium vers le départ sans erreur', async () => {
    await renderRouter(ROUTES, { initialUrl: '/go?contexte=bureau' });
    await waitFor(() => expect(screen).toHavePathname('/'));
    expect(screen.queryByText('Bientôt avec Premium')).toBeNull();
    expect(memoire.contenu[CLE_JOURNAL]).toBeUndefined();
  });

  it.each(['/go?duree=abc', '/go?contexte=inconnu&ressenti=inconnu', '/go'])('lance les valeurs par défaut pour %s', async (initialUrl) => {
    const { getSearchParams } = await renderRouter(ROUTES, { initialUrl });
    await waitFor(() => expect(screen).toHavePathname('/seance'));
    expect(getSearchParams()).toMatchObject({ contexte: 'maison', ressenti: 'mou', duree: '5' });
    expect(memoire.contenu['flashcoach.choix']).toBeUndefined();
  });

  it.each([3, 10])('autorise la durée %s comme le départ', async (duree) => {
    const { getSearchParams } = await renderRouter(ROUTES, { initialUrl: `/go?duree=${duree}` });
    await waitFor(() => expect(screen).toHavePathname('/seance'));
    expect(getSearchParams().duree).toBe(String(duree));
  });
});
