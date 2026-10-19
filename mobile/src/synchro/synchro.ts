import { fusionnerDansJournal, lireJournalSiLisible, type EntreeJournal } from '../journal/journal';
import type { Stockage } from '../preferences/stockage';
import { lireFileEnvoi, marquerAEnvoyer, retirerSiInchangees } from './fileEnvoi';
import type { ServeurJournal } from './serveur';

export const TAILLE_PAQUET = 100;

export type ResultatSynchro = 'rien' | 'envoye' | 'echec';

// Ne rejette jamais : un échec laisse la file intacte, le prochain déclencheur réessaiera.
export async function synchroniser(stockage: Stockage, serveur: ServeurJournal): Promise<ResultatSynchro> {
  try {
    const file = await lireFileEnvoi(stockage);
    if (Object.keys(file).length === 0) return 'rien';
    const journal = await lireJournalSiLisible(stockage);
    // Journal illisible : on ne sait pas ce qui existe, on ne retire rien.
    if (journal === null) return 'echec';
    const parId = new Map(journal.map((e) => [e.id, e]));
    const aEnvoyer = Object.keys(file)
      .map((id) => parId.get(id))
      .filter((e): e is EntreeJournal => e !== undefined);
    for (let debut = 0; debut < aEnvoyer.length; debut += TAILLE_PAQUET) {
      await serveur.envoyer(aEnvoyer.slice(debut, debut + TAILLE_PAQUET));
    }
    // Les séances sorties du journal (limite de 500) sont retirées sans envoi.
    await retirerSiInchangees(stockage, file);
    return aEnvoyer.length > 0 ? 'envoye' : 'rien';
  } catch {
    return 'echec';
  }
}

// Après connexion à un compte existant : on fusionne ses séances puis tout le journal repart vers ce compte.
export async function restaurer(stockage: Stockage, serveur: ServeurJournal): Promise<boolean> {
  try {
    const distantes = await serveur.recuperer();
    const ids = await fusionnerDansJournal(stockage, distantes);
    if (ids === null) return false;
    await marquerAEnvoyer(stockage, ids);
    return true;
  } catch {
    return false;
  }
}
