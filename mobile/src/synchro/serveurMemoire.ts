import type { EntreeJournal } from '../journal/journal';
import type { ServeurJournal } from './serveur';

// Faux serveur des tests : `enPanne` simule une coupure, `pendantEnvoi` une action concurrente.
export class ServeurMemoire implements ServeurJournal {
  lignes = new Map<string, EntreeJournal>();
  enPanne = false;
  envois: EntreeJournal[][] = [];
  pendantEnvoi?: () => Promise<void>;

  async envoyer(entrees: EntreeJournal[]): Promise<void> {
    if (this.pendantEnvoi) await this.pendantEnvoi();
    if (this.enPanne) throw new Error('serveur en panne');
    this.envois.push(entrees);
    for (const entree of entrees) this.lignes.set(entree.id, entree);
  }

  async recuperer(): Promise<EntreeJournal[]> {
    if (this.enPanne) throw new Error('serveur en panne');
    return [...this.lignes.values()];
  }
}
