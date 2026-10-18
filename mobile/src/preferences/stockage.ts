import AsyncStorage from '@react-native-async-storage/async-storage';

// Petite interface pour remplacer le stockage du téléphone par une mémoire dans les tests.
export interface Stockage {
  lire(cle: string): Promise<string | null>;
  ecrire(cle: string, valeur: string): Promise<void>;
}

export const stockageTelephone: Stockage = {
  lire: (cle) => AsyncStorage.getItem(cle),
  ecrire: (cle, valeur) => AsyncStorage.setItem(cle, valeur),
};
