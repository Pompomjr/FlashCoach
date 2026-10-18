import type { EtatLecteur } from './lecteur';

// Exercice fait des deux côtés : première moitié de l'effort à gauche, seconde à droite.
export function coteCourant(etat: EtatLecteur): 'gauche' | 'droite' | null {
  const bloc = etat.blocs[etat.index];
  if (!bloc.exercice.bilateral || etat.etape !== 'effort') return null;
  return etat.restantMs > (bloc.effortS * 1000) / 2 ? 'gauche' : 'droite';
}

export function formaterTemps(ms: number): string {
  const secondes = Math.ceil(ms / 1000);
  return `${Math.floor(secondes / 60)}:${String(secondes % 60).padStart(2, '0')}`;
}

export function minutesEffectuees(ms: number): number {
  return Math.round(ms / 60000);
}
