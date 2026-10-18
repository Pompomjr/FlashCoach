import { formaterBilan, formaterDate, texteResume } from './affichage';

describe('formaterDate', () => {
  it('donne le jour, la date et l’heure locale en français', () => {
    expect(formaterDate(new Date(2026, 9, 18, 7, 5).toISOString())).toBe('dim. 18 oct. · 7h05');
    expect(formaterDate(new Date(2026, 0, 1, 18, 30).toISOString())).toBe('jeu. 1 janv. · 18h30');
  });

  it('reste vide pour une date illisible', () => {
    expect(formaterDate('pas une date')).toBe('');
  });
});

describe('formaterBilan', () => {
  it('résume la durée et les exercices', () => {
    expect(formaterBilan(300000, 8, true)).toBe('5 min · 8 exercices');
    expect(formaterBilan(60000, 1, true)).toBe('1 min · 1 exercice');
  });

  it('signale une séance écourtée, sans jugement', () => {
    expect(formaterBilan(20000, 0, false)).toBe('Moins d’une minute · écourtée');
    expect(formaterBilan(180000, 0, false)).toBe('3 min · écourtée');
  });
});

describe('texteResume', () => {
  it('ne dit rien quand il n’y a aucune séance', () => {
    expect(texteResume({ seances: 0, repondues: 0, mieux: 0 })).toBeNull();
  });

  it('invite à répondre quand aucune séance n’a de réponse', () => {
    expect(texteResume({ seances: 3, repondues: 0, mieux: 0 })).toBe(
      'Réponds à « Tu te sens mieux ? » après une séance pour suivre tes progrès.',
    );
  });

  it('montre la preuve de la promesse', () => {
    expect(texteResume({ seances: 12, repondues: 10, mieux: 9 })).toBe('Séances qui t’ont fait du bien : 9 sur 10');
  });
});
