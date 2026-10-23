import type { Objectif, Ressenti } from '../../catalogue/types';
import type { Apres } from '../../journal/journal';
import type { NomIcone } from './traces';

// Objectif du départ → icône dessinée de sa carte (et des lignes du journal).
export const ICONE_OBJECTIF: Record<Objectif, NomIcone> = {
  calories: 'flamme',
  masse: 'muscle',
  etirements: 'etirement',
};

// Anciennes entrées du journal : id de contexte du catalogue → icône. Un contexte sans entrée s'affiche sans icône.
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
