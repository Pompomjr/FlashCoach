import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { EtatCompte } from '../src/compte/auth';
import { Figurine } from '../src/illustrations/Figurine';
import { estEntreeCircuit, formaterBilan, formaterDate, sujetEtEtat, texteResume } from '../src/journal/affichage';
import { lireJournal, resumeJournal, type EntreeJournal } from '../src/journal/journal';
import { stockageTelephone } from '../src/preferences/stockage';
import { authApp } from '../src/synchro/instance';
import { ICONE_APRES, ICONE_CONTEXTE, ICONE_OBJECTIF, Icone, type NomIcone } from '../src/ui/icones';
import { CIBLE_MIN, COULEURS, ELEVATION, ESPACE, RAYON, TYPO } from '../src/ui/theme';
import { ondulation } from '../src/ui/toucher';

const LIBELLES_APRES = {
  mieux: { libelle: 'Mieux' },
  pareil: { libelle: 'Pareil' },
} as const;

export default function Journal() {
  const [entrees, setEntrees] = useState<EntreeJournal[] | null>(null);
  const [compte, setCompte] = useState<EtatCompte | null>(null);
  // Faux tant que la session n'a pas été lue : le pied du journal reste vide plutôt que de clignoter.
  const [sessionLue, setSessionLue] = useState(false);

  // Relu à chaque affichage : une séance vient peut-être de se terminer.
  useFocusEffect(
    useCallback(() => {
      let actif = true;
      lireJournal(stockageTelephone).then((lues) => {
        if (actif) setEntrees(lues);
      });
      authApp
        ?.sessionCourante()
        .then((etat) => {
          if (actif) setCompte(etat);
        })
        .catch(() => undefined)
        .finally(() => {
          if (actif) setSessionLue(true);
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
          <PiedSauvegarde compte={compte} lue={sessionLue} />
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
                <Icone nom="mieux" taille={26} couleur={COULEURS.texteSurOrange} />
              </View>
              <Text style={styles.texteResume}>{resume}</Text>
            </View>
          }
          ListFooterComponent={<PiedSauvegarde compte={compte} lue={sessionLue} />}
          renderItem={({ item }) => <LigneJournal entree={item} />}
        />
      )}
    </SafeAreaView>
  );
}

function PiedSauvegarde({ compte, lue }: { compte: EtatCompte | null; lue: boolean }) {
  if (authApp === null || !lue) return null;
  if (compte !== null && !compte.anonyme && compte.email !== null) {
    return <Text style={styles.sauvegarde}>{`Journal sauvegardé · ${compte.email}`}</Text>;
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Sauvegarder mon journal"
      onPress={() => router.push('/sauvegarde')}
      android_ripple={ondulation(COULEURS.texte)}
      style={styles.lienSauvegarde}
    >
      <Icone nom="journal" taille={22} />
      <Text style={styles.texteLienSauvegarde}>Sauvegarder mon journal</Text>
    </Pressable>
  );
}

function LigneJournal({ entree }: { entree: EntreeJournal }) {
  const apres = entree.apres === null ? null : LIBELLES_APRES[entree.apres];
  // Un circuit s'affiche par son nom et son intensité ; une séance par objectif par l'objectif, l'intensité et la
  // durée ; une ancienne séance par son contexte et son ressenti, comme avant.
  const { sujet, etat, etatLu } = sujetEtEtat(entree);
  const icone: NomIcone | undefined = estEntreeCircuit(entree)
    ? 'circuit'
    : entree.objectif !== null
      ? ICONE_OBJECTIF[entree.objectif]
      : ICONE_CONTEXTE[entree.contexteId ?? ''];
  const date = formaterDate(entree.debut);
  const bilan = formaterBilan(entree.ecouleMs, entree.exercicesFaits, entree.terminee);
  // Un seul élément accessible, lu en phrase : les icônes et la flèche ne sont pas prononcées.
  const lecture = [
    date.replace(' · ', ' à '),
    sujet,
    apres === null ? etatLu : `${etatLu}, puis ${apres.libelle}`,
    bilan.replaceAll(' · ', ', '),
  ].join(', ');
  return (
    <View style={styles.ligne} accessible accessibilityLabel={lecture}>
      <View style={styles.pastille}>
        {icone !== undefined && <Icone nom={icone} taille={22} />}
      </View>
      <View style={styles.corps}>
        <Text style={styles.date}>{date}</Text>
        <Text style={styles.principal}>
          {`${sujet} · ${etat}${apres === null ? '' : ` → ${apres.libelle}`}`}
        </Text>
        <Text style={styles.detail}>{bilan}</Text>
      </View>
      {/* Seule la réponse a son icône : sur la carte bleue, l'orange seul manque de contraste, d'où la pastille. */}
      {entree.apres !== null && (
        <View style={styles.pastilleApres}>
          <Icone nom={ICONE_APRES[entree.apres]} taille={20} couleur={COULEURS.texteSurOrange} />
        </View>
      )}
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
  // Résumé sur une surface de carte : l'orange reste réservé à l'action, il ne marque que l'icône.
  resume: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: COULEURS.carte,
    borderRadius: RAYON,
    padding: ESPACE,
    marginBottom: 4,
    ...ELEVATION.niveau1,
  },
  iconeResume: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COULEURS.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texteResume: { ...TYPO.titleMedium, color: COULEURS.texte, flex: 1 },
  pastilleApres: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COULEURS.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ligne: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COULEURS.carte, borderRadius: RAYON, padding: ESPACE, ...ELEVATION.niveau1 },
  pastille: { width: 40, height: 40, borderRadius: 20, backgroundColor: COULEURS.fond, alignItems: 'center', justifyContent: 'center' },
  corps: { flex: 1, gap: 2 },
  date: { ...TYPO.bodyMedium, color: COULEURS.texteDiscret },
  principal: { ...TYPO.labelLarge, color: COULEURS.texte },
  sauvegarde: { ...TYPO.bodyMedium, color: COULEURS.texteDiscret, textAlign: 'center', marginTop: 8 },
  lienSauvegarde: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: CIBLE_MIN, borderRadius: RAYON, marginTop: 8 },
  texteLienSauvegarde: { ...TYPO.labelLarge, color: COULEURS.texte, textDecorationLine: 'underline' },
  detail: { ...TYPO.bodyMedium, color: COULEURS.texteDiscret },
});
