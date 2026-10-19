import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NIVEAUX, NOMS_NIVEAU, type Niveau } from '../catalogue/types';
import { Icone } from './icones';
import { CIBLE_MIN, COULEURS, ELEVATION, ESPACE, RAYON, TYPO } from './theme';
import { enfoncement, ondulation } from './toucher';

// Ce qui suit le nom du niveau dans la feuille : « Doux : on bouge sans forcer ».
const PHRASES_NIVEAU: Record<Niveau, string> = {
  1: 'on bouge sans forcer',
  2: 'ça chauffe un peu',
  3: 'pour celles et ceux qui s’entraînent déjà',
};

interface Props {
  niveau: Niveau;
  onChange: (niveau: Niveau) => void;
}

// Choix facultatif : la pastille montre le niveau courant, un tap ouvre la feuille des trois niveaux.
export function PastilleNiveau({ niveau, onChange }: Props) {
  const [ouverte, setOuverte] = useState(false);
  const bas = useSafeAreaInsets().bottom;

  const choisir = (choisi: Niveau) => {
    setOuverte(false);
    onChange(choisi);
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Niveau ${NOMS_NIVEAU[niveau]}, modifier`}
        onPress={() => setOuverte(true)}
        android_ripple={ondulation(COULEURS.texte)}
        style={({ pressed }) => [styles.pastille, enfoncement(pressed)]}
      >
        <Icone nom="en_forme" taille={20} />
        <Text style={styles.textePastille}>{`Niveau ${NOMS_NIVEAU[niveau]}`}</Text>
      </Pressable>

      <Modal transparent animationType="fade" visible={ouverte} onRequestClose={() => setOuverte(false)}>
        <View style={styles.voile}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fermer"
            onPress={() => setOuverte(false)}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.feuille, { paddingBottom: ESPACE + bas }]}>
            <Text style={styles.titre} accessibilityRole="header">
              Ton niveau
            </Text>
            {NIVEAUX.map((n) => {
              const selectionne = n === niveau;
              const couleur = selectionne ? COULEURS.texteSurOrange : COULEURS.texte;
              return (
                <Pressable
                  key={n}
                  accessibilityRole="button"
                  accessibilityLabel={`${NOMS_NIVEAU[n]} : ${PHRASES_NIVEAU[n]}`}
                  accessibilityState={{ selected: selectionne }}
                  onPress={() => choisir(n)}
                  android_ripple={ondulation(couleur)}
                  style={({ pressed }) => [
                    styles.option,
                    selectionne ? styles.optionChoisie : null,
                    selectionne ? ELEVATION.niveau2 : ELEVATION.niveau1,
                    enfoncement(pressed),
                  ]}
                >
                  <Text style={[styles.texteOption, { color: couleur }]}>
                    <Text style={styles.nomOption}>{NOMS_NIVEAU[n]}</Text>
                    {` : ${PHRASES_NIVEAU[n]}`}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  pastille: {
    minHeight: CIBLE_MIN,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'center',
    backgroundColor: COULEURS.carte,
    borderRadius: RAYON,
    paddingHorizontal: 16,
    overflow: 'hidden',
    ...ELEVATION.niveau1,
  },
  textePastille: { ...TYPO.labelLarge, color: COULEURS.texte },
  voile: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  feuille: {
    backgroundColor: COULEURS.fond,
    borderTopLeftRadius: RAYON,
    borderTopRightRadius: RAYON,
    padding: ESPACE,
    gap: 10,
  },
  titre: { ...TYPO.headlineSmall, color: COULEURS.texte },
  option: {
    minHeight: CIBLE_MIN,
    justifyContent: 'center',
    backgroundColor: COULEURS.carte,
    borderRadius: RAYON,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  optionChoisie: { backgroundColor: COULEURS.orange },
  texteOption: { ...TYPO.bodyLarge },
  nomOption: { ...TYPO.labelLarge, fontWeight: '700' },
});
