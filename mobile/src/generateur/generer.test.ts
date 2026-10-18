import type { Contraintes, Exercice } from '../catalogue/types';
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
