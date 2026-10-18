import { DUREES, RESSENTIS, type Contexte, type Duree, type Effet, type Exercice, type Ressenti } from '../catalogue/types';
import { CIBLE_MISE_EN_ROUTE, CIBLE_PAR_RESSENTI, CIBLE_RETOUR_AU_CALME, correspond, type Cible } from './cibles';
import { filtrerCatalogue } from './filtres';
import { STRUCTURE_PAR_DUREE } from './structure';
import type { Phase } from './types';

// 'total' : nombre d'exercices différents qu'une séance utilise, toutes phases confondues.
export type PhaseCouverture = Phase | 'total';

export interface Manque {
  contexteId: string;
  // Renseigné seulement pour le cœur, qui dépend du ressenti.
  ressenti: Ressenti | null;
  phase: PhaseCouverture;
  // null pour 'total' (tous les exercices compatibles comptent).
  cible: Cible | null;
  disponibles: number;
  // Seulement les durées où il manque des exercices.
  besoins: Partial<Record<Duree, number>>;
}

function besoinDePhase(phase: Phase, duree: Duree): number {
  return STRUCTURE_PAR_DUREE[duree]
    .filter((plan) => plan.phase === phase)
    .reduce((somme, plan) => somme + plan.nombre, 0);
}

function besoinTotal(duree: Duree): number {
  return STRUCTURE_PAR_DUREE[duree].reduce((somme, plan) => somme + plan.nombre, 0);
}

// Renvoie un Manque seulement si au moins une durée manque d'exercices.
function comparer(
  base: Omit<Manque, 'besoins'>,
  besoin: (duree: Duree) => number,
): Manque | null {
  const besoins: Partial<Record<Duree, number>> = {};
  for (const duree of DUREES) {
    const necessaire = besoin(duree);
    if (base.disponibles < necessaire) besoins[duree] = necessaire;
  }
  return Object.keys(besoins).length > 0 ? { ...base, besoins } : null;
}

function compterPour(exercices: Exercice[], cible: Cible): number {
  return exercices.filter((exercice) => correspond(exercice, cible, 0)).length;
}

// Analyse déterministe : compte les exercices disponibles par phase, sans tirage.
export function analyserCouverture(catalogue: Exercice[], contextes: Contexte[]): Manque[] {
  const manques: Manque[] = [];
  const ajouter = (manque: Manque | null) => {
    if (manque !== null) manques.push(manque);
  };

  for (const contexte of contextes) {
    const compatibles = filtrerCatalogue(catalogue, contexte.contraintes);
    const contexteId = contexte.id;

    ajouter(
      comparer(
        { contexteId, ressenti: null, phase: 'mise_en_route', cible: CIBLE_MISE_EN_ROUTE, disponibles: compterPour(compatibles, CIBLE_MISE_EN_ROUTE) },
        (duree) => besoinDePhase('mise_en_route', duree),
      ),
    );
    ajouter(
      comparer(
        { contexteId, ressenti: null, phase: 'retour_au_calme', cible: CIBLE_RETOUR_AU_CALME, disponibles: compterPour(compatibles, CIBLE_RETOUR_AU_CALME) },
        (duree) => besoinDePhase('retour_au_calme', duree),
      ),
    );
    ajouter(
      comparer({ contexteId, ressenti: null, phase: 'total', cible: null, disponibles: compatibles.length }, besoinTotal),
    );
    for (const ressenti of RESSENTIS) {
      const cible = CIBLE_PAR_RESSENTI[ressenti];
      ajouter(
        comparer(
          { contexteId, ressenti, phase: 'coeur', cible, disponibles: compterPour(compatibles, cible) },
          (duree) => besoinDePhase('coeur', duree),
        ),
      );
    }
  }
  return manques;
}

const LIBELLES_PHASE: Record<PhaseCouverture, string> = {
  mise_en_route: 'mise en route',
  coeur: 'cœur',
  retour_au_calme: 'retour au calme',
  total: 'exercices différents',
};

const LIBELLES_EFFET: Record<Effet, string> = {
  mobilite: 'mobilité',
  detente: 'détente',
  energie: 'énergie',
};

function libelleCible(cible: Cible | null): string {
  if (cible === null) return 'tous compatibles';
  const intensite =
    cible.intensiteMin === cible.intensiteMax
      ? `intensité ${cible.intensiteMin}`
      : `intensité ${cible.intensiteMin}-${cible.intensiteMax}`;
  return `${LIBELLES_EFFET[cible.effet]}, ${intensite}`;
}

export function formaterRapport(manques: Manque[]): string {
  if (manques.length === 0) return 'Catalogue complet : toutes les combinaisons sont idéales.';
  return [
    `${manques.length} manque(s) à combler :`,
    ...manques.map((manque) => {
      const qui = manque.ressenti === null ? manque.contexteId : `${manque.contexteId} + ${manque.ressenti}`;
      const details = DUREES.filter((duree) => manque.besoins[duree] !== undefined)
        .map((duree) => `${manque.besoins[duree]} en ${duree} min`)
        .join(', ');
      return `- ${qui}, ${LIBELLES_PHASE[manque.phase]} (${libelleCible(manque.cible)}) : ${manque.disponibles} disponible(s), il en faut ${details}`;
    }),
  ].join('\n');
}
