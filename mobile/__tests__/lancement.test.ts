import { circuitParId } from '../src/circuits/circuits';
import { fabriquerEntree } from '../src/test-utils/journal';
import { creerStockageMemoire } from '../src/test-utils/stockageMemoire';
import {
  choisirLancement,
  derniereFamilleMasse,
  intensiteDuLien,
  lireDonneesLancement,
  parametresLancement,
  type DonneesLancement,
} from '../src/seance/lancement';

const donnees = (surcharge: Partial<DonneesLancement> = {}): DonneesLancement => ({
  choix: { objectif: 'calories', duree: 10 },
  derniersExercices: [],
  niveau: 1,
  derniereFamille: null,
  sansMateriel: false,
  ...surcharge,
});

describe('choix du lancement', () => {
  const derniers = { objectif: 'etirements' as const, duree: 15 as const };

  it('utilise Brûler des calories et 10 min sans choix enregistrés', () => {
    expect(choisirLancement({})).toEqual({ objectif: 'calories', duree: 10 });
  });

  it('reprend les derniers choix pour les paramètres absents', () => {
    expect(choisirLancement({}, derniers)).toEqual(derniers);
  });

  it.each(['abc', '0', '3', '4', 'Infinity', ''])('ignore la durée invalide %s et un objectif inconnu', (duree) => {
    expect(choisirLancement({ objectif: 'lune', duree }, derniers)).toEqual(derniers);
  });

  it('remplace chaque choix indépendamment et prend la première valeur répétée', () => {
    expect(choisirLancement({ objectif: ['masse', 'calories'] }, derniers)).toEqual({ objectif: 'masse', duree: 15 });
    expect(choisirLancement({ duree: ['30', '5'] }, derniers)).toEqual({ objectif: 'etirements', duree: 30 });
  });

  it.each(['calories', 'masse', 'etirements'] as const)('reconnaît l’objectif %s', (objectif) => {
    expect(choisirLancement({ objectif }).objectif).toBe(objectif);
  });

  it.each([5, 10, 15, 30] as const)('conserve la durée %s', (duree) => {
    expect(choisirLancement({ duree: String(duree) }).duree).toBe(duree);
  });
});

describe('intensité du lien', () => {
  it('prend une intensité valide, sinon celle enregistrée', () => {
    expect(intensiteDuLien('3', 1)).toBe(3);
    expect(intensiteDuLien(['2', '3'], 1)).toBe(2);
    for (const brut of [undefined, '', '0', '4', 'x', '1.5']) expect(intensiteDuLien(brut, 2)).toBe(2);
  });
});

describe('paramètres de séance', () => {
  it('lance une séance générée pour Brûler des calories, avec intensité, graine et derniers exercices', () => {
    expect(parametresLancement(donnees({ derniersExercices: ['a', 'b'], niveau: 3 }), 123)).toEqual({
      objectif: 'calories', duree: '10', graine: '123', exclure: 'a,b', niveau: '3',
    });
  });

  it('lance une séance générée pour Étirements, sans contexte ni ressenti', () => {
    const params = parametresLancement(donnees({ choix: { objectif: 'etirements', duree: 30 } }), 0);
    expect(params).toEqual({ objectif: 'etirements', duree: '30', graine: '0', exclure: '', niveau: '1' });
  });

  it.each([[5, '1'], [10, '2'], [15, '3'], [30, '6']] as const)(
    'joue un circuit de masse pour Prise de masse : %s min = %s tour(s)',
    (duree, tours) => {
      expect(parametresLancement(donnees({ choix: { objectif: 'masse', duree } }), 42)).toEqual({
        circuit: 'full-body-doux', tours, sansMateriel: '0', graine: '42',
      });
    },
  );

  it('fait tourner les familles d’après la dernière séance de masse, au niveau choisi', () => {
    const masse = (derniereFamille: DonneesLancement['derniereFamille'], niveau: 1 | 2 | 3) =>
      parametresLancement(donnees({ choix: { objectif: 'masse', duree: 10 }, derniereFamille, niveau }), 1).circuit;
    expect(masse(null, 2)).toBe('full-body-tonique');
    expect(masse('full_body', 2)).toBe('poussee-tonique');
    expect(masse('poussee', 3)).toBe('jambes-costaud');
    expect(masse('jambes', 1)).toBe('dos-doux');
    expect(masse('dos', 1)).toBe('full-body-doux');
  });

  it('applique « sans meuble » seulement si le circuit demande un meuble', () => {
    const avecMeuble = parametresLancement(
      donnees({ choix: { objectif: 'masse', duree: 10 }, derniereFamille: 'jambes', niveau: 2, sansMateriel: true }),
      1,
    );
    expect(avecMeuble).toMatchObject({ circuit: 'dos-tonique', sansMateriel: '1' });
    // Dos et tronc (Léger) se fait sans meuble : l'option ne s'applique pas.
    const sansMeuble = parametresLancement(
      donnees({ choix: { objectif: 'masse', duree: 10 }, derniereFamille: 'jambes', sansMateriel: true }),
      1,
    );
    expect(sansMeuble).toMatchObject({ circuit: 'dos-doux', sansMateriel: '0' });
    const sansPreference = parametresLancement(donnees({ choix: { objectif: 'masse', duree: 10 }, derniereFamille: 'jambes', niveau: 2 }), 1);
    expect(sansPreference).toMatchObject({ circuit: 'dos-tonique', sansMateriel: '0' });
  });
});

describe('dernière famille de masse', () => {
  it('est nulle sans circuit de masse dans le journal', () => {
    expect(derniereFamilleMasse([])).toBeNull();
    expect(derniereFamilleMasse([fabriquerEntree(), fabriquerEntree({ circuitId: 'cardio-athletique', duree: 16 })])).toBeNull();
  });

  it('vient de la séance la plus récente (en tête du journal) dont le circuit est un circuit de masse', () => {
    const journal = [
      fabriquerEntree({ id: 'flash' }),
      fabriquerEntree({ id: 'cardio', circuitId: 'cardio-athletique', duree: 16 }),
      fabriquerEntree({ id: 'jambes', circuitId: 'jambes-tonique', duree: 21 }),
      fabriquerEntree({ id: 'dos', circuitId: 'dos-doux', duree: 16 }),
    ];
    expect(derniereFamilleMasse(journal)).toBe('jambes');
  });

  it('compte aussi un circuit choisi dans « Séances prêtes » et ignore un circuit inconnu', () => {
    expect(derniereFamilleMasse([fabriquerEntree({ circuitId: 'circuit-du-futur', duree: 20 }), fabriquerEntree({ circuitId: 'poussee-doux', duree: 16 })]))
      .toBe('poussee');
    expect(circuitParId('poussee-doux')?.famille).toBe('poussee');
  });
});

describe('lecture des données de lancement', () => {
  it('lit les choix, l’intensité, les derniers exercices, le journal et « sans meuble »', async () => {
    const stockage = creerStockageMemoire({
      'flashcoach.choix.v2': JSON.stringify({ objectif: 'masse', duree: 30 }),
      'flashcoach.niveau': '2',
      'flashcoach.derniers-exercices': JSON.stringify(['a']),
      'flashcoach.journal.v1': JSON.stringify([fabriquerEntree({ circuitId: 'dos-tonique', duree: 21 })]),
      'flashcoach.sansMateriel': 'true',
    });
    expect(await lireDonneesLancement(stockage)).toEqual({
      choix: { objectif: 'masse', duree: 30 },
      niveau: 2,
      derniersExercices: ['a'],
      derniereFamille: 'dos',
      sansMateriel: true,
    });
  });

  it('retombe sur les valeurs du premier lancement', async () => {
    expect(await lireDonneesLancement(creerStockageMemoire())).toEqual(donnees());
  });
});
