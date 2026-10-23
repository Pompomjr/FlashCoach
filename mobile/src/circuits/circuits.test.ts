import { EXERCICES } from '../catalogue/exercices';
import { CIRCUITS, circuitParId } from './circuits';
import { materielDe } from './materiel';

// Tableau écrit en dur d'après la proposition v2 §3 : « id G » / « id D » = côté imposé au poste.
const ATTENDU: readonly {
  id: string;
  nom: string;
  famille: string;
  niveau: number;
  tours: number;
  postes: string[];
}[] = [
  { id: 'full-body-doux', nom: 'Full body', famille: 'full_body', niveau: 1, tours: 3, postes: ['pompe-inclinee', 'squat-lent', 'tirage-yt', 'pont-fessier', 'crunch-velo'] },
  { id: 'full-body-tonique', nom: 'Full body', famille: 'full_body', niveau: 2, tours: 4, postes: ['pompe-classique', 'squat-pause', 'tractions-australiennes', 'pont-fessier', 'planche'] },
  { id: 'full-body-costaud', nom: 'Full body', famille: 'full_body', niveau: 3, tours: 4, postes: ['pompe-archer', 'squat-bulgare G', 'tractions-australiennes', 'squat-bulgare D', 'hollow-hold'] },
  { id: 'poussee-doux', nom: 'Poussée', famille: 'poussee', niveau: 1, tours: 3, postes: ['pompe-inclinee', 'pont-fessier', 'pompe-genoux', 'crunch-velo', 'pompes-mur'] },
  { id: 'poussee-tonique', nom: 'Poussée', famille: 'poussee', niveau: 2, tours: 4, postes: ['pompe-classique', 'squat-pause', 'pike-pushup', 'pont-fessier', 'dips-chaise'] },
  { id: 'poussee-costaud', nom: 'Poussée', famille: 'poussee', niveau: 3, tours: 4, postes: ['pompe-pieds-sureleves', 'pont-fessier', 'pompe-archer', 'hollow-hold', 'pompe-diamant'] },
  { id: 'jambes-doux', nom: 'Jambes', famille: 'jambes', niveau: 1, tours: 3, postes: ['squat-lent', 'pont-fessier', 'fentes-arriere', 'montees-pointes', 'chaise-murale'] },
  { id: 'jambes-tonique', nom: 'Jambes', famille: 'jambes', niveau: 2, tours: 4, postes: ['squat-bulgare G', 'pont-fessier', 'squat-bulgare D', 'montees-pointes', 'squat-pause'] },
  { id: 'jambes-costaud', nom: 'Jambes', famille: 'jambes', niveau: 3, tours: 4, postes: ['squat-bulgare G', 'pont-une-jambe G', 'squat-bulgare D', 'pont-une-jambe D', 'chaise-murale'] },
  { id: 'dos-doux', nom: 'Dos et tronc', famille: 'dos', niveau: 1, tours: 3, postes: ['tirage-yt', 'bird-dog', 'crunch-velo', 'pont-fessier', 'gainage-debout'] },
  { id: 'dos-tonique', nom: 'Dos', famille: 'dos', niveau: 2, tours: 4, postes: ['tractions-australiennes', 'planche-laterale G', 'pont-fessier', 'tractions-australiennes', 'planche-laterale D'] },
  { id: 'dos-costaud', nom: 'Dos', famille: 'dos', niveau: 3, tours: 4, postes: ['tractions-australiennes', 'hollow-hold', 'superman-tirage', 'tractions-australiennes', 'releves-jambes'] },
  { id: 'cardio-athletique', nom: 'Cardio athlétique', famille: 'cardio', niveau: 2, tours: 3, postes: ['squats-sautes', 'boxe-air', 'burpee-sans-saut', 'patineur', 'crunch-velo'] },
];

const ALTERNATIVES: Record<string, string> = {
  'tractions-australiennes': 'tirage-yt',
  'dips-chaise': 'pompe-genoux',
  'pompe-inclinee': 'pompes-mur',
  'pompe-pieds-sureleves': 'pompe-classique',
  'squat-bulgare': 'fentes-arriere',
};

const SANS_COTE_PAR_NATURE = ['genou-coude', 'pompe-archer', 'pompe-spiderman', 'fentes-arriere', 'patineur', 'bird-dog'];

const exercice = (id: string) => EXERCICES.find((e) => e.id === id);
const ecrire = (poste: { exerciceId: string; cote?: 'gauche' | 'droite' }) =>
  poste.exerciceId + (poste.cote === 'gauche' ? ' G' : poste.cote === 'droite' ? ' D' : '');

describe('CIRCUITS', () => {
  it('compte 13 circuits, dans l’ordre de la proposition, ids uniques', () => {
    expect(CIRCUITS.map((c) => c.id)).toEqual(ATTENDU.map((a) => a.id));
    expect(new Set(CIRCUITS.map((c) => c.id)).size).toBe(13);
  });

  it.each(ATTENDU.map((a) => [a.id, a] as const))('%s : mêmes données que la proposition', (_id, attendu) => {
    const circuit = CIRCUITS.find((c) => c.id === attendu.id);
    expect(circuit).toBeDefined();
    expect(circuit).toMatchObject({ nom: attendu.nom, famille: attendu.famille, niveau: attendu.niveau, tours: attendu.tours });
    expect(circuit?.postes.map(ecrire)).toEqual(attendu.postes);
  });

  it('a 5 postes par circuit, tous dans le catalogue', () => {
    for (const circuit of CIRCUITS) {
      expect(circuit.postes).toHaveLength(5);
      for (const poste of circuit.postes) {
        expect(exercice(poste.exerciceId)).toBeDefined();
        if (poste.sansMateriel) expect(exercice(poste.sansMateriel)).toBeDefined();
      }
    }
  });

  it('impose un côté aux exercices bilatéraux, sauf ceux qui alternent par nature', () => {
    for (const circuit of CIRCUITS) {
      for (const poste of circuit.postes) {
        if (exercice(poste.exerciceId)?.bilateral && !SANS_COTE_PAR_NATURE.includes(poste.exerciceId)) {
          expect([circuit.id, poste.exerciceId, poste.cote !== undefined]).toEqual([circuit.id, poste.exerciceId, true]);
        }
      }
    }
  });

  it('ne donne un côté qu’à des exercices bilatéraux, et complète toujours la paire gauche / droite', () => {
    for (const circuit of CIRCUITS) {
      const parExercice = new Map<string, { gauche: number; droite: number }>();
      for (const poste of circuit.postes) {
        if (!poste.cote) continue;
        expect(exercice(poste.exerciceId)?.bilateral).toBe(true);
        const compte = parExercice.get(poste.exerciceId) ?? { gauche: 0, droite: 0 };
        compte[poste.cote] += 1;
        parExercice.set(poste.exerciceId, compte);
      }
      for (const [id, compte] of parExercice) {
        expect([circuit.id, id, compte]).toEqual([circuit.id, id, { gauche: 1, droite: 1 }]);
      }
    }
  });

  it('propose une alternative sans meuble à chaque poste qui demande un meuble, et à lui seul', () => {
    let postesAvecMeuble = 0;
    for (const circuit of CIRCUITS) {
      for (const poste of circuit.postes) {
        if (materielDe(poste.exerciceId) !== null) {
          postesAvecMeuble += 1;
          expect(poste.sansMateriel).toBe(ALTERNATIVES[poste.exerciceId]);
          expect(materielDe(poste.sansMateriel as string)).toBeNull();
        } else {
          expect(poste.sansMateriel).toBeUndefined();
        }
      }
    }
    expect(postesAvecMeuble).toBeGreaterThan(0);
  });

  it('fait 3 tours en Léger, 4 en Moyen et en Lourd (le cardio athlétique en fait 3)', () => {
    for (const circuit of CIRCUITS) {
      const attendu = circuit.id === 'cardio-athletique' ? 3 : circuit.niveau === 1 ? 3 : 4;
      expect([circuit.id, circuit.tours]).toEqual([circuit.id, attendu]);
    }
  });

  it('propose le 5e tour seulement aux 4 circuits Lourd', () => {
    expect(CIRCUITS.filter((c) => c.tourFacultatif).map((c) => c.id)).toEqual([
      'full-body-costaud',
      'poussee-costaud',
      'jambes-costaud',
      'dos-costaud',
    ]);
  });

  it('ne dépasse jamais le niveau du circuit', () => {
    for (const circuit of CIRCUITS) {
      for (const poste of circuit.postes) {
        const ids = poste.sansMateriel ? [poste.exerciceId, poste.sansMateriel] : [poste.exerciceId];
        for (const id of ids) {
          expect([circuit.id, id, (exercice(id)?.niveau ?? 9) <= circuit.niveau]).toEqual([circuit.id, id, true]);
        }
      }
    }
  });
});

describe('circuitParId', () => {
  it('retrouve un circuit par son id', () => {
    expect(circuitParId('dos-tonique')?.nom).toBe('Dos');
  });

  it('renvoie undefined pour un id inconnu', () => {
    expect(circuitParId('inconnu')).toBeUndefined();
  });
});
