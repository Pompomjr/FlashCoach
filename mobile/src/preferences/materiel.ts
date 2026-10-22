import type { Stockage } from './stockage';

export const CLE_SANS_MATERIEL = 'flashcoach.sansMateriel';

// « Je n'ai pas de meuble stable » : retenu d'un circuit à l'autre. Lecture et écriture n'échouent jamais.
export async function lireSansMateriel(stockage: Stockage): Promise<boolean> {
  try {
    const texte = await stockage.lire(CLE_SANS_MATERIEL);
    return texte !== null && JSON.parse(texte) === true;
  } catch {
    return false;
  }
}

export async function ecrireSansMateriel(stockage: Stockage, valeur: boolean): Promise<void> {
  try {
    await stockage.ecrire(CLE_SANS_MATERIEL, JSON.stringify(valeur));
  } catch {
    // Préférence non enregistrée : le prochain circuit repartira de la valeur lue.
  }
}
