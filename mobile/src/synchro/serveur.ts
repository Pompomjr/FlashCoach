import type { EntreeJournal } from '../journal/journal';

// Le seul contact de la synchro avec le réseau ; une version en mémoire remplace Supabase dans les tests.
export interface ServeurJournal {
  // Upsert idempotent : renvoyer deux fois la même entrée ne crée pas de doublon.
  envoyer(entrees: EntreeJournal[]): Promise<void>;
  // Toutes les séances de l'utilisateur courant, déjà validées.
  recuperer(): Promise<EntreeJournal[]>;
}
