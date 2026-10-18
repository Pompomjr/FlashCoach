import { act, renderHook } from '@testing-library/react-native';
import { AppState } from 'react-native';

import type { Bloc } from '../generateur/types';
import { fabriquerExercice } from '../test-utils/fabrique';
import { useLecteurSeance } from './useLecteurSeance';

const BLOCS: Bloc[] = [{ exercice: fabriquerExercice(), phase: 'coeur', transitionS: 5, effortS: 20 }];

describe('useLecteurSeance', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('fait avancer le minuteur avec le temps, et plus du tout en pause', async () => {
    const { result } = await renderHook(() => useLecteurSeance(BLOCS));
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(result.current.etat.restantMs).toBe(3000);

    await act(async () => {
      result.current.basculerPause();
    });
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(result.current.etat).toMatchObject({ enPause: true, restantMs: 3000 });
  });

  it('se met en pause quand l’app passe en arrière-plan, et se désabonne au démontage', async () => {
    const retirer = jest.fn();
    const ecoute = jest.spyOn(AppState, 'addEventListener').mockReturnValue({ remove: retirer });
    const { result, unmount } = await renderHook(() => useLecteurSeance(BLOCS));
    // Le dernier abonnement est celui du lecteur (React Native en crée un autre pour lui-même).
    const rappel = ecoute.mock.calls[ecoute.mock.calls.length - 1][1] as (statut: string) => void;

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    const avant = result.current.etat.restantMs;

    await act(async () => {
      rappel('background');
    });
    expect(result.current.etat.enPause).toBe(true);

    await act(async () => {
      jest.advanceTimersByTime(3000);
    });
    expect(result.current.etat.restantMs).toBe(avant);

    await unmount();
    expect(retirer).toHaveBeenCalledTimes(1);
    ecoute.mockRestore();
  });
});
