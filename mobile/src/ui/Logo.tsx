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

// Logo et nom côte à côte : le titre de l'écran de départ. Lu une seule fois, comme un titre.
export function Marque() {
  return (
    <View style={styles.marque} accessible accessibilityRole="header" accessibilityLabel="Flash Coach">
      <View aria-hidden>
        <Logo taille={40} />
      </View>
      <Text style={styles.nom}>Flash Coach</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  marque: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  nom: { ...TYPO.headlineMedium, color: COULEURS.texte },
});
