import { NIVEAUX, type Contexte, type Exercice } from './types';

// Contrôle d'intégrité, utile dès que le catalogue grossit (jalon 7) ou vient de Supabase (jalon 4).
export function validerCatalogue(exercices: Exercice[], contextes: Contexte[]): string[] {
  const erreurs: string[] = [];

  const idsExercices = new Set<string>();
  for (const ex of exercices) {
    if (idsExercices.has(ex.id)) erreurs.push(`Exercice en double : ${ex.id}`);
    idsExercices.add(ex.id);
    if (ex.effets.length === 0) erreurs.push(`Exercice sans effet : ${ex.id}`);
    if (!ex.animation.endsWith('.json')) erreurs.push(`Animation invalide : ${ex.id}`);
    if (ex.consigne.trim() === '') erreurs.push(`Consigne vide : ${ex.id}`);
    if (!NIVEAUX.includes(ex.niveau)) erreurs.push(`Niveau invalide : ${ex.id}`);
  }

  const idsContextes = new Set<string>();
  for (const ctx of contextes) {
    if (idsContextes.has(ctx.id)) erreurs.push(`Contexte en double : ${ctx.id}`);
    idsContextes.add(ctx.id);
  }

  return erreurs;
}
