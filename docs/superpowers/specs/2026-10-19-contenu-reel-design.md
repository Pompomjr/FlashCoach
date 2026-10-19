# Contenu réel — 40 nouveaux exercices et leurs poses

Découpage validé avec Mattia le 2026-10-19 (avance du jalon 7). Découle de la fiche technique (sections 3, 4 et 8), de `PRODUCT.md` et du rapport de couverture (`npm run couverture`).

## Objectif

Passer de 10 à 50 exercices pour que **chaque contexte** (réveil, maison, bureau, voyage, dehors) ait de quoi remplir une séance de 3 et 5 minutes sans répéter un exercice, et le plus souvent de 10 minutes. Chaque nouvel exercice a ses poses de figurine.

## Le constat (rapport de couverture avant)

Les manques se concentrent sur les contraintes du **bureau** (tenue de ville → transpiration faible et pas de sol, silencieux, sur place) que partagent en partie voyage (silencieux, sur place) et dehors (pas de sol) :
- Mobilité debout : 2 exercices compatibles bureau (« Bureau + Raide », cœur : 0 disponible, il en faut 4 en 5 min).
- Détente : 2 compatibles bureau ; le retour au calme manque partout (0 à 1 disponible, il en faut 2).
- Énergie sans transpirer : 1 seul compatible bureau (pompes au mur).

## Règles d'écriture

- Ton complice, tutoiement, formulations neutres en genre, jamais culpabilisant ; une consigne = une ou deux phrases courtes qu'on comprend en un coup d'œil pendant l'effort.
- Aucune promesse de santé ni de perte de poids ; rien de dangereux pour un débutant (pas de saut sur une jambe, pas de nuque en arrière, pas de charge).
- `animation` = `<id>.json` (convention existante ; la figurine se branche par l'id).
- `bilateral: true` seulement si le geste se fait d'un côté puis de l'autre (le lecteur enchaîne gauche puis droite).
- Étiquettes cohérentes avec les filtres : tenue de ville ⇒ `transpiration: 'faible'` et `sol: false` ; silencieux ⇒ `sauts: false` ; sur place ⇒ `espace: 'sur_place'`.

## Les 40 nouveaux exercices

Colonnes : sol / sauts / transpiration / espace / effets / intensité / zone / bilatéral. « Vue » et « accessoire » guident les poses (Codex).

### A. Mobilité debout — 12 (bureau, voyage, dehors, réveil)

Tous : sol non, sauts non, faible, sur place.

| id | Nom | Consigne | Effets | Int. | Zone | Bilat. | Vue / accessoire |
|---|---|---|---|---|---|---|---|
| `rotation-cou` | Demi-cercles du cou | Menton vers la poitrine, tu fais rouler la tête d'une épaule à l'autre. Jamais vers l'arrière. | mobilité | 1 | haut | non | face |
| `haussement-epaules` | Haussements d'épaules | Épaules vers les oreilles, tu tiens une seconde, puis tu relâches d'un coup. | mobilité, détente | 1 | haut | non | face |
| `rotation-poignets` | Rotation des poignets | Doigts croisés devant toi, tu fais rouler les poignets dans un sens puis dans l'autre. | mobilité | 1 | haut | non | face |
| `ouverture-poitrine` | Ouverture de la poitrine | Mains jointes dans le dos, tu ouvres les épaules et tu grandis. | mobilité | 1 | haut | non | profil |
| `cercles-bras` | Cercles de bras | Bras tendus sur les côtés, petits cercles qui grandissent peu à peu. | mobilité | 1 | haut | non | face |
| `etirement-cou` | Étirement du cou | Oreille vers l'épaule, l'autre épaule descend. Trois grandes respirations. | mobilité, détente | 1 | haut | oui | face |
| `rotation-buste` | Rotation du buste | Pieds bien fixes, tu tournes les épaules d'un côté puis de l'autre. Les bras suivent. | mobilité | 1 | tronc | non | face |
| `cercles-hanches` | Cercles de hanches | Mains sur les hanches, tu dessines de grands cercles avec le bassin. | mobilité | 1 | tronc | non | face |
| `enroule-deroule` | Enroulé du dos | Genoux souples, tu descends vers tes pieds vertèbre par vertèbre, puis tu remontes tout doucement. | mobilité, détente | 1 | tronc | non | profil |
| `balancier-jambe` | Balancier de jambe | Une main au mur, la jambe se balance d'avant en arrière, sans forcer. | mobilité | 1 | bas | oui | profil / mur |
| `cercles-chevilles` | Cercles de chevilles | Une main au mur, la pointe du pied dessine des cercles dans un sens puis dans l'autre. | mobilité | 1 | bas | oui | profil / mur |
| `etirement-mollet` | Étirement du mollet | Mains au mur, une jambe tendue derrière, talon au sol. Tu respires. | mobilité, détente | 1 | bas | oui | profil / mur |

### B. Détente et respiration — 10 (retour au calme, stressé)

Tous : sol non, sauts non, faible, sur place, intensité 1.

| id | Nom | Consigne | Effets | Zone | Bilat. | Vue |
|---|---|---|---|---|---|---|
| `respiration-ventre` | Respiration du ventre | Une main sur le ventre : il gonfle quand tu inspires, il se vide quand tu souffles longtemps. | détente | global | non | face |
| `grand-soupir` | Le grand soupir | Deux petites inspirations par le nez, puis un long soupir par la bouche. On recommence. | détente | global | non | face |
| `respiration-allongee` | Expiration longue | Inspire sur 4 temps, souffle sur 6 ou 8. Le souffle plus long que l'inspiration, c'est tout. | détente | global | non | face |
| `bras-respiration` | Bras qui respirent | Les bras montent quand tu inspires et redescendent quand tu souffles. Lentement. | détente, mobilité | haut | non | face |
| `epaules-lourdes` | Épaules lourdes | Tu serres tout le haut du corps trois secondes, puis tu laisses tout tomber. | détente | haut | non | face |
| `massage-nuque` | Massage de la nuque | Du bout des doigts, petits cercles lents sur la nuque. Tu desserres la mâchoire. | détente | haut | non | face |
| `secouer-bras` | Secouer les bras | Tu secoues les mains, puis les bras entiers, comme pour les sécher. Tu laisses aller. | détente | haut | non | face |
| `balancement-bras` | Bras en balançoire | Bras relâchés, tu tournes doucement le buste et les bras viennent s'enrouler tout seuls. | détente, mobilité | tronc | non | face |
| `etirement-ciel` | Grandir vers le ciel | Doigts croisés, paumes vers le haut, tu grandis. Tu respires en haut, puis tu relâches. | détente, mobilité | global | non | face |
| `ancrage-pieds` | Pieds ancrés | Pieds bien posés, tu fais passer doucement ton poids des talons aux orteils. Tu respires. | détente | bas | non | profil |

### C. Énergie douce sans transpirer — 8 (bureau, voyage, réveil)

Tous : sol non, sauts non, faible, sur place, effet énergie.

| id | Nom | Consigne | Int. | Zone | Bilat. | Vue / accessoire |
|---|---|---|---|---|---|---|
| `montees-pointes` | Montées sur pointes | Tu montes sur la pointe des pieds, tu redescends lentement. Une main au mur si besoin. | 2 | bas | non | profil |
| `assis-debout` | Assis-debout | Assis au bord d'une chaise, tu te lèves sans les mains, puis tu te rassois en douceur. | 2 | bas | non | profil / chaise |
| `chaise-murale` | Chaise contre le mur | Dos au mur, tu glisses jusqu'à être assis dans le vide, genoux au-dessus des chevilles. Tu tiens, tu respires. | 2 | bas | non | profil / mur |
| `marche-sur-place` | Marche sur place | Tu marches sur place, les bras balancent, sans bruit. Tranquille. | 1 | global | non | face |
| `genou-coude` | Genou-coude debout | Le genou monte, le coude opposé vient à sa rencontre. Lentement, sans sauter. | 2 | tronc | non | face |
| `gainage-debout` | Gainage debout | Tu rentres le nombril, tu serres les fessiers, les bras poussent l'un contre l'autre. Tu tiens en respirant. | 2 | tronc | non | face |
| `boxe-air` | Boxe dans le vide | Petits coups de poing devant toi, vifs mais sans te crisper, pieds bien ancrés. | 2 | haut | non | face |
| `jambe-arriere` | Jambe vers l'arrière | Une main au mur, la jambe tendue part vers l'arrière et tu serres le fessier. | 2 | bas | oui | profil / mur |

### D. Énergie franche — 10 (maison, dehors, voyage)

| id | Nom | Consigne | Sol | Sauts | Transp. | Espace | Int. | Zone | Bilat. | Vue |
|---|---|---|---|---|---|---|---|---|---|---|
| `squats-sautes` | Squats sautés | Tu descends en squat, tu pousses vers le haut et tu atterris tout en souplesse. | non | oui | élevée | sur place | 3 | bas | non | profil |
| `talons-fesses` | Talons-fesses | Course légère sur place, les talons viennent vers les fesses. | non | oui | moyenne | sur place | 2 | global | non | profil |
| `patineur` | Le patineur | Petit bond de côté sur un pied, l'autre jambe passe derrière. Et de l'autre côté. | non | oui | élevée | un peu | 3 | bas | non | face |
| `pas-chasses` | Pas chassés | Pas chassés de côté, trois pas à droite, trois pas à gauche, bras actifs. | non | non | moyenne | un peu | 2 | bas | non | face |
| `burpee-sans-saut` | Burpee sans saut | Mains au sol, tu recules les pieds en planche, tu les ramènes, tu te relèves. À ton rythme. | oui | non | élevée | un peu | 3 | global | non | profil |
| `grimpeur` | Le grimpeur | En planche, tu ramènes un genou vers la poitrine, puis l'autre. Le dos reste droit. | oui | non | élevée | sur place | 3 | global | non | profil |
| `pont-fessier` | Pont fessier | Sur le dos, genoux pliés, tu montes le bassin, tu serres, tu redescends. | oui | non | faible | sur place | 2 | bas | non | profil |
| `superman` | Superman | À plat ventre, tu décolles en même temps bras et jambes, tu tiens une seconde. | oui | non | faible | sur place | 2 | tronc | non | profil |
| `planche-laterale` | Planche sur le côté | Sur l'avant-bras, genoux au sol si besoin, tu montes les hanches et tu tiens. | oui | non | moyenne | sur place | 3 | tronc | oui | face |
| `crunch-velo` | Crunch vélo | Sur le dos, le coude va vers le genou opposé, l'autre jambe s'allonge. Lentement. | oui | non | moyenne | sur place | 2 | tronc | non | profil |

## Couverture attendue (vérification)

Avec ces 50 exercices, pour le contexte le plus contraint (bureau) :
- Mobilité intensité 1 : 2 existants + 12 (A) + 3 (B : `bras-respiration`, `balancement-bras`, `etirement-ciel`) = 17.
- Détente intensité 1 : 2 existants + 10 (B) + 4 de (A) = 16.
- Énergie intensité 1-2, transpiration faible : 1 existant + 8 (C) = 9 ; intensité 2-3 : 8.

Critère d'acceptation : `npm run couverture` ne signale **plus aucun manque en 3 et 5 minutes** pour les 5 contextes × 4 ressentis ; les manques restants en 10 minutes, s'il y en a, sont listés dans le rapport du lot (ils seront comblés au besoin plus tard, le générateur sait déjà assouplir).

## Poses (Codex, en parallèle)

- Une entrée dans `POSES_PAR_EXERCICE` (`mobile/src/illustrations/poses.ts`) pour chacun des 40 identifiants ci-dessus, avec 2-3 poses clés, la vue indiquée (Codex peut la changer si le geste se lit mieux autrement, en le notant), un cycle lent (4-6 s) pour mobilité et détente, plus vif (1,2-2 s) pour l'énergie.
- Accessoires : `mur` (déjà dessiné) ; nouveau `chaise` pour `assis-debout` (dessin sobre dans le style du mur). Le sol est déjà présent pour les exercices au sol.
- Respiration et massage : le geste se lit par le haut du corps (poitrine qui s'ouvre, épaules, mains) ; une pose quasi immobile est acceptable si elle reste vivante (respiration).
- Tests existants verts (tous les points dans le cadre, pieds au sol pour les poses debout) ; le test « chaque exercice du catalogue a des poses » passera une fois les deux branches fusionnées.
- Vérification visuelle : une galerie temporaire (non commitée) des 40 figurines ; chaque geste doit se comprendre sans lire la consigne.

## Hors périmètre

Aucun changement du générateur, des contextes ou des écrans ; pas de nouvel accessoire hors `chaise` ; pas d'illustrations autres que la figurine. Les consignes pourront être retouchées par Mattia après essai sur téléphone.
