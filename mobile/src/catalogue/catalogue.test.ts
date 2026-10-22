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
  it('contient 76 exercices', () => {
    expect(EXERCICES).toHaveLength(76);
  });

  it('compte 49 exercices Doux, 18 Tonique et 9 Costaud, ids exacts', () => {
    const ids = (niveau: number) => EXERCICES.filter((e) => e.niveau === niveau).map((e) => e.id).sort();
    expect(ids(2)).toEqual([
      'burpee-sans-saut', 'dips-chaise', 'grimpeur', 'hollow-hold', 'pike-pushup', 'planche', 'planche-epaules',
      'planche-laterale', 'pompe-classique', 'pompe-large', 'pompe-tempo', 'pont-une-jambe', 'releves-jambes',
      'squat-bulgare', 'squat-pause', 'squats-sautes', 'superman-tirage', 'tractions-australiennes',
    ]);
    expect(ids(3)).toEqual([
      'burpee-complet', 'fentes-sautees', 'gainage-commando', 'planche-penchee', 'pompe-archer', 'pompe-diamant',
      'pompe-hindoue', 'pompe-pieds-sureleves', 'pompe-spiderman',
    ]);
    expect(EXERCICES.filter((e) => e.niveau === 1)).toHaveLength(49);
  });

  it('ajoute les 6 exercices des séances en circuit, valeurs exactes', () => {
    const base = { sauts: false, espace: 'sur_place' } as const;
    const attendus = [
      {
        ...base, id: 'pompe-inclinee', nom: 'Pompes inclinées', animation: 'pompe-inclinee.json',
        consigne: 'Mains sur le bord d’une chaise stable ou d’une table, corps gainé, tu descends la poitrine et tu pousses.',
        niveau: 1, intensite: 2, sol: false, zone: 'haut', bilateral: false, effets: ['energie'], transpiration: 'moyenne',
      },
      {
        ...base, id: 'pompe-genoux', nom: 'Pompes sur les genoux', animation: 'pompe-genoux.json',
        consigne: 'Genoux au sol, corps droit des genoux à la tête, tu descends la poitrine entre les mains.',
        niveau: 1, intensite: 2, sol: true, zone: 'haut', bilateral: false, effets: ['energie'], transpiration: 'moyenne',
      },
      {
        ...base, id: 'pompe-classique', nom: 'Pompes', animation: 'pompe-classique.json',
        consigne: 'Mains sous les épaules, corps gainé de la tête aux pieds, la poitrine frôle le sol.',
        niveau: 2, intensite: 3, sol: true, zone: 'haut', bilateral: false, effets: ['energie'], transpiration: 'moyenne',
      },
      {
        ...base, id: 'tirage-yt', nom: 'Y-T au sol', animation: 'tirage-yt.json',
        consigne: 'À plat ventre, tu décolles les bras en Y, puis en T, en serrant les omoplates.',
        niveau: 1, intensite: 2, sol: true, zone: 'tronc', bilateral: false, effets: ['energie', 'mobilite'], transpiration: 'faible',
      },
      {
        ...base, id: 'bird-dog', nom: 'Bird-dog', animation: 'bird-dog.json',
        consigne: 'À quatre pattes, tu tends le bras et la jambe opposés, dos plat, puis tu changes.',
        niveau: 1, intensite: 1, sol: true, zone: 'tronc', bilateral: false, effets: ['mobilite', 'energie'], transpiration: 'faible',
      },
      {
        ...base, id: 'pont-une-jambe', nom: 'Pont fessier sur une jambe', animation: 'pont-une-jambe.json',
        consigne: 'Sur le dos, une jambe tendue en l’air, tu montes le bassin avec l’autre et tu serres.',
        niveau: 2, intensite: 3, sol: true, zone: 'bas', bilateral: true, effets: ['energie'], transpiration: 'moyenne',
      },
    ];
    for (const attendu of attendus) {
      expect(EXERCICES.find((e) => e.id === attendu.id)).toEqual(attendu);
    }
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
