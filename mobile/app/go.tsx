import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { stockageTelephone } from '../src/preferences/stockage';
import { choisirLancement, intensiteDuLien, lireDonneesLancement, parametresLancement } from '../src/seance/lancement';
import { COULEURS } from '../src/ui/theme';

// Lien direct : flashcoach://go?objectif=calories|masse|etirements&intensite=1|2|3&duree=5|10|15|30. Une valeur
// absente ou inconnue reprend les derniers choix ; les autres paramètres (anciens compris) sont ignorés. Les choix
// du lien valent pour cette séance seulement : ils ne sont jamais enregistrés.
export default function Go() {
  const { objectif, intensite, duree } = useLocalSearchParams<{
    objectif?: string | string[];
    intensite?: string | string[];
    duree?: string | string[];
  }>();

  useEffect(() => {
    let actif = true;
    lireDonneesLancement(stockageTelephone).then((lues) => {
      if (!actif) return;
      const donnees = {
        ...lues,
        choix: choisirLancement({ objectif, duree }, lues.choix),
        niveau: intensiteDuLien(intensite, lues.niveau),
      };
      router.replace({ pathname: '/seance', params: parametresLancement(donnees, Date.now()) });
    });
    return () => {
      actif = false;
    };
  }, [objectif, intensite, duree]);

  return <View style={styles.ecran} />;
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: COULEURS.fond },
});
