import type { Authentification, EtatCompte } from './auth';

// Silencieuse : jamais d'écran, jamais d'erreur ; sans réseau on réessaiera au prochain déclencheur.
export async function assurerSession(auth: Authentification): Promise<EtatCompte | null> {
  try {
    return (await auth.sessionCourante()) ?? (await auth.creerSessionAnonyme());
  } catch {
    return null;
  }
}
