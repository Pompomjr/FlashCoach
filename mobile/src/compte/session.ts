import type { Authentification, EtatCompte } from './auth';

// Un seul essai en vol par authentification : deux déclencheurs simultanés ne créent pas deux utilisateurs anonymes.
const enVol = new WeakMap<Authentification, Promise<EtatCompte | null>>();

// Silencieuse : jamais d'écran, jamais d'erreur ; sans réseau on réessaiera au prochain déclencheur.
export function assurerSession(auth: Authentification): Promise<EtatCompte | null> {
  const existant = enVol.get(auth);
  if (existant) return existant;
  const essai = (async () => {
    try {
      return (await auth.sessionCourante()) ?? (await auth.creerSessionAnonyme());
    } catch {
      return null;
    } finally {
      enVol.delete(auth);
    }
  })();
  enVol.set(auth, essai);
  return essai;
}
