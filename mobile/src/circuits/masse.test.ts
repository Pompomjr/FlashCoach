import { DUREES, NIVEAUX } from '../catalogue/types';
import { CIRCUITS } from './circuits';
import { construireSeanceCircuit } from './construire';
import { circuitPourMasse, construireSeanceMasse, familleSuivante, FAMILLES_MASSE, toursPourDuree } from './masse';

describe('toursPourDuree', () => {
  it('fait 1 tour en 5 min, 2 en 10, 3 en 15 et 6 en 30', () => {
    expect(DUREES.map(toursPourDuree)).toEqual([1, 2, 3, 6]);
  });
});

describe('familleSuivante', () => {
  it('tourne full body → poussée → jambes → dos → full body', () => {
    expect(familleSuivante('full_body')).toBe('poussee');
    expect(familleSuivante('poussee')).toBe('jambes');
    expect(familleSuivante('jambes')).toBe('dos');
    expect(familleSuivante('dos')).toBe('full_body');
  });

  it('commence par le full body sans séance de masse précédente, ou après le cardio (hors rotation)', () => {
    expect(familleSuivante(null)).toBe('full_body');
    expect(familleSuivante('cardio')).toBe('full_body');
  });

  it('ne fait tourner que les 4 familles de renforcement', () => {
    expect(FAMILLES_MASSE).toEqual(['full_body', 'poussee', 'jambes', 'dos']);
  });
});

describe('circuitPourMasse', () => {
  it('trouve le circuit de chaque famille à chaque intensité', () => {
    for (const famille of FAMILLES_MASSE) {
      for (const niveau of NIVEAUX) {
        const circuit = circuitPourMasse(niveau, famille);
        expect([circuit.famille, circuit.niveau]).toEqual([famille, niveau]);
        expect(CIRCUITS).toContain(circuit);
      }
    }
    expect(circuitPourMasse(2, 'poussee').id).toBe('poussee-tonique');
    expect(circuitPourMasse(3, 'dos').id).toBe('dos-costaud');
  });
});

describe('construireSeanceMasse', () => {
  const base = { niveau: 2, famille: 'jambes', sansMateriel: false, graine: 5 } as const;

  it.each([
    [5, 1, 380, 6],
    [10, 2, 670, 11],
    [15, 3, 960, 16],
    [30, 6, 1830, 31],
  ] as const)('%i min : %i tour(s), %i s, %i min affichées', (duree, tours, totalS, minutes) => {
    const seance = construireSeanceMasse({ ...base, duree });
    expect(seance.dureeTotaleS).toBe(totalS);
    expect(seance.duree).toBe(minutes);
    const coeur = seance.blocs.filter((b) => b.phase === 'coeur');
    expect(coeur).toHaveLength(5 * tours);
    expect(coeur.every((b) => b.tour?.total === tours)).toBe(true);
  });

  it('joue le circuit de la famille au niveau choisi, objectif prise de masse', () => {
    const seance = construireSeanceMasse({ ...base, duree: 15 });
    expect(seance).toMatchObject({ circuitId: 'jambes-tonique', niveau: 2, objectif: 'masse', graine: 5 });
    for (const bloc of seance.blocs) expect(bloc.exercice.niveau).toBeLessThanOrEqual(2);
  });

  it('équivaut au circuit construit avec le même nombre de tours imposé', () => {
    const circuit = circuitPourMasse(1, 'full_body');
    expect(construireSeanceMasse({ ...base, niveau: 1, famille: 'full_body', duree: 10 })).toEqual(
      construireSeanceCircuit(circuit, { sansMateriel: false, tours: 2, graine: 5 }),
    );
  });

  it('applique « sans meuble » : aucun exercice qui demande une chaise ou une table', () => {
    const avec = construireSeanceMasse({ ...base, niveau: 3, famille: 'full_body', duree: 5 });
    const sans = construireSeanceMasse({ ...base, niveau: 3, famille: 'full_body', duree: 5, sansMateriel: true });
    expect(avec.blocs.map((b) => b.exercice.id)).toContain('squat-bulgare');
    expect(sans.blocs.map((b) => b.exercice.id)).not.toContain('squat-bulgare');
    expect(sans.blocs.map((b) => b.exercice.id)).not.toContain('tractions-australiennes');
    expect(sans.blocs.map((b) => b.exercice.id)).toContain('fentes-arriere');
  });

  it('ignore le tour facultatif des circuits Lourd : seule la durée décide', () => {
    expect(construireSeanceMasse({ ...base, niveau: 3, famille: 'dos', duree: 15 }).blocs.filter((b) => b.phase === 'coeur')).toHaveLength(15);
  });
});
