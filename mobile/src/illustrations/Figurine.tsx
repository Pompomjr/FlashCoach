import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import Svg, { Circle, Ellipse, G, Line, Path } from 'react-native-svg';

import { posesPour } from './poses';
import { calculerPoints, LONGUEURS, poseALinstant, SOL_Y, type Point } from './squelette';

const ORANGE_PROCHE = '#F97316';
const ORANGE_LOIN = '#C2410C';
const COULEUR_OMBRE = '#3A506B';
const COULEUR_MUR = '#CBD5E1';

export type FigurineProps = {
  exerciceId: string; anime?: boolean; enPause?: boolean; taille?: number; libelle: string;
};

function Segment({ a, b, largeur }: { a: Point; b: Point; largeur: number }) {
  return <Line x1={a.x} y1={a.y} x2={b.x} y2={b.y} strokeWidth={largeur} />;
}

export function Figurine({ exerciceId, anime = true, enPause = false, taille = 240, libelle }: FigurineProps) {
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

  const pose = poseALinstant(animation.cles, actif && frame.animation === animation ? frame.t : 0);
  const p = calculerPoints(pose);
  const couleurGauche = pose.vue === 'profil' ? ORANGE_LOIN : ORANGE_PROCHE;
  const jambe = (gauche: boolean) => (
    <G stroke={gauche ? couleurGauche : ORANGE_PROCHE} strokeLinecap="round" strokeLinejoin="round">
      <Segment a={gauche ? p.hancheGauche : p.hancheDroite} b={gauche ? p.genouGauche : p.genouDroit} largeur={15} />
      <Segment a={gauche ? p.genouGauche : p.genouDroit} b={gauche ? p.chevilleGauche : p.chevilleDroite} largeur={11} />
      <Segment a={gauche ? p.chevilleGauche : p.chevilleDroite} b={gauche ? p.orteilsGauches : p.orteilsDroits} largeur={8} />
    </G>
  );
  const bras = (gauche: boolean) => (
    <G stroke={gauche ? couleurGauche : ORANGE_PROCHE} strokeLinecap="round" strokeLinejoin="round">
      <Segment a={gauche ? p.epauleGauche : p.epauleDroite} b={gauche ? p.coudeGauche : p.coudeDroit} largeur={11} />
      <Segment a={gauche ? p.coudeGauche : p.coudeDroit} b={gauche ? p.mainGauche : p.mainDroite} largeur={8} />
    </G>
  );
  const angle = pose.tronc * Math.PI / 180;
  const dos = pose.dos ?? 0;
  const milieu = { x: (p.bassin.x + p.epaules.x) / 2 + dos * Math.cos(angle),
    y: (p.bassin.y + p.epaules.y) / 2 - dos * Math.sin(angle) };

  return (
    <Svg width={taille} height={taille} viewBox="0 0 200 200" accessible
      accessibilityRole="image" accessibilityLabel={`Illustration : ${libelle}`}>
      <Ellipse cx={p.bassin.x} cy={SOL_Y + 4} rx={40} ry={6} fill={COULEUR_OMBRE} opacity={0.07} />
      <Ellipse cx={p.bassin.x} cy={SOL_Y + 4} rx={28} ry={3} fill={COULEUR_OMBRE} opacity={0.09} />
      {animation.accessoire === 'mur' && <Line x1={169} x2={169} y1={34} y2={SOL_Y + 4}
        stroke={COULEUR_MUR} strokeWidth={7} strokeLinecap="round" />}
      {jambe(true)}
      {bras(true)}
      <G stroke={ORANGE_PROCHE} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <Segment a={p.hancheGauche} b={p.hancheDroite} largeur={19} />
        <Path d={`M ${p.bassin.x} ${p.bassin.y} Q ${milieu.x} ${milieu.y} ${p.epaules.x} ${p.epaules.y}`} strokeWidth={23} />
        <Segment a={p.epauleGauche} b={p.epauleDroite} largeur={16} />
        <Segment a={p.epaules} b={p.tete} largeur={10} />
      </G>
      {jambe(false)}
      {bras(false)}
      <Circle cx={p.tete.x} cy={p.tete.y} r={LONGUEURS.rayonTete} fill={ORANGE_PROCHE} />
      {pose.vue === 'profil' && <Circle cx={p.tete.x + 8 * Math.cos(angle)}
        cy={p.tete.y + 8 * Math.sin(angle)} r={3} fill={ORANGE_PROCHE} />}
    </Svg>
  );
}

export default Figurine;
