import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { CONTEXTES } from '../src/catalogue/contextes';
import { EXERCICES } from '../src/catalogue/exercices';
import { genererSeance } from '../src/generateur/generer';

// Écran provisoire du jalon 1 : affiche une séance générée pour vérifier que tout s'assemble.
// Remplacé au jalon 2 par le parcours « Où es-tu ? » → « Comment tu te sens ? » → Go.
export default function Accueil() {
  const reveil = CONTEXTES[0];
  // La graine est tirée une seule fois au montage : une nouvelle page donne une nouvelle séance.
  const [graine] = useState(() => Date.now());
  const seance = useMemo(
    () =>
      genererSeance(
        { contexteId: reveil.id, contraintes: reveil.contraintes, ressenti: 'mou', duree: 5, graine },
        EXERCICES,
      ),
    [reveil, graine],
  );

  return (
    <ScrollView contentContainerStyle={styles.conteneur}>
      <Text style={styles.titre}>Flash Coach</Text>
      <Text style={styles.sousTitre}>
        {reveil.emoji} {reveil.nom} · Mou · 5 min
      </Text>
      {seance.blocs.map((bloc, index) => (
        <View key={`${bloc.exercice.id}-${index}`} style={styles.bloc}>
          <Text style={styles.nom}>{bloc.exercice.nom}</Text>
          <Text style={styles.detail}>
            {bloc.phase} · {bloc.effortS} s
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  conteneur: { flexGrow: 1, gap: 12, padding: 24, paddingTop: 64, backgroundColor: '#EDF2F7' },
  titre: { fontSize: 32, fontWeight: '700', color: '#3A506B' },
  sousTitre: { fontSize: 16, color: '#2D3748', marginBottom: 8 },
  bloc: { padding: 16, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#F97316', backgroundColor: '#FFFFFF' },
  nom: { fontSize: 18, fontWeight: '600', color: '#2D3748' },
  detail: { fontSize: 14, color: '#3A506B', marginTop: 4 },
});
