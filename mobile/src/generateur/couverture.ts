import { DUREES, RESSENTIS, type Contexte, type Duree, type Effet, type Exercice, type Ressenti } from '../catalogue/types';
import { cibleDePhase, correspond, type Cible } from './cibles';
import { filtrerCatalogue } from './filtres';
import { STRUCTURE_PAR_DUREE } from './structure';
import type { Phase } from './types';

export interface Manque {
  contexteId: string;
  ressenti: Ressenti;
  duree: Duree;
  phase: Phase;
  cible: Cible;
  // Places de la phase remplies par des exercices idéaux, distincts de ceux des autres phases.
  disponibles: number;
  besoin: number;
}

const ORDRE_PHASES: readonly Phase[] = ['mise_en_route', 'coeur', 'retour_au_calme'];

// Appariement biparti maximal (algorithme de Kuhn) entre les places d'une séance et les exercices idéaux :
// un exercice ne remplit qu'une place, même s'il convient à plusieurs phases (cœur « stresse » et retour au calme).
// Renvoie, pour chaque place, si elle est remplie.
// Une place remplie le reste quand on cherche à remplir les suivantes : l'ensemble des places remplies ne dépend
// donc que de l'ordre des places, jamais de l'ordre du catalogue. Les places manquantes tombent sur les dernières.
function apparier(places: Cible[], exercices: Exercice[]): boolean[] {
  const candidats = places.map((cible) =>
    exercices.flatMap((exercice, index) => (correspond(exercice, cible, 0) ? [index] : [])),
  );
  const titulaire: (number | undefined)[] = exercices.map(() => undefined);

  const augmenter = (place: number, vus: Set<number>): boolean => {
    for (const exercice of candidats[place]) {
      if (vus.has(exercice)) continue;
      vus.add(exercice);
      const occupant = titulaire[exercice];
      if (occupant === undefined || augmenter(occupant, vus)) {
        titulaire[exercice] = place;
        return true;
      }
    }
    return false;
  };

  return places.map((_, place) => augmenter(place, new Set()));
}

// Places non remplies d'une séance, par phase. Vide si le niveau 0 suffit à toute la séance.
function manquesDeSeance(compatibles: Exercice[], contexteId: string, ressenti: Ressenti, duree: Duree): Manque[] {
  const plans = STRUCTURE_PAR_DUREE[duree];
  const places = plans.flatMap((plan) => Array.from({ length: plan.nombre }, () => cibleDePhase(plan.phase, ressenti)));
  const remplies = apparier(places, compatibles);

  const manques: Manque[] = [];
  let debut = 0;
  for (const plan of plans) {
    const disponibles = remplies.slice(debut, debut + plan.nombre).filter(Boolean).length;
    debut += plan.nombre;
    if (disponibles < plan.nombre) {
      const cible = cibleDePhase(plan.phase, ressenti);
      manques.push({ contexteId, ressenti, duree, phase: plan.phase, cible, disponibles, besoin: plan.nombre });
    }
  }
  return manques;
}

// Analyse déterministe, sans tirage. Ordre : contexte, ressenti, phase, durée.
export function analyserCouverture(catalogue: Exercice[], contextes: Contexte[]): Manque[] {
  const manques: Manque[] = [];
  for (const contexte of contextes) {
    const compatibles = filtrerCatalogue(catalogue, contexte.contraintes);
    for (const ressenti of RESSENTIS) {
      const parDuree = DUREES.flatMap((duree) => manquesDeSeance(compatibles, contexte.id, ressenti, duree));
      for (const phase of ORDRE_PHASES) {
        manques.push(...parDuree.filter((manque) => manque.phase === phase));
      }
    }
  }
  return manques;
}

const LIBELLES_PHASE: Record<Phase, string> = {
  mise_en_route: 'mise en route',
  coeur: 'cœur',
  retour_au_calme: 'retour au calme',
};

const LIBELLES_EFFET: Record<Effet, string> = {
  mobilite: 'mobilité',
  detente: 'détente',
  energie: 'énergie',
};

function libelleCible(cible: Cible): string {
  const intensite =
    cible.intensiteMin === cible.intensiteMax
      ? `intensité ${cible.intensiteMin}`
      : `intensité ${cible.intensiteMin}-${cible.intensiteMax}`;
  return `${LIBELLES_EFFET[cible.effet]}, ${intensite}`;
}

// Les durées voisines d'une même phase partagent une ligne quand elles ont autant d'exercices disponibles.
function memeLigne(a: Manque, b: Manque): boolean {
  return a.contexteId === b.contexteId && a.ressenti === b.ressenti && a.phase === b.phase && a.disponibles === b.disponibles;
}

export function formaterRapport(manques: Manque[]): string {
  if (manques.length === 0) return 'Catalogue complet : toutes les combinaisons sont idéales.';
  const lignes: Manque[][] = [];
  for (const manque of manques) {
    const derniere = lignes[lignes.length - 1];
    if (derniere !== undefined && memeLigne(derniere[0], manque)) derniere.push(manque);
    else lignes.push([manque]);
  }
  return [
    `${lignes.length} manque(s) à combler :`,
    ...lignes.map((ligne) => {
      const { contexteId, ressenti, phase, cible, disponibles } = ligne[0];
      const details = ligne.map((manque) => `${manque.besoin} en ${manque.duree} min`).join(', ');
      return `- ${contexteId} + ${ressenti}, ${LIBELLES_PHASE[phase]} (${libelleCible(cible)}) : ${disponibles} disponible(s), il en faut ${details}`;
    }),
  ].join('\n');
}
