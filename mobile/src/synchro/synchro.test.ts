import { CLE_JOURNAL, ajouterEntree, lireJournal, mettreAJourEntree } from '../journal/journal';
import { creerStockageMemoire } from '../test-utils/stockageMemoire';
import { fabriquerEntree } from '../test-utils/journal';
import { lireFileEnvoi, marquerAEnvoyer } from './fileEnvoi';
import { ServeurMemoire } from './serveurMemoire';
import { TAILLE_PAQUET, restaurer, synchroniser } from './synchro';

describe('synchroniser', () => {
  it('ne fait rien quand la file est vide', async () => {
    const serveur = new ServeurMemoire();
    expect(await synchroniser(creerStockageMemoire(), serveur)).toBe('rien');
    expect(serveur.envois).toEqual([]);
  });

  it('envoie les séances marquées puis vide la file', async () => {
    const stockage = creerStockageMemoire();
    const serveur = new ServeurMemoire();
    await ajouterEntree(stockage, fabriquerEntree({ id: 'a' }));
    expect(await synchroniser(stockage, serveur)).toBe('envoye');
    expect(serveur.lignes.get('a')).toEqual(fabriquerEntree({ id: 'a' }));
    expect(await lireFileEnvoi(stockage)).toEqual({});
  });

  it('garde la file quand le serveur est en panne', async () => {
    const stockage = creerStockageMemoire();
    const serveur = new ServeurMemoire();
    serveur.enPanne = true;
    await ajouterEntree(stockage, fabriquerEntree({ id: 'a' }));
    expect(await synchroniser(stockage, serveur)).toBe('echec');
    expect(await lireFileEnvoi(stockage)).toEqual({ a: 1 });
  });

  it('renvoie au tour suivant une séance modifiée pendant l’envoi', async () => {
    const stockage = creerStockageMemoire();
    const serveur = new ServeurMemoire();
    await ajouterEntree(stockage, fabriquerEntree({ id: 'a' }));
    serveur.pendantEnvoi = async () => {
      serveur.pendantEnvoi = undefined;
      await mettreAJourEntree(stockage, 'a', { apres: 'mieux' });
    };
    await synchroniser(stockage, serveur);
    expect(await lireFileEnvoi(stockage)).toEqual({ a: 2 });
    await synchroniser(stockage, serveur);
    expect(serveur.lignes.get('a')?.apres).toBe('mieux');
    expect(await lireFileEnvoi(stockage)).toEqual({});
  });

  it('oublie les séances sorties du journal', async () => {
    const stockage = creerStockageMemoire();
    const serveur = new ServeurMemoire();
    await marquerAEnvoyer(stockage, ['disparue']);
    expect(await synchroniser(stockage, serveur)).toBe('rien');
    expect(serveur.envois).toEqual([]);
    expect(await lireFileEnvoi(stockage)).toEqual({});
  });

  it(`envoie par paquets de ${TAILLE_PAQUET} au plus`, async () => {
    const stockage = creerStockageMemoire();
    const serveur = new ServeurMemoire();
    for (let i = 0; i < TAILLE_PAQUET + 1; i += 1) await ajouterEntree(stockage, fabriquerEntree({ id: `e${i}` }));
    await synchroniser(stockage, serveur);
    expect(serveur.envois.map((paquet) => paquet.length)).toEqual([TAILLE_PAQUET, 1]);
  });

  it('n’efface pas la file quand le journal est illisible', async () => {
    const memoire = creerStockageMemoire();
    await marquerAEnvoyer(memoire, ['a']);
    const stockage = {
      lire: async (cle: string) => {
        if (cle === CLE_JOURNAL) throw new Error('panne');
        return memoire.lire(cle);
      },
      ecrire: memoire.ecrire,
    };
    expect(await synchroniser(stockage, new ServeurMemoire())).toBe('echec');
    expect(await lireFileEnvoi(memoire)).toEqual({ a: 1 });
  });
});

describe('restaurer', () => {
  it('ramène les séances du compte et les marque pour le compte retrouvé', async () => {
    const stockage = creerStockageMemoire();
    const serveur = new ServeurMemoire();
    serveur.lignes.set('ancienne', fabriquerEntree({ id: 'ancienne', debut: new Date(2026, 9, 1).toISOString() }));
    await ajouterEntree(stockage, fabriquerEntree({ id: 'recente', debut: new Date(2026, 9, 18).toISOString() }));
    expect(await restaurer(stockage, serveur)).toBe(true);
    expect((await lireJournal(stockage)).map((e) => e.id)).toEqual(['recente', 'ancienne']);
    expect(Object.keys(await lireFileEnvoi(stockage)).sort()).toEqual(['ancienne', 'recente']);
  });

  it('échoue sans rien toucher quand le serveur est en panne', async () => {
    const stockage = creerStockageMemoire();
    const serveur = new ServeurMemoire();
    serveur.enPanne = true;
    await ajouterEntree(stockage, fabriquerEntree({ id: 'a' }));
    expect(await restaurer(stockage, serveur)).toBe(false);
    expect((await lireJournal(stockage)).map((e) => e.id)).toEqual(['a']);
  });
});
