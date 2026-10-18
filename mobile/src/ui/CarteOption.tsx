import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { COULEURS, RAYON } from './theme';

interface Props {
  libelle: string;
  emoji?: string;
  selectionne: boolean;
  verrouille?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export function CarteOption({ libelle, emoji, selectionne, verrouille = false, onPress, style }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={verrouille ? `${libelle}, Premium` : libelle}
      accessibilityState={{ selected: selectionne }}
      onPress={onPress}
      style={({ pressed }) => [styles.carte, selectionne && styles.selectionnee, pressed && styles.pressee, style]}
    >
      <Text style={[styles.texte, selectionne && styles.texteSelectionne, verrouille && !selectionne && styles.texteVerrouille]}>
        {emoji ? `${emoji}  ` : ''}
        {libelle}
        {verrouille ? '  🔒' : ''}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  carte: { backgroundColor: COULEURS.carte, borderRadius: RAYON, paddingVertical: 14, paddingHorizontal: 16 },
  selectionnee: { backgroundColor: COULEURS.orange },
  pressee: { opacity: 0.85 },
  texte: { color: COULEURS.texte, fontSize: 16, fontWeight: '600' },
  texteSelectionne: { color: COULEURS.texteSurOrange },
  texteVerrouille: { color: COULEURS.texteDiscret },
});
