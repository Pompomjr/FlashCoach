import { DUREES, RESSENTIS, type Duree, type Ressenti } from '../catalogue/types';
import type { Stockage } from '../preferences/stockage';

export type Apres = 'mieux' | 'pareil';

export interface EntreeJournal {
  id: string;
  // Date ISO du lancement.
  debut: string;
  contexteId: string;
  ressenti: Ressenti;
  duree: Duree;
  graine: number;
  exercices: string[];
  ecouleMs: number;
  exercicesFaits: number;
  // Vrai si la séance est allée au bout ; faux si elle a été écourtée (Terminer, Quitter, app fermée).
  terminee: boolean;
  apres: Apres | null;
}

export type ChangementEntree = Partial<Pick<EntreeJournal, 'ecouleMs' | 'exercicesFaits' | 'terminee' | 'apres'>>;

export const CLE_JOURNAL = 'flashcoach.journal.v1';
export const TAILLE_MAX_JOURNAL = 500;

export function creerIdentifiant(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function estEntree(valeur: unknown): valeur is EntreeJournal {
  if (typeof valeur !== 'object' || valeur === null) return false;
  const v = valeur as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.debut === 'string' &&
    typeof v.contexteId === 'string' &&
    RESSENTIS.includes(v.ressenti as Ressenti) &&
    DUREES.includes(v.duree as Duree) &&
    typeof v.graine === 'number' &&
    Array.isArray(v.exercices) &&
    v.exercices.every((id) => typeof id === 'string') &&
    typeof v.ecouleMs === 'number' &&
    v.ecouleMs >= 0 &&
    typeof v.exercicesFaits === 'number' &&
    v.exercicesFaits >= 0 &&
    typeof v.terminee === 'boolean' &&
    (v.apres === null || v.apres === 'mieux' || v.apres === 'pareil')
  );
}

// Le journal ne doit jamais bloquer une séance : lecture et écriture absorbent toutes les erreurs.
async function lireSansErreur(stockage: Stockage): Promise<EntreeJournal[]> {
  try {
    const texte = await stockage.lire(CLE_JOURNAL);
    const valeur: unknown = texte === null ? [] : JSON.parse(texte);
    return Array.isArray(valeur) ? valeur.filter(estEntree) : [];
  } catch {
    return [];
  }
}

async function ecrireSansErreur(stockage: Stockage, entrees: EntreeJournal[]): Promise<void> {
  try {
    await stockage.ecrire(CLE_JOURNAL, JSON.stringify(entrees));
  } catch {
    // Une séance non enregistrée vaut mieux qu'une séance bloquée.
  }
}

// Lire-modifier-écrire n'est pas atomique : on met les opérations d'un même stockage en file.
const files = new WeakMap<Stockage, Promise<unknown>>();

function enSerie<T>(stockage: Stockage, operation: () => Promise<T>): Promise<T> {
  const precedente = files.get(stockage) ?? Promise.resolve();
  const suivante = precedente.then(operation, operation);
  files.set(stockage, suivante.catch(() => undefined));
  return suivante;
}

export function lireJournal(stockage: Stockage): Promise<EntreeJournal[]> {
  return enSerie(stockage, () => lireSansErreur(stockage));
}

export function ajouterEntree(stockage: Stockage, entree: EntreeJournal): Promise<void> {
  return enSerie(stockage, async () => {
    const entrees = await lireSansErreur(stockage);
    const sansDoublon = entrees.filter((e) => e.id !== entree.id);
    await ecrireSansErreur(stockage, [entree, ...sansDoublon].slice(0, TAILLE_MAX_JOURNAL));
  });
}

export function mettreAJourEntree(stockage: Stockage, id: string, changement: ChangementEntree): Promise<void> {
  return enSerie(stockage, async () => {
    const entrees = await lireSansErreur(stockage);
    if (!entrees.some((e) => e.id === id)) return;
    await ecrireSansErreur(
      stockage,
      entrees.map((e) => (e.id === id ? { ...e, ...changement } : e)),
    );
  });
}

export function resumeJournal(entrees: EntreeJournal[]): { seances: number; repondues: number; mieux: number } {
  return {
    seances: entrees.length,
    repondues: entrees.filter((e) => e.apres !== null).length,
    mieux: entrees.filter((e) => e.apres === 'mieux').length,
  };
}
