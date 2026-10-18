import { render, screen } from '@testing-library/react-native';

import { Logo, Marque } from './Logo';

describe('Logo', () => {
  it('a le libellé « Flash Coach » et le rôle image', async () => {
    await render(<Logo taille={48} />);
    expect(screen.getByRole('image', { name: 'Flash Coach' })).toBeTruthy();
  });

  it('prend la taille demandée, du favicon à l’icône d’app', async () => {
    await render(<Logo taille={24} />);
    expect(screen.getByLabelText('Flash Coach')).toHaveStyle({ width: 24, height: 24 });
  });
});

describe('Marque', () => {
  it('se lit une seule fois, comme le titre « Flash Coach »', async () => {
    await render(<Marque />);
    expect(screen.getByRole('header', { name: 'Flash Coach' })).toBeTruthy();
    expect(screen.queryByRole('image')).toBeNull();
  });
});
