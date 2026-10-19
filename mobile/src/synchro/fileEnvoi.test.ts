import { CLE_FILE_ENVOI, lireFileEnvoi, marquerAEnvoyer, retirerSiInchangees } from './fileEnvoi';
import { creerStockageMemoire } from '../test-utils/stockageMemoire';

describe('file d’envoi', () => {
  it('est vide au départ', async () => {
    expect(await lireFileEnvoi(creerStockageMemoire())).toEqual({});
  });

  it('numérote chaque modification d’une entrée', async () => {
    const stockage = creerStockageMemoire();
    await marquerAEnvoyer(stockage, ['a']);
    await marquerAEnvoyer(stockage, ['a', 'b']);
    expect(await lireFileEnvoi(stockage)).toEqual({ a: 2, b: 1 });
  });

  it('ne retire que les entrées restées identiques pendant l’envoi', async () => {
    const stockage = creerStockageMemoire();
    await marquerAEnvoyer(stockage, ['a', 'b']);
    const envoyees = await lireFileEnvoi(stockage);
    await marquerAEnvoyer(stockage, ['b']);
    await retirerSiInchangees(stockage, envoyees);
    expect(await lireFileEnvoi(stockage)).toEqual({ b: 2 });
  });

  it('écarte une file abîmée', async () => {
    const stockage = creerStockageMemoire({ [CLE_FILE_ENVOI]: '{pas du json' });
    expect(await lireFileEnvoi(stockage)).toEqual({});
    const autre = creerStockageMemoire({ [CLE_FILE_ENVOI]: JSON.stringify({ a: 'x', b: 2 }) });
    expect(await lireFileEnvoi(autre)).toEqual({ b: 2 });
  });

  it('n’écrit rien quand la lecture échoue, pour ne jamais perdre la file', async () => {
    const ecrire = jest.fn(async () => undefined);
    const stockage = { lire: jest.fn(async () => { throw new Error('panne'); }), ecrire };
    await marquerAEnvoyer(stockage, ['a']);
    await retirerSiInchangees(stockage, { a: 1 });
    expect(ecrire).not.toHaveBeenCalled();
  });

  it('ne rejette jamais quand l’écriture échoue', async () => {
    const stockage = { lire: async () => null, ecrire: async () => { throw new Error('panne'); } };
    await expect(marquerAEnvoyer(stockage, ['a'])).resolves.toBeUndefined();
  });
});
