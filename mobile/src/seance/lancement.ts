import { DUREES, NIVEAUX, OBJECTIFS, type Duree, type Niveau, type Objectif } from '../catalogue/types';
import { circuitDemandeUnMeuble } from '../circuits/affichage';
import { circuitParId } from '../circuits/circuits';
import { circuitPourMasse, familleSuivante, FAMILLES_MASSE, toursPourDuree } from '../circuits/masse';
import type { FamilleCircuit } from '../circuits/types';
import { lireJournal, type EntreeJournal } from '../journal/journal';
import { lireSansMateriel } from '../preferences/materiel';
import { lireNiveau } from '../preferences/niveau';
import { CHOIX_PAR_DEFAUT, lireChoix, lireDerniersExercices, type Choix } from '../preferences/preferences';
import type { Stockage } from '../preferences/stockage';

type Brut = string | string[] | undefined;

// Paramètres du lien direct (/go) : les autres, anciens compris (contexte, ressenti, niveau), sont ignorés.
export interface ParametresLien {
  objectif?: Brut;
  intensite?: Brut;
  duree?: Brut;
}

// Tout ce que le départ et le lien direct lisent avant de lancer une séance.
export interface DonneesLancement {
  choix: Choix;
  // Intensité enregistrée (Léger, Moyen, Lourd) : ajustée par Bravo.
  niveau: Niveau;
  // Exercices de la séance précédente, à éviter.
  derniersExercices: string[];
  // Famille de la dernière séance de masse, pour faire tourner les familles.
  derniereFamille: FamilleCircuit | null;
  // « Je n'ai pas de meuble stable », retenu depuis la page des circuits.
  sansMateriel: boolean;
}

const premier = (valeur: Brut) => (Array.isArray(valeur) ? valeur[0] : valeur);

// Une valeur inconnue dans un lien se comporte comme un paramètre absent : on garde les derniers choix.
export function choisirLancement(brut: Omit<ParametresLien, 'intensite'>, derniers: Choix = CHOIX_PAR_DEFAUT): Choix {
  const objectif = premier(brut.objectif) as Objectif;
  const duree = Number(premier(brut.duree)) as Duree;
  return {
    objectif: OBJECTIFS.includes(objectif) ? objectif : derniers.objectif,
    duree: DUREES.includes(duree) ? duree : derniers.duree,
  };
}

// Une intensité valide dans le lien vaut pour cette séance seulement ; sinon, l'intensité enregistrée.
export function intensiteDuLien(brut: Brut, enregistree: Niveau): Niveau {
  const texte = premier(brut);
  const niveau = (texte === undefined || texte === '' ? NaN : Number(texte)) as Niveau;
  return NIVEAUX.includes(niveau) ? niveau : enregistree;
}

// Le journal garde la séance la plus récente en tête. Tout circuit de renforcement compte, qu'il vienne de
// « Prise de masse » ou de « Séances prêtes » ; le cardio et les circuits inconnus de cette version, non.
export function derniereFamilleMasse(entrees: readonly EntreeJournal[]): FamilleCircuit | null {
  for (const entree of entrees) {
    const famille = entree.circuitId === null ? undefined : circuitParId(entree.circuitId)?.famille;
    if (famille !== undefined && FAMILLES_MASSE.includes(famille)) return famille;
  }
  return null;
}

export async function lireDonneesLancement(stockage: Stockage): Promise<DonneesLancement> {
  const [choix, niveau, derniersExercices, journal, sansMateriel] = await Promise.all([
    lireChoix(stockage),
    lireNiveau(stockage),
    lireDerniersExercices(stockage),
    lireJournal(stockage),
    lireSansMateriel(stockage),
  ]);
  return { choix, niveau, derniersExercices, derniereFamille: derniereFamilleMasse(journal), sansMateriel };
}

// Paramètres de l'écran Séance. Brûler des calories et Étirements : séance générée. Prise de masse : un circuit
// de la famille suivante, au niveau choisi, avec le nombre de tours de la durée. L'horloge (graine) reste chez
// l'appelant pour garder ce calcul pur et reproductible.
export function parametresLancement(donnees: DonneesLancement, graine: number): Record<string, string> {
  const { choix, niveau } = donnees;
  if (choix.objectif === 'masse') {
    const circuit = circuitPourMasse(niveau, familleSuivante(donnees.derniereFamille));
    return {
      circuit: circuit.id,
      tours: String(toursPourDuree(choix.duree)),
      // Les remplaçants ne comptent que si le circuit demande un meuble (comme sur la page du circuit).
      sansMateriel: donnees.sansMateriel && circuitDemandeUnMeuble(circuit) ? '1' : '0',
      graine: String(graine),
    };
  }
  return {
    objectif: choix.objectif,
    duree: String(choix.duree),
    graine: String(graine),
    exclure: donnees.derniersExercices.join(','),
    niveau: String(niveau),
  };
}
