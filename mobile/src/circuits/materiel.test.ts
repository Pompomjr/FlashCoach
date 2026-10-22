import { materielDe } from './materiel';

describe('materielDe', () => {
  it('demande une chaise pour les exercices qui s’appuient dessus', () => {
    for (const id of ['pompe-inclinee', 'dips-chaise', 'squat-bulgare', 'pompe-pieds-sureleves', 'assis-debout']) {
      expect(materielDe(id)).toBe('chaise');
    }
  });

  it('demande une table pour les tractions sous la table', () => {
    expect(materielDe('tractions-australiennes')).toBe('table');
  });

  it('ne demande rien pour les autres exercices', () => {
    for (const id of ['pompe-classique', 'squat-lent', 'inconnu', 'toString']) {
      expect(materielDe(id)).toBeNull();
    }
  });
});
