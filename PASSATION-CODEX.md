# Passation à Codex — Flash Coach

Rédigé le 2026-10-22 par Claude pour que Codex reprenne le projet avec Mattia. À lire en entier avant de toucher au code.

## 1. Le produit en une minute

Flash Coach : app mobile (Android d'abord) de séances de sport **au poids du corps**, à la maison. Depuis le 2026-10-23, **l'objectif d'abord** : **Brûler des calories / Prise de masse / Étirements**, intensité **Léger / Moyen / Lourd** (= niveaux 1-3, clé `flashcoach.niveau`), durée **5 · 10 · 15 · 30 min** (15 et 30 en tours). Contextes et ressenti ont été retirés de l'interface. Prise de masse joue un des **13 circuits** (familles en rotation d'après le journal, tours 1/2/3/6) ; la page « Séances prêtes » reste pour choisir un circuit précis.

Règles produit non négociables (voir `PRODUCT.md`) :
- **Zéro configuration** : aucune question avant la 1re séance ; écran de départ unique, tout présélectionné, **un tap** pour lancer ; l'écran de départ tient **sans défilement** à 375 × 812 et 360 × 740, en-tête **empilé** (logo au-dessus, « Flash Coach » dessous) — choix explicite de Mattia.
- Ton complice, jamais culpabilisant ; jamais de promesse de perte de poids ni de « prise de masse garantie ».
- **Figurine réaliste** : épaules intégrées au buste, **aucune « boule » aux articulations** (plainte explicite de Mattia) ; chaque geste compréhensible sans lire la consigne.
- Jamais de texte blanc sur l'orange (noir sur orange).
- Local d'abord : rien ne bloque une séance ; la synchro Supabase absorbe ses erreurs.

Documents de référence : `PRODUCT.md`, `DESIGN.md` (+ `.impeccable/design.json`), pages Notion « Positionnement » et « Fiche technique » (Business › Projet › Flash coach).

## 2. Stack et commandes

- Expo SDK 58, Expo Router 58 (routes dans `mobile/app/`, **jamais** `src/app`), React Native 0.88, React 19.3, TypeScript strict, Jest via jest-expo, React Native Testing Library 14 (**`render`/`fireEvent`/`renderRouter` asynchrones : toujours `await`**), react-native-svg, AsyncStorage, `@supabase/supabase-js` 2.118.
- Depuis `mobile/` :
  - `npx jest` — suite complète (1258 tests au 2026-10-23, branche `objectifs`)
  - `npm run typecheck`
  - `npm run lint` (sous Windows, le wrapper `expo lint` peut ne jamais rendre la main : utiliser alors `node node_modules/eslint/bin/eslint.js .` et le signaler)
  - `npm run couverture` — rapport de couverture du catalogue : par objectif × intensité × durée ; manques connus et acceptés : cœur calories 10 min en Léger (7 cardios doux sur 8) et Lourd (6/8) — le générateur répète alors un cardio, jamais d'intensité au-dessus du choix
  - `npx expo start` — serveur pour Expo Go (Mattia teste sur son Android : `exp://192.168.1.2:8081`). **Expo Go du Play Store est trop ancien pour le SDK 58** : APK officielle 58.0.4 sur le GitHub d'Expo (`expo-go-releases`).
- Aperçu web pour vérifier une mise en page : `npx expo start --web --port 8090` (laisser le 8081 à Mattia).

## 3. Organisation du code (mobile/src)

| Dossier | Rôle |
|---|---|
| `catalogue/` | 76 exercices (`exercices.ts`), types (`Niveau`, `NOMS_NIVEAU`…), contextes, validation |
| `generateur/` | générateur de séance à règles (pur, graine) : filtres stricts (jamais assouplis), niveaux d'assouplissement 0-4, appariement biparti, couverture par niveau et rabattements |
| `seance/` | machine à états du lecteur (`lecteur.ts`), hook `useLecteurSeance`, paramètres d'URL, lancement partagé (`lancement.ts`), affichage (côtés, libellés) |
| `circuits/` | les 13 circuits (données), matériel, construction pure `construireSeanceCircuit` |
| `journal/` | journal local (clé `flashcoach.journal.v1`, 500 max, opérations en série), fusion |
| `synchro/` | file d'envoi, moteur à vol unique, serveur Supabase / mémoire, instance, `useSynchro` |
| `compte/` | session anonyme Supabase, liaison par code e-mail |
| `preferences/` | choix (`flashcoach.choix.v2` : objectif, durée), niveau (`flashcoach.niveau`), sans meuble (`flashcoach.sansMateriel`) |
| `illustrations/` | figurine : squelette 2D, `poses.ts` (une entrée par exercice), dessin SVG, accessoires mur / chaise / table |
| `ui/` | thème (`COULEURS`, `TYPO`, `ELEVATION`, `CIBLE_MIN`), boutons, icônes dessinées, logo |

Écrans (`mobile/app/`) : `index` (départ), `seance`, `bravo`, `journal`, `sauvegarde`, `go` (lien direct `flashcoach://go?objectif=…&intensite=…&duree=…`), `circuits` (liste), `circuit/[id]` (détail). Supabase : `supabase/migrations/` (4 migrations, à appliquer dans l'ordre ; la 4e `20261023120000_seances_objectif.sql` ajoute `objectif`) et le guide `docs/supabase.md`.

## 4. Conventions

- Identifiants, commentaires et textes **en français** ; apostrophes typographiques (’) et espaces insécables comme le code existant.
- **TDD** : test qui échoue d'abord, puis le code. Ne jamais affaiblir un test existant (adapter une valeur attendue à graine fixe est permis, le dire).
- **Fins de ligne** : certains fichiers sont en CRLF, d'autres en LF — garder celles de chaque fichier (sinon le diff devient une réécriture entière).
- Commits : messages en français (`feat:`, `fix:`, `docs:`, `test:`), terminés par la ligne `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` quand Claude a contribué ; identité git locale déjà configurée (Mattia). **Ne jamais committer** `.claude/`, `.superpowers/`, `.impeccable/`, `mobile/.env.local`.
- Nouvelle fonctionnalité : spec dans `docs/superpowers/specs/`, plan en ~3 lots dans `docs/superpowers/plans/`, une revue par lot et une revue finale (mode « économe » voulu par Mattia).
- Travail en parallèle : un worktree **à l'intérieur** du projet (`.worktrees/<nom>`, ignoré via `.git/info/exclude`) — ton bac à sable n'écrit que dans `C:\dev\projects\FlashCoach`. Ton bac à sable refuse parfois de créer `.git/worktrees/*/index.lock` : dans ce cas, laisse les changements non commités et demande à Mattia de committer (ou travaille dans le checkout principal).

## 5. État au moment de la passation

- `main` (poussée sur GitHub `origin` = https://github.com/Pompomjr/FlashCoach) : jalons 1 à 4 (générateur, écrans, journal, Supabase), design, contenu réel (50 exercices), **niveaux** Doux/Tonique/Costaud (pastille au départ, « L'effort ? » sur Bravo), lien direct.
- **Séances prêtes en circuit** (fusionnées dans `main` le 2026-10-22, d234a36) : 13 circuits, 6 nouveaux exercices et leurs poses, écrans liste/détail, séance de circuit, journal et Supabase ; trois lots revus, revue finale et ses corrections validées (1315 tests verts). Branches et worktree supprimés.
- Le registre de ce chantier (décisions, mineurs différés, revues) : `.superpowers/sdd/2026-10-22-circuits/progress.md`.

## 6. Prochaines étapes (dans l'ordre)

1. **Refonte par objectif** : fusionnée et poussée le 2026-10-23 (`main` 8910abd). Avant d'installer cette version avec Supabase branché : appliquer la migration `20261023120000_seances_objectif.sql`, sinon l'envoi échoue (les séances restent en file, rien n'est perdu). Petites choses à faire valider par Mattia : icône « muscle », slogan « 5 minutes » encore présent, ajout de 1-2 exercices cardio pour combler la couverture.
2. **Nettoyage** : code mort `ICONE_RESSENTI`, variante `verrouille` de `CarteOption`, `acces.ts` ; cycle d'import `journal.ts ↔ fusion.ts` (avertissement Metro) ; la rotation des familles avance même après une séance de masse abandonnée tout de suite.
3. **Nouvel habillage de la figurine** — décidé par Mattia le 2026-10-23 : **en code** (pas de bibliothèque), confié à Codex. Tout est dans `docs/figurine-habillage.md` (design, étapes, consigne à coller, liste des 76 exercices avec la vue conseillée). Première étape seulement : galerie avant/après de 5 exercices à montrer à Mattia. Mattia peut aussi essayer une IA d'illustration en ligne (Recraft, ChatGPT) avec le §3 de ce document.
4. **Brancher le vrai Supabase** avec Mattia (`docs/supabase.md`, 4 migrations dans l'ordre, `mobile/.env.local`), puis vérifier sur téléphone sauvegarde, liaison par code e-mail et restauration.
5. Jalons suivants : **5** RevenueCat (découpage gratuit / Premium à redéfinir autour des objectifs), **6** PostHog + RGPD, **7** contenu final et test fermé Play Store (12 testeurs × 14 jours).
6. **Idées en attente** (seulement si Mattia le demande) : phrases de motivation de grands sportifs sur l'écran de fin ; variantes lestées ; suivi des répétitions ; programme sur plusieurs semaines.

Fait le 2026-10-23 : bouton « Variante sans chaise / table » dans l'aperçu de la séance (`app/seance.tsx`, variantes dans `src/circuits/circuits.ts`, choix gardé toute la séance ; le journal garde l'exercice prévu). Pompe archer **de face** en cours chez Codex (brief `.superpowers/sdd/archer/brief.md`, Codex). Aperçu web de vérification : configuration `flashcoach-web-verif` (port 8090) dans `.claude/launch.json`.
Retouches de la figurine (pont sur une jambe selon le côté, bird-dog, pompes large/tempo, pompes sur les genoux) : faites et fusionnées le 2026-10-23.
Revues : Mattia les trouve coûteuses — Sonnet par défaut, diff sans tests, points ciblés, une revue finale.

## 7. Décisions déjà tranchées (à ne pas rouvrir sans Mattia)

- Expo (pas FlutterFlow) ; illustrations dessinées en code (pas Lottie) ; catalogue embarqué mis à jour par EAS Update (pas de catalogue distant).
- Niveau stocké à part (`flashcoach.niveau`) ; « Trop facile » / « Trop dur » ajustent le niveau **enregistré** (même après un circuit ou un lien direct).
- Une phase calme (mise en route, retour au calme, cœur raide/stressé) ne reçoit jamais d'exercice d'énergie avant le dernier recours.
- Circuits : 30 s par poste, 10 s d'aperçu, repos entre tours = transition de 100 s (90 s + 10 s d'aperçu), Doux 3 tours (16 min), Tonique 4 (≈ 21 min), Costaud 4 + 5e facultatif (≈ 26 min) ; postes d'un même muscle espacés ; un poste par côté pour l'unilatéral ; alternative sans meuble partout où un meuble est demandé ; « Cardio athlétique » au niveau Tonique.
- Les choix de contenu sont appuyés sur des études (sources dans `docs/superpowers/specs/2026-10-22-circuits-proposition.md` et `.superpowers/sdd/circuits/recherche-codex.md`).

## 8. Points d'attention connus

- La clé Supabase est `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (pas `…_ANON_KEY`) ; sans elle, l'app est 100 % locale et le lien de sauvegarde est masqué.
- Le client envoie `niveau`, `effort` et `circuit_id` : la synchro échoue tant que les migrations correspondantes ne sont pas appliquées (comportement attendu, documenté).
- Mineur différé : pas de test automatique de « pas de défilement » de l'écran de départ (vérification manuelle au navigateur).
- Décisions en attente de Mattia : garder ou non `mobile/LICENSE` (MIT d'Expo) et `mobile/.claude/settings.json`.
