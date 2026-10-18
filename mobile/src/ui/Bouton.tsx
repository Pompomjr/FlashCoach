import { Pressable, StyleSheet, Text } from 'react-native';

import { COULEURS, RAYON } from './theme';

interface Props {
  libelle: string;
  onPress: () => void;
  variante?: 'principal' | 'secondaire';
}

export function Bouton({ libelle, onPress, variante = 'principal' }: Props) {
  const principal = variante === 'principal';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={libelle}
      onPress={onPress}
      style={({ pressed }) => [styles.base, principal ? styles.principal : styles.secondaire, pressed && styles.presse]}
    >
      <Text style={[styles.texte, principal ? styles.textePrincipal : styles.texteSecondaire]}>{libelle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { flexGrow: 1, borderRadius: RAYON, paddingVertical: 16, paddingHorizontal: 20, alignItems: 'center' },
  principal: { backgroundColor: COULEURS.orange },
  secondaire: { backgroundColor: COULEURS.carteClaire },
  presse: { opacity: 0.85 },
  texte: { fontSize: 18, fontWeight: '700' },
  textePrincipal: { color: COULEURS.texteSurOrange },
  texteSecondaire: { color: COULEURS.texteSombre },
});
