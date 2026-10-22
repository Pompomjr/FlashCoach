import { CHAISE, RAYONS } from './dessin';
import { POSES_PAR_EXERCICE } from './poses';
import { calculerPoints, poseALinstant, SOL_Y } from './squelette';

const CIRCUITS = ['pompe-inclinee', 'pompe-genoux', 'pompe-classique', 'tirage-yt', 'bird-dog', 'pont-une-jambe'];
const cycle = (id: string) => Array.from({ length: 120 }, (_, i) =>
  calculerPoints(poseALinstant(POSES_PAR_EXERCICE[id].cles, i / 120)));

test.each(CIRCUITS)('%s : animation dédiée et tempo du circuit', id => {
  const a = POSES_PAR_EXERCICE[id];
  expect(a).toBeDefined();
  expect(a.cles.length).toBeGreaterThanOrEqual(2);
  expect(a.dureeCycleMs).toBeGreaterThanOrEqual(id.startsWith('pompe') ? 2000 : 3000);
  expect(a.dureeCycleMs).toBeLessThanOrEqual(id.startsWith('pompe') ? 3000 : 4000);
});

test.each(CIRCUITS.slice(0, 3))('%s : appuis stables et descente de poitrine', id => {
  const points = cycle(id);
  const assise = id === 'pompe-inclinee';
  if (assise) expect(POSES_PAR_EXERCICE[id].accessoire).toBe('chaise');
  for (const p of points) {
    for (const main of [p.mainGauche, p.mainDroite]) {
      expect(main.y).toBeCloseTo(assise ? CHAISE.assise - RAYONS.main : SOL_Y, 5);
      if (assise) {
        expect(main.x).toBeGreaterThan(POSES_PAR_EXERCICE[id].chaiseX!);
        expect(main.x).toBeLessThan(POSES_PAR_EXERCICE[id].chaiseX! + CHAISE.largeur);
      }
    }
    expect(p.mainDroite.x).toBeCloseTo(points[0].mainDroite.x, 5);
    expect(p.mainGauche.x).toBeCloseTo(points[0].mainGauche.x, 5);
    const appui = id === 'pompe-genoux' ? p.genouDroit : p.orteilsDroits;
    const initial = id === 'pompe-genoux' ? points[0].genouDroit : points[0].orteilsDroits;
    expect(Math.abs(appui.x - initial.x)).toBeLessThan(1.5);
    expect(Math.abs(appui.y - SOL_Y)).toBeLessThan(1.5);
    const base = id === 'pompe-genoux' ? p.genouDroit : p.chevilleDroite;
    const ecart = Math.abs((p.epaules.x - base.x) * (p.bassin.y - base.y)
      - (p.epaules.y - base.y) * (p.bassin.x - base.x)) / Math.hypot(p.epaules.x - base.x, p.epaules.y - base.y);
    expect(ecart).toBeLessThan(1.5);
  }
  expect(Math.max(...points.map(p => p.epaules.y)) - Math.min(...points.map(p => p.epaules.y))).toBeGreaterThan(12);
});

test('bird-dog : appui diagonal, dos horizontal et alternance', () => {
  for (const p of cycle('bird-dog')) {
    expect(p.epaules.y).toBeCloseTo(p.bassin.y, 5);
    expect(Math.max(p.genouGauche.y, p.genouDroit.y)).toBeCloseTo(SOL_Y, 5);
    expect(Math.max(p.mainGauche.y, p.mainDroite.y)).toBeCloseTo(SOL_Y, 5);
  }
  const cles = POSES_PAR_EXERCICE['bird-dog'].cles.map(calculerPoints);
  expect(cles.some(p => p.mainDroite.y < 150 && p.chevilleGauche.y < 150 && p.genouDroit.y === SOL_Y)).toBe(true);
  expect(cles.some(p => p.mainGauche.y < 150 && p.chevilleDroite.y < 150 && p.genouGauche.y === SOL_Y)).toBe(true);
});

test('pont unilatéral : pied porteur fixe, jambe levée tendue et épaules au sol', () => {
  for (const p of cycle('pont-une-jambe')) {
    expect(p.chevilleDroite.y).toBeCloseTo(SOL_Y, 5);
    expect(p.chevilleDroite.x).toBeCloseTo(133, 5);
    expect(p.epaules.y).toBeGreaterThan(162);
    expect(p.epaules.y).toBeLessThan(166);
    expect(p.chevilleGauche.y).toBeLessThan(p.bassin.y - 55);
    expect(Math.hypot(p.chevilleGauche.x - p.hancheGauche.x, p.chevilleGauche.y - p.hancheGauche.y)).toBeGreaterThan(67);
  }
});

test('Y-T : bras tendus, deux ouvertures distinctes, ventre horizontal', () => {
  expect(POSES_PAR_EXERCICE['tirage-yt'].cles.every(p => p.vue === 'face')).toBe(true);
  const [y, t] = POSES_PAR_EXERCICE['tirage-yt'].cles.map(calculerPoints);
  expect(Math.abs(y.mainDroite.x - t.mainDroite.x)).toBeGreaterThan(15);
  expect(y.mainGauche.x).toBeGreaterThan(y.tete.x);
  expect(y.mainDroite.x).toBeGreaterThan(y.tete.x);
  expect(t.mainGauche.x).toBeCloseTo(t.epauleGauche.x, 5);
  expect(t.mainDroite.x).toBeCloseTo(t.epauleDroite.x, 5);
  for (const p of cycle('tirage-yt')) {
    expect(p.epaules.y).toBeCloseTo(p.bassin.y, 5);
    expect(p.mainDroite.y).toBeLessThan(SOL_Y - 10);
    expect(Math.hypot(p.mainDroite.x - p.epauleDroite.x, p.mainDroite.y - p.epauleDroite.y)).toBeGreaterThan(49);
  }
});
