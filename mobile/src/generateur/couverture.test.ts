import { EXERCICES } from '../catalogue/exercices';
import {
  DUREES,
  NIVEAUX,
  type Effet,
  type Exercice,
  type Intensite,
  type Niveau,
  type Objectif,
  type Zone,
} from '../catalogue/types';
import { fabriquerExercice } from '../test-utils/fabrique';
import { creerAleatoire } from './aleatoire';
import {
  analyserCouverture,
  analyserRabattements,
  formaterRabattements,
  formaterRapport,
  type Manque,
  type Rabattement,
} from './couverture';
import { genererSeance } from './generer';
import { OBJECTIFS_GENERES } from './types';

function serie(prefixe: string, nombre: number, surcharge: Partial<Exercice>): Exercice[] {
  return Array.from({ length: nombre }, (_, i) => fabriquerExercice({ id: `${prefixe}-${i}`, ...surcharge }));
}
// Assez pour les deux objectifs à toutes les durées : jusqu'à 6 mises en route (30 min), 8 places de cœur (10 min),
// 5 retours au calme (30 min) ; les étirements prennent leur cœur dans la mobilité et la détente.
const COMPLET: Exercice[] = [
  ...serie('mob', 14, { effets: ['mobilite'], intensite: 1 }),
  ...serie('det', 5, { effets: ['detente'], intensite: 1 }),
  ...serie('ene', 8, { effets: ['energie'], intensite: 2 }),
];
const sans = (prefixe: string) => COMPLET.filter((ex) => !ex.id.startsWith(`${prefixe}-`));

const GRAINES = [1, 2, 3, 42, 2026];
const ZONES: Zone[] = ['haut', 'bas', 'tronc', 'global'];

describe('analyserCouverture', () => {
  it('ne signale rien quand le catalogue suffit partout', () => {
    expect(analyserCouverture(COMPLET)).toEqual([]);
  });

  it('ne compte pas deux fois un exercice que se disputent le cœur « étirements » et le retour au calme', () => {
    // 6 mobilités et 9 détentes : en 30 min, la mise en route prend les 6 mobilités, le cœur 5 détentes,
    // il n'en reste que 4 pour les 5 retours au calme.
    const catalogue = [
      ...serie('mob', 6, { effets: ['mobilite'], intensite: 1 }),
      ...serie('det', 9, { effets: ['detente'], intensite: 1 }),
      ...serie('ene', 8, { effets: ['energie'], intensite: 2 }),
    ];
    expect(analyserCouverture(catalogue)).toEqual([
      {
        objectif: 'etirements',
        duree: 30,
        phase: 'retour_au_calme',
        cible: { effet: 'detente', intensiteMin: 1, intensiteMax: 1 },
        disponibles: 4,
        besoin: 5,
      },
    ]);
  });

  it('signale le cœur seulement pour l’objectif qui manque, et seulement aux durées concernées', () => {
    // 7 cardios : assez pour 4 places (5 min) et 5 postes (15 et 30 min), pas pour 8 places (10 min).
    const catalogue = [...sans('ene'), ...serie('ene', 7, { effets: ['energie'], intensite: 2 })];
    const manques = analyserCouverture(catalogue);
    expect(manques.map((m) => [m.objectif, m.phase, m.duree, m.disponibles, m.besoin])).toEqual([
      ['calories', 'coeur', 10, 7, 8],
    ]);
  });

  it('ne prend pour les calories que les exercices de cet objectif, à l’intensité du niveau', () => {
    const renfo = serie('renfo', 8, { effets: ['energie'], intensite: 2, objectifs: ['masse'] });
    const doux = serie('doux', 8, { effets: ['energie'], intensite: 1 });
    const catalogue = [...sans('ene'), ...renfo, ...doux];
    // Léger (1-2) : les 8 cardios doux suffisent ; Moyen (2-3) : aucun cardio, le renforcement ne compte pas.
    expect(analyserCouverture(catalogue, 1)).toEqual([]);
    expect(analyserCouverture(catalogue, 2).map((m) => [m.objectif, m.phase, m.duree, m.disponibles])).toEqual([
      ['calories', 'coeur', 5, 0],
      ['calories', 'coeur', 10, 0],
      ['calories', 'coeur', 15, 0],
      ['calories', 'coeur', 30, 0],
    ]);
  });

  it('signale toutes les places quand aucun exercice n’est disponible à ce niveau, sans planter', () => {
    const manques = analyserCouverture(COMPLET.map((e) => ({ ...e, niveau: 2 as const })), 1);
    expect(manques).toHaveLength(OBJECTIFS_GENERES.length * DUREES.length * 3);
    expect(manques.every((m) => m.disponibles === 0)).toBe(true);
  });

  it('ne dépend d’aucun tirage : l’ordre du catalogue ne change rien', () => {
    for (const niveau of NIVEAUX) {
      expect(analyserCouverture([...EXERCICES].reverse(), niveau)).toEqual(analyserCouverture(EXERCICES, niveau));
    }
  });

  // Manque connu, signalé sans toucher aux données : en Léger, seuls 7 cardios ont une intensité 1-2 et un niveau 1.
  it('sur le catalogue embarqué, en Léger, ne manque qu’un cardio au cœur « calories » de 10 min', () => {
    expect(analyserCouverture(EXERCICES, 1).map((m) => [m.objectif, m.phase, m.duree, m.disponibles, m.besoin])).toEqual([
      ['calories', 'coeur', 10, 7, 8],
    ]);
  });

  it('sur le catalogue embarqué, est complet en Moyen ; en Lourd, le cœur « calories » de 10 min n’a que 6 cardios d’intensité 3', () => {
    expect(analyserCouverture(EXERCICES, 2)).toEqual([]);
    expect(analyserCouverture(EXERCICES, 3).map((m) => [m.objectif, m.phase, m.duree, m.disponibles, m.besoin])).toEqual([
      ['calories', 'coeur', 10, 6, 8],
    ]);
  });

  it('sur le catalogue embarqué, les étirements sont complets à toutes les intensités et durées', () => {
    for (const niveau of NIVEAUX) {
      expect(analyserCouverture(EXERCICES, niveau).filter((m) => m.objectif === 'etirements')).toEqual([]);
    }
  });
});

// Le rapport et le générateur doivent dire la même chose : sans manque signalé, aucune séance n'assouplit.
describe('couverture et générateur', () => {
  // Renvoie le nombre de combinaisons sans manque, donc vérifiées.
  function verifier(catalogue: Exercice[], niveau: Niveau = 1, exclure: string[] = []): number {
    const manques = analyserCouverture(catalogue, niveau);
    let verifiees = 0;
    for (const objectif of OBJECTIFS_GENERES) {
      for (const duree of DUREES) {
        if (manques.some((m) => m.objectif === objectif && m.duree === duree)) continue;
        for (const graine of GRAINES) {
          const seance = genererSeance({ objectif, duree, graine, niveau, exclure }, catalogue);
          expect({ objectif, duree, graine, niveau, assouplissement: seance.assouplissement }).toEqual({
            objectif,
            duree,
            graine,
            niveau,
            assouplissement: 0,
          });
        }
        verifiees++;
      }
    }
    return verifiees;
  }

  it('sur le catalogue embarqué, à chaque intensité', () => {
    for (const niveau of NIVEAUX) {
      expect(verifier(EXERCICES, niveau)).toBeGreaterThan(0);
    }
  });

  it('sur un catalogue complet', () => {
    expect(verifier(COMPLET)).toBe(OBJECTIFS_GENERES.length * DUREES.length);
  });

  it('à la limite, quand mise en route, cœur « étirements » et retour au calme se disputent les mêmes exercices', () => {
    // Exactement de quoi remplir 10 min d'étirements : 3 + 8 places de mobilité, 2 de détente, dont des exercices mixtes.
    const catalogue = [
      ...serie('mob1', 3, { effets: ['mobilite'], intensite: 1 }),
      ...serie('mob2', 6, { effets: ['mobilite'], intensite: 2 }),
      ...serie('mixte', 3, { effets: ['mobilite', 'detente'], intensite: 1 }),
      ...serie('det', 1, { effets: ['detente'], intensite: 1 }),
      ...serie('ene', 8, { effets: ['energie'], intensite: 2 }),
    ];
    const manques = analyserCouverture(catalogue);
    expect(manques.some((m) => m.objectif === 'etirements' && m.duree === 10)).toBe(false);
    expect(verifier(catalogue)).toBeGreaterThan(0);
  });

  it('sur des catalogues aléatoires, même en excluant une partie des exercices', () => {
    const alea = creerAleatoire(7);
    const entier = (min: number, max: number) => min + Math.floor(alea() * (max - min + 1));
    const COMBINAISONS_EFFETS: Effet[][] = [
      ['mobilite'],
      ['detente'],
      ['energie'],
      ['mobilite', 'detente'],
      ['mobilite', 'energie'],
      ['detente', 'energie'],
      ['mobilite', 'detente', 'energie'],
    ];
    const OBJECTIFS_ENERGIE: Objectif[][] = [['calories'], ['masse'], ['calories', 'masse'], ['masse', 'etirements']];
    const echecs: string[] = [];
    let verifiees = 0;
    for (let essai = 0; essai < 300; essai++) {
      const catalogue = Array.from({ length: entier(10, 45) }, (_, i) => {
        const effets = COMBINAISONS_EFFETS[entier(0, COMBINAISONS_EFFETS.length - 1)];
        return fabriquerExercice({
          id: `e${i}`,
          effets,
          objectifs: effets.includes('energie') ? OBJECTIFS_ENERGIE[entier(0, OBJECTIFS_ENERGIE.length - 1)] : ['etirements'],
          intensite: entier(1, 3) as Intensite,
          niveau: entier(1, 3) as Niveau,
          zone: ZONES[entier(0, ZONES.length - 1)],
        });
      });
      const exclure = catalogue.filter(() => alea() < 0.3).map((ex) => ex.id);
      const niveau = entier(1, 3) as Niveau;
      const manques = analyserCouverture(catalogue, niveau);
      for (const objectif of OBJECTIFS_GENERES) {
        for (const duree of DUREES) {
          if (manques.some((m) => m.objectif === objectif && m.duree === duree)) continue;
          verifiees++;
          for (const graine of GRAINES) {
            const seance = genererSeance({ objectif, duree, graine, niveau, exclure }, catalogue);
            if (seance.assouplissement !== 0) {
              const description = catalogue.map((ex) => `${ex.id} ${ex.effets.join('+')}/${ex.intensite}`).join(', ');
              echecs.push(`${objectif} ${duree} min, niveau ${niveau}, graine ${graine}, palier ${seance.assouplissement} : ${description}`);
            }
          }
        }
      }
    }
    expect(echecs).toEqual([]);
    expect(verifiees).toBeGreaterThan(100);
  });
});

describe('analyserCouverture par niveau', () => {
  it('ignore les exercices d’un niveau supérieur à celui demandé', () => {
    const catalogue = [...sans('ene'), ...serie('ene', 8, { effets: ['energie'], intensite: 2, niveau: 2 })];
    expect(analyserCouverture(catalogue).some((m) => m.phase === 'coeur')).toBe(true);
    expect(analyserCouverture(catalogue, 1).some((m) => m.phase === 'coeur')).toBe(true);
    expect(analyserCouverture(catalogue, 2)).toEqual([]);
  });
});

describe('analyserRabattements', () => {
  it('ne signale rien quand le cœur est entièrement au niveau', () => {
    const catalogue = [...sans('ene'), ...serie('ene', 8, { effets: ['energie'], intensite: 2, niveau: 2 })];
    expect(analyserRabattements(catalogue, 2)).toEqual([]);
  });

  it('compte les places du cœur « calories » qui peuvent recevoir un exercice idéal du niveau exact', () => {
    // 3 cardios de niveau 2 : le cœur compte 4 places en 5 min, 8 en 10 min, 5 postes en 15 et 30 min.
    const catalogue = [...COMPLET, ...serie('moyen', 3, { effets: ['energie'], intensite: 2, niveau: 2 })];
    const rabattements = analyserRabattements(catalogue, 2);
    expect(rabattements.map((r) => [r.duree, r.auNiveau, r.places])).toEqual([
      [5, 3, 4],
      [10, 3, 8],
      [15, 3, 5],
      [30, 3, 5],
    ]);
    expect(rabattements[0]).toEqual({ objectif: 'calories', duree: 5, auNiveau: 3, places: 4 });
  });

  it('signale tout le cœur quand aucun exercice n’existe à ce niveau', () => {
    const rabattements = analyserRabattements(COMPLET, 3);
    expect(rabattements).toHaveLength(DUREES.length);
    expect(rabattements.every((r) => r.auNiveau === 0)).toBe(true);
  });

  // Les étirements n'ont que des exercices de niveau 1 : le niveau ne fait qu'y plafonner la difficulté,
  // ils ne sont donc jamais « rabattus ».
  it('ne concerne que les calories', () => {
    const etirements = serie('eti', 20, { effets: ['mobilite'], intensite: 1 });
    expect(analyserRabattements([...etirements, ...serie('ene', 8, { effets: ['energie'], intensite: 3, niveau: 3 })], 3)).toEqual([]);
  });

  it('sur le catalogue embarqué : 3 cardios de niveau 2 (Moyen) et 2 de niveau 3 (Lourd)', () => {
    const lignes = (niveau: Niveau) => analyserRabattements(EXERCICES, niveau).map((r) => `${r.duree}: ${r.auNiveau}/${r.places}`);
    expect(lignes(2)).toEqual(['5: 3/4', '10: 3/8', '15: 3/5', '30: 3/5']);
    expect(lignes(3)).toEqual(['5: 2/4', '10: 2/8', '15: 2/5', '30: 2/5']);
  });

  it('le contrôle voit bien un rabattement quand les exercices de niveau 2 ou 3 disparaissent', () => {
    const niveau1 = EXERCICES.filter((e) => e.niveau === 1);
    expect(analyserRabattements(niveau1, 2).every((r) => r.auNiveau === 0)).toBe(true);
    expect(analyserRabattements(niveau1, 3)).toHaveLength(DUREES.length);
  });
});

describe('formaterRabattements', () => {
  it('annonce un cœur entièrement au niveau', () => {
    expect(formaterRabattements([], 2)).toBe('Intensité Moyen : cœur entièrement au niveau.');
  });

  it('liste une ligne par combinaison', () => {
    const r: Rabattement[] = [{ objectif: 'calories', duree: 5, auNiveau: 0, places: 4 }];
    expect(formaterRabattements(r, 3)).toBe(
      [
        'Intensité Lourd : 1 combinaison(s) rabattue(s) :',
        '- Brûler des calories, 5 min : 0/4 places au niveau, le reste est rabattu',
      ].join('\n'),
    );
  });
});

describe('formaterRapport', () => {
  it('annonce un catalogue complet', () => {
    expect(formaterRapport([])).toBe('Catalogue complet : toutes les combinaisons sont idéales.');
  });

  it('regroupe les durées d’une même phase quand elles ont autant d’exercices disponibles', () => {
    const coeur = { objectif: 'calories', intensiteMin: 1, intensiteMax: 2 } as const;
    const retour = { effet: 'detente', intensiteMin: 1, intensiteMax: 1 } as const;
    const manques: Manque[] = [
      { objectif: 'calories', duree: 5, phase: 'coeur', cible: coeur, disponibles: 3, besoin: 4 },
      { objectif: 'calories', duree: 15, phase: 'coeur', cible: coeur, disponibles: 3, besoin: 5 },
      { objectif: 'calories', duree: 10, phase: 'coeur', cible: coeur, disponibles: 2, besoin: 8 },
      { objectif: 'etirements', duree: 30, phase: 'retour_au_calme', cible: retour, disponibles: 4, besoin: 5 },
    ];
    expect(formaterRapport(manques)).toBe(
      [
        '3 manque(s) à combler :',
        '- Brûler des calories, cœur (cardio, intensité 1-2) : 3 disponible(s), il en faut 4 en 5 min, 5 en 15 min',
        '- Brûler des calories, cœur (cardio, intensité 1-2) : 2 disponible(s), il en faut 8 en 10 min',
        '- Étirements, retour au calme (détente, intensité 1) : 4 disponible(s), il en faut 5 en 30 min',
      ].join('\n'),
    );
  });
});
