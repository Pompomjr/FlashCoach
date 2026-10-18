# Product

<!-- impeccable:product-schema 1 -->

## Platform

android

## Users

Personnes peu ou pas sportives, souvent pressées, qui veulent bouger quelques minutes là où elles sont (au réveil, à la maison, au bureau, en voyage, dehors) sans se préparer ni s'équiper. Leur besoin du moment : se sentir mieux tout de suite (moins raide, moins stressé, plus réveillé), pas « faire du sport ».

## Product Purpose

Flash Coach lance en un tap une séance guidée de 3, 5 ou 10 minutes adaptée à l'endroit où l'on est et à ce que l'on ressent. Succès : l'utilisateur lance une séance sans rien configurer, la termine, et répond « Mieux » à « Tu te sens mieux ? ».

## Positioning

Le contexte d'abord : la séance part de « Où es-tu ? » et respecte des contraintes réelles (tenue de ville, silence, petit espace, pas de sol), puis du ressenti. Promesse : « Où que tu sois, 5 minutes pour te sentir mieux. » Les apps de fitness classiques supposent une salle, une tenue et de la motivation ; Flash Coach part de la situation réelle.

## Operating Context

Usage sur téléphone, souvent à une main, dans des lieux variés (chambre au réveil, bureau, chambre d'hôtel, dehors), écran posé ou tenu pendant l'effort. Parcours : écran de départ unique (tout présélectionné) → séance (minuteur, pause, passer, terminer) → Bravo (« Tu te sens mieux ? ») → journal.

## Capabilities and Constraints

- App Expo / React Native (SDK 58), Android d'abord, iOS plus tard avec le même code ; l'aperçu web sert au développement.
- Zéro configuration : aucun écran, compte ou question avant la première séance ; lancement en un tap.
- Contraintes de contexte jamais assouplies ; phases calmes (mise en route, retour au calme, cœur « raide »/« stressé ») sans exercice d'énergie sauf dernier recours.
- Journal local des séances (réponse « Mieux » / « Pareil ») ; Supabase prévu au jalon 4.
- Freemium : « Au réveil » et « À la maison » gratuits ; Bureau, Voyage, Dehors, durées 3 et 10 min et journal avant/après en Premium (paiement au jalon 5).
- Catalogue actuel : 10 exercices de test ; contenu réel (40-60 exercices) au jalon 7.
- Illustrations d'exercices dessinées en code (vectoriel, style de la maquette) ; remplaçables plus tard par un pack sans toucher aux écrans.

## Brand Commitments

- Nom : Flash Coach. Slogan : « Où que tu sois, 5 minutes pour te sentir mieux. » Phrase signature : « Et on est repartis ».
- Ton : motivant, direct, positif, complice, jamais culpabilisant ; jamais « pas d'excuse » ni promesse de perte de poids ; une séance non finie est « écourtée ».
- Palette de la fiche Notion : bleu #3A506B, orange #F97316, gris foncé #2D3748, gris clair #EDF2F7, noir #000000. Jamais de texte blanc sur l'orange (contraste insuffisant).
- Répartition validée par Mattia le 2026-10-18, comme la maquette : fond bleu nuit profond #22344A, cartes et surfaces en bleu #3A506B (plus claires que le fond), orange pour l'action.
- En-tête de l'écran de départ : logo centré au-dessus, « Flash Coach » en dessous, puis le slogan (choix de Mattia).
- Référence visuelle validée : docs/reference/maquette-parcours-seance.png (départ, séance, Bravo).

## Evidence on Hand

Aucun témoignage, client, chiffre d'usage ni presse : ne rien inventer. Maquette de référence dans docs/reference/. Pas encore de logo ; illustrations à dessiner en code.

## Product Principles

1. Un tap pour bouger : chaque écran ajouté avant la séance est un abandon possible.
2. La situation réelle d'abord : on adapte la séance au lieu, jamais l'inverse.
3. Se sentir mieux maintenant, pas se transformer : bénéfice immédiat, aucune pression de résultat.
4. Complice, jamais coupable : le ton accompagne, ne juge pas.

## Accessibility & Inclusion

Contrastes WCAG AA minimum ; cibles tactiles d'au moins 44 px ; libellés accessibles et annonces pour lecteurs d'écran (Android et iOS) ; formulations neutres en genre.
