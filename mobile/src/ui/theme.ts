import { Platform, type TextStyle, type ViewStyle } from 'react-native';

// Palette de la fiche, répartie comme la maquette : fond bleu nuit profond, cartes en bleu #3A506B, plus
// claires que le fond (comme l'élévation Material en thème sombre), orange pour l'action.
// Contrastes : texte clair 11,2:1 sur le fond et 7,3:1 sur la carte ; texte discret 8,5:1 et 5,6:1 ;
// texte noir sur orange 7,5:1 ; jamais de blanc sur l'orange (≈ 2,8:1, illisible). L'orange sur la carte
// (2,95:1) ne porte jamais seul une information : une icône orange se pose sur une pastille.
export const COULEURS = {
  fond: '#22344A',
  carte: '#3A506B',
  carteClaire: '#EDF2F7',
  orange: '#F97316',
  // Ombre de profondeur de l'orange (figurine) : jamais pour du texte.
  orangeProfond: '#C2410C',
  texte: '#EDF2F7',
  texteSombre: '#2D3748',
  texteSurOrange: '#000000',
  texteDiscret: '#CBD5E0',
  // Illustrations (figurine, décor) : jamais pour du texte.
  cheveux: '#9A3412',
  mur: '#CBD5E1',
  areteMur: '#94A3B8',
} as const;

export const RAYON = 16;
export const ESPACE = 16;
// Cible tactile minimale (dp) : 48 × 48 pour tout ce qui se touche.
export const CIBLE_MIN = 48;

// Noms de famille sous lesquels `useFonts` (app/_layout.tsx) enregistre Barlow Condensed.
// La clé de la table passée à `useFonts` sert de nom sur toutes les plateformes.
export const POLICE_AFFICHAGE_GRAS = 'BarlowCondensed_700Bold';
export const POLICE_AFFICHAGE_EXTRA = 'BarlowCondensed_800ExtraBold';

// Sur le web une police absente retomberait sur le serif du navigateur : on donne une pile de secours.
// Sur mobile, une famille inconnue (police en erreur de chargement) retombe sur la police système.
const famille = (nom: string) => (Platform.OS === 'web' ? `${nom}, system-ui, sans-serif` : nom);

type Role = Pick<TextStyle, 'fontFamily' | 'fontSize' | 'lineHeight' | 'fontWeight'>;

// Rôles typographiques Material 3. Tailles en sp (React Native les suit via le réglage de taille du
// système). Barlow Condensed ne sert qu'à l'affichage (marque, titres d'écran, minuteur, grands chiffres) ;
// libellés, boutons et texte courant restent en police système (Roboto sur Android).
// Pour les rôles d'affichage, la graisse est portée par le fichier de police (700 ou 800) : pas de
// fontWeight, sinon Android et le web ajouteraient un faux gras.
export const TYPO = {
  displayLarge: { fontFamily: famille(POLICE_AFFICHAGE_EXTRA), fontSize: 57, lineHeight: 64 },
  displaySmall: { fontFamily: famille(POLICE_AFFICHAGE_EXTRA), fontSize: 36, lineHeight: 44 },
  headlineMedium: { fontFamily: famille(POLICE_AFFICHAGE_GRAS), fontSize: 28, lineHeight: 36 },
  // Titres de section (« Où es-tu ? »…) : affichage, un cran sous les titres d'écran.
  headlineSmall: { fontFamily: famille(POLICE_AFFICHAGE_GRAS), fontSize: 24, lineHeight: 32 },
  titleLarge: { fontSize: 22, lineHeight: 28, fontWeight: '700' },
  titleMedium: { fontSize: 18, lineHeight: 24, fontWeight: '700' },
  bodyLarge: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  bodyMedium: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  labelLarge: { fontSize: 16, lineHeight: 24, fontWeight: '600' },
} as const satisfies Record<string, Role>;

// Élévation Material : une ombre douce, décalée vers le bas et floutée, jamais un halo centré.
// Sur le fond bleu nuit, une ombre noire légère disparaît : opacités plus fortes que les valeurs Material.
// Android dessine son ombre système avec `elevation` ; web et iOS utilisent `boxShadow` (RN 0.88).
// Les deux ensemble donneraient une double ombre sur Android, d'où le choix par plateforme.
function elevation(niveau: 1 | 2): ViewStyle {
  if (Platform.OS === 'android') return { elevation: niveau === 1 ? 2 : 5 };
  return {
    boxShadow:
      niveau === 1
        ? '0px 1px 3px rgba(0, 0, 0, 0.40), 0px 2px 6px 1px rgba(0, 0, 0, 0.22)'
        : '0px 2px 4px rgba(0, 0, 0, 0.40), 0px 6px 14px 3px rgba(0, 0, 0, 0.28)',
  };
}

export const ELEVATION = {
  niveau1: elevation(1),
  niveau2: elevation(2),
} as const;
