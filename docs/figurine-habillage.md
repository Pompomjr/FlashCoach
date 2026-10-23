# Nouvel habillage de la figurine — brief et liste des exercices

Rédigé le 2026-10-23 pour Mattia. Il sert à deux choses : donner la consigne à **Codex** (dessin en code, la voie choisie) et, en option, essayer une **IA d'illustration en ligne** avec les mêmes règles.

## 1. Le design voulu

Référence : l'illustration plate d'une sportive que Mattia a envoyée (squat).
- **Personnage unique**, le même dans les 76 exercices : une sportive, peau mate claire, cheveux auburn en **queue de cheval**, visage simple (yeux en points, pas de bouche ou un trait).
- **Tenue** : brassière et legging, baskets blanches à semelle claire. Couleurs de l'app : orange `#F97316` (brassière ou legging), bleu `#3A506B` (l'autre pièce), cheveux `#9A3412`.
- **Rendu** : illustration plate, volumes arrondis en **deux tons** par pièce (un ton clair, un ton d'ombre côté éloigné), pas de contour noir épais, pas de dégradé photo.
- **Fond** : carte crème/gris très clair `#EDF2F7`, ombre douce au sol ; accessoires (chaise, table, mur) en gris-bleu `#94A3B8`, simples.
- **Anatomie** : épaules **fondues dans le buste**, coudes, hanches et genoux sans aucune « boule » ; proportions réalistes ; le geste doit se comprendre **sans lire le texte**.
- **Vue** : celle de la colonne « Vue » ci-dessous (profil ou face) ; la pompe archer passe **de face**.

## 2. Voie A — Codex, en code (recommandée)

On garde le squelette, les 76 poses et l'animation (`mobile/src/illustrations/squelette.ts`, `poses.ts`) ; on ne change que le rendu (`dessin.ts`, `Figurine.tsx`) :
1. Formes par segment : peau (avant-bras, mains, cou, visage, ventre si brassière), brassière, legging (cuisses, jambes), baskets ; queue de cheval qui suit la tête.
2. Deux tons par pièce : membres « proches » clairs, « loin » plus sombres (la logique proche/loin existe déjà).
3. Couleurs dans `src/ui/theme.ts`, jamais en dur.
4. **D'abord une galerie avant/après** sur 5 exercices (squat lent, pompe classique, pont fessier, jumping jacks, pompe archer) à montrer à Mattia ; seulement après son accord, généraliser.
5. Tests : `npx jest src/illustrations` pendant le travail ; la suite complète une fois à la fin. Brief court, une galerie, une passe de correction (quota).

Consigne à coller à Codex : « Lis `docs/figurine-habillage.md` (§1 et §2) et `CLAUDE.md`, puis fais l'étape 4 (galerie avant/après des 5 exercices) dans `.superpowers/galerie-habillage.png`, sans généraliser. Réponds en moins de 8 lignes. »

## 3. Voie B — IA d'illustration en ligne (essai)

Outils les plus adaptés :
- **Recraft** : le meilleur choix pour nous, il produit des illustrations plates **en SVG** et garde un style constant (styles personnalisés à partir d'une image de référence).
- **ChatGPT (génération d'images)** : très bon pour suivre une consigne précise et garder le personnage d'une image à l'autre dans la même conversation.
- **Midjourney** (option « character reference ») ou **Ideogram** : jolis rendus, mais cohérence du personnage plus difficile.

Méthode : créer d'abord **une planche du personnage** (face, profil, dos) à partir de la référence, puis la redonner à chaque exercice. Pour chaque exercice, **2 images clés** (position de départ, position d'arrivée ; 3 si le mouvement a un milieu marquant), carrées 1024 × 1024, fond uni `#EDF2F7` ou transparent, nommées `<id>-1.png`, `<id>-2.png`.

Modèle de consigne :
> Illustration plate vectorielle, même personnage que la référence (sportive, queue de cheval auburn, brassière orange #F97316, legging bleu #3A506B, baskets blanches), volumes en deux tons, sans contour noir, fond uni #EDF2F7, ombre douce au sol. Vue de <profil/face>. Exercice « <Nom> » : <consigne>. Position <de départ / d'arrivée>. Épaules et articulations naturelles, aucune boule aux articulations.

Limite à connaître : des images fixes ne s'animent pas comme la figurine actuelle ; l'app passerait d'une image clé à l'autre en fondu. À tester sur 3 exercices avant d'en faire 76.

## 4. Les 76 exercices

« Un côté » = oui : l'exercice se fait d'un côté puis de l'autre (montrer un côté suffit). Accessoire « sol » = au sol, sur un tapis.

| # | Exercice | Identifiant | Objectifs | Niveau | Vue | Accessoire | Un côté | Consigne |
|---|---|---|---|---|---|---|---|---|
| 1 | Rotation des épaules | `rotation-epaules` | Étirements | 1 | profil | — | oui | Grands cercles, lentement, comme si tu dessinais avec tes coudes. |
| 2 | Respiration carrée | `respiration-carree` | Étirements | 1 | face | — | oui | Inspire 4 secondes, bloque 4, souffle 4, bloque 4. Rien d’autre à faire. |
| 3 | Inclinaison latérale | `inclinaison-laterale` | Étirements | 1 | face | — | non | Bras au-dessus de la tête, tu te penches doucement sur le côté. Tu respires, tu t’étires. |
| 4 | Pompes contre le mur | `pompes-mur` | Masse | 1 | profil | mur | oui | Mains sur le mur, corps bien droit : tu rapproches le nez du mur, puis tu repousses. |
| 5 | Squat lent | `squat-lent` | Masse | 1 | profil | — | oui | Pieds écartés, tu descends comme pour t’asseoir sur une chaise invisible, puis tu remontes. |
| 6 | Marche genoux hauts | `marche-genoux-hauts` | Calories | 1 | profil | — | oui | Sur place, tu montes les genoux à hauteur de hanches, sans sauter : les voisins dorment. |
| 7 | Jumping jacks | `jumping-jacks` | Calories | 1 | face | — | oui | Tu sautes en écartant bras et jambes, puis tu reviens. On réveille tout le corps ! |
| 8 | Fentes arrière | `fentes-arriere` | Masse | 1 | profil | — | non | Un grand pas en arrière, le genou descend vers le sol, et tu reviens. Une jambe, puis l’autre. |
| 9 | Chat-vache | `chat-vache` | Étirements | 1 | profil | sol | oui | À quatre pattes, tu arrondis le dos comme un chat, puis tu le creuses doucement. |
| 10 | Planche | `planche` | Masse | 2 | profil | sol | oui | Sur les avant-bras, corps gainé des talons à la tête. Tu respires, tu tiens. |
| 11 | Demi-cercles du cou | `rotation-cou` | Étirements | 1 | face | — | oui | Menton vers la poitrine, tu fais rouler la tête d’une épaule à l’autre. Jamais vers l’arrière. |
| 12 | Haussements d’épaules | `haussement-epaules` | Étirements | 1 | face | — | oui | Épaules vers les oreilles, tu tiens une seconde, puis tu relâches d’un coup. |
| 13 | Rotation des poignets | `rotation-poignets` | Étirements | 1 | face | — | oui | Doigts croisés devant toi, tu fais rouler les poignets dans un sens puis dans l’autre. |
| 14 | Ouverture de la poitrine | `ouverture-poitrine` | Étirements | 1 | profil | — | oui | Mains jointes dans le dos, tu ouvres les épaules et tu grandis. |
| 15 | Cercles de bras | `cercles-bras` | Étirements | 1 | face | — | oui | Bras tendus sur les côtés, petits cercles qui grandissent peu à peu. |
| 16 | Étirement du cou | `etirement-cou` | Étirements | 1 | face | — | non | Oreille vers l’épaule, l’autre épaule descend. Trois grandes respirations. |
| 17 | Rotation du buste | `rotation-buste` | Étirements | 1 | face | — | oui | Pieds bien fixes, tu tournes les épaules d’un côté puis de l’autre. Les bras suivent. |
| 18 | Cercles de hanches | `cercles-hanches` | Étirements | 1 | face | — | oui | Mains sur les hanches, tu dessines de grands cercles avec le bassin. |
| 19 | Enroulé du dos | `enroule-deroule` | Étirements | 1 | profil | — | oui | Genoux souples, tu descends vers tes pieds vertèbre par vertèbre, puis tu remontes tout doucement. |
| 20 | Balancier de jambe | `balancier-jambe` | Étirements | 1 | profil | mur | non | Une main au mur, la jambe se balance d’avant en arrière, sans forcer. |
| 21 | Cercles de chevilles | `cercles-chevilles` | Étirements | 1 | profil | mur | non | Une main au mur, la pointe du pied dessine des cercles dans un sens puis dans l’autre. |
| 22 | Étirement du mollet | `etirement-mollet` | Étirements | 1 | profil | mur | non | Mains au mur, une jambe tendue derrière, talon au sol. Tu respires. |
| 23 | Respiration du ventre | `respiration-ventre` | Étirements | 1 | face | — | oui | Une main sur le ventre : il gonfle quand tu inspires, il se vide quand tu souffles longtemps. |
| 24 | Le grand soupir | `grand-soupir` | Étirements | 1 | face | — | oui | Deux petites inspirations par le nez, puis un long soupir par la bouche. On recommence. |
| 25 | Expiration longue | `respiration-allongee` | Étirements | 1 | face | — | oui | Inspire sur 4 temps, souffle sur 6 ou 8. Le souffle plus long que l’inspiration, c’est tout. |
| 26 | Bras qui respirent | `bras-respiration` | Étirements | 1 | face | — | oui | Les bras montent quand tu inspires et redescendent quand tu souffles. Lentement. |
| 27 | Épaules lourdes | `epaules-lourdes` | Étirements | 1 | face | — | oui | Tu serres tout le haut du corps trois secondes, puis tu laisses tout tomber. |
| 28 | Massage de la nuque | `massage-nuque` | Étirements | 1 | face | — | oui | Du bout des doigts, petits cercles lents sur la nuque. Tu desserres la mâchoire. |
| 29 | Secouer les bras | `secouer-bras` | Étirements | 1 | face | — | oui | Tu secoues les mains, puis les bras entiers, comme pour les sécher. Tu laisses aller. |
| 30 | Bras en balançoire | `balancement-bras` | Étirements | 1 | face | — | oui | Bras relâchés, tu tournes doucement le buste et les bras viennent s’enrouler tout seuls. |
| 31 | Grandir vers le ciel | `etirement-ciel` | Étirements | 1 | face | — | oui | Doigts croisés, paumes vers le haut, tu grandis. Tu respires en haut, puis tu relâches. |
| 32 | Pieds ancrés | `ancrage-pieds` | Étirements | 1 | profil | — | oui | Pieds bien posés, tu fais passer doucement ton poids des talons aux orteils. Tu respires. |
| 33 | Montées sur pointes | `montees-pointes` | Masse | 1 | profil | — | oui | Tu montes sur la pointe des pieds, tu redescends lentement. Une main au mur si besoin. |
| 34 | Assis-debout | `assis-debout` | Masse | 1 | profil | chaise | oui | Assis au bord d’une chaise, tu te lèves sans les mains, puis tu te rassois en douceur. |
| 35 | Chaise contre le mur | `chaise-murale` | Masse | 1 | profil | mur | oui | Dos au mur, tu glisses jusqu’à être assis dans le vide, genoux au-dessus des chevilles. Tu tiens, tu respires. |
| 36 | Marche sur place | `marche-sur-place` | Calories | 1 | face | — | oui | Tu marches sur place, les bras balancent, sans bruit. Tranquille. |
| 37 | Genou-coude debout | `genou-coude` | Calories | 1 | profil | — | oui | Le genou monte, le coude opposé vient à sa rencontre. Lentement, sans sauter. |
| 38 | Gainage debout | `gainage-debout` | Masse | 1 | face | — | oui | Tu rentres le nombril, tu serres les fessiers, les bras poussent l’un contre l’autre. Tu tiens en respirant. |
| 39 | Boxe dans le vide | `boxe-air` | Calories | 1 | profil | — | oui | Petits coups de poing devant toi, vifs mais sans te crisper, pieds bien ancrés. |
| 40 | Jambe vers l’arrière | `jambe-arriere` | Masse | 1 | profil | mur | non | Une main au mur, la jambe tendue part vers l’arrière et tu serres le fessier. |
| 41 | Squats sautés | `squats-sautes` | Calories, Masse | 2 | profil | — | oui | Tu descends en squat, tu pousses vers le haut et tu atterris tout en souplesse. |
| 42 | Talons-fesses | `talons-fesses` | Calories | 1 | profil | — | oui | Course légère sur place, les talons viennent vers les fesses. |
| 43 | Le patineur | `patineur` | Calories | 1 | face | — | oui | Grand pas de côté, l’autre jambe passe derrière en croisant. Et de l’autre côté, sans sauter. |
| 44 | Pas chassés | `pas-chasses` | Calories | 1 | face | — | oui | Pas chassés de côté, trois pas à droite, trois pas à gauche, bras actifs. |
| 45 | Burpee sans saut | `burpee-sans-saut` | Calories, Masse | 2 | profil | sol | oui | Mains au sol, tu recules les pieds en planche, tu les ramènes, tu te relèves. À ton rythme. |
| 46 | Le grimpeur | `grimpeur` | Calories, Masse | 2 | profil | sol | oui | En planche, tu ramènes un genou vers la poitrine, puis l’autre. Le dos reste droit. |
| 47 | Pont fessier | `pont-fessier` | Masse | 1 | profil | sol | oui | Sur le dos, genoux pliés, tu montes le bassin, tu serres, tu redescends. |
| 48 | Superman | `superman` | Masse | 1 | profil | sol | oui | À plat ventre, tu décolles en même temps bras et jambes, tu tiens une seconde. |
| 49 | Planche sur le côté | `planche-laterale` | Masse | 2 | face | sol | non | Sur l’avant-bras, genoux au sol si besoin, tu montes les hanches et tu tiens. |
| 50 | Crunch vélo | `crunch-velo` | Masse | 1 | profil | sol | oui | Sur le dos, le coude va vers le genou opposé, l’autre jambe s’allonge. Lentement. |
| 51 | Pompes mains larges | `pompe-large` | Masse | 2 | profil | sol | oui | Mains plus larges que les épaules, tu descends la poitrine entre les mains et tu pousses. |
| 52 | Pompes au ralenti | `pompe-tempo` | Masse | 2 | profil | sol | oui | Quatre secondes pour descendre, quatre pour remonter. Le corps reste gainé. |
| 53 | Pompes en V | `pike-pushup` | Masse | 2 | profil | sol | oui | Fesses en l’air, tu plies les coudes pour amener le haut de la tête vers le sol, puis tu pousses. |
| 54 | Dips sur une chaise | `dips-chaise` | Masse | 2 | profil | chaise | oui | Mains au bord d’une chaise stable, tu plies les coudes vers l’arrière et tu remontes. |
| 55 | Tractions sous la table | `tractions-australiennes` | Masse | 2 | profil | table | oui | Sur le dos sous une table très solide, mains au bord, tu tires la poitrine vers la table. |
| 56 | Superman tirage | `superman-tirage` | Masse | 2 | profil | sol | oui | À plat ventre, bras décollés, tu tires les coudes vers les côtes et tu serres le dos. |
| 57 | Squat avec pause | `squat-pause` | Masse | 2 | profil | — | oui | Tu descends en squat, tu tiens trois secondes en bas, tu remontes. |
| 58 | Squat bulgare | `squat-bulgare` | Masse | 2 | profil | chaise | non | Le pied arrière posé sur une chaise, tu descends le genou arrière vers le sol. |
| 59 | Planche, toucher d’épaules | `planche-epaules` | Masse | 2 | profil | sol | oui | En planche sur les mains, tu touches l’épaule opposée sans bouger le bassin. |
| 60 | La banane | `hollow-hold` | Masse | 2 | profil | sol | oui | Sur le dos, bas du dos collé au sol, bras et jambes décollés. Tu tiens. |
| 61 | Relevés de jambes | `releves-jambes` | Masse | 2 | profil | sol | oui | Sur le dos, jambes tendues, tu les montes à la verticale et tu redescends sans toucher le sol. |
| 62 | Pompes diamant | `pompe-diamant` | Masse | 3 | profil | sol | oui | Pouces et index forment un losange sous la poitrine, coudes près du corps. |
| 63 | Pompes archer | `pompe-archer` | Masse | 3 | face | sol | non | Mains très larges, tu descends vers une main pendant que l’autre bras reste tendu. |
| 64 | Pompes pieds surélevés | `pompe-pieds-sureleves` | Masse | 3 | profil | chaise | oui | Les pieds sur une chaise, tu descends la poitrine vers le sol, corps bien droit. |
| 65 | Pompe hindoue | `pompe-hindoue` | Masse | 3 | profil | sol | oui | Fesses en l’air, tu plonges vers l’avant en frôlant le sol, puis tu remontes en cobra et tu reviens. |
| 66 | Pompe spider-man | `pompe-spiderman` | Masse | 3 | profil | sol | oui | En descendant, un genou vient vers le coude du même côté. On alterne. |
| 67 | Planche penchée | `planche-penchee` | Masse | 3 | profil | sol | oui | En planche, mains au niveau du ventre, tu avances les épaules au-delà des mains et tu tiens. |
| 68 | Gainage commando | `gainage-commando` | Masse | 3 | profil | sol | oui | Tu passes de planche sur les coudes à planche sur les mains, une main après l’autre. |
| 69 | Fentes sautées | `fentes-sautees` | Calories, Masse | 3 | profil | — | oui | En fente, tu sautes et tu changes de jambe en l’air, atterrissage souple. |
| 70 | Burpee complet | `burpee-complet` | Calories, Masse | 3 | profil | sol | oui | Planche, pompe, pieds ramenés, saut bras en l’air. À ton rythme. |
| 71 | Pompes inclinées | `pompe-inclinee` | Masse | 1 | profil | chaise | oui | Mains sur le bord d’une chaise stable ou d’une table, corps gainé, tu descends la poitrine et tu pousses. |
| 72 | Pompes sur les genoux | `pompe-genoux` | Masse | 1 | profil | sol | oui | Genoux au sol, corps droit des genoux à la tête, tu descends la poitrine entre les mains. |
| 73 | Pompes | `pompe-classique` | Masse | 2 | profil | sol | oui | Mains sous les épaules, corps gainé de la tête aux pieds, la poitrine frôle le sol. |
| 74 | Y-T au sol | `tirage-yt` | Masse | 1 | face | sol | oui | À plat ventre, tu décolles les bras en Y, puis en T, en serrant les omoplates. |
| 75 | Bird-dog | `bird-dog` | Masse, Étirements | 1 | profil | sol | oui | À quatre pattes, tu tends le bras et la jambe opposés, dos plat, puis tu changes. |
| 76 | Pont fessier sur une jambe | `pont-une-jambe` | Masse | 2 | profil | sol | non | Sur le dos, une jambe tendue en l’air, tu montes le bassin avec l’autre et tu serres. |
