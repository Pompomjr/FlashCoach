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
    Number.isFinite(v.graine) &&
    Array.isArray(v.exercices) &&
    v.exercices.every((id) => typeof id === 'string') &&
    Number.isFinite(v.ecouleMs) &&
    (v.ecouleMs as number) >= 0 &&
    Number.isInteger(v.exercicesFaits) &&
    (v.exercicesFaits as number) >= 0 &&
    typeof v.terminee === 'boolean' &&
    (v.apres === null || v.apres === 'mieux' || v.apres === 'pareil')
  );
}

// Distingue « lecture en échec » (on ne sait pas ce qu'il y a dans le stockage) de « journal vide ou abîmé ».
type Lecture = { lue: true; entrees: EntreeJournal[] } | { lue: false };

// Le journal ne doit jamais bloquer une séance : lecture et écriture absorbent toutes les erreurs.
async function lireBrut(stockage: Stockage): Promise<Lecture> {
  let texte: string | null;
  try {
    texte = await stockage.lire(CLE_JOURNAL);
  } catch {
    return { lue: false };
  }
  try {
    const valeur: unknown = texte === null ? [] : JSON.parse(texte);
    return { lue: true, entrees: Array.isArray(valeur) ? valeur.filter(estEntree) : [] };
  } catch {
    // JSON abîmé : traité comme un journal vide.
    return { lue: true, entrees: [] };
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
  return enSerie(stockage, async () => {
    const lecture = await lireBrut(stockage);
    return lecture.lue ? lecture.entrees : [];
  });
}

export function ajouterEntree(stockage: Stockage, entree: EntreeJournal): Promise<void> {
  return enSerie(stockage, async () => {
    const lecture = await lireBrut(stockage);
    // Lecture en échec : on n'écrit pas, pour ne pas effacer l'historique existant.
    if (!lecture.lue) return;
    const sansDoublon = lecture.entrees.filter((e) => e.id !== entree.id);
    await ecrireSansErreur(stockage, [entree, ...sansDoublon].slice(0, TAILLE_MAX_JOURNAL));
  });
}

export function mettreAJourEntree(stockage: Stockage, id: string, changement: ChangementEntree): Promise<void> {
  return enSerie(stockage, async () => {
    const lecture = await lireBrut(stockage);
    if (!lecture.lue) return;
    const cible = lecture.entrees.find((e) => e.id === id);
    if (!cible) return;
    const modifiee: unknown = { ...cible, ...changement };
    // Une entrée devenue invalide ne doit pas être écrite : elle disparaîtrait à la prochaine lecture.
    if (!estEntree(modifiee)) return;
    await ecrireSansErreur(
      stockage,
      lecture.entrees.map((e) => (e.id === id ? modifiee : e)),
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
