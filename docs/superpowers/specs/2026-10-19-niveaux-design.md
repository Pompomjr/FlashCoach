# Niveaux — un Flash Coach aussi pour les sportifs moyens

Validé avec Mattia le 2026-10-19 : le niveau **monte tout seul** selon le ressenti d'effort, **et** se choisit dès le début par une pastille facultative sur l'écran de départ. Inspiré de sa page Notion « Poids du corps » (pompes, dos, épaules, abdos ; tempos lents). Le format reste minuté (séances de 3, 5, 10 minutes, 40 s d'effort).

## Principes

- **Zéro configuration intacte** : niveau 1 présélectionné ; lancer reste un seul tap ; rien n'est demandé avant la première séance.
- Les contraintes de contexte ne sont **jamais** assouplies pour atteindre un niveau : au bureau (tenue de ville), un niveau 3 se rabat sur ce qui existe.
- Ton complice : on ne juge pas le niveau ; aucun mot comme « débutant » ou « nul ».

## 1. Le niveau

- Trois niveaux, avec un nom à valider par Mattia : **1 « Doux »**, **2 « Tonique »**, **3 « Costaud »**.
- Stocké sur le téléphone avec les derniers choix (clé de préférences existante, champ `niveau`, défaut 1).
- **Pastille sur l'écran de départ**, près du bouton « Lancer ma séance » : « Niveau Doux » (icône + texte, cible 48 dp). Un tap ouvre une petite feuille avec les 3 niveaux et une phrase chacun (« Doux : on bouge sans forcer », « Tonique : ça chauffe un peu », « Costaud : pour celles et ceux qui s'entraînent déjà »). L'écran de départ doit toujours tenir sans défilement à 375 × 812, bouton visible.
- **Montée automatique** : sur l'écran Bravo, sous « Mieux / Pareil », une seconde ligne facultative : « L'effort ? Trop facile · Juste bien · Trop dur ». « Trop facile » → niveau +1 (max 3), « Trop dur » → niveau −1 (min 1), avec une phrase discrète (« Prochaine séance : niveau Tonique »). Rien ne change si on ignore la ligne. Pas de ligne d'effort quand rien n'a été fait (« À bientôt ! »).
- Le lien direct `flashcoach://go` accepte `niveau=1|2|3` (facultatif, même logique que les autres paramètres).

## 2. Le générateur

- Nouveau champ `niveau: 1 | 2 | 3` sur `Exercice` ; paramètre `niveau` de la séance.
- **Cœur de séance** : candidats de niveau ≤ N ; préférence pour le niveau N, puis N−1, etc. (nouvelle clé de choix, placée après les contraintes et avant la variété). Mise en route et retour au calme inchangés (niveau 1).
- Assouplissement inchangé (intensité, effet, répétition) ; le niveau se rabat avant de répéter un exercice.
- Le rapport de couverture et le test exhaustif passent sur 5 contextes × 4 ressentis × 3 durées × **3 niveaux** ; il est normal qu'un niveau 3 au bureau se rabatte (le rapport le signale comme « rabattu », pas comme manque).

## 3. Le journal et la sauvegarde

- `EntreeJournal` gagne `niveau` (1-3) et `effort` (`'facile' | 'juste' | 'dur' | null`). Les entrées existantes sans ces champs restent valides (lues comme niveau 1, effort null).
- Supabase : migration `supabase/migrations/<date>_seances_niveau.sql` ajoutant `niveau smallint not null default 1 check (niveau between 1 and 3)` et `effort text check (effort in ('facile','juste','dur'))` ; conversion ligne ↔ entrée mise à jour.

## 4. Niveaux des exercices existants

Niveau 1 par défaut, sauf niveau 2 : `planche`, `planche-laterale`, `burpee-sans-saut`, `grimpeur`, `squats-sautes`.

## 5. Vingt nouveaux exercices (niveaux 2-3)

Tous énergie, sauts non sauf mention, transpiration moyenne sauf mention. Consignes au ton complice.

| id | Nom | Consigne | Niv. | Int. | Sol | Espace | Zone | Bilat. | Vue / accessoire |
|---|---|---|---|---|---|---|---|---|---|
| `pompe-large` | Pompes mains larges | Mains plus larges que les épaules, tu descends la poitrine entre les mains et tu pousses. | 2 | 3 | oui | sur place | haut | non | profil |
| `pompe-tempo` | Pompes au ralenti | Quatre secondes pour descendre, quatre pour remonter. Le corps reste gainé. | 2 | 3 | oui | sur place | haut | non | profil |
| `pike-pushup` | Pompes en V | Fesses en l'air, tu plies les coudes pour amener le haut de la tête vers le sol, puis tu pousses. | 2 | 3 | oui | sur place | haut | non | profil |
| `dips-chaise` | Dips sur une chaise | Mains au bord d'une chaise stable, tu plies les coudes vers l'arrière et tu remontes. | 2 | 3 | non | sur place | haut | non | profil / chaise |
| `tractions-australiennes` | Tractions sous la table | Sur le dos sous une table très solide, mains au bord, tu tires la poitrine vers la table. | 2 | 3 | oui | un peu | haut | non | profil / table |
| `superman-tirage` | Superman tirage | À plat ventre, bras décollés, tu tires les coudes vers les côtes et tu serres le dos. | 2 | 2 | oui | sur place | tronc | non | profil — transpiration faible |
| `squat-pause` | Squat avec pause | Tu descends en squat, tu tiens trois secondes en bas, tu remontes. | 2 | 3 | non | sur place | bas | non | profil |
| `squat-bulgare` | Squat bulgare | Le pied arrière posé sur une chaise, tu descends le genou arrière vers le sol. | 2 | 3 | non | un peu | bas | oui | profil / chaise |
| `planche-epaules` | Planche, toucher d'épaules | En planche sur les mains, tu touches l'épaule opposée sans bouger le bassin. | 2 | 3 | oui | sur place | tronc | non | face |
| `hollow-hold` | La banane | Sur le dos, bas du dos collé au sol, bras et jambes décollés. Tu tiens. | 2 | 3 | oui | sur place | tronc | non | profil — transpiration faible |
| `releves-jambes` | Relevés de jambes | Sur le dos, jambes tendues, tu les montes à la verticale et tu redescends sans toucher le sol. | 2 | 3 | oui | sur place | tronc | non | profil |
| `pompe-diamant` | Pompes diamant | Pouces et index forment un losange sous la poitrine, coudes près du corps. | 3 | 3 | oui | sur place | haut | non | profil |
| `pompe-archer` | Pompes archer | Mains très larges, tu descends vers une main pendant que l'autre bras reste tendu. | 3 | 3 | oui | sur place | haut | oui | face |
| `pompe-pieds-sureleves` | Pompes pieds surélevés | Les pieds sur une chaise, tu descends la poitrine vers le sol, corps bien droit. | 3 | 3 | oui | un peu | haut | non | profil / chaise |
| `pompe-hindoue` | Pompe hindoue | Fesses en l'air, tu plonges vers l'avant en frôlant le sol, puis tu remontes en cobra et tu reviens. | 3 | 3 | oui | un peu | global | non | profil |
| `pompe-spiderman` | Pompe spider-man | En descendant, un genou vient vers le coude du même côté. On alterne. | 3 | 3 | oui | sur place | haut | non | profil |
| `planche-penchee` | Planche penchée | En planche, mains au niveau du ventre, tu avances les épaules au-delà des mains et tu tiens. | 3 | 3 | oui | sur place | haut | non | profil |
| `gainage-commando` | Gainage commando | Tu passes de planche sur les coudes à planche sur les mains, une main après l'autre. | 3 | 3 | oui | sur place | tronc | non | profil |
| `fentes-sautees` | Fentes sautées | En fente, tu sautes et tu changes de jambe en l'air, atterrissage souple. | 3 | 3 | non | un peu | bas | non | profil — sauts oui, transpiration élevée |
| `burpee-complet` | Burpee complet | Planche, pompe, pieds ramenés, saut bras en l'air. À ton rythme. | 3 | 3 | oui | un peu | global | non | profil — sauts oui, transpiration élevée |

Note : `tractions-australiennes` demande une table très solide ; la consigne le dit et l'exercice n'est proposé qu'à la maison (un peu de place, tenue sport).

## 6. Poses (Codex)

Poses des 20 exercices, mêmes règles que le contenu réel (2-3 clés, gestes lisibles sans texte, poses crédibles, épaules intégrées au buste). Nouvel accessoire `table` (plateau et pieds sobres, style du mur) ; `chaise` existe.

## 7. Tests

- Générateur : niveau N n'utilise jamais un exercice de niveau > N ; préfère le niveau N quand il existe ; rabat sans jamais violer une contrainte ; test exhaustif sur les 3 niveaux.
- Préférences : niveau lu/écrit, valeur invalide → 1.
- Bravo : ligne d'effort, montée et descente bornées, pas de ligne si rien fait.
- Départ : pastille présente, niveau 1 par défaut, changement mémorisé, écran tenant sans défilement.
- Journal et synchro : anciennes entrées valides, nouveaux champs envoyés et restaurés.
- Couverture : niveaux 2 et 3 complets à la maison, au réveil et dehors en 5 minutes ; rabattements signalés ailleurs.

## Lots

1. Données et générateur (champ `niveau`, préférence, couverture, test exhaustif) + niveaux des existants.
2. Écrans et stockage (pastille, feuille, ligne d'effort sur Bravo, préférences, journal, synchro, migration, lien direct).
3. Les 20 exercices au catalogue (sous-agent) et leurs poses (Codex, en parallèle).

## Hors périmètre

Format séries × répétitions et repos longs ; séances ciblées par groupe musculaire (possible plus tard en Premium) ; changement des durées 3/5/10.
