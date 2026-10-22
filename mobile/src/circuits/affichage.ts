import { EXERCICES } from '../catalogue/exercices';
import { NOMS_NIVEAU, type Niveau } from '../catalogue/types';
import { CIRCUITS } from './circuits';
import { exerciceDuPoste } from './construire';
import { materielDe } from './materiel';
import type { Circuit, FamilleCircuit, Materiel, Poste } from './types';

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

// Les meubles que demande le circuit, chacun une seule fois, la chaise d'abord. Sans meuble stable, les
// remplaçants sont joués : ils n'en demandent aucun.
function meublesDuCircuit(circuit: Circuit, sansMateriel = false): Materiel[] {
  const demandes = new Set(circuit.postes.map((poste) => materielDe(exerciceDuPoste(poste, sansMateriel))));
  return (['chaise', 'table'] as const).filter((meuble) => demandes.has(meuble));
}

export function circuitDemandeUnMeuble(circuit: Circuit): boolean {
  return meublesDuCircuit(circuit).length > 0;
}

// « chaise », « table », « chaise et table » ou « sans matériel ».
export function libelleMateriel(circuit: Circuit, sansMateriel = false): string {
  const meubles = meublesDuCircuit(circuit, sansMateriel);
  return meubles.length === 0 ? 'sans matériel' : meubles.join(' et ');
}

const NOMS_FAMILLES: Record<FamilleCircuit, string> = {
  full_body: 'Full body',
  poussee: 'Poussée',
  jambes: 'Jambes',
  dos: 'Dos',
  cardio: 'Cardio',
};

export function libelleFamille(circuit: Circuit): string {
  return NOMS_FAMILLES[circuit.famille];
}

// Vrai quand « sans meuble » remplace des tractions sous la table par le Y-T au sol : le dos travaille moins.
export function tirageRemplace(circuit: Circuit, sansMateriel: boolean): boolean {
  return sansMateriel && circuit.postes.some((poste) => poste.exerciceId === 'tractions-australiennes' && exerciceDuPoste(poste, true) === 'tirage-yt');
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
