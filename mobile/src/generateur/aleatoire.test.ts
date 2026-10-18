import { choisirAuHasard, creerAleatoire } from './aleatoire';

describe('creerAleatoire', () => {
  it('donne la même suite pour la même graine', () => {
    const a = creerAleatoire(42);
    const b = creerAleatoire(42);
    expect(Array.from({ length: 5 }, () => a())).toEqual(Array.from({ length: 5 }, () => b()));
  });

  it('donne une autre suite pour une autre graine', () => {
    expect(creerAleatoire(1)()).not.toBe(creerAleatoire(2)());
  });

  it('reste entre 0 inclus et 1 exclu', () => {
    const alea = creerAleatoire(7);
    for (let i = 0; i < 1000; i++) {
      const valeur = alea();
      expect(valeur).toBeGreaterThanOrEqual(0);
      expect(valeur).toBeLessThan(1);
    }
  });
});

describe('choisirAuHasard', () => {
  it('renvoie un élément de la liste', () => {
    const liste = ['a', 'b', 'c'];
    expect(liste).toContain(choisirAuHasard(liste, creerAleatoire(3)));
  });

  it('finit par choisir chaque élément', () => {
    const alea = creerAleatoire(5);
    const vus = new Set(Array.from({ length: 100 }, () => choisirAuHasard(['a', 'b', 'c'], alea)));
    expect(vus).toEqual(new Set(['a', 'b', 'c']));
  });

  it('lève une erreur sur une liste vide', () => {
    expect(() => choisirAuHasard([], creerAleatoire(3))).toThrow('Liste vide');
  });
});
