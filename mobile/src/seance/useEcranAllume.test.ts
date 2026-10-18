import { act, renderHook } from '@testing-library/react-native';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

import { useEcranAllume } from './useEcranAllume';

jest.mock('expo-keep-awake', () => ({
  activateKeepAwakeAsync: jest.fn(),
  deactivateKeepAwake: jest.fn(() => Promise.resolve()),
}));

describe('useEcranAllume', () => {
  it('désactive l’écran allumé une fois l’activation conclue, même si on démonte avant', async () => {
    let conclure: () => void = () => undefined;
    jest.mocked(activateKeepAwakeAsync).mockReturnValue(
      new Promise<void>((resolve) => {
        conclure = resolve;
      }),
    );
    const { unmount } = await renderHook(() => useEcranAllume());
    await unmount();
    expect(deactivateKeepAwake).not.toHaveBeenCalled();

    await act(async () => {
      conclure();
    });
    expect(deactivateKeepAwake).toHaveBeenCalledTimes(1);
  });

  it('absorbe l’échec de l’activation', async () => {
    jest.mocked(activateKeepAwakeAsync).mockReturnValue(Promise.reject(new Error('indisponible')));
    const { unmount } = await renderHook(() => useEcranAllume());
    await unmount();
    await act(async () => undefined);
  });
});
