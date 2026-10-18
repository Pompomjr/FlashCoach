import type { Exercice } from '../catalogue/types';
import { correspond, type Cible } from './cibles';

// Appariement biparti maximal (algorithme de Kuhn) entre les places d'une séance et les exercices idéaux :
// un exercice ne remplit qu'une place, même s'il convient à plusieurs phases (cœur « stresse » et retour au calme).
// Renvoie, pour chaque place, si elle est remplie.
// Une place remplie le reste quand on cherche à remplir les suivantes : l'ensemble des places remplies ne dépend
// donc que de l'ordre des places, jamais de l'ordre du catalogue. Les places manquantes tombent sur les dernières.
export function apparier(places: Cible[], exercices: Exercice[]): boolean[] {
  const candidats = places.map((cible) =>
    exercices.flatMap((exercice, index) => (correspond(exercice, cible, 0) ? [index] : [])),
  );
  const titulaire: (number | undefined)[] = exercices.map(() => undefined);

  const augmenter = (place: number, vus: Set<number>): boolean => {
    for (const exercice of candidats[place]) {
      if (vus.has(exercice)) continue;
      vus.add(exercice);
      const occupant = titulaire[exercice];
      if (occupant === undefined || augmenter(occupant, vus)) {
        titulaire[exercice] = place;
        return true;
      }
    }
    return false;
  };

  return places.map((_, place) => augmenter(place, new Set()));
}

// Nombre maximal de places remplies chacune par un exercice idéal distinct.
export function tailleAppariement(places: Cible[], exercices: Exercice[]): number {
  return apparier(places, exercices).filter(Boolean).length;
}
