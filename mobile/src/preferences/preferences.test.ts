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
  it('propose Brûler des calories et 10 min au premier lancement', async () => {
    expect(await lireChoix(creerStockageMemoire())).toEqual({ objectif: 'calories', duree: 10 });
    expect(CHOIX_PAR_DEFAUT).toEqual({ objectif: 'calories', duree: 10 });
  });

  it('retrouve les derniers choix, sous la clé versionnée', async () => {
    const stockage = creerStockageMemoire();
    await ecrireChoix(stockage, { objectif: 'masse', duree: 15 });
    expect(await lireChoix(stockage)).toEqual({ objectif: 'masse', duree: 15 });
    expect(JSON.parse(stockage.contenu['flashcoach.choix.v2'])).toEqual({ objectif: 'masse', duree: 15 });
  });

  it('ignore l’ancienne clé des choix (contexte et ressenti)', async () => {
    const stockage = creerStockageMemoire({
      'flashcoach.choix': JSON.stringify({ contexteId: 'reveil', ressenti: 'raide', duree: 15 }),
    });
    expect(await lireChoix(stockage)).toEqual(CHOIX_PAR_DEFAUT);
  });

  it('revient aux choix par défaut si les données sont abîmées', async () => {
    const abime = (texte: string) => lireChoix(creerStockageMemoire({ 'flashcoach.choix.v2': texte }));
    expect(await abime('{pas du json')).toEqual(CHOIX_PAR_DEFAUT);
    expect(await abime(JSON.stringify({ objectif: 'lune', duree: 5 }))).toEqual(CHOIX_PAR_DEFAUT);
    expect(await abime(JSON.stringify({ objectif: 'etirements', duree: 7 }))).toEqual(CHOIX_PAR_DEFAUT);
    // 3 min n'est plus proposée.
    expect(await abime(JSON.stringify({ objectif: 'etirements', duree: 3 }))).toEqual(CHOIX_PAR_DEFAUT);
    expect(await abime(JSON.stringify(null))).toEqual(CHOIX_PAR_DEFAUT);
  });

  it('ne garde que l’objectif et la durée', async () => {
    const stockage = creerStockageMemoire({
      'flashcoach.choix.v2': JSON.stringify({ objectif: 'etirements', duree: 30, contexteId: 'reveil' }),
    });
    expect(await lireChoix(stockage)).toEqual({ objectif: 'etirements', duree: 30 });
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
