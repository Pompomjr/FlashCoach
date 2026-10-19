import { EXERCICES } from '../catalogue/exercices';
import { POSES_PAR_EXERCICE, posesPour } from './poses';
import { calculerPoints, LONGUEURS, poseALinstant, SOL_Y } from './squelette';

test.each([...new Set([...EXERCICES.map(e => e.id), ...Object.keys(POSES_PAR_EXERCICE)])])('%s est illustré et reste dans le cadre sur tout le cycle', id => {
  const entree = POSES_PAR_EXERCICE[id];
  expect(entree).toBeDefined();
  expect(entree.cles.length).toBeGreaterThanOrEqual(2);
  for (let i = 0; i < 100; i++) {
    const points = calculerPoints(poseALinstant(entree.cles, i / 100, entree.continu));
    for (const p of Object.values(points)) {
      expect(p.x).toBeGreaterThanOrEqual(8);
      expect(p.x).toBeLessThanOrEqual(192);
      expect(p.y).toBeGreaterThanOrEqual(8);
      expect(p.y).toBeLessThanOrEqual(192);
    }
    // Même avec des cibles d'appui, aucun membre ne s'allonge ni ne raccourcit.
    for (const [a, b, longueur] of [
      [points.hancheGauche, points.genouGauche, LONGUEURS.cuisse],
      [points.hancheDroite, points.genouDroit, LONGUEURS.cuisse],
      [points.genouGauche, points.chevilleGauche, LONGUEURS.tibia],
      [points.genouDroit, points.chevilleDroite, LONGUEURS.tibia],
    ] as const) expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeCloseTo(longueur, 5);
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

// Liste indépendante du catalogue, livré sur une autre branche.
const NOUVEAUX = [
  'rotation-cou', 'haussement-epaules', 'rotation-poignets', 'ouverture-poitrine',
  'cercles-bras', 'etirement-cou', 'rotation-buste', 'cercles-hanches',
  'enroule-deroule', 'balancier-jambe', 'cercles-chevilles', 'etirement-mollet',
  'respiration-ventre', 'grand-soupir', 'respiration-allongee', 'bras-respiration',
  'epaules-lourdes', 'massage-nuque', 'secouer-bras', 'balancement-bras',
  'etirement-ciel', 'ancrage-pieds', 'montees-pointes', 'assis-debout',
  'chaise-murale', 'marche-sur-place', 'genou-coude', 'gainage-debout',
  'boxe-air', 'jambe-arriere', 'squats-sautes', 'talons-fesses', 'patineur',
  'pas-chasses', 'burpee-sans-saut', 'grimpeur', 'pont-fessier', 'superman',
  'planche-laterale', 'crunch-velo',
];
test.each(NOUVEAUX)('%s possède ses propres clés et le tempo prévu', id => {
  const a = POSES_PAR_EXERCICE[id];
  expect(a).toBeDefined();
  expect(a.cles.length).toBeGreaterThanOrEqual(2);
  // Clés supplémentaires : planche entre deux genoux, retour debout, un seul pied levé à la fois.
  expect(a.cles.length).toBeLessThanOrEqual(({ grimpeur: 4, 'genou-coude': 4, patineur: 8 } as Record<string, number>)[id] ?? 3);
  const exercice = EXERCICES.find(e => e.id === id)!;
  const lent = !exercice.effets.includes('energie') || /lentement|en douceur|doucement/i.test(exercice.consigne);
  expect(a.dureeCycleMs).toBeGreaterThanOrEqual(lent ? 4000 : 1200);
  expect(a.dureeCycleMs).toBeLessThanOrEqual(lent ? 6000 : 2000);
});
const SANS_APPUI_DEBOUT = ['squats-sautes', 'talons-fesses',
  'burpee-sans-saut', 'grimpeur', 'pont-fessier', 'superman', 'planche-laterale', 'crunch-velo'];
test.each(NOUVEAUX.filter(id => !SANS_APPUI_DEBOUT.includes(id)))('%s garde un pied porteur sur tout le cycle', id => {
  const a = posesPour(id);
  for (let i = 0; i < 100; i++) {
    const p = calculerPoints(poseALinstant(a.cles, i / 100, a.continu));
    expect(Math.max(p.orteilsDroits.y, p.orteilsGauches.y)).toBeCloseTo(SOL_Y, 1);
    expect(Math.max(p.chevilleDroite.y, p.chevilleGauche.y)).toBeLessThanOrEqual(SOL_Y + .1);
  }
});
test('les accessoires correspondent aux gestes', () => {
  expect(posesPour('assis-debout').accessoire).toBe('chaise');
  for (const id of ['balancier-jambe', 'cercles-chevilles', 'etirement-mollet', 'chaise-murale', 'jambe-arriere']) {
    expect(posesPour(id).accessoire).toBe('mur');
  }
});

test('hausser les épaules réduit la distance aux oreilles sans déplacer la tête', () => {
  const [bas, haut] = posesPour('haussement-epaules').cles.map(calculerPoints);
  expect(haut.tete).toEqual(bas.tete);
  expect(haut.epaules.y).toBeLessThan(bas.epaules.y - 4);
});

test('genou-coude rapproche le genou du coude opposé', () => {
  const [gauche, , droite] = posesPour('genou-coude').cles.map(calculerPoints);
  expect(Math.hypot(gauche.genouGauche.x - gauche.coudeDroit.x, gauche.genouGauche.y - gauche.coudeDroit.y)).toBeLessThan(12);
  expect(Math.hypot(droite.genouDroit.x - droite.coudeGauche.x, droite.genouDroit.y - droite.coudeGauche.y)).toBeLessThan(12);
});

test('assis-debout et chaise murale : tibias verticaux en position assise', () => {
  for (const id of ['assis-debout', 'chaise-murale']) {
    const p = calculerPoints(posesPour(id).cles[0]);
    expect(p.genouDroit.x).toBeCloseTo(p.chevilleDroite.x, 5);
    expect(p.genouDroit.y).toBeCloseTo(p.hancheDroite.y, 5);
    expect(p.chevilleDroite.y).toBeCloseTo(SOL_Y, 5);
  }
});

test('grimpeur : les mains restent au sol et la colonne ne se plie pas', () => {
  const a = posesPour('grimpeur');
  for (let i = 0; i < 100; i++) {
    const pose = poseALinstant(a.cles, i / 100);
    const p = calculerPoints(pose);
    expect(p.mainDroite.y).toBeCloseTo(SOL_Y, 5);
    expect(p.mainGauche.y).toBeCloseTo(SOL_Y, 5);
    expect(pose.dos ?? 0).toBe(0);
  }
});


test('grimpeur : une jambe reste quasi tendue à chacun des 100 instants', () => {
  const a = posesPour('grimpeur');
  for (let i = 0; i < 100; i++) {
    const p = calculerPoints(poseALinstant(a.cles, i / 100));
    const distances = [[p.hancheGauche, p.chevilleGauche], [p.hancheDroite, p.chevilleDroite]]
      .map(([h, c]) => Math.hypot(c.x - h.x, c.y - h.y));
    expect(Math.max(...distances)).toBeGreaterThan(67.5);
  }
});

test('genou-coude : buste penché de 20 degrés au plus, sur tout le cycle', () => {
  for (let i = 0; i < 100; i++) {
    const pose = poseALinstant(posesPour('genou-coude').cles, i / 100);
    expect(Math.abs((pose.tronc + 180) % 360 - 180)).toBeLessThanOrEqual(20);
  }
});

test('massage-nuque : mains derrière le cou et coudes ouverts, sans croiser le visage', () => {
  const a = posesPour('massage-nuque');
  for (let i = 0; i < 100; i++) {
    const pose = poseALinstant(a.cles, i / 100, a.continu);
    const p = calculerPoints(pose);
    expect(pose.vue).toBe('face');
    expect(p.coudeGauche.x).toBeLessThan(p.epauleGauche.x - 15);
    expect(p.coudeDroit.x).toBeGreaterThan(p.epauleDroite.x + 15);
    expect(p.mainGauche.x).toBeLessThan(p.cou.x);
    expect(p.mainDroite.x).toBeGreaterThan(p.cou.x);
    for (const main of [p.mainGauche, p.mainDroite]) expect(Math.abs(main.y - p.cou.y)).toBeLessThan(5);
  }
});

test('enroule-deroule : les genoux restent souples dans la descente', () => {
  const bas = posesPour('enroule-deroule').cles[2];
  expect(Math.abs(bas.jambeGauche.genou)).toBeGreaterThanOrEqual(45);
  expect(Math.abs(bas.jambeDroite.genou)).toBeGreaterThanOrEqual(45);
});

test('patineur : pas croisé sans saut, les deux pieds posés quand la jambe croise', () => {
  expect(EXERCICES.find(e => e.id === 'patineur')).toMatchObject({
    sauts: false, transpiration: 'moyenne', intensite: 2, effets: ['energie'], espace: 'un_peu', zone: 'bas',
    consigne: 'Grand pas de côté, l’autre jambe passe derrière en croisant. Et de l’autre côté, sans sauter.',
  });
  const cles = posesPour('patineur').cles.map(calculerPoints);
  const croises = cles.filter(p => p.chevilleGauche.x > p.chevilleDroite.x);
  // Croisement des deux côtés : à droite, puis à gauche.
  expect(croises.some(p => p.bassin.x > 100) && croises.some(p => p.bassin.x < 100)).toBe(true);
  for (const p of croises) {
    expect(p.orteilsGauches.y).toBeCloseTo(SOL_Y, 1);
    expect(p.orteilsDroits.y).toBeCloseTo(SOL_Y, 1);
  }
});
