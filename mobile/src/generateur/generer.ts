import type { Exercice } from '../catalogue/types';
import { choisirAuHasard, creerAleatoire } from './aleatoire';
import { cibleDePhase, correspond } from './cibles';
import { filtrerCatalogue } from './filtres';
import { STRUCTURE_PAR_DUREE } from './structure';
import type { Bloc, NiveauAssouplissement, ParametresSeance, Seance } from './types';

const NIVEAUX: NiveauAssouplissement[] = [0, 1, 2, 3];

// Plus la pénalité est faible, plus l'exercice est souhaitable à cette place.
function penalite(exercice: Exercice, precedent: Exercice | undefined, recents: Set<string>): number {
  let total = 0;
  if (precedent !== undefined && precedent.id === exercice.id) total += 4;
  if (recents.has(exercice.id)) total += 2;
  if (precedent !== undefined && precedent.zone === exercice.zone) total += 1;
  return total;
}

function departager(
  candidats: Exercice[],
  precedent: Exercice | undefined,
  recents: Set<string>,
  alea: () => number,
): Exercice {
  const penalites = candidats.map((exercice) => penalite(exercice, precedent, recents));
  const minimum = Math.min(...penalites);
  return choisirAuHasard(
    candidats.filter((_, index) => penalites[index] === minimum),
    alea,
  );
}

export function genererSeance(params: ParametresSeance, catalogue: Exercice[]): Seance {
  // 1. Filtrer : les contraintes sont strictes et ne sont jamais assouplies.
  const compatibles = filtrerCatalogue(catalogue, params.contraintes);
  if (compatibles.length === 0) {
    throw new Error(`Aucun exercice compatible avec le contexte ${params.contexteId}`);
  }

  const alea = creerAleatoire(params.graine);
  const recents = new Set(params.exclure ?? []);
  const utilises = new Set<string>();
  const blocs: Bloc[] = [];
  let assouplissement: NiveauAssouplissement = 0;

  for (const plan of STRUCTURE_PAR_DUREE[params.duree]) {
    const cible = cibleDePhase(plan.phase, params.ressenti);
    for (let i = 0; i < plan.nombre; i++) {
      const precedent = blocs.length > 0 ? blocs[blocs.length - 1].exercice : undefined;
      // 2-3. Classer selon la cible et choisir, en assouplissant niveau par niveau.
      // Au niveau 3 tout exercice compatible est candidat : la boucle trouve toujours.
      for (const niveau of NIVEAUX) {
        const candidats = compatibles.filter(
          (exercice) => (niveau === 3 || !utilises.has(exercice.id)) && correspond(exercice, cible, niveau),
        );
        if (candidats.length === 0) continue;
        const exercice = departager(candidats, precedent, recents, alea);
        utilises.add(exercice.id);
        blocs.push({ exercice, phase: plan.phase, transitionS: plan.transitionS, effortS: plan.effortS });
        if (niveau > assouplissement) assouplissement = niveau;
        break;
      }
    }
  }

  return {
    contexteId: params.contexteId,
    contraintes: params.contraintes,
    ressenti: params.ressenti,
    duree: params.duree,
    graine: params.graine,
    blocs,
    dureeTotaleS: blocs.reduce((total, bloc) => total + bloc.transitionS + bloc.effortS, 0),
    assouplissement,
  };
}
