import { circuitParId } from '../circuits/circuits';
import { lireParametresCircuit, lireParametresSeance } from './parametres';

describe('lireParametresSeance', () => {
  it('reconstruit les paramètres de la séance depuis l’URL', () => {
    expect(
      lireParametresSeance({ objectif: 'calories', duree: '5', graine: '42', exclure: 'planche,squat-lent' }),
    ).toEqual({
      objectif: 'calories',
      duree: 5,
      graine: 42,
      exclure: ['planche', 'squat-lent'],
      niveau: 1,
    });
  });

  it('accepte les deux objectifs générés et les durées 5, 10, 15 et 30', () => {
    for (const objectif of ['calories', 'etirements']) {
      for (const duree of ['5', '10', '15', '30']) {
        expect(lireParametresSeance({ objectif, duree, graine: '1' })).toMatchObject({ objectif, duree: Number(duree) });
      }
    }
  });

  it('lit le niveau de l’URL : absent ou invalide → 1, sans invalider la séance', () => {
    const base = { objectif: 'calories', duree: '5', graine: '1' };
    expect(lireParametresSeance(base)?.niveau).toBe(1);
    expect(lireParametresSeance({ ...base, niveau: '3' })?.niveau).toBe(3);
    expect(lireParametresSeance({ ...base, niveau: '9' })?.niveau).toBe(1);
    expect(lireParametresSeance({ ...base, niveau: 'x' })?.niveau).toBe(1);
  });

  it('accepte une liste d’exercices à éviter vide ou absente', () => {
    expect(lireParametresSeance({ objectif: 'etirements', duree: '10', graine: '1' })?.exclure).toEqual([]);
    expect(lireParametresSeance({ objectif: 'etirements', duree: '10', graine: '1', exclure: '' })?.exclure).toEqual([]);
  });

  it('prend la première valeur quand un paramètre est répété', () => {
    expect(lireParametresSeance({ objectif: ['etirements', 'calories'], duree: '5', graine: '1' })?.objectif).toBe('etirements');
  });

  it('refuse des paramètres invalides', () => {
    expect(lireParametresSeance({ objectif: 'lune', duree: '5', graine: '1' })).toBeNull();
    expect(lireParametresSeance({ objectif: 'calories', duree: '7', graine: '1' })).toBeNull();
    expect(lireParametresSeance({ objectif: 'calories', duree: '5' })).toBeNull();
  });

  it('refuse la durée 3, supprimée, et la prise de masse (jouée par un circuit)', () => {
    expect(lireParametresSeance({ objectif: 'calories', duree: '3', graine: '1' })).toBeNull();
    expect(lireParametresSeance({ objectif: 'masse', duree: '5', graine: '1' })).toBeNull();
  });

  it('refuse un ancien lien par contexte et ressenti, sans objectif', () => {
    expect(lireParametresSeance({ contexte: 'maison', ressenti: 'mou', duree: '5', graine: '1' })).toBeNull();
  });
});

describe('lireParametresCircuit', () => {
  const base = { circuit: 'full-body-costaud', sansMateriel: '0', tourEnPlus: '0', graine: '42' };

  it('reconstruit le circuit et ses options depuis l’URL', () => {
    expect(lireParametresCircuit(base)).toEqual({
      circuit: circuitParId('full-body-costaud'),
      sansMateriel: false,
      tourEnPlus: false,
      graine: 42,
    });
    expect(lireParametresCircuit({ ...base, sansMateriel: '1', tourEnPlus: '1' })).toMatchObject({ sansMateriel: true, tourEnPlus: true });
  });

  it('prend « 0 » et « 1 » pour faux et vrai, tout le reste pour faux', () => {
    for (const valeur of [undefined, '', '2', 'true', 'oui', '-1']) {
      expect(lireParametresCircuit({ ...base, sansMateriel: valeur, tourEnPlus: valeur })).toMatchObject({ sansMateriel: false, tourEnPlus: false });
    }
  });

  it('prend la première valeur quand un paramètre est répété', () => {
    expect(lireParametresCircuit({ ...base, circuit: ['dos-doux', 'full-body-doux'], sansMateriel: ['1', '0'] })).toMatchObject({
      circuit: circuitParId('dos-doux'),
      sansMateriel: true,
    });
  });

  it('refuse un circuit absent ou inconnu', () => {
    expect(lireParametresCircuit({ ...base, circuit: undefined })).toBeNull();
    expect(lireParametresCircuit({ ...base, circuit: 'lune' })).toBeNull();
    expect(lireParametresCircuit({ ...base, circuit: 'toString' })).toBeNull();
  });

  it('refuse une graine absente ou invalide', () => {
    expect(lireParametresCircuit({ ...base, graine: undefined })).toBeNull();
    expect(lireParametresCircuit({ ...base, graine: '' })).toBeNull();
    expect(lireParametresCircuit({ ...base, graine: 'abc' })).toBeNull();
    expect(lireParametresCircuit({ ...base, graine: 'Infinity' })).toBeNull();
  });
});
