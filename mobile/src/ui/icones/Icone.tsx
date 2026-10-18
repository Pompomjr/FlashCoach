import Svg, { Path } from 'react-native-svg';

import { COULEURS } from '../theme';
import { TRACES, type NomIcone } from './traces';

interface Props {
  nom: NomIcone;
  taille?: number;
  couleur?: string;
}

// Une seule famille : grille 24, trait 2, extrémités et jonctions arrondies, sans remplissage.
// Décorative : le nom accessible vient toujours de l'élément qui la porte (bouton, ligne…).
export function Icone({ nom, taille = 24, couleur = COULEURS.texte }: Props) {
  return (
    <Svg
      testID={`icone-${nom}`}
      width={taille}
      height={taille}
      viewBox="0 0 24 24"
      fill="none"
      stroke={couleur}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {TRACES[nom].map((d) => (
        <Path key={d} d={d} />
      ))}
    </Svg>
  );
}
