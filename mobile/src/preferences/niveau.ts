import { NIVEAUX, type Niveau } from '../catalogue/types';
import type { Effort } from '../journal/journal';
import type { Stockage } from './stockage';

export const CLE_NIVEAU = 'flashcoach.niveau';

export async function lireNiveau(stockage: Stockage): Promise<Niveau> {
  try {
    const texte = await stockage.lire(CLE_NIVEAU);
    const valeur: unknown = texte === null ? 1 : JSON.parse(texte);
    return NIVEAUX.includes(valeur as Niveau) ? (valeur as Niveau) : 1;
  } catch {
    return 1;
  }
}

export async function ecrireNiveau(stockage: Stockage, niveau: Niveau): Promise<void> {
  try {
    await stockage.ecrire(CLE_NIVEAU, JSON.stringify(niveau));
  } catch {
    // Niveau non enregistré : la prochaine séance repartira du niveau lu.
  }
}

// « Trop facile » monte d'un cran, « Trop dur » descend d'un cran, bornés à 1-3.
export async function ajusterNiveau(stockage: Stockage, effort: Effort): Promise<{ avant: Niveau; apres: Niveau }> {
  const avant = await lireNiveau(stockage);
  const pas = effort === 'facile' ? 1 : effort === 'dur' ? -1 : 0;
  const apres = Math.min(3, Math.max(1, avant + pas)) as Niveau;
  if (apres !== avant) await ecrireNiveau(stockage, apres);
  return { avant, apres };
}
