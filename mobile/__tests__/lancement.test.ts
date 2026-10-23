import { choisirLancement, lancementDisponible, objectifProvisoire, parametresLancement } from '../src/seance/lancement';

describe('lancement commun', () => {
  const derniers = { contexteId: 'reveil', ressenti: 'raide' as const, duree: 5 as const };

  it('utilise maison, mou et 5 sans choix enregistrés', () => {
    expect(choisirLancement({})).toEqual({ contexteId: 'maison', ressenti: 'mou', duree: 5 });
  });

  it('reprend les derniers choix pour les paramètres absents', () => {
    expect(choisirLancement({}, derniers)).toEqual(derniers);
  });

  it.each(['abc', '0', '4', 'Infinity', ''])('ignore la durée invalide %s et les valeurs inconnues', (duree) => {
    expect(choisirLancement({ contexte: 'inconnu', ressenti: 'inconnu', duree }, derniers)).toEqual(derniers);
  });

  it('remplace chaque choix indépendamment et prend la première valeur répétée', () => {
    expect(choisirLancement({ contexte: ['maison', 'bureau'], ressenti: 'stresse' }, derniers))
      .toEqual({ contexteId: 'maison', ressenti: 'stresse', duree: 5 });
  });

  it.each(['bureau', 'voyage', 'dehors'])('reconnaît mais refuse le contexte Premium %s', (contexte) => {
    const choix = choisirLancement({ contexte });
    expect(choix.contexteId).toBe(contexte);
    expect(lancementDisponible(choix)).toBe(false);
  });

  it('produit les paramètres de séance avec la graine fournie et les derniers exercices', () => {
    expect(lancementDisponible(derniers)).toBe(true);
    expect(parametresLancement(derniers, ['a', 'b'], 123)).toEqual({
      objectif: 'etirements', contexte: 'reveil', ressenti: 'raide', duree: '5', graine: '123', exclure: 'a,b', niveau: '1',
    });
    expect(parametresLancement(derniers, [], 0).exclure).toBe('');
  });

  it('ajoute le niveau aux paramètres (1 par défaut)', () => {
    expect(parametresLancement(derniers, [], 0).niveau).toBe('1');
    expect(parametresLancement(derniers, [], 0, 3).niveau).toBe('3');
  });

  it('ajoute l’objectif provisoire : étirements pour raide et stressé, calories pour mou et en forme', () => {
    expect(objectifProvisoire('raide')).toBe('etirements');
    expect(objectifProvisoire('stresse')).toBe('etirements');
    expect(objectifProvisoire('mou')).toBe('calories');
    expect(objectifProvisoire('en_forme')).toBe('calories');
    expect(parametresLancement({ ...derniers, ressenti: 'mou' }, [], 0).objectif).toBe('calories');
  });

  it('refuse la durée 3, supprimée', () => {
    expect(choisirLancement({ duree: '3' }, derniers).duree).toBe(5);
  });

  it.each([5, 10, 15, 30] as const)('conserve la durée %s autorisée par le départ', (duree) => {
    const choix = choisirLancement({ duree: String(duree) });
    expect(choix.duree).toBe(duree);
    expect(lancementDisponible(choix)).toBe(true);
  });
});
