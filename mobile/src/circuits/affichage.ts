import { EXERCICES } from '../catalogue/exercices';
import { NOMS_NIVEAU, type Niveau } from '../catalogue/types';
import { CIRCUITS } from './circuits';
import { exerciceDuPoste } from './construire';
import { materielDe } from './materiel';
import type { Circuit, Materiel, Poste } from './types';

const NOMS_EXERCICES = new Map(EXERCICES.map((exercice) => [exercice.id, exercice.nom]));

// Les circuits d'un niveau, dans l'ordre de la proposition (le cardio, niveau 2, est dans « Tonique »).
export function circuitsDuNiveau(niveau: Niveau): Circuit[] {
  return CIRCUITS.filter((circuit) => circuit.niveau === niveau);
}

export function minutesDe(dureeS: number): number {
  return Math.round(dureeS / 60);
}

// « 4 tours · 21 min » : toujours plusieurs tours (3 à 5).
export function libelleTours(tours: number, minutes: number): string {
  return `${tours} tours · ${minutes} min`;
}

// Les meubles que demande le circuit, chacun une seule fois, la chaise d'abord.
function meublesDuCircuit(circuit: Circuit): Materiel[] {
  const demandes = new Set(circuit.postes.map((poste) => materielDe(poste.exerciceId)));
  return (['chaise', 'table'] as const).filter((meuble) => demandes.has(meuble));
}

export function circuitDemandeUnMeuble(circuit: Circuit): boolean {
  return meublesDuCircuit(circuit).length > 0;
}

// « chaise », « table », « chaise et table » ou « sans matériel ».
export function libelleMateriel(circuit: Circuit): string {
  const meubles = meublesDuCircuit(circuit);
  return meubles.length === 0 ? 'sans matériel' : meubles.join(' et ');
}

// « Squat bulgare (gauche) » : le côté imposé par le poste suit le nom.
export function libellePoste(poste: Poste, sansMateriel: boolean): string {
  const id = exerciceDuPoste(poste, sansMateriel);
  const nom = NOMS_EXERCICES.get(id) ?? id;
  return poste.cote ? `${nom} (${poste.cote})` : nom;
}

// Nom lu pour une carte de la liste : « Full body, Tonique, 4 tours, 21 minutes ».
export function libelleAccessibleCircuit(circuit: Circuit, minutes: number): string {
  return `${circuit.nom}, ${NOMS_NIVEAU[circuit.niveau]}, ${circuit.tours} tours, ${minutes} minutes`;
}
