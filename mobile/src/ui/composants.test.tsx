import { fireEvent, render, screen } from '@testing-library/react-native';

import { Bouton } from './Bouton';
import { CarteOption } from './CarteOption';

describe('CarteOption', () => {
  it('a le rôle bouton, le libellé comme nom accessible et l’état sélectionné', async () => {
    await render(<CarteOption libelle="Au réveil" selectionne onPress={() => undefined} />);
    expect(screen.getByRole('button', { name: 'Au réveil' })).toBeSelected();
  });

  it('n’est pas sélectionnée quand elle ne l’est pas', async () => {
    await render(<CarteOption libelle="Au réveil" selectionne={false} onPress={() => undefined} />);
    expect(screen.getByRole('button', { name: 'Au réveil' })).not.toBeSelected();
  });

  it('appelle onPress au clic', async () => {
    const onPress = jest.fn();
    await render(<CarteOption libelle="Au réveil" selectionne={false} onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Au réveil' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('annonce « Premium » dans le nom quand elle est verrouillée', async () => {
    await render(<CarteOption libelle="Au bureau" selectionne={false} verrouille onPress={() => undefined} />);
    expect(screen.getByRole('button', { name: 'Au bureau, Premium' })).toBeTruthy();
  });

  it('garde un texte lisible sur l’orange quand elle est sélectionnée et verrouillée', async () => {
    await render(<CarteOption libelle="Au bureau" selectionne verrouille onPress={() => undefined} />);
    expect(screen.getByText(/Au bureau/)).toHaveStyle({ color: '#000000' });
    expect(screen.getByText(/Au bureau/)).not.toHaveStyle({ color: '#CBD5E0' });
  });
});

describe('Bouton', () => {
  it('a le rôle bouton, le libellé comme nom et appelle onPress au clic', async () => {
    const onPress = jest.fn();
    await render(<Bouton libelle="C’est parti" onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button', { name: 'C’est parti' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
