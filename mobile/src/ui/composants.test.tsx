import { fireEvent, render, screen, within } from '@testing-library/react-native';
import { Platform, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

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

  it('garde sa hauteur naturelle : pas de flexGrow de base', async () => {
    await render(<Bouton libelle="Seul" onPress={() => undefined} />);
    expect(screen.getByRole('button', { name: 'Seul' })).not.toHaveStyle({ flexGrow: 1 });
  });

  it('applique le style reçu', async () => {
    await render(<Bouton libelle="Côte à côte" onPress={() => undefined} style={{ flex: 1 }} />);
    expect(screen.getByRole('button', { name: 'Côte à côte' })).toHaveStyle({ flex: 1 });
  });
});

describe('CarteOption verrouillée', () => {
  it('affiche le cadenas à la place de l’icône du contexte, sans changer son nom accessible', async () => {
    await render(<CarteOption libelle="Au bureau" icone="bureau" selectionne={false} verrouille onPress={() => undefined} />);
    const carte = screen.getByRole('button', { name: 'Au bureau, Premium' });
    expect(within(carte).getByTestId('icone-cadenas', { includeHiddenElements: true })).toBeTruthy();
    expect(within(carte).queryByTestId('icone-bureau', { includeHiddenElements: true })).toBeNull();
  });

  it('affiche l’icône du contexte quand la carte est disponible', async () => {
    await render(<CarteOption libelle="Au réveil" icone="reveil" selectionne={false} onPress={() => undefined} />);
    expect(screen.getByTestId('icone-reveil', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.queryByTestId('icone-cadenas', { includeHiddenElements: true })).toBeNull();
  });
});

describe('cibles tactiles', () => {
  const hauteurMin = (element: { props: { style?: unknown } }) =>
    (StyleSheet.flatten(element.props.style as StyleProp<ViewStyle>) ?? {}).minHeight as number;

  it('Bouton fait au moins 48 de haut', async () => {
    await render(<Bouton libelle="Seul" onPress={() => undefined} />);
    expect(hauteurMin(screen.getByRole('button', { name: 'Seul' }))).toBeGreaterThanOrEqual(48);
  });

  it('CarteOption fait au moins 48 de haut', async () => {
    await render(<CarteOption libelle="Au réveil" selectionne={false} onPress={() => undefined} />);
    expect(hauteurMin(screen.getByRole('button', { name: 'Au réveil' }))).toBeGreaterThanOrEqual(48);
  });
});

describe('retours tactiles', () => {
  afterEach(() => jest.restoreAllMocks());

  // Pressable traduit android_ripple en nativeBackgroundAndroid sur la vue native.
  const ondulationDe = (nom: string) => screen.getByRole('button', { name: nom }).props.nativeBackgroundAndroid;

  it('Bouton pose une ondulation Android non bordée, noire comme son texte sur l’orange', async () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    await render(<Bouton libelle="Seul" onPress={() => undefined} />);
    const ondulation = ondulationDe('Seul');
    expect(ondulation).toMatchObject({ type: 'RippleAndroid', borderless: false });
    expect(ondulation.color & 0x00ffffff).toBe(0);
    expect(ondulation.color >>> 24).toBeGreaterThan(0);
  });

  it('CarteOption pose une ondulation Android non bordée, claire comme son texte', async () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    await render(<CarteOption libelle="Au réveil" selectionne={false} onPress={() => undefined} />);
    const ondulation = ondulationDe('Au réveil');
    expect(ondulation).toMatchObject({ type: 'RippleAndroid', borderless: false });
    expect(ondulation.color & 0x00ffffff).toBe(0xedf2f7);
  });

  it('hors Android, pas d’ondulation native', async () => {
    jest.replaceProperty(Platform, 'OS', 'ios');
    await render(<Bouton libelle="Seul" onPress={() => undefined} />);
    expect(screen.getByRole('button', { name: 'Seul' }).props.nativeBackgroundAndroid).toBeUndefined();
  });
});
