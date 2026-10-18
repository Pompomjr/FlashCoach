import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CONTEXTES } from '../src/catalogue/contextes';
import { formaterBilan, formaterDate, texteResume } from '../src/journal/affichage';
import { lireJournal, resumeJournal, type EntreeJournal } from '../src/journal/journal';
import { stockageTelephone } from '../src/preferences/stockage';
import { ICONE_APRES, ICONE_CONTEXTE, ICONE_RESSENTI, Icone } from '../src/ui/icones';
import { LIBELLES_RESSENTI } from '../src/ui/libelles';
import { CIBLE_MIN, COULEURS, ELEVATION, ESPACE, RAYON, TYPO } from '../src/ui/theme';
import { ondulation } from '../src/ui/toucher';

const LIBELLES_APRES = {
  mieux: { libelle: 'Mieux' },
  pareil: { libelle: 'Pareil' },
} as const;

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
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retour"
          onPress={retour}
          android_ripple={ondulation(COULEURS.texte)}
          style={styles.retour}
        >
          <Icone nom="retour" taille={28} />
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
            <View style={styles.resume}>
              <Text style={styles.texteResume}>{resume}</Text>
            </View>
          }
          renderItem={({ item }) => <LigneJournal entree={item} />}
        />
      )}
    </SafeAreaView>
  );
}

function LigneJournal({ entree }: { entree: EntreeJournal }) {
  const contexte = CONTEXTES.find((c) => c.id === entree.contexteId);
  const nomContexte = contexte?.nom ?? entree.contexteId;
  const avant = LIBELLES_RESSENTI[entree.ressenti];
  const apres = entree.apres === null ? null : LIBELLES_APRES[entree.apres];
  const iconeContexte = ICONE_CONTEXTE[entree.contexteId];
  const date = formaterDate(entree.debut);
  const bilan = formaterBilan(entree.ecouleMs, entree.exercicesFaits, entree.terminee);
  // Un seul élément accessible, lu en phrase : les icônes et la flèche ne sont pas prononcées.
  const lecture = [
    date.replace(' · ', ' à '),
    nomContexte,
    apres === null ? avant.libelle : `${avant.libelle}, puis ${apres.libelle}`,
    bilan.replaceAll(' · ', ', '),
  ].join(', ');
  return (
    <View style={styles.ligne} accessible accessibilityLabel={lecture}>
      <View style={styles.pastille}>
        {iconeContexte !== undefined && <Icone nom={iconeContexte} taille={22} />}
      </View>
      <View style={styles.corps}>
        <Text style={styles.date}>{date}</Text>
        <Text style={styles.principal}>
          {`${nomContexte} · ${avant.libelle}${apres === null ? '' : ` → ${apres.libelle}`}`}
        </Text>
        <Text style={styles.detail}>{bilan}</Text>
      </View>
      <View style={styles.ressentis}>
        <Icone nom={ICONE_RESSENTI[entree.ressenti]} taille={22} couleur={COULEURS.texteDiscret} />
        {entree.apres !== null && (
          <>
            <View style={styles.fleche}>
              <Icone nom="retour" taille={16} couleur={COULEURS.texteDiscret} />
            </View>
            <Icone nom={ICONE_APRES[entree.apres]} taille={22} couleur={COULEURS.orange} />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: COULEURS.fond },
  entete: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: ESPACE },
  retour: { width: CIBLE_MIN, height: CIBLE_MIN, borderRadius: CIBLE_MIN / 2, alignItems: 'center', justifyContent: 'center' },
  titre: { ...TYPO.headlineMedium, color: COULEURS.texte },
  vide: { ...TYPO.bodyLarge, color: COULEURS.texteDiscret, textAlign: 'center', marginTop: 48, paddingHorizontal: ESPACE },
  liste: { padding: ESPACE, gap: 12 },
  resume: { backgroundColor: COULEURS.orange, borderRadius: RAYON, padding: ESPACE, marginBottom: 4, ...ELEVATION.niveau2 },
  texteResume: { ...TYPO.titleMedium, color: COULEURS.texteSurOrange },
  ligne: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COULEURS.carte, borderRadius: RAYON, padding: ESPACE, ...ELEVATION.niveau1 },
  pastille: { width: 40, height: 40, borderRadius: 20, backgroundColor: COULEURS.fond, alignItems: 'center', justifyContent: 'center' },
  corps: { flex: 1, gap: 2 },
  ressentis: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  fleche: { transform: [{ rotate: '180deg' }] },
  date: { ...TYPO.bodyMedium, color: COULEURS.texteDiscret },
  principal: { ...TYPO.labelLarge, color: COULEURS.texte },
  detail: { ...TYPO.bodyMedium, color: COULEURS.texteDiscret },
});
