import { creerStockageMemoire } from '../test-utils/stockageMemoire';
import { CLE_SANS_MATERIEL, ecrireSansMateriel, lireSansMateriel } from './materiel';
import type { Stockage } from './stockage';

const enPanne: Stockage = {
  lire: async () => {
    throw new Error('panne');
  },
  ecrire: async () => {
    throw new Error('panne');
  },
};

describe('préférence « sans meuble »', () => {
  it('est désactivée par défaut', async () => {
    expect(await lireSansMateriel(creerStockageMemoire())).toBe(false);
  });

  it('s’enregistre sous la clé prévue, en JSON', async () => {
    const stockage = creerStockageMemoire();
    expect(CLE_SANS_MATERIEL).toBe('flashcoach.sansMateriel');
    await ecrireSansMateriel(stockage, true);
    expect(stockage.contenu[CLE_SANS_MATERIEL]).toBe('true');
    expect(await lireSansMateriel(stockage)).toBe(true);
    await ecrireSansMateriel(stockage, false);
    expect(stockage.contenu[CLE_SANS_MATERIEL]).toBe('false');
    expect(await lireSansMateriel(stockage)).toBe(false);
  });

  it.each(['1', '"true"', '0', 'oui', 'x{', 'null', '{}'])('retombe sur « faux » quand la valeur est %s', async (texte) => {
    expect(await lireSansMateriel(creerStockageMemoire({ [CLE_SANS_MATERIEL]: texte }))).toBe(false);
  });

  it('ne rejette jamais quand le stockage est en panne', async () => {
    expect(await lireSansMateriel(enPanne)).toBe(false);
    await expect(ecrireSansMateriel(enPanne, true)).resolves.toBeUndefined();
  });
});
