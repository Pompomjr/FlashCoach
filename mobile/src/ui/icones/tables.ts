import type { Ressenti } from '../../catalogue/types';
import type { Apres } from '../../journal/journal';
import type { NomIcone } from './traces';

// Id de contexte du catalogue → icône. Un contexte sans entrée s'affiche sans icône.
export const ICONE_CONTEXTE: Record<string, NomIcone> = {
  reveil: 'reveil',
  maison: 'maison',
  bureau: 'bureau',
  voyage: 'voyage',
  dehors: 'dehors',
};

export const ICONE_RESSENTI: Record<Ressenti, NomIcone> = {
  raide: 'raide',
  stresse: 'stresse',
  mou: 'mou',
  en_forme: 'en_forme',
};

// Réponse à « Tu te sens mieux ? ».
export const ICONE_APRES: Record<Apres, NomIcone> = {
  mieux: 'mieux',
  pareil: 'pareil',
};
