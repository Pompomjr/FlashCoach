import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import { LIBELLES_RESSENTI } from '../src/ui/libelles';
import { COULEURS, ESPACE } from '../src/ui/theme';

// Zéro configuration : tout est présélectionné, un seul tap suffit pour lancer la séance.
export default function Depart() {
  const [choix, setChoix] = useState<Choix>(CHOIX_PAR_DEFAUT);
  const [derniersExercices, setDerniersExercices] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  // Nombre de choix faits par l'utilisateur : une lecture démarrée avant ne doit pas écraser sa sélection.
  const choixUtilisateur = useRef(0);
  // Premier retour de focus = le montage : seuls les retours suivants ne relisent pas les choix.
  const premierFocus = useRef(true);
  // Garde contre le double appui : une seule séance part, jusqu'au prochain retour sur le départ.
  const lancement = useRef(false);

  const contextes = useMemo(() => [...CONTEXTES].sort((a, b) => a.ordre - b.ordre), []);

  // Au montage on lit les choix retenus et les derniers exercices. À chaque retour sur l'écran
  // (après une séance), on relit seulement les derniers exercices, qui doivent être ceux de la
  // séance qui vient d'avoir lieu, et on efface le message Premium devenu périmé.
  useFocusEffect(
    useCallback(() => {
      lancement.current = false;
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
      const texte = 'Bientôt avec Premium 🔒';
      setMessage(texte);
      // accessibilityLiveRegion ne couvre qu'Android : sur iOS, on annonce explicitement.
      if (Platform.OS === 'ios') AccessibilityInfo.announceForAccessibility(texte);
      return;
    }
    modifier({ contexteId });
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
        <View style={styles.entete}>
          <Pressable accessibilityRole="button" accessibilityLabel="Mon journal" onPress={() => router.push('/journal')} hitSlop={8}>
            <Text style={styles.lienJournal}>Mon journal</Text>
          </Pressable>
        </View>
        <Text style={styles.titre}>Flash Coach</Text>
        <Text style={styles.slogan}>Où que tu sois, 5 minutes pour te sentir mieux.</Text>

        <Text style={styles.section}>Où es-tu ?</Text>
        <View style={styles.grille}>
          {contextes.map((contexte) => (
            <CarteOption
              key={contexte.id}
              libelle={contexte.nom}
              emoji={contexte.emoji}
              selectionne={choix.contexteId === contexte.id}
              verrouille={!contexteDisponible(contexte.id)}
              onPress={() => choisirContexte(contexte.id)}
              style={styles.demiLargeur}
            />
          ))}
        </View>
        {message !== null && (
          <Text style={styles.message} accessibilityLiveRegion="polite">
            {message}
          </Text>
        )}

        <Text style={styles.section}>Comment tu te sens ?</Text>
        <View style={styles.grille}>
          {RESSENTIS.map((ressenti) => (
            <CarteOption
              key={ressenti}
              libelle={LIBELLES_RESSENTI[ressenti].libelle}
              emoji={LIBELLES_RESSENTI[ressenti].emoji}
              selectionne={choix.ressenti === ressenti}
              onPress={() => modifier({ ressenti })}
              style={styles.demiLargeur}
            />
          ))}
        </View>

        <Text style={styles.section}>Combien de temps ?</Text>
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
  contenu: { padding: ESPACE, paddingBottom: ESPACE * 2, gap: 12 },
  entete: { flexDirection: 'row', justifyContent: 'flex-end' },
  lienJournal: { color: COULEURS.texte, fontSize: 15, fontWeight: '600', textDecorationLine: 'underline' },
  titre: { color: COULEURS.texte, fontSize: 28, fontWeight: '800', textAlign: 'center', marginTop: 8 },
  slogan: { color: COULEURS.texteDiscret, fontSize: 15, textAlign: 'center', marginBottom: 8 },
  section: { color: COULEURS.texte, fontSize: 20, fontWeight: '700', marginTop: 12 },
  grille: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  ligne: { flexDirection: 'row', gap: 10 },
  demiLargeur: { flexBasis: '47%', flexGrow: 1 },
  tiers: { flex: 1, alignItems: 'center' },
  message: { color: COULEURS.texteDiscret, fontSize: 15 },
  pied: { padding: ESPACE },
});
