import type { Contexte } from './types';

export const CONTEXTES: Contexte[] = [
  {
    id: 'reveil',
    nom: 'Au réveil',
    emoji: '🛏️',
    premium: false,
    ordre: 1,
    // En pyjama : tenue souple, mais petit espace et silence (la maison dort encore).
    contraintes: { tenue: 'sport', bruit: 'silencieux', espace: 'sur_place', sol: true },
  },
  {
    id: 'maison',
    nom: 'À la maison',
    emoji: '🏠',
    premium: false,
    ordre: 2,
    contraintes: { tenue: 'sport', bruit: 'normal', espace: 'un_peu', sol: true },
  },
  {
    id: 'bureau',
    nom: 'Au bureau',
    emoji: '💼',
    premium: true,
    ordre: 3,
    contraintes: { tenue: 'ville', bruit: 'silencieux', espace: 'sur_place', sol: false },
  },
  {
    id: 'voyage',
    nom: 'En voyage',
    emoji: '🧳',
    premium: true,
    ordre: 4,
    contraintes: { tenue: 'sport', bruit: 'silencieux', espace: 'sur_place', sol: true },
  },
  {
    id: 'dehors',
    nom: 'Dehors',
    emoji: '🌳',
    premium: true,
    ordre: 5,
    contraintes: { tenue: 'sport', bruit: 'normal', espace: 'un_peu', sol: false },
  },
];
