import type { Contraintes, Duree, Exercice, Niveau, Objectif } from '../catalogue/types';

export type Phase = 'mise_en_route' | 'coeur' | 'retour_au_calme';

// 0 : séance idéale ; 1 : intensité assouplie ; 2 : effet assoupli (une phase calme reste calme) ;
// 3 : exercice répété (même règle d'effet) ; 4 : dernier recours, énergie dans une phase calme.
// Les contraintes, elles, ne sont jamais assouplies.
export type NiveauAssouplissement = 0 | 1 | 2 | 3 | 4;

export interface Bloc {
  exercice: Exercice;
  phase: Phase;
  // La transition précède l'effort : on y montre l'exercice qui arrive.
  transitionS: number;
  effortS: number;
  // Séance en tours (circuit, ou cœur de 15 et 30 min) : tour en cours (« Tour 2 / 4 »).
  tour?: { numero: number; total: number };
  // Séances en circuit seulement : côté imposé à ce poste.
  cote?: 'gauche' | 'droite';
}

// Objectifs construits par le générateur ; la prise de masse joue un circuit (circuits/masse.ts).
export type ObjectifGenere = Exclude<Objectif, 'masse'>;
export const OBJECTIFS_GENERES: readonly ObjectifGenere[] = ['calories', 'etirements'];

// Les contraintes ne sont plus choisies : toute séance se fait « à la maison » (CONTRAINTES_MAISON).
export interface ParametresSeance {
  objectif: ObjectifGenere;
  duree: Duree;
  graine: number;
  // Exercices de la séance précédente, à éviter quand c'est possible.
  exclure?: string[];
  // Intensité choisie, plafond de niveau des exercices ; 1 (Léger) par défaut.
  niveau?: Niveau;
}

export interface Seance {
  objectif: Objectif;
  // Toujours les contraintes « maison » : gardées pour vérifier ce que la séance respecte.
  contraintes: Contraintes;
  // 5, 10, 15 ou 30 pour une séance générée ; minutes arrondies pour un circuit.
  duree: number;
  graine: number;
  niveau: Niveau;
  blocs: Bloc[];
  dureeTotaleS: number;
  // Le plus fort assouplissement utilisé dans la séance.
  assouplissement: NiveauAssouplissement;
  // Présent seulement pour une séance prête en circuit.
  circuitId?: string;
}
