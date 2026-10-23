import { CONTRAINTES_MAISON } from '../catalogue/contextes';
import { EXERCICES } from '../catalogue/exercices';
import { DUREES, NIVEAUX } from '../catalogue/types';
import { respecteContraintes } from './filtres';
import { genererSeance } from './generer';
import { OBJECTIFS_GENERES } from './types';

const GRAINES = [1, 2, 3, 42, 2026];

// 2 objectifs × 4 durées × 3 niveaux = 24 combinaisons, chacune avec plusieurs graines.
describe('générateur sur le catalogue embarqué', () => {
  for (const objectif of OBJECTIFS_GENERES) {
    for (const duree of DUREES) {
      for (const niveau of NIVEAUX) {
        it(`${objectif} + ${duree} min + niveau ${niveau}`, () => {
          for (const graine of GRAINES) {
            const seance = genererSeance({ objectif, duree, graine, niveau }, EXERCICES);
            expect(seance.niveau).toBe(niveau);
            expect(seance.objectif).toBe(objectif);

            expect(seance.blocs.length).toBeGreaterThan(0);
            const total = seance.blocs.reduce((somme, bloc) => somme + bloc.transitionS + bloc.effortS, 0);
            expect(total).toBe(duree * 60);
            expect(seance.dureeTotaleS).toBe(duree * 60);

            for (const bloc of seance.blocs) {
              expect(respecteContraintes(bloc.exercice, CONTRAINTES_MAISON)).toBe(true);
              expect(bloc.exercice.niveau).toBeLessThanOrEqual(niveau);
            }
            // Les phases calmes ne reçoivent jamais d'énergie : le catalogue embarqué a des exercices calmes partout.
            for (const bloc of seance.blocs) {
              if (bloc.phase !== 'coeur') {
                expect(bloc.exercice.effets.some((effet) => effet !== 'energie')).toBe(true);
              }
            }
            // Étirements : rien qui ne serve pas cet objectif, à aucune phase.
            if (objectif === 'etirements') {
              for (const bloc of seance.blocs) expect(bloc.exercice.objectifs).toContain('etirements');
            }
            for (let i = 1; i < seance.blocs.length; i++) {
              expect(seance.blocs[i].exercice.id).not.toBe(seance.blocs[i - 1].exercice.id);
            }
          }
        });
      }
    }
  }
});
