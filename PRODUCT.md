# Product

<!-- impeccable:product-schema 1 -->

## Platform

android

## Users

Personnes peu ou pas sportives, souvent pressées, qui veulent bouger quelques minutes chez elles, au poids du corps, sans se préparer ni s'équiper. Elles savent ce qu'elles veulent sur le moment : se dépenser, se renforcer ou simplement s'étirer quand elles se sentent un peu raides.

## Product Purpose

Flash Coach lance en un tap une séance guidée de 5, 10, 15 ou 30 minutes selon l'objectif et l'intensité choisis. Succès : l'utilisateur lance une séance sans rien configurer, la termine, et répond « Mieux » à « Tu te sens mieux ? ».

## Positioning

L'objectif d'abord (décidé avec Mattia le 2026-10-22, remplace « le contexte d'abord ») : la séance part de « Ton objectif » (Brûler des calories, Prise de masse, Étirements), puis de l'intensité (Léger, Moyen, Lourd) et du temps disponible. Toute séance se fait à la maison (tenue de sport, bruit normal, un peu de place, sol autorisé) ; la prise de masse joue les circuits en tournant les familles d'une séance à l'autre. Promesse : « Où que tu sois, 5 minutes pour te sentir mieux. » Les apps de fitness classiques supposent une salle, une tenue et de la motivation ; Flash Coach demande seulement ce que l'on veut faire maintenant.

## Operating Context

Usage sur téléphone, souvent à une main, à la maison, écran posé ou tenu pendant l'effort. Parcours : écran de départ unique (objectif, intensité, temps disponible, tout présélectionné ; au premier lancement Brûler des calories, Léger, 10 min) → séance (minuteur, pause, passer, terminer) → Bravo (« Tu te sens mieux ? », « L'effort ? » qui ajuste l'intensité) → journal. Lien direct : `flashcoach://go?objectif=&intensite=&duree=`.

## Capabilities and Constraints

- App Expo / React Native (SDK 58), Android d'abord, iOS plus tard avec le même code ; l'aperçu web sert au développement.
- Zéro configuration : aucun écran, compte ou question avant la première séance ; lancement en un tap.
- Contraintes « maison » jamais assouplies ; jamais un exercice au-dessus de l'intensité choisie ; phases calmes (mise en route, retour au calme) et séances d'étirements sans exercice d'énergie (seule exception : le bird-dog).
- Journal local des séances (réponse « Mieux » / « Pareil ») ; Supabase prévu au jalon 4.
- Premium à redéfinir : tout est gratuit pour l'instant, aucun cadenas ; le découpage gratuit / Premium sera décidé au jalon 5 (RevenueCat).
- Catalogue actuel : 10 exercices de test ; contenu réel (40-60 exercices) au jalon 7.
- Illustrations d'exercices dessinées en code (vectoriel, style de la maquette) ; remplaçables plus tard par un pack sans toucher aux écrans.

## Brand Commitments

- Nom : Flash Coach. Slogan : « Où que tu sois, 5 minutes pour te sentir mieux. » Phrase signature : « Et on est repartis ».
- Ton : motivant, direct, positif, complice, jamais culpabilisant ; jamais « pas d'excuse » ni promesse de perte de poids ou de prise de masse garantie ; une séance non finie est « écourtée ».
- Palette de la fiche Notion : bleu #3A506B, orange #F97316, gris foncé #2D3748, gris clair #EDF2F7, noir #000000. Jamais de texte blanc sur l'orange (contraste insuffisant).
- Répartition validée par Mattia le 2026-10-18, comme la maquette : fond bleu nuit profond #22344A, cartes et surfaces en bleu #3A506B (plus claires que le fond), orange pour l'action.
- En-tête de l'écran de départ : logo centré au-dessus, « Flash Coach » en dessous, puis le slogan (choix de Mattia).
- Référence visuelle validée : docs/reference/maquette-parcours-seance.png (départ, séance, Bravo).

## Evidence on Hand

Aucun témoignage, client, chiffre d'usage ni presse : ne rien inventer. Maquette de référence dans docs/reference/. Pas encore de logo ; illustrations à dessiner en code.

## Product Principles

1. Un tap pour bouger : chaque écran ajouté avant la séance est un abandon possible.
2. L'objectif d'abord : on part de ce que la personne veut faire maintenant, et la séance s'adapte à son intensité et à son temps.
3. Se sentir mieux maintenant, pas se transformer : bénéfice immédiat, aucune pression de résultat.
4. Complice, jamais coupable : le ton accompagne, ne juge pas.

## Accessibility & Inclusion

Contrastes WCAG AA minimum ; cibles tactiles d'au moins 44 px ; libellés accessibles et annonces pour lecteurs d'écran (Android et iOS) ; formulations neutres en genre.
