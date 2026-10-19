import type { AuthError, SupabaseClient, User } from '@supabase/supabase-js';

import { ErreurCompte, type Authentification, type EtatCompte, type GenreErreur, type ModeCode } from './auth';

function etatDe(user: User): EtatCompte {
  return { utilisateurId: user.id, email: user.email || null, anonyme: user.is_anonymous ?? false };
}

const CODES_TROP = ['over_email_send_rate_limit', 'over_request_rate_limit', 'over_sms_send_rate_limit'];
const CODES_CODE = ['otp_expired', 'otp_invalid'];

export function genreDe(erreur: Pick<AuthError, 'code' | 'name' | 'status'>): GenreErreur {
  if (erreur.name === 'AuthRetryableFetchError' || erreur.status === 0) return 'reseau';
  if (erreur.status === 429 || CODES_TROP.includes(erreur.code ?? '')) return 'trop-de-tentatives';
  if (CODES_CODE.includes(erreur.code ?? '')) return 'code-invalide';
  return 'inconnue';
}

export function emailDejaUtilise(erreur: Pick<AuthError, 'code'>): boolean {
  return erreur.code === 'email_exists' || erreur.code === 'user_already_exists';
}

export class AuthSupabase implements Authentification {
  constructor(private readonly client: SupabaseClient) {}

  async sessionCourante(): Promise<EtatCompte | null> {
    const { data, error } = await this.client.auth.getSession();
    if (error) throw new ErreurCompte(genreDe(error));
    return data.session ? etatDe(data.session.user) : null;
  }

  async creerSessionAnonyme(): Promise<EtatCompte> {
    const { data, error } = await this.client.auth.signInAnonymously();
    if (error || !data.user) throw new ErreurCompte(error ? genreDe(error) : 'inconnue');
    return etatDe(data.user);
  }

  async demanderCode(email: string): Promise<ModeCode> {
    const liaison = await this.client.auth.updateUser({ email });
    if (!liaison.error) return 'liaison';
    if (!emailDejaUtilise(liaison.error)) throw new ErreurCompte(genreDe(liaison.error));
    const connexion = await this.client.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
    if (connexion.error) throw new ErreurCompte(genreDe(connexion.error));
    return 'connexion';
  }

  async confirmerCode(email: string, code: string, mode: ModeCode): Promise<EtatCompte> {
    const { data, error } = await this.client.auth.verifyOtp({
      email,
      token: code,
      type: mode === 'liaison' ? 'email_change' : 'email',
    });
    if (error || !data.user) throw new ErreurCompte(error ? genreDe(error) : 'inconnue');
    return etatDe(data.user);
  }
}
