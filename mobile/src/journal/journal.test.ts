import type { Stockage } from '../preferences/stockage';
import { fabriquerEntree } from '../test-utils/journal';
import { creerStockageMemoire } from '../test-utils/stockageMemoire';
import { lireFileEnvoi } from '../synchro/fileEnvoi';
import {
  CLE_JOURNAL,
  TAILLE_MAX_JOURNAL,
  ajouterEntree,
  creerIdentifiant,
  estEntreeJournal,
  normaliserEntree,
  fusionnerDansJournal,
  lireJournal,
  lireJournalSiLisible,
  mettreAJourEntree,
  resumeJournal,
  type EntreeJournal,
} from './journal';

const enPanne: Stockage = {
  lire: async () => {
    throw new Error('panne');
  },
  ecrire: async () => {
    throw new Error('panne');
  },
};

describe('journal', () => {
  it('est vide au premier lancement', async () => {
    expect(await lireJournal(creerStockageMemoire())).toEqual([]);
  });

  it('garde les séances, la plus récente en premier', async () => {
    const stockage = creerStockageMemoire();
    await ajouterEntree(stockage, fabriquerEntree({ id: 'a' }));
    await ajouterEntree(stockage, fabriquerEntree({ id: 'b' }));
    expect((await lireJournal(stockage)).map((e) => e.id)).toEqual(['b', 'a']);
  });

  it(`ne garde que les ${TAILLE_MAX_JOURNAL} dernières séances`, async () => {
    const anciennes = Array.from({ length: TAILLE_MAX_JOURNAL }, (_, i) => fabriquerEntree({ id: `e${i}` }));
    const stockage = creerStockageMemoire({ [CLE_JOURNAL]: JSON.stringify(anciennes) });
    await ajouterEntree(stockage, fabriquerEntree({ id: 'nouvelle' }));
    const journal = await lireJournal(stockage);
    expect(journal).toHaveLength(TAILLE_MAX_JOURNAL);
    expect(journal[0].id).toBe('nouvelle');
    expect(journal.some((e) => e.id === `e${TAILLE_MAX_JOURNAL - 1}`)).toBe(false);
  });

  it('complète une séance sans toucher aux autres', async () => {
    const stockage = creerStockageMemoire();
    await ajouterEntree(stockage, fabriquerEntree({ id: 'a', terminee: false, ecouleMs: 0, exercicesFaits: 0 }));
    await ajouterEntree(stockage, fabriquerEntree({ id: 'b' }));
    await mettreAJourEntree(stockage, 'a', { terminee: true, ecouleMs: 180000, exercicesFaits: 5, apres: 'mieux' });
    const [b, a] = await lireJournal(stockage);
    expect(a).toMatchObject({ id: 'a', terminee: true, ecouleMs: 180000, exercicesFaits: 5, apres: 'mieux' });
    expect(b).toEqual(fabriquerEntree({ id: 'b' }));
  });

  it('ignore la mise à jour d’une séance inconnue', async () => {
    const stockage = creerStockageMemoire();
    await ajouterEntree(stockage, fabriquerEntree({ id: 'a' }));
    await mettreAJourEntree(stockage, 'inconnue', { apres: 'mieux' });
    expect(await lireJournal(stockage)).toEqual([fabriquerEntree({ id: 'a' })]);
  });

  it('applique les opérations dans l’ordre même lancées sans attendre', async () => {
    const stockage = creerStockageMemoire();
    await Promise.all([
      ajouterEntree(stockage, fabriquerEntree({ id: 'a', apres: null })),
      mettreAJourEntree(stockage, 'a', { apres: 'pareil' }),
      ajouterEntree(stockage, fabriquerEntree({ id: 'b' })),
    ]);
    const journal = await lireJournal(stockage);
    expect(journal.map((e) => e.id)).toEqual(['b', 'a']);
    expect(journal[1].apres).toBe('pareil');
  });

  it('écarte les données abîmées et garde les entrées valides', async () => {
    expect(await lireJournal(creerStockageMemoire({ [CLE_JOURNAL]: '{pas du json' }))).toEqual([]);
    const melange = [fabriquerEntree({ id: 'ok' }), { id: 'cassee' }, fabriquerEntree({ id: 'ko', ressenti: 'fatigue' as never })];
    const journal = await lireJournal(creerStockageMemoire({ [CLE_JOURNAL]: JSON.stringify(melange) }));
    expect(journal.map((e) => e.id)).toEqual(['ok']);
  });

  it('ne bloque jamais quand le stockage est en panne', async () => {
    expect(await lireJournal(enPanne)).toEqual([]);
    await expect(ajouterEntree(enPanne, fabriquerEntree())).resolves.toBeUndefined();
    await expect(mettreAJourEntree(enPanne, 'a', { apres: 'mieux' })).resolves.toBeUndefined();
  });

  it('ne réécrit pas le journal quand la lecture échoue', async () => {
    const contenu: Record<string, string> = { [CLE_JOURNAL]: JSON.stringify([fabriquerEntree({ id: 'a' })]) };
    const original = contenu[CLE_JOURNAL];
    const lectureEnPanne: Stockage = {
      lire: async () => {
        throw new Error('panne');
      },
      ecrire: async (cle, valeur) => {
        contenu[cle] = valeur;
      },
    };
    await ajouterEntree(lectureEnPanne, fabriquerEntree({ id: 'b' }));
    await mettreAJourEntree(lectureEnPanne, 'a', { apres: 'mieux' });
    expect(contenu[CLE_JOURNAL]).toBe(original);
    expect(await lireJournal(lectureEnPanne)).toEqual([]);
  });

  it('ne bloque pas quand seule l’écriture est en panne', async () => {
    const ecritureEnPanne: Stockage = {
      lire: async () => null,
      ecrire: async () => {
        throw new Error('panne');
      },
    };
    await expect(ajouterEntree(ecritureEnPanne, fabriquerEntree())).resolves.toBeUndefined();
    await expect(mettreAJourEntree(ecritureEnPanne, 'a', { apres: 'mieux' })).resolves.toBeUndefined();
  });

  it('ne bloque pas quand l’écriture échoue sur une entrée existante', async () => {
    const ecritureEnPanne: Stockage = {
      lire: async () => JSON.stringify([fabriquerEntree({ id: 'a' })]),
      ecrire: async () => {
        throw new Error('panne');
      },
    };
    await expect(mettreAJourEntree(ecritureEnPanne, 'a', { apres: 'mieux' })).resolves.toBeUndefined();
  });

  it('remplace une entrée déjà présente et la remet en tête', async () => {
    const stockage = creerStockageMemoire();
    await ajouterEntree(stockage, fabriquerEntree({ id: 'a', exercicesFaits: 2 }));
    await ajouterEntree(stockage, fabriquerEntree({ id: 'b' }));
    await ajouterEntree(stockage, fabriquerEntree({ id: 'a', exercicesFaits: 9 }));
    const journal = await lireJournal(stockage);
    expect(journal.map((e) => e.id)).toEqual(['a', 'b']);
    expect(journal[0].exercicesFaits).toBe(9);
  });

  it('n’écrit rien quand la mise à jour produit une entrée invalide', async () => {
    const stockage = creerStockageMemoire();
    await ajouterEntree(stockage, fabriquerEntree({ id: 'a' }));
    const avant = stockage.contenu[CLE_JOURNAL];
    await mettreAJourEntree(stockage, 'a', { ecouleMs: NaN });
    expect(stockage.contenu[CLE_JOURNAL]).toBe(avant);
    expect(await lireJournal(stockage)).toEqual([fabriquerEntree({ id: 'a' })]);
  });

  it('ignore une mise à jour avec une valeur infinie ou non entière : l’entrée reste lisible', async () => {
    const stockage = creerStockageMemoire();
    await ajouterEntree(stockage, fabriquerEntree({ id: 'a' }));
    const avant = stockage.contenu[CLE_JOURNAL];
    await mettreAJourEntree(stockage, 'a', { ecouleMs: Infinity });
    await mettreAJourEntree(stockage, 'a', { exercicesFaits: Infinity });
    await mettreAJourEntree(stockage, 'a', { exercicesFaits: 2.5 });
    expect(stockage.contenu[CLE_JOURNAL]).toBe(avant);
    expect(await lireJournal(stockage)).toEqual([fabriquerEntree({ id: 'a' })]);
  });

  it('écarte à la lecture une entrée dont la graine ou la durée écoulée n’est pas finie', async () => {
    const brut = '[{"id":"x","debut":"2026-10-18T05:05:00.000Z","contexteId":"maison","ressenti":"mou","duree":5,"graine":null,"exercices":[],"ecouleMs":0,"exercicesFaits":0,"terminee":false,"apres":null}]';
    expect(await lireJournal(creerStockageMemoire({ [CLE_JOURNAL]: brut }))).toEqual([]);
  });

  it('crée des identifiants différents', () => {
    expect(creerIdentifiant()).not.toBe(creerIdentifiant());
  });

  it('marque à envoyer chaque séance créée ou complétée', async () => {
    const stockage = creerStockageMemoire();
    await ajouterEntree(stockage, fabriquerEntree({ id: 'a' }));
    expect(await lireFileEnvoi(stockage)).toEqual({ a: 1 });
    await mettreAJourEntree(stockage, 'a', { apres: 'mieux' });
    expect(await lireFileEnvoi(stockage)).toEqual({ a: 2 });
  });

  it('ne marque rien quand l’écriture du journal échoue', async () => {
    const memoire = creerStockageMemoire();
    const stockage = {
      lire: memoire.lire,
      ecrire: async (cle: string, valeur: string) => {
        if (cle === CLE_JOURNAL) throw new Error('panne');
        await memoire.ecrire(cle, valeur);
      },
    };
    await ajouterEntree(stockage, fabriquerEntree({ id: 'a' }));
    expect(await lireFileEnvoi(stockage)).toEqual({});
  });

  it('distingue un journal illisible d’un journal vide', async () => {
    expect(await lireJournalSiLisible(creerStockageMemoire())).toEqual([]);
    const enPanne = { lire: async () => { throw new Error('panne'); }, ecrire: async () => undefined };
    expect(await lireJournalSiLisible(enPanne)).toBeNull();
  });

  it('fusionne des séances retrouvées et renvoie les identifiants du journal obtenu', async () => {
    const stockage = creerStockageMemoire();
    await ajouterEntree(stockage, fabriquerEntree({ id: 'local', debut: new Date(2026, 9, 12).toISOString() }));
    const ids = await fusionnerDansJournal(stockage, [fabriquerEntree({ id: 'distante', debut: new Date(2026, 9, 10).toISOString() })]);
    expect(ids).toEqual(['local', 'distante']);
    expect((await lireJournal(stockage)).map((e) => e.id)).toEqual(['local', 'distante']);
  });

  it('expose la garde des entrées pour valider les séances venues du serveur', () => {
    expect(estEntreeJournal(fabriquerEntree())).toBe(true);
    expect(estEntreeJournal({ ...fabriquerEntree(), duree: 7 })).toBe(false);
    expect(estEntreeJournal({ ...fabriquerEntree(), niveau: 4 })).toBe(false);
    expect(estEntreeJournal({ ...fabriquerEntree(), effort: 'x' })).toBe(false);
  });
});

describe('resumeJournal', () => {
  it('compte les séances, les réponses et les « mieux »', () => {
    const entrees = [
      fabriquerEntree({ id: 'a', apres: 'mieux' }),
      fabriquerEntree({ id: 'b', apres: 'pareil' }),
      fabriquerEntree({ id: 'c', apres: null }),
      fabriquerEntree({ id: 'd', apres: 'mieux' }),
    ];
    expect(resumeJournal(entrees)).toEqual({ seances: 4, repondues: 3, mieux: 2 });
  });
});

describe('niveau et effort', () => {
  const ancienne = () => {
    const { niveau, effort, ...reste } = fabriquerEntree({ id: 'vieille' });
    return reste;
  };

  it('lit une ancienne entrée sans niveau ni effort : niveau 1, effort nul', async () => {
    const stockage = creerStockageMemoire({ [CLE_JOURNAL]: JSON.stringify([ancienne()]) });
    expect(await lireJournal(stockage)).toEqual([fabriquerEntree({ id: 'vieille', niveau: 1, effort: null })]);
  });

  it('normalise une entrée sans les champs, mais rejette un niveau ou un effort invalide', () => {
    expect(normaliserEntree(ancienne())).toMatchObject({ niveau: 1, effort: null });
    expect(normaliserEntree({ ...ancienne(), niveau: 2, effort: 'dur' })).toMatchObject({ niveau: 2, effort: 'dur' });
    expect(normaliserEntree({ ...ancienne(), niveau: 9 })).toBeNull();
    expect(normaliserEntree({ ...ancienne(), effort: 'x' })).toBeNull();
    expect(normaliserEntree(null)).toBeNull();
  });

  it('enregistre l’effort et refuse un effort invalide à la mise à jour', async () => {
    const stockage = creerStockageMemoire();
    await ajouterEntree(stockage, fabriquerEntree({ id: 'a' }));
    await mettreAJourEntree(stockage, 'a', { effort: 'facile' });
    expect((await lireJournal(stockage))[0].effort).toBe('facile');
    await mettreAJourEntree(stockage, 'a', { effort: 'x' as never });
    expect((await lireJournal(stockage))[0].effort).toBe('facile');
  });
});

describe('séances en circuit', () => {
  const circuit = (surcharge = {}) => fabriquerEntree({ id: 'circuit', circuitId: 'full-body-tonique', duree: 21, niveau: 2, ...surcharge });
  const sansCircuit = () => {
    const { circuitId, ...reste } = fabriquerEntree({ id: 'vieille' });
    return reste;
  };

  it('lit une entrée d’avant les circuits : circuitId nul, durée flash inchangée', async () => {
    const stockage = creerStockageMemoire({ [CLE_JOURNAL]: JSON.stringify([sansCircuit()]) });
    expect(await lireJournal(stockage)).toEqual([fabriquerEntree({ id: 'vieille', circuitId: null })]);
    expect(normaliserEntree(sansCircuit())).toMatchObject({ circuitId: null, duree: 5 });
  });

  it('accepte une entrée de circuit de 21 minutes et la retrouve telle quelle', async () => {
    expect(estEntreeJournal(circuit())).toBe(true);
    const stockage = creerStockageMemoire();
    await ajouterEntree(stockage, circuit());
    expect(await lireJournal(stockage)).toEqual([circuit()]);
  });

  it('accepte toute durée entière de 1 à 60 minutes pour un circuit', () => {
    for (const duree of [1, 16, 21, 26, 60]) expect(estEntreeJournal(circuit({ duree }))).toBe(true);
  });

  it('refuse pour un circuit une durée hors de 1 à 60 ou non entière', () => {
    for (const duree of [0, -3, 61, 120, 1.5, Number.NaN, '21']) expect(estEntreeJournal(circuit({ duree }))).toBe(false);
  });

  it('garde les durées 3, 5 et 10 pour une séance sans circuit', () => {
    for (const duree of [5, 10, 15, 30]) expect(estEntreeJournal(fabriquerEntree({ duree }))).toBe(true);
    // 3 min n'est plus proposée : les anciennes entrées de 3 min restent lisibles.
    expect(estEntreeJournal(fabriquerEntree({ duree: 3 }))).toBe(true);
    for (const duree of [1, 7, 21, 60]) expect(estEntreeJournal(fabriquerEntree({ duree: duree as never }))).toBe(false);
  });

  it('refuse un identifiant de circuit qui n’est ni nul ni du texte', () => {
    for (const circuitId of [5, true, {}, undefined]) expect(estEntreeJournal(circuit({ circuitId }))).toBe(false);
  });

  it('écarte à la lecture une entrée de circuit à la durée invalide, garde les autres', async () => {
    const stockage = creerStockageMemoire({ [CLE_JOURNAL]: JSON.stringify([circuit({ duree: 90 }), circuit({ id: 'bonne' })]) });
    expect((await lireJournal(stockage)).map((e) => e.id)).toEqual(['bonne']);
  });

  it('complète une entrée de circuit sans perdre son circuit ni sa durée', async () => {
    const stockage = creerStockageMemoire();
    await ajouterEntree(stockage, circuit());
    await mettreAJourEntree(stockage, 'circuit', { terminee: true, apres: 'mieux' });
    expect((await lireJournal(stockage))[0]).toEqual(circuit({ terminee: true, apres: 'mieux' }));
  });
});

describe('entrées par objectif', () => {
  const parObjectif = (surcharge: Partial<EntreeJournal> = {}) =>
    fabriquerEntree({ id: 'objectif', objectif: 'calories', contexteId: null, ressenti: null, duree: 10, niveau: 2, ...surcharge });

  it('accepte une entrée à objectif, sans contexte ni ressenti, et la retrouve telle quelle', async () => {
    for (const objectif of ['calories', 'masse', 'etirements'] as const) expect(estEntreeJournal(parObjectif({ objectif }))).toBe(true);
    const stockage = creerStockageMemoire();
    await ajouterEntree(stockage, parObjectif());
    expect(await lireJournal(stockage)).toEqual([parObjectif()]);
  });

  it('accepte 5, 10, 15 et 30 min pour une entrée à objectif, plus jamais 3', () => {
    for (const duree of [5, 10, 15, 30]) expect(estEntreeJournal(parObjectif({ duree }))).toBe(true);
    for (const duree of [3, 1, 7, 16, 60]) expect(estEntreeJournal(parObjectif({ duree }))).toBe(false);
  });

  it('accepte une prise de masse en circuit à la durée réelle du circuit', () => {
    for (const duree of [6, 11, 16, 31]) {
      expect(estEntreeJournal(parObjectif({ objectif: 'masse', circuitId: 'jambes-moyen', duree }))).toBe(true);
    }
  });

  it('refuse un objectif inconnu, ou un contexte et un ressenti à côté d’un objectif', () => {
    expect(estEntreeJournal(parObjectif({ objectif: 'lune' as never }))).toBe(false);
    expect(estEntreeJournal(parObjectif({ contexteId: 'maison' }))).toBe(false);
    expect(estEntreeJournal(parObjectif({ ressenti: 'mou' }))).toBe(false);
  });

  it('refuse une entrée sans objectif à laquelle il manque le contexte ou le ressenti', () => {
    expect(estEntreeJournal(fabriquerEntree({ contexteId: null }))).toBe(false);
    expect(estEntreeJournal(fabriquerEntree({ ressenti: null }))).toBe(false);
  });

  it('lit une ancienne entrée (contexte et ressenti, sans champ objectif) : objectif nul', async () => {
    const { objectif, ...ancienne } = fabriquerEntree({ id: 'vieille', duree: 3 });
    expect(normaliserEntree(ancienne)).toEqual(fabriquerEntree({ id: 'vieille', duree: 3, objectif: null }));
    const stockage = creerStockageMemoire({ [CLE_JOURNAL]: JSON.stringify([ancienne, parObjectif()]) });
    expect((await lireJournal(stockage)).map((e) => e.objectif)).toEqual([null, 'calories']);
  });

  it('complète une entrée à objectif sans la rendre invalide', async () => {
    const stockage = creerStockageMemoire();
    await ajouterEntree(stockage, parObjectif());
    await mettreAJourEntree(stockage, 'objectif', { terminee: true, apres: 'mieux', effort: 'dur' });
    expect((await lireJournal(stockage))[0]).toEqual(parObjectif({ terminee: true, apres: 'mieux', effort: 'dur' }));
  });
});
