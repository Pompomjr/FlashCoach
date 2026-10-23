import type { Duree, Niveau } from '../catalogue/types';
import type { Seance } from '../generateur/types';
import { CIRCUITS } from './circuits';
import { construireSeanceCircuit } from './construire';
import type { Circuit, FamilleCircuit } from './types';

// « Prise de masse » joue un circuit (30 s par poste, 10 s d'aperçu, repos entre les tours) au niveau choisi.
// Les familles de renforcement tournent d'une séance à l'autre ; le cardio n'en fait pas partie.
export const FAMILLES_MASSE: readonly FamilleCircuit[] = ['full_body', 'poussee', 'jambes', 'dos'];

// Durées réelles : 1 tour ≈ 6 min, 2 ≈ 11, 3 ≈ 16, 6 ≈ 31 (échauffement et retour au calme compris).
const TOURS_PAR_DUREE: Record<Duree, number> = { 5: 1, 10: 2, 15: 3, 30: 6 };

export function toursPourDuree(duree: Duree): number {
  return TOURS_PAR_DUREE[duree];
}

// Famille de la prochaine séance, d'après celle de la dernière séance de masse (null s'il n'y en a pas).
export function familleSuivante(derniere: FamilleCircuit | null): FamilleCircuit {
  const index = derniere === null ? -1 : FAMILLES_MASSE.indexOf(derniere);
  return index === -1 ? FAMILLES_MASSE[0] : FAMILLES_MASSE[(index + 1) % FAMILLES_MASSE.length];
}

export function circuitPourMasse(niveau: Niveau, famille: FamilleCircuit): Circuit {
  const circuit = CIRCUITS.find((c) => c.famille === famille && c.niveau === niveau);
  if (circuit === undefined) throw new Error(`Aucun circuit ${famille} au niveau ${niveau}`);
  return circuit;
}

export function construireSeanceMasse({
  niveau,
  duree,
  famille,
  sansMateriel,
  graine,
}: {
  niveau: Niveau;
  duree: Duree;
  famille: FamilleCircuit;
  sansMateriel: boolean;
  graine: number;
}): Seance {
  return construireSeanceCircuit(circuitPourMasse(niveau, famille), { sansMateriel, tours: toursPourDuree(duree), graine });
}
