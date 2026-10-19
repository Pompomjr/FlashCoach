import type { Authentification } from '../compte/auth';
import { assurerSession } from '../compte/session';
import type { Stockage } from '../preferences/stockage';
import type { ServeurJournal } from './serveur';
import { restaurer, synchroniser } from './synchro';

// '1' tant qu'une restauration après connexion reste à faire (survit à la fermeture de l'app).
export const CLE_RESTAURATION = 'flashcoach.restauration.v1';

export interface Moteur {
  // Ne rejette jamais ; les demandes reçues pendant un tour en déclenchent un seul de plus.
  demanderSynchro(): Promise<void>;
  // Après connexion à un compte existant : vrai si ses séances sont de retour dans le journal.
  restaurerApresConnexion(): Promise<boolean>;
}

async function lireDrapeau(stockage: Stockage): Promise<boolean> {
  try {
    return (await stockage.lire(CLE_RESTAURATION)) === '1';
  } catch {
    return false;
  }
}

async function ecrireDrapeau(stockage: Stockage, actif: boolean): Promise<void> {
  try {
    await stockage.ecrire(CLE_RESTAURATION, actif ? '1' : '0');
  } catch {
    // Au pire, la restauration ne sera pas retentée : le compte reste lié.
  }
}

export function creerMoteur({ stockage, serveur, auth }: { stockage: Stockage; serveur: ServeurJournal; auth: Authentification }): Moteur {
  let enCours: Promise<void> | null = null;
  let relancer = false;

  async function tour(): Promise<void> {
    const session = await assurerSession(auth);
    if (session === null) return;
    if ((await lireDrapeau(stockage)) && (await restaurer(stockage, serveur))) await ecrireDrapeau(stockage, false);
    await synchroniser(stockage, serveur);
  }

  function demanderSynchro(): Promise<void> {
    if (enCours !== null) {
      relancer = true;
      return enCours;
    }
    enCours = (async () => {
      try {
        do {
          relancer = false;
          await tour();
        } while (relancer);
      } catch {
        // Jamais d'erreur vers les écrans.
      } finally {
        enCours = null;
      }
    })();
    return enCours;
  }

  async function restaurerApresConnexion(): Promise<boolean> {
    await ecrireDrapeau(stockage, true);
    await demanderSynchro();
    // Une synchro déjà en vol a pu se terminer avant d'avoir vu le drapeau : on en relance une.
    if (await lireDrapeau(stockage)) await demanderSynchro();
    return !(await lireDrapeau(stockage));
  }

  return { demanderSynchro, restaurerApresConnexion };
}
