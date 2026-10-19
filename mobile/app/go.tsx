import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { lireChoix, lireDerniersExercices } from '../src/preferences/preferences';
import { stockageTelephone } from '../src/preferences/stockage';
import { choisirLancement, lancementDisponible, parametresLancement } from '../src/seance/lancement';
import { COULEURS } from '../src/ui/theme';

export default function Go() {
  const { contexte, ressenti, duree } = useLocalSearchParams<{
    contexte?: string | string[];
    ressenti?: string | string[];
    duree?: string | string[];
  }>();

  useEffect(() => {
    let actif = true;
    Promise.all([lireChoix(stockageTelephone), lireDerniersExercices(stockageTelephone)])
      .then(([derniers, exercices]) => {
        if (!actif) return;
        const choix = choisirLancement({ contexte, ressenti, duree }, derniers);
        if (!lancementDisponible(choix)) {
          router.replace('/');
          return;
        }
        router.replace({ pathname: '/seance', params: parametresLancement(choix, exercices, Date.now()) });
      });
    return () => { actif = false; };
  }, [contexte, ressenti, duree]);

  return <View style={styles.ecran} />;
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: COULEURS.fond },
});
