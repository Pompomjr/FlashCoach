import { CONTEXTES } from '../catalogue/contextes';
import { EXERCICES } from '../catalogue/exercices';
import type { Contexte } from '../catalogue/types';
import { fabriquerExercice, SANS_CONTRAINTE } from '../test-utils/fabrique';
import { analyserCouverture, formaterRapport, type LigneCouverture } from './couverture';

const LIBRE: Contexte = { id: 'libre', nom: 'Libre', emoji: '✨', premium: false, ordre: 1, contraintes: SANS_CONTRAINTE };
const SILENCE: Contexte = { ...LIBRE, id: 'silence', contraintes: { ...SANS_CONTRAINTE, bruit: 'silencieux' } };

describe('analyserCouverture', () => {
  const catalogue = [
    fabriquerExercice({ id: 'mob', effets: ['mobilite'], intensite: 1 }),
    fabriquerExercice({ id: 'det', effets: ['detente'], intensite: 1 }),
    fabriquerExercice({ id: 'saut', sauts: true, effets: ['energie'], intensite: 2 }),
  ];

  it('produit une ligne par contexte et par ressenti', () => {
    expect(analyserCouverture(catalogue, [LIBRE, SILENCE])).toHaveLength(8);
  });

  it('compte les exercices compatibles et ceux qui collent au ressenti', () => {
    const ligne = analyserCouverture(catalogue, [LIBRE]).find((l) => l.ressenti === 'mou');
    expect(ligne?.compatibles).toBe(3);
    expect(ligne?.ideaux).toBe(1);
  });

  it('signale un contexte sans aucun exercice compatible, sans planter', () => {
    const lignes = analyserCouverture([catalogue[2]], [SILENCE]);
    expect(lignes.every((l) => l.compatibles === 0)).toBe(true);
    expect(lignes[0].assouplissement).toEqual({ 3: 3, 5: 3, 10: 3 });
  });

  it('fonctionne sur le catalogue embarqué', () => {
    expect(analyserCouverture(EXERCICES, CONTEXTES)).toHaveLength(20);
  });
});

describe('formaterRapport', () => {
  const ideale: LigneCouverture = {
    contexteId: 'maison',
    ressenti: 'mou',
    compatibles: 8,
    ideaux: 5,
    assouplissement: { 3: 0, 5: 0, 10: 0 },
  };

  it('annonce un catalogue complet', () => {
    expect(formaterRapport([ideale])).toBe('Catalogue complet : toutes les combinaisons sont idéales.');
  });

  it('liste les combinaisons à compléter', () => {
    const manque: LigneCouverture = {
      ...ideale,
      contexteId: 'bureau',
      compatibles: 4,
      ideaux: 1,
      assouplissement: { 3: 0, 5: 1, 10: 3 },
    };
    const rapport = formaterRapport([ideale, manque]);
    expect(rapport).toContain('1 combinaison(s) sur 2 à compléter :');
    expect(rapport).toContain(
      '- bureau + mou : 1 exercice(s) idéal(aux) sur 4 compatible(s) (3 min : idéal, 5 min : intensité assouplie, 10 min : exercices répétés)',
    );
    expect(rapport).not.toContain('- maison');
  });
});
