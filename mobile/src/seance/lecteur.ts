import type { Bloc } from '../generateur/types';

export type Etape = 'transition' | 'effort';

export interface EtatLecteur {
  blocs: Bloc[];
  index: number;
  // La transition précède l'effort : on y montre l'exercice qui arrive.
  etape: Etape;
  restantMs: number;
  enPause: boolean;
  termine: boolean;
  // Temps réellement passé, pauses exclues : sert à l'écran Bravo.
  ecouleMs: number;
  // Exercices dont l'effort est allé jusqu'au bout (un exercice passé ne compte pas).
  exercicesFaits: number;
}

export type ActionLecteur =
  | { type: 'avancer'; ms: number }
  | { type: 'passer' }
  | { type: 'pause' }
  | { type: 'reprendre' }
  | { type: 'terminer' };

export function creerEtatInitial(blocs: Bloc[]): EtatLecteur {
  if (blocs.length === 0) throw new Error('Une séance compte au moins un exercice');
  return {
    blocs,
    index: 0,
    etape: 'transition',
    restantMs: blocs[0].transitionS * 1000,
    enPause: false,
    termine: false,
    ecouleMs: 0,
    exercicesFaits: 0,
  };
}

function blocSuivant(etat: EtatLecteur): EtatLecteur {
  const index = etat.index + 1;
  if (index >= etat.blocs.length) return { ...etat, termine: true, restantMs: 0 };
  return { ...etat, index, etape: 'transition', restantMs: etat.blocs[index].transitionS * 1000 };
}

// Un seul pas peut franchir plusieurs étapes (téléphone en veille, onglet en arrière-plan…).
function avancer(etat: EtatLecteur, ms: number): EtatLecteur {
  let courant = etat;
  let reste = ms;
  while (reste > 0 && !courant.termine) {
    const consomme = Math.min(reste, courant.restantMs);
    reste -= consomme;
    courant = { ...courant, restantMs: courant.restantMs - consomme, ecouleMs: courant.ecouleMs + consomme };
    if (courant.restantMs > 0) break;
    courant =
      courant.etape === 'transition'
        ? { ...courant, etape: 'effort', restantMs: courant.blocs[courant.index].effortS * 1000 }
        : blocSuivant({ ...courant, exercicesFaits: courant.exercicesFaits + 1 });
  }
  return courant;
}

export function lecteur(etat: EtatLecteur, action: ActionLecteur): EtatLecteur {
  if (etat.termine) return etat;
  switch (action.type) {
    case 'avancer':
      return etat.enPause || action.ms <= 0 ? etat : avancer(etat, action.ms);
    case 'passer':
      return blocSuivant({ ...etat, enPause: false });
    case 'pause':
      return { ...etat, enPause: true };
    case 'reprendre':
      return { ...etat, enPause: false };
    case 'terminer':
      return { ...etat, termine: true };
  }
}
