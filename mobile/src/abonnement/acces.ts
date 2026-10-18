import { CONTEXTES } from '../catalogue/contextes';

// Seuls les contextes gratuits sont ouverts tant que l'abonnement n'existe pas (jalon 5 : RevenueCat).
export function contexteDisponible(contexteId: string): boolean {
  return CONTEXTES.some((contexte) => contexte.id === contexteId && !contexte.premium);
}
