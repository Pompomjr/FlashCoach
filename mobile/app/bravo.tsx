import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { mettreAJourEntree, type Apres } from '../src/journal/journal';
import { stockageTelephone } from '../src/preferences/stockage';
import { Bouton } from '../src/ui/Bouton';
import { COULEURS, ESPACE } from '../src/ui/theme';

function resume(minutes: number, exercices: number): string {
  if (exercices === 0 && minutes === 0) return 'Pas grave, on remet ça quand tu veux.';
  const duree = minutes === 0 ? 'Moins d’une minute' : `${minutes} min`;
  if (exercices === 0) return duree;
  return `${duree} · ${exercices} exercice${exercices > 1 ? 's' : ''}`;
}

export default function Bravo() {
  const params = useLocalSearchParams<{ minutes: string; exercices: string; seance: string }>();
  const minutes = Number(params.minutes) || 0;
  const exercices = Number(params.exercices) || 0;
  const [repondu, setRepondu] = useState(false);
  const rienFait = exercices === 0 && minutes === 0;

  const repondre = (apres: Apres) => {
    if (params.seance) mettreAJourEntree(stockageTelephone, params.seance, { apres });
    setRepondu(true);
  };

  return (
    <SafeAreaView style={styles.ecran}>
      <View style={styles.centre}>
        <View style={styles.coche} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Text style={styles.texteCoche}>✓</Text>
        </View>
        <Text style={styles.titre}>{rienFait ? 'À bientôt !' : 'Bravo !'}</Text>
        <Text style={styles.resume}>{resume(minutes, exercices)}</Text>

        {!rienFait && (
          <>
            <Text style={styles.question}>Tu te sens mieux ?</Text>
            {repondu ? (
              <Text style={styles.merci}>Merci !</Text>
            ) : (
              <View style={styles.ligne}>
                <Bouton libelle="Mieux" variante="secondaire" onPress={() => repondre('mieux')} style={styles.moitie} />
                <Bouton libelle="Pareil" variante="secondaire" onPress={() => repondre('pareil')} style={styles.moitie} />
              </View>
            )}
          </>
        )}
      </View>
      <Bouton libelle="Et on est repartis" onPress={() => router.dismissTo('/')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: COULEURS.fond, padding: ESPACE },
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  coche: { width: 96, height: 96, borderRadius: 48, backgroundColor: COULEURS.orange, alignItems: 'center', justifyContent: 'center' },
  texteCoche: { color: COULEURS.texteSurOrange, fontSize: 48, fontWeight: '800' },
  titre: { color: COULEURS.texte, fontSize: 36, fontWeight: '800' },
  resume: { color: COULEURS.texte, fontSize: 18, textAlign: 'center' },
  question: { color: COULEURS.texte, fontSize: 18, fontWeight: '700', marginTop: 24 },
  ligne: { flexDirection: 'row', gap: 12, alignSelf: 'stretch' },
  moitie: { flex: 1 },
  merci: { color: COULEURS.texteDiscret, fontSize: 18 },
});
