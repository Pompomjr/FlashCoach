import { estPosteApresRepos } from '../circuits/construire';
import type { Bloc } from '../generateur/types';
import { LIBELLES_PHASE } from '../ui/libelles';
import type { Etape, EtatLecteur } from './lecteur';

// Les blocs d'échauffement d'un circuit ont la phase « mise en route » : l'écran dit « Échauffement » quand la séance est un circuit.
export const LIBELLE_ECHAUFFEMENT = 'Échauffement';

// « Tour 2 / 4 » pendant les tours d'un circuit, sinon le libellé de la phase.
export function libelleEtape(bloc: Bloc): string {
  return bloc.tour ? `Tour ${bloc.tour.numero} / ${bloc.tour.total}` : LIBELLES_PHASE[bloc.phase];
}

// En-tête de l'écran de séance. Un circuit dit « Échauffement » (au lieu de « Mise en route »), puis
// « Tour 2 / 4 » pendant les tours, puis « Retour au calme » ; une séance flash garde ses libellés de phase, sauf
// pendant les tours de son cœur (15 et 30 min) : « Tour 2 / 4 », comme un circuit.
export function libelleEnTete(bloc: Bloc, circuit: boolean): string {
  if (!circuit) return bloc.tour ? libelleEtape(bloc) : LIBELLES_PHASE[bloc.phase];
  return bloc.phase === 'mise_en_route' ? LIBELLE_ECHAUFFEMENT : libelleEtape(bloc);
}

// Espace insécable avant « ! » (typographie française) : le point d'exclamation ne passe jamais seul à la ligne.
export const MESSAGE_DERNIER_TOUR = 'Dernier tour ! Va au bout si la technique reste propre.';

// Titre de la carte : le nom pendant l'effort, « À suivre » pendant la transition, et « Repos · À suivre »
// quand la transition est le repos entre deux tours d'un circuit.
export function titreExercice(bloc: Bloc, etape: Etape): string {
  if (etape === 'effort') return bloc.exercice.nom;
  return `${estPosteApresRepos(bloc) ? 'Repos · ' : ''}À suivre : ${bloc.exercice.nom}`;
}

// Au début du dernier tour (transition de son premier poste, donc pendant le repos qui le précède) seulement.
export function messageDernierTour(etat: EtatLecteur): string | null {
  const bloc = etat.blocs[etat.index];
  if (etat.etape !== 'transition' || !bloc.tour || bloc.tour.numero !== bloc.tour.total) return null;
  return estPosteApresRepos(bloc) ? MESSAGE_DERNIER_TOUR : null;
}

// Texte annoncé aux lecteurs d'écran (iOS) à chaque changement d'étape : le nom de l'exercice ; pour un circuit,
// aussi le repos entre deux tours (« Repos · À suivre : … ») et, au début du dernier tour, l'encouragement.
export function texteAnnonce(etat: EtatLecteur): string {
  const bloc = etat.blocs[etat.index];
  const debut = etat.etape === 'transition' && estPosteApresRepos(bloc) ? titreExercice(bloc, etat.etape) : bloc.exercice.nom;
  const dernierTour = messageDernierTour(etat);
  return dernierTour === null ? debut : `${debut}. ${dernierTour}`;
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
