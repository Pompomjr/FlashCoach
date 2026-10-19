import type { SupabaseClient } from '@supabase/supabase-js';

import { fabriquerEntree } from '../test-utils/journal';
import { ServeurSupabase, depuisLigne, versLigne } from './serveurSupabase';

describe('conversion séance ↔ ligne', () => {
  it('fait l’aller-retour sans perte', () => {
    const entree = fabriquerEntree({ apres: 'mieux' });
    expect(depuisLigne(versLigne(entree))).toEqual(entree);
  });

  it('normalise la date renvoyée par Postgres', () => {
    const entree = fabriquerEntree();
    const ligne = { ...versLigne(entree), debut: entree.debut.replace('Z', '+00:00') };
    expect(depuisLigne(ligne)?.debut).toBe(entree.debut);
  });

  it('ignore une ligne invalide', () => {
    expect(depuisLigne({ ...versLigne(fabriquerEntree()), duree: 7 })).toBeNull();
    expect(depuisLigne(null)).toBeNull();
    expect(depuisLigne({ ...versLigne(fabriquerEntree()), debut: 'pas une date' })).toBeNull();
  });
});

describe('ServeurSupabase', () => {
  it('envoie les séances en lignes snake_case avec mis_a_jour, sans user_id', async () => {
    const upsert = jest.fn(async () => ({ error: null }));
    const from = jest.fn(() => ({ upsert }));
    const serveur = new ServeurSupabase({ from } as unknown as SupabaseClient);
    const entree = fabriquerEntree({ id: 'a', apres: 'mieux' });
    await serveur.envoyer([entree]);
    expect(from).toHaveBeenCalledWith('seances');
    expect(upsert).toHaveBeenCalledTimes(1);
    const [lignes, options] = upsert.mock.calls[0] as unknown as [Record<string, unknown>[], unknown];
    expect(options).toEqual({ onConflict: 'user_id,id' });
    expect(lignes).toEqual([{ ...versLigne(entree), mis_a_jour: expect.any(String) }]);
    expect(lignes[0]).not.toHaveProperty('user_id');
    expect(Number.isNaN(Date.parse(lignes[0].mis_a_jour as string))).toBe(false);
  });

  it('lève l’erreur renvoyée à l’envoi', async () => {
    const erreur = { message: 'refusé' };
    const serveur = new ServeurSupabase({ from: () => ({ upsert: async () => ({ error: erreur }) }) } as unknown as SupabaseClient);
    await expect(serveur.envoyer([fabriquerEntree()])).rejects.toBe(erreur);
  });

  function clientDeLecture(resultat: { data: unknown; error: unknown }) {
    const limit = jest.fn(async () => resultat);
    const order = jest.fn(() => ({ limit }));
    const select = jest.fn(() => ({ order }));
    return { client: { from: () => ({ select }) } as unknown as SupabaseClient, select, order, limit };
  }

  it('récupère les séances, ignore les lignes invalides et normalise les dates', async () => {
    const bonne = fabriquerEntree({ id: 'a' });
    const lue = { ...versLigne(bonne), debut: bonne.debut.replace('Z', '+00:00') };
    const { client, select, order, limit } = clientDeLecture({ data: [lue, { ...versLigne(fabriquerEntree({ id: 'b' })), duree: 7 }, null], error: null });
    expect(await new ServeurSupabase(client).recuperer()).toEqual([bonne]);
    expect(select).toHaveBeenCalledWith('id,debut,contexte_id,ressenti,duree,graine,exercices,ecoule_ms,exercices_faits,terminee,apres');
    expect(order).toHaveBeenCalledWith('debut', { ascending: false });
    expect(limit).toHaveBeenCalledWith(500);
  });

  it('lève l’erreur renvoyée à la lecture', async () => {
    const erreur = { message: 'hors ligne' };
    const { client } = clientDeLecture({ data: null, error: erreur });
    await expect(new ServeurSupabase(client).recuperer()).rejects.toBe(erreur);
  });
});
