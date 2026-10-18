import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { AccessibilityInfo, ScrollView, StyleSheet, Text, View } from 'react-native';
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

  // À chaque retour sur l'écran (au montage, puis au retour de Bravo), on relit les préférences :
  // les derniers exercices doivent être ceux de la séance qui vient d'avoir lieu.
  useFocusEffect(
    useCallback(() => {
      let actif = true;
      const dejaChoisi = choixUtilisateur.current;
      Promise.all([lireChoix(stockageTelephone), lireDerniersExercices(stockageTelephone)]).then(([lus, ids]) => {
        if (!actif) return;
        if (choixUtilisateur.current === dejaChoisi) setChoix(lus);
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
      // accessibilityLiveRegion ne couvre qu'Android : on annonce aussi explicitement (iOS).
      AccessibilityInfo.announceForAccessibility(texte);
      return;
    }
    modifier({ contexteId });
  };

  const lancer = () => {
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
        <Text style={styles.titre}>Flash Coach</Text>
        <Text style={styles.slogan}>Où que tu sois, 5 minutes pour te sentir mieux.</Text>

        <Text style={styles.section}>Où es-tu ?</Text>
        <View style={styles.grille}>
          {CONTEXTES.map((contexte) => (
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
