import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { NIVEAUX, type Niveau } from '../src/catalogue/types';
import { lireNiveau } from '../src/preferences/niveau';
import { lireChoix, lireDerniersExercices } from '../src/preferences/preferences';
import { stockageTelephone } from '../src/preferences/stockage';
import { choisirLancement, lancementDisponible, parametresLancement } from '../src/seance/lancement';
import { COULEURS } from '../src/ui/theme';

// Un niveau valide dans le lien vaut pour cette séance seulement : il n'est jamais enregistré.
function niveauDuLien(brut: string | string[] | undefined): Niveau | null {
  const niveau = Number(Array.isArray(brut) ? brut[0] : brut) as Niveau;
  return NIVEAUX.includes(niveau) ? niveau : null;
}

export default function Go() {
  const { contexte, ressenti, duree, niveau } = useLocalSearchParams<{
    contexte?: string | string[];
    ressenti?: string | string[];
    duree?: string | string[];
    niveau?: string | string[];
  }>();

  useEffect(() => {
    let actif = true;
    Promise.all([lireChoix(stockageTelephone), lireDerniersExercices(stockageTelephone), lireNiveau(stockageTelephone)])
      .then(([derniers, exercices, niveauEnregistre]) => {
        if (!actif) return;
        const choix = choisirLancement({ contexte, ressenti, duree }, derniers);
        if (!lancementDisponible(choix)) {
          router.replace('/');
          return;
        }
        router.replace({ pathname: '/seance', params: parametresLancement(choix, exercices, Date.now(), niveauDuLien(niveau) ?? niveauEnregistre) });
      });
    return () => { actif = false; };
  }, [contexte, ressenti, duree, niveau]);

  return <View style={styles.ecran} />;
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: COULEURS.fond },
});
