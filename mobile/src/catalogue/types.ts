export type Tenue = 'sport' | 'ville';
export type Bruit = 'normal' | 'silencieux';
export type Espace = 'sur_place' | 'un_peu';
export type Transpiration = 'faible' | 'moyenne' | 'elevee';
export type Effet = 'mobilite' | 'detente' | 'energie';
export type Zone = 'haut' | 'bas' | 'tronc' | 'global';
export type Intensite = 1 | 2 | 3;
export type Ressenti = 'raide' | 'stresse' | 'mou' | 'en_forme';
export type Duree = 3 | 5 | 10;
export type Niveau = 1 | 2 | 3;

export const RESSENTIS: readonly Ressenti[] = ['raide', 'stresse', 'mou', 'en_forme'];
export const DUREES: readonly Duree[] = [3, 5, 10];
export const NIVEAUX: readonly Niveau[] = [1, 2, 3];
// Noms affichés : jamais « débutant » ni « avancé », le niveau ne juge personne.
export const NOMS_NIVEAU: Record<Niveau, string> = { 1: 'Doux', 2: 'Tonique', 3: 'Costaud' };

export interface Contraintes {
  tenue: Tenue;
  bruit: Bruit;
  espace: Espace;
  sol: boolean;
}

export interface Exercice {
  id: string;
  nom: string;
  consigne: string;
  animation: string;
  sol: boolean;
  sauts: boolean;
  transpiration: Transpiration;
  espace: Espace;
  effets: Effet[];
  intensite: Intensite;
  zone: Zone;
  // Si vrai, le lecteur de séance (jalon 2) fait le côté gauche puis le droit.
  bilateral: boolean;
  // Plafond : une séance de niveau N n'utilise que des exercices de niveau ≤ N.
  niveau: Niveau;
}

// Un contexte n'est qu'un réglage de contraintes déjà rempli : en ajouter un ne demande pas de nouvelle version de l'app.
export interface Contexte {
  id: string;
  nom: string;
  emoji: string;
  contraintes: Contraintes;
  premium: boolean;
  ordre: number;
}
