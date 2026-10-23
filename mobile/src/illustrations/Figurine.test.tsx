import { act, render, screen } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';
import { Figurine } from './Figurine';
import { posesPour } from './poses';

let frames: Set<number>;
beforeEach(() => {
  jest.useFakeTimers();
  frames = new Set();
  const demander = globalThis.requestAnimationFrame;
  const annuler = globalThis.cancelAnimationFrame;
  jest.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(callback => {
    const id = demander(temps => { frames.delete(id); callback(temps); });
    frames.add(id);
    return id;
  });
  jest.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(id => {
    if (id != null) frames.delete(id);
    annuler(id);
  });
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
});
afterEach(() => { jest.restoreAllMocks(); jest.useRealTimers(); });

test('nom et rôle accessibles', async () => {
  await render(<Figurine exerciceId="squat-lent" libelle="Squat lent" anime={false} />);
  expect(screen.getByRole('image', { name: 'Illustration : Squat lent' })).toBeTruthy();
});

test.each(['reduction', 'pause', 'statique'])('%s garde la première pose', async mode => {
  jest.mocked(AccessibilityInfo.isReduceMotionEnabled).mockResolvedValue(mode === 'reduction');
  await render(<Figurine exerciceId="squat-lent" libelle="Squat" anime={mode !== 'statique'} enPause={mode === 'pause'} />);
  const avant = screen.toJSON();
  await act(async () => { jest.advanceTimersByTime(2600); });
  expect(screen.toJSON()).toEqual(avant);
});

test('anime puis revient à la première pose à la pause et annule les frames au démontage', async () => {
  await render(<Figurine exerciceId="squat-lent" libelle="Squat" />);
  const avant = screen.toJSON();
  await act(async () => { jest.advanceTimersByTime(posesPour('squat-lent').dureeCycleMs / 2); });
  expect(screen.toJSON()).not.toEqual(avant);
  await screen.rerender(<Figurine exerciceId="squat-lent" libelle="Squat" enPause />);
  expect(screen.toJSON()).toEqual(avant);
  await screen.unmount();
  expect(frames.size).toBe(0);
});

test('annule la frame en vol au démontage pendant une animation', async () => {
  await render(<Figurine exerciceId="squat-lent" libelle="Squat" />);
  await act(async () => { jest.advanceTimersByTime(100); });
  expect(frames.size).toBe(1);
  await screen.unmount();
  expect(frames.size).toBe(0);
});

test('réagit à reduceMotionChanged et retire son abonnement', async () => {
  let changer: (valeur: boolean) => void = () => undefined;
  const remove = jest.fn();
  jest.spyOn(AccessibilityInfo, 'addEventListener').mockImplementation((_, callback) => {
    changer = callback;
    return { remove };
  });
  await render(<Figurine exerciceId="squat-lent" libelle="Squat" />);
  const initial = screen.toJSON();
  await act(async () => { jest.advanceTimersByTime(1000); });
  expect(screen.toJSON()).not.toEqual(initial);
  await act(async () => { changer(true); });
  expect(screen.toJSON()).toEqual(initial);
  await act(async () => { jest.advanceTimersByTime(1000); });
  expect(screen.toJSON()).toEqual(initial);
  await screen.unmount();
  expect(remove).toHaveBeenCalledTimes(1);
});

test('assis-debout dessine une chaise derrière la figurine', async () => {
  await render(<Figurine exerciceId="assis-debout" libelle="Assis-debout" anime={false} />);
  expect(screen.getByTestId('accessoire-chaise')).toBeTruthy();
});

test('tractions-australiennes dessine une table, squat-bulgare une chaise à sa place', async () => {
  await render(<Figurine exerciceId="tractions-australiennes" libelle="Tractions sous la table" anime={false} />);
  expect(screen.getByTestId('accessoire-table')).toBeTruthy();
  await screen.rerender(<Figurine exerciceId="squat-bulgare" libelle="Squat bulgare" anime={false} />);
  expect(screen.getByTestId('accessoire-chaise').props.x).toBe(posesPour('squat-bulgare').chaiseX);
});

test('pompe inclinée : dossier à droite, à distance du visage', async () => {
  await render(<Figurine exerciceId="pompe-inclinee" libelle="Pompe inclinée" anime={false} />);
  expect(screen.getByTestId('accessoire-chaise').props.x).toBe(posesPour('pompe-inclinee').chaiseX! + 42 - 6);
});

test('le côté imposé change le dessin du pont, même sans animation', async () => {
  await render(<Figurine exerciceId="pont-une-jambe" cote="gauche" libelle="Pont" anime={false} />);
  const gauche = screen.toJSON();
  await screen.rerender(<Figurine exerciceId="pont-une-jambe" cote="droite" libelle="Pont" anime={false} />);
  expect(screen.toJSON()).not.toEqual(gauche);
});
