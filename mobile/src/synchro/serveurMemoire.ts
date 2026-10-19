import type { EntreeJournal } from '../journal/journal';
import type { ServeurJournal } from './serveur';

// Faux serveur des tests : `enPanne` simule une coupure, `pendantEnvoi` une action concurrente.
// `utilisateur` donne l'utilisateur connecté : les lignes sont rangées par utilisateur, comme avec la sécurité par ligne.
export class ServeurMemoire implements ServeurJournal {
  parUtilisateur = new Map<string, Map<string, EntreeJournal>>();
  enPanne = false;
  envois: EntreeJournal[][] = [];
  pendantEnvoi?: () => Promise<void>;

  constructor(private readonly utilisateur: () => string = () => 'utilisateur') {}

  // Les lignes de l'utilisateur connecté.
  get lignes(): Map<string, EntreeJournal> {
    return this.lignesDe(this.utilisateur());
  }

  lignesDe(utilisateurId: string): Map<string, EntreeJournal> {
    let lignes = this.parUtilisateur.get(utilisateurId);
    if (!lignes) {
      lignes = new Map();
      this.parUtilisateur.set(utilisateurId, lignes);
    }
    return lignes;
  }

  async envoyer(entrees: EntreeJournal[]): Promise<void> {
    if (this.pendantEnvoi) await this.pendantEnvoi();
    if (this.enPanne) throw new Error('serveur en panne');
    this.envois.push(entrees);
    const lignes = this.lignes;
    for (const entree of entrees) lignes.set(entree.id, entree);
  }

  async recuperer(): Promise<EntreeJournal[]> {
    if (this.enPanne) throw new Error('serveur en panne');
    return [...this.lignes.values()];
  }
}
