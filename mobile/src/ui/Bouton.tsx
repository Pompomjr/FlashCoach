import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { ondulation, enfoncement } from './toucher';
import { CIBLE_MIN, COULEURS, RAYON, TYPO } from './theme';

interface Props {
  libelle: string;
  // Nom lu par les lecteurs d'écran quand le libellé visible est raccourci (« Terminer »).
  nomAccessible?: string;
  onPress: () => void;
  // Inactif : le toucher est ignoré et le bouton est lu comme désactivé.
  desactive?: boolean;
  variante?: 'principal' | 'secondaire';
  // Lignes de texte autorisées : 1 par défaut, plus pour un bouton étroit dont le libellé passe à la ligne.
  lignes?: number;
  style?: StyleProp<ViewStyle>;
}

export function Bouton({ libelle, nomAccessible = libelle, onPress, desactive = false, variante = 'principal', lignes = 1, style }: Props) {
  const principal = variante === 'principal';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={nomAccessible}
      onPress={onPress}
      disabled={desactive}
      accessibilityState={{ disabled: desactive }}
      android_ripple={ondulation(principal ? COULEURS.texteSurOrange : COULEURS.texteSombre)}
      style={({ pressed }) => [styles.base, principal ? styles.principal : styles.secondaire, enfoncement(pressed), desactive && styles.desactive, style]}
    >
      <Text style={[styles.texte, principal ? styles.textePrincipal : styles.texteSecondaire]} numberOfLines={lignes}>
        {libelle}
      </Text>
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
  desactive: { opacity: 0.5 },
  texte: { ...TYPO.titleMedium, textAlign: 'center' },
  textePrincipal: { color: COULEURS.texteSurOrange },
  texteSecondaire: { color: COULEURS.texteSombre },
});
