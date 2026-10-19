import { ErreurCompte, type GenreErreur } from './auth';

export const DELAI_RENVOI_MS = 30000;

export const MESSAGES_ERREUR: Record<GenreErreur, string> = {
  'code-invalide': 'Ce code ne marche pas. Vérifie-le ou demande-en un autre.',
  reseau: "Pas de connexion pour l'instant. Réessaie dans un moment.",
  'trop-de-tentatives': "Trop d'essais d'un coup. Réessaie dans quelques minutes.",
  inconnue: "Ça n'a pas marché. Réessaie dans un moment.",
};

export const MESSAGE_EMAIL_INVALIDE = 'Vérifie ton adresse e-mail.';

export function emailValide(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function codeValide(code: string): boolean {
  return /^\d{6}$/.test(code);
}

export function messageErreur(erreur: unknown): string {
  return MESSAGES_ERREUR[erreur instanceof ErreurCompte ? erreur.genre : 'inconnue'];
}
