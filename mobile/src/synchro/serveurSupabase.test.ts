import type { SupabaseClient } from '@supabase/supabase-js';

import { fabriquerEntree } from '../test-utils/journal';
import { ServeurSupabase, depuisLigne, versLigne } from './serveurSupabase';

describe('conversion séance ↔ ligne', () => {
  it('fait l’aller-retour sans perte', () => {
    const entree = fabriquerEntree({ apres: 'mieux' });
    expect(depuisLigne(versLigne(entree))).toEqual(entree);
    const costaud = fabriquerEntree({ niveau: 3, effort: 'dur' });
    expect(depuisLigne(versLigne(costaud))).toEqual(costaud);
    expect(versLigne(costaud)).toMatchObject({ niveau: 3, effort: 'dur' });
  });

  it('fait l’aller-retour d’une séance en circuit, durée de 21 minutes comprise', () => {
    const circuit = fabriquerEntree({ id: 'c', circuitId: 'dos-tonique', duree: 21, niveau: 2, exercices: ['tractions-australiennes', 'planche-laterale'] });
    expect(versLigne(circuit)).toMatchObject({ circuit_id: 'dos-tonique', duree: 21, niveau: 2 });
    expect(depuisLigne(versLigne(circuit))).toEqual(circuit);
  });

  it('envoie circuit_id nul pour une séance flash et la relit sans circuit', () => {
    const flash = fabriquerEntree();
    expect(versLigne(flash)).toHaveProperty('circuit_id', null);
    expect(depuisLigne(versLigne(flash))).toEqual(flash);
  });

  it('lit une ligne d’avant les circuits : colonne absente ou nulle', () => {
    const { circuit_id, ...ancienne } = versLigne(fabriquerEntree());
    expect(depuisLigne(ancienne)).toMatchObject({ circuitId: null, duree: 5 });
    expect(depuisLigne({ ...ancienne, circuit_id: null })).toMatchObject({ circuitId: null });
  });

  it('ignore une ligne de circuit à la durée invalide, ou une durée de circuit sans circuit', () => {
    const circuit = fabriquerEntree({ circuitId: 'dos-tonique', duree: 21 });
    expect(depuisLigne({ ...versLigne(circuit), duree: 61 })).toBeNull();
    expect(depuisLigne({ ...versLigne(circuit), circuit_id: null })).toBeNull();
  });

  it('fait l’aller-retour d’une séance par objectif : objectif rempli, contexte et ressenti nuls', () => {
    const entree = fabriquerEntree({ objectif: 'etirements', contexteId: null, ressenti: null, duree: 15, niveau: 2 });
    expect(versLigne(entree)).toMatchObject({ objectif: 'etirements', contexte_id: null, ressenti: null, duree: 15 });
    expect(depuisLigne(versLigne(entree))).toEqual(entree);
    const masse = fabriquerEntree({ objectif: 'masse', contexteId: null, ressenti: null, circuitId: 'jambes-tonique', duree: 16, niveau: 2 });
    expect(depuisLigne(versLigne(masse))).toEqual(masse);
  });

  it('lit une ligne d’avant les objectifs : colonne absente ou nulle, contexte et ressenti gardés', () => {
    const { objectif, ...ancienne } = versLigne(fabriquerEntree());
    expect(depuisLigne(ancienne)).toEqual(fabriquerEntree());
    expect(depuisLigne({ ...ancienne, objectif: null })).toEqual(fabriquerEntree());
    expect(versLigne(fabriquerEntree())).toHaveProperty('objectif', null);
  });

  it('ignore une ligne sans objectif ni contexte, ou à l’objectif inconnu', () => {
    expect(depuisLigne({ ...versLigne(fabriquerEntree()), contexte_id: null })).toBeNull();
    const entree = fabriquerEntree({ objectif: 'calories', contexteId: null, ressenti: null });
    expect(depuisLigne({ ...versLigne(entree), objectif: 'lune' })).toBeNull();
  });

  it('lit une ligne sans les colonnes niveau et effort', () => {
    const { niveau, effort, ...ancienne } = versLigne(fabriquerEntree());
    expect(depuisLigne(ancienne)).toMatchObject({ niveau: 1, effort: null });
    expect(depuisLigne({ ...ancienne, niveau: null, effort: null })).toMatchObject({ niveau: 1, effort: null });
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
    expect(select).toHaveBeenCalledWith('id,debut,contexte_id,ressenti,duree,graine,exercices,ecoule_ms,exercices_faits,terminee,apres,niveau,effort,circuit_id,objectif');
    expect(order).toHaveBeenCalledWith('debut', { ascending: false });
    expect(limit).toHaveBeenCalledWith(500);
  });

  it('lève l’erreur renvoyée à la lecture', async () => {
    const erreur = { message: 'hors ligne' };
    const { client } = clientDeLecture({ data: null, error: erreur });
    await expect(new ServeurSupabase(client).recuperer()).rejects.toBe(erreur);
  });
});
