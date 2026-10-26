import { render, screen } from '@testing-library/react-native';

import { IllustrationExercice } from './Illustration';

// Hissés par Jest au-dessus des imports.

jest.mock('expo-video', () => {
  const { View } = jest.requireActual('react-native');
  return {
    useVideoPlayer: () => ({ play: jest.fn(), pause: jest.fn(), loop: false, muted: false }),
    VideoView: (props: object) => <View testID="video-exercice" {...props} />,
  };
});
jest.mock('./videos', () => ({ videoPour: (id: string) => (id === 'squat-lent' ? 1 : undefined) }));

test('affiche la vidéo de l’exercice quand elle existe, nommée pour les lecteurs d’écran', async () => {
  await render(<IllustrationExercice exerciceId="squat-lent" libelle="Squat lent" />);
  expect(screen.getByTestId('video-exercice')).toBeTruthy();
  expect(screen.getByLabelText('Illustration : Squat lent')).toBeTruthy();
});

test('garde la figurine dessinée tant qu’il n’y a pas de vidéo', async () => {
  await render(<IllustrationExercice exerciceId="pont-fessier" libelle="Pont fessier" />);
  expect(screen.queryByTestId('video-exercice')).toBeNull();
  expect(screen.getByLabelText('Illustration : Pont fessier')).toBeTruthy();
});

test('montre l’autre côté en miroir quand la vidéo a été filmée côté droit', async () => {
  await render(<IllustrationExercice exerciceId="squat-lent" libelle="Squat lent" cote="gauche" />);
  expect(screen.getByTestId('video-exercice').props.style).toEqual(
    expect.arrayContaining([expect.objectContaining({ transform: [{ scaleX: -1 }] })]),
  );
});
