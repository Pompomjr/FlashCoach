import { creerStockageMemoire } from '../test-utils/stockageMemoire';
import {
  CHOIX_PAR_DEFAUT,
  ecrireChoix,
  ecrireDerniersExercices,
  lireChoix,
  lireDerniersExercices,
} from './preferences';
import type { Stockage } from './stockage';

const enPanne: Stockage = {
  lire: async () => {
    throw new Error('panne');
  },
  ecrire: async () => undefined,
};

const ecritureEnPanne: Stockage = {
  lire: async () => null,
  ecrire: async () => {
    throw new Error('panne');
  },
};

describe('choix', () => {
  it('propose À la maison, Mou et 5 min au premier lancement', async () => {
    expect(await lireChoix(creerStockageMemoire())).toEqual({ contexteId: 'maison', ressenti: 'mou', duree: 5 });
  });

  it('retrouve les derniers choix', async () => {
    const stockage = creerStockageMemoire();
    await ecrireChoix(stockage, { contexteId: 'reveil', ressenti: 'raide', duree: 15 });
    expect(await lireChoix(stockage)).toEqual({ contexteId: 'reveil', ressenti: 'raide', duree: 15 });
  });

  it('revient aux choix par défaut si les données sont abîmées', async () => {
    const abime = (texte: string) => lireChoix(creerStockageMemoire({ 'flashcoach.choix': texte }));
    expect(await abime('{pas du json')).toEqual(CHOIX_PAR_DEFAUT);
    expect(await abime(JSON.stringify({ contexteId: 'maison', ressenti: 'fatigue', duree: 5 }))).toEqual(CHOIX_PAR_DEFAUT);
    expect(await abime(JSON.stringify({ contexteId: 'maison', ressenti: 'mou', duree: 7 }))).toEqual(CHOIX_PAR_DEFAUT);
    // 3 min n'est plus proposée : un ancien choix de 3 min revient aux choix par défaut.
    expect(await abime(JSON.stringify({ contexteId: 'maison', ressenti: 'mou', duree: 3 }))).toEqual(CHOIX_PAR_DEFAUT);
    expect(await abime(JSON.stringify(null))).toEqual(CHOIX_PAR_DEFAUT);
  });

  it('ignore un contexte Premium enregistré', async () => {
    const stockage = creerStockageMemoire({
      'flashcoach.choix': JSON.stringify({ contexteId: 'bureau', ressenti: 'mou', duree: 5 }),
    });
    expect(await lireChoix(stockage)).toEqual(CHOIX_PAR_DEFAUT);
  });

  it('revient aux choix par défaut si le stockage est en panne', async () => {
    expect(await lireChoix(enPanne)).toEqual(CHOIX_PAR_DEFAUT);
  });

  it('ne rejette pas si l’écriture échoue', async () => {
    await expect(ecrireChoix(ecritureEnPanne, CHOIX_PAR_DEFAUT)).resolves.toBeUndefined();
  });
});

describe('derniers exercices', () => {
  it('sont vides au premier lancement', async () => {
    expect(await lireDerniersExercices(creerStockageMemoire())).toEqual([]);
  });

  it('sont retrouvés', async () => {
    const stockage = creerStockageMemoire();
    await ecrireDerniersExercices(stockage, ['squat-lent', 'planche']);
    expect(await lireDerniersExercices(stockage)).toEqual(['squat-lent', 'planche']);
  });

  it('sont ignorés si les données sont abîmées ou le stockage en panne', async () => {
    expect(await lireDerniersExercices(creerStockageMemoire({ 'flashcoach.derniers-exercices': '[1,2]' }))).toEqual([]);
    expect(await lireDerniersExercices(enPanne)).toEqual([]);
  });

  it('ne rejettent pas si l’écriture échoue', async () => {
    await expect(ecrireDerniersExercices(ecritureEnPanne, ['planche'])).resolves.toBeUndefined();
  });
});
