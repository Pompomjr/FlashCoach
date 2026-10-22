import { respecteContraintes } from '../generateur/filtres';
import { creerEtatInitial, lecteur } from '../seance/lecteur';
import { CIRCUITS, circuitParId } from './circuits';
import {
  construireSeanceCircuit,
  dureeCircuitS,
  estPosteApresRepos,
  nombreDeTours,
  REPOS_ENTRE_TOURS_S,
} from './construire';
import { materielDe } from './materiel';
import type { Circuit } from './types';

function circuit(id: string) {
  const trouve = circuitParId(id);
  if (!trouve) throw new Error(`circuit de test introuvable : ${id}`);
  return trouve;
}

const BASE = { sansMateriel: false, tourEnPlus: false, graine: 7 };
const construire = (id: string, options: Partial<typeof BASE> = {}) =>
  construireSeanceCircuit(circuit(id), { ...BASE, ...options });
const ids = (blocs: { exercice: { id: string } }[]) => blocs.map((b) => b.exercice.id);

describe('durées', () => {
  it('fait 960 s en 3 tours, 1250 s en 4 tours et 1540 s en 5 tours', () => {
    expect(construire('full-body-doux').dureeTotaleS).toBe(960);
    expect(construire('full-body-tonique').dureeTotaleS).toBe(1250);
    expect(construire('full-body-costaud').dureeTotaleS).toBe(1250);
    expect(construire('full-body-costaud', { tourEnPlus: true }).dureeTotaleS).toBe(1540);
  });

  it('arrondit la durée en minutes : 16, 21 et 26', () => {
    expect(construire('full-body-doux').duree).toBe(16);
    expect(construire('full-body-tonique').duree).toBe(21);
    expect(construire('dos-costaud', { tourEnPlus: true }).duree).toBe(26);
  });

  it('somme exactement les transitions et les efforts des blocs', () => {
    for (const c of CIRCUITS) {
      const seance = construireSeanceCircuit(c, BASE);
      expect(seance.dureeTotaleS).toBe(seance.blocs.reduce((s, b) => s + b.transitionS + b.effortS, 0));
    }
  });

  it('dureeCircuitS donne la durée de la séance construite, avec ou sans tour en plus', () => {
    for (const c of CIRCUITS) {
      for (const tourEnPlus of [false, true]) {
        expect([c.id, tourEnPlus, dureeCircuitS(c, tourEnPlus)]).toEqual([
          c.id,
          tourEnPlus,
          construireSeanceCircuit(c, { ...BASE, tourEnPlus }).dureeTotaleS,
        ]);
      }
    }
    expect(dureeCircuitS(circuit('jambes-tonique'), false)).toBe(1250);
    expect(dureeCircuitS(circuit('jambes-costaud'), true)).toBe(1540);
  });

  it('joué jusqu’au bout par le lecteur, la séance dure exactement dureeTotaleS', () => {
    const seance = construire('jambes-costaud', { tourEnPlus: true });
    const fin = lecteur(creerEtatInitial(seance.blocs), { type: 'avancer', ms: seance.dureeTotaleS * 1000 });
    expect(fin.termine).toBe(true);
    expect(fin.ecouleMs).toBe(seance.dureeTotaleS * 1000);
    expect(fin.exercicesFaits).toBe(seance.blocs.length);
  });
});

describe('tours', () => {
  it('compte 3 tours en Doux, 4 en Tonique et en Costaud, 5 avec le tour en plus des Costaud', () => {
    expect(nombreDeTours(circuit('poussee-doux'), false)).toBe(3);
    expect(nombreDeTours(circuit('poussee-tonique'), false)).toBe(4);
    expect(nombreDeTours(circuit('poussee-costaud'), false)).toBe(4);
    expect(nombreDeTours(circuit('poussee-costaud'), true)).toBe(5);
  });

  it('ignore le tour en plus hors des circuits Costaud', () => {
    for (const c of CIRCUITS.filter((x) => !x.tourFacultatif)) {
      expect(nombreDeTours(c, true)).toBe(c.tours);
      expect(construireSeanceCircuit(c, { ...BASE, tourEnPlus: true })).toEqual(construireSeanceCircuit(c, BASE));
    }
  });

  it('numérote chaque poste : Tour n / N, 5 postes par tour', () => {
    const seance = construire('dos-costaud', { tourEnPlus: true });
    const coeur = seance.blocs.filter((b) => b.phase === 'coeur');
    expect(coeur).toHaveLength(25);
    coeur.forEach((bloc, i) => {
      expect(bloc.tour).toEqual({ numero: Math.floor(i / 5) + 1, total: 5 });
    });
  });

  it('rejoue les 5 mêmes postes dans le même ordre à chaque tour', () => {
    const coeur = construire('full-body-tonique').blocs.filter((b) => b.phase === 'coeur');
    const attendu = circuit('full-body-tonique').postes.map((p) => p.exerciceId);
    for (let tour = 0; tour < 4; tour++) {
      expect(ids(coeur.slice(tour * 5, tour * 5 + 5))).toEqual(attendu);
    }
  });
});

describe('format des blocs', () => {
  it('commence par 4 postes d’échauffement de 5 s + 25 s, sans tour', () => {
    const debut = construire('full-body-doux').blocs.slice(0, 4);
    expect(ids(debut)).toEqual(['rotation-epaules', 'cercles-hanches', 'marche-sur-place', 'rotation-poignets']);
    for (const bloc of debut) {
      expect(bloc).toMatchObject({ phase: 'mise_en_route', transitionS: 5, effortS: 25 });
      expect(bloc.tour).toBeUndefined();
      expect(bloc.cote).toBeUndefined();
    }
    expect(construire('full-body-doux').blocs.filter((b) => b.phase === 'mise_en_route')).toHaveLength(4);
  });

  it('finit par 2 postes de retour au calme de 5 s + 25 s, sans tour', () => {
    const blocs = construire('full-body-doux').blocs;
    const fin = blocs.slice(-2);
    expect(ids(fin)).toEqual(['respiration-ventre', 'etirement-ciel']);
    for (const bloc of fin) {
      expect(bloc).toMatchObject({ phase: 'retour_au_calme', transitionS: 5, effortS: 25 });
      expect(bloc.tour).toBeUndefined();
    }
    expect(blocs.filter((b) => b.phase === 'retour_au_calme')).toHaveLength(2);
  });

  it('donne à chaque poste 30 s d’effort et 10 s de transition, sauf le premier des tours 2 et suivants', () => {
    for (const c of CIRCUITS) {
      const coeur = construireSeanceCircuit(c, { ...BASE, tourEnPlus: true }).blocs.filter((b) => b.phase === 'coeur');
      coeur.forEach((bloc, i) => {
        const premierApresRepos = i % 5 === 0 && i > 0;
        const attendu = premierApresRepos ? REPOS_ENTRE_TOURS_S + 10 : 10;
        expect([c.id, i, bloc.transitionS, bloc.effortS]).toEqual([c.id, i, attendu, 30]);
      });
    }
  });

  it('place le repos de 1 min 30 avant le premier poste des tours 2 et suivants, et nulle part ailleurs', () => {
    expect(REPOS_ENTRE_TOURS_S).toBe(90);
    const seance = construire('full-body-tonique');
    const avecRepos = seance.blocs
      .map((bloc, index) => ({ bloc, index }))
      .filter(({ bloc }) => bloc.transitionS >= REPOS_ENTRE_TOURS_S);
    // 4 postes d'échauffement, puis tours de 5 postes : les tours 2, 3 et 4 commencent aux rangs 9, 14 et 19.
    expect(avecRepos.map(({ index }) => index)).toEqual([9, 14, 19]);
    for (const { bloc } of avecRepos) expect(bloc.tour?.numero).toBeGreaterThan(1);
  });

  it('reconnaît le poste qui suit un repos', () => {
    const blocs = construire('full-body-tonique').blocs;
    expect(blocs.filter(estPosteApresRepos).map((b) => b.tour?.numero)).toEqual([2, 3, 4]);
    expect(blocs.filter(estPosteApresRepos).every((b) => b.exercice.id === 'pompe-classique')).toBe(true);
  });
});

describe('côtés', () => {
  it('pose le côté imposé sur les postes concernés et sur eux seuls', () => {
    const coeur = construire('jambes-costaud').blocs.filter((b) => b.phase === 'coeur');
    expect(coeur.slice(0, 5).map((b) => [b.exercice.id, b.cote])).toEqual([
      ['squat-bulgare', 'gauche'],
      ['pont-une-jambe', 'gauche'],
      ['squat-bulgare', 'droite'],
      ['pont-une-jambe', 'droite'],
      ['chaise-murale', undefined],
    ]);
    for (const bloc of coeur) {
      if (bloc.cote === undefined) expect('cote' in bloc).toBe(false);
    }
  });

  it('ne pose aucun côté sur les circuits sans poste latéralisé', () => {
    for (const bloc of construire('full-body-tonique').blocs) expect('cote' in bloc).toBe(false);
  });
});

describe('sans meuble', () => {
  it('garde les exercices prévus quand l’utilisateur a ses meubles', () => {
    const coeur = construire('full-body-costaud').blocs.filter((b) => b.phase === 'coeur').slice(0, 5);
    expect(ids(coeur)).toEqual(['pompe-archer', 'squat-bulgare', 'tractions-australiennes', 'squat-bulgare', 'hollow-hold']);
  });

  it('remplace les postes à meuble et garde le côté (squat bulgare -> fentes arrière)', () => {
    const coeur = construire('full-body-costaud', { sansMateriel: true }).blocs.filter((b) => b.phase === 'coeur').slice(0, 5);
    expect(coeur.map((b) => [b.exercice.id, b.cote])).toEqual([
      ['pompe-archer', undefined],
      ['fentes-arriere', 'gauche'],
      ['tirage-yt', undefined],
      ['fentes-arriere', 'droite'],
      ['hollow-hold', undefined],
    ]);
  });

  it('applique les quatre autres remplacements', () => {
    const coeur = (id: string) => ids(construire(id, { sansMateriel: true }).blocs.filter((b) => b.phase === 'coeur').slice(0, 5));
    expect(coeur('full-body-doux')).toEqual(['pompes-mur', 'squat-lent', 'tirage-yt', 'pont-fessier', 'crunch-velo']);
    expect(coeur('poussee-tonique')).toEqual(['pompe-classique', 'squat-pause', 'pike-pushup', 'pont-fessier', 'pompe-genoux']);
    expect(coeur('poussee-costaud')).toEqual(['pompe-classique', 'pont-fessier', 'pompe-archer', 'hollow-hold', 'pompe-diamant']);
    expect(coeur('dos-tonique')).toEqual(['tirage-yt', 'planche-laterale', 'pont-fessier', 'tirage-yt', 'planche-laterale']);
  });

  it('ne demande plus aucun meuble, dans aucun des 13 circuits', () => {
    for (const c of CIRCUITS) {
      const seance = construireSeanceCircuit(c, { ...BASE, sansMateriel: true, tourEnPlus: true });
      for (const bloc of seance.blocs) {
        expect([c.id, bloc.exercice.id, materielDe(bloc.exercice.id)]).toEqual([c.id, bloc.exercice.id, null]);
      }
    }
  });

  it('ne change ni la durée ni la structure de la séance', () => {
    for (const c of CIRCUITS) {
      const avec = construireSeanceCircuit(c, BASE);
      const sans = construireSeanceCircuit(c, { ...BASE, sansMateriel: true });
      expect(sans.dureeTotaleS).toBe(avec.dureeTotaleS);
      expect(sans.blocs.map((b) => [b.phase, b.transitionS, b.effortS, b.tour, b.cote])).toEqual(
        avec.blocs.map((b) => [b.phase, b.transitionS, b.effortS, b.tour, b.cote]),
      );
    }
  });
});

describe('séance produite', () => {
  it('porte le circuit, son niveau, la graine et les réglages d’un entraînement à la maison', () => {
    const seance = construire('dos-tonique', { graine: 42 });
    expect(seance).toMatchObject({
      circuitId: 'dos-tonique',
      niveau: 2,
      contexteId: 'maison',
      ressenti: 'en_forme',
      graine: 42,
      assouplissement: 0,
      contraintes: { tenue: 'sport', bruit: 'normal', espace: 'un_peu', sol: true },
    });
    expect(construire('jambes-costaud').niveau).toBe(3);
    expect(construire('full-body-doux').niveau).toBe(1);
    expect(construire('cardio-athletique').niveau).toBe(2);
  });

  it('ne contient que des exercices compatibles avec ses propres contraintes', () => {
    for (const c of CIRCUITS) {
      for (const sansMateriel of [false, true]) {
        const seance = construireSeanceCircuit(c, { ...BASE, sansMateriel, tourEnPlus: true });
        for (const bloc of seance.blocs) {
          expect([c.id, bloc.exercice.id, respecteContraintes(bloc.exercice, seance.contraintes)]).toEqual([
            c.id,
            bloc.exercice.id,
            true,
          ]);
        }
      }
    }
  });

  it('est construite à l’identique pour les mêmes options', () => {
    expect(construire('poussee-costaud', { tourEnPlus: true })).toEqual(construire('poussee-costaud', { tourEnPlus: true }));
  });

  it('refuse un exercice inconnu plutôt que de bâtir une séance trouée', () => {
    const [, ...suite] = circuit('full-body-doux').postes;
    const faux: Circuit = { ...circuit('full-body-doux'), postes: [{ exerciceId: 'inconnu' }, ...suite] };
    expect(() => construireSeanceCircuit(faux, BASE)).toThrow('Exercice inconnu dans un circuit : inconnu');
  });
});
