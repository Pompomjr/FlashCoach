import { act, renderHook } from '@testing-library/react-native';

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
});
