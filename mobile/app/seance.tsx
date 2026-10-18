import * as Haptics from 'expo-haptics';
import { Redirect, router, useIsFocused, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EXERCICES } from '../src/catalogue/exercices';
import { genererSeance } from '../src/generateur/generer';
import type { ParametresSeance } from '../src/generateur/types';
import { ajouterEntree, creerIdentifiant, mettreAJourEntree } from '../src/journal/journal';
import { ecrireDerniersExercices } from '../src/preferences/preferences';
import { stockageTelephone } from '../src/preferences/stockage';
import { coteCourant, formaterTemps, minutesEffectuees } from '../src/seance/affichage';
import { lireParametresSeance } from '../src/seance/parametres';
import { useEcranAllume } from '../src/seance/useEcranAllume';
import { useLecteurSeance } from '../src/seance/useLecteurSeance';
import { Bouton } from '../src/ui/Bouton';
import { Icone } from '../src/ui/icones';
import { LIBELLES_PHASE } from '../src/ui/libelles';
import { CIBLE_MIN, COULEURS, ESPACE, RAYON, TYPO } from '../src/ui/theme';
import { ondulation } from '../src/ui/toucher';

export default function EcranSeance() {
  const { contexte, ressenti, duree, graine, exclure } = useLocalSearchParams<{
    contexte: string;
    ressenti: string;
    duree: string;
    graine: string;
    exclure: string;
  }>();
  const parametres = useMemo(
    () => lireParametresSeance({ contexte, ressenti, duree, graine, exclure }),
    [contexte, ressenti, duree, graine, exclure],
  );
  if (parametres === null) return <Redirect href="/" />;
  return <LecteurSeance parametres={parametres} />;
}

function LecteurSeance({ parametres }: { parametres: ParametresSeance }) {
  useEcranAllume();
  const seance = useMemo(() => genererSeance(parametres, EXERCICES), [parametres]);
  const { etat, passer, basculerPause, terminer } = useLecteurSeance(seance.blocs);
  const bloc = etat.blocs[etat.index];
  const cote = coteCourant(etat);
  const aLeFocus = useIsFocused();
  const [idJournal] = useState(creerIdentifiant);
  // Vrai quand la séance se termine par « Terminer la séance » plutôt que d'aller au bout.
  const termineeParUtilisateur = useRef(false);
  // Vrai dès que l'entrée du journal a reçu son état final : le démontage ne l'écrase plus.
  const finalisee = useRef(false);
  const dernierEtat = useRef(etat);
  useEffect(() => {
    dernierEtat.current = etat;
  });

  // Sur un lien direct, il n'y a rien derrière : on retourne au départ.
  const quitter = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const actionPause = () => {
    // accessibilityLiveRegion ne couvre qu'Android : sur iOS, on annonce explicitement.
    if (!etat.enPause && Platform.OS === 'ios') AccessibilityInfo.announceForAccessibility('En pause');
    basculerPause();
  };

  // Au lancement : derniers exercices (évités la prochaine fois) et entrée du journal, écourtée par défaut.
  // Si l'on quitte (‹, retour système), on garde le temps réellement fait.
  useEffect(() => {
    const ids = seance.blocs.map((b) => b.exercice.id);
    ecrireDerniersExercices(stockageTelephone, ids).catch(() => undefined);
    ajouterEntree(stockageTelephone, {
      id: idJournal,
      debut: new Date().toISOString(),
      contexteId: seance.contexteId,
      ressenti: seance.ressenti,
      duree: seance.duree,
      graine: seance.graine,
      exercices: ids,
      ecouleMs: 0,
      exercicesFaits: 0,
      terminee: false,
      apres: null,
    });
    const etatAuDemontage = dernierEtat;
    return () => {
      if (finalisee.current) return;
      // Lecture voulue au nettoyage : on veut le dernier état, pas celui du lancement.
      const { ecouleMs, exercicesFaits } = etatAuDemontage.current;
      mettreAJourEntree(stockageTelephone, idJournal, { ecouleMs, exercicesFaits });
    };
  }, [seance, idJournal]);

  // Une vibration (et, sur iOS, l'annonce de l'exercice) à chaque changement d'étape, pas au démarrage.
  const premierRendu = useRef(true);
  const nomExercice = bloc.exercice.nom;
  useEffect(() => {
    if (premierRendu.current) {
      premierRendu.current = false;
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    if (Platform.OS === 'ios') AccessibilityInfo.announceForAccessibility(nomExercice);
  }, [etat.index, etat.etape, nomExercice]);

  // Un lecteur resté en arrière-plan (écran recouvert) ne doit jamais prendre la main sur l'écran visible.
  useEffect(() => {
    if (!etat.termine || !aLeFocus) return;
    finalisee.current = true;
    mettreAJourEntree(stockageTelephone, idJournal, {
      ecouleMs: etat.ecouleMs,
      exercicesFaits: etat.exercicesFaits,
      terminee: !termineeParUtilisateur.current && etat.exercicesFaits === etat.blocs.length,
    });
    router.replace({
      pathname: '/bravo',
      params: {
        minutes: String(minutesEffectuees(etat.ecouleMs)),
        exercices: String(etat.exercicesFaits),
        secondes: String(Math.round(etat.ecouleMs / 1000)),
        seance: idJournal,
      },
    });
  }, [etat.termine, aLeFocus, etat.ecouleMs, etat.exercicesFaits, etat.blocs.length, idJournal]);

  const terminerAvantLaFin = () => {
    termineeParUtilisateur.current = true;
    terminer();
  };

  return (
    <SafeAreaView style={styles.ecran}>
      <ScrollView contentContainerStyle={styles.contenu}>
        <View style={styles.entete}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Quitter la séance"
            onPress={quitter}
            android_ripple={ondulation(COULEURS.texte)}
            style={styles.retour}
          >
            <Icone nom="retour" taille={28} />
          </Pressable>
          <Text style={styles.compteur}>{`${etat.index + 1} / ${etat.blocs.length}`}</Text>
        </View>

        <View style={styles.carte} accessibilityLiveRegion="polite">
          <Text style={styles.phase}>{etat.etape === 'transition' ? 'À suivre' : LIBELLES_PHASE[bloc.phase]}</Text>
          <Text style={styles.nom}>{bloc.exercice.nom}</Text>
          {cote !== null && <Text style={styles.cote}>{cote === 'gauche' ? 'Côté gauche' : 'Côté droit'}</Text>}
          <Text style={styles.consigne}>{bloc.exercice.consigne}</Text>
        </View>

        <Text style={styles.minuteur} accessibilityRole="timer">
          {formaterTemps(etat.restantMs)}
        </Text>
        {etat.enPause && <Text style={styles.pause}>En pause</Text>}

        <View style={styles.actions}>
          <Bouton libelle={etat.enPause ? 'Reprendre' : 'Pause'} variante="secondaire" onPress={actionPause} />
          <View style={styles.ligne}>
            <Bouton libelle="Passer" onPress={passer} style={styles.moitie} />
            <Bouton libelle="Terminer la séance" variante="secondaire" onPress={terminerAvantLaFin} style={styles.moitie} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: COULEURS.fond },
  contenu: { flexGrow: 1, padding: ESPACE, gap: 16 },
  entete: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  retour: { width: CIBLE_MIN, height: CIBLE_MIN, borderRadius: CIBLE_MIN / 2, alignItems: 'center', justifyContent: 'center' },
  compteur: { ...TYPO.titleMedium, color: COULEURS.texte },
  carte: { backgroundColor: COULEURS.carteClaire, borderRadius: RAYON, padding: 24, gap: 8, minHeight: 220, justifyContent: 'center' },
  phase: { ...TYPO.bodyMedium, color: COULEURS.texteSombre, fontWeight: '700', textTransform: 'uppercase' },
  nom: { ...TYPO.headlineMedium, color: COULEURS.texteSombre },
  cote: { ...TYPO.titleMedium, color: COULEURS.texteSombre },
  consigne: { ...TYPO.bodyLarge, color: COULEURS.texteSombre },
  minuteur: { ...TYPO.displayLarge, color: COULEURS.texte, textAlign: 'center', fontVariant: ['tabular-nums'] },
  pause: { ...TYPO.bodyLarge, color: COULEURS.texteDiscret, textAlign: 'center' },
  actions: { marginTop: 'auto', gap: 12 },
  ligne: { flexDirection: 'row', gap: 12 },
  moitie: { flex: 1 },
});
