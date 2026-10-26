import type { FormeFigurine } from './dessin';
import type { Point, Pose } from './squelette';

/** Les vêtements suivent le repère du buste et sont découpés par sa silhouette courbe. */
export function habillerTronc(pose: Pose, bassin: Point, epaules: Point, decoupe: string): FormeFigurine[] {
  const axe = { x: epaules.x - bassin.x, y: epaules.y - bassin.y };
  const longueur = Math.hypot(axe.x, axe.y) || 1;
  const normale = { x: -axe.y / longueur, y: axe.x / longueur };
  const en = (s: number, n: number): Point => ({
    x: bassin.x + axe.x * s + normale.x * n, y: bassin.y + axe.y * s + normale.y * n,
  });
  const pt = (p: Point) => `${Math.round(p.x * 100) / 100} ${Math.round(p.y * 100) / 100}`;
  const bande = (a: number, b: number, debut = -40, fin = 40) =>
    `M${[en(a, debut), en(b, debut), en(b, fin), en(a, fin)].map(pt).join('L')}Z`;
  // Les extrémités arrondies évitent des petits rectangles sur la peau des épaules.
  const bretelle = (a: Point, b: Point, rayon: number) => {
    const longueur = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const n = { x: -(b.y - a.y) / longueur * rayon, y: (b.x - a.x) / longueur * rayon };
    const cote = (p: Point, signe: number) => pt({ x: p.x + n.x * signe, y: p.y + n.y * signe });
    return `M${cote(a, 1)}L${cote(b, 1)}A${rayon} ${rayon} 0 0 0 ${cote(b, -1)}`
      + `L${cote(a, -1)}A${rayon} ${rayon} 0 0 0 ${cote(a, 1)}Z`;
  };
  const formes: FormeFigurine[] = [
    { d: bande(-.5, .22), teinte: 'legging', decoupe },
    { d: bande(-.5, .22, -40, -2), teinte: 'leggingLoin', decoupe },
    { d: bande(.49, .87), teinte: 'brassiere', decoupe },
    { d: bande(.49, .87, -40, -2), teinte: 'brassiereLoin', decoupe },
  ];
  if (pose.vue === 'face') {
    for (const signe of [-1, 1]) formes.push({
      d: bretelle(en(.72, signe * 9), en(1.05, signe * 10), 2.5), teinte: 'brassiere', decoupe,
    });
  } else formes.push({ d: bretelle(en(.74, 4), en(1.02, 2), 3.2), teinte: 'brassiere', decoupe });
  return formes;
}
