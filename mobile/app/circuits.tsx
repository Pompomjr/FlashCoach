import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NIVEAUX, NOMS_NIVEAU, type Niveau } from '../src/catalogue/types';
import { circuitsDuNiveau, libelleAccessibleCircuit, libelleFamille, libelleMateriel, libelleTours, minutesDe } from '../src/circuits/affichage';
import { CIRCUITS } from '../src/circuits/circuits';
import { dureeCircuitS } from '../src/circuits/construire';
import type { Circuit } from '../src/circuits/types';
import { lireNiveau } from '../src/preferences/niveau';
import { stockageTelephone } from '../src/preferences/stockage';
import { CarteOption } from '../src/ui/CarteOption';
import { Icone } from '../src/ui/icones';
import { CIBLE_MIN, COULEURS, ELEVATION, ESPACE, RAYON, TYPO } from '../src/ui/theme';
import { enfoncement, ondulation } from '../src/ui/toucher';

// Espace insécable avant le deux-points (typographie française).
const CONSEIL = 'Conseil : 2 séances par semaine, jours non consécutifs. Garde 1 à 3 répétitions en réserve.';

// Les séances prêtes en circuit, rangées par niveau. Les puces ne changent que l'affichage : le niveau
// enregistré (celui du départ et de Bravo) n'est jamais modifié ici.
export default function Circuits() {
  const [niveau, setNiveau] = useState<Niveau>(1);
  // Un choix de puce fait pendant la lecture du niveau enregistré ne doit pas être écrasé par elle.
  const puceChoisie = useRef(false);
  // Garde contre le double appui : un seul détail s'ouvre, jusqu'au prochain retour sur la liste.
  const ouverture = useRef(false);

  useEffect(() => {
    let actif = true;
    lireNiveau(stockageTelephone).then((lu) => {
      if (actif && !puceChoisie.current) setNiveau(lu);
    });
    return () => {
      actif = false;
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      ouverture.current = false;
    }, []),
  );

  // Durée de chaque circuit, calculée une fois : elle construit toute la séance pour la sommer.
  const minutes = useMemo(() => new Map(CIRCUITS.map((circuit) => [circuit.id, minutesDe(dureeCircuitS(circuit, false))])), []);

  const choisir = (choisi: Niveau) => {
    puceChoisie.current = true;
    setNiveau(choisi);
  };

  const ouvrir = (circuit: Circuit) => {
    if (ouverture.current) return;
    ouverture.current = true;
    router.push({ pathname: '/circuit/[id]', params: { id: circuit.id } });
  };

  const retour = () => (router.canGoBack() ? router.back() : router.replace('/'));

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
          Séances prêtes
        </Text>
      </View>

      <View style={styles.puces}>
        {NIVEAUX.map((n) => (
          <CarteOption key={n} libelle={NOMS_NIVEAU[n]} selectionne={n === niveau} onPress={() => choisir(n)} style={styles.puce} />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.liste}>
        {circuitsDuNiveau(niveau).map((circuit) => (
          <CarteCircuit key={circuit.id} circuit={circuit} minutes={minutes.get(circuit.id) ?? 0} onPress={() => ouvrir(circuit)} />
        ))}
        <Text style={styles.conseil}>{CONSEIL}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function CarteCircuit({ circuit, minutes, onPress }: { circuit: Circuit; minutes: number; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={libelleAccessibleCircuit(circuit, minutes)}
      onPress={onPress}
      android_ripple={ondulation(COULEURS.texte)}
      style={({ pressed }) => [styles.carte, enfoncement(pressed)]}
    >
      <View style={styles.pastille}>
        <Icone nom="circuit" taille={22} />
      </View>
      <View style={styles.corps}>
        {libelleFamille(circuit) !== circuit.nom && <Text style={styles.famille}>{libelleFamille(circuit)}</Text>}
        <Text style={styles.nom}>{circuit.nom}</Text>
        <Text style={styles.detail}>{libelleTours(circuit.tours, minutes)}</Text>
        <Text style={styles.materiel}>{libelleMateriel(circuit)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: COULEURS.fond },
  entete: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: ESPACE },
  retour: { width: CIBLE_MIN, height: CIBLE_MIN, borderRadius: CIBLE_MIN / 2, alignItems: 'center', justifyContent: 'center' },
  titre: { ...TYPO.headlineMedium, color: COULEURS.texte },
  puces: { flexDirection: 'row', gap: 10, paddingHorizontal: ESPACE },
  puce: { flex: 1, justifyContent: 'center' },
  liste: { padding: ESPACE, gap: 12 },
  carte: {
    minHeight: CIBLE_MIN,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COULEURS.carte,
    borderRadius: RAYON,
    padding: ESPACE,
    overflow: 'hidden',
    ...ELEVATION.niveau1,
  },
  pastille: { width: 40, height: 40, borderRadius: 20, backgroundColor: COULEURS.fond, alignItems: 'center', justifyContent: 'center' },
  corps: { flex: 1, gap: 2 },
  famille: { ...TYPO.labelLarge, color: COULEURS.texteDiscret },
  nom: { ...TYPO.titleLarge, color: COULEURS.texte },
  detail: { ...TYPO.bodyLarge, color: COULEURS.texte },
  materiel: { ...TYPO.bodyMedium, color: COULEURS.texteDiscret },
  conseil: { ...TYPO.bodyMedium, color: COULEURS.texteDiscret, textAlign: 'center', marginTop: 4 },
});
