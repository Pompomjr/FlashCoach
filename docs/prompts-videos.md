# Prompts vidéo par exercice (Higgsfield, depuis le chat Claude)

Rédigés le 2026-11-12 pour Mattia. Un prompt par exercice, à coller **dans un nouveau chat Claude** (pas dans Claude Code : l'illimité de l'essai n'y marche pas). `jumping-jacks` est déjà fait, et `squat-lent` aussi (son prompt reste ici pour le refaire au besoin).

- Images du coach dans le compte Higgsfield : face `1ebb951a-1069-4473-b564-eb0f8e23ee23`, profil `1f3f545d-2aab-4b13-b6c9-0c2fca6ed6db`.
- Exercices qui ne partent pas debout : le prompt demande d'abord une image de la position de départ, puis la vidéo.
- Même image en première et dernière image : la vidéo boucle. Si le résultat est figé, relancer sans la dernière image.
- Exercice d'un seul côté : côté droit seulement, l'app montre l'autre en miroir.
- Ensuite : coller le lien de la vidéo dans Claude Code, qui la met au format et la branche (`docs/capture-mouvement.md`, § 7).

## 1. Rotation des épaules — `rotation-epaules` (profil, 4 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
1. Génère une image GPT Image 2.6, format 1:1, avec l'image Higgsfield 1f3f545d-2aab-4b13-b6c9-0c2fca6ed6db en référence. Prompt : « Same woman as the reference image: same face, auburn hair in a high ponytail, orange sports bra, slate-blue leggings, off-white sneakers. Photorealistic studio photo, plain light grey-blue seamless background, soft even lighting, soft shadow on the floor, whole body in frame with margin all around. Strict side view, camera at 90 degrees to her body. Standing upright, facing the right of the frame, fingertips resting on top of her shoulders, elbows bent at shoulder height. No text, no logo. »
2. Puis génère une vidéo Seedance 2.5 : 4 s, format 1:1, 720p, sans son, avec l'image de l'étape 1 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi. Prompt : « Same woman and same pose as in the image. She slowly draws two large backward circles with her elbows, fingertips staying on her shoulders. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de l'image et le lien de la vidéo. (Flash Coach : rotation-epaules)
```

## 2. Respiration carrée — `respiration-carree` (face, 8 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
Génère une vidéo Seedance 2.5 : 8 s, format 1:1, 720p, sans son, avec l'image Higgsfield 1ebb951a-1069-4473-b564-eb0f8e23ee23 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi.
Prompt : « Same woman as in the image. She stands still and breathes slowly: a deep inhale through the nose that lifts her chest, a calm hold, a long exhale that lowers her chest, a calm hold. Arms relaxed, only the chest and belly move. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de la vidéo. (Flash Coach : respiration-carree)
```

## 3. Inclinaison latérale — `inclinaison-laterale` (face, 5 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
1. Génère une image GPT Image 2.6, format 1:1, avec l'image Higgsfield 1ebb951a-1069-4473-b564-eb0f8e23ee23 en référence. Prompt : « Same woman as the reference image: same face, auburn hair in a high ponytail, orange sports bra, slate-blue leggings, off-white sneakers. Photorealistic studio photo, plain light grey-blue seamless background, soft even lighting, soft shadow on the floor, whole body in frame with margin all around. Front view. Standing upright facing the camera, feet hip-width apart, both arms stretched straight overhead, palms together. No text, no logo. »
2. Puis génère une vidéo Seedance 2.5 : 5 s, format 1:1, 720p, sans son, avec l'image de l'étape 1 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi. Prompt : « Same woman and same pose as in the image. She slowly bends her torso sideways toward her right, holds one breath, then slowly comes back upright. Hips stay still, arms stay overhead. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de l'image et le lien de la vidéo. (Flash Coach : inclinaison-laterale)
```

## 4. Pompes contre le mur — `pompes-mur` (profil, 4 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
1. Génère une image GPT Image 2.6, format 1:1, avec l'image Higgsfield 1f3f545d-2aab-4b13-b6c9-0c2fca6ed6db en référence. Prompt : « Same woman as the reference image: same face, auburn hair in a high ponytail, orange sports bra, slate-blue leggings, off-white sneakers. Photorealistic studio photo, plain light grey-blue seamless background, soft even lighting, soft shadow on the floor, whole body in frame with margin all around. Strict side view, camera at 90 degrees to her body. Standing facing a plain flat grey-blue wall on the right edge of the frame, about one arm's length away, both palms flat on the wall at shoulder height, arms straight, body in one straight line leaning slightly forward. No text, no logo. »
2. Puis génère une vidéo Seedance 2.5 : 4 s, format 1:1, 720p, sans son, avec l'image de l'étape 1 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi. Prompt : « Same woman and same pose as in the image. She bends her elbows to bring her nose close to the wall, then pushes back until her arms are straight. Body stays in one straight line, heels on the floor. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de l'image et le lien de la vidéo. (Flash Coach : pompes-mur)
```

## 5. Squat lent — `squat-lent` (profil, 5 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
Génère une vidéo Seedance 2.5 : 5 s, format 1:1, 720p, sans son, avec l'image Higgsfield 1f3f545d-2aab-4b13-b6c9-0c2fca6ed6db en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi.
Prompt : « Same woman as in the image. She slowly squats as if sitting on an invisible chair: hips go back and down until her thighs are parallel to the floor, arms reaching forward for balance, back straight, heels on the floor. Then she stands back up and lowers her arms. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de la vidéo. (Flash Coach : squat-lent)
```

## 6. Marche genoux hauts — `marche-genoux-hauts` (profil, 4 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
Génère une vidéo Seedance 2.5 : 4 s, format 1:1, 720p, sans son, avec l'image Higgsfield 1f3f545d-2aab-4b13-b6c9-0c2fca6ed6db en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi.
Prompt : « Same woman as in the image. She marches on the spot without jumping: right knee lifts to hip height, then left knee, four steps in total, opposite arm swinging naturally. One foot always on the floor. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de la vidéo. (Flash Coach : marche-genoux-hauts)
```

## 8. Fentes arrière — `fentes-arriere` (profil, 4 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
Génère une vidéo Seedance 2.5 : 4 s, format 1:1, 720p, sans son, avec l'image Higgsfield 1f3f545d-2aab-4b13-b6c9-0c2fca6ed6db en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi.
Prompt : « Same woman as in the image. She takes a big step back with her right leg (the leg nearest the camera), lowers her back knee toward the floor until both knees are at 90 degrees, torso upright, then pushes back to standing with feet together. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de la vidéo. (Flash Coach : fentes-arriere)
```

## 9. Chat-vache — `chat-vache` (profil, 5 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
1. Génère une image GPT Image 2.6, format 1:1, avec l'image Higgsfield 1f3f545d-2aab-4b13-b6c9-0c2fca6ed6db en référence. Prompt : « Same woman as the reference image: same face, auburn hair in a high ponytail, orange sports bra, slate-blue leggings, off-white sneakers. Photorealistic studio photo, plain light grey-blue seamless background, soft even lighting, soft shadow on the floor, whole body in frame with margin all around. Strict side view, camera at 90 degrees to her body. On all fours on a thin grey exercise mat, head toward the right of the frame, hands under her shoulders, knees under her hips, back flat. No text, no logo. »
2. Puis génère une vidéo Seedance 2.5 : 5 s, format 1:1, 720p, sans son, avec l'image de l'étape 1 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi. Prompt : « Same woman and same pose as in the image. She slowly rounds her back up toward the ceiling like a cat, chin to chest, then slowly arches her back down, lifting her head and tailbone, and returns to a flat back. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de l'image et le lien de la vidéo. (Flash Coach : chat-vache)
```

## 10. Planche — `planche` (profil, 4 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
1. Génère une image GPT Image 2.6, format 1:1, avec l'image Higgsfield 1f3f545d-2aab-4b13-b6c9-0c2fca6ed6db en référence. Prompt : « Same woman as the reference image: same face, auburn hair in a high ponytail, orange sports bra, slate-blue leggings, off-white sneakers. Photorealistic studio photo, plain light grey-blue seamless background, soft even lighting, soft shadow on the floor, whole body in frame with margin all around. Strict side view, camera at 90 degrees to her body. Forearm plank on a thin grey exercise mat, head toward the right of the frame, elbows under her shoulders, body in one straight line from head to heels. No text, no logo. »
2. Puis génère une vidéo Seedance 2.5 : 4 s, format 1:1, 720p, sans son, avec l'image de l'étape 1 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi. Prompt : « Same woman and same pose as in the image. She holds the forearm plank perfectly still, only breathing calmly. Hips do not sag or rise. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de l'image et le lien de la vidéo. (Flash Coach : planche)
```

## 11. Demi-cercles du cou — `rotation-cou` (face, 5 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
Génère une vidéo Seedance 2.5 : 5 s, format 1:1, 720p, sans son, avec l'image Higgsfield 1ebb951a-1069-4473-b564-eb0f8e23ee23 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi.
Prompt : « Same woman as in the image. She drops her chin to her chest, slowly rolls her head in a half circle from her right shoulder to her left shoulder and back to the centre, never tilting the head backward, then lifts her head. Shoulders stay still. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de la vidéo. (Flash Coach : rotation-cou)
```

## 12. Haussements d’épaules — `haussement-epaules` (face, 4 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
Génère une vidéo Seedance 2.5 : 4 s, format 1:1, 720p, sans son, avec l'image Higgsfield 1ebb951a-1069-4473-b564-eb0f8e23ee23 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi.
Prompt : « Same woman as in the image. She lifts both shoulders up toward her ears, holds one second, then lets them drop at once. Twice. Arms relaxed by her sides. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de la vidéo. (Flash Coach : haussement-epaules)
```

## 13. Rotation des poignets — `rotation-poignets` (face, 4 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
1. Génère une image GPT Image 2.6, format 1:1, avec l'image Higgsfield 1ebb951a-1069-4473-b564-eb0f8e23ee23 en référence. Prompt : « Same woman as the reference image: same face, auburn hair in a high ponytail, orange sports bra, slate-blue leggings, off-white sneakers. Photorealistic studio photo, plain light grey-blue seamless background, soft even lighting, soft shadow on the floor, whole body in frame with margin all around. Front view. Standing facing the camera, fingers interlaced in front of her chest, elbows bent. No text, no logo. »
2. Puis génère une vidéo Seedance 2.5 : 4 s, format 1:1, 720p, sans son, avec l'image de l'étape 1 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi. Prompt : « Same woman and same pose as in the image. She slowly rolls her interlaced wrists in circles, two circles one way, then two circles the other way. The rest of her body stays still. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de l'image et le lien de la vidéo. (Flash Coach : rotation-poignets)
```

## 14. Ouverture de la poitrine — `ouverture-poitrine` (profil, 4 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
1. Génère une image GPT Image 2.6, format 1:1, avec l'image Higgsfield 1f3f545d-2aab-4b13-b6c9-0c2fca6ed6db en référence. Prompt : « Same woman as the reference image: same face, auburn hair in a high ponytail, orange sports bra, slate-blue leggings, off-white sneakers. Photorealistic studio photo, plain light grey-blue seamless background, soft even lighting, soft shadow on the floor, whole body in frame with margin all around. Strict side view, camera at 90 degrees to her body. Standing upright facing the right of the frame, hands clasped together behind her back, arms straight. No text, no logo. »
2. Puis génère une vidéo Seedance 2.5 : 4 s, format 1:1, 720p, sans son, avec l'image de l'étape 1 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi. Prompt : « Same woman and same pose as in the image. She pulls her clasped hands down and back, opens her chest and shoulders and grows tall, holds one breath, then relaxes. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de l'image et le lien de la vidéo. (Flash Coach : ouverture-poitrine)
```

## 15. Cercles de bras — `cercles-bras` (face, 4 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
1. Génère une image GPT Image 2.6, format 1:1, avec l'image Higgsfield 1ebb951a-1069-4473-b564-eb0f8e23ee23 en référence. Prompt : « Same woman as the reference image: same face, auburn hair in a high ponytail, orange sports bra, slate-blue leggings, off-white sneakers. Photorealistic studio photo, plain light grey-blue seamless background, soft even lighting, soft shadow on the floor, whole body in frame with margin all around. Front view. Standing facing the camera, both arms extended straight out to the sides at shoulder height, palms down. No text, no logo. »
2. Puis génère une vidéo Seedance 2.5 : 4 s, format 1:1, 720p, sans son, avec l'image de l'étape 1 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi. Prompt : « Same woman and same pose as in the image. She draws circles with both straight arms, starting small, getting gradually bigger, then coming back to small. Torso still. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de l'image et le lien de la vidéo. (Flash Coach : cercles-bras)
```

## 16. Étirement du cou — `etirement-cou` (face, 5 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
Génère une vidéo Seedance 2.5 : 5 s, format 1:1, 720p, sans son, avec l'image Higgsfield 1ebb951a-1069-4473-b564-eb0f8e23ee23 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi.
Prompt : « Same woman as in the image. She slowly tilts her head, right ear toward her right shoulder, while her left shoulder stays low, holds one deep breath, then slowly brings her head back upright. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de la vidéo. (Flash Coach : etirement-cou)
```

## 17. Rotation du buste — `rotation-buste` (face, 4 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
Génère une vidéo Seedance 2.5 : 4 s, format 1:1, 720p, sans son, avec l'image Higgsfield 1ebb951a-1069-4473-b564-eb0f8e23ee23 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi.
Prompt : « Same woman as in the image. Feet fixed on the floor, she rotates her shoulders and torso to her right, then to her left, then back to the centre, relaxed arms following the movement. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de la vidéo. (Flash Coach : rotation-buste)
```

## 18. Cercles de hanches — `cercles-hanches` (face, 4 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
1. Génère une image GPT Image 2.6, format 1:1, avec l'image Higgsfield 1ebb951a-1069-4473-b564-eb0f8e23ee23 en référence. Prompt : « Same woman as the reference image: same face, auburn hair in a high ponytail, orange sports bra, slate-blue leggings, off-white sneakers. Photorealistic studio photo, plain light grey-blue seamless background, soft even lighting, soft shadow on the floor, whole body in frame with margin all around. Front view. Standing facing the camera, feet shoulder-width apart, hands on her hips. No text, no logo. »
2. Puis génère une vidéo Seedance 2.5 : 4 s, format 1:1, 720p, sans son, avec l'image de l'étape 1 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi. Prompt : « Same woman and same pose as in the image. She draws two large slow circles with her hips. Head and feet stay in place. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de l'image et le lien de la vidéo. (Flash Coach : cercles-hanches)
```

## 19. Enroulé du dos — `enroule-deroule` (profil, 6 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
Génère une vidéo Seedance 2.5 : 6 s, format 1:1, 720p, sans son, avec l'image Higgsfield 1f3f545d-2aab-4b13-b6c9-0c2fca6ed6db en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi.
Prompt : « Same woman as in the image. Knees soft, she slowly rolls down vertebra by vertebra, chin first, until her hands hang near her feet, then rolls back up just as slowly to standing. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de la vidéo. (Flash Coach : enroule-deroule)
```

## 20. Balancier de jambe — `balancier-jambe` (profil, 4 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
1. Génère une image GPT Image 2.6, format 1:1, avec l'image Higgsfield 1f3f545d-2aab-4b13-b6c9-0c2fca6ed6db en référence. Prompt : « Same woman as the reference image: same face, auburn hair in a high ponytail, orange sports bra, slate-blue leggings, off-white sneakers. Photorealistic studio photo, plain light grey-blue seamless background, soft even lighting, soft shadow on the floor, whole body in frame with margin all around. Strict side view, camera at 90 degrees to her body. Standing upright facing a plain flat grey-blue wall on the right edge of the frame, about one arm's length away, one hand resting on the wall at chest height for balance, feet together. No text, no logo. »
2. Puis génère une vidéo Seedance 2.5 : 4 s, format 1:1, 720p, sans son, avec l'image de l'étape 1 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi. Prompt : « Same woman and same pose as in the image. Her right leg (nearest the camera) swings loosely forward and backward like a pendulum, twice, without forcing. Torso upright, standing leg still. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de l'image et le lien de la vidéo. (Flash Coach : balancier-jambe)
```

## 21. Cercles de chevilles — `cercles-chevilles` (profil, 4 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
1. Génère une image GPT Image 2.6, format 1:1, avec l'image Higgsfield 1f3f545d-2aab-4b13-b6c9-0c2fca6ed6db en référence. Prompt : « Same woman as the reference image: same face, auburn hair in a high ponytail, orange sports bra, slate-blue leggings, off-white sneakers. Photorealistic studio photo, plain light grey-blue seamless background, soft even lighting, soft shadow on the floor, whole body in frame with margin all around. Strict side view, camera at 90 degrees to her body. Standing upright facing a plain flat grey-blue wall on the right edge of the frame, about one arm's length away, one hand resting on the wall at chest height for balance, right foot (nearest the camera) lifted a few centimetres off the floor. No text, no logo. »
2. Puis génère une vidéo Seedance 2.5 : 4 s, format 1:1, 720p, sans son, avec l'image de l'étape 1 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi. Prompt : « Same woman and same pose as in the image. With her right foot lifted, the tip of the foot draws two slow circles one way, then two circles the other way. Only the ankle moves. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de l'image et le lien de la vidéo. (Flash Coach : cercles-chevilles)
```

## 22. Étirement du mollet — `etirement-mollet` (profil, 4 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
1. Génère une image GPT Image 2.6, format 1:1, avec l'image Higgsfield 1f3f545d-2aab-4b13-b6c9-0c2fca6ed6db en référence. Prompt : « Same woman as the reference image: same face, auburn hair in a high ponytail, orange sports bra, slate-blue leggings, off-white sneakers. Photorealistic studio photo, plain light grey-blue seamless background, soft even lighting, soft shadow on the floor, whole body in frame with margin all around. Strict side view, camera at 90 degrees to her body. Calf stretch facing a plain flat grey-blue wall on the right edge of the frame: both palms on the wall, left leg forward with the knee bent, right leg (nearest the camera) stretched straight behind her, heel flat on the floor. No text, no logo. »
2. Puis génère une vidéo Seedance 2.5 : 4 s, format 1:1, 720p, sans son, avec l'image de l'étape 1 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi. Prompt : « Same woman and same pose as in the image. She holds the calf stretch, gently pressing her back heel into the floor and breathing calmly. Very small movement only. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de l'image et le lien de la vidéo. (Flash Coach : etirement-mollet)
```

## 23. Respiration du ventre — `respiration-ventre` (face, 6 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
1. Génère une image GPT Image 2.6, format 1:1, avec l'image Higgsfield 1ebb951a-1069-4473-b564-eb0f8e23ee23 en référence. Prompt : « Same woman as the reference image: same face, auburn hair in a high ponytail, orange sports bra, slate-blue leggings, off-white sneakers. Photorealistic studio photo, plain light grey-blue seamless background, soft even lighting, soft shadow on the floor, whole body in frame with margin all around. Front view. Standing facing the camera, relaxed, right hand resting flat on her belly, left arm by her side. No text, no logo. »
2. Puis génère une vidéo Seedance 2.5 : 6 s, format 1:1, 720p, sans son, avec l'image de l'étape 1 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi. Prompt : « Same woman and same pose as in the image. She breathes slowly: her belly gently expands under her hand as she inhales, then flattens during a long exhale. Shoulders stay still. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de l'image et le lien de la vidéo. (Flash Coach : respiration-ventre)
```

## 24. Le grand soupir — `grand-soupir` (face, 5 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
Génère une vidéo Seedance 2.5 : 5 s, format 1:1, 720p, sans son, avec l'image Higgsfield 1ebb951a-1069-4473-b564-eb0f8e23ee23 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi.
Prompt : « Same woman as in the image. She takes two short inhales through the nose, chest lifting in two steps, then lets out one long sigh through the mouth, shoulders dropping and relaxing. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de la vidéo. (Flash Coach : grand-soupir)
```

## 25. Expiration longue — `respiration-allongee` (face, 8 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
Génère une vidéo Seedance 2.5 : 8 s, format 1:1, 720p, sans son, avec l'image Higgsfield 1ebb951a-1069-4473-b564-eb0f8e23ee23 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi.
Prompt : « Same woman as in the image. She inhales calmly through the nose, chest rising, then exhales for twice as long, chest slowly lowering, shoulders relaxed. Almost no other movement. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de la vidéo. (Flash Coach : respiration-allongee)
```

## 26. Bras qui respirent — `bras-respiration` (face, 6 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
Génère une vidéo Seedance 2.5 : 6 s, format 1:1, 720p, sans son, avec l'image Higgsfield 1ebb951a-1069-4473-b564-eb0f8e23ee23 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi.
Prompt : « Same woman as in the image. She slowly raises both straight arms out to the sides and up overhead while inhaling, then slowly lowers them back to her sides while exhaling. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de la vidéo. (Flash Coach : bras-respiration)
```

## 27. Épaules lourdes — `epaules-lourdes` (face, 5 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
Génère une vidéo Seedance 2.5 : 5 s, format 1:1, 720p, sans son, avec l'image Higgsfield 1ebb951a-1069-4473-b564-eb0f8e23ee23 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi.
Prompt : « Same woman as in the image. She tenses her whole upper body for three seconds, fists clenched, shoulders raised to her ears, then releases everything at once, shoulders and arms dropping heavy and loose. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de la vidéo. (Flash Coach : epaules-lourdes)
```

## 28. Massage de la nuque — `massage-nuque` (face, 4 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
1. Génère une image GPT Image 2.6, format 1:1, avec l'image Higgsfield 1ebb951a-1069-4473-b564-eb0f8e23ee23 en référence. Prompt : « Same woman as the reference image: same face, auburn hair in a high ponytail, orange sports bra, slate-blue leggings, off-white sneakers. Photorealistic studio photo, plain light grey-blue seamless background, soft even lighting, soft shadow on the floor, whole body in frame with margin all around. Front view. Standing facing the camera, both hands behind her neck, fingertips on the nape, elbows out to the sides. No text, no logo. »
2. Puis génère une vidéo Seedance 2.5 : 4 s, format 1:1, 720p, sans son, avec l'image de l'étape 1 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi. Prompt : « Same woman and same pose as in the image. Her fingertips make small slow circles on the back of her neck, jaw relaxed, head slightly bowed. Elbows stay open. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de l'image et le lien de la vidéo. (Flash Coach : massage-nuque)
```

## 29. Secouer les bras — `secouer-bras` (face, 4 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
Génère une vidéo Seedance 2.5 : 4 s, format 1:1, 720p, sans son, avec l'image Higgsfield 1ebb951a-1069-4473-b564-eb0f8e23ee23 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi.
Prompt : « Same woman as in the image. She shakes her hands loosely, then her whole arms, as if shaking water off them, shoulders relaxed, then lets them settle by her sides. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de la vidéo. (Flash Coach : secouer-bras)
```

## 30. Bras en balançoire — `balancement-bras` (face, 4 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
Génère une vidéo Seedance 2.5 : 4 s, format 1:1, 720p, sans son, avec l'image Higgsfield 1ebb951a-1069-4473-b564-eb0f8e23ee23 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi.
Prompt : « Same woman as in the image. Arms completely relaxed, she gently rotates her torso right then left, and her loose arms swing and wrap around her body by themselves, twice each side. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de la vidéo. (Flash Coach : balancement-bras)
```

## 31. Grandir vers le ciel — `etirement-ciel` (face, 5 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
1. Génère une image GPT Image 2.6, format 1:1, avec l'image Higgsfield 1ebb951a-1069-4473-b564-eb0f8e23ee23 en référence. Prompt : « Same woman as the reference image: same face, auburn hair in a high ponytail, orange sports bra, slate-blue leggings, off-white sneakers. Photorealistic studio photo, plain light grey-blue seamless background, soft even lighting, soft shadow on the floor, whole body in frame with margin all around. Front view. Standing facing the camera, fingers interlaced, arms stretched straight overhead, palms facing the ceiling. No text, no logo. »
2. Puis génère une vidéo Seedance 2.5 : 5 s, format 1:1, 720p, sans son, avec l'image de l'étape 1 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi. Prompt : « Same woman and same pose as in the image. She stretches upward, growing taller, holds one breath at the top, then relaxes a little while keeping her arms overhead. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de l'image et le lien de la vidéo. (Flash Coach : etirement-ciel)
```

## 32. Pieds ancrés — `ancrage-pieds` (profil, 5 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
Génère une vidéo Seedance 2.5 : 5 s, format 1:1, 720p, sans son, avec l'image Higgsfield 1f3f545d-2aab-4b13-b6c9-0c2fca6ed6db en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi.
Prompt : « Same woman as in the image. Feet flat, she slowly shifts her weight forward onto her toes, heels barely lifting, then back onto her heels, toes barely lifting, then returns to the centre. Body straight. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de la vidéo. (Flash Coach : ancrage-pieds)
```

## 33. Montées sur pointes — `montees-pointes` (profil, 4 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
Génère une vidéo Seedance 2.5 : 4 s, format 1:1, 720p, sans son, avec l'image Higgsfield 1f3f545d-2aab-4b13-b6c9-0c2fca6ed6db en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi.
Prompt : « Same woman as in the image. She rises onto the balls of her feet, heels high, holds briefly, then lowers her heels slowly. Twice. Body straight. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de la vidéo. (Flash Coach : montees-pointes)
```

## 34. Assis-debout — `assis-debout` (profil, 5 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
1. Génère une image GPT Image 2.6, format 1:1, avec l'image Higgsfield 1f3f545d-2aab-4b13-b6c9-0c2fca6ed6db en référence. Prompt : « Same woman as the reference image: same face, auburn hair in a high ponytail, orange sports bra, slate-blue leggings, off-white sneakers. Photorealistic studio photo, plain light grey-blue seamless background, soft even lighting, soft shadow on the floor, whole body in frame with margin all around. Strict side view, camera at 90 degrees to her body. Sitting on the front edge of a simple grey-blue chair, facing the right of the frame, feet flat on the floor, back straight, arms crossed over her chest. No text, no logo. »
2. Puis génère une vidéo Seedance 2.5 : 5 s, format 1:1, 720p, sans son, avec l'image de l'étape 1 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi. Prompt : « Same woman and same pose as in the image. She stands up without using her hands, leaning her torso slightly forward, until fully upright, then sits back down slowly and softly on the edge of the chair. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de l'image et le lien de la vidéo. (Flash Coach : assis-debout)
```

## 35. Chaise contre le mur — `chaise-murale` (profil, 4 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
1. Génère une image GPT Image 2.6, format 1:1, avec l'image Higgsfield 1f3f545d-2aab-4b13-b6c9-0c2fca6ed6db en référence. Prompt : « Same woman as the reference image: same face, auburn hair in a high ponytail, orange sports bra, slate-blue leggings, off-white sneakers. Photorealistic studio photo, plain light grey-blue seamless background, soft even lighting, soft shadow on the floor, whole body in frame with margin all around. Strict side view, camera at 90 degrees to her body. Wall sit facing the right of the frame: her back flat against a plain grey-blue wall on the left edge of the frame, thighs parallel to the floor, knees at 90 degrees directly above her ankles, arms relaxed. No text, no logo. »
2. Puis génère une vidéo Seedance 2.5 : 4 s, format 1:1, 720p, sans son, avec l'image de l'étape 1 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi. Prompt : « Same woman and same pose as in the image. She holds the wall sit, still, breathing calmly. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de l'image et le lien de la vidéo. (Flash Coach : chaise-murale)
```

## 36. Marche sur place — `marche-sur-place` (face, 4 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
Génère une vidéo Seedance 2.5 : 4 s, format 1:1, 720p, sans son, avec l'image Higgsfield 1ebb951a-1069-4473-b564-eb0f8e23ee23 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi.
Prompt : « Same woman as in the image. She walks on the spot at a relaxed pace, four steps, feet lifting only a little, arms swinging naturally. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de la vidéo. (Flash Coach : marche-sur-place)
```

## 37. Genou-coude debout — `genou-coude` (profil, 4 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
1. Génère une image GPT Image 2.6, format 1:1, avec l'image Higgsfield 1f3f545d-2aab-4b13-b6c9-0c2fca6ed6db en référence. Prompt : « Same woman as the reference image: same face, auburn hair in a high ponytail, orange sports bra, slate-blue leggings, off-white sneakers. Photorealistic studio photo, plain light grey-blue seamless background, soft even lighting, soft shadow on the floor, whole body in frame with margin all around. Strict side view, camera at 90 degrees to her body. Standing upright facing the right of the frame, hands lightly behind her head, elbows open. No text, no logo. »
2. Puis génère une vidéo Seedance 2.5 : 4 s, format 1:1, 720p, sans son, avec l'image de l'étape 1 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi. Prompt : « Same woman and same pose as in the image. Her right knee rises and her left elbow comes down across to meet it, she returns upright, then her left knee meets her right elbow, and she returns upright. Slow, no jumping. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de l'image et le lien de la vidéo. (Flash Coach : genou-coude)
```

## 38. Gainage debout — `gainage-debout` (face, 4 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
1. Génère une image GPT Image 2.6, format 1:1, avec l'image Higgsfield 1ebb951a-1069-4473-b564-eb0f8e23ee23 en référence. Prompt : « Same woman as the reference image: same face, auburn hair in a high ponytail, orange sports bra, slate-blue leggings, off-white sneakers. Photorealistic studio photo, plain light grey-blue seamless background, soft even lighting, soft shadow on the floor, whole body in frame with margin all around. Front view. Standing tall facing the camera, palms pressed firmly together in front of her chest, elbows out. No text, no logo. »
2. Puis génère une vidéo Seedance 2.5 : 4 s, format 1:1, 720p, sans son, avec l'image de l'étape 1 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi. Prompt : « Same woman and same pose as in the image. She braces: belly drawn in, glutes squeezed, palms pushing hard against each other, holding the tension while breathing. Almost motionless. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de l'image et le lien de la vidéo. (Flash Coach : gainage-debout)
```

## 39. Boxe dans le vide — `boxe-air` (profil, 4 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
1. Génère une image GPT Image 2.6, format 1:1, avec l'image Higgsfield 1f3f545d-2aab-4b13-b6c9-0c2fca6ed6db en référence. Prompt : « Same woman as the reference image: same face, auburn hair in a high ponytail, orange sports bra, slate-blue leggings, off-white sneakers. Photorealistic studio photo, plain light grey-blue seamless background, soft even lighting, soft shadow on the floor, whole body in frame with margin all around. Strict side view, camera at 90 degrees to her body. Boxing guard stance facing the right of the frame, feet staggered, knees soft, both fists raised in front of her chin. No text, no logo. »
2. Puis génère une vidéo Seedance 2.5 : 4 s, format 1:1, 720p, sans son, avec l'image de l'étape 1 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi. Prompt : « Same woman and same pose as in the image. She throws four quick, relaxed straight punches in front of her, alternating fists, each fist returning to her chin. Feet stay planted. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de l'image et le lien de la vidéo. (Flash Coach : boxe-air)
```

## 40. Jambe vers l’arrière — `jambe-arriere` (profil, 4 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
1. Génère une image GPT Image 2.6, format 1:1, avec l'image Higgsfield 1f3f545d-2aab-4b13-b6c9-0c2fca6ed6db en référence. Prompt : « Same woman as the reference image: same face, auburn hair in a high ponytail, orange sports bra, slate-blue leggings, off-white sneakers. Photorealistic studio photo, plain light grey-blue seamless background, soft even lighting, soft shadow on the floor, whole body in frame with margin all around. Strict side view, camera at 90 degrees to her body. Standing upright facing a plain flat grey-blue wall on the right edge of the frame, about one arm's length away, one hand resting on the wall at chest height for balance, feet together. No text, no logo. »
2. Puis génère une vidéo Seedance 2.5 : 4 s, format 1:1, 720p, sans son, avec l'image de l'étape 1 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi. Prompt : « Same woman and same pose as in the image. Her straight right leg (nearest the camera) lifts slowly backward, glutes squeezing, torso staying upright, then returns next to the other foot. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de l'image et le lien de la vidéo. (Flash Coach : jambe-arriere)
```

## 41. Squats sautés — `squats-sautes` (profil, 4 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
Génère une vidéo Seedance 2.5 : 4 s, format 1:1, 720p, sans son, avec l'image Higgsfield 1f3f545d-2aab-4b13-b6c9-0c2fca6ed6db en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi.
Prompt : « Same woman as in the image. She squats down, arms swinging back, then jumps straight up, and lands softly into a small squat before standing. Twice. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de la vidéo. (Flash Coach : squats-sautes)
```

## 42. Talons-fesses — `talons-fesses` (profil, 4 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
Génère une vidéo Seedance 2.5 : 4 s, format 1:1, 720p, sans son, avec l'image Higgsfield 1f3f545d-2aab-4b13-b6c9-0c2fca6ed6db en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi.
Prompt : « Same woman as in the image. She jogs lightly on the spot, heels kicking up toward her glutes one after the other, six steps, arms bent and swinging. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de la vidéo. (Flash Coach : talons-fesses)
```

## 43. Le patineur — `patineur` (face, 4 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
Génère une vidéo Seedance 2.5 : 4 s, format 1:1, 720p, sans son, avec l'image Higgsfield 1ebb951a-1069-4473-b564-eb0f8e23ee23 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi.
Prompt : « Same woman as in the image. She takes a wide step to her right, her left leg crossing behind, torso leaning slightly forward, then a wide step to her left with her right leg crossing behind, then returns to the centre. No jumping. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de la vidéo. (Flash Coach : patineur)
```

## 44. Pas chassés — `pas-chasses` (face, 4 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
Génère une vidéo Seedance 2.5 : 4 s, format 1:1, 720p, sans son, avec l'image Higgsfield 1ebb951a-1069-4473-b564-eb0f8e23ee23 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi.
Prompt : « Same woman as in the image. She does quick side shuffle steps: three to her right, three back to her left, knees slightly bent, arms active, ending in the centre. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de la vidéo. (Flash Coach : pas-chasses)
```

## 45. Burpee sans saut — `burpee-sans-saut` (profil, 6 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
Génère une vidéo Seedance 2.5 : 6 s, format 1:1, 720p, sans son, avec l'image Higgsfield 1f3f545d-2aab-4b13-b6c9-0c2fca6ed6db en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi.
Prompt : « Same woman as in the image. She bends down and places her hands on the floor, steps her feet back one at a time into a high plank, steps them forward again, and stands back up. No jump, steady pace. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de la vidéo. (Flash Coach : burpee-sans-saut)
```

## 46. Le grimpeur — `grimpeur` (profil, 4 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
1. Génère une image GPT Image 2.6, format 1:1, avec l'image Higgsfield 1f3f545d-2aab-4b13-b6c9-0c2fca6ed6db en référence. Prompt : « Same woman as the reference image: same face, auburn hair in a high ponytail, orange sports bra, slate-blue leggings, off-white sneakers. Photorealistic studio photo, plain light grey-blue seamless background, soft even lighting, soft shadow on the floor, whole body in frame with margin all around. Strict side view, camera at 90 degrees to her body. High plank on a thin grey exercise mat, head toward the right of the frame, hands under her shoulders, arms straight, body in one straight line from head to heels. No text, no logo. »
2. Puis génère une vidéo Seedance 2.5 : 4 s, format 1:1, 720p, sans son, avec l'image de l'étape 1 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi. Prompt : « Same woman and same pose as in the image. She drives her right knee toward her chest and back, then her left knee and back, four times in total, at a steady pace. Back flat, hips level. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de l'image et le lien de la vidéo. (Flash Coach : grimpeur)
```

## 47. Pont fessier — `pont-fessier` (profil, 4 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
1. Génère une image GPT Image 2.6, format 1:1, avec l'image Higgsfield 1f3f545d-2aab-4b13-b6c9-0c2fca6ed6db en référence. Prompt : « Same woman as the reference image: same face, auburn hair in a high ponytail, orange sports bra, slate-blue leggings, off-white sneakers. Photorealistic studio photo, plain light grey-blue seamless background, soft even lighting, soft shadow on the floor, whole body in frame with margin all around. Strict side view, camera at 90 degrees to her body. Lying on her back on a thin grey exercise mat, head on the left of the frame, feet on the right, knees bent, feet flat on the floor, arms along her body. No text, no logo. »
2. Puis génère une vidéo Seedance 2.5 : 4 s, format 1:1, 720p, sans son, avec l'image de l'étape 1 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi. Prompt : « Same woman and same pose as in the image. She lifts her hips until her body forms a straight line from shoulders to knees, squeezes at the top for a second, then lowers her hips back to the mat. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de l'image et le lien de la vidéo. (Flash Coach : pont-fessier)
```

## 48. Superman — `superman` (profil, 4 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
1. Génère une image GPT Image 2.6, format 1:1, avec l'image Higgsfield 1f3f545d-2aab-4b13-b6c9-0c2fca6ed6db en référence. Prompt : « Same woman as the reference image: same face, auburn hair in a high ponytail, orange sports bra, slate-blue leggings, off-white sneakers. Photorealistic studio photo, plain light grey-blue seamless background, soft even lighting, soft shadow on the floor, whole body in frame with margin all around. Strict side view, camera at 90 degrees to her body. Lying face down on a thin grey exercise mat, head toward the right of the frame, arms stretched forward, legs straight. No text, no logo. »
2. Puis génère une vidéo Seedance 2.5 : 4 s, format 1:1, 720p, sans son, avec l'image de l'étape 1 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi. Prompt : « Same woman and same pose as in the image. She lifts her arms, chest and legs off the mat at the same time, holds one second, then lowers them. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de l'image et le lien de la vidéo. (Flash Coach : superman)
```

## 49. Planche sur le côté — `planche-laterale` (face, 4 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
1. Génère une image GPT Image 2.6, format 1:1, avec l'image Higgsfield 1ebb951a-1069-4473-b564-eb0f8e23ee23 en référence. Prompt : « Same woman as the reference image: same face, auburn hair in a high ponytail, orange sports bra, slate-blue leggings, off-white sneakers. Photorealistic studio photo, plain light grey-blue seamless background, soft even lighting, soft shadow on the floor, whole body in frame with margin all around. Front view. Side plank seen from the front, her chest facing the camera: lying on her right side on a thin grey exercise mat, propped on her right forearm, elbow under her shoulder, hips resting on the mat, legs stacked, left hand on her hip. No text, no logo. »
2. Puis génère une vidéo Seedance 2.5 : 4 s, format 1:1, 720p, sans son, avec l'image de l'étape 1 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi. Prompt : « Same woman and same pose as in the image. She lifts her hips until her body is one straight line, holds, then lowers her hips back to the mat. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de l'image et le lien de la vidéo. (Flash Coach : planche-laterale)
```

## 50. Crunch vélo — `crunch-velo` (profil, 4 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
1. Génère une image GPT Image 2.6, format 1:1, avec l'image Higgsfield 1f3f545d-2aab-4b13-b6c9-0c2fca6ed6db en référence. Prompt : « Same woman as the reference image: same face, auburn hair in a high ponytail, orange sports bra, slate-blue leggings, off-white sneakers. Photorealistic studio photo, plain light grey-blue seamless background, soft even lighting, soft shadow on the floor, whole body in frame with margin all around. Strict side view, camera at 90 degrees to her body. Lying on her back on a thin grey exercise mat, head on the left of the frame, feet on the right, hands behind her head, shoulders slightly lifted, both knees bent above her hips. No text, no logo. »
2. Puis génère une vidéo Seedance 2.5 : 4 s, format 1:1, 720p, sans son, avec l'image de l'étape 1 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi. Prompt : « Same woman and same pose as in the image. Slowly, her right elbow goes toward her left knee while her right leg extends, then her left elbow toward her right knee while her left leg extends, then back to the start. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de l'image et le lien de la vidéo. (Flash Coach : crunch-velo)
```

## 51. Pompes mains larges — `pompe-large` (profil, 4 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
1. Génère une image GPT Image 2.6, format 1:1, avec l'image Higgsfield 1f3f545d-2aab-4b13-b6c9-0c2fca6ed6db en référence. Prompt : « Same woman as the reference image: same face, auburn hair in a high ponytail, orange sports bra, slate-blue leggings, off-white sneakers. Photorealistic studio photo, plain light grey-blue seamless background, soft even lighting, soft shadow on the floor, whole body in frame with margin all around. Strict side view, camera at 90 degrees to her body. High plank on a thin grey exercise mat, head toward the right of the frame, hands placed wider than her shoulders, arms straight, body in one straight line from head to heels. No text, no logo. »
2. Puis génère une vidéo Seedance 2.5 : 4 s, format 1:1, 720p, sans son, avec l'image de l'étape 1 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi. Prompt : « Same woman and same pose as in the image. She lowers her chest between her hands until it almost touches the mat, elbows going out, then pushes back up. Body stays straight. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de l'image et le lien de la vidéo. (Flash Coach : pompe-large)
```

## 52. Pompes au ralenti — `pompe-tempo` (profil, 8 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
1. Génère une image GPT Image 2.6, format 1:1, avec l'image Higgsfield 1f3f545d-2aab-4b13-b6c9-0c2fca6ed6db en référence. Prompt : « Same woman as the reference image: same face, auburn hair in a high ponytail, orange sports bra, slate-blue leggings, off-white sneakers. Photorealistic studio photo, plain light grey-blue seamless background, soft even lighting, soft shadow on the floor, whole body in frame with margin all around. Strict side view, camera at 90 degrees to her body. High plank on a thin grey exercise mat, head toward the right of the frame, hands under her shoulders, arms straight, body in one straight line from head to heels. No text, no logo. »
2. Puis génère une vidéo Seedance 2.5 : 8 s, format 1:1, 720p, sans son, avec l'image de l'étape 1 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi. Prompt : « Same woman and same pose as in the image. Very slow push-up: four seconds to lower her chest to just above the mat, four seconds to push back up. Body stays rigid. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de l'image et le lien de la vidéo. (Flash Coach : pompe-tempo)
```

## 53. Pompes en V — `pike-pushup` (profil, 4 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
1. Génère une image GPT Image 2.6, format 1:1, avec l'image Higgsfield 1f3f545d-2aab-4b13-b6c9-0c2fca6ed6db en référence. Prompt : « Same woman as the reference image: same face, auburn hair in a high ponytail, orange sports bra, slate-blue leggings, off-white sneakers. Photorealistic studio photo, plain light grey-blue seamless background, soft even lighting, soft shadow on the floor, whole body in frame with margin all around. Strict side view, camera at 90 degrees to her body. Pike position on a thin grey exercise mat, head toward the right of the frame: hands and feet on the floor, hips high in the air in an inverted V, arms and legs straight. No text, no logo. »
2. Puis génère une vidéo Seedance 2.5 : 4 s, format 1:1, 720p, sans son, avec l'image de l'étape 1 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi. Prompt : « Same woman and same pose as in the image. She bends her elbows to bring the top of her head toward the floor between her hands, then pushes back up to the inverted V. Hips stay high. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de l'image et le lien de la vidéo. (Flash Coach : pike-pushup)
```

## 54. Dips sur une chaise — `dips-chaise` (profil, 4 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
1. Génère une image GPT Image 2.6, format 1:1, avec l'image Higgsfield 1f3f545d-2aab-4b13-b6c9-0c2fca6ed6db en référence. Prompt : « Same woman as the reference image: same face, auburn hair in a high ponytail, orange sports bra, slate-blue leggings, off-white sneakers. Photorealistic studio photo, plain light grey-blue seamless background, soft even lighting, soft shadow on the floor, whole body in frame with margin all around. Strict side view, camera at 90 degrees to her body. Chair dip position facing the right of the frame: hands gripping the front edge of a simple grey-blue chair behind her, arms straight, hips just in front of the seat, knees bent, feet flat on the floor. No text, no logo. »
2. Puis génère une vidéo Seedance 2.5 : 4 s, format 1:1, 720p, sans son, avec l'image de l'étape 1 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi. Prompt : « Same woman and same pose as in the image. She bends her elbows straight back to lower her hips toward the floor, then pushes back up until her arms are straight. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de l'image et le lien de la vidéo. (Flash Coach : dips-chaise)
```

## 55. Tractions sous la table — `tractions-australiennes` (profil, 4 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
1. Génère une image GPT Image 2.6, format 1:1, avec l'image Higgsfield 1f3f545d-2aab-4b13-b6c9-0c2fca6ed6db en référence. Prompt : « Same woman as the reference image: same face, auburn hair in a high ponytail, orange sports bra, slate-blue leggings, off-white sneakers. Photorealistic studio photo, plain light grey-blue seamless background, soft even lighting, soft shadow on the floor, whole body in frame with margin all around. Strict side view, camera at 90 degrees to her body. Inverted row under a simple sturdy grey-blue table: lying under the table, head on the left of the frame, hands gripping the table edge, arms straight, body in one straight line, heels on the floor. No text, no logo. »
2. Puis génère une vidéo Seedance 2.5 : 4 s, format 1:1, 720p, sans son, avec l'image de l'étape 1 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi. Prompt : « Same woman and same pose as in the image. She pulls her chest up to the table edge, elbows going back, then lowers until her arms are straight. Body stays straight. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de l'image et le lien de la vidéo. (Flash Coach : tractions-australiennes)
```

## 56. Superman tirage — `superman-tirage` (profil, 4 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
1. Génère une image GPT Image 2.6, format 1:1, avec l'image Higgsfield 1f3f545d-2aab-4b13-b6c9-0c2fca6ed6db en référence. Prompt : « Same woman as the reference image: same face, auburn hair in a high ponytail, orange sports bra, slate-blue leggings, off-white sneakers. Photorealistic studio photo, plain light grey-blue seamless background, soft even lighting, soft shadow on the floor, whole body in frame with margin all around. Strict side view, camera at 90 degrees to her body. Lying face down on a thin grey exercise mat, head toward the right of the frame, chest slightly lifted, arms stretched forward just above the floor. No text, no logo. »
2. Puis génère une vidéo Seedance 2.5 : 4 s, format 1:1, 720p, sans son, avec l'image de l'étape 1 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi. Prompt : « Same woman and same pose as in the image. She pulls her elbows back toward her ribs, squeezing her shoulder blades, then stretches her arms forward again. Chest stays lifted. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de l'image et le lien de la vidéo. (Flash Coach : superman-tirage)
```

## 57. Squat avec pause — `squat-pause` (profil, 6 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
Génère une vidéo Seedance 2.5 : 6 s, format 1:1, 720p, sans son, avec l'image Higgsfield 1f3f545d-2aab-4b13-b6c9-0c2fca6ed6db en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi.
Prompt : « Same woman as in the image. She squats down, hips back, arms reaching forward, holds still at the bottom for three seconds with her thighs parallel to the floor, then stands back up and lowers her arms. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de la vidéo. (Flash Coach : squat-pause)
```

## 58. Squat bulgare — `squat-bulgare` (profil, 4 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
1. Génère une image GPT Image 2.6, format 1:1, avec l'image Higgsfield 1f3f545d-2aab-4b13-b6c9-0c2fca6ed6db en référence. Prompt : « Same woman as the reference image: same face, auburn hair in a high ponytail, orange sports bra, slate-blue leggings, off-white sneakers. Photorealistic studio photo, plain light grey-blue seamless background, soft even lighting, soft shadow on the floor, whole body in frame with margin all around. Strict side view, camera at 90 degrees to her body. Bulgarian split squat stance facing the right of the frame: left foot forward flat on the floor, top of her right foot (nearest the camera) resting on the seat of a simple grey-blue chair behind her, torso upright, hands on her hips. No text, no logo. »
2. Puis génère une vidéo Seedance 2.5 : 4 s, format 1:1, 720p, sans son, avec l'image de l'étape 1 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi. Prompt : « Same woman and same pose as in the image. She lowers her back knee toward the floor, front knee bending to 90 degrees, then pushes back up. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de l'image et le lien de la vidéo. (Flash Coach : squat-bulgare)
```

## 59. Planche, toucher d’épaules — `planche-epaules` (profil, 4 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
1. Génère une image GPT Image 2.6, format 1:1, avec l'image Higgsfield 1f3f545d-2aab-4b13-b6c9-0c2fca6ed6db en référence. Prompt : « Same woman as the reference image: same face, auburn hair in a high ponytail, orange sports bra, slate-blue leggings, off-white sneakers. Photorealistic studio photo, plain light grey-blue seamless background, soft even lighting, soft shadow on the floor, whole body in frame with margin all around. Strict side view, camera at 90 degrees to her body. High plank on a thin grey exercise mat, head toward the right of the frame, hands under her shoulders, arms straight, body in one straight line from head to heels. No text, no logo. »
2. Puis génère une vidéo Seedance 2.5 : 4 s, format 1:1, 720p, sans son, avec l'image de l'étape 1 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi. Prompt : « Same woman and same pose as in the image. She lifts her right hand to tap her left shoulder and puts it down, then her left hand taps her right shoulder and goes down. Hips stay perfectly still. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de l'image et le lien de la vidéo. (Flash Coach : planche-epaules)
```

## 60. La banane — `hollow-hold` (profil, 4 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
1. Génère une image GPT Image 2.6, format 1:1, avec l'image Higgsfield 1f3f545d-2aab-4b13-b6c9-0c2fca6ed6db en référence. Prompt : « Same woman as the reference image: same face, auburn hair in a high ponytail, orange sports bra, slate-blue leggings, off-white sneakers. Photorealistic studio photo, plain light grey-blue seamless background, soft even lighting, soft shadow on the floor, whole body in frame with margin all around. Strict side view, camera at 90 degrees to her body. Hollow body hold on a thin grey exercise mat, head on the left of the frame: lying on her back, lower back pressed to the mat, shoulders and straight legs lifted off the floor, arms stretched overhead off the floor, body shaped like a banana. No text, no logo. »
2. Puis génère une vidéo Seedance 2.5 : 4 s, format 1:1, 720p, sans son, avec l'image de l'étape 1 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi. Prompt : « Same woman and same pose as in the image. She holds the hollow position, still, breathing calmly. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de l'image et le lien de la vidéo. (Flash Coach : hollow-hold)
```

## 61. Relevés de jambes — `releves-jambes` (profil, 4 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
1. Génère une image GPT Image 2.6, format 1:1, avec l'image Higgsfield 1f3f545d-2aab-4b13-b6c9-0c2fca6ed6db en référence. Prompt : « Same woman as the reference image: same face, auburn hair in a high ponytail, orange sports bra, slate-blue leggings, off-white sneakers. Photorealistic studio photo, plain light grey-blue seamless background, soft even lighting, soft shadow on the floor, whole body in frame with margin all around. Strict side view, camera at 90 degrees to her body. Lying on her back on a thin grey exercise mat, head on the left of the frame, feet on the right, arms along her body, legs straight and together, heels hovering just above the floor. No text, no logo. »
2. Puis génère une vidéo Seedance 2.5 : 4 s, format 1:1, 720p, sans son, avec l'image de l'étape 1 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi. Prompt : « Same woman and same pose as in the image. She raises her straight legs to vertical, then lowers them slowly, stopping just above the floor without touching it. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de l'image et le lien de la vidéo. (Flash Coach : releves-jambes)
```

## 62. Pompes diamant — `pompe-diamant` (profil, 4 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
1. Génère une image GPT Image 2.6, format 1:1, avec l'image Higgsfield 1f3f545d-2aab-4b13-b6c9-0c2fca6ed6db en référence. Prompt : « Same woman as the reference image: same face, auburn hair in a high ponytail, orange sports bra, slate-blue leggings, off-white sneakers. Photorealistic studio photo, plain light grey-blue seamless background, soft even lighting, soft shadow on the floor, whole body in frame with margin all around. Strict side view, camera at 90 degrees to her body. High plank on a thin grey exercise mat, head toward the right of the frame, hands close together under her chest, thumbs and index fingers forming a diamond, arms straight, body in one straight line from head to heels. No text, no logo. »
2. Puis génère une vidéo Seedance 2.5 : 4 s, format 1:1, 720p, sans son, avec l'image de l'étape 1 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi. Prompt : « Same woman and same pose as in the image. She lowers her chest to her hands, elbows staying close to her body, then pushes back up. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de l'image et le lien de la vidéo. (Flash Coach : pompe-diamant)
```

## 63. Pompes archer — `pompe-archer` (face, 4 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
1. Génère une image GPT Image 2.6, format 1:1, avec l'image Higgsfield 1ebb951a-1069-4473-b564-eb0f8e23ee23 en référence. Prompt : « Same woman as the reference image: same face, auburn hair in a high ponytail, orange sports bra, slate-blue leggings, off-white sneakers. Photorealistic studio photo, plain light grey-blue seamless background, soft even lighting, soft shadow on the floor, whole body in frame with margin all around. Front view. Seen from the front, head toward the camera: high plank on a thin grey exercise mat, hands placed very wide apart, arms straight, body straight behind her. No text, no logo. »
2. Puis génère une vidéo Seedance 2.5 : 4 s, format 1:1, 720p, sans son, avec l'image de l'étape 1 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi. Prompt : « Same woman and same pose as in the image. Archer push-up: she lowers her chest toward her right hand, right elbow bending, while her left arm stays straight out to the side, then pushes back up to the centre. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de l'image et le lien de la vidéo. (Flash Coach : pompe-archer)
```

## 64. Pompes pieds surélevés — `pompe-pieds-sureleves` (profil, 4 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
1. Génère une image GPT Image 2.6, format 1:1, avec l'image Higgsfield 1f3f545d-2aab-4b13-b6c9-0c2fca6ed6db en référence. Prompt : « Same woman as the reference image: same face, auburn hair in a high ponytail, orange sports bra, slate-blue leggings, off-white sneakers. Photorealistic studio photo, plain light grey-blue seamless background, soft even lighting, soft shadow on the floor, whole body in frame with margin all around. Strict side view, camera at 90 degrees to her body. Decline plank, head toward the right of the frame: hands on the floor under her shoulders, arms straight, feet resting on the seat of a simple grey-blue chair on the left, body in one straight line. No text, no logo. »
2. Puis génère une vidéo Seedance 2.5 : 4 s, format 1:1, 720p, sans son, avec l'image de l'étape 1 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi. Prompt : « Same woman and same pose as in the image. She lowers her chest toward the floor, then pushes back up. Body stays straight. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de l'image et le lien de la vidéo. (Flash Coach : pompe-pieds-sureleves)
```

## 65. Pompe hindoue — `pompe-hindoue` (profil, 5 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
1. Génère une image GPT Image 2.6, format 1:1, avec l'image Higgsfield 1f3f545d-2aab-4b13-b6c9-0c2fca6ed6db en référence. Prompt : « Same woman as the reference image: same face, auburn hair in a high ponytail, orange sports bra, slate-blue leggings, off-white sneakers. Photorealistic studio photo, plain light grey-blue seamless background, soft even lighting, soft shadow on the floor, whole body in frame with margin all around. Strict side view, camera at 90 degrees to her body. Pike position on a thin grey exercise mat, head toward the right of the frame: hands and feet on the floor, hips high in the air in an inverted V, arms and legs straight. No text, no logo. »
2. Puis génère une vidéo Seedance 2.5 : 5 s, format 1:1, 720p, sans son, avec l'image de l'étape 1 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi. Prompt : « Same woman and same pose as in the image. Hindu push-up: from the inverted V she dives forward, chest skimming just above the floor, rises into a cobra with arms straight and chest up, then pushes her hips back up to the inverted V. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de l'image et le lien de la vidéo. (Flash Coach : pompe-hindoue)
```

## 66. Pompe spider-man — `pompe-spiderman` (profil, 4 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
1. Génère une image GPT Image 2.6, format 1:1, avec l'image Higgsfield 1f3f545d-2aab-4b13-b6c9-0c2fca6ed6db en référence. Prompt : « Same woman as the reference image: same face, auburn hair in a high ponytail, orange sports bra, slate-blue leggings, off-white sneakers. Photorealistic studio photo, plain light grey-blue seamless background, soft even lighting, soft shadow on the floor, whole body in frame with margin all around. Strict side view, camera at 90 degrees to her body. High plank on a thin grey exercise mat, head toward the right of the frame, hands under her shoulders, arms straight, body in one straight line from head to heels. No text, no logo. »
2. Puis génère une vidéo Seedance 2.5 : 4 s, format 1:1, 720p, sans son, avec l'image de l'étape 1 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi. Prompt : « Same woman and same pose as in the image. As she lowers into a push-up, her right knee (nearest the camera) comes out toward her right elbow; she pushes back up and the foot returns to the start. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de l'image et le lien de la vidéo. (Flash Coach : pompe-spiderman)
```

## 67. Planche penchée — `planche-penchee` (profil, 4 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
1. Génère une image GPT Image 2.6, format 1:1, avec l'image Higgsfield 1f3f545d-2aab-4b13-b6c9-0c2fca6ed6db en référence. Prompt : « Same woman as the reference image: same face, auburn hair in a high ponytail, orange sports bra, slate-blue leggings, off-white sneakers. Photorealistic studio photo, plain light grey-blue seamless background, soft even lighting, soft shadow on the floor, whole body in frame with margin all around. Strict side view, camera at 90 degrees to her body. Planche lean on a thin grey exercise mat, head toward the right of the frame: high plank with her hands placed by her waist, arms straight, shoulders leaning forward well past her hands, body in one straight line. No text, no logo. »
2. Puis génère une vidéo Seedance 2.5 : 4 s, format 1:1, 720p, sans son, avec l'image de l'étape 1 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi. Prompt : « Same woman and same pose as in the image. She holds the forward lean, still, breathing, shoulders staying ahead of her hands. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de l'image et le lien de la vidéo. (Flash Coach : planche-penchee)
```

## 68. Gainage commando — `gainage-commando` (profil, 5 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
1. Génère une image GPT Image 2.6, format 1:1, avec l'image Higgsfield 1f3f545d-2aab-4b13-b6c9-0c2fca6ed6db en référence. Prompt : « Same woman as the reference image: same face, auburn hair in a high ponytail, orange sports bra, slate-blue leggings, off-white sneakers. Photorealistic studio photo, plain light grey-blue seamless background, soft even lighting, soft shadow on the floor, whole body in frame with margin all around. Strict side view, camera at 90 degrees to her body. Forearm plank on a thin grey exercise mat, head toward the right of the frame, elbows under her shoulders, body in one straight line from head to heels. No text, no logo. »
2. Puis génère une vidéo Seedance 2.5 : 5 s, format 1:1, 720p, sans son, avec l'image de l'étape 1 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi. Prompt : « Same woman and same pose as in the image. She places one hand then the other on the mat and pushes up to a high plank, then lowers one forearm then the other back down to the forearm plank. Hips stay level. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de l'image et le lien de la vidéo. (Flash Coach : gainage-commando)
```

## 69. Fentes sautées — `fentes-sautees` (profil, 4 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
1. Génère une image GPT Image 2.6, format 1:1, avec l'image Higgsfield 1f3f545d-2aab-4b13-b6c9-0c2fca6ed6db en référence. Prompt : « Same woman as the reference image: same face, auburn hair in a high ponytail, orange sports bra, slate-blue leggings, off-white sneakers. Photorealistic studio photo, plain light grey-blue seamless background, soft even lighting, soft shadow on the floor, whole body in frame with margin all around. Strict side view, camera at 90 degrees to her body. Lunge position facing the right of the frame, right leg (nearest the camera) forward with the knee at 90 degrees, left knee just above the floor, torso upright, arms bent. No text, no logo. »
2. Puis génère une vidéo Seedance 2.5 : 4 s, format 1:1, 720p, sans son, avec l'image de l'étape 1 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi. Prompt : « Same woman and same pose as in the image. She jumps up and switches legs in the air, lands softly in a lunge with the other leg forward, then jumps and switches again to land back in the starting lunge. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de l'image et le lien de la vidéo. (Flash Coach : fentes-sautees)
```

## 70. Burpee complet — `burpee-complet` (profil, 6 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
Génère une vidéo Seedance 2.5 : 6 s, format 1:1, 720p, sans son, avec l'image Higgsfield 1f3f545d-2aab-4b13-b6c9-0c2fca6ed6db en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi.
Prompt : « Same woman as in the image. Full burpee: she squats, places her hands on the floor, jumps her feet back into a plank, does one push-up, jumps her feet forward, then jumps up with her arms overhead and lands softly standing. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de la vidéo. (Flash Coach : burpee-complet)
```

## 71. Pompes inclinées — `pompe-inclinee` (profil, 4 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
1. Génère une image GPT Image 2.6, format 1:1, avec l'image Higgsfield 1f3f545d-2aab-4b13-b6c9-0c2fca6ed6db en référence. Prompt : « Same woman as the reference image: same face, auburn hair in a high ponytail, orange sports bra, slate-blue leggings, off-white sneakers. Photorealistic studio photo, plain light grey-blue seamless background, soft even lighting, soft shadow on the floor, whole body in frame with margin all around. Strict side view, camera at 90 degrees to her body. Incline plank facing the right of the frame: hands on the front edge of the seat of a simple grey-blue chair on the right, arms straight, body in one straight line down to her toes on the floor. No text, no logo. »
2. Puis génère une vidéo Seedance 2.5 : 4 s, format 1:1, 720p, sans son, avec l'image de l'étape 1 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi. Prompt : « Same woman and same pose as in the image. She lowers her chest to the edge of the chair, then pushes back up. Body stays straight. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de l'image et le lien de la vidéo. (Flash Coach : pompe-inclinee)
```

## 72. Pompes sur les genoux — `pompe-genoux` (profil, 4 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
1. Génère une image GPT Image 2.6, format 1:1, avec l'image Higgsfield 1f3f545d-2aab-4b13-b6c9-0c2fca6ed6db en référence. Prompt : « Same woman as the reference image: same face, auburn hair in a high ponytail, orange sports bra, slate-blue leggings, off-white sneakers. Photorealistic studio photo, plain light grey-blue seamless background, soft even lighting, soft shadow on the floor, whole body in frame with margin all around. Strict side view, camera at 90 degrees to her body. Knee push-up position on a thin grey exercise mat, head toward the right of the frame: hands under her shoulders, arms straight, knees on the mat, feet lifted, body in one straight line from knees to head. No text, no logo. »
2. Puis génère une vidéo Seedance 2.5 : 4 s, format 1:1, 720p, sans son, avec l'image de l'étape 1 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi. Prompt : « Same woman and same pose as in the image. She lowers her chest between her hands until it almost touches the mat, then pushes back up. Body straight from knees to head. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de l'image et le lien de la vidéo. (Flash Coach : pompe-genoux)
```

## 73. Pompes — `pompe-classique` (profil, 4 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
1. Génère une image GPT Image 2.6, format 1:1, avec l'image Higgsfield 1f3f545d-2aab-4b13-b6c9-0c2fca6ed6db en référence. Prompt : « Same woman as the reference image: same face, auburn hair in a high ponytail, orange sports bra, slate-blue leggings, off-white sneakers. Photorealistic studio photo, plain light grey-blue seamless background, soft even lighting, soft shadow on the floor, whole body in frame with margin all around. Strict side view, camera at 90 degrees to her body. High plank on a thin grey exercise mat, head toward the right of the frame, hands under her shoulders, arms straight, body in one straight line from head to heels. No text, no logo. »
2. Puis génère une vidéo Seedance 2.5 : 4 s, format 1:1, 720p, sans son, avec l'image de l'étape 1 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi. Prompt : « Same woman and same pose as in the image. She lowers her whole body as one until her chest skims the mat, elbows at about 45 degrees, then pushes back up. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de l'image et le lien de la vidéo. (Flash Coach : pompe-classique)
```

## 74. Y-T au sol — `tirage-yt` (face, 5 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
1. Génère une image GPT Image 2.6, format 1:1, avec l'image Higgsfield 1ebb951a-1069-4473-b564-eb0f8e23ee23 en référence. Prompt : « Same woman as the reference image: same face, auburn hair in a high ponytail, orange sports bra, slate-blue leggings, off-white sneakers. Photorealistic studio photo, plain light grey-blue seamless background, soft even lighting, soft shadow on the floor, whole body in frame with margin all around. Front view. Seen from the front, head toward the camera: lying face down on a thin grey exercise mat, forehead just above the mat, arms resting on the floor stretched forward in a Y shape. No text, no logo. »
2. Puis génère une vidéo Seedance 2.5 : 5 s, format 1:1, 720p, sans son, avec l'image de l'étape 1 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi. Prompt : « Same woman and same pose as in the image. She lifts her arms off the floor in a Y, squeezing her shoulder blades, moves them to a T straight out to the sides, still lifted, then back to the Y, and lowers them. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de l'image et le lien de la vidéo. (Flash Coach : tirage-yt)
```

## 75. Bird-dog — `bird-dog` (profil, 5 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
1. Génère une image GPT Image 2.6, format 1:1, avec l'image Higgsfield 1f3f545d-2aab-4b13-b6c9-0c2fca6ed6db en référence. Prompt : « Same woman as the reference image: same face, auburn hair in a high ponytail, orange sports bra, slate-blue leggings, off-white sneakers. Photorealistic studio photo, plain light grey-blue seamless background, soft even lighting, soft shadow on the floor, whole body in frame with margin all around. Strict side view, camera at 90 degrees to her body. On all fours on a thin grey exercise mat, head toward the right of the frame, hands under her shoulders, knees under her hips, back flat. No text, no logo. »
2. Puis génère une vidéo Seedance 2.5 : 5 s, format 1:1, 720p, sans son, avec l'image de l'étape 1 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi. Prompt : « Same woman and same pose as in the image. She extends her right arm forward and her left leg back until both are level with her flat back, holds one second, returns to all fours, then extends her left arm and right leg, holds, and returns. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de l'image et le lien de la vidéo. (Flash Coach : bird-dog)
```

## 76. Pont fessier sur une jambe — `pont-une-jambe` (profil, 4 s)

```text
Avec Higgsfield, uniquement avec mes générations illimitées de l'essai gratuit, jamais mes crédits : si l'illimité est refusé, arrête-toi et dis-le-moi. Ne crée pas de projet.
1. Génère une image GPT Image 2.6, format 1:1, avec l'image Higgsfield 1f3f545d-2aab-4b13-b6c9-0c2fca6ed6db en référence. Prompt : « Same woman as the reference image: same face, auburn hair in a high ponytail, orange sports bra, slate-blue leggings, off-white sneakers. Photorealistic studio photo, plain light grey-blue seamless background, soft even lighting, soft shadow on the floor, whole body in frame with margin all around. Strict side view, camera at 90 degrees to her body. Lying on her back on a thin grey exercise mat, head on the left of the frame, feet on the right, left knee bent with the foot flat on the floor, right leg (nearest the camera) stretched straight up in the air, arms along her body. No text, no logo. »
2. Puis génère une vidéo Seedance 2.5 : 4 s, format 1:1, 720p, sans son, avec l'image de l'étape 1 en première ET dernière image. Si ce réglage n'est pas couvert par l'illimité, prends le plus proche qui l'est et dis-le-moi. Prompt : « Same woman and same pose as in the image. She lifts her hips by pushing through her left foot until shoulders, hips and knee are in line, right leg staying up, squeezes, then lowers her hips. Static locked-off camera, same plain light grey-blue studio background, soft even lighting. Controlled, realistic body mechanics, same face and outfit, whole body always in frame. She ends exactly in the starting pose. No camera movement, no zoom, no text, no logo. »
Réponds seulement avec le lien de l'image et le lien de la vidéo. (Flash Coach : pont-une-jambe)
```
