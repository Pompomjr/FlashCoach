import { configurationSupabase } from './configuration';

describe('configurationSupabase', () => {
  it('est absente sans les deux variables', () => {
    expect(configurationSupabase({})).toBeNull();
    expect(configurationSupabase({ EXPO_PUBLIC_SUPABASE_URL: 'https://x.supabase.co' })).toBeNull();
    expect(configurationSupabase({ EXPO_PUBLIC_SUPABASE_URL: ' ', EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'k' })).toBeNull();
  });

  it('renvoie l’URL et la clé publique', () => {
    expect(
      configurationSupabase({ EXPO_PUBLIC_SUPABASE_URL: 'https://x.supabase.co', EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_k' }),
    ).toEqual({ url: 'https://x.supabase.co', cle: 'sb_publishable_k' });
  });
});
