import type { Materiel } from './types';

// Meuble nécessaire : l'app ne garantit jamais sa solidité, elle propose toujours une alternative.
const MATERIEL = new Map<string, Materiel>([
  ['pompe-inclinee', 'chaise'],
  ['dips-chaise', 'chaise'],
  ['squat-bulgare', 'chaise'],
  ['pompe-pieds-sureleves', 'chaise'],
  ['assis-debout', 'chaise'],
  ['tractions-australiennes', 'table'],
]);

export function materielDe(exerciceId: string): Materiel | null {
  return MATERIEL.get(exerciceId) ?? null;
}
