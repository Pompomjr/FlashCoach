import { useEffect, useState } from 'react';
import { AccessibilityInfo, View } from 'react-native';
import Svg, { Ellipse, Path, Rect } from 'react-native-svg';

import { COULEURS } from '../ui/theme';
import { cadrer, dessinerFigurine, MUR, type Cadre, type Teinte } from './dessin';
import { posesPour, type AnimationFigurine } from './poses';
import { poseALinstant, SOL_Y } from './squelette';

// Profondeur : membres éloignés en orange profond, proches en orange ; cheveux un ton plus sombre.
const TEINTES: Record<Teinte, string> = {
  proche: COULEURS.orange, loin: COULEURS.orangeProfond, cheveux: COULEURS.cheveux, oeil: COULEURS.texteSombre,
  separation: COULEURS.carteClaire,
};
// Épaisseur du liseré qui détache le bras proche du tronc.
const LISERE = 3;

// Le cadre d'une animation ne change jamais : calculé une fois, à la première apparition.
const CADRES = new WeakMap<AnimationFigurine, Cadre>();
function cadreDe(animation: AnimationFigurine): Cadre {
  let cadre = CADRES.get(animation);
  if (cadre === undefined) {
    cadre = cadrer(animation.cles, animation.continu, animation.accessoire === 'mur');
    CADRES.set(animation, cadre);
  }
  return cadre;
}

/** `taille` : largeur de la vue ; `hauteur` (par défaut égale à `taille`) permet une zone non carrée,
 * dans laquelle le dessin est agrandi au maximum et centré. */
export type FigurineProps = {
  exerciceId: string; anime?: boolean; enPause?: boolean; taille?: number; hauteur?: number; libelle: string;
};

export function Figurine({ exerciceId, anime = true, enPause = false, taille = 240, hauteur = taille, libelle }: FigurineProps) {
  const animation = posesPour(exerciceId);
  // Aucune frame avant la réponse système : pas de flash animé en mode réduit.
  const [reduire, setReduire] = useState(true);
  const [frame, setFrame] = useState({ animation, t: 0 });
  const actif = anime && !enPause && !reduire;

  useEffect(() => {
    let monte = true;
    let evenementRecu = false;
    const abonnement = AccessibilityInfo.addEventListener('reduceMotionChanged', valeur => {
      evenementRecu = true;
      if (monte) setReduire(valeur);
    });
    void AccessibilityInfo.isReduceMotionEnabled().then(valeur => {
      if (monte && !evenementRecu) setReduire(valeur);
    }).catch(() => { /* En cas d'indisponibilité, conserver une illustration immobile. */ });
    return () => { monte = false; abonnement.remove(); };
  }, []);

  useEffect(() => {
    if (!actif) return;
    let id: number;
    let debut: number | undefined;
    let annule = false;
    const avancer = (maintenant: number) => {
      if (annule) return;
      debut ??= maintenant;
      setFrame({ animation, t: ((maintenant - debut) % animation.dureeCycleMs) / animation.dureeCycleMs });
      id = requestAnimationFrame(avancer);
    };
    id = requestAnimationFrame(avancer);
    return () => { annule = true; cancelAnimationFrame(id); };
  }, [actif, animation]);

  const pose = poseALinstant(animation.cles, actif && frame.animation === animation ? frame.t : 0, animation.continu);
  const dessin = dessinerFigurine(pose);
  const mur = animation.accessoire === 'mur';
  const cadre = cadreDe(animation);

  // Rôle et libellé sur une vue : portés par le Svg, ils deviennent des attributs invalides sur le web.
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={`Illustration : ${libelle}`}
      style={{ width: taille, height: hauteur }}>
      <Svg width={taille} height={hauteur} viewBox={`${cadre.x} ${cadre.y} ${cadre.largeur} ${cadre.hauteur}`}
        preserveAspectRatio="xMidYMid meet">
        <Ellipse cx={dessin.ombre.cx} cy={dessin.ombre.cy} rx={dessin.ombre.rx} ry={dessin.ombre.ry}
          fill={COULEURS.fond} opacity={dessin.ombre.opacite} />
        {mur && <>
          <Rect x={MUR.x} y={MUR.haut} width={MUR.largeur} height={SOL_Y + 6 - MUR.haut} rx={5} fill={COULEURS.mur} />
          <Rect x={MUR.x} y={MUR.haut} width={3} height={SOL_Y + 6 - MUR.haut} rx={1.5} fill={COULEURS.areteMur} />
        </>}
        {dessin.formes.map((forme, i) => forme.teinte === 'separation'
          ? <Path key={i} d={forme.d} fill={TEINTES.separation} stroke={TEINTES.separation} strokeWidth={LISERE}
            strokeLinejoin="round" />
          : <Path key={i} d={forme.d} fill={TEINTES[forme.teinte]} />)}
      </Svg>
    </View>
  );
}

export default Figurine;
