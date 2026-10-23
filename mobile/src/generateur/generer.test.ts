import { CONTRAINTES_MAISON } from '../catalogue/contextes';
import { EXERCICES } from '../catalogue/exercices';
import type { Exercice, Niveau, Zone } from '../catalogue/types';
import { fabriquerExercice } from '../test-utils/fabrique';
import { genererSeance } from './generer';
import type { ParametresSeance, Seance } from './types';

const MOBILITE = [
  fabriquerExercice({ id: 'mob-1', effets: ['mobilite'], intensite: 1, zone: 'haut' }),
  fabriquerExercice({ id: 'mob-2', effets: ['mobilite'], intensite: 1, zone: 'bas' }),
];
const DETENTE = [
  fabriquerExercice({ id: 'det-1', effets: ['detente'], intensite: 1, zone: 'global' }),
  fabriquerExercice({ id: 'det-2', effets: ['detente'], intensite: 1, zone: 'tronc' }),
];
// Cardio (objectif « calories » par défaut de la fabrique).
const ENERGIE = [
  fabriquerExercice({ id: 'ene-1', effets: ['energie'], intensite: 2, zone: 'haut' }),
  fabriquerExercice({ id: 'ene-2', effets: ['energie'], intensite: 2, zone: 'bas' }),
  fabriquerExercice({ id: 'ene-3', effets: ['energie'], intensite: 2, zone: 'tronc' }),
  fabriquerExercice({ id: 'ene-4', effets: ['energie'], intensite: 2, zone: 'global' }),
  fabriquerExercice({ id: 'ene-5', effets: ['energie'], intensite: 2, zone: 'haut' }),
];
const CATALOGUE: Exercice[] = [...MOBILITE, ...DETENTE, ...ENERGIE];
const ZONES: Zone[] = ['haut', 'bas', 'tronc', 'global'];

function parametres(surcharge: Partial<ParametresSeance> = {}): ParametresSeance {
  return { objectif: 'calories', duree: 5, graine: 1, ...surcharge };
}

function ids(seance: Seance): string[] {
  return seance.blocs.map((bloc) => bloc.exercice.id);
}

describe('genererSeance', () => {
  it('suit la structure de 5 minutes', () => {
    const seance = genererSeance(parametres(), CATALOGUE);
    expect(seance.blocs.map((bloc) => bloc.phase)).toEqual([
      'mise_en_route',
      'mise_en_route',
      'coeur',
      'coeur',
      'coeur',
      'coeur',
      'retour_au_calme',
      'retour_au_calme',
    ]);
    expect(seance.dureeTotaleS).toBe(300);
  });

  it('recopie les paramètres dans la séance, avec les contraintes fixes « maison »', () => {
    const seance = genererSeance(parametres({ objectif: 'etirements', duree: 10, graine: 9 }), [
      ...CATALOGUE,
      ...Array.from({ length: 8 }, (_, i) => fabriquerExercice({ id: `eti-${i}`, effets: ['mobilite'], intensite: 2 })),
    ]);
    expect(seance).toMatchObject({ objectif: 'etirements', duree: 10, graine: 9, contraintes: CONTRAINTES_MAISON });
  });

  it('met en route en mobilité et termine en détente', () => {
    const seance = genererSeance(parametres(), CATALOGUE);
    for (const bloc of seance.blocs) {
      if (bloc.phase === 'mise_en_route') expect(bloc.exercice.effets).toContain('mobilite');
      if (bloc.phase === 'retour_au_calme') expect(bloc.exercice.effets).toContain('detente');
    }
  });

  it('oriente le cœur vers l’objectif « calories », intensité 1-2 en Léger', () => {
    const coeur = genererSeance(parametres(), CATALOGUE).blocs.filter((b) => b.phase === 'coeur');
    for (const bloc of coeur) {
      expect(bloc.exercice.objectifs).toContain('calories');
      expect(bloc.exercice.intensite).toBeLessThanOrEqual(2);
    }
  });

  it('ne prend pas de renforcement pour les calories quand le cardio suffit', () => {
    const renfo = ENERGIE.map((ex) => ({ ...ex, id: `renfo-${ex.id}`, objectifs: ['masse' as const] }));
    for (let graine = 1; graine <= 20; graine++) {
      const seance = genererSeance(parametres({ graine }), [...CATALOGUE, ...renfo]);
      expect(ids(seance).some((id) => id.startsWith('renfo-'))).toBe(false);
    }
  });

  it('ne répète aucun exercice quand le catalogue suffit', () => {
    const seance = genererSeance(parametres(), CATALOGUE);
    expect(new Set(ids(seance)).size).toBe(seance.blocs.length);
    expect(seance.assouplissement).toBe(0);
  });

  it('est reproductible avec la même graine', () => {
    expect(ids(genererSeance(parametres({ graine: 123 }), CATALOGUE))).toEqual(
      ids(genererSeance(parametres({ graine: 123 }), CATALOGUE)),
    );
  });

  it("évite les exercices de la séance précédente quand c'est possible", () => {
    for (let graine = 1; graine <= 20; graine++) {
      expect(ids(genererSeance(parametres({ graine, exclure: ['ene-1'] }), CATALOGUE))).not.toContain('ene-1');
    }
  });

  it('alterne les zones du corps dans le cœur', () => {
    for (let graine = 1; graine <= 20; graine++) {
      const coeur = genererSeance(parametres({ graine }), CATALOGUE).blocs.filter((b) => b.phase === 'coeur');
      for (let i = 1; i < coeur.length; i++) {
        expect(coeur[i].exercice.zone).not.toBe(coeur[i - 1].exercice.zone);
      }
    }
  });

  it("assouplit d'abord l'intensité vers le bas, en gardant l'objectif", () => {
    // Lourd vise l'intensité 3 : faute de cardio à 3, il prend des cardios à 2.
    const seance = genererSeance(parametres({ niveau: 3 }), CATALOGUE);
    expect(seance.assouplissement).toBe(1);
    for (const bloc of seance.blocs.filter((b) => b.phase === 'coeur')) {
      expect(bloc.exercice.objectifs).toContain('calories');
      expect(bloc.exercice.intensite).toBe(2);
    }
  });

  it('ne monte jamais au-dessus de l’intensité choisie : il répète un cardio plutôt, sans le refaire deux fois de suite', () => {
    const intenses = ENERGIE.slice(0, 4).map((ex) => ({ ...ex, intensite: 3 as const }));
    const doux = [
      fabriquerExercice({ id: 'doux-1', effets: ['energie'], intensite: 2, zone: 'bas' }),
      fabriquerExercice({ id: 'doux-2', effets: ['energie'], intensite: 1, zone: 'haut' }),
    ];
    const renfo = fabriquerExercice({ id: 'renfo', effets: ['energie'], objectifs: ['masse'], intensite: 2 });
    for (let graine = 1; graine <= 20; graine++) {
      const seance = genererSeance(parametres({ graine }), [...MOBILITE, ...DETENTE, ...intenses, ...doux, renfo]);
      const coeur = seance.blocs.filter((b) => b.phase === 'coeur').map((b) => b.exercice.id);
      expect([...coeur].sort()).toEqual(['doux-1', 'doux-1', 'doux-2', 'doux-2']);
      for (let i = 1; i < coeur.length; i++) expect(coeur[i]).not.toBe(coeur[i - 1]);
      expect(seance.assouplissement).toBe(3);
    }
  });

  it('remplit la durée en répétant quand le catalogue est trop petit', () => {
    const seance = genererSeance(parametres(), [ENERGIE[0], ENERGIE[1], MOBILITE[0], DETENTE[0]]);
    expect(seance.assouplissement).toBe(3);
    expect(seance.dureeTotaleS).toBe(300);
    expect(seance.blocs.filter((b) => b.phase === 'coeur').map((b) => b.exercice.id)).toEqual(
      expect.arrayContaining(['ene-1', 'ene-2']),
    );
  });

  it('ne dépasse l’intensité qu’en tout dernier recours, quand aucun exercice n’est assez doux', () => {
    const intenses = ENERGIE.map((ex) => ({ ...ex, intensite: 3 as const }));
    const seance = genererSeance(parametres(), intenses);
    expect(seance.assouplissement).toBe(4);
    expect(seance.dureeTotaleS).toBe(300);
  });

  it("ne fait jamais deux fois de suite le même exercice, même en répétant", () => {
    const seance = genererSeance(parametres({ duree: 10 }), [MOBILITE[0], DETENTE[0]]);
    const suite = ids(seance);
    for (let i = 1; i < suite.length; i++) {
      expect(suite[i]).not.toBe(suite[i - 1]);
    }
  });

  it("lève une erreur quand aucun exercice ne sert l'objectif à ce niveau", () => {
    expect(() => genererSeance(parametres({ objectif: 'etirements' }), ENERGIE)).toThrow(
      'Aucun exercice compatible avec l’objectif etirements au niveau 1',
    );
    const costauds = ENERGIE.map((ex) => ({ ...ex, niveau: 3 as const }));
    expect(() => genererSeance(parametres({ niveau: 2 }), costauds)).toThrow(
      'Aucun exercice compatible avec l’objectif calories au niveau 2',
    );
  });
});

describe('genererSeance : 15 et 30 minutes en tours', () => {
  // Assez pour 30 min sans répétition : 6 mises en route, 5 postes de cœur, 5 retours au calme.
  const GRAND: Exercice[] = [
    ...Array.from({ length: 6 }, (_, i) => fabriquerExercice({ id: `mob-${i}`, effets: ['mobilite'], intensite: 1, zone: ZONES[i % 4] })),
    ...Array.from({ length: 5 }, (_, i) => fabriquerExercice({ id: `det-${i}`, effets: ['detente'], intensite: 1, zone: ZONES[i % 4] })),
    ...Array.from({ length: 5 }, (_, i) => fabriquerExercice({ id: `ene-${i}`, effets: ['energie'], intensite: 2, zone: ZONES[i % 4] })),
  ];

  it.each([
    [15, 900, 2],
    [30, 1800, 4],
  ] as const)('%i min : %i s exactement, %i tours du même cœur de 5 postes', (duree, totalS, tours) => {
    for (let graine = 1; graine <= 10; graine++) {
      const seance = genererSeance(parametres({ duree, graine }), GRAND);
      expect(seance.dureeTotaleS).toBe(totalS);
      expect(seance.blocs.reduce((s, b) => s + b.transitionS + b.effortS, 0)).toBe(totalS);
      expect(seance.assouplissement).toBe(0);
      const coeur = seance.blocs.filter((b) => b.phase === 'coeur');
      expect(coeur).toHaveLength(5 * tours);
      const premierTour = coeur.slice(0, 5).map((b) => b.exercice.id);
      expect(new Set(premierTour).size).toBe(5);
      for (let numero = 1; numero <= tours; numero++) {
        const tour = coeur.slice((numero - 1) * 5, numero * 5);
        expect(tour.map((b) => b.exercice.id)).toEqual(premierTour);
        expect(tour.map((b) => b.tour)).toEqual(Array(5).fill({ numero, total: tours }));
        // Le repos de 1 min précède le premier poste des tours 2 et suivants, dans sa transition.
        expect(tour.map((b) => b.transitionS)).toEqual([numero > 1 ? 70 : 10, 10, 10, 10, 10]);
        expect(tour.every((b) => b.effortS === 45)).toBe(true);
      }
      for (const bloc of seance.blocs.filter((b) => b.phase !== 'coeur')) {
        expect(bloc.tour).toBeUndefined();
      }
      const suite = ids(seance);
      for (let i = 1; i < suite.length; i++) expect(suite[i]).not.toBe(suite[i - 1]);
    }
  });

  it('ne met pas de tour sur les séances de 5 et 10 minutes', () => {
    for (const duree of [5, 10] as const) {
      const seance = genererSeance(parametres({ duree }), [...GRAND, ...ENERGIE]);
      expect(seance.blocs.every((b) => b.tour === undefined)).toBe(true);
    }
  });
});

describe('genererSeance : étirements et phases calmes', () => {
  it('garde pour le retour au calme l’exercice mobilité + détente', () => {
    const catalogue = [
      fabriquerExercice({ id: 'mob-haut', effets: ['mobilite'], intensite: 1, zone: 'haut' }),
      fabriquerExercice({ id: 'mob-bas', effets: ['mobilite'], intensite: 1, zone: 'bas' }),
      fabriquerExercice({ id: 'mob-det', effets: ['mobilite', 'detente'], intensite: 1, zone: 'tronc' }),
      fabriquerExercice({ id: 'det', effets: ['detente'], intensite: 1, zone: 'global' }),
      ...ENERGIE,
    ];
    for (let graine = 1; graine <= 50; graine++) {
      const seance = genererSeance(parametres({ graine }), catalogue);
      expect(seance.assouplissement).toBe(0);
      const retour = seance.blocs.filter((b) => b.phase === 'retour_au_calme').map((b) => b.exercice.id);
      expect(retour.sort()).toEqual(['det', 'mob-det']);
    }
  });

  it('oriente le cœur vers les étirements pour l’objectif « étirements »', () => {
    const mobilites = ZONES.concat(ZONES.slice(0, 2)).map((zone, i) =>
      fabriquerExercice({ id: `mob-${i}`, effets: ['mobilite'], intensite: 1, zone }),
    );
    const seance = genererSeance(parametres({ objectif: 'etirements' }), [...mobilites, ...DETENTE, ...ENERGIE]);
    expect(seance.assouplissement).toBe(0);
    for (const bloc of seance.blocs) {
      expect(bloc.exercice.objectifs).toContain('etirements');
    }
  });

  it('n’utilise jamais d’exercice hors étirements, même en dernier recours : il répète plutôt', () => {
    for (let graine = 1; graine <= 20; graine++) {
      for (const niveau of [1, 2, 3] as const) {
        const seance = genererSeance(parametres({ graine, niveau, objectif: 'etirements' }), [MOBILITE[0], DETENTE[0], ...ENERGIE]);
        for (const bloc of seance.blocs) {
          expect(bloc.exercice.objectifs).toEqual(['etirements']);
        }
        expect(seance.assouplissement).toBe(3);
      }
    }
  });

  it('garde en étirements un exercice d’énergie étiqueté étirements (bird-dog)', () => {
    const birdDog = fabriquerExercice({ id: 'bird-dog', effets: ['mobilite', 'energie'], objectifs: ['masse', 'etirements'], intensite: 1 });
    const seance = genererSeance(parametres({ objectif: 'etirements' }), [birdDog]);
    expect(ids(seance).every((id) => id === 'bird-dog')).toBe(true);
  });

  it('ne prend pas en mise en route l’exercice dont le retour au calme a besoin', () => {
    // Seule séance idéale de 5 min : mise en route m0 + m1, cœur c0 à c3, retour au calme x + d0.
    // x (mobilité + détente) est idéal pour la mise en route et pour le cœur, mais le retour au calme n'a que x et d0.
    const catalogue = [
      fabriquerExercice({ id: 'm0', effets: ['mobilite'], intensite: 1 }),
      fabriquerExercice({ id: 'm1', effets: ['mobilite'], intensite: 1 }),
      fabriquerExercice({ id: 'x', effets: ['mobilite', 'detente'], intensite: 1 }),
      fabriquerExercice({ id: 'd0', effets: ['detente'], intensite: 1 }),
      ...Array.from({ length: 4 }, (_, i) => fabriquerExercice({ id: `c${i}`, effets: ['mobilite'], intensite: 2 })),
    ];
    for (let graine = 1; graine <= 50; graine++) {
      const seance = genererSeance(parametres({ graine, objectif: 'etirements' }), catalogue);
      expect(seance.assouplissement).toBe(0);
      expect(ids(seance).slice(0, 2).sort()).toEqual(['m0', 'm1']);
      expect(ids(seance).slice(6).sort()).toEqual(['d0', 'x']);
    }
  });

  it('n’utilise l’énergie dans une phase calme qu’en dernier recours', () => {
    const seance = genererSeance(parametres(), ENERGIE);
    expect(seance.assouplissement).toBe(4);
    expect(seance.dureeTotaleS).toBe(300);
  });
});

describe('genererSeance : niveau', () => {
  const au = (niveau: Niveau, exercices: Exercice[]) => exercices.map((ex) => ({ ...ex, niveau }));

  it('sans niveau, la séance est celle du niveau 1', () => {
    const catalogue = [...MOBILITE, ...DETENTE, ...ENERGIE.slice(0, 2), ...au(2, ENERGIE.slice(2))];
    for (let graine = 1; graine <= 20; graine++) {
      const sans = genererSeance(parametres({ graine }), catalogue);
      const un = genererSeance(parametres({ graine, niveau: 1 }), catalogue);
      expect(sans.niveau).toBe(1);
      expect(un.niveau).toBe(1);
      expect(ids(sans)).toEqual(ids(un));
    }
  });

  it('recopie le niveau demandé dans la séance', () => {
    expect(genererSeance(parametres({ niveau: 3 }), CATALOGUE).niveau).toBe(3);
  });

  it('au niveau 1, n’utilise jamais un exercice de niveau 2, même quand il serait le seul idéal', () => {
    const catalogue = [...MOBILITE, ...DETENTE, ...au(2, ENERGIE)];
    for (let graine = 1; graine <= 20; graine++) {
      const seance = genererSeance(parametres({ graine, niveau: 1 }), catalogue);
      expect(seance.blocs.every((bloc) => bloc.exercice.niveau === 1)).toBe(true);
      expect(seance.assouplissement).toBeGreaterThan(0);
    }
  });

  it('au niveau 2, préfère à un exercice de niveau 1 un exercice de niveau 2 également idéal', () => {
    const catalogue = [...MOBILITE, ...DETENTE, ...au(1, ENERGIE.slice(1)), ...au(2, ENERGIE.slice(0, 1))];
    for (let graine = 1; graine <= 30; graine++) {
      const seance = genererSeance(parametres({ graine, niveau: 2 }), catalogue);
      expect(ids(seance)).toContain('ene-1');
      expect(seance.assouplissement).toBe(0);
    }
  });

  it('au niveau 3 sans exercice de niveau 3, se construit avec des niveaux ≤ 2', () => {
    const forts = au(2, ENERGIE).map((ex) => ({ ...ex, intensite: 3 as const }));
    const seance = genererSeance(parametres({ niveau: 3 }), [...MOBILITE, ...DETENTE, ...forts]);
    expect(seance.niveau).toBe(3);
    expect(seance.blocs.every((bloc) => bloc.exercice.niveau <= 2)).toBe(true);
    expect(seance.assouplissement).toBe(0);
  });

  it('n’exprime aucune préférence de niveau en mise en route et en retour au calme', () => {
    const mobilites = [
      fabriquerExercice({ id: 'mob-a', effets: ['mobilite'], intensite: 1, zone: 'haut' }),
      ...au(3, [
        fabriquerExercice({ id: 'mob-b', effets: ['mobilite'], intensite: 1, zone: 'bas' }),
        fabriquerExercice({ id: 'mob-c', effets: ['mobilite'], intensite: 1, zone: 'tronc' }),
      ]),
    ];
    const detentes = [
      fabriquerExercice({ id: 'det-a', effets: ['detente'], intensite: 1, zone: 'haut' }),
      ...au(3, [
        fabriquerExercice({ id: 'det-b', effets: ['detente'], intensite: 1, zone: 'bas' }),
        fabriquerExercice({ id: 'det-c', effets: ['detente'], intensite: 1, zone: 'tronc' }),
      ]),
    ];
    const catalogue = [...mobilites, ...detentes, ...au(3, ENERGIE)];
    const choisis = new Set<string>();
    for (let graine = 1; graine <= 40; graine++) {
      const seance = genererSeance(parametres({ graine, niveau: 3 }), catalogue);
      for (const bloc of seance.blocs) if (bloc.phase !== 'coeur') choisis.add(bloc.exercice.id);
    }
    expect(choisis.has('mob-a')).toBe(true);
    expect(choisis.has('det-a')).toBe(true);
  });
});

describe('genererSeance : préférence de niveau', () => {
  const energies = (prefixe: string, nombre: number, niveau: Niveau) =>
    Array.from({ length: nombre }, (_, i) =>
      fabriquerExercice({ id: `${prefixe}-${i}`, effets: ['energie'], intensite: 3, zone: ZONES[i % ZONES.length], niveau }),
    );
  // Cœur de 5 minutes : 4 places, 8 exercices de cardio d'intensité 3, tous également idéaux en Moyen et en Lourd.
  const catalogue = [...MOBILITE, ...DETENTE, ...energies('un', 4, 1), ...energies('deux', 2, 2), ...energies('trois', 2, 3)];
  const niveauxDuCoeur = (seance: Seance) =>
    seance.blocs
      .filter((bloc) => bloc.phase === 'coeur')
      .map((bloc) => bloc.exercice.niveau)
      .sort();

  it('au niveau 3, prend d’abord le niveau 3, puis le niveau 2, avant le niveau 1', () => {
    for (let graine = 1; graine <= 30; graine++) {
      const seance = genererSeance(parametres({ graine, niveau: 3 }), catalogue);
      expect(seance.assouplissement).toBe(0);
      expect(niveauxDuCoeur(seance)).toEqual([2, 2, 3, 3]);
    }
  });

  it('au niveau 2, écarte le niveau 3 et prend d’abord le niveau 2, avant le niveau 1', () => {
    for (let graine = 1; graine <= 30; graine++) {
      const seance = genererSeance(parametres({ graine, niveau: 2 }), catalogue);
      expect(seance.assouplissement).toBe(0);
      expect(niveauxDuCoeur(seance)).toEqual([1, 1, 2, 2]);
    }
  });
});

// Promesse de l'intensité sur le catalogue embarqué : « Brûler des calories » en 5 minutes.
describe('genererSeance : intensité sur le catalogue embarqué', () => {
  const coeur = (niveau: Niveau, graine: number) =>
    genererSeance({ objectif: 'calories', duree: 5, graine, niveau }, EXERCICES).blocs.filter((b) => b.phase === 'coeur');

  it('Léger : cœur de cardio d’intensité 1-2, entièrement de niveau 1', () => {
    for (let graine = 1; graine <= 30; graine++) {
      for (const bloc of coeur(1, graine)) {
        expect(bloc.exercice.objectifs).toContain('calories');
        expect(bloc.exercice.niveau).toBe(1);
        expect(bloc.exercice.intensite).toBeLessThanOrEqual(2);
      }
    }
  });

  it('Moyen : cœur de cardio d’intensité 2-3, avec les 3 exercices de niveau 2 du cardio', () => {
    for (let graine = 1; graine <= 30; graine++) {
      const blocs = coeur(2, graine);
      expect(blocs.every((b) => b.exercice.objectifs.includes('calories') && b.exercice.intensite >= 2)).toBe(true);
      expect(blocs.map((b) => b.exercice.niveau).sort()).toEqual([1, 2, 2, 2]);
    }
  });

  it('Lourd : cœur de cardio entièrement d’intensité 3, dont les 2 exercices de niveau 3 du cardio', () => {
    for (let graine = 1; graine <= 30; graine++) {
      const blocs = coeur(3, graine);
      expect(blocs.map((b) => b.exercice.intensite)).toEqual([3, 3, 3, 3]);
      expect(blocs.map((b) => b.exercice.niveau).sort()).toEqual([2, 2, 3, 3]);
    }
  });
});
