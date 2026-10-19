type Variables = Record<string, string | undefined>;

// Expo n'injecte les variables EXPO_PUBLIC_* que lues littéralement : d'où l'objet construit ici.
const VARIABLES_APP: Variables = {
  EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
};

// Sans les deux valeurs, l'app reste entièrement locale (aucun client, aucune synchro).
export function configurationSupabase(env: Variables = VARIABLES_APP): { url: string; cle: string } | null {
  const url = env.EXPO_PUBLIC_SUPABASE_URL?.trim();
  const cle = env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  return url && cle ? { url, cle } : null;
}
