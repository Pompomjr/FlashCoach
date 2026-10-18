import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { ondulation, enfoncement } from './toucher';
import { CIBLE_MIN, COULEURS, RAYON, TYPO } from './theme';

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
      android_ripple={ondulation(principal ? COULEURS.texteSurOrange : COULEURS.texteSombre)}
      style={({ pressed }) => [styles.base, principal ? styles.principal : styles.secondaire, enfoncement(pressed), style]}
    >
      <Text style={[styles.texte, principal ? styles.textePrincipal : styles.texteSecondaire]}>{libelle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: CIBLE_MIN,
    borderRadius: RAYON,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  principal: { backgroundColor: COULEURS.orange },
  secondaire: { backgroundColor: COULEURS.carteClaire },
  texte: { ...TYPO.titleMedium, textAlign: 'center' },
  textePrincipal: { color: COULEURS.texteSurOrange },
  texteSecondaire: { color: COULEURS.texteSombre },
});
