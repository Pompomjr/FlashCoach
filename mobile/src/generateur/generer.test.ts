import type { Contraintes, Exercice, Niveau, Zone } from '../catalogue/types';
import { fabriquerExercice, SANS_CONTRAINTE } from '../test-utils/fabrique';
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
const ENERGIE = [
  fabriquerExercice({ id: 'ene-1', effets: ['energie'], intensite: 2, zone: 'haut' }),
  fabriquerExercice({ id: 'ene-2', effets: ['energie'], intensite: 2, zone: 'bas' }),
  fabriquerExercice({ id: 'ene-3', effets: ['energie'], intensite: 2, zone: 'tronc' }),
  fabriquerExercice({ id: 'ene-4', effets: ['energie'], intensite: 2, zone: 'global' }),
  fabriquerExercice({ id: 'ene-5', effets: ['energie'], intensite: 2, zone: 'haut' }),
];
const CATALOGUE: Exercice[] = [...MOBILITE, ...DETENTE, ...ENERGIE];
const SILENCIEUX: Contraintes = { ...SANS_CONTRAINTE, bruit: 'silencieux' };
const ZONES: Zone[] = ['haut', 'bas', 'tronc', 'global'];

function parametres(surcharge: Partial<ParametresSeance> = {}): ParametresSeance {
  return { contexteId: 'test', contraintes: SANS_CONTRAINTE, ressenti: 'mou', duree: 5, graine: 1, ...surcharge };
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

  it('recopie les paramètres dans la séance', () => {
    const seance = genererSeance(parametres({ contexteId: 'maison', ressenti: 'raide', duree: 3, graine: 9 }), CATALOGUE);
    expect(seance).toMatchObject({ contexteId: 'maison', ressenti: 'raide', duree: 3, graine: 9, contraintes: SANS_CONTRAINTE });
  });

  it('met en route en mobilité et termine en détente', () => {
    const seance = genererSeance(parametres(), CATALOGUE);
    for (const bloc of seance.blocs) {
      if (bloc.phase === 'mise_en_route') expect(bloc.exercice.effets).toContain('mobilite');
      if (bloc.phase === 'retour_au_calme') expect(bloc.exercice.effets).toContain('detente');
    }
  });

  it('oriente le cœur selon le ressenti', () => {
    const coeur = genererSeance(parametres({ ressenti: 'mou' }), CATALOGUE).blocs.filter((b) => b.phase === 'coeur');
    for (const bloc of coeur) {
      expect(bloc.exercice.effets).toContain('energie');
      expect(bloc.exercice.intensite).toBeLessThanOrEqual(2);
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

  it("assouplit d'abord l'intensité, en gardant l'effet", () => {
    const intenses = ENERGIE.slice(0, 4).map((ex) => ({ ...ex, intensite: 3 as const }));
    const seance = genererSeance(parametres({ ressenti: 'mou' }), [...MOBILITE, ...DETENTE, ...intenses]);
    expect(seance.assouplissement).toBe(1);
    for (const bloc of seance.blocs.filter((b) => b.phase === 'coeur')) {
      expect(bloc.exercice.effets).toContain('energie');
    }
  });

  it('ne viole jamais les contraintes, même en assouplissant tout le reste', () => {
    const saut = fabriquerExercice({ id: 'saut', sauts: true, effets: ['energie'], intensite: 2 });
    const seance = genererSeance(parametres({ contraintes: SILENCIEUX }), [saut, MOBILITE[0], DETENTE[0]]);
    expect(ids(seance)).not.toContain('saut');
    expect(seance.assouplissement).toBe(3);
    expect(seance.dureeTotaleS).toBe(300);
  });

  it("ne fait jamais deux fois de suite le même exercice, même en répétant", () => {
    const seance = genererSeance(parametres({ duree: 10 }), [MOBILITE[0], DETENTE[0]]);
    const suite = ids(seance);
    for (let i = 1; i < suite.length; i++) {
      expect(suite[i]).not.toBe(suite[i - 1]);
    }
  });

  it("lève une erreur quand aucun exercice n'est compatible", () => {
    const saut = fabriquerExercice({ id: 'saut', sauts: true });
    expect(() => genererSeance(parametres({ contraintes: SILENCIEUX }), [saut])).toThrow(
      'Aucun exercice compatible avec le contexte test',
    );
  });
});

describe('genererSeance : phases calmes', () => {
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

  it('oriente le cœur vers la mobilité pour « raide »', () => {
    const mobilites = ZONES.concat(ZONES.slice(0, 2)).map((zone, i) =>
      fabriquerExercice({ id: `mob-${i}`, effets: ['mobilite'], intensite: 1, zone }),
    );
    const seance = genererSeance(parametres({ ressenti: 'raide' }), [...mobilites, ...DETENTE, ...ENERGIE]);
    expect(seance.assouplissement).toBe(0);
    for (const bloc of seance.blocs.filter((b) => b.phase === 'coeur')) {
      expect(bloc.exercice.effets).toContain('mobilite');
    }
  });

  it('oriente le cœur et le retour au calme vers la détente pour « stressé »', () => {
    const detentes = ZONES.concat(ZONES.slice(0, 2)).map((zone, i) =>
      fabriquerExercice({ id: `det-${i}`, effets: ['detente'], intensite: 1, zone }),
    );
    const seance = genererSeance(parametres({ ressenti: 'stresse' }), [...MOBILITE, ...detentes, ...ENERGIE]);
    expect(seance.assouplissement).toBe(0);
    for (const bloc of seance.blocs.filter((b) => b.phase !== 'mise_en_route')) {
      expect(bloc.exercice.effets).toContain('detente');
    }
  });

  it('répète un exercice calme plutôt que de finir sur de l’énergie', () => {
    for (let graine = 1; graine <= 20; graine++) {
      const seance = genererSeance(parametres({ graine, ressenti: 'stresse' }), [MOBILITE[0], DETENTE[0], ...ENERGIE]);
      for (const bloc of seance.blocs) {
        expect(bloc.exercice.effets).not.toEqual(['energie']);
      }
      expect(seance.assouplissement).toBe(3);
    }
  });

  it('ne prend pas en mise en route l’exercice dont le retour au calme a besoin', () => {
    // Seule séance idéale : mise en route e0, cœur e4 + e2, retour au calme e1 + e3.
    // e3 est idéal pour la mise en route, mais le retour au calme n'a que e1 et e3.
    const catalogue = [
      fabriquerExercice({ id: 'e0', effets: ['mobilite'], intensite: 1 }),
      fabriquerExercice({ id: 'e1', effets: ['detente'], intensite: 1 }),
      fabriquerExercice({ id: 'e2', effets: ['mobilite', 'detente', 'energie'], intensite: 2 }),
      fabriquerExercice({ id: 'e3', effets: ['mobilite', 'detente', 'energie'], intensite: 1 }),
      fabriquerExercice({ id: 'e4', effets: ['mobilite', 'energie'], intensite: 2 }),
    ];
    for (let graine = 1; graine <= 50; graine++) {
      const seance = genererSeance(parametres({ graine, ressenti: 'raide', duree: 3 }), catalogue);
      expect(seance.assouplissement).toBe(0);
      expect(ids(seance)[0]).toBe('e0');
      expect(ids(seance).slice(3).sort()).toEqual(['e1', 'e3']);
    }
  });

  it('n’utilise l’énergie dans une phase calme qu’en dernier recours', () => {
    const seance = genererSeance(parametres({ ressenti: 'stresse' }), ENERGIE);
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
    const catalogue = [...MOBILITE, ...DETENTE, ...au(2, ENERGIE)];
    const seance = genererSeance(parametres({ niveau: 3 }), catalogue);
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
      const seance = genererSeance(parametres({ graine, niveau: 3, duree: 3 }), catalogue);
      for (const bloc of seance.blocs) if (bloc.phase !== 'coeur') choisis.add(bloc.exercice.id);
    }
    expect(choisis.has('mob-a')).toBe(true);
    expect(choisis.has('det-a')).toBe(true);
  });
});
