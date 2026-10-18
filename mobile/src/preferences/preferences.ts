import { contexteDisponible } from '../abonnement/acces';
import { DUREES, RESSENTIS, type Duree, type Ressenti } from '../catalogue/types';
import type { Stockage } from './stockage';

export interface Choix {
  contexteId: string;
  ressenti: Ressenti;
  duree: Duree;
}

// Zéro configuration : ce qui est présélectionné au tout premier lancement.
export const CHOIX_PAR_DEFAUT: Choix = { contexteId: 'maison', ressenti: 'mou', duree: 5 };

const CLE_CHOIX = 'flashcoach.choix';
const CLE_DERNIERS_EXERCICES = 'flashcoach.derniers-exercices';

// Une préférence illisible ou un stockage en panne ne doit jamais empêcher de lancer une séance :
// la lecture comme l'écriture absorbent les erreurs, elles ne rejettent jamais.
async function lireSansErreur(stockage: Stockage, cle: string): Promise<unknown> {
  try {
    const texte = await stockage.lire(cle);
    return texte === null ? null : JSON.parse(texte);
  } catch {
    return null;
  }
}

async function ecrireSansErreur(stockage: Stockage, cle: string, valeur: string): Promise<void> {
  try {
    await stockage.ecrire(cle, valeur);
  } catch {
    // Préférence non enregistrée : la séance se lance quand même avec les choix en cours.
  }
}

function estChoix(valeur: unknown): valeur is Choix {
  if (typeof valeur !== 'object' || valeur === null) return false;
  const v = valeur as Record<string, unknown>;
  return (
    typeof v.contexteId === 'string' &&
    contexteDisponible(v.contexteId) &&
    RESSENTIS.includes(v.ressenti as Ressenti) &&
    DUREES.includes(v.duree as Duree)
  );
}

export async function lireChoix(stockage: Stockage): Promise<Choix> {
  const valeur = await lireSansErreur(stockage, CLE_CHOIX);
  return estChoix(valeur) ? { contexteId: valeur.contexteId, ressenti: valeur.ressenti, duree: valeur.duree } : CHOIX_PAR_DEFAUT;
}

export async function ecrireChoix(stockage: Stockage, choix: Choix): Promise<void> {
  await ecrireSansErreur(stockage, CLE_CHOIX, JSON.stringify(choix));
}

export async function lireDerniersExercices(stockage: Stockage): Promise<string[]> {
  const valeur = await lireSansErreur(stockage, CLE_DERNIERS_EXERCICES);
  return Array.isArray(valeur) && valeur.every((id) => typeof id === 'string') ? valeur : [];
}

export async function ecrireDerniersExercices(stockage: Stockage, ids: string[]): Promise<void> {
  await ecrireSansErreur(stockage, CLE_DERNIERS_EXERCICES, JSON.stringify(ids));
}
