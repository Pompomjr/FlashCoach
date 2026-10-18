import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useEffect } from 'react';

const ETIQUETTE = 'flashcoach-seance';

// L'écran allumé est un confort : il ne doit jamais être une cause d'erreur.
// On attend la fin de l'activation avant de désactiver : sur le web, désactiver trop tôt
// ne retire rien, puis l'activation tardive laisserait l'écran allumé pour toujours.
export function useEcranAllume(): void {
  useEffect(() => {
    const activation = activateKeepAwakeAsync(ETIQUETTE).catch(() => undefined);
    return () => {
      activation.then(() => deactivateKeepAwake(ETIQUETTE)).catch(() => undefined);
    };
  }, []);
}
