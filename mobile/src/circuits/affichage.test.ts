import { CIRCUITS, circuitParId } from './circuits';
import {
  circuitDemandeUnMeuble,
  circuitsDuNiveau,
  libelleAccessibleCircuit,
  libelleMateriel,
  libellePoste,
  libelleTours,
  minutesDe,
} from './affichage';
import { exerciceDuPoste } from './construire';
import type { Circuit } from './types';

const circuit = (id: string): Circuit => {
  const trouve = circuitParId(id);
  if (!trouve) throw new Error(`circuit inconnu : ${id}`);
  return trouve;
};

describe('minutesDe', () => {
  it('arrondit la durée en secondes à la minute', () => {
    expect(minutesDe(960)).toBe(16);
    expect(minutesDe(1250)).toBe(21);
    expect(minutesDe(1540)).toBe(26);
  });
});

describe('libelleTours', () => {
  it('écrit « N tours · M min »', () => {
    expect(libelleTours(4, 21)).toBe('4 tours · 21 min');
    expect(libelleTours(3, 16)).toBe('3 tours · 16 min');
  });
});

describe('circuitsDuNiveau', () => {
  it('range les circuits par niveau, dans l’ordre de la proposition', () => {
    expect(circuitsDuNiveau(1).map((c) => c.id)).toEqual(['full-body-doux', 'poussee-doux', 'jambes-doux', 'dos-doux']);
    expect(circuitsDuNiveau(2).map((c) => c.id)).toEqual([
      'full-body-tonique',
      'poussee-tonique',
      'jambes-tonique',
      'dos-tonique',
      'cardio-athletique',
    ]);
    expect(circuitsDuNiveau(3).map((c) => c.id)).toEqual(['full-body-costaud', 'poussee-costaud', 'jambes-costaud', 'dos-costaud']);
  });

  it('couvre les 13 circuits sans doublon', () => {
    const ids = ([1, 2, 3] as const).flatMap((niveau) => circuitsDuNiveau(niveau).map((c) => c.id));
    expect(ids).toHaveLength(CIRCUITS.length);
    expect(new Set(ids).size).toBe(CIRCUITS.length);
  });
});

describe('libelleMateriel', () => {
  it('dit le meuble demandé, ou « sans matériel »', () => {
    expect(libelleMateriel(circuit('poussee-tonique'))).toBe('chaise'); // dips sur une chaise
    expect(libelleMateriel(circuit('dos-tonique'))).toBe('table'); // tractions sous la table
    expect(libelleMateriel(circuit('full-body-costaud'))).toBe('chaise et table');
    expect(libelleMateriel(circuit('cardio-athletique'))).toBe('sans matériel');
  });

  it('ne cite chaque meuble qu’une fois, la chaise d’abord', () => {
    // Jambes Tonique : deux squats bulgares, « chaise » une seule fois ; Dos Costaud : deux tractions, « table » une seule fois.
    expect(libelleMateriel(circuit('jambes-tonique'))).toBe('chaise');
    expect(libelleMateriel(circuit('dos-costaud'))).toBe('table');
  });
});

describe('circuitDemandeUnMeuble', () => {
  it('est vrai dès qu’un poste demande une chaise ou une table', () => {
    expect(circuitDemandeUnMeuble(circuit('dos-tonique'))).toBe(true);
    expect(circuitDemandeUnMeuble(circuit('poussee-doux'))).toBe(true);
  });

  it('est faux pour un circuit sans meuble', () => {
    expect(circuitDemandeUnMeuble(circuit('cardio-athletique'))).toBe(false);
  });

  it('est vrai exactement quand le matériel n’est pas « sans matériel »', () => {
    for (const c of CIRCUITS) expect(circuitDemandeUnMeuble(c)).toBe(libelleMateriel(c) !== 'sans matériel');
  });
});

describe('exerciceDuPoste et libellePoste', () => {
  const bulgareGauche = circuit('jambes-tonique').postes[0];
  const bulgareDroite = circuit('jambes-tonique').postes[2];
  const traction = circuit('dos-tonique').postes[0];

  it('garde l’exercice du poste, ou son remplaçant sans meuble', () => {
    expect(exerciceDuPoste(bulgareGauche, false)).toBe('squat-bulgare');
    expect(exerciceDuPoste(bulgareGauche, true)).toBe('fentes-arriere');
    expect(exerciceDuPoste(traction, true)).toBe('tirage-yt');
    // Un poste sans meuble ne change pas.
    const pont = circuit('jambes-tonique').postes[1];
    expect(exerciceDuPoste(pont, true)).toBe('pont-fessier');
  });

  it('écrit le nom de l’exercice, avec le côté entre parenthèses', () => {
    expect(libellePoste(bulgareGauche, false)).toBe('Squat bulgare (gauche)');
    expect(libellePoste(bulgareDroite, false)).toBe('Squat bulgare (droite)');
    expect(libellePoste(traction, false)).toBe('Tractions sous la table');
  });

  it('remplace le nom sans changer le côté quand on n’a pas de meuble', () => {
    expect(libellePoste(bulgareGauche, true)).toBe('Fentes arrière (gauche)');
    expect(libellePoste(traction, true)).toBe('Y-T au sol');
  });
});

describe('libelleAccessibleCircuit', () => {
  it('se lit « nom, niveau, N tours, M minutes »', () => {
    expect(libelleAccessibleCircuit(circuit('full-body-tonique'), 21)).toBe('Full body, Tonique, 4 tours, 21 minutes');
    expect(libelleAccessibleCircuit(circuit('dos-doux'), 16)).toBe('Dos et tronc, Doux, 3 tours, 16 minutes');
  });
});
