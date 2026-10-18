import { CIBLE_MIN, COULEURS, ELEVATION, TYPO } from './theme';

describe('thème', () => {
  it('garde la palette de la fiche et ajoute l’orange profond', () => {
    expect(COULEURS.fond).toBe('#3A506B');
    expect(COULEURS.orange).toBe('#F97316');
    expect(COULEURS.orangeProfond).toBe('#C2410C');
  });

  it('fixe la cible tactile minimale à 48', () => {
    expect(CIBLE_MIN).toBe(48);
  });

  it('réserve Barlow Condensed à l’affichage : le reste reste en police système', () => {
    for (const role of ['displayLarge', 'displaySmall', 'headlineMedium'] as const) {
      expect(TYPO[role].fontFamily).toMatch(/^BarlowCondensed_/);
    }
    for (const role of ['titleLarge', 'titleMedium', 'bodyLarge', 'bodyMedium', 'labelLarge'] as const) {
      expect(TYPO[role]).not.toHaveProperty('fontFamily');
    }
  });

  it('donne à chaque rôle une taille et un interligne, l’interligne dépassant la taille', () => {
    for (const role of Object.values(TYPO)) expect(role.lineHeight).toBeGreaterThan(role.fontSize);
  });

  it('a deux niveaux d’élévation, le second plus marqué que le premier', () => {
    expect(ELEVATION.niveau1).toBeTruthy();
    expect(ELEVATION.niveau2).toBeTruthy();
    expect(ELEVATION.niveau2).not.toEqual(ELEVATION.niveau1);
  });
});
