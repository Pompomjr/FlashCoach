import type { Ressenti } from '../catalogue/types';
import type { Phase } from '../generateur/types';

export const LIBELLES_RESSENTI: Record<Ressenti, { libelle: string }> = {
  raide: { libelle: 'Raide' },
  stresse: { libelle: 'Stressé' },
  mou: { libelle: 'Mou' },
  en_forme: { libelle: 'En forme' },
};

export const LIBELLES_PHASE: Record<Phase, string> = {
  mise_en_route: 'Mise en route',
  coeur: 'On y va',
  retour_au_calme: 'Retour au calme',
};
