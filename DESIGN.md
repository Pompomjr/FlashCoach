---
name: Flash Coach
description: "Un coach de poche qui montre le geste : une figurine orange articulée, dans une interface bleu nuit calme."
colors:
  fond-nuit: "#22344A"
  carte-bleue: "#3A506B"
  carte-claire: "#EDF2F7"
  orange-action: "#F97316"
  orange-profond: "#C2410C"
  texte-clair: "#EDF2F7"
  texte-discret: "#CBD5E0"
  texte-sombre: "#2D3748"
  texte-sur-orange: "#000000"
  cheveux: "#9A3412"
  mur: "#CBD5E1"
  arete-mur: "#94A3B8"
typography:
  display-large:
    fontFamily: "BarlowCondensed_800ExtraBold, system-ui, sans-serif"
    fontSize: "57px"
    fontWeight: 800
    lineHeight: "64px"
  display-small:
    fontFamily: "BarlowCondensed_800ExtraBold, system-ui, sans-serif"
    fontSize: "36px"
    fontWeight: 800
    lineHeight: "44px"
  headline-medium:
    fontFamily: "BarlowCondensed_700Bold, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: "36px"
  headline-small:
    fontFamily: "BarlowCondensed_700Bold, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: "32px"
  title-large:
    fontFamily: "system-ui (Roboto sur Android)"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: "28px"
  title-medium:
    fontFamily: "system-ui (Roboto sur Android)"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: "24px"
  body-large:
    fontFamily: "system-ui (Roboto sur Android)"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
  body-medium:
    fontFamily: "system-ui (Roboto sur Android)"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
  label-large:
    fontFamily: "system-ui (Roboto sur Android)"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: "24px"
rounded:
  carte: "16px"
  pastille: "50%"
spacing:
  espace: "16px"
  gap-grille: "10px"
  gap-pile: "12px"
  cible-min: "48px"
components:
  bouton-principal:
    backgroundColor: "{colors.orange-action}"
    textColor: "{colors.texte-sur-orange}"
    typography: "{typography.title-medium}"
    rounded: "{rounded.carte}"
    padding: "14px 20px"
    height: "48px"
  bouton-secondaire:
    backgroundColor: "{colors.carte-claire}"
    textColor: "{colors.texte-sombre}"
    typography: "{typography.title-medium}"
    rounded: "{rounded.carte}"
    padding: "14px 20px"
    height: "48px"
  carte-option:
    backgroundColor: "{colors.carte-bleue}"
    textColor: "{colors.texte-clair}"
    typography: "{typography.label-large}"
    rounded: "{rounded.carte}"
    padding: "12px 16px"
    height: "48px"
  carte-option-selectionnee:
    backgroundColor: "{colors.orange-action}"
    textColor: "{colors.texte-sur-orange}"
    typography: "{typography.label-large}"
    rounded: "{rounded.carte}"
    padding: "12px 16px"
    height: "48px"
  carte-option-verrouillee:
    backgroundColor: "{colors.carte-bleue}"
    textColor: "{colors.texte-discret}"
    typography: "{typography.label-large}"
    rounded: "{rounded.carte}"
    padding: "12px 16px"
    height: "48px"
  carte-seance:
    backgroundColor: "{colors.carte-claire}"
    textColor: "{colors.texte-sombre}"
    rounded: "{rounded.carte}"
    padding: "16px"
  ligne-journal:
    backgroundColor: "{colors.carte-bleue}"
    textColor: "{colors.texte-clair}"
    typography: "{typography.label-large}"
    rounded: "{rounded.carte}"
    padding: "16px"
  pastille-orange:
    backgroundColor: "{colors.orange-action}"
    textColor: "{colors.texte-sur-orange}"
    rounded: "{rounded.pastille}"
    size: "32px"
  coche-bravo:
    backgroundColor: "{colors.orange-action}"
    textColor: "{colors.texte-sur-orange}"
    rounded: "{rounded.pastille}"
    size: "96px"
---

# Design System: Flash Coach

> Documenté d'après le code livré (`mobile/src/ui/theme.ts`, composants, écrans), pas d'après les intentions. Vérifié uniquement dans l'aperçu web et sur captures téléphone ; jamais sur émulateur ou appareil Android (voir « Limites connues » en fin de fichier). Cible : Android d'abord (Material 3), iOS plus tard avec le même code.

## Overview

**Creative North Star: "Le Coach de Poche"**

Une interface calme au service d'un personnage. Le fond bleu nuit profond (#22344A) s'efface ; les surfaces bleues (#3A506B) sont plus claires que lui, comme l'élévation Material en thème sombre ; l'orange (#F97316) est rare et sert deux choses seulement : l'action et la figurine. La figurine orange articulée, dessinée en code et animée par poses clés, montre le geste au lieu de le décrire : c'est la signature du produit. Autour d'elle, tout est sobre, arrondi et lisible d'une main, debout, écran posé.

La personnalité est complice et encourageante, jamais sportive-agressive : pas de liste de cartes grises, pas de photos de salle. Les titres et chiffres (marque, titres d'écran, minuteur) sont en Barlow Condensed, étroit et franc, qui donne l'énergie ; tout le reste, libellés, boutons, consignes, reste en police système aux rôles Material 3, pour la lisibilité et le respect du réglage de taille de texte du téléphone. Les icônes sont dessinées d'un trait de 2 px, sans emoji. Le texte sur orange est toujours noir, jamais blanc (contraste insuffisant, environ 2,8:1).

**Key Characteristics:**
- Fond bleu nuit, cartes bleues plus claires que le fond, une seule carte claire (#EDF2F7) : celle de la séance, qui porte la figurine.
- Orange réservé à l'action (bouton principal, option choisie, coche Bravo, pastilles) et à la figurine.
- Texte noir sur orange, texte clair sur bleu, texte sombre sur carte claire ; aucun texte blanc pur.
- Un seul rayon pour tout ce qui se touche (16 px) ; disques complets pour les pastilles et les médaillons.
- Cible tactile minimale de 48 dp partout.
- Profondeur par élévation Material douce, jamais de contour dur ni de halo centré.
- Mouvement discret et respectueux de « réduire les animations ».

## Colors

Une palette de nuit : un bleu profond, un bleu de surface légèrement plus clair, un clair froid pour la séance, un orange vif pour l'action. Les valeurs vivent dans `COULEURS` (`mobile/src/ui/theme.ts`) ; les noms ci-dessous sont les clés du frontmatter.

### Primary
- **Orange Action** (`orange-action`, #F97316) : bouton principal (« Lancer ma séance », « Passer », « Et on est repartis »), carte d'option sélectionnée, coche et confettis de Bravo, pastilles d'icône du journal, membres proches de la figurine. Toujours sous du texte ou une icône noirs.
- **Orange Profond** (`orange-profond`, #C2410C) : profondeur de la figurine (membres éloignés), confettis. Jamais pour du texte.

### Neutral
- **Fond Nuit** (`fond-nuit`, #22344A) : fond de tous les écrans, du fond d'application (`backgroundColor` d'`app.json`), de l'icône adaptative et de l'écran de démarrage.
- **Carte Bleue** (`carte-bleue`, #3A506B) : cartes d'option non sélectionnées, résumé et lignes du journal. Plus claire que le fond : la hiérarchie se lit par la clarté, pas par un contour.
- **Carte Claire** (`carte-claire`, #EDF2F7) : carte de la séance (figurine, nom, consigne), bouton secondaire, médaillon du journal vide, liseré de séparation sous le bras proche de la figurine.
- **Texte Clair** (`texte-clair`, #EDF2F7) : texte courant et titres sur fond nuit et sur carte bleue (11,2:1 sur le fond, 7,3:1 sur la carte).
- **Texte Discret** (`texte-discret`, #CBD5E0) : slogan, phase, détails, cartes verrouillées (8,5:1 sur le fond, 5,6:1 sur la carte).
- **Texte Sombre** (`texte-sombre`, #2D3748) : texte sur carte claire et bouton secondaire (10,6:1).
- **Texte sur Orange** (`texte-sur-orange`, #000000) : tout ce qui se pose sur l'orange (7,5:1).

### Illustration (jamais pour du texte)
- **Cheveux** (`cheveux`, #9A3412), **Mur** (`mur`, #CBD5E1) et **Arête de mur** (`arete-mur`, #94A3B8) : décor et détails de la figurine (cheveux, mur des pompes).

### Named Rules
**The Black-On-Orange Rule.** Sur l'orange, le texte et les icônes sont noirs (#000000), sans exception. Le blanc sur l'orange (environ 2,8:1) est illisible et interdit.
**The Orange-Needs-A-Disc Rule.** L'orange sur la carte bleue ne fait que 2,95:1 : il ne porte jamais seul une information. Une icône orange se pose sur une pastille orange avec glyphe noir, jamais l'inverse.
**The Rare Orange Rule.** L'orange appartient à l'action et à la figurine. Un écran n'a qu'un ou deux foyers orange ; un résumé, un titre ou un décor ne le prennent pas.

## Typography

**Display Font:** Barlow Condensed, graisses 700 et 800 (chargées par `useFonts` dans `app/_layout.tsx`, repli sur la police système)
**Body Font:** police système (Roboto sur Android) aux rôles Material 3
**Label/Mono Font:** police système ; le minuteur utilise `fontVariant: ['tabular-nums']`

**Character:** une capitale étroite et musclée pour les moments qui comptent (marque, titre d'écran, minuteur), portée par un texte courant neutre et familier de la plateforme. La graisse des rôles d'affichage vient du fichier de police (pas de `fontWeight`, pour éviter le faux gras). Tailles en sp, donc suivant le réglage du système.

### Hierarchy
- **Display Large** (Barlow Condensed ExtraBold 800, 57/64) : minuteur de séance, centré, chiffres tabulaires.
- **Display Small** (Barlow Condensed ExtraBold 800, 36/44) : nom « Flash Coach » (écran haut) et titre « Bravo ! ».
- **Headline Medium** (Barlow Condensed Bold 700, 28/36) : nom de l'exercice, « Mon journal », marque en mode compact.
- **Headline Small** (Barlow Condensed Bold 700, 24/32) : titres de section de l'écran de départ (« Où es-tu ? », « Comment tu te sens ? », « Combien de temps ? »).
- **Title Large** (système 700, 22/28) : défini dans le thème, non utilisé par les écrans actuels.
- **Title Medium** (système 700, 18/24) : libellé des boutons, compteur de séance, résumé du journal, question de Bravo.
- **Body Large** (système 400, 16/24) : consigne, slogan, phase, messages.
- **Body Medium** (système 400, 14/20) : dates et détails du journal, slogan en mode compact.
- **Label Large** (système 600, 16/24) : libellés des cartes d'option, ligne principale du journal.

### Named Rules
**The Display-Only-For-Moments Rule.** Barlow Condensed ne sert qu'à la marque, aux titres d'écran et de section, au nom d'exercice, au minuteur et aux grands chiffres. Libellés, boutons et texte courant restent en police système.
**The Sentence-Case Rule.** Les textes sont en casse de phrase, sans capitales forcées ni sur-titres au-dessus d'un titre.

## Layout

Écran unique en colonne, une main, portrait uniquement. Marge d'écran de 16 px (`ESPACE`). Rythme vertical par `gap` : 12 px entre blocs (départ, séance), 10 px dans les grilles d'options, 8 px et moins dans les groupes serrés (icône + texte, en-tête). Départ : en-tête centré (logo au-dessus, nom dessous, slogan, lien journal hors flux à droite), puis trois sections : contextes en grille 2 colonnes (`flexBasis: 47%`), ressentis en grille 2 colonnes, durées en trois cartes égales sur une ligne ; le bouton « Lancer ma séance » est fixe en bas, hors du défilement. En dessous de 780 dp de hauteur, l'en-tête passe en version compacte (logo 48 au lieu de 76, nom en Headline Medium) pour que tout tienne sans défilement.

Séance : barre haute (retour 48 × 48, phase et compteur), carte claire qui absorbe toute la hauteur libre (`flex: 1`, la zone de figurine est mesurée par `onLayout`, environ 45 % de la hauteur de l'écran), minuteur centré, place réservée de 24 dp pour « En pause » (la figurine ne saute pas), puis les actions en bas : « Pause » seul sur sa ligne, « Passer » et « Terminer » côte à côte. Bravo : contenu centré verticalement, bouton « Et on est repartis » en bas. Journal : en-tête retour + titre, puis liste en cartes séparées de 12 px ; état vide centré avec la figurine au repos dans un médaillon de 176 px.

Seules les zones sûres (`SafeAreaView`) et la hauteur compacte adaptent la mise en page ; il n'y a pas de points de rupture de largeur ni de grille tablette.

## Elevation & Depth

Hybride : la hiérarchie première est tonale (fond < carte bleue < carte claire / orange), l'ombre confirme la séparation. Deux niveaux Material, choisis par plateforme pour éviter la double ombre : sur Android, `elevation` natif (2 et 5) ; sur web et iOS, `boxShadow`. Les opacités sont plus fortes que les valeurs Material, car une ombre noire légère disparaît sur le bleu nuit.

### Shadow Vocabulary
- **Niveau 1** (`elevation: 2` sur Android ; `boxShadow: 0px 1px 3px rgba(0,0,0,0.40), 0px 2px 6px 1px rgba(0,0,0,0.22)` ailleurs) : cartes d'option au repos, carte de séance, lignes et résumé du journal, médaillon.
- **Niveau 2** (`elevation: 5` sur Android ; `boxShadow: 0px 2px 4px rgba(0,0,0,0.40), 0px 6px 14px 3px rgba(0,0,0,0.28)` ailleurs) : carte d'option sélectionnée, qui se détache du groupe.

### Named Rules
**The Soft-Down Rule.** L'ombre est décalée vers le bas et floutée, jamais un halo centré, jamais un décalage dur sans flou.
**The Tone-First Rule.** On sépare d'abord par la clarté de la surface ; l'ombre ne remplace pas ce contraste.

## Shapes

Formes très arrondies et amicales. Un seul rayon, 16 px (`RAYON`), pour boutons, cartes d'option, carte de séance, lignes et résumé du journal. Les disques (rayon 50 %) sont réservés aux petits éléments circulaires : pastilles d'icône (32 à 44 px), bouton de retour et de journal (48 × 48, ondulation circulaire), coche de Bravo (96 px), médaillon (176 px), logo. Pas de contour décoratif ; la figurine est faite de capsules effilées (épaisses à la racine, fines à l'extrémité) et de formes organiques, sans angle vif. Le logo est un disque orange portant un éclair noir franc et incliné, six sommets sur une grille de 64.

Icônes : une seule famille (`Icone`), grille 24, trait de 2 px, extrémités et jonctions arrondies, sans remplissage, décoratives (le nom accessible vient de l'élément porteur). Quinze glyphes : contextes (réveil, maison, bureau, voyage, dehors), ressentis (raide, stressé, mou, en forme), cadenas, retour (flèche Material), journal, mieux, pareil, coche.

## Components

### Boutons
- **Forme :** rayon 16 px, hauteur minimale 48 dp, padding 14 × 20, libellé Title Medium centré sur une seule ligne.
- **Principal :** fond Orange Action, texte noir. Une action dominante par écran (« Lancer ma séance », « Passer », « Et on est repartis »).
- **Secondaire :** fond Carte Claire, texte Texte Sombre (« Pause », « Terminer », « Mieux », « Pareil »).
- **États :** ondulation Material sur Android (couleur du texte à 16 % d'opacité, non débordante) ; ailleurs, léger enfoncement (échelle 0,98). Le libellé visible peut être raccourci (« Terminer ») tant que le nom accessible reste complet (« Terminer la séance »).

### Cartes d'option
Cartes bleues à icône trait + libellé Label Large, utilisées en grille 2 colonnes (contexte, ressenti) ou en trois colonnes égales (durée, sans icône).
- **Repos :** Carte Bleue, texte clair, élévation niveau 1.
- **Sélectionnée :** fond Orange Action, texte et icône noirs, élévation niveau 2 ; état annoncé aux lecteurs d'écran.
- **Verrouillée (Premium) :** texte Texte Discret, cadenas à la place de l'icône du contexte ; le toucher affiche le message « Bientôt avec Premium » sous la grille (région vive polie) au lieu d'ouvrir un écran.

### Carte de séance (composant signature)
Carte Claire, rayon 16, padding 16, élévation niveau 1. Contient la figurine en grand (zone mesurée), le nom de l'exercice (Headline Medium, Texte Sombre), le côté « gauche / droit » si besoin et la consigne (Body Large). Pendant la transition, le titre devient « À suivre : … » et la figurine reste immobile.

### Figurine (signature)
Personnage orange articulé dessiné en code (`mobile/src/illustrations/`) : un squelette en repère 200 × 200 (angles de tronc, tête, bras, hanches, genoux, chevilles), des poses clés interpolées, un cycle propre à chaque exercice (de 5 à 16 s selon l'exercice), un rendu SVG. Profondeur par la teinte : membres proches Orange Action, éloignés Orange Profond, cheveux Cheveux, œil Texte Sombre, liseré Carte Claire sous le bras proche. Dessin agrandi au maximum dans la zone, centré, sans déformation. Immobile en pause, hors animation (écran « À suivre », journal vide) ou quand « réduire les animations » est actif ; aucune frame animée avant la réponse du système.

### Logo et marque
Disque orange, éclair noir ; le composant `Marque` place le logo (76 px, 48 en compact) au-dessus de « Flash Coach » (Display Small, compact : Headline Medium), centré, lu comme un seul titre. Source unique de géométrie : `logoGeometrie.ts`, relue par le script de rendu des PNG.

### Journal
Lignes en Carte Bleue, rayon 16, élévation niveau 1 : pastille de contexte (disque Fond Nuit, icône claire) à gauche, date (Body Medium, discret), ligne principale « Contexte · Ressenti → Réponse » (Label Large), bilan (Body Medium, discret), et à droite, seulement si l'utilisateur a répondu, une pastille orange de 32 px avec glyphe noir. Le résumé en tête est aussi une Carte Bleue, avec une pastille orange de 44 px portant une icône noire. Chaque ligne est un seul élément accessible, lu en phrase.

### Bravo et célébration
Coche noire sur disque orange de 96 px, « Bravo ! » en Display Small, résumé, question « Tu te sens mieux ? » puis deux boutons secondaires (« Mieux », « Pareil ») qui laissent place à « Merci ! ». Pour une vraie séance : la coche éclot (ressort, échelle de 0,6 à 1, fondu de 180 ms), retour haptique de succès et quinze confettis discrets (Orange Action, Orange Profond, Carte Claire ; trajectoires fixes ; 1 600 ms ; une seule fois). Séance quasi vide : « À bientôt ! », apparition sobre en fondu de 300 ms, sans confettis. Avec « réduire les animations », ou si le réglage est illisible : coche immobile, ni rebond ni confettis.

### Icône d'application et démarrage
Rendus PNG du logo depuis la même géométrie, dans `mobile/assets/` : icône 1024, premier plan adaptatif (zone sûre de 66 %), fond adaptatif uni, version monochrome (disque noir, éclair évidé), image de démarrage (200 dp de large, fond #22344A), favicon 48. Le fond d'icône et de démarrage est Fond Nuit (#22344A) ; l'application est uniquement sombre (`userInterfaceStyle: "dark"`). La provenance est incrustée dans chaque PNG ; elle a été vérifiée par le scan d'embed-prompt (6 rasters, 0 manquant) au moment du lot.

## Do's and Don'ts

### Do:
- **Do** mettre le texte et les icônes en noir (#000000) sur tout fond orange.
- **Do** réserver l'orange à l'action et à la figurine ; une icône orange sur une carte bleue se pose sur une pastille orange avec glyphe noir.
- **Do** séparer les surfaces par la clarté d'abord (fond #22344A < carte #3A506B < carte claire #EDF2F7), puis par une des deux élévations du thème.
- **Do** garder le rayon 16 px pour toute surface touchable et 48 dp comme cible minimale ; disques complets pour les éléments circulaires.
- **Do** utiliser Barlow Condensed pour marque, titres, nom d'exercice et minuteur, la police système aux rôles Material 3 pour le reste, avec tailles en sp.
- **Do** dessiner toute nouvelle icône sur la grille 24, trait 2 px, extrémités arrondies, sans remplissage, depuis `traces.ts`.
- **Do** donner à chaque animation un équivalent immobile quand « réduire les animations » est actif, et une seule exécution (pas de boucle de célébration).
- **Do** écrire dans le ton de la marque : complice, positif, jamais culpabilisant (« écourtée », « Pas grave, on remet ça quand tu veux »).

### Don't:
- **Don't** mettre du blanc sur l'orange (contraste d'environ 2,8:1).
- **Don't** utiliser l'orange ou les couleurs d'illustration (cheveux, mur) pour du texte, ni l'orange seul pour porter une information sur la carte bleue.
- **Don't** utiliser d'emoji ni d'icône-glyphe de police ; les icônes sont des tracés SVG.
- **Don't** empiler les ombres natives et `boxShadow` sur Android (double ombre) : passer par `ELEVATION`.
- **Don't** forcer une graisse sur les rôles d'affichage (faux gras) ; elle vient du fichier de police.
- **Don't** écrire les noms de couleurs, tailles ou rayons en dur dans un écran : `COULEURS`, `TYPO`, `RAYON`, `ESPACE`, `CIBLE_MIN`, `ELEVATION` (`mobile/src/ui/theme.ts`).
- **Don't** remplacer la figurine par une photo ou une illustration de banque d'images, ni transformer l'écran de départ en liste de cartes grises.

## Limites connues

- Vérifié uniquement dans l'aperçu web et sur captures de téléphone (`.impeccable/review/`) ; le rendu natif Android (ombres système, ondulation, zones système, animations natives) n'a pas été vu sur émulateur ou appareil.
- Grande taille de police système non testée : `numberOfLines={1}` sur les boutons peut tronquer un libellé long.
- Les confettis n'ont pas été observés en mouvement dans les captures (Bravo capturé après leur disparition) ; la vue de face de la figurine n'est vérifiée que par le code et les tests.
- Pas de thème clair (l'application est uniquement sombre) et pas de mise en page tablette.
- Défauts portés par le build, non canonisés : la flèche textuelle « → » dans la ligne principale du journal (glyphe de texte, à ne pas étendre à d'autres libellés) ; le rôle `titleLarge` défini mais inutilisé.
