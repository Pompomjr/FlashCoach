import type { SupabaseClient } from '@supabase/supabase-js';

import { normaliserEntree, TAILLE_MAX_JOURNAL, type EntreeJournal } from '../journal/journal';
import type { ServeurJournal } from './serveur';

export interface LigneSeance {
  id: string;
  debut: string;
  // Anciennes séances (contexte et ressenti) seulement ; nuls pour une séance par objectif.
  contexte_id: string | null;
  ressenti: string | null;
  duree: number;
  graine: number;
  exercices: string[];
  ecoule_ms: number;
  exercices_faits: number;
  terminee: boolean;
  apres: string | null;
  niveau: number;
  effort: string | null;
  // Séance prête en circuit : identifiant du circuit ; nul pour une séance flash.
  circuit_id: string | null;
  // Objectif choisi au départ ; nul pour les anciennes séances.
  objectif: string | null;
}

const COLONNES = 'id,debut,contexte_id,ressenti,duree,graine,exercices,ecoule_ms,exercices_faits,terminee,apres,niveau,effort,circuit_id,objectif';

export function versLigne(e: EntreeJournal): LigneSeance {
  return {
    id: e.id,
    debut: e.debut,
    contexte_id: e.contexteId,
    ressenti: e.ressenti,
    duree: e.duree,
    graine: e.graine,
    exercices: e.exercices,
    ecoule_ms: Math.round(e.ecouleMs),
    exercices_faits: e.exercicesFaits,
    terminee: e.terminee,
    apres: e.apres,
    niveau: e.niveau,
    effort: e.effort,
    circuit_id: e.circuitId,
    objectif: e.objectif,
  };
}

// Une ligne abîmée ou d'un format futur est ignorée plutôt que de casser la restauration.
export function depuisLigne(ligne: unknown): EntreeJournal | null {
  if (typeof ligne !== 'object' || ligne === null) return null;
  const l = ligne as Partial<LigneSeance>;
  const debut = typeof l.debut === 'string' && !Number.isNaN(Date.parse(l.debut)) ? new Date(l.debut).toISOString() : null;
  const entree: unknown = {
    id: l.id,
    debut,
    contexteId: l.contexte_id,
    ressenti: l.ressenti,
    duree: l.duree,
    graine: l.graine,
    exercices: l.exercices,
    ecouleMs: l.ecoule_ms,
    exercicesFaits: l.exercices_faits,
    terminee: l.terminee,
    apres: l.apres,
    // Une ligne d'avant les niveaux (colonnes absentes ou nulles) reste lisible.
    niveau: l.niveau ?? undefined,
    effort: l.effort ?? undefined,
    // Une ligne d'avant les circuits (colonne absente ou nulle) est une séance flash.
    circuitId: l.circuit_id ?? undefined,
    // Une ligne d'avant les objectifs (colonne absente ou nulle) garde son contexte et son ressenti.
    objectif: l.objectif ?? undefined,
  };
  return normaliserEntree(entree);
}

export class ServeurSupabase implements ServeurJournal {
  constructor(private readonly client: SupabaseClient) {}

  async envoyer(entrees: EntreeJournal[]): Promise<void> {
    const misAJour = new Date().toISOString();
    const { error } = await this.client
      .from('seances')
      .upsert(entrees.map((e) => ({ ...versLigne(e), mis_a_jour: misAJour })), { onConflict: 'user_id,id' });
    if (error) throw error;
  }

  async recuperer(): Promise<EntreeJournal[]> {
    const { data, error } = await this.client
      .from('seances')
      .select(COLONNES)
      .order('debut', { ascending: false })
      .limit(TAILLE_MAX_JOURNAL);
    if (error) throw error;
    return (data ?? []).map(depuisLigne).filter((e): e is EntreeJournal => e !== null);
  }
}
