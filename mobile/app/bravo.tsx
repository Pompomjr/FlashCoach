import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { mettreAJourEntree, type Apres } from '../src/journal/journal';
import { stockageTelephone } from '../src/preferences/stockage';
import { Bouton } from '../src/ui/Bouton';
import { Celebration } from '../src/ui/Celebration';
import { COULEURS, ESPACE, TYPO } from '../src/ui/theme';

// En dessous de ce temps d'activité, sans exercice complet, on ne demande pas comment on se sent.
const SECONDES_MIN_ACTIVITE = 10;

function resume(minutes: number, exercices: number, rienFait: boolean): string {
  if (rienFait) return 'Pas grave, on remet ça quand tu veux.';
  const duree = minutes === 0 ? 'Moins d’une minute' : `${minutes} min`;
  if (exercices === 0) return duree;
  return `${duree} · ${exercices} exercice${exercices > 1 ? 's' : ''}`;
}

export default function Bravo() {
  const params = useLocalSearchParams<{ minutes: string; exercices: string; secondes: string; seance: string }>();
  const minutes = Number(params.minutes) || 0;
  const exercices = Number(params.exercices) || 0;
  // Sans paramètre « secondes » (ancien lien), on se rabat sur les minutes.
  const secondesBrutes = Number(params.secondes);
  const secondes = params.secondes !== undefined && Number.isFinite(secondesBrutes) ? secondesBrutes : minutes * 60;
  const [repondu, setRepondu] = useState(false);
  const rienFait = exercices === 0 && secondes < SECONDES_MIN_ACTIVITE;

  const repondre = (apres: Apres) => {
    if (params.seance) mettreAJourEntree(stockageTelephone, params.seance, { apres });
    setRepondu(true);
  };

  return (
    <SafeAreaView style={styles.ecran}>
      <View style={styles.centre}>
        <Celebration fete={!rienFait} />
        <Text style={styles.titre}>{rienFait ? 'À bientôt !' : 'Bravo !'}</Text>
        <Text style={styles.resume}>{resume(minutes, exercices, rienFait)}</Text>

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
  titre: { ...TYPO.displaySmall, color: COULEURS.texte },
  resume: { ...TYPO.bodyLarge, color: COULEURS.texte, textAlign: 'center' },
  question: { ...TYPO.titleMedium, color: COULEURS.texte, marginTop: 24 },
  ligne: { flexDirection: 'row', gap: 12, alignSelf: 'stretch' },
  moitie: { flex: 1 },
  merci: { ...TYPO.bodyLarge, color: COULEURS.texteDiscret },
});
