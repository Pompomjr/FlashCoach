import { ErreurCompte, type Authentification, type EtatCompte, type ModeCode } from './auth';

// Fausse authentification des tests : `comptes` liste les e-mails déjà liés à un compte.
export class AuthMemoire implements Authentification {
  etat: EtatCompte | null = null;
  comptes = new Map<string, string>();
  codeAttendu = '123456';
  enPanne = false;
  creations = 0;

  async sessionCourante(): Promise<EtatCompte | null> {
    if (this.enPanne) throw new ErreurCompte('reseau');
    return this.etat;
  }

  async creerSessionAnonyme(): Promise<EtatCompte> {
    if (this.enPanne) throw new ErreurCompte('reseau');
    this.creations += 1;
    this.etat = { utilisateurId: `anonyme-${this.creations}`, email: null, anonyme: true };
    return this.etat;
  }

  async demanderCode(email: string): Promise<ModeCode> {
    if (this.enPanne) throw new ErreurCompte('reseau');
    return this.comptes.has(email) ? 'connexion' : 'liaison';
  }

  async confirmerCode(email: string, code: string, mode: ModeCode): Promise<EtatCompte> {
    if (this.enPanne) throw new ErreurCompte('reseau');
    if (code !== this.codeAttendu) throw new ErreurCompte('code-invalide');
    const utilisateurId = mode === 'connexion' ? this.comptes.get(email)! : this.etat?.utilisateurId ?? 'nouveau';
    this.comptes.set(email, utilisateurId);
    this.etat = { utilisateurId, email, anonyme: false };
    return this.etat;
  }
}
