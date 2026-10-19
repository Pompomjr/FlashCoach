import { fusionner } from './fusion';
import { TAILLE_MAX_JOURNAL } from './journal';
import { fabriquerEntree } from '../test-utils/journal';

const le = (jour: number) => new Date(2026, 9, jour, 8).toISOString();

describe('fusionner', () => {
  it('réunit les deux journaux, du plus récent au plus ancien', () => {
    const locales = [fabriquerEntree({ id: 'b', debut: le(12) })];
    const distantes = [fabriquerEntree({ id: 'a', debut: le(10) }), fabriquerEntree({ id: 'c', debut: le(14) })];
    expect(fusionner(locales, distantes).map((e) => e.id)).toEqual(['c', 'b', 'a']);
  });

  it('garde la version du téléphone quand une séance existe des deux côtés', () => {
    const locale = fabriquerEntree({ id: 'x', apres: 'mieux' });
    const distante = fabriquerEntree({ id: 'x', apres: null });
    expect(fusionner([locale], [distante])).toEqual([locale]);
  });

  it(`ne garde que les ${TAILLE_MAX_JOURNAL} plus récentes`, () => {
    const distantes = Array.from({ length: TAILLE_MAX_JOURNAL + 5 }, (_, i) =>
      fabriquerEntree({ id: `d${i}`, debut: new Date(2026, 0, 1, 0, i).toISOString() }),
    );
    const resultat = fusionner([], distantes);
    expect(resultat).toHaveLength(TAILLE_MAX_JOURNAL);
    expect(resultat[0].id).toBe(`d${TAILLE_MAX_JOURNAL + 4}`);
  });
});
