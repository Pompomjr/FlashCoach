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
  it('contient 70 exercices', () => {
    expect(EXERCICES).toHaveLength(70);
  });

  it('compte 45 exercices Doux, 16 Tonique et 9 Costaud, ids exacts', () => {
    const ids = (niveau: number) => EXERCICES.filter((e) => e.niveau === niveau).map((e) => e.id).sort();
    expect(ids(2)).toEqual([
      'burpee-sans-saut', 'dips-chaise', 'grimpeur', 'hollow-hold', 'pike-pushup', 'planche', 'planche-epaules',
      'planche-laterale', 'pompe-large', 'pompe-tempo', 'releves-jambes', 'squat-bulgare', 'squat-pause',
      'squats-sautes', 'superman-tirage', 'tractions-australiennes',
    ]);
    expect(ids(3)).toEqual([
      'burpee-complet', 'fentes-sautees', 'gainage-commando', 'planche-penchee', 'pompe-archer', 'pompe-diamant',
      'pompe-hindoue', 'pompe-pieds-sureleves', 'pompe-spiderman',
    ]);
    expect(EXERCICES.filter((e) => e.niveau === 1)).toHaveLength(45);
  });

  it('n’a aucun exercice de niveau 2 ou 3 compatible avec le bureau', () => {
    const bureau = CONTEXTES.find((c) => c.id === 'bureau');
    if (!bureau) throw new Error('contexte bureau introuvable');
    const compatibles = EXERCICES.filter((e) => e.niveau >= 2 && respecteContraintes(e, bureau.contraintes));
    expect(compatibles.map((e) => e.id)).toEqual([]);
    for (const e of compatibles) {
      expect(e).toMatchObject({ transpiration: 'faible', sol: false, sauts: false, espace: 'sur_place' });
    }
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
