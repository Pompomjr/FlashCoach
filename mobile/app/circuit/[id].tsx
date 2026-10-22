import { Redirect, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NOMS_NIVEAU } from '../../src/catalogue/types';
import { circuitDemandeUnMeuble, libelleMateriel, libellePoste, libelleTours, minutesDe, tirageRemplace } from '../../src/circuits/affichage';
import { circuitParId } from '../../src/circuits/circuits';
import { dureeCircuitS, nombreDeTours } from '../../src/circuits/construire';
import type { Circuit } from '../../src/circuits/types';
import { ecrireSansMateriel, lireSansMateriel } from '../../src/preferences/materiel';
import { stockageTelephone } from '../../src/preferences/stockage';
import { Bouton } from '../../src/ui/Bouton';
import { Icone } from '../../src/ui/icones';
import { Interrupteur } from '../../src/ui/Interrupteur';
import { CIBLE_MIN, COULEURS, ELEVATION, ESPACE, RAYON, TYPO } from '../../src/ui/theme';
import { ondulation } from '../../src/ui/toucher';

const PRUDENCE = 'Utilise une chaise ou une table stable, ni pliante ni vitrée.';
const SANS_TIRAGE = 'Sans vrai tirage, le dos travaille moins.';

export default function DetailCircuit() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const circuit = circuitParId((Array.isArray(id) ? id[0] : id) ?? '');
  if (circuit === undefined) return <Redirect href="/circuits" />;
  // Une clé par circuit : les interrupteurs repartent de zéro si l'écran change de circuit.
  return <Detail key={circuit.id} circuit={circuit} />;
}

function Detail({ circuit }: { circuit: Circuit }) {
  const [sansMateriel, setSansMateriel] = useState(false);
  const [tourEnPlus, setTourEnPlus] = useState(false);
  // Tant que la préférence n'est pas lue, on ne lance pas : un démarrage à froid ne doit pas imposer un meuble.
  const [preferenceLue, setPreferenceLue] = useState(false);
  // Un interrupteur touché pendant la lecture de la préférence ne doit pas être écrasé par elle.
  const interrupteurTouche = useRef(false);
  // Garde contre le double appui : une seule séance part, jusqu'au prochain retour sur ce détail.
  const lancement = useRef(false);
  const demandeUnMeuble = circuitDemandeUnMeuble(circuit);

  useEffect(() => {
    let actif = true;
    lireSansMateriel(stockageTelephone).then((lue) => {
      if (!actif) return;
      if (!interrupteurTouche.current) setSansMateriel(lue);
      setPreferenceLue(true);
    });
    return () => {
      actif = false;
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      lancement.current = false;
    }, []),
  );

  // La durée change avec le 5e tour (pas avec les remplaçants, qui durent autant). Une séance entière est
  // construite pour la sommer : on ne la refait que quand le tour en plus change.
  const minutes = useMemo(() => minutesDe(dureeCircuitS(circuit, tourEnPlus)), [circuit, tourEnPlus]);

  const changerSansMateriel = (valeur: boolean) => {
    interrupteurTouche.current = true;
    setSansMateriel(valeur);
    ecrireSansMateriel(stockageTelephone, valeur);
  };

  const retour = () => (router.canGoBack() ? router.back() : router.replace('/circuits'));

  const lancer = () => {
    if (lancement.current || !preferenceLue) return;
    lancement.current = true;
    router.push({
      pathname: '/seance',
      params: {
        circuit: circuit.id,
        // Les remplaçants ne comptent que si le circuit demande un meuble.
        sansMateriel: sansMateriel && demandeUnMeuble ? '1' : '0',
        tourEnPlus: tourEnPlus && circuit.tourFacultatif ? '1' : '0',
        graine: String(Date.now()),
      },
    });
  };

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
          {circuit.nom}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.contenu}>
        <View style={styles.resume}>
          <Text style={styles.niveau}>{NOMS_NIVEAU[circuit.niveau]}</Text>
          <Text style={styles.duree}>{libelleTours(nombreDeTours(circuit, tourEnPlus), minutes)}</Text>
        </View>
        <Text style={styles.materiel}>{`Matériel : ${libelleMateriel(circuit, sansMateriel)}`}</Text>

        <View style={styles.postes}>
          {circuit.postes.map((poste, index) => {
            const libelle = libellePoste(poste, sansMateriel);
            return (
              <View key={index} accessible accessibilityLabel={`${index + 1}, ${libelle}`} style={styles.poste}>
                <View style={styles.numero}>
                  <Text style={styles.texteNumero}>{index + 1}</Text>
                </View>
                <Text style={styles.nomPoste}>{libelle}</Text>
              </View>
            );
          })}
        </View>

        {demandeUnMeuble && (
          <>
            <Text style={styles.prudence}>{PRUDENCE}</Text>
            <Interrupteur libelle="Je n’ai pas de meuble stable" valeur={sansMateriel} onChange={changerSansMateriel} />
            {tirageRemplace(circuit, sansMateriel) && <Text style={styles.prudence}>{SANS_TIRAGE}</Text>}
          </>
        )}
        {circuit.tourFacultatif && <Interrupteur libelle="Ajouter un 5e tour" valeur={tourEnPlus} onChange={setTourEnPlus} />}
      </ScrollView>

      <View style={styles.pied}>
        <Bouton libelle="C’est parti" onPress={lancer} desactive={!preferenceLue} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: COULEURS.fond },
  entete: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: ESPACE },
  retour: { width: CIBLE_MIN, height: CIBLE_MIN, borderRadius: CIBLE_MIN / 2, alignItems: 'center', justifyContent: 'center' },
  titre: { ...TYPO.headlineMedium, color: COULEURS.texte, flexShrink: 1 },
  contenu: { paddingHorizontal: ESPACE, paddingBottom: ESPACE, gap: 12 },
  resume: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  niveau: {
    ...TYPO.labelLarge,
    color: COULEURS.texte,
    backgroundColor: COULEURS.carte,
    borderRadius: RAYON,
    overflow: 'hidden',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  duree: { ...TYPO.titleMedium, color: COULEURS.texte },
  postes: { backgroundColor: COULEURS.carte, borderRadius: RAYON, paddingVertical: 8, paddingHorizontal: ESPACE, ...ELEVATION.niveau1 },
  poste: { minHeight: CIBLE_MIN, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  numero: { width: 32, height: 32, borderRadius: 16, backgroundColor: COULEURS.fond, alignItems: 'center', justifyContent: 'center' },
  texteNumero: { ...TYPO.labelLarge, color: COULEURS.texte },
  nomPoste: { ...TYPO.titleMedium, color: COULEURS.texte, flex: 1 },
  materiel: { ...TYPO.bodyLarge, color: COULEURS.texteDiscret },
  prudence: { ...TYPO.bodyLarge, color: COULEURS.texteDiscret },
  pied: { paddingHorizontal: ESPACE, paddingBottom: ESPACE, paddingTop: 8 },
});
