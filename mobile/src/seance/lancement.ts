import { contexteDisponible } from '../abonnement/acces';
import { CONTEXTES } from '../catalogue/contextes';
import { DUREES, RESSENTIS, type Duree, type Niveau, type Ressenti } from '../catalogue/types';
import { CHOIX_PAR_DEFAUT, type Choix } from '../preferences/preferences';
import type { ParametresUrl } from './parametres';

const premier = (valeur: string | string[] | undefined) => Array.isArray(valeur) ? valeur[0] : valeur;

// Une valeur inconnue dans un lien se comporte comme un paramètre absent.
export function choisirLancement(brut: ParametresUrl, derniers: Choix = CHOIX_PAR_DEFAUT): Choix {
  const contexte = premier(brut.contexte);
  const ressenti = premier(brut.ressenti) as Ressenti;
  const duree = Number(premier(brut.duree)) as Duree;
  return {
    contexteId: CONTEXTES.find((c) => c.id === contexte)?.id ?? derniers.contexteId,
    ressenti: RESSENTIS.includes(ressenti) ? ressenti : derniers.ressenti,
    duree: DUREES.includes(duree) ? duree : derniers.duree,
  };
}

// Les trois durées restent ouvertes comme sur le départ. Leur accès Premium sera
// ajouté ici au jalon 5, pour les deux points d'entrée à la fois.
export function lancementDisponible(choix: Choix): boolean {
  return contexteDisponible(choix.contexteId) && DUREES.includes(choix.duree);
}

// L'horloge reste chez l'appelant pour garder ce calcul pur et reproductible.
export function parametresLancement(choix: Choix, derniersExercices: readonly string[], graine: number, niveau: Niveau = 1) {
  return {
    contexte: choix.contexteId,
    ressenti: choix.ressenti,
    duree: String(choix.duree),
    graine: String(graine),
    exclure: derniersExercices.join(','),
    niveau: String(niveau),
  };
}
