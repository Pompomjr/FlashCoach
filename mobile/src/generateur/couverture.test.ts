import { CONTEXTES } from '../catalogue/contextes';
import { EXERCICES } from '../catalogue/exercices';
import { DUREES, RESSENTIS, type Contexte, type Exercice } from '../catalogue/types';
import { fabriquerExercice, SANS_CONTRAINTE } from '../test-utils/fabrique';
import { analyserCouverture, formaterRapport, type Manque } from './couverture';
import { genererSeance } from './generer';

const LIBRE: Contexte = { id: 'libre', nom: 'Libre', emoji: '✨', premium: false, ordre: 1, contraintes: SANS_CONTRAINTE };
const SILENCE: Contexte = { ...LIBRE, id: 'silence', contraintes: { ...SANS_CONTRAINTE, bruit: 'silencieux' } };

function serie(prefixe: string, nombre: number, surcharge: Partial<Exercice>): Exercice[] {
  return Array.from({ length: nombre }, (_, i) => fabriquerExercice({ id: `${prefixe}-${i}`, ...surcharge }));
}
// Assez pour toutes les phases et tous les ressentis, même en 10 minutes : 3 mises en route + 8 cœurs « raide »,
// 8 cœurs « stresse » + 2 retours au calme, 8 cœurs d'énergie.
const COMPLET: Exercice[] = [
  ...serie('mob', 11, { effets: ['mobilite'], intensite: 1 }),
  ...serie('det', 10, { effets: ['detente'], intensite: 1 }),
  ...serie('ene', 8, { effets: ['energie'], intensite: 2 }),
];
const sans = (prefixe: string) => COMPLET.filter((ex) => !ex.id.startsWith(`${prefixe}-`));

const GRAINES = [1, 2, 3, 42, 2026];

describe('analyserCouverture', () => {
  it('ne signale rien quand le catalogue suffit partout', () => {
    expect(analyserCouverture(COMPLET, [LIBRE])).toEqual([]);
  });

  it('ne compte pas deux fois un exercice que se disputent le cœur « stresse » et le retour au calme', () => {
    // 9 exercices de détente : assez pour chaque phase prise seule (8 et 2), pas pour les deux ensemble (10).
    const catalogue = [...sans('det'), ...serie('det', 9, { effets: ['detente'], intensite: 1 })];
    expect(analyserCouverture(catalogue, [LIBRE])).toEqual([
      {
        contexteId: 'libre',
        ressenti: 'stresse',
        duree: 10,
        phase: 'retour_au_calme',
        cible: { effet: 'detente', intensiteMin: 1, intensiteMax: 1 },
        disponibles: 1,
        besoin: 2,
      },
    ]);
  });

  it('ne compte pas deux fois un exercice que se disputent la mise en route et le cœur « raide »', () => {
    // 2 exercices de mobilité en intensité 1 : la mise en route de 3 min en prend un, le cœur n'en a plus qu'un.
    const catalogue = [...sans('mob'), ...serie('mob', 2, { effets: ['mobilite'], intensite: 1 })];
    const raide3 = analyserCouverture(catalogue, [LIBRE]).filter((m) => m.ressenti === 'raide' && m.duree === 3);
    expect(raide3.map((m) => [m.phase, m.disponibles, m.besoin])).toEqual([['coeur', 1, 2]]);
  });

  it('signale le cœur seulement pour le ressenti qui manque, et seulement aux durées concernées', () => {
    // 4 exercices d'énergie en intensité 1 et 4 en intensité 2 : 8 pour « mou » (1-2),
    // mais seulement 4 pour « en forme » (2-3), alors qu'il en faut 8 en 10 min.
    const catalogue = [
      ...sans('ene'),
      ...serie('ene', 4, { effets: ['energie'], intensite: 1 }),
      ...serie('fort', 4, { effets: ['energie'], intensite: 2 }),
    ];
    const manques = analyserCouverture(catalogue, [LIBRE]);
    expect(manques.map((m) => [m.ressenti, m.phase, m.duree, m.disponibles, m.besoin])).toEqual([
      ['en_forme', 'coeur', 10, 4, 8],
    ]);
  });

  it('signale toutes les places d’un contexte sans aucun exercice compatible, sans planter', () => {
    const saut = fabriquerExercice({ id: 'saut', sauts: true });
    const manques = analyserCouverture([saut], [SILENCE]);
    expect(manques).toHaveLength(RESSENTIS.length * DUREES.length * 3);
    expect(manques.every((m) => m.disponibles === 0)).toBe(true);
  });

  it('ne dépend d’aucun tirage : l’ordre du catalogue ne change rien', () => {
    expect(analyserCouverture([...EXERCICES].reverse(), CONTEXTES)).toEqual(analyserCouverture(EXERCICES, CONTEXTES));
  });

  it('trouve le manque du bureau pour « mou » dans le catalogue embarqué', () => {
    const rapport = formaterRapport(analyserCouverture(EXERCICES, CONTEXTES));
    expect(rapport).toContain(
      '- bureau + mou, cœur (énergie, intensité 1-2) : 1 disponible(s), il en faut 2 en 3 min, 4 en 5 min, 8 en 10 min',
    );
  });

  it('signale reveil + raide en 3 min, où chaque phase prise seule semble suffire', () => {
    const manques = analyserCouverture(EXERCICES, CONTEXTES);
    expect(manques.some((m) => m.contexteId === 'reveil' && m.ressenti === 'raide' && m.duree === 3)).toBe(true);
  });
});

// Le rapport et le générateur doivent dire la même chose : sans manque signalé, aucune séance n'assouplit.
// Limite connue : le générateur choisit phase par phase sans retour arrière, et peut encore assouplir sur certains
// catalogues pourtant couverts (ex. 3 min « raide » : mob/1, det/1, mob+det+ene/2, mob+det+ene/1, mob+ene/2,
// où la mise en route prend l'exercice mixte d'intensité 1 dont le retour au calme avait besoin).
describe('couverture et générateur', () => {
  // Renvoie le nombre de combinaisons sans manque, donc vérifiées.
  function verifier(catalogue: Exercice[], contextes: Contexte[]): number {
    const manques = analyserCouverture(catalogue, contextes);
    let verifiees = 0;
    for (const contexte of contextes) {
      for (const ressenti of RESSENTIS) {
        for (const duree of DUREES) {
          const signale = manques.some((m) => m.contexteId === contexte.id && m.ressenti === ressenti && m.duree === duree);
          if (signale) continue;
          for (const graine of GRAINES) {
            const seance = genererSeance(
              { contexteId: contexte.id, contraintes: contexte.contraintes, ressenti, duree, graine },
              catalogue,
            );
            expect({ contexte: contexte.id, ressenti, duree, graine, niveau: seance.assouplissement }).toEqual({
              contexte: contexte.id,
              ressenti,
              duree,
              graine,
              niveau: 0,
            });
          }
          verifiees++;
        }
      }
    }
    return verifiees;
  }

  it('sur le catalogue embarqué', () => {
    expect(verifier(EXERCICES, CONTEXTES)).toBeGreaterThan(0);
  });

  it('sur un catalogue complet', () => {
    expect(verifier(COMPLET, [LIBRE])).toBe(RESSENTIS.length * DUREES.length);
  });

  it('à la limite, quand mise en route, cœur « raide » et retour au calme se disputent les mêmes exercices', () => {
    // Exactement de quoi remplir 10 min « raide » : 3 + 8 places de mobilité, 2 de détente, dont des exercices mixtes.
    const catalogue = [
      ...serie('mob1', 3, { effets: ['mobilite'], intensite: 1 }),
      ...serie('mob2', 6, { effets: ['mobilite'], intensite: 2 }),
      ...serie('mixte', 3, { effets: ['mobilite', 'detente'], intensite: 1 }),
      ...serie('det', 1, { effets: ['detente'], intensite: 1 }),
      ...serie('ene', 8, { effets: ['energie'], intensite: 2 }),
    ];
    const manques = analyserCouverture(catalogue, [LIBRE]);
    expect(manques.some((m) => m.ressenti === 'raide' && m.duree === 10)).toBe(false);
    expect(verifier(catalogue, [LIBRE])).toBeGreaterThan(0);
  });
});

describe('formaterRapport', () => {
  it('annonce un catalogue complet', () => {
    expect(formaterRapport([])).toBe('Catalogue complet : toutes les combinaisons sont idéales.');
  });

  it('regroupe les durées d’une même phase quand elles ont autant d’exercices disponibles', () => {
    const coeur = { effet: 'energie', intensiteMin: 1, intensiteMax: 2 } as const;
    const retour = { effet: 'detente', intensiteMin: 1, intensiteMax: 1 } as const;
    const manques: Manque[] = [
      { contexteId: 'bureau', ressenti: 'mou', duree: 3, phase: 'coeur', cible: coeur, disponibles: 1, besoin: 2 },
      { contexteId: 'bureau', ressenti: 'mou', duree: 5, phase: 'coeur', cible: coeur, disponibles: 1, besoin: 4 },
      { contexteId: 'bureau', ressenti: 'mou', duree: 10, phase: 'coeur', cible: coeur, disponibles: 0, besoin: 8 },
      { contexteId: 'bureau', ressenti: 'mou', duree: 10, phase: 'retour_au_calme', cible: retour, disponibles: 1, besoin: 2 },
    ];
    expect(formaterRapport(manques)).toBe(
      [
        '3 manque(s) à combler :',
        '- bureau + mou, cœur (énergie, intensité 1-2) : 1 disponible(s), il en faut 2 en 3 min, 4 en 5 min',
        '- bureau + mou, cœur (énergie, intensité 1-2) : 0 disponible(s), il en faut 8 en 10 min',
        '- bureau + mou, retour au calme (détente, intensité 1) : 1 disponible(s), il en faut 2 en 10 min',
      ].join('\n'),
    );
  });
});
