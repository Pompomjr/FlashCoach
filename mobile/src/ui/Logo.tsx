import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { LOGO_DISQUE, LOGO_ECLAIR, LOGO_ECLAIR_CHEMIN, LOGO_GRILLE } from './logoGeometrie';
import { COULEURS, TYPO } from './theme';

interface LogoProps {
  taille: number;
}

// Disque orange, éclair noir : du favicon (24 px) à l'icône d'app (1024 px).
export function Logo({ taille }: LogoProps) {
  const milieu = LOGO_GRILLE / 2;
  return (
    <View accessible accessibilityRole="image" accessibilityLabel="Flash Coach" style={{ width: taille, height: taille }}>
      <Svg width={taille} height={taille} viewBox={`0 0 ${LOGO_GRILLE} ${LOGO_GRILLE}`}>
        <Circle cx={milieu} cy={milieu} r={milieu} fill={LOGO_DISQUE} />
        <Path d={LOGO_ECLAIR_CHEMIN} fill={LOGO_ECLAIR} />
      </Svg>
    </View>
  );
}

interface MarqueProps {
  // Écran court (≈ 740 dp) : logo et nom plus petits, pour que le départ tienne sans défilement.
  compacte?: boolean;
  // Écran très court (≈ 740 dp) : le nom passe à côté du logo, pour gagner une ligne.
  enLigne?: boolean;
}

// Logo en grand, le nom dessous : le titre de l'écran de départ. Lu une seule fois, comme un titre.
export function Marque({ compacte = false, enLigne = false }: MarqueProps) {
  return (
    <View style={[styles.marque, compacte && styles.marqueCompacte, enLigne && styles.marqueEnLigne]} accessible accessibilityRole="header" accessibilityLabel="Flash Coach">
      <View aria-hidden>
        <Logo taille={compacte ? 48 : 76} />
      </View>
      <Text style={[styles.nom, compacte ? TYPO.headlineMedium : TYPO.displaySmall]}>Flash Coach</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  marque: { alignItems: 'center', gap: 6 },
  marqueCompacte: { gap: 2 },
  marqueEnLigne: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  nom: { color: COULEURS.texte, textAlign: 'center' },
});
