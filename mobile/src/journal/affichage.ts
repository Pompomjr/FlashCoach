import { minutesEffectuees } from '../seance/affichage';

const JOURS = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
const MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

// Format fixe (pas toLocaleDateString) : même rendu sur tous les téléphones et dans les tests.
export function formaterDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${JOURS[date.getDay()]} ${date.getDate()} ${MOIS[date.getMonth()]} · ${date.getHours()}h${minutes}`;
}

export function formaterBilan(ecouleMs: number, exercicesFaits: number, terminee: boolean): string {
  const minutes = minutesEffectuees(ecouleMs);
  const parties = [minutes === 0 ? 'Moins d’une minute' : `${minutes} min`];
  if (exercicesFaits > 0) parties.push(`${exercicesFaits} exercice${exercicesFaits > 1 ? 's' : ''}`);
  if (!terminee) parties.push('écourtée');
  return parties.join(' · ');
}

export function texteResume(resume: { seances: number; repondues: number; mieux: number }): string | null {
  if (resume.seances === 0) return null;
  if (resume.repondues === 0) return 'Réponds à « Tu te sens mieux ? » après une séance pour suivre tes progrès.';
  if (resume.mieux === 0) {
    const n = resume.repondues;
    return `Tu as noté ${n} séance${n > 1 ? 's' : ''}. Chaque séance compte.`;
  }
  // Espace insécable avant le deux-points (typographie française) : jamais de « : » seul en début de ligne.
  return `Séances qui t’ont fait du bien : ${resume.mieux} sur ${resume.repondues}`;
}
