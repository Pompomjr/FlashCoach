import type { EntreeJournal } from '../journal/journal';

export function fabriquerEntree(surcharge: Partial<EntreeJournal> = {}): EntreeJournal {
  return {
    id: 'entree-test',
    debut: new Date(2026, 9, 18, 7, 5).toISOString(),
    contexteId: 'maison',
    ressenti: 'mou',
    duree: 5,
    graine: 1,
    exercices: ['rotation-epaules', 'squat-lent'],
    ecouleMs: 300000,
    exercicesFaits: 8,
    terminee: true,
    apres: null,
    ...surcharge,
  };
}
