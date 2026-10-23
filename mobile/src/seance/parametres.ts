import { circuitParId } from '../circuits/circuits';
import type { Circuit } from '../circuits/types';
import { DUREES, NIVEAUX, type Duree, type Niveau } from '../catalogue/types';
import { OBJECTIFS_GENERES, type ObjectifGenere, type ParametresSeance } from '../generateur/types';

type Brut = string | string[] | undefined;

export interface ParametresUrl {
  objectif?: Brut;
  // Anciens paramètres du départ par contexte et ressenti : lus par le lancement jusqu'au nouvel écran de départ.
  contexte?: Brut;
  ressenti?: Brut;
  duree?: Brut;
  graine?: Brut;
  exclure?: Brut;
  niveau?: Brut;
}

export interface ParametresUrlCircuit {
  circuit?: Brut;
  sansMateriel?: Brut;
  tourEnPlus?: Brut;
  graine?: Brut;
}

export interface ParametresCircuit {
  circuit: Circuit;
  sansMateriel: boolean;
  tourEnPlus: boolean;
  graine: number;
}

const premier = (valeur: Brut) => (Array.isArray(valeur) ? valeur[0] : valeur);

// Un niveau absent ou invalide vaut « Léger » : il ne rend jamais la séance invalide.
export function lireNiveauUrl(brut: Brut): Niveau {
  const niveau = Number(premier(brut)) as Niveau;
  return NIVEAUX.includes(niveau) ? niveau : 1;
}

// L'écran Séance régénère la séance à partir de l'URL : même graine, même séance.
// Un ancien lien (contexte et ressenti, sans objectif) n'est plus une séance valide.
export function lireParametresSeance(brut: ParametresUrl): ParametresSeance | null {
  const objectif = premier(brut.objectif) as ObjectifGenere | undefined;
  const duree = Number(premier(brut.duree)) as Duree;
  const texteGraine = premier(brut.graine);
  const graine = Number(texteGraine);
  if (
    objectif === undefined ||
    !OBJECTIFS_GENERES.includes(objectif) ||
    !DUREES.includes(duree) ||
    texteGraine === undefined ||
    !Number.isFinite(graine)
  ) {
    return null;
  }
  const exclure = (premier(brut.exclure) ?? '').split(',').filter((id) => id !== '');
  return { objectif, duree, graine, exclure, niveau: lireNiveauUrl(brut.niveau) };
}

// Séance d'un circuit : seul « 1 » vaut vrai pour les deux options ; un circuit inconnu ou une graine invalide
// rendent la séance invalide.
export function lireParametresCircuit(brut: ParametresUrlCircuit): ParametresCircuit | null {
  const circuit = circuitParId(premier(brut.circuit) ?? '');
  const texteGraine = premier(brut.graine);
  const graine = Number(texteGraine);
  if (circuit === undefined || texteGraine === undefined || texteGraine === '' || !Number.isFinite(graine)) return null;
  return {
    circuit,
    sansMateriel: premier(brut.sansMateriel) === '1',
    tourEnPlus: premier(brut.tourEnPlus) === '1',
    graine,
  };
}
