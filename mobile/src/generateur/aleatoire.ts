// Générateur mulberry32 : même graine, même suite. Permet de rejouer une séance à l'identique dans les tests.
export function creerAleatoire(graine: number): () => number {
  let etat = graine >>> 0;
  return () => {
    etat = (etat + 0x6d2b79f5) >>> 0;
    let t = etat;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function choisirAuHasard<T>(liste: readonly T[], alea: () => number): T {
  if (liste.length === 0) throw new Error('Liste vide');
  return liste[Math.floor(alea() * liste.length)];
}
