import { choisirLancement, lancementDisponible, parametresLancement } from '../src/seance/lancement';

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
      contexte: 'reveil', ressenti: 'raide', duree: '5', graine: '123', exclure: 'a,b',
    });
    expect(parametresLancement(derniers, [], 0).exclure).toBe('');
  });

  it.each([3, 5, 10] as const)('conserve la durée %s autorisée par le départ', (duree) => {
    const choix = choisirLancement({ duree: String(duree) });
    expect(choix.duree).toBe(duree);
    expect(lancementDisponible(choix)).toBe(true);
  });
});
