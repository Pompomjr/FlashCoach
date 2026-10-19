import { creerStockageMemoire } from '../test-utils/stockageMemoire';
import { CLE_NIVEAU, ajusterNiveau, ecrireNiveau, lireNiveau } from './niveau';
import type { Stockage } from './stockage';

const enPanne: Stockage = {
  lire: async () => {
    throw new Error('panne');
  },
  ecrire: async () => {
    throw new Error('panne');
  },
};

describe('niveau', () => {
  it('démarre au niveau 1 « Doux »', async () => {
    expect(await lireNiveau(creerStockageMemoire())).toBe(1);
  });

  it('retrouve le niveau enregistré', async () => {
    const stockage = creerStockageMemoire();
    await ecrireNiveau(stockage, 3);
    expect(stockage.contenu[CLE_NIVEAU]).toBe('3');
    expect(await lireNiveau(stockage)).toBe(3);
  });

  it.each(['4', '"x"', '0', 'x{', 'null'])('retombe sur 1 quand la valeur est %s', async (texte) => {
    expect(await lireNiveau(creerStockageMemoire({ [CLE_NIVEAU]: texte }))).toBe(1);
  });

  it('ne rejette jamais quand le stockage est en panne', async () => {
    expect(await lireNiveau(enPanne)).toBe(1);
    await expect(ecrireNiveau(enPanne, 2)).resolves.toBeUndefined();
    await expect(ajusterNiveau(enPanne, 'facile')).resolves.toEqual({ avant: 1, apres: 2 });
  });
});

describe('ajusterNiveau', () => {
  it('monte d’un cran sur « Trop facile »', async () => {
    const stockage = creerStockageMemoire();
    expect(await ajusterNiveau(stockage, 'facile')).toEqual({ avant: 1, apres: 2 });
    expect(await lireNiveau(stockage)).toBe(2);
  });

  it('descend d’un cran sur « Trop dur »', async () => {
    const stockage = creerStockageMemoire({ [CLE_NIVEAU]: '3' });
    expect(await ajusterNiveau(stockage, 'dur')).toEqual({ avant: 3, apres: 2 });
    expect(await lireNiveau(stockage)).toBe(2);
  });

  it('reste borné à 3 et à 1', async () => {
    const haut = creerStockageMemoire({ [CLE_NIVEAU]: '3' });
    expect(await ajusterNiveau(haut, 'facile')).toEqual({ avant: 3, apres: 3 });
    const bas = creerStockageMemoire();
    expect(await ajusterNiveau(bas, 'dur')).toEqual({ avant: 1, apres: 1 });
  });

  it('ne change rien et n’écrit pas sur « Juste bien »', async () => {
    const stockage = creerStockageMemoire({ [CLE_NIVEAU]: '2' });
    const ecrire = jest.spyOn(stockage, 'ecrire');
    expect(await ajusterNiveau(stockage, 'juste')).toEqual({ avant: 2, apres: 2 });
    expect(ecrire).not.toHaveBeenCalled();
  });
});
