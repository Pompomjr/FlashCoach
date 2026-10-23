import { CONTRAINTES_MAISON } from '../catalogue/contextes';
import { EXERCICES } from '../catalogue/exercices';
import type { Exercice } from '../catalogue/types';
import type { Bloc, Seance } from '../generateur/types';
import type { Circuit, Poste } from './types';

const ECHAUFFEMENT = ['rotation-epaules', 'cercles-hanches', 'marche-sur-place', 'rotation-poignets'];
const RETOUR_AU_CALME = ['respiration-ventre', 'etirement-ciel'];
export const REPOS_ENTRE_TOURS_S = 90;
const TRANSITION_S = 10;
const EFFORT_S = 30;

function exercice(id: string): Exercice {
  const trouve = EXERCICES.find((e) => e.id === id);
  if (!trouve) throw new Error(`Exercice inconnu dans un circuit : ${id}`);
  return trouve;
}

// Exercice réellement joué à ce poste : son remplaçant quand on n'a pas de meuble stable.
export function exerciceDuPoste(poste: Poste, sansMateriel: boolean): string {
  return sansMateriel && poste.sansMateriel ? poste.sansMateriel : poste.exerciceId;
}

export function nombreDeTours(circuit: Circuit, tourEnPlus: boolean): number {
  return circuit.tours + (tourEnPlus && circuit.tourFacultatif ? 1 : 0);
}

// Vrai pour le premier poste d'un tour 2 ou suivant : sa transition est le repos (1 min 30 en circuit, 1 min dans
// le cœur d'une séance générée de 15 ou 30 min), suivi de l'aperçu habituel de 10 s.
export function estPosteApresRepos(bloc: Bloc): boolean {
  return bloc.tour !== undefined && bloc.tour.numero > 1 && bloc.transitionS > TRANSITION_S;
}

// « tours » impose le nombre de tours (prise de masse, selon la durée choisie) ; sinon, celui du circuit,
// plus le tour facultatif des circuits Lourd si « tourEnPlus ».
export function construireSeanceCircuit(
  circuit: Circuit,
  {
    sansMateriel,
    tourEnPlus = false,
    tours,
    graine,
  }: { sansMateriel: boolean; tourEnPlus?: boolean; tours?: number; graine: number },
): Seance {
  const total = tours ?? nombreDeTours(circuit, tourEnPlus);
  const blocs: Bloc[] = ECHAUFFEMENT.map((id) => ({ exercice: exercice(id), phase: 'mise_en_route', transitionS: 5, effortS: 25 }));
  for (let numero = 1; numero <= total; numero++) {
    circuit.postes.forEach((poste, index) => {
      blocs.push({
        exercice: exercice(exerciceDuPoste(poste, sansMateriel)),
        phase: 'coeur',
        // Le repos entre deux tours est la transition du premier poste : on y voit l'exercice qui arrive.
        // Il s'ajoute à l'aperçu de 10 s de chaque poste, ce qui donne les durées annoncées (16, 21 et 26 minutes).
        transitionS: index === 0 && numero > 1 ? REPOS_ENTRE_TOURS_S + TRANSITION_S : TRANSITION_S,
        effortS: EFFORT_S,
        tour: { numero, total },
        ...(poste.cote ? { cote: poste.cote } : {}),
      });
    });
  }
  blocs.push(...RETOUR_AU_CALME.map((id) => ({ exercice: exercice(id), phase: 'retour_au_calme' as const, transitionS: 5, effortS: 25 })));
  const dureeTotaleS = blocs.reduce((somme, bloc) => somme + bloc.transitionS + bloc.effortS, 0);
  return {
    objectif: circuit.famille === 'cardio' ? 'calories' : 'masse',
    contraintes: CONTRAINTES_MAISON,
    duree: Math.round(dureeTotaleS / 60),
    graine,
    blocs,
    dureeTotaleS,
    assouplissement: 0,
    niveau: circuit.niveau,
    circuitId: circuit.id,
  };
}

// Durée totale d'un circuit, remplaçants éventuels compris (ils ne changent pas la durée) : sert aux listes avant de lancer la séance.
export function dureeCircuitS(circuit: Circuit, tourEnPlus: boolean): number {
  return construireSeanceCircuit(circuit, { sansMateriel: false, tourEnPlus, graine: 0 }).dureeTotaleS;
}
