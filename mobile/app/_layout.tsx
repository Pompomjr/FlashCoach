import { BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed/700Bold';
import { BarlowCondensed_800ExtraBold } from '@expo-google-fonts/barlow-condensed/800ExtraBold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { COULEURS, POLICE_AFFICHAGE_EXTRA, POLICE_AFFICHAGE_GRAS } from '../src/ui/theme';

// L'écran de démarrage reste affiché tant que la police d'affichage n'est pas prête (appel au chargement
// du module, pas dans un composant, pour ne pas arriver trop tard).
SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  // Le nom de chaque police est la clé de la table : le même sur Android, iOS et web.
  const [chargee, erreur] = useFonts({
    [POLICE_AFFICHAGE_GRAS]: BarlowCondensed_700Bold,
    [POLICE_AFFICHAGE_EXTRA]: BarlowCondensed_800ExtraBold,
  });
  const prete = chargee || erreur !== null;

  // Police en erreur : on lève quand même l'écran de démarrage, l'app continue en police système.
  useEffect(() => {
    if (prete) SplashScreen.hideAsync().catch(() => undefined);
  }, [prete]);

  if (!prete) return null;

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COULEURS.fond } }} />
    </>
  );
}
