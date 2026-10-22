import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { CIBLE_MIN, COULEURS, ELEVATION, RAYON, TYPO } from './theme';
import { enfoncement, ondulation } from './toucher';

// react-native-web peint le rond « allumé » avec activeThumbColor (vert par défaut) ; React Native l'ignore et
// utilise thumbColor dans les deux états. Hors des types de React Native, d'où le passage par un objet.
const PROPS_WEB = { activeThumbColor: COULEURS.carteClaire } as object;

interface Props {
  libelle: string;
  valeur: boolean;
  onChange: (valeur: boolean) => void;
}

// Toute la ligne se touche (48 dp au moins) et se lit comme un seul interrupteur ; le `Switch` natif n'est
// que le dessin de l'état, caché aux lecteurs d'écran et sans toucher propre.
export function Interrupteur({ libelle, valeur, onChange }: Props) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={libelle}
      aria-checked={valeur}
      onPress={() => onChange(!valeur)}
      android_ripple={ondulation(COULEURS.texte)}
      style={({ pressed }) => [styles.ligne, enfoncement(pressed)]}
    >
      <Text style={styles.libelle}>{libelle}</Text>
      <View aria-hidden pointerEvents="none">
        <Switch
          value={valeur}
          trackColor={{ false: COULEURS.fond, true: COULEURS.orange }}
          thumbColor={COULEURS.carteClaire}
          ios_backgroundColor={COULEURS.fond}
          {...PROPS_WEB}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ligne: {
    minHeight: CIBLE_MIN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: COULEURS.carte,
    borderRadius: RAYON,
    paddingVertical: 8,
    paddingHorizontal: 16,
    overflow: 'hidden',
    ...ELEVATION.niveau1,
  },
  libelle: { ...TYPO.labelLarge, color: COULEURS.texte, flexShrink: 1 },
});
