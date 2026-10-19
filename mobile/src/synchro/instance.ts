import { AuthSupabase } from '../compte/authSupabase';
import type { Authentification } from '../compte/auth';
import { creerClient } from '../compte/client';
import { configurationSupabase } from '../compte/configuration';
import { stockageTelephone } from '../preferences/stockage';
import { creerMoteur, type Moteur } from './moteur';
import { ServeurSupabase } from './serveurSupabase';

// Sans configuration Supabase, tout reste à null : l'app est exactement celle d'avant le jalon 4.
const configuration = configurationSupabase();
const client = configuration ? creerClient(configuration) : null;

export const authApp: Authentification | null = client ? new AuthSupabase(client) : null;
export const moteurApp: Moteur | null =
  client && authApp ? creerMoteur({ stockage: stockageTelephone, serveur: new ServeurSupabase(client), auth: authApp }) : null;

// Appelée sans attendre par les écrans : ne bloque ni ne rejette jamais.
export function demanderSynchro(): void {
  moteurApp?.demanderSynchro().catch(() => undefined);
}
