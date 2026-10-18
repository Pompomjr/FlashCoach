import { useEffect, useReducer, useRef } from 'react';
import { AppState } from 'react-native';

import type { Bloc } from '../generateur/types';
import { creerEtatInitial, lecteur } from './lecteur';

const PAS_MS = 250;

export function useLecteurSeance(blocs: Bloc[]) {
  const [etat, envoyer] = useReducer(lecteur, blocs, creerEtatInitial);
  const dernierInstant = useRef<number | null>(null);

  // On mesure le temps réellement écoulé : un minuteur JavaScript peut prendre du retard.
  useEffect(() => {
    if (etat.termine || etat.enPause) {
      dernierInstant.current = null;
      return;
    }
    dernierInstant.current = Date.now();
    const minuteur = setInterval(() => {
      const maintenant = Date.now();
      const ecoule = maintenant - (dernierInstant.current ?? maintenant);
      dernierInstant.current = maintenant;
      envoyer({ type: 'avancer', ms: ecoule });
    }, PAS_MS);
    return () => clearInterval(minuteur);
  }, [etat.termine, etat.enPause]);

  // Appel, notification, app en arrière-plan : la séance se met en pause.
  useEffect(() => {
    const abonnement = AppState.addEventListener('change', (statut) => {
      if (statut !== 'active') envoyer({ type: 'pause' });
    });
    return () => abonnement.remove();
  }, []);

  return {
    etat,
    passer: () => envoyer({ type: 'passer' }),
    basculerPause: () => envoyer({ type: etat.enPause ? 'reprendre' : 'pause' }),
    terminer: () => envoyer({ type: 'terminer' }),
  };
}
