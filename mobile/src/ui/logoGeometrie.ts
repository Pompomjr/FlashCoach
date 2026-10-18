// Géométrie du logo, sur une grille de 64 : un disque orange et un éclair noir franc, incliné.
// Source unique : le composant Logo l'affiche et le script de rendu des PNG (icône d'app, écran de
// démarrage, favicon) la lit, pour que tous les supports montrent exactement le même dessin.
export const LOGO_GRILLE = 64;
export const LOGO_DISQUE = '#F97316';
export const LOGO_ECLAIR = '#000000';
// Six sommets, du sommet droit à la pointe basse. Boîte englobante 18–46 × 8–56 : centrée sur (32, 32).
export const LOGO_ECLAIR_POINTS = '38,8 18,36 30,36 26,56 46,26 34,26';
export const LOGO_ECLAIR_CHEMIN = 'M38 8 18 36h12l-4 20 20-30H34z';
