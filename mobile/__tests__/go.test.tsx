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
import { fabriquerEntree } from '../src/test-utils/journal';

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
  it('lance l’objectif du lien avec les paramètres communs et revient à / sans repasser par go', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(123456);
    memoire.contenu['flashcoach.derniers-exercices'] = JSON.stringify(['a', 'b']);
    const { getSearchParams } = await renderRouter(ROUTES, { initialUrl: '/go?objectif=etirements' });
    await waitFor(() => expect(screen).toHavePathname('/seance'));
    expect(getSearchParams()).toEqual({ objectif: 'etirements', duree: '10', graine: '123456', exclure: 'a,b', niveau: '1' });
    expect(router.canGoBack()).toBe(true);
    await act(() => router.back());
    await waitFor(() => expect(screen).toHavePathname('/'));
    expect(router.canGoBack()).toBe(false);
  });

  it('lance à l’intensité enregistrée quand le lien n’en a pas ou qu’elle est invalide', async () => {
    memoire.contenu['flashcoach.niveau'] = '2';
    const { getSearchParams } = await renderRouter(ROUTES, { initialUrl: '/go?intensite=9' });
    await waitFor(() => expect(screen).toHavePathname('/seance'));
    expect(getSearchParams()).toMatchObject({ niveau: '2' });
  });

  it('lance à l’intensité du lien sans l’enregistrer', async () => {
    const { getSearchParams } = await renderRouter(ROUTES, { initialUrl: '/go?intensite=3' });
    await waitFor(() => expect(screen).toHavePathname('/seance'));
    expect(getSearchParams()).toMatchObject({ niveau: '3' });
    expect(memoire.contenu['flashcoach.niveau']).toBeUndefined();
  });

  it('reprend les derniers choix sans les modifier', async () => {
    const sauvegarde = JSON.stringify({ objectif: 'etirements', duree: 30 });
    memoire.contenu['flashcoach.choix.v2'] = sauvegarde;
    const { getSearchParams } = await renderRouter(ROUTES, { initialUrl: '/go' });
    await waitFor(() => expect(screen).toHavePathname('/seance'));
    expect(getSearchParams()).toMatchObject({ objectif: 'etirements', duree: '30' });
    expect(memoire.contenu['flashcoach.choix.v2']).toBe(sauvegarde);
  });

  it('ne sauvegarde pas les choix explicites du lien', async () => {
    const sauvegarde = JSON.stringify({ objectif: 'etirements', duree: 5 });
    memoire.contenu['flashcoach.choix.v2'] = sauvegarde;
    await renderRouter(ROUTES, { initialUrl: '/go?objectif=calories&duree=15&intensite=2' });
    await waitFor(() => expect(screen).toHavePathname('/seance'));
    expect(memoire.contenu['flashcoach.choix.v2']).toBe(sauvegarde);
  });

  it('lance une prise de masse en circuit : famille suivante du journal, tours selon la durée', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(7);
    memoire.contenu[CLE_JOURNAL] = JSON.stringify([fabriquerEntree({ circuitId: 'full-body-tonique', duree: 21, niveau: 2 })]);
    const { getSearchParams } = await renderRouter(ROUTES, { initialUrl: '/go?objectif=masse&intensite=2&duree=15' });
    await waitFor(() => expect(screen).toHavePathname('/seance'));
    expect(getSearchParams()).toEqual({ circuit: 'poussee-tonique', tours: '3', sansMateriel: '0', graine: '7' });
  });

  it.each(['/go?duree=abc', '/go?objectif=lune&intensite=x', '/go', '/go?contexte=bureau&ressenti=raide&niveau=3'])(
    'lance les valeurs par défaut pour %s, anciens paramètres ignorés',
    async (initialUrl) => {
      const { getSearchParams } = await renderRouter(ROUTES, { initialUrl });
      await waitFor(() => expect(screen).toHavePathname('/seance'));
      expect(getSearchParams()).toMatchObject({ objectif: 'calories', duree: '10', niveau: '1' });
      expect(getSearchParams()).not.toHaveProperty('contexte');
      expect(getSearchParams()).not.toHaveProperty('ressenti');
      expect(memoire.contenu['flashcoach.choix.v2']).toBeUndefined();
    },
  );

  it.each([5, 10, 15, 30])('autorise la durée %s comme le départ', async (duree) => {
    const { getSearchParams } = await renderRouter(ROUTES, { initialUrl: `/go?duree=${duree}` });
    await waitFor(() => expect(screen).toHavePathname('/seance'));
    expect(getSearchParams().duree).toBe(String(duree));
  });

  it('ramène la durée 3, supprimée, aux derniers choix', async () => {
    const { getSearchParams } = await renderRouter(ROUTES, { initialUrl: '/go?duree=3' });
    await waitFor(() => expect(screen).toHavePathname('/seance'));
    expect(getSearchParams().duree).toBe('10');
  });
});
