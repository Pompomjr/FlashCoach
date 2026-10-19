import type { Stockage } from './stockage';

// Lire-modifier-écrire n'est pas atomique : on met les opérations d'un même stockage en file.
// Partagée par le journal et la file d'envoi, pour qu'elles ne s'entrelacent jamais.
const files = new WeakMap<Stockage, Promise<unknown>>();

export function enSerie<T>(stockage: Stockage, operation: () => Promise<T>): Promise<T> {
  const precedente = files.get(stockage) ?? Promise.resolve();
  const suivante = precedente.then(operation, operation);
  files.set(stockage, suivante.catch(() => undefined));
  return suivante;
}
