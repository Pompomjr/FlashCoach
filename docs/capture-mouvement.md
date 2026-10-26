# Capture de mouvement par IA — guide pas à pas

Décidé avec Mattia le 2026-10-26 : les exercices passent de la figurine dessinée à de **courtes vidéos réalistes**, tirées de ses propres mouvements filmés. On avance exercice par exercice : tant qu'un exercice n'a pas sa vidéo, l'app garde sa figurine. **Pilote : `squat-lent`.**

## 1. Matériel et outils (tous gratuits pour démarrer)

| Étape | Outil | Rôle |
|---|---|---|
| Tournage | Ton téléphone + un trépied (ou une pile de livres) | La vidéo source |
| Capture | **Rokoko Vision** (gratuit, dans le navigateur) — sinon DeepMotion ou Move.ai | Vidéo → animation 3D (fichier FBX ou BVH) |
| Personnage | **Mixamo** (gratuit, compte Adobe) ou un personnage acheté (sportive : brassière, legging, baskets) | Le corps qui joue l'animation |
| Montage et rendu | **Blender** (gratuit) + l'extension Rokoko pour Blender (gratuite, applique l'animation au personnage) | Nettoyage, caméra, lumière, vidéo finale |

## 2. Tourner

- Téléphone **fixe**, à hauteur de hanche, à 3-4 m : tout le corps visible, des pieds aux mains levées, tout au long du mouvement.
- **Bonne lumière**, fond uni et dégagé, vêtements près du corps et d'une couleur qui tranche avec le fond.
- **Vue** : celle de la colonne « Vue » de `docs/figurine-habillage.md` (profil pour la plupart, face pour jumping jacks, pompe archer…). De profil, **ton côté droit face à la caméra**.
- Commence immobile 1 s, fais **3 répétitions propres** au rythme de la consigne, finis immobile 1 s.
- Exercice d'un seul côté : ne filme que le **côté droit** ; l'app montre le côté gauche en miroir.
- Au sol (planche, pont, chat-vache) : caméra basse, bien de côté ; ce sont les plus difficiles pour l'IA, attends-toi à plus de nettoyage.

## 3. De la vidéo au personnage

1. Rokoko Vision : importe la vidéo, lance la capture, exporte en **FBX**.
2. Blender : importe ton personnage, puis l'animation ; avec l'extension Rokoko, « retarget » l'animation sur le squelette du personnage.
3. Nettoyage : pieds qui glissent (bloque-les au sol), mains ou genoux qui traversent le sol, tremblements (lisse les courbes). Garde **une seule répétition** qui boucle : la dernière image doit rejoindre la première sans saut.

## 4. Rendu final (le format que l'app attend)

- **Caméra** orthographique ou longue focale, même cadrage pour tous les exercices (le corps entier, une marge autour).
- **Fond** uni `#EDF2F7` (la couleur de la carte de séance), ombre douce au sol ; pas de décor.
- **Vidéo** : MP4 H.264, **720 × 720**, 30 images/s, **2 à 4 s**, une répétition qui boucle, **sans son**, viser **moins de 500 Ko** (débit ~1 Mb/s).
- **Nom** : l'identifiant de l'exercice, exactement (colonne « Identifiant » de `docs/figurine-habillage.md`) : `squat-lent.mp4`.

## 5. Mettre la vidéo dans l'app

1. Copie le fichier dans `mobile/assets/exercices/` (crée le dossier la première fois).
2. Ajoute une ligne dans `mobile/src/illustrations/videos.ts` :
   ```ts
   const VIDEOS: Record<string, number> = {
     'squat-lent': require('../../assets/exercices/squat-lent.mp4'),
   };
   ```
3. Relance Expo Go : la séance montre la vidéo (en boucle, muette, à l'arrêt pendant l'aperçu et la pause, en miroir pour le côté gauche). Les autres exercices gardent leur figurine.

Tout passe par `expo-video`, qui fonctionne dans **Expo Go** : rien ne change dans ta façon de tester.

## 6. Ordre conseillé

1. **Pilote** `squat-lent` de bout en bout, puis on regarde ensemble sur le téléphone.
2. Les exercices debout faciles à capter (squats, fentes, jumping jacks, montées de genoux…).
3. Les exercices au sol, plus délicats.
4. 76 vidéos × ~400 Ko ≈ 30 Mo : acceptable dans l'app ; au-delà, on pourra les télécharger à la demande.
