import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DUREES, NIVEAUX, NOMS_NIVEAU, NOMS_OBJECTIF, OBJECTIFS, type Niveau } from '../src/catalogue/types';
import { CHOIX_PAR_DEFAUT, ecrireChoix, type Choix } from '../src/preferences/preferences';
import { ecrireNiveau } from '../src/preferences/niveau';
import { stockageTelephone } from '../src/preferences/stockage';
import { lireDonneesLancement, parametresLancement, type DonneesLancement } from '../src/seance/lancement';
import { Bouton } from '../src/ui/Bouton';
import { CarteOption } from '../src/ui/CarteOption';
import { ICONE_OBJECTIF, Icone } from '../src/ui/icones';
import { Marque } from '../src/ui/Logo';
import { CIBLE_MIN, COULEURS, ESPACE, TYPO } from '../src/ui/theme';
import { enfoncement, ondulation } from '../src/ui/toucher';

// En dessous de cette hauteur (dp), l'en-tête rétrécit pour que tout tienne sans défilement.
const HAUTEUR_COMPACTE = 880;

// Ce que le départ relit à chaque retour : la séance qui vient d'avoir lieu change les derniers exercices et la
// dernière famille de masse ; la page d'un circuit peut changer « sans meuble ».
type Memoire = Pick<DonneesLancement, 'derniersExercices' | 'derniereFamille' | 'sansMateriel'>;

// Zéro configuration : objectif, intensité et durée sont présélectionnés, un seul tap suffit pour lancer.
export default function Depart() {
  const [choix, setChoix] = useState<Choix>(CHOIX_PAR_DEFAUT);
  const [niveau, setNiveau] = useState<Niveau>(1);
  const [memoire, setMemoire] = useState<Memoire>({ derniersExercices: [], derniereFamille: null, sansMateriel: false });
  const compacte = useWindowDimensions().height < HAUTEUR_COMPACTE;

  // Nombre de choix faits par l'utilisateur : une lecture démarrée avant ne doit pas écraser sa sélection.
  const choixUtilisateur = useRef(0);
  // Même garde pour l'intensité : un choix fait pendant la lecture ne doit pas être écrasé par elle.
  const niveauUtilisateur = useRef(0);
  // Premier retour de focus = le montage : seuls les retours suivants ne relisent pas les choix.
  const premierFocus = useRef(true);
  // Garde contre le double appui : une seule séance part, jusqu'au prochain retour sur le départ.
  const lancement = useRef(false);
  // Même garde pour « Mon journal » : un seul écran s'ouvre, jusqu'au prochain retour sur le départ.
  const ouvertureJournal = useRef(false);
  // Même garde pour « Séances prêtes ».
  const ouvertureCircuits = useRef(false);

  // Au montage on lit les choix retenus ; à chaque retour sur l'écran (après une séance), on relit le reste :
  // l'intensité (Bravo a pu l'ajuster), les derniers exercices, la dernière famille de masse et « sans meuble ».
  useFocusEffect(
    useCallback(() => {
      lancement.current = false;
      ouvertureJournal.current = false;
      ouvertureCircuits.current = false;
      let actif = true;
      const dejaChoisi = choixUtilisateur.current;
      const niveauDejaChoisi = niveauUtilisateur.current;
      const lireLesChoix = premierFocus.current;
      premierFocus.current = false;
      lireDonneesLancement(stockageTelephone).then((lues) => {
        if (!actif) return;
        if (lireLesChoix && choixUtilisateur.current === dejaChoisi) setChoix(lues.choix);
        if (niveauUtilisateur.current === niveauDejaChoisi) setNiveau(lues.niveau);
        setMemoire({ derniersExercices: lues.derniersExercices, derniereFamille: lues.derniereFamille, sansMateriel: lues.sansMateriel });
      });
      return () => {
        actif = false;
      };
    }, []),
  );

  const modifier = (changement: Partial<Choix>) => {
    choixUtilisateur.current += 1;
    setChoix((actuel) => ({ ...actuel, ...changement }));
  };

  const changerNiveau = (choisi: Niveau) => {
    niveauUtilisateur.current += 1;
    setNiveau(choisi);
    ecrireNiveau(stockageTelephone, choisi);
  };

  const ouvrirJournal = () => {
    if (ouvertureJournal.current) return;
    ouvertureJournal.current = true;
    router.push('/journal');
  };

  const ouvrirCircuits = () => {
    if (ouvertureCircuits.current) return;
    ouvertureCircuits.current = true;
    router.push('/circuits');
  };

  const lancer = () => {
    if (lancement.current) return;
    lancement.current = true;
    ecrireChoix(stockageTelephone, choix).catch(() => undefined);
    router.push({ pathname: '/seance', params: parametresLancement({ choix, niveau, ...memoire }, Date.now()) });
  };

  const titre = [styles.section, compacte && styles.sectionCompacte];

  return (
    <SafeAreaView style={styles.ecran}>
      <ScrollView contentContainerStyle={[styles.contenu, compacte && styles.contenuCompact]}>
        <View style={[styles.entete, compacte && styles.enteteCompact]}>
          <Marque compacte={compacte} />
          <Text style={[styles.slogan, compacte && styles.sloganCompact]}>
            Où que tu sois, 5 minutes pour te sentir mieux.
          </Text>
          {/* Hors du flux : le bloc logo, nom et slogan reste centré sur l'écran. « Séances prêtes » à gauche, « Mon journal » à droite. */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Séances prêtes"
            onPress={ouvrirCircuits}
            android_ripple={ondulation(COULEURS.texte)}
            style={({ pressed }) => [styles.boutonEntete, styles.boutonCircuits, enfoncement(pressed)]}
          >
            <Icone nom="circuit" taille={26} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Mon journal"
            onPress={ouvrirJournal}
            android_ripple={ondulation(COULEURS.texte)}
            style={({ pressed }) => [styles.boutonEntete, styles.boutonJournal, enfoncement(pressed)]}
          >
            <Icone nom="journal" taille={26} />
          </Pressable>
        </View>

        <Text style={titre} accessibilityRole="header">
          Ton objectif
        </Text>
        <View style={styles.colonne}>
          {OBJECTIFS.map((objectif) => (
            <CarteOption
              key={objectif}
              libelle={NOMS_OBJECTIF[objectif]}
              icone={ICONE_OBJECTIF[objectif]}
              selectionne={choix.objectif === objectif}
              onPress={() => modifier({ objectif })}
            />
          ))}
        </View>

        <Text style={titre} accessibilityRole="header">
          Intensité
        </Text>
        <View style={styles.ligne}>
          {NIVEAUX.map((choisi) => (
            <CarteOption
              key={choisi}
              libelle={NOMS_NIVEAU[choisi]}
              selectionne={niveau === choisi}
              onPress={() => changerNiveau(choisi)}
              style={styles.bouton}
            />
          ))}
        </View>

        <Text style={titre} accessibilityRole="header">
          Temps disponible
        </Text>
        <View style={styles.ligne}>
          {DUREES.map((duree) => (
            <CarteOption
              key={duree}
              libelle={`${duree} min`}
              selectionne={choix.duree === duree}
              onPress={() => modifier({ duree })}
              style={styles.bouton}
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
  contenuCompact: { gap: 8 },
  entete: { alignItems: 'center', gap: 4, marginBottom: 4 },
  enteteCompact: { gap: 2, marginBottom: 0 },
  boutonEntete: {
    position: 'absolute',
    top: -4,
    width: CIBLE_MIN,
    height: CIBLE_MIN,
    borderRadius: CIBLE_MIN / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  boutonJournal: { right: -8 },
  boutonCircuits: { left: -8 },
  slogan: { ...TYPO.bodyLarge, color: COULEURS.texteDiscret, textAlign: 'center' },
  sloganCompact: TYPO.bodyMedium,
  section: { ...TYPO.headlineSmall, color: COULEURS.texte, marginTop: 8 },
  sectionCompacte: { marginTop: 4 },
  // Les trois objectifs empilés, en pleine largeur.
  colonne: { gap: 8 },
  ligne: { flexDirection: 'row', gap: 8 },
  // Quatre durées de front sur 360 dp : peu de marge latérale pour que « 30 min » tienne sur une ligne.
  bouton: { flex: 1, justifyContent: 'center', paddingHorizontal: 4 },
  pied: { paddingHorizontal: ESPACE, paddingBottom: ESPACE, paddingTop: 8 },
});
