import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CONTEXTES } from '../src/catalogue/contextes';
import { formaterBilan, formaterDate, texteResume } from '../src/journal/affichage';
import { lireJournal, resumeJournal, type EntreeJournal } from '../src/journal/journal';
import { stockageTelephone } from '../src/preferences/stockage';
import { LIBELLES_RESSENTI } from '../src/ui/libelles';
import { COULEURS, ESPACE, RAYON } from '../src/ui/theme';

const LIBELLES_APRES = { mieux: '😊 Mieux', pareil: '😐 Pareil' } as const;

export default function Journal() {
  const [entrees, setEntrees] = useState<EntreeJournal[] | null>(null);

  // Relu à chaque affichage : une séance vient peut-être de se terminer.
  useFocusEffect(
    useCallback(() => {
      let actif = true;
      lireJournal(stockageTelephone).then((lues) => {
        if (actif) setEntrees(lues);
      });
      return () => {
        actif = false;
      };
    }, []),
  );

  const retour = () => (router.canGoBack() ? router.back() : router.replace('/'));
  const resume = entrees === null ? null : texteResume(resumeJournal(entrees));

  return (
    <SafeAreaView style={styles.ecran}>
      <View style={styles.entete}>
        <Pressable accessibilityRole="button" accessibilityLabel="Retour" onPress={retour} hitSlop={12}>
          <Text style={styles.retour}>‹</Text>
        </Pressable>
        <Text style={styles.titre} accessibilityRole="header">
          Mon journal
        </Text>
      </View>

      {entrees !== null && entrees.length === 0 && <Text style={styles.vide}>Ta première séance apparaîtra ici.</Text>}

      {entrees !== null && entrees.length > 0 && (
        <FlatList
          data={entrees}
          keyExtractor={(entree) => entree.id}
          contentContainerStyle={styles.liste}
          ListHeaderComponent={
            resume === null ? undefined : (
              <View style={styles.resume}>
                <Text style={styles.texteResume}>{resume}</Text>
              </View>
            )
          }
          renderItem={({ item }) => <LigneJournal entree={item} />}
        />
      )}
    </SafeAreaView>
  );
}

function LigneJournal({ entree }: { entree: EntreeJournal }) {
  const contexte = CONTEXTES.find((c) => c.id === entree.contexteId);
  const avant = LIBELLES_RESSENTI[entree.ressenti];
  const apres = entree.apres === null ? '' : ` → ${LIBELLES_APRES[entree.apres]}`;
  return (
    <View style={styles.ligne}>
      <Text style={styles.date}>{formaterDate(entree.debut)}</Text>
      <Text style={styles.principal}>
        {`${contexte?.emoji ?? '📍'} ${contexte?.nom ?? entree.contexteId} · ${avant.emoji} ${avant.libelle}${apres}`}
      </Text>
      <Text style={styles.detail}>{formaterBilan(entree.ecouleMs, entree.exercicesFaits, entree.terminee)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: COULEURS.fond },
  entete: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: ESPACE },
  retour: { color: COULEURS.texte, fontSize: 32, paddingHorizontal: 8 },
  titre: { color: COULEURS.texte, fontSize: 24, fontWeight: '800' },
  vide: { color: COULEURS.texteDiscret, fontSize: 16, textAlign: 'center', marginTop: 48, paddingHorizontal: ESPACE },
  liste: { padding: ESPACE, gap: 12 },
  resume: { backgroundColor: COULEURS.orange, borderRadius: RAYON, padding: ESPACE, marginBottom: 4 },
  texteResume: { color: COULEURS.texteSurOrange, fontSize: 18, fontWeight: '700' },
  ligne: { backgroundColor: COULEURS.carte, borderRadius: RAYON, padding: ESPACE, gap: 4 },
  date: { color: COULEURS.texteDiscret, fontSize: 14 },
  principal: { color: COULEURS.texte, fontSize: 16, fontWeight: '600' },
  detail: { color: COULEURS.texteDiscret, fontSize: 14 },
});
