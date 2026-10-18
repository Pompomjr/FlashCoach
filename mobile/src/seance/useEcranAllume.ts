import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useEffect } from 'react';

const ETIQUETTE = 'flashcoach-seance';

// L'écran allumé est un confort : il ne doit jamais être une cause d'erreur
// (sur le web, la désactivation avant l'activation rejette sa promesse).
export function useEcranAllume(): void {
  useEffect(() => {
    activateKeepAwakeAsync(ETIQUETTE).catch(() => undefined);
    return () => {
      deactivateKeepAwake(ETIQUETTE).catch(() => undefined);
    };
  }, []);
}
