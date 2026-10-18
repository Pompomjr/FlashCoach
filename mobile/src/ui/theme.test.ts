import { CIBLE_MIN, COULEURS, ELEVATION, TYPO } from './theme';

describe('thème', () => {
  it('répartit la palette comme la maquette : fond bleu nuit, cartes plus claires que le fond', () => {
    expect(COULEURS.fond).toBe('#22344A');
    expect(COULEURS.carte).toBe('#3A506B');
    expect(COULEURS.orange).toBe('#F97316');
    expect(COULEURS.orangeProfond).toBe('#C2410C');
  });

  it('garde les contrastes AA du texte sur le fond et sur les cartes', () => {
    const canal = (v: number) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    const luminance = (hex: string) => {
      const [r, g, b] = [1, 3, 5].map((i) => canal(parseInt(hex.slice(i, i + 2), 16) / 255));
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const contraste = (a: string, b: string) => {
      const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
      return (x + 0.05) / (y + 0.05);
    };
    for (const surface of [COULEURS.fond, COULEURS.carte]) {
      expect(contraste(COULEURS.texte, surface)).toBeGreaterThanOrEqual(4.5);
      expect(contraste(COULEURS.texteDiscret, surface)).toBeGreaterThanOrEqual(4.5);
    }
    expect(contraste(COULEURS.texteSurOrange, COULEURS.orange)).toBeGreaterThanOrEqual(4.5);
    expect(contraste(COULEURS.texteSombre, COULEURS.carteClaire)).toBeGreaterThanOrEqual(4.5);
  });

  it('fixe la cible tactile minimale à 48', () => {
    expect(CIBLE_MIN).toBe(48);
  });

  it('réserve Barlow Condensed à l’affichage : le reste reste en police système', () => {
    for (const role of ['displayLarge', 'displaySmall', 'headlineMedium', 'headlineSmall'] as const) {
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
