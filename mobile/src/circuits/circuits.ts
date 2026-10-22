import type { Circuit, Poste } from './types';

// Remplaçant d'un exercice qui demande un meuble, pour qui n'a pas de meuble stable.
const SANS_MATERIEL: Record<string, string> = {
  'tractions-australiennes': 'tirage-yt',
  'dips-chaise': 'pompe-genoux',
  'pompe-inclinee': 'pompes-mur',
  'pompe-pieds-sureleves': 'pompe-classique',
  // Le côté du poste est conservé : squat bulgare G -> fentes arrière G.
  'squat-bulgare': 'fentes-arriere',
};

function poste(exerciceId: string, cote?: 'gauche' | 'droite'): Poste {
  const sansMateriel = Object.hasOwn(SANS_MATERIEL, exerciceId) ? SANS_MATERIEL[exerciceId] : undefined;
  return { exerciceId, ...(cote ? { cote } : {}), ...(sansMateriel ? { sansMateriel } : {}) };
}

const G = 'gauche';
const D = 'droite';

// Les 13 séances de la proposition v2 (docs/superpowers/specs/2026-10-22-circuits-proposition.md §3), dans cet ordre.
// Deux exercices du même muscle sont espacés dans un tour ; un exercice d'un seul côté a un poste par côté.
export const CIRCUITS: readonly Circuit[] = [
  {
    id: 'full-body-doux', nom: 'Full body', famille: 'full_body', niveau: 1, tours: 3, tourFacultatif: false,
    postes: [poste('pompe-inclinee'), poste('squat-lent'), poste('tirage-yt'), poste('pont-fessier'), poste('crunch-velo')],
  },
  {
    id: 'full-body-tonique', nom: 'Full body', famille: 'full_body', niveau: 2, tours: 4, tourFacultatif: false,
    postes: [poste('pompe-classique'), poste('squat-pause'), poste('tractions-australiennes'), poste('pont-fessier'), poste('planche')],
  },
  {
    id: 'full-body-costaud', nom: 'Full body', famille: 'full_body', niveau: 3, tours: 4, tourFacultatif: true,
    postes: [poste('pompe-archer'), poste('squat-bulgare', G), poste('tractions-australiennes'), poste('squat-bulgare', D), poste('hollow-hold')],
  },
  {
    id: 'poussee-doux', nom: 'Poussée', famille: 'poussee', niveau: 1, tours: 3, tourFacultatif: false,
    postes: [poste('pompe-inclinee'), poste('pont-fessier'), poste('pompe-genoux'), poste('crunch-velo'), poste('pompes-mur')],
  },
  {
    id: 'poussee-tonique', nom: 'Poussée', famille: 'poussee', niveau: 2, tours: 4, tourFacultatif: false,
    postes: [poste('pompe-classique'), poste('squat-pause'), poste('pike-pushup'), poste('pont-fessier'), poste('dips-chaise')],
  },
  {
    id: 'poussee-costaud', nom: 'Poussée', famille: 'poussee', niveau: 3, tours: 4, tourFacultatif: true,
    postes: [poste('pompe-pieds-sureleves'), poste('pont-fessier'), poste('pompe-archer'), poste('hollow-hold'), poste('pompe-diamant')],
  },
  {
    id: 'jambes-doux', nom: 'Jambes', famille: 'jambes', niveau: 1, tours: 3, tourFacultatif: false,
    postes: [poste('squat-lent'), poste('pont-fessier'), poste('fentes-arriere'), poste('montees-pointes'), poste('chaise-murale')],
  },
  {
    id: 'jambes-tonique', nom: 'Jambes', famille: 'jambes', niveau: 2, tours: 4, tourFacultatif: false,
    postes: [poste('squat-bulgare', G), poste('pont-fessier'), poste('squat-bulgare', D), poste('montees-pointes'), poste('squat-pause')],
  },
  {
    id: 'jambes-costaud', nom: 'Jambes', famille: 'jambes', niveau: 3, tours: 4, tourFacultatif: true,
    postes: [poste('squat-bulgare', G), poste('pont-une-jambe', G), poste('squat-bulgare', D), poste('pont-une-jambe', D), poste('chaise-murale')],
  },
  {
    id: 'dos-doux', nom: 'Dos et tronc', famille: 'dos', niveau: 1, tours: 3, tourFacultatif: false,
    postes: [poste('tirage-yt'), poste('bird-dog'), poste('crunch-velo'), poste('pont-fessier'), poste('gainage-debout')],
  },
  {
    id: 'dos-tonique', nom: 'Dos', famille: 'dos', niveau: 2, tours: 4, tourFacultatif: false,
    postes: [poste('tractions-australiennes'), poste('planche-laterale', G), poste('pont-fessier'), poste('tractions-australiennes'), poste('planche-laterale', D)],
  },
  {
    id: 'dos-costaud', nom: 'Dos', famille: 'dos', niveau: 3, tours: 4, tourFacultatif: true,
    postes: [poste('tractions-australiennes'), poste('hollow-hold'), poste('superman-tirage'), poste('tractions-australiennes'), poste('releves-jambes')],
  },
  {
    id: 'cardio-athletique', nom: 'Cardio athlétique', famille: 'cardio', niveau: 2, tours: 3, tourFacultatif: false,
    postes: [poste('squats-sautes'), poste('boxe-air'), poste('burpee-sans-saut'), poste('patineur'), poste('crunch-velo')],
  },
];

export function circuitParId(id: string): Circuit | undefined {
  return CIRCUITS.find((circuit) => circuit.id === id);
}
