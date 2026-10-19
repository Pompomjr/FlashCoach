import type { SupabaseClient } from '@supabase/supabase-js';

import { ErreurCompte } from './auth';
import { AuthSupabase, genreDe } from './authSupabase';

const utilisateur = (surcharge = {}) => ({ id: 'u1', email: '', is_anonymous: true, ...surcharge });

function clientFactice(auth: Record<string, jest.Mock>) {
  return { auth } as unknown as SupabaseClient;
}

describe('AuthSupabase', () => {
  it('lie l’e-mail à la session anonyme', async () => {
    const updateUser = jest.fn(async () => ({ data: {}, error: null }));
    const signInWithOtp = jest.fn();
    const auth = new AuthSupabase(clientFactice({ updateUser, signInWithOtp }));
    expect(await auth.demanderCode('a@b.fr')).toBe('liaison');
    expect(updateUser).toHaveBeenCalledWith({ email: 'a@b.fr' });
    expect(signInWithOtp).not.toHaveBeenCalled();
  });

  it('bascule vers la connexion quand l’e-mail a déjà un compte', async () => {
    const updateUser = jest.fn(async () => ({ data: {}, error: { code: 'email_exists', name: 'AuthApiError', status: 422 } }));
    const signInWithOtp = jest.fn(async () => ({ data: {}, error: null }));
    const auth = new AuthSupabase(clientFactice({ updateUser, signInWithOtp }));
    expect(await auth.demanderCode('a@b.fr')).toBe('connexion');
    expect(signInWithOtp).toHaveBeenCalledWith({ email: 'a@b.fr', options: { shouldCreateUser: false } });
  });

  it('vérifie le code avec le bon type', async () => {
    const verifyOtp = jest.fn(async () => ({ data: { user: utilisateur({ email: 'a@b.fr', is_anonymous: false }) }, error: null }));
    const auth = new AuthSupabase(clientFactice({ verifyOtp }));
    expect(await auth.confirmerCode('a@b.fr', '123456', 'liaison')).toEqual({ utilisateurId: 'u1', email: 'a@b.fr', anonyme: false });
    expect(verifyOtp).toHaveBeenCalledWith({ email: 'a@b.fr', token: '123456', type: 'email_change' });
    await auth.confirmerCode('a@b.fr', '123456', 'connexion');
    expect(verifyOtp).toHaveBeenLastCalledWith({ email: 'a@b.fr', token: '123456', type: 'email' });
  });

  it('traduit les erreurs en genres affichables', async () => {
    const verifyOtp = jest.fn(async () => ({ data: { user: null }, error: { code: 'otp_expired', name: 'AuthApiError', status: 403 } }));
    const auth = new AuthSupabase(clientFactice({ verifyOtp }));
    await expect(auth.confirmerCode('a@b.fr', '000000', 'liaison')).rejects.toEqual(new ErreurCompte('code-invalide'));
    expect(genreDe({ name: 'AuthRetryableFetchError', status: 0, code: undefined })).toBe('reseau');
    expect(genreDe({ name: 'AuthApiError', status: 429, code: 'over_email_send_rate_limit' })).toBe('trop-de-tentatives');
    expect(genreDe({ name: 'AuthApiError', status: 500, code: 'unexpected_failure' })).toBe('inconnue');
  });

  it('reprend ou crée la session', async () => {
    const getSession = jest.fn(async () => ({ data: { session: null }, error: null }));
    const signInAnonymously = jest.fn(async () => ({ data: { user: utilisateur() }, error: null }));
    const auth = new AuthSupabase(clientFactice({ getSession, signInAnonymously }));
    expect(await auth.sessionCourante()).toBeNull();
    expect(await auth.creerSessionAnonyme()).toEqual({ utilisateurId: 'u1', email: null, anonyme: true });
  });
});
