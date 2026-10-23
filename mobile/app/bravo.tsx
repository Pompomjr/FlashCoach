import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NOMS_NIVEAU } from '../src/catalogue/types';
import { mettreAJourEntree, type Apres, type Effort } from '../src/journal/journal';
import { ajusterNiveau } from '../src/preferences/niveau';
import { stockageTelephone } from '../src/preferences/stockage';
import { demanderSynchro } from '../src/synchro/instance';
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
  // Texte qui remplace la ligne « L’effort ? » une fois la réponse donnée.
  const effortEnvoye = useRef(false);
  // Ajustement du niveau en cours : « Et on est repartis » l'attend, pour que le départ relise le nouveau niveau.
  const ajustement = useRef<Promise<void> | null>(null);
  const [suiteEffort, setSuiteEffort] = useState<string | null>(null);
  const rienFait = exercices === 0 && secondes < SECONDES_MIN_ACTIVITE;

  const repondre = (apres: Apres) => {
    if (params.seance) mettreAJourEntree(stockageTelephone, params.seance, { apres }).then(demanderSynchro);
    setRepondu(true);
  };

  // Indépendante de « Tu te sens mieux ? » : l'effort ajuste l'intensité présélectionnée au départ (Léger ↔ Moyen ↔ Lourd).
  const repondreEffort = (effort: Effort) => {
    // Un double appui ne doit pas ajuster le niveau deux fois.
    if (effortEnvoye.current) return;
    effortEnvoye.current = true;
    if (params.seance) mettreAJourEntree(stockageTelephone, params.seance, { effort }).then(demanderSynchro);
    ajustement.current = ajusterNiveau(stockageTelephone, effort).then(({ avant, apres }) => {
      setSuiteEffort(apres !== avant ? `Prochaine séance : intensité ${NOMS_NIVEAU[apres]}` : 'Noté !');
    }).catch(() => undefined);
  };

  const repartir = () => {
    const enCours = ajustement.current;
    // Cette promesse n'est jamais rejetée (le .catch plus haut l'absorbe) : on repart toujours.
    if (enCours === null) router.dismissTo('/');
    else enCours.then(() => router.dismissTo('/'));
  };

  return (
    <SafeAreaView style={styles.ecran}>
      <ScrollView contentContainerStyle={styles.centre}>
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

            <Text style={styles.question}>L’effort ?</Text>
            {suiteEffort !== null ? (
              <Text style={styles.merci} accessibilityLiveRegion="polite">
                {suiteEffort}
              </Text>
            ) : (
              <View style={styles.ligne}>
                <Bouton libelle="Trop facile" lignes={2} variante="secondaire" onPress={() => repondreEffort('facile')} style={styles.tiers} />
                <Bouton libelle="Juste bien" lignes={2} variante="secondaire" onPress={() => repondreEffort('juste')} style={styles.tiers} />
                <Bouton libelle="Trop dur" lignes={2} variante="secondaire" onPress={() => repondreEffort('dur')} style={styles.tiers} />
              </View>
            )}
          </>
        )}
      </ScrollView>
      <Bouton libelle="Et on est repartis" onPress={repartir} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: COULEURS.fond, padding: ESPACE },
  // Centré tant que tout tient ; défile sur un petit écran sans jamais masquer « Et on est repartis ».
  centre: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  titre: { ...TYPO.displaySmall, color: COULEURS.texte },
  resume: { ...TYPO.bodyLarge, color: COULEURS.texte, textAlign: 'center' },
  question: { ...TYPO.titleMedium, color: COULEURS.texte, marginTop: 16 },
  ligne: { flexDirection: 'row', gap: 12, alignSelf: 'stretch' },
  moitie: { flex: 1 },
  // Trois boutons de front : peu de marge latérale pour que « Trop facile » tienne sur deux lignes au plus.
  tiers: { flex: 1, paddingHorizontal: 8 },
  merci: { ...TYPO.bodyLarge, color: COULEURS.texteDiscret },
});
