import * as Haptics from 'expo-haptics';
import { Redirect, router, useIsFocused, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Platform, Pressable, ScrollView, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EXERCICES } from '../src/catalogue/exercices';
import { varianteSansMeuble } from '../src/circuits/circuits';
import { construireSeanceCircuit } from '../src/circuits/construire';
import { materielDe } from '../src/circuits/materiel';
import { genererSeance } from '../src/generateur/generer';
import { IllustrationExercice } from '../src/illustrations/Illustration';
import type { Bloc, Seance } from '../src/generateur/types';
import { ajouterEntree, creerIdentifiant, mettreAJourEntree } from '../src/journal/journal';
import { ecrireDerniersExercices } from '../src/preferences/preferences';
import { stockageTelephone } from '../src/preferences/stockage';
import {
  coteCourant,
  formaterTemps,
  libelleEnTete,
  messageDernierTour,
  minutesEffectuees,
  texteAnnonce,
  titreExercice,
} from '../src/seance/affichage';
import { lireParametresCircuit, lireParametresSeance } from '../src/seance/parametres';
import { useEcranAllume } from '../src/seance/useEcranAllume';
import { useLecteurSeance } from '../src/seance/useLecteurSeance';
import { demanderSynchro } from '../src/synchro/instance';
import { Bouton } from '../src/ui/Bouton';
import { Icone } from '../src/ui/icones';
import { CIBLE_MIN, COULEURS, ELEVATION, ESPACE, RAYON, TYPO } from '../src/ui/theme';
import { ondulation } from '../src/ui/toucher';

const PADDING_CARTE = 16;
// Avant la première mesure (et dans les tests, où rien n'est mesuré) : une zone carrée raisonnable.
const ZONE_PAR_DEFAUT = { largeur: 240, hauteur: 240 };

export default function EcranSeance() {
  const { objectif, duree, graine, exclure, niveau, circuit, sansMateriel, tourEnPlus, tours } = useLocalSearchParams<{
    objectif: string;
    duree: string;
    graine: string;
    exclure: string;
    niveau?: string;
    circuit?: string;
    sansMateriel?: string;
    tourEnPlus?: string;
    tours?: string;
  }>();
  // La séance se reconstruit depuis l'URL : même lien, même séance. Un paramètre « circuit » désigne un circuit
  // (séance prête, ou prise de masse avec son nombre de tours) ; sans lui, c'est une séance générée (Brûler des
  // calories ou Étirements). Un lien invalide, ancien lien sans objectif compris, renvoie au départ.
  const seance = useMemo(() => {
    if (circuit !== undefined) {
      const lus = lireParametresCircuit({ circuit, sansMateriel, tourEnPlus, tours, graine });
      return lus === null
        ? null
        : construireSeanceCircuit(lus.circuit, {
            sansMateriel: lus.sansMateriel,
            tourEnPlus: lus.tourEnPlus,
            tours: lus.tours,
            graine: lus.graine,
          });
    }
    const parametres = lireParametresSeance({ objectif, duree, graine, exclure, niveau });
    return parametres === null ? null : genererSeance(parametres, EXERCICES);
  }, [objectif, duree, graine, exclure, niveau, circuit, sansMateriel, tourEnPlus, tours]);
  if (seance === null) return <Redirect href="/" />;
  return <LecteurSeance seance={seance} />;
}

function LecteurSeance({ seance }: { seance: Seance }) {
  useEcranAllume();
  const { etat, passer, basculerPause, terminer } = useLecteurSeance(seance.blocs);
  // Exercices remplacés par leur variante sans meuble, choisie dans l'aperçu : gardée pour toute la séance.
  const [variantes, setVariantes] = useState<ReadonlySet<string>>(new Set());
  const blocPrevu = etat.blocs[etat.index];
  const bloc = blocJoue(blocPrevu, variantes);
  const idVariante = varianteSansMeuble(blocPrevu.exercice.id);
  const basculerVariante = () =>
    setVariantes((actuelles) => {
      const suivantes = new Set(actuelles);
      if (!suivantes.delete(blocPrevu.exercice.id)) suivantes.add(blocPrevu.exercice.id);
      return suivantes;
    });
  const cote = coteCourant(etat);
  const circuit = seance.circuitId !== undefined;
  // Au début du dernier tour d'un circuit seulement.
  const dernierTour = messageDernierTour(etat);
  const aLeFocus = useIsFocused();
  // La figurine prend toute la hauteur que laissent les textes, le minuteur et les actions (≈ 45 % de
  // l'écran sur un téléphone courant) : la zone est mesurée, pas devinée.
  const [zone, setZone] = useState(ZONE_PAR_DEFAUT);
  const mesurerZone = (evenement: LayoutChangeEvent) => {
    const { width, height } = evenement.nativeEvent.layout;
    setZone((actuelle) =>
      Math.round(width) === actuelle.largeur && Math.round(height) === actuelle.hauteur
        ? actuelle
        : { largeur: Math.round(width), hauteur: Math.round(height) },
    );
  };
  const enTransition = etat.etape === 'transition';
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
    // La mémoire des derniers exercices varie les séances flash : un circuit, programme fixe, n'y touche pas.
    if (seance.circuitId === undefined) ecrireDerniersExercices(stockageTelephone, ids).catch(() => undefined);
    ajouterEntree(stockageTelephone, {
      id: idJournal,
      debut: new Date().toISOString(),
      // Un circuit, qu'il vienne de « Prise de masse » ou de « Séances prêtes », compte en prise de masse.
      objectif: seance.objectif,
      // Contexte et ressenti ne sont plus choisis : ils ne restent que dans les anciennes entrées.
      contexteId: null,
      ressenti: null,
      // 5, 10, 15 ou 30 minutes pour une séance générée ; la durée du circuit, arrondie à la minute, sinon.
      duree: seance.duree,
      graine: seance.graine,
      exercices: ids,
      ecouleMs: 0,
      exercicesFaits: 0,
      terminee: false,
      apres: null,
      niveau: seance.niveau,
      effort: null,
      circuitId: seance.circuitId ?? null,
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
  const annonce = texteAnnonce(etat);
  useEffect(() => {
    if (premierRendu.current) {
      premierRendu.current = false;
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    if (Platform.OS === 'ios') AccessibilityInfo.announceForAccessibility(annonce);
  }, [etat.index, etat.etape, annonce]);

  // Un lecteur resté en arrière-plan (écran recouvert) ne doit jamais prendre la main sur l'écran visible.
  useEffect(() => {
    if (!etat.termine || !aLeFocus) return;
    finalisee.current = true;
    mettreAJourEntree(stockageTelephone, idJournal, {
      ecouleMs: etat.ecouleMs,
      exercicesFaits: etat.exercicesFaits,
      terminee: !termineeParUtilisateur.current && etat.exercicesFaits === etat.blocs.length,
    }).then(demanderSynchro);
    router.replace({
      pathname: '/bravo',
      params: {
        minutes: String(minutesEffectuees(etat.ecouleMs)),
        exercices: String(etat.exercicesFaits),
        secondes: String(Math.round(etat.ecouleMs / 1000)),
        seance: idJournal,
        niveau: String(seance.niveau),
      },
    });
  }, [etat.termine, aLeFocus, etat.ecouleMs, etat.exercicesFaits, etat.blocs.length, idJournal, seance.niveau]);

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
            <Icone nom="retour" taille={26} />
          </Pressable>
          <View style={styles.progression}>
            <Text style={styles.phase}>{`${libelleEnTete(bloc, circuit)} · `}</Text>
            <Text style={styles.compteur}>{`${etat.index + 1} / ${etat.blocs.length}`}</Text>
          </View>
        </View>

        <View style={styles.carte} accessibilityLiveRegion="polite">
          {/* « À suivre » montre le geste à venir, immobile ; il s'anime pendant l'effort, se fige en pause. */}
          <View style={styles.illustration} onLayout={mesurerZone}>
            {/* Hors du flux : la figurine remplit la zone mesurée sans l'empêcher de rétrécir quand le texte
                s'allonge (titre sur deux lignes, « Repos · À suivre », « Dernier tour »). */}
            <View style={[StyleSheet.absoluteFill, styles.figurine]}>
              <IllustrationExercice
                exerciceId={bloc.exercice.id}
                cote={bloc.cote}
                libelle={bloc.exercice.nom}
                anime={!enTransition}
                enPause={etat.enPause}
                taille={zone.largeur}
                hauteur={zone.hauteur}
              />
            </View>
          </View>
          <Text style={styles.nom}>{titreExercice(bloc, etat.etape)}</Text>
          {dernierTour !== null && <Text style={styles.dernierTour}>{dernierTour}</Text>}
          {cote !== null && <Text style={styles.cote}>{cote === 'gauche' ? 'Côté gauche' : 'Côté droit'}</Text>}
          <Text style={styles.consigne}>{bloc.exercice.consigne}</Text>
          {/* Dans l'aperçu seulement : pas de chaise ou de table assez solide ? on voit la variante avant de s'y mettre. */}
          {enTransition && idVariante !== undefined && (
            <Pressable
              accessibilityRole="button"
              onPress={basculerVariante}
              android_ripple={ondulation(COULEURS.texteSombre)}
              style={styles.variante}
            >
              <Text style={styles.texteVariante}>
                {variantes.has(blocPrevu.exercice.id)
                  ? `Revenir à : ${blocPrevu.exercice.nom}`
                  : `Variante sans ${materielDe(blocPrevu.exercice.id) ?? 'meuble'}`}
              </Text>
            </Pressable>
          )}
        </View>

        <View>
          <Text style={styles.minuteur} accessibilityRole="timer">
            {formaterTemps(etat.restantMs)}
          </Text>
          {/* Place réservée : la mise en pause ne fait pas sauter la figurine. */}
          <View style={styles.zonePause}>{etat.enPause && <Text style={styles.pause}>En pause</Text>}</View>
        </View>

        <View style={styles.actions}>
          <Bouton libelle={etat.enPause ? 'Reprendre' : 'Pause'} variante="secondaire" onPress={actionPause} />
          <View style={styles.ligne}>
            <Bouton libelle="Passer" onPress={passer} style={styles.moitie} />
            <Bouton
              libelle="Terminer"
              nomAccessible="Terminer la séance"
              variante="secondaire"
              onPress={terminerAvantLaFin}
              style={styles.moitie}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Le bloc tel qu'il se joue : l'exercice prévu, ou sa variante sans meuble si on l'a choisie.
function blocJoue(bloc: Bloc, variantes: ReadonlySet<string>): Bloc {
  const id = varianteSansMeuble(bloc.exercice.id);
  if (id === undefined || !variantes.has(bloc.exercice.id)) return bloc;
  const variante = EXERCICES.find((e) => e.id === id);
  return variante === undefined ? bloc : { ...bloc, exercice: variante };
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: COULEURS.fond },
  contenu: { flexGrow: 1, padding: ESPACE, paddingTop: 8, gap: 12 },
  entete: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  retour: { width: CIBLE_MIN, height: CIBLE_MIN, borderRadius: CIBLE_MIN / 2, alignItems: 'center', justifyContent: 'center' },
  progression: { flexDirection: 'row', alignItems: 'baseline', flexShrink: 1 },
  phase: { ...TYPO.bodyLarge, color: COULEURS.texteDiscret },
  compteur: { ...TYPO.titleMedium, color: COULEURS.texte },
  // La carte et sa zone d'illustration absorbent toute la hauteur libre.
  carte: { flex: 1, backgroundColor: COULEURS.carteClaire, borderRadius: RAYON, padding: PADDING_CARTE, gap: 6, ...ELEVATION.niveau1 },
  illustration: { flex: 1, minHeight: 160 },
  figurine: { alignItems: 'center', justifyContent: 'center' },
  nom: { ...TYPO.headlineMedium, color: COULEURS.texteSombre, marginTop: 4 },
  cote: { ...TYPO.titleMedium, color: COULEURS.texteSombre },
  dernierTour: { ...TYPO.titleMedium, color: COULEURS.texteSombre },
  consigne: { ...TYPO.bodyLarge, color: COULEURS.texteSombre },
  variante: {
    alignSelf: 'flex-start',
    minHeight: CIBLE_MIN,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: CIBLE_MIN / 2,
    borderWidth: 1.5,
    borderColor: COULEURS.texteSombre,
  },
  texteVariante: { ...TYPO.labelLarge, color: COULEURS.texteSombre },
  minuteur: { ...TYPO.displayLarge, color: COULEURS.texte, textAlign: 'center', fontVariant: ['tabular-nums'] },
  zonePause: { minHeight: TYPO.bodyLarge.lineHeight, alignItems: 'center' },
  pause: { ...TYPO.bodyLarge, color: COULEURS.texteDiscret, textAlign: 'center' },
  actions: { gap: 12 },
  ligne: { flexDirection: 'row', gap: 12 },
  moitie: { flex: 1 },
});
