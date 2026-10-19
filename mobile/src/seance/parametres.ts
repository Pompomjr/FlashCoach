import { contexteDisponible } from '../abonnement/acces';
import { CONTEXTES } from '../catalogue/contextes';
import { DUREES, NIVEAUX, RESSENTIS, type Duree, type Niveau, type Ressenti } from '../catalogue/types';
import type { ParametresSeance } from '../generateur/types';

type Brut = string | string[] | undefined;

export interface ParametresUrl {
  contexte?: Brut;
  ressenti?: Brut;
  duree?: Brut;
  graine?: Brut;
  exclure?: Brut;
  niveau?: Brut;
}

const premier = (valeur: Brut) => (Array.isArray(valeur) ? valeur[0] : valeur);

// Un niveau absent ou invalide vaut « Doux » : il ne rend jamais la séance invalide.
export function lireNiveauUrl(brut: Brut): Niveau {
  const niveau = Number(premier(brut)) as Niveau;
  return NIVEAUX.includes(niveau) ? niveau : 1;
}

// L'écran Séance régénère la séance à partir de l'URL : même graine, même séance.
export function lireParametresSeance(brut: ParametresUrl): ParametresSeance | null {
  const contexte = CONTEXTES.find((c) => c.id === premier(brut.contexte));
  const ressenti = premier(brut.ressenti) as Ressenti | undefined;
  const duree = Number(premier(brut.duree)) as Duree;
  const texteGraine = premier(brut.graine);
  const graine = Number(texteGraine);
  if (
    contexte === undefined ||
    !contexteDisponible(contexte.id) ||
    ressenti === undefined ||
    !RESSENTIS.includes(ressenti) ||
    !DUREES.includes(duree) ||
    texteGraine === undefined ||
    !Number.isFinite(graine)
  ) {
    return null;
  }
  const exclure = (premier(brut.exclure) ?? '').split(',').filter((id) => id !== '');
  return { contexteId: contexte.id, contraintes: contexte.contraintes, ressenti, duree, graine, exclure, niveau: lireNiveauUrl(brut.niveau) };
}
