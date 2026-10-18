import { EXERCICES } from '../catalogue/exercices';
import { POSES_PAR_EXERCICE, posesPour } from './poses';
import { calculerPoints, poseALinstant, SOL_Y } from './squelette';

test.each(EXERCICES.map(e => e.id))('%s est illustré et reste dans le cadre sur tout le cycle', id => {
  const entree = POSES_PAR_EXERCICE[id];
  expect(entree).toBeDefined();
  expect(entree.cles.length).toBeGreaterThanOrEqual(2);
  for (let i = 0; i < 100; i++) {
    for (const p of Object.values(calculerPoints(poseALinstant(entree.cles, i / 100)))) {
      expect(p.x).toBeGreaterThanOrEqual(8);
      expect(p.x).toBeLessThanOrEqual(192);
      expect(p.y).toBeGreaterThanOrEqual(8);
      expect(p.y).toBeLessThanOrEqual(192);
    }
  }
});

test('le repli respire debout, les pieds au sol', () => {
  expect(posesPour('inconnu')).toBe(posesPour('autre-inconnu'));
  expect(posesPour('toString')).toBe(posesPour('inconnu'));
  for (const pose of posesPour('inconnu').cles) {
    const p = calculerPoints(pose);
    expect(Math.abs(p.orteilsDroits.y - SOL_Y)).toBeLessThan(2);
    expect(Math.abs(p.orteilsGauches.y - SOL_Y)).toBeLessThan(2);
  }
});

test('le squat fléchit les genoux et abaisse le bassin ; la marche alterne les jambes', () => {
  const [haut, bas] = posesPour('squat-lent').cles;
  expect(bas.racine.y).toBeGreaterThan(haut.racine.y + 15);
  expect(Math.abs(bas.jambeDroite.genou)).toBeGreaterThan(60);
  const marche = posesPour('marche-genoux-hauts').cles.map(calculerPoints);
  expect(marche.some(p => p.genouDroit.y < p.bassin.y + 5)).toBe(true);
  expect(marche.some(p => p.genouGauche.y < p.bassin.y + 5)).toBe(true);
});

test('les appuis essentiels touchent le sol dans les poses clés', () => {
  for (const pose of posesPour('squat-lent').cles) {
    const p = calculerPoints(pose);
    expect(p.orteilsDroits.y).toBeCloseTo(SOL_Y, 0);
    expect(p.orteilsGauches.y).toBeCloseTo(SOL_Y, 0);
  }
  for (const pose of posesPour('chat-vache').cles) {
    const p = calculerPoints(pose);
    expect(Math.abs(p.genouDroit.y - SOL_Y)).toBeLessThan(2);
    expect(Math.abs(p.mainDroite.y - SOL_Y)).toBeLessThan(2);
    expect(Math.abs(pose.brasDroit.coude)).toBeLessThan(45);
  }
  for (const pose of posesPour('planche').cles) {
    const p = calculerPoints(pose);
    expect(Math.abs(p.coudeDroit.y - SOL_Y)).toBeLessThan(2);
    expect(Math.abs(p.mainDroite.y - SOL_Y)).toBeLessThan(2);
    expect(Math.abs(p.coudeGauche.y - SOL_Y)).toBeLessThan(2);
  }
});

test.each(['squat-lent', 'marche-genoux-hauts', 'fentes-arriere'])('%s conserve au moins un pied au sol entre les clés', id => {
  for (let i = 0; i < 100; i++) {
    const p = calculerPoints(poseALinstant(posesPour(id).cles, i / 100));
    expect(Math.max(p.orteilsDroits.y, p.orteilsGauches.y)).toBeCloseTo(SOL_Y, 1);
  }
});

test('la fente garde aussi la pointe du pied arrière en appui', () => {
  for (const pose of posesPour('fentes-arriere').cles) {
    const p = calculerPoints(pose);
    expect(Math.abs(p.orteilsDroits.y - SOL_Y)).toBeLessThan(2);
    expect(Math.abs(p.orteilsGauches.y - SOL_Y)).toBeLessThan(2);
  }
});
