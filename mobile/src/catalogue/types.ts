export type Tenue = 'sport' | 'ville';
export type Bruit = 'normal' | 'silencieux';
export type Espace = 'sur_place' | 'un_peu';
export type Transpiration = 'faible' | 'moyenne' | 'elevee';
export type Effet = 'mobilite' | 'detente' | 'energie';
export type Zone = 'haut' | 'bas' | 'tronc' | 'global';
export type Intensite = 1 | 2 | 3;
// Ressenti : ne sert plus qu'à relire les anciennes entrées du journal (avant le choix par objectif).
export type Ressenti = 'raide' | 'stresse' | 'mou' | 'en_forme';
export type Objectif = 'calories' | 'masse' | 'etirements';
export type Duree = 5 | 10 | 15 | 30;
// Le niveau est l'intensité choisie au départ : Léger, Moyen, Lourd.
export type Niveau = 1 | 2 | 3;

export const RESSENTIS: readonly Ressenti[] = ['raide', 'stresse', 'mou', 'en_forme'];
export const OBJECTIFS: readonly Objectif[] = ['calories', 'masse', 'etirements'];
export const NOMS_OBJECTIF: Record<Objectif, string> = {
  calories: 'Brûler des calories',
  masse: 'Prise de masse',
  etirements: 'Étirements',
};
export const DUREES: readonly Duree[] = [5, 10, 15, 30];
export const NIVEAUX: readonly Niveau[] = [1, 2, 3];
// Noms affichés : jamais « débutant » ni « avancé », l'intensité ne juge personne.
export const NOMS_NIVEAU: Record<Niveau, string> = { 1: 'Léger', 2: 'Moyen', 3: 'Lourd' };

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
  // Objectifs que sert l'exercice (au moins un), dans l'ordre de OBJECTIFS.
  objectifs: Objectif[];
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
