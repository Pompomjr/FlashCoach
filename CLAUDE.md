# Flash Coach — repères pour l'agent

> Ce fichier doit toujours rester **sous 100 lignes** : le détail va dans `PASSATION-CODEX.md` ou `docs/`.

App mobile Expo (Android d'abord) de séances au poids du corps : séance flash 3-10 min en un tap (contexte × ressenti × niveau) et 13 séances prêtes en circuit. **Tout l'état du projet, l'architecture, les conventions et les prochaines étapes sont dans `PASSATION-CODEX.md` : le lire avant de fouiller le code.**

## Règles produit (non négociables)
- Zéro configuration : un tap pour lancer ; l'écran de départ tient sans défilement à 375 × 812 et 360 × 740, en-tête empilé (logo au-dessus, « Flash Coach » dessous).
- Figurine réaliste : épaules fondues dans le buste, aucune « boule » aux articulations ; geste compréhensible sans texte.
- Ton complice, jamais culpabilisant ; pas de promesse de perte de poids ni de prise de masse garantie ; noir sur orange, jamais blanc.
- Local d'abord : rien ne bloque une séance ; contraintes de contexte jamais assouplies.
- Référence : `PRODUCT.md`, `DESIGN.md`, specs et plans dans `docs/superpowers/`.

## Commandes (depuis `mobile/`)
- `npx jest` · `npm run typecheck` · `npm run lint` (si bloqué sous Windows : `node node_modules/eslint/bin/eslint.js .`) · `npm run couverture` (niveau 1 = « Catalogue complet »)
- `npx expo start` pour Expo Go sur le téléphone (port 8081 réservé à Mattia ; aperçu web de vérification sur 8090)
- Ne pas relancer une suite de tests déjà verte sur un code inchangé.

## Conventions
- Expo SDK 58 / Expo Router (routes dans `mobile/app/`) / RN 0.88 / TS strict / RNTL 14 asynchrone (`await` partout).
- Français partout (identifiants, commentaires, textes ; apostrophes typographiques). TDD, ne jamais affaiblir un test.
- Garder les fins de ligne de chaque fichier (mélange CRLF / LF).
- Ne jamais committer `.claude/settings.local.json`, `.superpowers/`, `.impeccable/review/`, `mobile/.env.local`.
- Nouvelle fonctionnalité : spec → plan en ~3 lots → une revue par lot + revue finale (mode économe voulu par Mattia).
