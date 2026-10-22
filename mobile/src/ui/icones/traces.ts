// Dessin des icônes : grille 24, trait 2, extrémités et jonctions arrondies (appliqués par `Icone`).
// Données pures (une liste de tracés SVG par icône) : lisibles sans React, réutilisables hors de l'app.

function rect(x: number, y: number, w: number, h: number, r: number): string {
  return (
    `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}` +
    `a${r} ${r} 0 0 1 -${r} ${r}h-${w - 2 * r}a${r} ${r} 0 0 1 -${r} -${r}` +
    `v-${h - 2 * r}a${r} ${r} 0 0 1 ${r} -${r}z`
  );
}

const cercle = (cx: number, cy: number, r: number) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 -${2 * r} 0z`;
// Un point : trait de longueur quasi nulle, rendu rond par l'extrémité arrondie.
const point = (x: number, y: number) => `M${x} ${y}h.01`;

export const TRACES = {
  // Soleil levant sur l'horizon.
  reveil: ['M3 17h18', 'M7 17a5 5 0 0 1 10 0', 'M12 6.5V9', 'M6.3 11.3 4.8 9.8', 'M17.7 11.3l1.5-1.5', 'M8 21h8'],
  maison: ['M3.5 11.5 12 4l8.5 7.5', 'M5.5 10v10h13V10', 'M10 20v-5h4v5'],
  // Mallette.
  bureau: [rect(3, 8, 18, 12, 2.5), 'M9 8V6.5A1.5 1.5 0 0 1 10.5 5h3A1.5 1.5 0 0 1 15 6.5V8', 'M3 13.5h18'],
  // Valise à roulettes : poignée télescopique, nervures, deux roues.
  voyage: [rect(6, 7, 12, 12, 2.5), 'M9.5 7V3.5h5V7', 'M10 11v4', 'M14 11v4', 'M9 19v2', 'M15 19v2'],
  // Sapin.
  dehors: ['M12 3 17 10h-2.5L19 17H5l4.5-7H7z', 'M12 17v4'],
  // Articulation serrée : un os, une jointure et deux chevrons qui la pressent des deux côtés.
  raide: ['M12 3v6.5', cercle(12, 12, 2.5), 'M12 14.5V21', 'M4 8.5l3 3.5-3 3.5', 'M20 8.5 17 12l3 3.5'],
  // Ondes agitées.
  stresse: ['M3 7q2.25-3 4.5 0t4.5 0 4.5 0 4.5 0', 'M3 12q2.25-3 4.5 0t4.5 0 4.5 0 4.5 0', 'M3 17q2.25-3 4.5 0t4.5 0 4.5 0 4.5 0'],
  // Batterie presque vide.
  mou: [rect(2, 7, 17, 10, 2.5), 'M22 11v2', 'M6 10.5v3'],
  // Éclair.
  en_forme: ['M13 2.5 5 13.5h6l-1 8 8-11h-6z'],
  cadenas: [rect(5, 11, 14, 10, 2.5), 'M8 11V8a4 4 0 0 1 8 0v3', 'M12 15v2.5'],
  // Flèche retour Material (arrow_back).
  retour: ['M19 12H5', 'M12 19l-7-7 7-7'],
  // Carnet à reliure.
  journal: [rect(5, 3, 14, 18, 2.5), 'M9 3v18', 'M12.5 8h3', 'M12.5 12h3'],
  mieux: [cercle(12, 12, 9), point(9, 9.5), point(15, 9.5), 'M8 14.5a5 5 0 0 0 8 0'],
  pareil: [cercle(12, 12, 9), point(9, 9.5), point(15, 9.5), 'M8.5 15h7'],
  coche: ['M5 12.5l4.5 4.5L19 7.5'],
  // Deux flèches en boucle : un circuit qui se répète.
  circuit: ['M4 12a8 8 0 0 1 13.7-5.6', 'M18 3v4h-4', 'M20 12a8 8 0 0 1-13.7 5.6', 'M6 21v-4h4'],
} as const satisfies Record<string, readonly string[]>;

export type NomIcone = keyof typeof TRACES;

export const NOMS_ICONES = Object.keys(TRACES) as NomIcone[];
