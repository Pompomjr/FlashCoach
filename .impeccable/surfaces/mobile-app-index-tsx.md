---
version: 1
slug: "mobile-app-index-tsx"
primary_target: "mobile/app/index.tsx"
related_targets: ["mobile/app/seance.tsx","mobile/app/bravo.tsx","mobile/app/journal.tsx"]
---

# Parcours séance (départ, séance, Bravo, journal)

Mode : Operate. Visiteur : débutant peu sportif qui veut bouger quelques minutes là où il est. Tâche : lancer en un tap, suivre le geste, finir content. Contraintes : zéro configuration, Material 3 (Android d'abord), jamais de texte blanc sur l'orange, cibles 48 dp, ton complice. Référence : docs/reference/maquette-parcours-seance.png (monde incumbent à étendre, pas à remplacer).

## Direction contract

THESIS : un coach de poche qui montre le geste au lieu de le décrire. Refuse l'app de fitness en liste de cartes grises et photos de salle : ici une figurine orange articulée bouge devant toi, au milieu d'une interface calme.

OWN-WORLD : fond bleu nuit profond #22344A, cartes et surfaces en bleu #3A506B (plus claires que le fond, élévation Material douce), carte claire #EDF2F7 pour la séance, orange #F97316 réservé à l'action et à la figurine (profondeur orange foncé #C2410C), texte noir sur l'orange. Formes très arrondies. Affichage (marque, titres, minuteur) en Barlow Condensed, texte courant en police système (Roboto) aux rôles Material. Logo : éclair noir dans un disque orange, centré au-dessus du nom. Icônes dessinées d'un trait de 2 px, aucun emoji.

STORY : j'ouvre, tout est déjà choisi, je touche « Lancer ma séance » ; la figurine me montre chaque mouvement, le minuteur me guide ; Bravo célèbre avec des confettis discrets ; mon journal garde la trace.

FIRST VIEWPORT : écran de départ — logo et nom en tête, lien « Mon journal » à droite ; « Où es-tu ? » en cartes 2 colonnes ; ressentis ; durées ; gros bouton orange fixe en bas. Écran séance : carte claire avec la figurine animée en grand (≈ 45 % de la hauteur), nom et consigne dessous, minuteur, actions en bas.

FORM : extension du monde de la maquette, sans tirage de concept : dérogation assumée, l'utilisateur ayant fixé la direction (« couleurs comme la maquette », logo centré avec le nom dessous, figurine animée dessinée en code, confettis discrets) ; signature : la figurine articulée animée par poses clés ; célébration Bravo : coche qui éclot + confettis discrets ; respect de « réduire les animations ».

FINISH : unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
