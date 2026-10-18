import { Platform } from 'react-native';

import { enfoncement, ondulation } from './toucher';

afterEach(() => jest.restoreAllMocks());

describe('ondulation', () => {
  it('tire la couleur du texte, avec transparence, sans déborder de la forme', () => {
    expect(ondulation('#000000')).toEqual({ color: 'rgba(0, 0, 0, 0.16)', borderless: false });
    expect(ondulation('#EDF2F7')).toEqual({ color: 'rgba(237, 242, 247, 0.16)', borderless: false });
  });
});

describe('enfoncement', () => {
  it('réduit légèrement l’élément pressé sur web et iOS', () => {
    for (const os of ['web', 'ios'] as const) {
      jest.replaceProperty(Platform, 'OS', os);
      expect(enfoncement(true)).toEqual({ transform: [{ scale: 0.98 }] });
      expect(enfoncement(false)).toBeNull();
    }
  });

  it('laisse l’ondulation seule sur Android', () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    expect(enfoncement(true)).toBeNull();
  });
});
