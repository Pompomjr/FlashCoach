import type { Niveau } from '../catalogue/types';

export type FamilleCircuit = 'full_body' | 'poussee' | 'jambes' | 'dos' | 'cardio';
export type Materiel = 'chaise' | 'table';

export interface Poste {
  exerciceId: string;
  // Pour un exercice bilatéral fait d'un seul côté sur ce poste (« Squat bulgare G »).
  cote?: 'gauche' | 'droite';
  // Remplaçant quand l'utilisateur n'a pas le meuble demandé par l'exercice.
  sansMateriel?: string;
}

export interface Circuit {
  id: string; // ex. 'full-body-doux'
  nom: string; // ex. 'Full body'
  famille: FamilleCircuit;
  niveau: Niveau; // Doux / Tonique / Costaud
  tours: number; // 3 ou 4
  tourFacultatif: boolean; // vrai pour Costaud (5e tour proposé)
  postes: [Poste, Poste, Poste, Poste, Poste];
}
