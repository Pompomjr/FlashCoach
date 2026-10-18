import type { Stockage } from '../preferences/stockage';

// Remplace le stockage du téléphone dans les tests ; `contenu` permet de l'inspecter.
export function creerStockageMemoire(initial: Record<string, string> = {}): Stockage & { contenu: Record<string, string> } {
  const contenu: Record<string, string> = { ...initial };
  return {
    contenu,
    lire: async (cle) => (cle in contenu ? contenu[cle] : null),
    ecrire: async (cle, valeur) => {
      contenu[cle] = valeur;
    },
  };
}
