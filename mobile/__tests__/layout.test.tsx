import { renderRouter, screen } from 'expo-router/testing-library';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Text } from 'react-native';

import Layout from '../app/_layout';

jest.mock('../src/synchro/instance', () => ({ authApp: null, moteurApp: null, demanderSynchro: jest.fn() }));
jest.mock('expo-font', () => ({ useFonts: jest.fn() }));
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(() => Promise.resolve(true)),
  hideAsync: jest.fn(() => Promise.resolve()),
}));

const ROUTES = { _layout: Layout, index: () => <Text>Accueil</Text> };

beforeEach(() => {
  jest.mocked(SplashScreen.hideAsync).mockClear();
});

describe('chargement de la police d’affichage', () => {
  it('garde l’écran de démarrage tant que la police charge, sans rien afficher', async () => {
    jest.mocked(useFonts).mockReturnValue([false, null]);
    await renderRouter(ROUTES, { initialUrl: '/' });
    expect(screen.queryByText('Accueil')).toBeNull();
    expect(SplashScreen.hideAsync).not.toHaveBeenCalled();
  });

  it('affiche l’app et lève l’écran de démarrage une fois la police chargée', async () => {
    jest.mocked(useFonts).mockReturnValue([true, null]);
    await renderRouter(ROUTES, { initialUrl: '/' });
    expect(await screen.findByText('Accueil')).toBeTruthy();
    expect(SplashScreen.hideAsync).toHaveBeenCalledTimes(1);
  });

  it('continue en police système si le chargement échoue', async () => {
    jest.mocked(useFonts).mockReturnValue([false, new Error('police introuvable')]);
    await renderRouter(ROUTES, { initialUrl: '/' });
    expect(await screen.findByText('Accueil')).toBeTruthy();
    expect(SplashScreen.hideAsync).toHaveBeenCalledTimes(1);
  });

  it('demande les deux graisses de Barlow Condensed (700 et 800)', async () => {
    jest.mocked(useFonts).mockReturnValue([true, null]);
    await renderRouter(ROUTES, { initialUrl: '/' });
    const table = jest.mocked(useFonts).mock.calls.at(-1)?.[0] as Record<string, unknown>;
    expect(Object.keys(table).sort()).toEqual(['BarlowCondensed_700Bold', 'BarlowCondensed_800ExtraBold']);
  });
});
