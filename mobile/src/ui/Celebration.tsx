import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform, StyleSheet, View } from 'react-native';

import { Icone } from './icones';
import { COULEURS } from './theme';

// Animations natives hors web (le web n'a pas de pilote natif et préviendrait à chaque lancement).
const NATIF = Platform.OS !== 'web';
const DUREE_CONFETTIS = 1600;
const TAILLE_COCHE = 96;
const COULEURS_CONFETTIS = [COULEURS.orange, COULEURS.orangeProfond, COULEURS.carteClaire];

type Confetti = { dx: number; monte: number; descend: number; tours: number; couleur: string; large: boolean; delai: number };

// Quinze confettis, trajectoires fixes (pas d'aléa : même rendu à chaque fois, tests stables) :
// un éventail vers le haut, puis une retombée plus bas que le point de départ, en tournant.
const CONFETTIS: Confetti[] = Array.from({ length: 15 }, (_, i) => {
  const angle = (-150 + (120 * i) / 14) * (Math.PI / 180);
  const vitesse = 70 + ((i * 37) % 5) * 14;
  return {
    dx: Math.cos(angle) * vitesse * 1.6,
    monte: -Math.abs(Math.sin(angle)) * vitesse - 20,
    descend: 60 + ((i * 53) % 7) * 12,
    tours: (i % 2 === 0 ? 1 : -1) * (1 + (i % 3) * 0.5),
    couleur: COULEURS_CONFETTIS[i % COULEURS_CONFETTIS.length],
    large: i % 3 === 0,
    delai: (i % 4) * 0.03,
  };
});

type Mouvement = 'inconnu' | 'reduit' | 'normal';

function useMouvement(): Mouvement {
  const [mouvement, setMouvement] = useState<Mouvement>('inconnu');
  useEffect(() => {
    let monte = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((reduire) => {
        if (monte) setMouvement(reduire ? 'reduit' : 'normal');
      })
      // Réglage illisible : on reste sobre.
      .catch(() => monte && setMouvement('reduit'));
    return () => {
      monte = false;
    };
  }, []);
  return mouvement;
}

interface Props {
  // Vraie séance faite : la coche éclot et les confettis jaillissent. Sinon, apparition sobre.
  fete: boolean;
}

// Coche orange de Bravo et, pour une séance faite, une célébration discrète, une seule fois.
// « Réduire les animations » : coche immobile, ni rebond ni confettis.
export function Celebration({ fete }: Props) {
  const mouvement = useMouvement();
  const [echelle] = useState(() => new Animated.Value(fete ? 0.6 : 1));
  const [opacite] = useState(() => new Animated.Value(0));
  const [vol] = useState(() => new Animated.Value(0));
  const [retombes, setRetombes] = useState(false);
  const joue = useRef(false);
  // Une seule fois, pour une vraie séance, quand les animations sont permises.
  const confettis = fete && mouvement === 'normal' && !retombes;

  useEffect(() => {
    if (!fete) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
  }, [fete]);

  useEffect(() => {
    if (mouvement === 'inconnu' || joue.current) return;
    joue.current = true;
    if (mouvement === 'reduit') {
      echelle.setValue(1);
      opacite.setValue(1);
      return;
    }
    if (!fete) {
      Animated.timing(opacite, { toValue: 1, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: NATIF }).start();
      return;
    }
    Animated.parallel([
      Animated.timing(opacite, { toValue: 1, duration: 180, useNativeDriver: NATIF }),
      Animated.spring(echelle, { toValue: 1, friction: 4.5, tension: 120, useNativeDriver: NATIF }),
      Animated.timing(vol, { toValue: 1, duration: DUREE_CONFETTIS, easing: Easing.linear, useNativeDriver: NATIF }),
    ]).start(({ finished }) => {
      if (finished) setRetombes(true);
    });
  }, [mouvement, fete, echelle, opacite, vol]);

  return (
    <View style={styles.zone} aria-hidden>
      {confettis && <Confettis vol={vol} />}
      <Animated.View style={[styles.coche, { opacity: opacite, transform: [{ scale: echelle }] }]}>
        <Icone nom="coche" taille={56} couleur={COULEURS.texteSurOrange} />
      </Animated.View>
    </View>
  );
}

function Confettis({ vol }: { vol: Animated.Value }) {
  const pieces = useMemo(
    () =>
      CONFETTIS.map((c) => {
        const debut = c.delai;
        // Montée rapide (ease-out), puis retombée plus lente : une parabole approchée par paliers.
        const t = [debut, debut + 0.12, debut + 0.3, 0.55, 0.8, 1];
        const x = [0, c.dx * 0.45, c.dx * 0.8, c.dx * 0.95, c.dx * 1.05, c.dx * 1.1];
        const y = [0, c.monte * 0.75, c.monte, c.monte * 0.55, c.descend * 0.5, c.descend];
        return {
          c,
          transform: [
            { translateX: vol.interpolate({ inputRange: t, outputRange: x, extrapolate: 'clamp' }) },
            { translateY: vol.interpolate({ inputRange: t, outputRange: y, extrapolate: 'clamp' }) },
            { rotate: vol.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${c.tours * 360}deg`] }) },
          ],
          opacity: vol.interpolate({ inputRange: [0, debut, debut + 0.02, 0.7, 1], outputRange: [0, 0, 1, 1, 0] }),
        };
      }),
    [vol],
  );
  return (
    <View testID="confettis" pointerEvents="none" style={styles.confettis}>
      {pieces.map(({ c, transform, opacity }, i) => (
        <Animated.View
          key={i}
          style={[
            styles.confetti,
            { backgroundColor: c.couleur, width: c.large ? 10 : 7, height: c.large ? 6 : 11, opacity, transform },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  zone: { width: TAILLE_COCHE, height: TAILLE_COCHE, alignItems: 'center', justifyContent: 'center' },
  coche: {
    width: TAILLE_COCHE,
    height: TAILLE_COCHE,
    borderRadius: TAILLE_COCHE / 2,
    backgroundColor: COULEURS.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Les confettis partent du centre de la coche, derrière elle et derrière les textes qui suivent.
  confettis: { position: 'absolute', left: TAILLE_COCHE / 2, top: TAILLE_COCHE / 2, width: 0, height: 0 },
  confetti: { position: 'absolute', borderRadius: 2 },
});
