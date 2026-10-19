import { ErreurCompte } from './auth';
import { codeValide, emailValide, messageErreur } from './liaison';

describe('liaison', () => {
  it('reconnaît une adresse e-mail plausible', () => {
    expect(emailValide('mattia@exemple.fr')).toBe(true);
    expect(emailValide('  mattia@exemple.fr ')).toBe(true);
    expect(emailValide('mattia@exemple')).toBe(false);
    expect(emailValide('mattia exemple.fr')).toBe(false);
    expect(emailValide('')).toBe(false);
  });

  it('attend un code de 6 chiffres', () => {
    expect(codeValide('123456')).toBe(true);
    expect(codeValide('12345')).toBe(false);
    expect(codeValide('12a456')).toBe(false);
  });

  it('donne un message complice selon l’erreur, jamais le détail technique', () => {
    expect(messageErreur(new ErreurCompte('code-invalide'))).toBe('Ce code ne marche pas. Vérifie-le ou demande-en un autre.');
    expect(messageErreur(new ErreurCompte('reseau'))).toBe("Pas de connexion pour l'instant. Réessaie dans un moment.");
    expect(messageErreur(new ErreurCompte('trop-de-tentatives'))).toBe("Trop d'essais d'un coup. Réessaie dans quelques minutes.");
    expect(messageErreur(new Error('fetch failed: 500'))).toBe("Ça n'a pas marché. Réessaie dans un moment.");
  });
});
