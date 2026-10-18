import { contexteDisponible } from './acces';

describe('contexteDisponible', () => {
  it('ouvre seulement les contextes gratuits tant que l’abonnement n’existe pas', () => {
    expect(['reveil', 'maison', 'bureau', 'voyage', 'dehors', 'inconnu'].filter((id) => contexteDisponible(id))).toEqual([
      'reveil',
      'maison',
    ]);
  });
});
