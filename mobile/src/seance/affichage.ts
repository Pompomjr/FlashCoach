import type { Bloc } from '../generateur/types';
import { LIBELLES_PHASE } from '../ui/libelles';
import type { EtatLecteur } from './lecteur';

// Les blocs d'échauffement d'un circuit ont la phase « mise en route » : l'écran dit « Échauffement » quand la séance est un circuit.
export const LIBELLE_ECHAUFFEMENT = 'Échauffement';

// « Tour 2 / 4 » pendant les tours d'un circuit, sinon le libellé de la phase.
export function libelleEtape(bloc: Bloc): string {
  return bloc.tour ? `Tour ${bloc.tour.numero} / ${bloc.tour.total}` : LIBELLES_PHASE[bloc.phase];
}

// Côté imposé par le poste (circuit) ; sinon un exercice bilatéral se fait des deux côtés :
// première moitié de l'effort à gauche, seconde à droite.
export function coteCourant(etat: EtatLecteur): 'gauche' | 'droite' | null {
  const bloc = etat.blocs[etat.index];
  if (etat.etape !== 'effort') return null;
  if (bloc.cote) return bloc.cote;
  if (!bloc.exercice.bilateral) return null;
  return etat.restantMs > (bloc.effortS * 1000) / 2 ? 'gauche' : 'droite';
}

export function formaterTemps(ms: number): string {
  const secondes = Math.ceil(ms / 1000);
  return `${Math.floor(secondes / 60)}:${String(secondes % 60).padStart(2, '0')}`;
}

export function minutesEffectuees(ms: number): number {
  return Math.round(ms / 60000);
}
