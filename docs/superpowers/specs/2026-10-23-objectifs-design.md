# Écran de départ par objectif — spec

Décidé avec Mattia le 2026-10-22, d'après sa maquette (« Choisir options » : Brûler des calories / Se renforcer / Mobilité-Étirements ; « Temps disponible » ; « Lancer ma séance »). Remplace le parcours « contexte + ressenti » : **le positionnement passe de « le contexte d'abord » à « l'objectif d'abord »** (page Notion à mettre à jour avec l'accord de Mattia).

## Décisions

| Sujet | Décision |
|---|---|
| Objectifs | **Brûler des calories**, **Prise de masse**, **Étirements** (« pour ceux qui se sentent juste un peu raides ») |
| Intensité | **Léger / Moyen / Lourd** — remplace les niveaux Doux / Tonique / Costaud (même mécanique, mêmes valeurs 1 / 2 / 3, mêmes exercices) |
| Durées | **5, 10, 15, 30 min** ; 3 min supprimée |
| Contextes | **Supprimés** : toute séance se fait « à la maison » (tenue de sport, bruit normal, un peu de place, sol autorisé) |
| Ressenti | **Supprimé** : l'objectif le remplace |
| Circuits | Les 13 circuits **nourrissent Prise de masse** ; l'icône « Séances prêtes » reste pour choisir un circuit précis |
| Premium | Tout gratuit pour l'instant ; le découpage gratuit / Premium sera décidé au jalon 5 (RevenueCat) |

## 1. Écran de départ

- En-tête inchangé (logo au-dessus, « Flash Coach » dessous, icônes « Séances prêtes » à gauche et « Mon journal » à droite).
- **« Ton objectif »** : 3 cartes pleine largeur empilées (icône dessinée + libellé) : flamme « Brûler des calories », biceps « Prise de masse », silhouette qui s'étire « Étirements ».
- **« Intensité »** : 3 boutons sur une ligne : Léger · Moyen · Lourd (remplace la pastille de niveau et sa feuille).
- **« Temps disponible »** : 4 boutons sur une ligne : 5 · 10 · 15 · 30 min.
- Bouton « Lancer ma séance ». Tout présélectionné (derniers choix ; au tout premier lancement : Brûler des calories, Léger, 10 min) : **un tap pour lancer**, zéro configuration. Tient sans défilement à 375 × 812 et 360 × 740.
- Aucune notion de Premium ni de cadenas sur cet écran pour l'instant.

## 2. Ce que produit chaque objectif

Contraintes fixes « maison » pour tout le catalogue. Nouveau champ d'exercice `objectifs: Objectif[]` (`'calories' | 'masse' | 'etirements'`, au moins un) qui remplace le rôle du ressenti :
- `etirements` : exercices de mobilité et de détente ;
- `calories` : exercices cardio (sauts, déplacements, rythme : jumping jacks, burpees, montées de genoux, patineur, talons-fesses, squats sautés, grimpeur, boxe, pas chassés…) ;
- `masse` : renforcement (pompes et variantes, squats, fentes, dips, tractions sous la table, gainages, ponts, superman…).
Un exercice peut avoir deux objectifs (ex. burpee : calories + masse).

**Brûler des calories** et **Étirements** : générés par le générateur actuel, avec pour cible du cœur l'objectif choisi et une intensité selon le niveau : Léger 1-2, Moyen 2-3, Lourd 3 (Étirements : intensité 1-2 quel que soit le niveau, le niveau ne fait que plafonner la difficulté des exercices). Mise en route et retour au calme comme aujourd'hui (mobilité / détente).

**Prise de masse** : joue un **circuit** (format validé par les études : 30 s par poste, 10 s d'aperçu, repos entre les tours) au niveau choisi, en faisant tourner les familles d'une séance à l'autre (full body → poussée → jambes → dos → full body…, d'après la dernière séance de masse du journal). Nombre de tours selon la durée : 5 min → 1 tour, 10 min → 2, 15 min → 3, 30 min → 6 (durées réelles ≈ 6, 11, 16 et 31 min, affichées telles quelles). L'option « sans meuble » de la page circuits s'applique.

**Structure des durées** (calories et étirements) : 5 et 10 min comme aujourd'hui ; 15 et 30 min **en tours** : un cœur de 5 exercices répété (15 min = 2 tours, 30 min = 4 tours) avec 1 min de repos entre les tours, mise en route et retour au calme allongés pour tomber à la seconde près sur 900 et 1800 s.

## 3. Ce qui disparaît ou change

- Écrans et code des **contextes** et du **ressenti** retirés de l'interface (les contextes restent en interne comme une seule contrainte « maison »). Le rapport de couverture devient : objectif × intensité × durée.
- **Lien direct** `flashcoach://go?objectif=calories|masse|etirements&intensite=1|2|3&duree=5|10|15|30` (anciens paramètres ignorés sans erreur).
- **Bravo** : « L'effort ? Trop facile / Juste bien / Trop dur » ajuste l'intensité présélectionnée (Léger ↔ Moyen ↔ Lourd), comme aujourd'hui pour le niveau.
- **Journal** : nouvelle entrée = objectif + intensité + durée (ligne « Prise de masse · Moyen · 16 min ») ; **les anciennes entrées restent lisibles** (contexte et ressenti affichés comme avant). Supabase : migration ajoutant `objectif text` (et `contexte_id` / `ressenti` deviennent facultatifs).
- Préférences : clé de choix versionnée (`flashcoach.choix.v2` : objectif, intensité, durée) ; l'ancienne est ignorée.
- `PRODUCT.md` et `DESIGN.md` mis à jour (positionnement, écran de départ).

## 4. Tests

- Catalogue : chaque exercice a au moins un objectif ; répartition attendue écrite en dur ; couverture complète pour chaque objectif × intensité × durée (sinon le rapport liste les manques).
- Générateur : calories et étirements à 5, 10, 15, 30 min tombent à la seconde près ; jamais un exercice d'intensité/niveau au-dessus de la sélection ; étirements sans exercice d'énergie.
- Prise de masse : nombre de tours par durée, rotation des familles d'après le journal, niveau respecté, « sans meuble » appliqué.
- Écrans : départ (3 lignes, présélection, un tap, pas de défilement), Bravo (ajustement d'intensité), journal (anciennes et nouvelles entrées), lien direct.

## Hors périmètre

Découpage Premium (jalon 5) ; phrases de motivation (plus tard) ; mise à jour de la page Notion (sur accord).
