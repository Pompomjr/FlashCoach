import { DUREES, RESSENTIS, type Contexte, type Duree, type Exercice, type Ressenti } from '../catalogue/types';
import { CIBLE_PAR_RESSENTI, correspond } from './cibles';
import { filtrerCatalogue } from './filtres';
import { genererSeance } from './generer';
import type { NiveauAssouplissement } from './types';

export interface LigneCouverture {
  contexteId: string;
  ressenti: Ressenti;
  // Exercices qui respectent les contraintes du contexte.
  compatibles: number;
  // Parmi eux, ceux qui collent au ressenti (effet et intensité) pour le cœur de séance.
  ideaux: number;
  assouplissement: Record<Duree, NiveauAssouplissement>;
}

const LIBELLES: Record<NiveauAssouplissement, string> = {
  0: 'idéal',
  1: 'intensité assouplie',
  2: 'effet assoupli',
  3: 'exercices répétés',
};

// Graine fixe : le rapport reste le même d'un lancement à l'autre.
const GRAINE_RAPPORT = 1;

export function analyserCouverture(catalogue: Exercice[], contextes: Contexte[]): LigneCouverture[] {
  const lignes: LigneCouverture[] = [];
  for (const contexte of contextes) {
    const compatibles = filtrerCatalogue(catalogue, contexte.contraintes);
    for (const ressenti of RESSENTIS) {
      const cible = CIBLE_PAR_RESSENTI[ressenti];
      const niveau = (duree: Duree): NiveauAssouplissement =>
        compatibles.length === 0
          ? 3
          : genererSeance(
              { contexteId: contexte.id, contraintes: contexte.contraintes, ressenti, duree, graine: GRAINE_RAPPORT },
              catalogue,
            ).assouplissement;
      lignes.push({
        contexteId: contexte.id,
        ressenti,
        compatibles: compatibles.length,
        ideaux: compatibles.filter((exercice) => correspond(exercice, cible, 0)).length,
        assouplissement: { 3: niveau(3), 5: niveau(5), 10: niveau(10) },
      });
    }
  }
  return lignes;
}

export function formaterRapport(lignes: LigneCouverture[]): string {
  const aCompleter = lignes.filter((ligne) => DUREES.some((duree) => ligne.assouplissement[duree] > 0));
  if (aCompleter.length === 0) return 'Catalogue complet : toutes les combinaisons sont idéales.';
  return [
    `${aCompleter.length} combinaison(s) sur ${lignes.length} à compléter :`,
    ...aCompleter.map((ligne) => {
      const details = DUREES.map((duree) => `${duree} min : ${LIBELLES[ligne.assouplissement[duree]]}`).join(', ');
      return `- ${ligne.contexteId} + ${ligne.ressenti} : ${ligne.ideaux} exercice(s) idéal(aux) sur ${ligne.compatibles} compatible(s) (${details})`;
    }),
  ].join('\n');
}
