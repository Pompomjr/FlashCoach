import type { Exercice } from '../catalogue/types';
import { choisirAuHasard, creerAleatoire } from './aleatoire';
import { cibleDePhase, correspond, type Cible } from './cibles';
import { filtrerCatalogue } from './filtres';
import { STRUCTURE_PAR_DUREE } from './structure';
import type { Bloc, NiveauAssouplissement, ParametresSeance, Seance } from './types';

const NIVEAUX: NiveauAssouplissement[] = [0, 1, 2, 3, 4];

interface Situation {
  precedent: Exercice | undefined;
  cible: Cible;
  // Cibles des phases suivantes : on évite de leur prendre un exercice idéal.
  ciblesAVenir: Cible[];
  recents: Set<string>;
}

// 0 : idéal ; 1 : intensité hors plage ; 2 : autre effet accepté ; 3 : hors famille.
function distance(exercice: Exercice, cible: Cible): number {
  if (correspond(exercice, cible, 0)) return 0;
  if (correspond(exercice, cible, 1)) return 1;
  if (correspond(exercice, cible, 2)) return 2;
  return 3;
}

// Clé de préférence, comparée dans l'ordre : plus petit = mieux.
function cle(exercice: Exercice, situation: Situation): number[] {
  const { precedent, cible, ciblesAVenir, recents } = situation;
  return [
    precedent !== undefined && precedent.id === exercice.id ? 1 : 0,
    distance(exercice, cible),
    recents.has(exercice.id) ? 1 : 0,
    ciblesAVenir.some((aVenir) => correspond(exercice, aVenir, 0)) ? 1 : 0,
    precedent !== undefined && precedent.zone === exercice.zone ? 1 : 0,
  ];
}

function comparerCles(a: number[], b: number[]): number {
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}

function departager(candidats: Exercice[], situation: Situation, alea: () => number): Exercice {
  const cles = candidats.map((exercice) => cle(exercice, situation));
  const meilleure = cles.reduce((min, courante) => (comparerCles(courante, min) < 0 ? courante : min));
  return choisirAuHasard(
    candidats.filter((_, index) => comparerCles(cles[index], meilleure) === 0),
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
  const structure = STRUCTURE_PAR_DUREE[params.duree];

  structure.forEach((plan, indexPhase) => {
    const cible = cibleDePhase(plan.phase, params.ressenti);
    const ciblesAVenir = structure.slice(indexPhase + 1).map((suivant) => cibleDePhase(suivant.phase, params.ressenti));
    for (let i = 0; i < plan.nombre; i++) {
      const precedent = blocs.length > 0 ? blocs[blocs.length - 1].exercice : undefined;
      let place = false;
      // 2-3. Classer selon la cible et choisir, en assouplissant niveau par niveau.
      for (const niveau of NIVEAUX) {
        const candidats = compatibles.filter(
          (exercice) => (niveau >= 3 || !utilises.has(exercice.id)) && correspond(exercice, cible, niveau),
        );
        if (candidats.length === 0) continue;
        const exercice = departager(candidats, { precedent, cible, ciblesAVenir, recents }, alea);
        utilises.add(exercice.id);
        blocs.push({ exercice, phase: plan.phase, transitionS: plan.transitionS, effortS: plan.effortS });
        if (niveau > assouplissement) assouplissement = niveau;
        place = true;
        break;
      }
      // Au niveau 4, tout exercice compatible est candidat : on n'arrive ici que si cet invariant est cassé.
      if (!place) throw new Error('Invariant cassé : aucun exercice placé alors que le catalogue est compatible');
    }
  });

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
