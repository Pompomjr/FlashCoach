import { TAILLE_MAX_JOURNAL, type EntreeJournal } from './journal';

// Restauration : union par identifiant, le téléphone l'emporte (il peut avoir une réponse plus récente).
export function fusionner(locales: EntreeJournal[], distantes: EntreeJournal[]): EntreeJournal[] {
  const parId = new Map<string, EntreeJournal>();
  for (const entree of distantes) parId.set(entree.id, entree);
  for (const entree of locales) parId.set(entree.id, entree);
  return [...parId.values()]
    .sort((a, b) => Date.parse(b.debut) - Date.parse(a.debut))
    .slice(0, TAILLE_MAX_JOURNAL);
}
