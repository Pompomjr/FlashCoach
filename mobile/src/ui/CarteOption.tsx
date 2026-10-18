import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { Icone, type NomIcone } from './icones';
import { CIBLE_MIN, COULEURS, ELEVATION, RAYON, TYPO } from './theme';
import { enfoncement, ondulation } from './toucher';

interface Props {
  libelle: string;
  icone?: NomIcone;
  selectionne: boolean;
  verrouille?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export function CarteOption({ libelle, icone, selectionne, verrouille = false, onPress, style }: Props) {
  const grise = verrouille && !selectionne;
  const couleurTexte = selectionne ? COULEURS.texteSurOrange : grise ? COULEURS.texteDiscret : COULEURS.texte;
  // Une carte verrouillée montre le cadenas à la place de l'icône de son contexte.
  const nomIcone = verrouille ? 'cadenas' : icone;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={verrouille ? `${libelle}, Premium` : libelle}
      accessibilityState={{ selected: selectionne }}
      onPress={onPress}
      android_ripple={ondulation(couleurTexte)}
      style={({ pressed }) => [
        styles.carte,
        selectionne ? styles.selectionnee : null,
        selectionne ? ELEVATION.niveau2 : ELEVATION.niveau1,
        enfoncement(pressed),
        style,
      ]}
    >
      {nomIcone !== undefined && <Icone nom={nomIcone} couleur={couleurTexte} />}
      <Text style={[styles.texte, { color: couleurTexte }]}>{libelle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  carte: {
    minHeight: CIBLE_MIN,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COULEURS.carte,
    borderRadius: RAYON,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  selectionnee: { backgroundColor: COULEURS.orange },
  texte: { ...TYPO.labelLarge, flexShrink: 1 },
});
