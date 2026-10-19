import { AuthMemoire } from '../compte/authMemoire';
import { ajouterEntree, lireJournal } from '../journal/journal';
import { creerStockageMemoire } from '../test-utils/stockageMemoire';
import { fabriquerEntree } from '../test-utils/journal';
import { CLE_RESTAURATION, creerMoteur } from './moteur';
import { ServeurMemoire } from './serveurMemoire';

function preparer() {
  const stockage = creerStockageMemoire();
  const serveur = new ServeurMemoire();
  const auth = new AuthMemoire();
  return { stockage, serveur, auth, moteur: creerMoteur({ stockage, serveur, auth }) };
}

describe('moteur de synchro', () => {
  it('crée la session puis envoie le journal', async () => {
    const { stockage, serveur, auth, moteur } = preparer();
    await ajouterEntree(stockage, fabriquerEntree({ id: 'a' }));
    await moteur.demanderSynchro();
    expect(auth.etat?.anonyme).toBe(true);
    expect(serveur.lignes.has('a')).toBe(true);
  });

  it('n’envoie rien sans session (pas de réseau)', async () => {
    const { stockage, serveur, auth, moteur } = preparer();
    auth.enPanne = true;
    await ajouterEntree(stockage, fabriquerEntree({ id: 'a' }));
    await moteur.demanderSynchro();
    expect(serveur.envois).toEqual([]);
  });

  it('ne lance jamais deux synchros à la fois et rejoue une seule fois les demandes arrivées pendant', async () => {
    const { stockage, serveur, moteur } = preparer();
    await ajouterEntree(stockage, fabriquerEntree({ id: 'a' }));
    let enVol = 0;
    let maximum = 0;
    serveur.pendantEnvoi = async () => {
      enVol += 1;
      maximum = Math.max(maximum, enVol);
      await ajouterEntree(stockage, fabriquerEntree({ id: `b${serveur.envois.length}` }));
      enVol -= 1;
    };
    const premiere = moteur.demanderSynchro();
    const autres = [moteur.demanderSynchro(), moteur.demanderSynchro()];
    await Promise.all([premiere, ...autres]);
    expect(maximum).toBe(1);
    expect(serveur.envois.length).toBe(2);
  });

  it('ne rejette jamais', async () => {
    const { serveur, moteur } = preparer();
    serveur.enPanne = true;
    await expect(moteur.demanderSynchro()).resolves.toBeUndefined();
  });

  it('restaure après connexion et efface le drapeau', async () => {
    const { stockage, serveur, auth, moteur } = preparer();
    auth.etat = { utilisateurId: 'u1', email: 'a@b.fr', anonyme: false };
    serveur.lignes.set('ancienne', fabriquerEntree({ id: 'ancienne' }));
    expect(await moteur.restaurerApresConnexion()).toBe(true);
    expect((await lireJournal(stockage)).map((e) => e.id)).toEqual(['ancienne']);
    expect(stockage.contenu[CLE_RESTAURATION]).toBe('0');
  });

  it('garde le drapeau et réessaie au démarrage suivant quand la restauration échoue', async () => {
    const { stockage, serveur, auth, moteur } = preparer();
    auth.etat = { utilisateurId: 'u1', email: 'a@b.fr', anonyme: false };
    serveur.enPanne = true;
    expect(await moteur.restaurerApresConnexion()).toBe(false);
    expect(stockage.contenu[CLE_RESTAURATION]).toBe('1');
    serveur.enPanne = false;
    serveur.lignes.set('ancienne', fabriquerEntree({ id: 'ancienne' }));
    await creerMoteur({ stockage, serveur, auth }).demanderSynchro();
    expect((await lireJournal(stockage)).map((e) => e.id)).toEqual(['ancienne']);
  });

  it('programmerRestauration pose le drapeau avant toute connexion', async () => {
    const { stockage, moteur } = preparer();
    await moteur.programmerRestauration();
    expect(stockage.contenu[CLE_RESTAURATION]).toBe('1');
  });

  it('passe d’un compte anonyme à un compte existant sans rien perdre', async () => {
    const stockage = creerStockageMemoire();
    const auth = new AuthMemoire();
    const serveur = new ServeurMemoire(() => auth.etat!.utilisateurId);
    const moteur = creerMoteur({ stockage, serveur, auth });
    auth.comptes.set('a@b.fr', 'compte-1');
    serveur.lignesDe('compte-1').set('ancienne', fabriquerEntree({ id: 'ancienne', debut: new Date(2026, 9, 1).toISOString() }));

    await ajouterEntree(stockage, fabriquerEntree({ id: 'a' }));
    await moteur.demanderSynchro();
    expect([...serveur.lignesDe('anonyme-1').keys()]).toEqual(['a']);

    await moteur.programmerRestauration();
    await auth.confirmerCode('a@b.fr', '123456', 'connexion');
    expect(await moteur.restaurerApresConnexion()).toBe(true);

    expect((await lireJournal(stockage)).map((e) => e.id).sort()).toEqual(['a', 'ancienne']);
    expect([...serveur.lignesDe('compte-1').keys()].sort()).toEqual(['a', 'ancienne']);
  });
});
