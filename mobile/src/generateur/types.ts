import type { Contraintes, Duree, Exercice, Ressenti } from '../catalogue/types';

export type Phase = 'mise_en_route' | 'coeur' | 'retour_au_calme';

// 0 : séance idéale ; 1 : intensité assouplie ; 2 : effet assoupli ; 3 : exercice répété.
// Les contraintes, elles, ne sont jamais assouplies.
export type NiveauAssouplissement = 0 | 1 | 2 | 3;

export interface Bloc {
  exercice: Exercice;
  phase: Phase;
  // La transition précède l'effort : on y montre l'exercice qui arrive.
  transitionS: number;
  effortS: number;
}

export interface ParametresSeance {
  contexteId: string;
  contraintes: Contraintes;
  ressenti: Ressenti;
  duree: Duree;
  graine: number;
  // Exercices de la séance précédente, à éviter quand c'est possible.
  exclure?: string[];
}

export interface Seance {
  contexteId: string;
  contraintes: Contraintes;
  ressenti: Ressenti;
  duree: Duree;
  graine: number;
  blocs: Bloc[];
  dureeTotaleS: number;
  // Le plus fort assouplissement utilisé dans la séance.
  assouplissement: NiveauAssouplissement;
}
