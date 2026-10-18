import type { Stockage } from '../preferences/stockage';
import { fabriquerEntree } from '../test-utils/journal';
import { creerStockageMemoire } from '../test-utils/stockageMemoire';
import {
  CLE_JOURNAL,
  TAILLE_MAX_JOURNAL,
  ajouterEntree,
  creerIdentifiant,
  lireJournal,
  mettreAJourEntree,
  resumeJournal,
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
