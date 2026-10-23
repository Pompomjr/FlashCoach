import { CONTEXTES } from '../catalogue/contextes';
import { NOMS_NIVEAU, NOMS_OBJECTIF } from '../catalogue/types';
import { circuitParId } from '../circuits/circuits';
import { minutesEffectuees } from '../seance/affichage';
import { LIBELLES_RESSENTI } from '../ui/libelles';
import type { EntreeJournal } from './journal';

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

// Séance prête en circuit : la ligne du journal affiche le circuit à la place du contexte.
export function estEntreeCircuit(entree: EntreeJournal): entree is EntreeJournal & { circuitId: string } {
  return entree.circuitId !== null && entree.circuitId !== '';
}

// Un circuit absent de cette version de l'app (synchronisé depuis une version plus récente) garde un nom neutre.
export function nomCircuit(circuitId: string): string {
  return circuitParId(circuitId)?.nom ?? 'Séance prête';
}

// Texte principal d'une ligne du journal : « sujet · état ». Un circuit (prise de masse comprise) s'affiche par son
// nom et son intensité ; une entrée par objectif par l'objectif, l'intensité et la durée choisie ; une ancienne
// entrée par son contexte et son ressenti, comme avant. `etatLu` est la version lue par les lecteurs d'écran.
export function sujetEtEtat(entree: EntreeJournal): { sujet: string; etat: string; etatLu: string } {
  if (estEntreeCircuit(entree)) {
    const intensite = NOMS_NIVEAU[entree.niveau];
    return { sujet: nomCircuit(entree.circuitId), etat: intensite, etatLu: `niveau ${intensite}` };
  }
  if (entree.objectif !== null) {
    const intensite = NOMS_NIVEAU[entree.niveau];
    return {
      sujet: NOMS_OBJECTIF[entree.objectif],
      etat: `${intensite} · ${entree.duree} min`,
      etatLu: `${intensite}, ${entree.duree} min`,
    };
  }
  const contexteId = entree.contexteId ?? '';
  const ressenti = entree.ressenti === null ? '' : LIBELLES_RESSENTI[entree.ressenti].libelle;
  return { sujet: CONTEXTES.find((c) => c.id === contexteId)?.nom ?? contexteId, etat: ressenti, etatLu: ressenti };
}
