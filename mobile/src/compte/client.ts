import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

// Un seul client pour toute l'app ; la session (anonyme ou liée) est gardée sur le téléphone.
export function creerClient({ url, cle }: { url: string; cle: string }): SupabaseClient {
  const client = createClient(url, cle, {
    auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
  });
  // Le jeton ne se rafraîchit que quand l'app est au premier plan.
  AppState.addEventListener('change', (etat) => {
    if (etat === 'active') client.auth.startAutoRefresh();
    else client.auth.stopAutoRefresh();
  });
  return client;
}
