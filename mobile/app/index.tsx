import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { contexteDisponible } from '../src/abonnement/acces';
import { CONTEXTES } from '../src/catalogue/contextes';
import { DUREES, RESSENTIS } from '../src/catalogue/types';
import {
  CHOIX_PAR_DEFAUT,
  ecrireChoix,
  lireChoix,
  lireDerniersExercices,
  type Choix,
} from '../src/preferences/preferences';
import { stockageTelephone } from '../src/preferences/stockage';
import { Bouton } from '../src/ui/Bouton';
import { CarteOption } from '../src/ui/CarteOption';
import { ICONE_CONTEXTE, ICONE_RESSENTI, Icone } from '../src/ui/icones';
import { LIBELLES_RESSENTI } from '../src/ui/libelles';
import { Marque } from '../src/ui/Logo';
import { CIBLE_MIN, COULEURS, ESPACE, TYPO } from '../src/ui/theme';
import { enfoncement, ondulation } from '../src/ui/toucher';

const MESSAGE_PREMIUM = 'Bientôt avec Premium';
// En dessous de cette hauteur (dp), l'en-tête rétrécit pour que tout tienne sans défilement.
const HAUTEUR_COMPACTE = 780;

// Zéro configuration : tout est présélectionné, un seul tap suffit pour lancer la séance.
export default function Depart() {
  const [choix, setChoix] = useState<Choix>(CHOIX_PAR_DEFAUT);
  const [derniersExercices, setDerniersExercices] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const compacte = useWindowDimensions().height < HAUTEUR_COMPACTE;

  // Nombre de choix faits par l'utilisateur : une lecture démarrée avant ne doit pas écraser sa sélection.
  const choixUtilisateur = useRef(0);
  // Premier retour de focus = le montage : seuls les retours suivants ne relisent pas les choix.
  const premierFocus = useRef(true);
  // Garde contre le double appui : une seule séance part, jusqu'au prochain retour sur le départ.
  const lancement = useRef(false);
  // Même garde pour « Mon journal » : un seul écran s'ouvre, jusqu'au prochain retour sur le départ.
  const ouvertureJournal = useRef(false);

  const contextes = useMemo(() => [...CONTEXTES].sort((a, b) => a.ordre - b.ordre), []);

  // Au montage on lit les choix retenus et les derniers exercices. À chaque retour sur l'écran
  // (après une séance), on relit seulement les derniers exercices, qui doivent être ceux de la
  // séance qui vient d'avoir lieu, et on efface le message Premium devenu périmé.
  useFocusEffect(
    useCallback(() => {
      lancement.current = false;
      ouvertureJournal.current = false;
      let actif = true;
      const dejaChoisi = choixUtilisateur.current;
      const lireLesChoix = premierFocus.current;
      premierFocus.current = false;
      if (!lireLesChoix) setMessage(null);
      Promise.all([
        lireLesChoix ? lireChoix(stockageTelephone) : Promise.resolve(null),
        lireDerniersExercices(stockageTelephone),
      ]).then(([lus, ids]) => {
        if (!actif) return;
        if (lus !== null && choixUtilisateur.current === dejaChoisi) setChoix(lus);
        setDerniersExercices(ids);
      });
      return () => {
        actif = false;
      };
    }, []),
  );

  const modifier = (changement: Partial<Choix>) => {
    choixUtilisateur.current += 1;
    setMessage(null);
    setChoix((actuel) => ({ ...actuel, ...changement }));
  };

  const choisirContexte = (contexteId: string) => {
    if (!contexteDisponible(contexteId)) {
      const texte = MESSAGE_PREMIUM;
      setMessage(texte);
      // accessibilityLiveRegion ne couvre qu'Android : sur iOS, on annonce explicitement.
      if (Platform.OS === 'ios') AccessibilityInfo.announceForAccessibility(texte);
      return;
    }
    modifier({ contexteId });
  };

  const ouvrirJournal = () => {
    if (ouvertureJournal.current) return;
    ouvertureJournal.current = true;
    router.push('/journal');
  };

  const lancer = () => {
    if (lancement.current) return;
    lancement.current = true;
    ecrireChoix(stockageTelephone, choix).catch(() => undefined);
    router.push({
      pathname: '/seance',
      params: {
        contexte: choix.contexteId,
        ressenti: choix.ressenti,
        duree: String(choix.duree),
        graine: String(Date.now()),
        exclure: derniersExercices.join(','),
      },
    });
  };

  return (
    <SafeAreaView style={styles.ecran}>
      <ScrollView contentContainerStyle={styles.contenu}>
        <View style={[styles.entete, compacte && styles.enteteCompact]}>
          <Marque compacte={compacte} />
          <Text style={[styles.slogan, compacte && styles.sloganCompact]}>
            Où que tu sois, 5 minutes pour te sentir mieux.
          </Text>
          {/* Hors du flux : le bloc logo, nom et slogan reste centré sur l'écran. */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Mon journal"
            onPress={ouvrirJournal}
            android_ripple={ondulation(COULEURS.texte)}
            style={({ pressed }) => [styles.boutonJournal, enfoncement(pressed)]}
          >
            <Icone nom="journal" taille={26} />
          </Pressable>
        </View>

        <Text style={styles.section} accessibilityRole="header">
          Où es-tu ?
        </Text>
        <View style={styles.grille}>
          {contextes.map((contexte) => (
            <CarteOption
              key={contexte.id}
              libelle={contexte.nom}
              icone={ICONE_CONTEXTE[contexte.id]}
              selectionne={choix.contexteId === contexte.id}
              verrouille={!contexteDisponible(contexte.id)}
              onPress={() => choisirContexte(contexte.id)}
              style={styles.demiLargeur}
            />
          ))}
        </View>
        {message !== null && (
          <View style={styles.message}>
            <Icone nom="cadenas" taille={20} couleur={COULEURS.texteDiscret} />
            <Text style={styles.texteMessage} accessibilityLiveRegion="polite">
              {message}
            </Text>
          </View>
        )}

        <Text style={styles.section} accessibilityRole="header">
          Comment tu te sens ?
        </Text>
        <View style={styles.grille}>
          {RESSENTIS.map((ressenti) => (
            <CarteOption
              key={ressenti}
              libelle={LIBELLES_RESSENTI[ressenti].libelle}
              icone={ICONE_RESSENTI[ressenti]}
              selectionne={choix.ressenti === ressenti}
              onPress={() => modifier({ ressenti })}
              style={styles.demiLargeur}
            />
          ))}
        </View>

        <Text style={styles.section} accessibilityRole="header">
          Combien de temps ?
        </Text>
        <View style={styles.ligne}>
          {DUREES.map((duree) => (
            <CarteOption
              key={duree}
              libelle={`${duree} min`}
              selectionne={choix.duree === duree}
              onPress={() => modifier({ duree })}
              style={styles.tiers}
            />
          ))}
        </View>
      </ScrollView>
      <View style={styles.pied}>
        <Bouton libelle="Lancer ma séance" onPress={lancer} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: COULEURS.fond },
  contenu: { padding: ESPACE, gap: 12 },
  entete: { alignItems: 'center', gap: 4, marginBottom: 4 },
  enteteCompact: { gap: 2, marginBottom: 0 },
  boutonJournal: {
    position: 'absolute',
    top: -4,
    right: -8,
    width: CIBLE_MIN,
    height: CIBLE_MIN,
    borderRadius: CIBLE_MIN / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  slogan: { ...TYPO.bodyLarge, color: COULEURS.texteDiscret, textAlign: 'center' },
  sloganCompact: TYPO.bodyMedium,
  section: { ...TYPO.headlineSmall, color: COULEURS.texte, marginTop: 8 },
  grille: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  ligne: { flexDirection: 'row', gap: 10 },
  demiLargeur: { flexBasis: '47%', flexGrow: 1 },
  tiers: { flex: 1, justifyContent: 'center' },
  message: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  texteMessage: { ...TYPO.bodyLarge, color: COULEURS.texteDiscret, flexShrink: 1 },
  pied: { padding: ESPACE },
});
