import { fabriquerExercice } from '../test-utils/fabrique';
import { respecteContraintes } from '../generateur/filtres';
import { CONTEXTES } from './contextes';
import { EXERCICES } from './exercices';
import { validerCatalogue } from './validation';

describe('validerCatalogue', () => {
  it('accepte le catalogue embarqué', () => {
    expect(validerCatalogue(EXERCICES, CONTEXTES)).toEqual([]);
  });

  it('signale un exercice en double', () => {
    const ex = fabriquerExercice({ id: 'a' });
    expect(validerCatalogue([ex, ex], [])).toContain('Exercice en double : a');
  });

  it('signale un exercice sans effet', () => {
    expect(validerCatalogue([fabriquerExercice({ id: 'b', effets: [] })], [])).toContain(
      'Exercice sans effet : b',
    );
  });

  it('signale une animation qui n’est pas un fichier Lottie', () => {
    expect(validerCatalogue([fabriquerExercice({ id: 'c', animation: 'c.png' })], [])).toContain(
      'Animation invalide : c',
    );
  });

  it('signale un niveau hors de 1 à 3', () => {
    const ex = fabriquerExercice({ id: 'd', niveau: 4 as never });
    expect(validerCatalogue([ex], [])).toContain('Niveau invalide : d');
  });

  it('signale un contexte en double', () => {
    const ctx = CONTEXTES[0];
    expect(validerCatalogue([], [ctx, ctx])).toContain(`Contexte en double : ${ctx.id}`);
  });
});

describe('catalogue embarqué', () => {
  it('contient 50 exercices', () => {
    expect(EXERCICES).toHaveLength(50);
  });

  it('place exactement cinq exercices au niveau 2 et aucun au niveau 3 pour l’instant', () => {
    const ids = (niveau: number) => EXERCICES.filter((e) => e.niveau === niveau).map((e) => e.id).sort();
    expect(ids(2)).toEqual(['burpee-sans-saut', 'grimpeur', 'planche', 'planche-laterale', 'squats-sautes']);
    expect(ids(3)).toEqual([]);
    expect(EXERCICES.filter((e) => e.niveau === 1)).toHaveLength(45);
  });

  it.each(EXERCICES.map((e) => [e.id, e] as const))(
    '%s : cohérent avec les filtres du bureau',
    (_id, exercice) => {
      const bureau = CONTEXTES.find((c) => c.id === 'bureau');
      if (!bureau) throw new Error('contexte bureau introuvable');
      const compatible = respecteContraintes(exercice, bureau.contraintes);
      if (exercice.sol || exercice.transpiration !== 'faible') {
        expect(compatible).toBe(false);
      }
      if (exercice.sauts) expect(compatible).toBe(false);
      if (exercice.espace !== 'sur_place') expect(compatible).toBe(false);
    },
  );

  it('propose 5 contextes, dans l’ordre d’affichage', () => {
    expect(CONTEXTES.map((c) => c.id)).toEqual(['reveil', 'maison', 'bureau', 'voyage', 'dehors']);
  });

  it('rend gratuits uniquement Au réveil et À la maison', () => {
    expect(CONTEXTES.filter((c) => !c.premium).map((c) => c.id)).toEqual(['reveil', 'maison']);
  });

  it('règle le bureau en tenue de ville, silencieux, sur place, sans sol', () => {
    const bureau = CONTEXTES.find((c) => c.id === 'bureau');
    expect(bureau?.contraintes).toEqual({
      tenue: 'ville',
      bruit: 'silencieux',
      espace: 'sur_place',
      sol: false,
    });
  });
});
