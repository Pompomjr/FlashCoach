import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { COULEURS, RAYON } from './theme';

interface Props {
  libelle: string;
  onPress: () => void;
  variante?: 'principal' | 'secondaire';
  style?: StyleProp<ViewStyle>;
}

export function Bouton({ libelle, onPress, variante = 'principal', style }: Props) {
  const principal = variante === 'principal';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={libelle}
      onPress={onPress}
      style={({ pressed }) => [styles.base, principal ? styles.principal : styles.secondaire, pressed && styles.presse, style]}
    >
      <Text style={[styles.texte, principal ? styles.textePrincipal : styles.texteSecondaire]}>{libelle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: RAYON, paddingVertical: 16, paddingHorizontal: 20, alignItems: 'center' },
  principal: { backgroundColor: COULEURS.orange },
  secondaire: { backgroundColor: COULEURS.carteClaire },
  presse: { opacity: 0.85 },
  texte: { fontSize: 18, fontWeight: '700' },
  textePrincipal: { color: COULEURS.texteSurOrange },
  texteSecondaire: { color: COULEURS.texteSombre },
});
