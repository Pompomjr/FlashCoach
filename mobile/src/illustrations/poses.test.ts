import { EXERCICES } from '../catalogue/exercices';
import { CHAISE, RAYONS, TABLE } from './dessin';
import { POSES_PAR_EXERCICE, posesPour } from './poses';
import { calculerPoints, LONGUEURS, poseALinstant, SOL_Y, type Point } from './squelette';

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

// Niveaux Tonique et Costaud : liste en dur, le catalogue arrive par une autre branche.
const NIVEAUX = [
  'pompe-large', 'pompe-tempo', 'pike-pushup', 'dips-chaise', 'tractions-australiennes',
  'superman-tirage', 'squat-pause', 'squat-bulgare', 'planche-epaules', 'hollow-hold',
  'releves-jambes', 'pompe-diamant', 'pompe-archer', 'pompe-pieds-sureleves', 'pompe-hindoue',
  'pompe-spiderman', 'planche-penchee', 'gainage-commando', 'fentes-sautees', 'burpee-complet',
];
const LENTS = ['pompe-tempo', 'planche-penchee', 'hollow-hold', 'squat-pause'];
const DE_FACE = ['pompe-archer'];
const ACCESSOIRES: Record<string, string> = {
  'dips-chaise': 'chaise', 'squat-bulgare': 'chaise', 'pompe-pieds-sureleves': 'chaise', 'tractions-australiennes': 'table',
};
// Gestes alternés : une clé de retour entre les deux côtés. Burpee : planche aller-retour autour de la pompe, puis le saut.
const CLES_MAX: Record<string, number> = {
  'planche-epaules': 4, 'pompe-spiderman': 4, 'gainage-commando': 4, 'fentes-sautees': 4, 'burpee-complet': 6,
};
const toutLeCycle = (id: string) => {
  const a = posesPour(id);
  return Array.from({ length: 100 }, (_, i) => poseALinstant(a.cles, i / 100, a.continu));
};
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
const angleEntre = (o: Point, a: Point, b: Point) => {
  const u = Math.atan2(a.y - o.y, a.x - o.x), v = Math.atan2(b.y - o.y, b.x - o.x);
  const d = Math.abs(u - v) * 180 / Math.PI;
  return d > 180 ? 360 - d : d;
};
type Points = ReturnType<typeof calculerPoints>;
// Écart du bassin à la droite cheville – épaules : nul pour un corps gainé.
const ecartAlignement = (p: Points) => {
  const a = p.chevilleDroite, b = p.epaules, c = p.bassin;
  return Math.abs((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)) / distance(a, b);
};

test.each(NIVEAUX)('%s : clés, vue, tempo et accessoire prévus', id => {
  const a = POSES_PAR_EXERCICE[id];
  expect(a).toBeDefined();
  expect(a.cles.length).toBeGreaterThanOrEqual(2);
  expect(a.cles.length).toBeLessThanOrEqual(CLES_MAX[id] ?? 3);
  for (const pose of a.cles) expect(pose.vue).toBe(DE_FACE.includes(id) ? 'face' : 'profil');
  expect(a.dureeCycleMs).toBeGreaterThanOrEqual(LENTS.includes(id) ? 4000 : 1200);
  expect(a.dureeCycleMs).toBeLessThanOrEqual(LENTS.includes(id) ? 8000 : 2000);
  expect(a.accessoire).toBe(ACCESSOIRES[id]);
});

test.each(Object.keys(POSES_PAR_EXERCICE))('%s : les bras gardent leur longueur, même avec des appuis de mains', id => {
  for (const pose of toutLeCycle(id)) {
    const p = calculerPoints(pose);
    for (const [a, b, longueur] of [
      [p.epauleGauche, p.coudeGauche, LONGUEURS.bras], [p.epauleDroite, p.coudeDroit, LONGUEURS.bras],
      [p.coudeGauche, p.mainGauche, LONGUEURS.avantBras], [p.coudeDroit, p.mainDroite, LONGUEURS.avantBras],
    ] as const) expect(distance(a, b)).toBeCloseTo(longueur, 5);
  }
});

const GAINEES = ['pompe-large', 'pompe-tempo', 'pompe-diamant', 'pompe-pieds-sureleves', 'planche-penchee'];
test.each(GAINEES)('%s : corps droit et mains au sol sur tout le cycle', id => {
  for (const pose of toutLeCycle(id)) {
    const p = calculerPoints(pose);
    expect(pose.dos ?? 0).toBe(0);
    expect(ecartAlignement(p)).toBeLessThan(1.5);
    expect(p.mainDroite.y).toBeCloseTo(SOL_Y, 5);
    expect(p.mainGauche.y).toBeCloseTo(SOL_Y, 5);
  }
});

test('pompes : la poitrine descend, coudes à 45° en classique, serrés en diamant, ouverts en large', () => {
  const coudeAuBuste = (id: string) => {
    const [haut, bas] = posesPour(id).cles.map(calculerPoints);
    expect(bas.epaules.y).toBeGreaterThan(haut.epaules.y + 12);
    // Coude vers l'arrière, jamais devant l'épaule.
    expect(bas.coudeDroit.x).toBeLessThan(bas.epauleDroite.x);
    return angleEntre(bas.epauleDroite, bas.coudeDroit, bas.bassin);
  };
  const classique = coudeAuBuste('pompe-tempo'), diamant = coudeAuBuste('pompe-diamant'), large = coudeAuBuste('pompe-large');
  expect(classique).toBeGreaterThanOrEqual(30);
  expect(classique).toBeLessThanOrEqual(60);
  expect(diamant).toBeLessThanOrEqual(20);
  expect(large).toBeGreaterThan(classique + 10);
  expect(coudeAuBuste('pompe-pieds-sureleves')).toBeGreaterThanOrEqual(30);
});

const surAssise = (id: string, cheville: Point) => {
  const x = posesPour(id).chaiseX ?? CHAISE.x;
  expect(cheville.x).toBeGreaterThan(x + 4);
  expect(cheville.x).toBeLessThan(x + CHAISE.largeur);
  expect(cheville.y).toBeLessThan(CHAISE.assise);
  expect(cheville.y).toBeGreaterThan(CHAISE.assise - 12);
};

test('pompes pieds surélevés : pieds sur l’assise tout le cycle', () => {
  for (const pose of toutLeCycle('pompe-pieds-sureleves')) {
    const p = calculerPoints(pose);
    surAssise('pompe-pieds-sureleves', p.chevilleDroite);
    surAssise('pompe-pieds-sureleves', p.chevilleGauche);
  }
});

test('squat bulgare : pied arrière sur la chaise, genou avant au-dessus de la cheville en bas', () => {
  for (const pose of toutLeCycle('squat-bulgare')) {
    const p = calculerPoints(pose);
    surAssise('squat-bulgare', p.chevilleGauche);
    expect(p.chevilleDroite.y).toBeCloseTo(SOL_Y, 5);
  }
  const [haut, bas] = posesPour('squat-bulgare').cles.map(calculerPoints);
  expect(bas.bassin.y).toBeGreaterThan(haut.bassin.y + 20);
  expect(Math.abs(bas.genouDroit.x - bas.chevilleDroite.x)).toBeLessThan(6);
  // Le genou arrière descend vers le sol sans le toucher.
  expect(bas.genouGauche.y).toBeGreaterThan(SOL_Y - 16);
  expect(bas.genouGauche.y).toBeLessThan(SOL_Y - RAYONS.genou);
});

test('dips sur chaise : mains au bord de l’assise, coudes pliés vers l’arrière en bas', () => {
  const x = posesPour('dips-chaise').chaiseX ?? CHAISE.x;
  for (const pose of toutLeCycle('dips-chaise')) {
    const p = calculerPoints(pose);
    for (const main of [p.mainDroite, p.mainGauche]) {
      expect(main.y).toBeCloseTo(CHAISE.assise - RAYONS.main, 5);
      expect(main.x).toBeGreaterThan(x + CHAISE.largeur - 10);
      expect(main.x).toBeLessThanOrEqual(x + CHAISE.largeur);
    }
  }
  const [haut, bas] = posesPour('dips-chaise').cles.map(calculerPoints);
  expect(bas.bassin.y).toBeGreaterThan(haut.bassin.y + 15);
  expect(bas.coudeDroit.x).toBeLessThan(bas.epauleDroite.x - 10);
  expect(angleEntre(bas.coudeDroit, bas.epauleDroite, bas.mainDroite)).toBeLessThan(110);
});

test('tractions sous la table : mains sous le plateau, corps droit, poitrine tirée vers la table', () => {
  for (const pose of toutLeCycle('tractions-australiennes')) {
    const p = calculerPoints(pose);
    for (const main of [p.mainDroite, p.mainGauche]) {
      expect(main.y).toBeCloseTo(TABLE.plateau + TABLE.epaisseur + RAYONS.main - 1, 5);
      expect(main.x).toBeGreaterThanOrEqual(TABLE.x);
    }
    expect(ecartAlignement(p)).toBeLessThan(1.5);
    expect(p.chevilleDroite.y).toBeGreaterThan(SOL_Y - 6);
  }
  const [bas, haut] = posesPour('tractions-australiennes').cles.map(calculerPoints);
  expect(haut.epaules.y).toBeLessThan(bas.epaules.y - 20);
});

test('la banane : bas du dos au sol, épaules, bras et jambes décollés', () => {
  for (const pose of toutLeCycle('hollow-hold')) {
    const p = calculerPoints(pose);
    expect(p.bassin.y).toBeGreaterThan(SOL_Y - 12);
    expect(p.epaules.y).toBeLessThan(p.bassin.y - 6);
    expect(Math.max(p.chevilleDroite.y, p.chevilleGauche.y)).toBeLessThan(SOL_Y - 15);
    // Bras tendus au-delà de la tête.
    expect(p.mainDroite.x).toBeLessThan(p.tete.x);
    expect(p.mainDroite.y).toBeLessThan(SOL_Y - 15);
  }
});

test('relevés de jambes : jambes à la verticale en haut, sans toucher le sol en bas', () => {
  for (const pose of toutLeCycle('releves-jambes')) {
    const p = calculerPoints(pose);
    expect(Math.max(p.chevilleDroite.y, p.orteilsDroits.y)).toBeLessThan(SOL_Y - 8);
  }
  const haut = posesPour('releves-jambes').cles.map(calculerPoints).find(p => p.chevilleDroite.y < p.bassin.y - 60);
  expect(haut).toBeDefined();
  expect(Math.abs(haut!.chevilleDroite.x - haut!.hancheDroite.x)).toBeLessThan(8);
});

test('pompes en V : fesses en l’air, le haut de la tête vient vers le sol', () => {
  for (const pose of toutLeCycle('pike-pushup')) {
    const p = calculerPoints(pose);
    expect(p.bassin.y).toBeLessThan(p.epaules.y - 15);
    expect(p.mainDroite.y).toBeCloseTo(SOL_Y, 5);
  }
  const [haut, bas] = posesPour('pike-pushup').cles.map(calculerPoints);
  expect(bas.tete.y).toBeGreaterThan(haut.tete.y + 8);
  expect(bas.tete.y + LONGUEURS.rayonTete).toBeGreaterThan(SOL_Y - 14);
});

test('pompe hindoue : du V au cobra, en frôlant le sol', () => {
  for (const pose of toutLeCycle('pompe-hindoue')) expect(calculerPoints(pose).mainDroite.y).toBeCloseTo(SOL_Y, 5);
  const [v, plonge, cobra] = posesPour('pompe-hindoue').cles.map(calculerPoints);
  expect(v.bassin.y).toBeLessThan(v.epaules.y - 15);
  expect(plonge.epaules.y).toBeGreaterThan(SOL_Y - 26);
  expect(cobra.bassin.y).toBeGreaterThan(SOL_Y - 26);
  expect(cobra.epaules.y).toBeLessThan(cobra.bassin.y - 20);
  expect(angleEntre(cobra.coudeDroit, cobra.epauleDroite, cobra.mainDroite)).toBeGreaterThan(160);
});

test('pompe spider-man : le genou vient vers le coude du même côté, en alternance', () => {
  const cles = posesPour('pompe-spiderman').cles.map(calculerPoints);
  expect(cles.some(p => distance(p.genouDroit, p.coudeDroit) < 20)).toBe(true);
  expect(cles.some(p => distance(p.genouGauche, p.coudeGauche) < 20)).toBe(true);
  for (const pose of toutLeCycle('pompe-spiderman')) {
    const p = calculerPoints(pose);
    expect(p.mainDroite.y).toBeCloseTo(SOL_Y, 5);
    expect(Math.max(p.chevilleDroite.y, p.chevilleGauche.y)).toBeLessThanOrEqual(SOL_Y);
  }
});

test('planche penchée : épaules nettement au-delà des mains, bras tendus', () => {
  for (const pose of toutLeCycle('planche-penchee')) {
    const p = calculerPoints(pose);
    expect(p.epauleDroite.x).toBeGreaterThan(p.mainDroite.x + 12);
    expect(distance(p.epauleDroite, p.mainDroite)).toBeGreaterThan(49);
  }
});

test('gainage commando : des coudes aux mains, une main après l’autre', () => {
  const cles = posesPour('gainage-commando').cles.map(calculerPoints);
  const auSol = (y: number) => Math.abs(y - SOL_Y) < 2;
  expect(cles.some(p => auSol(p.coudeDroit.y) && auSol(p.coudeGauche.y))).toBe(true);
  expect(cles.some(p => distance(p.epauleDroite, p.mainDroite) > 48 && distance(p.epauleGauche, p.mainGauche) > 48)).toBe(true);
  // Étape intermédiaire : la main proche posée, coude décollé ; l'autre bras encore sur l'avant-bras.
  expect(cles.some(p => p.coudeDroit.y < SOL_Y - 12 && p.coudeGauche.y > SOL_Y - 10)).toBe(true);
  for (const pose of toutLeCycle('gainage-commando')) {
    const p = calculerPoints(pose);
    expect(p.mainDroite.y).toBeCloseTo(SOL_Y, 5);
    expect(p.mainGauche.y).toBeCloseTo(SOL_Y, 5);
    expect(ecartAlignement(p)).toBeLessThan(2);
  }
});

test('planche, toucher d’épaules : corps gainé, une main quitte le sol pour l’épaule opposée, l’autre reste au sol', () => {
  const points = posesPour('planche-epaules').cles.map(calculerPoints);
  expect(points.some(p => distance(p.mainGauche, p.epauleDroite) < 10 && Math.abs(p.mainDroite.y - SOL_Y) < .01)).toBe(true);
  expect(points.some(p => distance(p.mainDroite, p.epauleGauche) < 10 && Math.abs(p.mainGauche.y - SOL_Y) < .01)).toBe(true);
  for (const pose of toutLeCycle('planche-epaules')) {
    const p = calculerPoints(pose);
    expect(Math.max(p.mainDroite.y, p.mainGauche.y)).toBeCloseTo(SOL_Y, 5);
    // Le bassin ne bouge pas, le corps reste droit.
    expect(Math.abs(p.bassin.x - points[0].bassin.x)).toBeLessThan(1);
    expect(ecartAlignement(p)).toBeLessThan(1.5);
    expect(p.chevilleDroite.y).toBeLessThan(SOL_Y);
  }
});

test('pompe archer : mains très larges, un bras plié, l’autre tendu', () => {
  for (const pose of toutLeCycle('pompe-archer')) {
    const p = calculerPoints(pose);
    expect(p.mainDroite.y).toBeCloseTo(SOL_Y, 5);
    expect(p.mainGauche.y).toBeCloseTo(SOL_Y, 5);
    expect(Math.abs(p.mainDroite.x - p.mainGauche.x)).toBeGreaterThan(70);
  }
  const [haut, bas] = posesPour('pompe-archer').cles.map(calculerPoints);
  expect(bas.epaules.y).toBeGreaterThan(haut.epaules.y + 10);
  const tendu = (epaule: Point, main: Point) => distance(epaule, main) > 46;
  expect(tendu(bas.epauleGauche, bas.mainGauche) !== tendu(bas.epauleDroite, bas.mainDroite)).toBe(true);
  expect(Math.min(distance(bas.epauleGauche, bas.mainGauche), distance(bas.epauleDroite, bas.mainDroite))).toBeLessThan(36);
});

test('superman tirage : à plat ventre, bras tendus devant puis coudes tirés vers les côtes', () => {
  const [tendus, tires] = posesPour('superman-tirage').cles.map(calculerPoints);
  expect(tendus.mainDroite.x).toBeGreaterThan(tendus.tete.x);
  expect(tires.coudeDroit.x).toBeLessThan(tires.epauleDroite.x - 10);
  for (const pose of toutLeCycle('superman-tirage')) {
    const p = calculerPoints(pose);
    expect(p.mainDroite.y).toBeLessThan(SOL_Y - 4);
    expect(p.bassin.y).toBeGreaterThan(SOL_Y - 18);
  }
});

test('squat avec pause : on tient en bas, cuisses parallèles au sol', () => {
  const [haut, bas, pause] = posesPour('squat-pause').cles;
  expect(pause).toEqual(bas);
  const p = calculerPoints(bas);
  expect(p.bassin.y).toBeGreaterThan(calculerPoints(haut).bassin.y + 25);
  expect(p.hancheDroite.y).toBeGreaterThan(p.genouDroit.y - 4);
  for (const pose of toutLeCycle('squat-pause')) {
    const q = calculerPoints(pose);
    expect(Math.max(q.orteilsDroits.y, q.orteilsGauches.y)).toBeCloseTo(SOL_Y, 1);
  }
});

test('fentes sautées : les deux pieds quittent le sol et la jambe avant change', () => {
  const cles = posesPour('fentes-sautees').cles.map(calculerPoints);
  expect(cles.some(p => Math.max(p.orteilsDroits.y, p.orteilsGauches.y) < SOL_Y - 8)).toBe(true);
  const fentes = cles.filter(p => Math.abs(p.orteilsDroits.y - SOL_Y) < 2 && Math.abs(p.orteilsGauches.y - SOL_Y) < 2);
  expect(fentes.some(p => p.chevilleDroite.x > p.chevilleGauche.x + 20)).toBe(true);
  expect(fentes.some(p => p.chevilleGauche.x > p.chevilleDroite.x + 20)).toBe(true);
});

test('burpee complet : planche, pompe, pieds ramenés, saut bras en l’air', () => {
  const cles = posesPour('burpee-complet').cles.map(calculerPoints);
  const auSol = (p: Points) => Math.abs(p.mainDroite.y - SOL_Y) < .5;
  expect(cles.some(p => auSol(p) && ecartAlignement(p) < 1.5 && p.epaules.y < SOL_Y - 45)).toBe(true);
  expect(cles.some(p => auSol(p) && ecartAlignement(p) < 1.5 && p.epaules.y > SOL_Y - 30)).toBe(true);
  expect(cles.some(p => auSol(p) && p.genouDroit.y < p.bassin.y + 20 && p.chevilleDroite.x > p.bassin.x - 20)).toBe(true);
  expect(cles.some(p => Math.max(p.orteilsDroits.y, p.orteilsGauches.y) < SOL_Y - 8 && p.mainDroite.y < p.tete.y)).toBe(true);
});
