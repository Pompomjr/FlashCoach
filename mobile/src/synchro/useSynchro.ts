import { useEffect } from 'react';
import { AppState } from 'react-native';

import { demanderSynchro } from './instance';

// Monté une fois à la racine : au démarrage, puis à chaque retour de l'app au premier plan.
export function useSynchro(): void {
  useEffect(() => {
    demanderSynchro();
    const abonnement = AppState.addEventListener('change', (etat) => {
      if (etat === 'active') demanderSynchro();
    });
    return () => abonnement.remove();
  }, []);
}
