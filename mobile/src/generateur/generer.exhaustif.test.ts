import { CONTEXTES } from '../catalogue/contextes';
import { EXERCICES } from '../catalogue/exercices';
import { DUREES, NIVEAUX, RESSENTIS } from '../catalogue/types';
import { respecteContraintes } from './filtres';
import { genererSeance } from './generer';

const GRAINES = [1, 2, 3, 42, 2026];

// 5 contextes × 4 ressentis × 3 durées × 3 niveaux = 180 combinaisons, chacune avec plusieurs graines.
describe('générateur sur le catalogue embarqué', () => {
  for (const contexte of CONTEXTES) {
    for (const ressenti of RESSENTIS) {
      for (const duree of DUREES) {
        for (const niveau of NIVEAUX) {
        it(`${contexte.id} + ${ressenti} + ${duree} min + niveau ${niveau}`, () => {
          for (const graine of GRAINES) {
            const seance = genererSeance(
              { contexteId: contexte.id, contraintes: contexte.contraintes, ressenti, duree, graine, niveau },
              EXERCICES,
            );
            expect(seance.niveau).toBe(niveau);

            expect(seance.blocs.length).toBeGreaterThan(0);
            const total = seance.blocs.reduce((somme, bloc) => somme + bloc.transitionS + bloc.effortS, 0);
            expect(total).toBe(duree * 60);

            for (const bloc of seance.blocs) {
              expect(respecteContraintes(bloc.exercice, contexte.contraintes)).toBe(true);
              expect(bloc.exercice.niveau).toBeLessThanOrEqual(niveau);
            }
            // Les phases calmes ne reçoivent jamais d'énergie : le catalogue embarqué a des exercices calmes partout.
            const coeurCalme = ressenti === 'raide' || ressenti === 'stresse';
            for (const bloc of seance.blocs) {
              if (bloc.phase !== 'coeur' || coeurCalme) {
                expect(bloc.exercice.effets.some((effet) => effet !== 'energie')).toBe(true);
              }
            }
            for (let i = 1; i < seance.blocs.length; i++) {
              expect(seance.blocs[i].exercice.id).not.toBe(seance.blocs[i - 1].exercice.id);
            }
          }
        });
        }
      }
    }
  }
});
