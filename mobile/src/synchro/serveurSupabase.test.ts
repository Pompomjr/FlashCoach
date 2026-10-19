import { fabriquerEntree } from '../test-utils/journal';
import { depuisLigne, versLigne } from './serveurSupabase';

describe('conversion séance ↔ ligne', () => {
  it('fait l’aller-retour sans perte', () => {
    const entree = fabriquerEntree({ apres: 'mieux' });
    expect(depuisLigne(versLigne(entree))).toEqual(entree);
  });

  it('normalise la date renvoyée par Postgres', () => {
    const entree = fabriquerEntree();
    const ligne = { ...versLigne(entree), debut: entree.debut.replace('Z', '+00:00') };
    expect(depuisLigne(ligne)?.debut).toBe(entree.debut);
  });

  it('ignore une ligne invalide', () => {
    expect(depuisLigne({ ...versLigne(fabriquerEntree()), duree: 7 })).toBeNull();
    expect(depuisLigne(null)).toBeNull();
    expect(depuisLigne({ ...versLigne(fabriquerEntree()), debut: 'pas une date' })).toBeNull();
  });
});
