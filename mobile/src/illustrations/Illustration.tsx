import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect } from 'react';
import { View } from 'react-native';

import { Figurine, type FigurineProps } from './Figurine';
import { videoPour } from './videos';

/** L'illustration d'un exercice : sa vidéo (capture de mouvement) si elle existe, sinon la figurine dessinée. */
export function IllustrationExercice(props: FigurineProps) {
  const source = videoPour(props.exerciceId);
  return source === undefined ? <Figurine {...props} /> : <VideoExercice {...props} source={source} />;
}

// Boucle muette, à l'arrêt pendant l'aperçu et la pause, comme la figurine. Les vidéos sont filmées côté
// droit : le côté gauche se montre en miroir.
function VideoExercice({ source, anime = true, enPause = false, taille = 240, hauteur = taille, libelle, cote }:
  FigurineProps & { source: number }) {
  const lecteur = useVideoPlayer(source, (p) => {
    p.loop = true;
    p.muted = true;
  });
  const joue = anime && !enPause;
  useEffect(() => {
    if (joue) lecteur.play();
    else lecteur.pause();
  }, [joue, lecteur]);
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={`Illustration : ${libelle}`}>
      <VideoView
        testID="video-exercice"
        player={lecteur}
        nativeControls={false}
        contentFit="contain"
        style={[{ width: taille, height: hauteur }, cote === 'gauche' ? { transform: [{ scaleX: -1 }] } : {}]}
      />
    </View>
  );
}
