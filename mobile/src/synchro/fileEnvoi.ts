import { enSerie } from '../preferences/serie';
import type { Stockage } from '../preferences/stockage';

export const CLE_FILE_ENVOI = 'flashcoach.synchro.v1';

// Identifiant d'entrée → numéro de sa dernière modification locale.
export type VersionsEnvoi = Record<string, number>;

type Lecture = { lue: true; versions: VersionsEnvoi } | { lue: false };

async function lireBrut(stockage: Stockage): Promise<Lecture> {
  let texte: string | null;
  try {
    texte = await stockage.lire(CLE_FILE_ENVOI);
  } catch {
    return { lue: false };
  }
  try {
    const valeur: unknown = texte === null ? {} : JSON.parse(texte);
    const versions: VersionsEnvoi = {};
    if (typeof valeur === 'object' && valeur !== null && !Array.isArray(valeur)) {
      for (const [id, version] of Object.entries(valeur)) {
        if (Number.isInteger(version) && (version as number) > 0) versions[id] = version as number;
      }
    }
    return { lue: true, versions };
  } catch {
    return { lue: true, versions: {} };
  }
}

async function ecrireSansErreur(stockage: Stockage, versions: VersionsEnvoi): Promise<void> {
  try {
    await stockage.ecrire(CLE_FILE_ENVOI, JSON.stringify(versions));
  } catch {
    // La sauvegarde attendra : l'entrée reste dans le journal local.
  }
}

export function lireFileEnvoi(stockage: Stockage): Promise<VersionsEnvoi> {
  return enSerie(stockage, async () => {
    const lecture = await lireBrut(stockage);
    return lecture.lue ? lecture.versions : {};
  });
}

export function marquerAEnvoyer(stockage: Stockage, ids: string[]): Promise<void> {
  return enSerie(stockage, async () => {
    const lecture = await lireBrut(stockage);
    if (!lecture.lue) return;
    const versions = { ...lecture.versions };
    for (const id of ids) versions[id] = (versions[id] ?? 0) + 1;
    await ecrireSansErreur(stockage, versions);
  });
}

// Une entrée modifiée pendant l'envoi garde sa place : sa nouvelle version partira au tour suivant.
export function retirerSiInchangees(stockage: Stockage, envoyees: VersionsEnvoi): Promise<void> {
  return enSerie(stockage, async () => {
    const lecture = await lireBrut(stockage);
    if (!lecture.lue) return;
    const versions = { ...lecture.versions };
    for (const [id, version] of Object.entries(envoyees)) {
      if (versions[id] === version) delete versions[id];
    }
    await ecrireSansErreur(stockage, versions);
  });
}
