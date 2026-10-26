# Flash Coach — repères pour l'agent

> Ce fichier doit toujours rester **sous 100 lignes** : le détail va dans `PASSATION-CODEX.md` ou `docs/`.

App mobile Expo (Android d'abord) de séances au poids du corps : séance en un tap (objectif Brûler des calories / Prise de masse / Étirements × intensité Léger / Moyen / Lourd × 5 · 10 · 15 · 30 min) et 13 séances prêtes en circuit (qui nourrissent Prise de masse). **Tout l'état du projet, l'architecture, les conventions et les prochaines étapes sont dans `PASSATION-CODEX.md` : le lire avant de fouiller le code.**

## Règles produit (non négociables)
- Zéro configuration : un tap pour lancer ; l'écran de départ tient sans défilement à 375 × 812 et 360 × 740, en-tête empilé (logo au-dessus, « Flash Coach » dessous).
- Figurine réaliste : épaules fondues dans le buste, aucune « boule » aux articulations ; geste compréhensible sans texte.
- Ton complice, jamais culpabilisant ; pas de promesse de perte de poids ni de prise de masse garantie ; noir sur orange, jamais blanc.
- Local d'abord : rien ne bloque une séance ; contraintes « maison » jamais assouplies ; jamais un exercice au-dessus de l'intensité ou du niveau choisis.
- Référence : `PRODUCT.md`, `DESIGN.md`, specs et plans dans `docs/superpowers/`.
- Figurine : dessinée en code (pas de bibliothèque) ; habillage « illustration plate » validé et intégré, liste des exercices dans `docs/figurine-habillage.md`. Cible : vidéos réalistes par capture de mouvement (`docs/capture-mouvement.md`), branchées exercice par exercice via `src/illustrations/videos.ts` (repli sur la figurine). Pendant l'aperçu, un bouton « Variante » remplace un exercice à chaise / table.

## Commandes (depuis `mobile/`)
- `npx jest` · `npm run typecheck` · `npm run lint` (si bloqué sous Windows : `node node_modules/eslint/bin/eslint.js .`) · `npm run couverture` (manques connus et acceptés : cœur calories 10 min en Léger 7/8 et Lourd 6/8)
- `npx expo start` pour Expo Go sur le téléphone (port 8081 réservé à Mattia ; aperçu web de vérification sur 8090)
- Ne pas relancer une suite de tests déjà verte sur un code inchangé.

## Conventions
- Expo SDK 58 / Expo Router (routes dans `mobile/app/`) / RN 0.88 / TS strict / RNTL 14 asynchrone (`await` partout).
- Français partout (identifiants, commentaires, textes ; apostrophes typographiques). TDD, ne jamais affaiblir un test.
- Garder les fins de ligne de chaque fichier (mélange CRLF / LF).
- Ne jamais committer `.claude/settings.local.json`, `.superpowers/`, `.impeccable/review/`, `mobile/.env.local`.
- Nouvelle fonctionnalité : spec → plan en ~3 lots → revues économes (Sonnet, diff sans tests, points ciblés, une revue finale) : Mattia trouve les revues coûteuses.
