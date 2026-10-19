export interface EtatCompte {
  utilisateurId: string;
  email: string | null;
  anonyme: boolean;
}

// liaison : l'e-mail est rattaché à la session anonyme ; connexion : l'e-mail avait déjà un compte.
export type ModeCode = 'liaison' | 'connexion';

export type GenreErreur = 'code-invalide' | 'reseau' | 'trop-de-tentatives' | 'inconnue';

export class ErreurCompte extends Error {
  constructor(readonly genre: GenreErreur) {
    super(genre);
    this.name = 'ErreurCompte';
  }
}

// Isole Supabase : les écrans et la synchro ne voient que cette interface.
export interface Authentification {
  sessionCourante(): Promise<EtatCompte | null>;
  creerSessionAnonyme(): Promise<EtatCompte>;
  // Envoie un code à 6 chiffres ; bascule seule vers la connexion si l'e-mail a déjà un compte.
  demanderCode(email: string): Promise<ModeCode>;
  confirmerCode(email: string, code: string, mode: ModeCode): Promise<EtatCompte>;
}
