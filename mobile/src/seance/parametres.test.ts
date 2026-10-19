import { lireParametresSeance } from './parametres';

describe('lireParametresSeance', () => {
  it('reconstruit les paramètres de la séance depuis l’URL', () => {
    expect(
      lireParametresSeance({ contexte: 'maison', ressenti: 'mou', duree: '5', graine: '42', exclure: 'planche,squat-lent' }),
    ).toEqual({
      contexteId: 'maison',
      contraintes: { tenue: 'sport', bruit: 'normal', espace: 'un_peu', sol: true },
      ressenti: 'mou',
      duree: 5,
      graine: 42,
      exclure: ['planche', 'squat-lent'],
      niveau: 1,
    });
  });

  it('lit le niveau de l’URL : absent ou invalide → 1, sans invalider la séance', () => {
    const base = { contexte: 'maison', ressenti: 'mou', duree: '5', graine: '1' };
    expect(lireParametresSeance(base)?.niveau).toBe(1);
    expect(lireParametresSeance({ ...base, niveau: '3' })?.niveau).toBe(3);
    expect(lireParametresSeance({ ...base, niveau: '9' })?.niveau).toBe(1);
    expect(lireParametresSeance({ ...base, niveau: 'x' })?.niveau).toBe(1);
  });

  it('accepte une liste d’exercices à éviter vide ou absente', () => {
    expect(lireParametresSeance({ contexte: 'reveil', ressenti: 'raide', duree: '3', graine: '1' })?.exclure).toEqual([]);
    expect(lireParametresSeance({ contexte: 'reveil', ressenti: 'raide', duree: '3', graine: '1', exclure: '' })?.exclure).toEqual([]);
  });

  it('prend la première valeur quand un paramètre est répété', () => {
    expect(lireParametresSeance({ contexte: ['maison', 'reveil'], ressenti: 'mou', duree: '5', graine: '1' })?.contexteId).toBe('maison');
  });

  it('refuse des paramètres invalides ou un contexte Premium', () => {
    expect(lireParametresSeance({ contexte: 'bureau', ressenti: 'mou', duree: '5', graine: '1' })).toBeNull();
    expect(lireParametresSeance({ contexte: 'lune', ressenti: 'mou', duree: '5', graine: '1' })).toBeNull();
    expect(lireParametresSeance({ contexte: 'maison', ressenti: 'fatigue', duree: '5', graine: '1' })).toBeNull();
    expect(lireParametresSeance({ contexte: 'maison', ressenti: 'mou', duree: '7', graine: '1' })).toBeNull();
    expect(lireParametresSeance({ contexte: 'maison', ressenti: 'mou', duree: '5' })).toBeNull();
  });
});
