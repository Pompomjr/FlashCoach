import type { Ressenti } from '../catalogue/types';
import type { Phase } from '../generateur/types';

export const LIBELLES_RESSENTI: Record<Ressenti, { libelle: string; emoji: string }> = {
  raide: { libelle: 'Raide', emoji: '😣' },
  stresse: { libelle: 'Stressé', emoji: '😰' },
  mou: { libelle: 'Mou', emoji: '😴' },
  en_forme: { libelle: 'En forme', emoji: '💪' },
};

export const LIBELLES_PHASE: Record<Phase, string> = {
  mise_en_route: 'Mise en route',
  coeur: 'On y va',
  retour_au_calme: 'Retour au calme',
};
