// Vidéos d'exercices issues de la capture de mouvement (guide : docs/capture-mouvement.md).
// Une ligne par exercice prêt, la vidéo dans assets/exercices/<identifiant>.mp4 :
//   'squat-lent': require('../../assets/exercices/squat-lent.mp4'),
// Un exercice absent de cette table garde sa figurine dessinée.
const VIDEOS: Record<string, number> = {};

export function videoPour(exerciceId: string): number | undefined {
  return Object.hasOwn(VIDEOS, exerciceId) ? VIDEOS[exerciceId] : undefined;
}
