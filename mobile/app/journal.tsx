import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CONTEXTES } from '../src/catalogue/contextes';
import { Figurine } from '../src/illustrations/Figurine';
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

      {entrees !== null && entrees.length === 0 && (
        <View style={styles.vide}>
          {/* Décor : la figurine au repos attend la première séance. */}
          <View style={styles.medaillon} aria-hidden>
            <Figurine exerciceId="respiration-carree" libelle="Figurine au repos" anime={false} taille={150} />
          </View>
          <Text style={styles.texteVide}>Ta première séance apparaîtra ici.</Text>
        </View>
      )}

      {entrees !== null && entrees.length > 0 && (
        <FlatList
          data={entrees}
          keyExtractor={(entree) => entree.id}
          contentContainerStyle={styles.liste}
          ListHeaderComponent={
            <View style={styles.resume}>
              <View style={styles.iconeResume}>
                <Icone nom="mieux" taille={28} couleur={COULEURS.orange} />
              </View>
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
        {/* Les icônes avant → après partagent la ligne de la date : le texte principal garde toute la largeur. */}
        <View style={styles.enHaut}>
          <Text style={styles.date}>{date}</Text>
          <View style={styles.ressentis}>
            <Icone nom={ICONE_RESSENTI[entree.ressenti]} taille={20} couleur={COULEURS.texteDiscret} />
            {entree.apres !== null && (
              <>
                <View style={styles.fleche}>
                  <Icone nom="retour" taille={14} couleur={COULEURS.texteDiscret} />
                </View>
                {/* Sur la carte bleue, l'orange seul manque de contraste : l'icône se pose sur une pastille. */}
                <View style={styles.pastilleApres}>
                  <Icone nom={ICONE_APRES[entree.apres]} taille={18} couleur={COULEURS.texteSurOrange} />
                </View>
              </>
            )}
          </View>
        </View>
        <Text style={styles.principal}>
          {`${nomContexte} · ${avant.libelle}${apres === null ? '' : ` → ${apres.libelle}`}`}
        </Text>
        <Text style={styles.detail}>{bilan}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: COULEURS.fond },
  entete: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: ESPACE },
  retour: { width: CIBLE_MIN, height: CIBLE_MIN, borderRadius: CIBLE_MIN / 2, alignItems: 'center', justifyContent: 'center' },
  titre: { ...TYPO.headlineMedium, color: COULEURS.texte },
  vide: { alignItems: 'center', gap: 20, marginTop: 40, paddingHorizontal: ESPACE },
  medaillon: {
    width: 176,
    height: 176,
    borderRadius: 88,
    backgroundColor: COULEURS.carteClaire,
    alignItems: 'center',
    justifyContent: 'center',
    ...ELEVATION.niveau1,
  },
  texteVide: { ...TYPO.titleMedium, color: COULEURS.texte, textAlign: 'center' },
  liste: { padding: ESPACE, gap: 12 },
  resume: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: COULEURS.orange,
    borderRadius: RAYON,
    padding: ESPACE,
    marginBottom: 4,
    ...ELEVATION.niveau2,
  },
  iconeResume: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COULEURS.texteSurOrange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texteResume: { ...TYPO.titleMedium, color: COULEURS.texteSurOrange, flex: 1 },
  pastilleApres: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COULEURS.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ligne: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COULEURS.carte, borderRadius: RAYON, padding: ESPACE, ...ELEVATION.niveau1 },
  pastille: { width: 40, height: 40, borderRadius: 20, backgroundColor: COULEURS.fond, alignItems: 'center', justifyContent: 'center' },
  corps: { flex: 1, gap: 2 },
  enHaut: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, minHeight: 26 },
  ressentis: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  fleche: { transform: [{ rotate: '180deg' }] },
  date: { ...TYPO.bodyMedium, color: COULEURS.texteDiscret },
  principal: { ...TYPO.labelLarge, color: COULEURS.texte },
  detail: { ...TYPO.bodyMedium, color: COULEURS.texteDiscret },
});
