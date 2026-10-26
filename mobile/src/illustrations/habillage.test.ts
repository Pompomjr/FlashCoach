import { EXERCICES } from '../catalogue/exercices';
import { capsule, dessinerFigurine, RAYONS } from './dessin';
import { posesPour } from './poses';
import { calculerPoints, poseALinstant } from './squelette';

test.each(EXERCICES.map(e => e.id))('%s : peau, brassière, legging et baskets sur tout le cycle', id => {
  const a = posesPour(id);
  for (let i = 0; i < 24; i++) {
    const dessin = dessinerFigurine(poseALinstant(a.cles, i / 24, a.continu));
    const teintes = dessin.formes.map(f => f.teinte);
    for (const teinte of ['proche', 'brassiere', 'legging', 'chaussure', 'cheveux']) {
      expect(teintes).toContain(teinte);
    }
    expect(dessin.formes.every(f => !/NaN|Infinity/.test(f.d))).toBe(true);
  }
});

test.each(EXERCICES.map(e => e.id))('%s : les épaules se fondent derrière le buste, les mains restent devant', id => {
  const a = posesPour(id);
  for (let i = 0; i < 24; i++) {
    const formes = dessinerFigurine(poseALinstant(a.cles, i / 24, a.continu)).formes;
    const buste = formes.findIndex(f => f.partie === 'buste');
    const epaules = formes.flatMap((f, index) => f.partie === 'bras' ? [index] : []);
    expect(buste).toBeGreaterThan(0);
    expect(epaules).toHaveLength(2);
    for (const epaule of epaules) expect(epaule).toBeLessThan(buste);
    expect(formes.slice(buste + 1).some(f => f.teinte === 'proche' && !f.decoupe)).toBe(true);
  }
});

test.each(['squat-lent', 'pompe-classique', 'pompe-archer', 'bird-dog'])('%s : coudes et avant-bras du rendu précédent conservés', id => {
  const a = posesPour(id);
  for (let i = 0; i < 24; i++) {
    const pose = poseALinstant(a.cles, i / 24, a.continu), p = calculerPoints(pose);
    const chemins = dessinerFigurine(pose).formes.map(f => f.d);
    for (const [coude, main] of [[p.coudeGauche, p.mainGauche], [p.coudeDroit, p.mainDroite]]) {
      expect(chemins).toContain(capsule(coude, RAYONS.coude, main, RAYONS.poignet));
    }
  }
});
