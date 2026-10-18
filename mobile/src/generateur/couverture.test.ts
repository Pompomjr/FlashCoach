import { CONTEXTES } from '../catalogue/contextes';
import { EXERCICES } from '../catalogue/exercices';
import type { Contexte, Exercice } from '../catalogue/types';
import { fabriquerExercice, SANS_CONTRAINTE } from '../test-utils/fabrique';
import { analyserCouverture, formaterRapport, type Manque } from './couverture';

const LIBRE: Contexte = { id: 'libre', nom: 'Libre', emoji: '✨', premium: false, ordre: 1, contraintes: SANS_CONTRAINTE };
const SILENCE: Contexte = { ...LIBRE, id: 'silence', contraintes: { ...SANS_CONTRAINTE, bruit: 'silencieux' } };

// 8 exercices par famille : assez pour toutes les phases et tous les ressentis, même en 10 minutes.
function serie(prefixe: string, surcharge: Partial<Exercice>): Exercice[] {
  return Array.from({ length: 8 }, (_, i) => fabriquerExercice({ id: `${prefixe}-${i}`, ...surcharge }));
}
const COMPLET: Exercice[] = [
  ...serie('mob', { effets: ['mobilite'], intensite: 1 }),
  ...serie('det', { effets: ['detente'], intensite: 1 }),
  ...serie('ene', { effets: ['energie'], intensite: 2 }),
];

describe('analyserCouverture', () => {
  it('ne signale rien quand le catalogue suffit partout', () => {
    expect(analyserCouverture(COMPLET, [LIBRE])).toEqual([]);
  });

  it('signale le retour au calme une seule fois par contexte, quel que soit le ressenti', () => {
    const catalogue = [...COMPLET.filter((ex) => !ex.id.startsWith('det-')), fabriquerExercice({ id: 'det-seul', effets: ['detente'], intensite: 1 })];
    const retour = analyserCouverture(catalogue, [LIBRE]).filter((m) => m.phase === 'retour_au_calme');
    expect(retour).toEqual([
      {
        contexteId: 'libre',
        ressenti: null,
        phase: 'retour_au_calme',
        cible: { effet: 'detente', intensiteMin: 1, intensiteMax: 1 },
        disponibles: 1,
        besoins: { 3: 2, 5: 2, 10: 2 },
      },
    ]);
  });

  it('signale le cœur seulement pour le ressenti qui manque, et seulement aux durées concernées', () => {
    // 4 exercices d'énergie en intensité 1 et 4 en intensité 2 : 8 pour « mou » (1-2),
    // mais seulement 4 pour « en forme » (2-3), alors qu'il en faut 8 en 10 min.
    const catalogue = [
      ...COMPLET.filter((ex) => !ex.id.startsWith('ene-')),
      ...serie('ene', { effets: ['energie'], intensite: 1 }).slice(0, 4),
      ...serie('fort', { effets: ['energie'], intensite: 2 }).slice(0, 4),
    ];
    const coeur = analyserCouverture(catalogue, [LIBRE]).filter((m) => m.phase === 'coeur');
    expect(coeur.map((m) => [m.ressenti, m.disponibles, m.besoins])).toEqual([['en_forme', 4, { 10: 8 }]]);
  });

  it('signale un contexte sans aucun exercice compatible, sans planter', () => {
    const saut = fabriquerExercice({ id: 'saut', sauts: true });
    const total = analyserCouverture([saut], [SILENCE]).find((m) => m.phase === 'total');
    expect(total).toMatchObject({ contexteId: 'silence', disponibles: 0, besoins: { 3: 5, 5: 8, 10: 13 } });
  });

  it('ne dépend d’aucun tirage : l’ordre du catalogue ne change rien', () => {
    expect(analyserCouverture([...EXERCICES].reverse(), CONTEXTES)).toEqual(analyserCouverture(EXERCICES, CONTEXTES));
  });

  it('trouve le manque du bureau pour « mou » dans le catalogue embarqué', () => {
    const rapport = formaterRapport(analyserCouverture(EXERCICES, CONTEXTES));
    expect(rapport).toContain(
      '- bureau + mou, cœur (énergie, intensité 1-2) : 1 disponible(s), il en faut 2 en 3 min, 4 en 5 min, 8 en 10 min',
    );
  });
});

describe('formaterRapport', () => {
  it('annonce un catalogue complet', () => {
    expect(formaterRapport([])).toBe('Catalogue complet : toutes les combinaisons sont idéales.');
  });

  it('écrit une ligne lisible par manque', () => {
    const total: Manque = { contexteId: 'bureau', ressenti: null, phase: 'total', cible: null, disponibles: 4, besoins: { 3: 5, 5: 8, 10: 13 } };
    const coeur: Manque = {
      contexteId: 'maison',
      ressenti: 'en_forme',
      phase: 'coeur',
      cible: { effet: 'energie', intensiteMin: 2, intensiteMax: 3 },
      disponibles: 6,
      besoins: { 10: 8 },
    };
    expect(formaterRapport([total, coeur])).toBe(
      [
        '2 manque(s) à combler :',
        '- bureau, exercices différents (tous compatibles) : 4 disponible(s), il en faut 5 en 3 min, 8 en 5 min, 13 en 10 min',
        '- maison + en_forme, cœur (énergie, intensité 2-3) : 6 disponible(s), il en faut 8 en 10 min',
      ].join('\n'),
    );
  });
});
