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

  it('met le logo en grand au-dessus du nom, plus petit sur un écran court', async () => {
    const largeurLogo = () =>
      screen
        .getAllByLabelText('Flash Coach', { includeHiddenElements: true })
        .map((element) => element.props.style?.width)
        .find((largeur) => largeur !== undefined);
    await render(<Marque />);
    expect(screen.getByText('Flash Coach', { includeHiddenElements: true })).toBeTruthy();
    expect(largeurLogo()).toBe(76);
    await screen.rerender(<Marque compacte />);
    expect(largeurLogo()).toBe(40);
  });
});
