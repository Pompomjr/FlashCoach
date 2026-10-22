# Écran de départ par objectif — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Remplacer « contexte + ressenti » par « objectif (Brûler des calories / Prise de masse / Étirements) + intensité (Léger / Moyen / Lourd) + durée (5 / 10 / 15 / 30 min) ».

**Architecture:** Le niveau existant devient l'intensité (mêmes valeurs 1-3, clé `flashcoach.niveau`, noms Léger / Moyen / Lourd). Chaque exercice reçoit `objectifs`. Le générateur cible un objectif (calories, étirements) au lieu d'un ressenti, avec des contraintes fixes « maison » et des structures 5 / 10 / 15 / 30 min (15 et 30 en tours). Prise de masse construit un circuit existant (famille en rotation, tours selon la durée). L'interface retire contextes, ressenti et pastille de niveau.

**Spec:** `docs/superpowers/specs/2026-10-23-objectifs-design.md` (binding).

## Global Constraints

- Un tap pour lancer, tout présélectionné (premier lancement : Brûler des calories, Léger, 10 min) ; l'écran de départ tient sans défilement à 375 × 812 et 360 × 740 ; en-tête empilé (logo au-dessus, « Flash Coach » dessous), icônes « Séances prêtes » (gauche) et « Mon journal » (droite) inchangées.
- Textes exacts : titres « Ton objectif », « Intensité », « Temps disponible » ; objectifs « Brûler des calories », « Prise de masse », « Étirements » ; intensités « Léger », « Moyen », « Lourd » ; durées « 5 min », « 10 min », « 15 min », « 30 min » ; bouton « Lancer ma séance ».
- Contraintes de séance fixes « maison » : `{ tenue: 'sport', bruit: 'normal', espace: 'un_peu', sol: true }`.
- Durées exactes calories / étirements : 300, 600, 900, 1800 s. Prise de masse : tours 1 / 2 / 3 / 6 pour 5 / 10 / 15 / 30 min (durée réelle = celle du circuit construit).
- Jamais un exercice de niveau au-dessus de l'intensité choisie ; étirements : aucun exercice d'énergie ; Léger cœur intensité 1-2, Moyen 2-3, Lourd 3 (calories) ; étirements 1-2.
- Anciennes entrées du journal et anciennes lignes Supabase restent lisibles ; préférences v2 `flashcoach.choix.v2` (l'ancienne clé ignorée).
- Figurine et poses inchangées. Français partout, TDD, ne jamais affaiblir un test sans raison écrite, garder les fins de ligne. `npx jest`, `npm run typecheck`, `npm run lint`, `npm run couverture` propres depuis `mobile/`. Commits terminés par `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` ; jamais `.claude/settings.local.json`, `.superpowers/`, `.impeccable/review/`.

---

### Task 1 (lot 1) : objectifs, générateur et prise de masse (logique pure)

**Files:** `mobile/src/catalogue/types.ts`, `exercices.ts`, `validation.ts` (+ tests) ; `mobile/src/generateur/*` (+ tests) ; `mobile/src/circuits/` (sélection pour la prise de masse, + tests) ; `mobile/scripts/couverture.ts`.

- [ ] **Types** : `type Objectif = 'calories' | 'masse' | 'etirements'`, `OBJECTIFS`, `NOMS_OBJECTIF` (« Brûler des calories », « Prise de masse », « Étirements ») ; `Duree = 5 | 10 | 15 | 30`, `DUREES` en conséquence (3 retiré) ; `NOMS_NIVEAU = { 1: 'Léger', 2: 'Moyen', 3: 'Lourd' }` ; `Exercice.objectifs: Objectif[]` (au moins un, validé).
- [ ] **Étiquetage des 76 exercices** (liste en dur dans un test) : `etirements` = exercices dont `effets` ne contient pas `energie` (mobilité / détente), plus `bird-dog` ; `calories` = `jumping-jacks`, `marche-genoux-hauts`, `talons-fesses`, `patineur`, `pas-chasses`, `squats-sautes`, `fentes-sautees`, `burpee-sans-saut`, `burpee-complet`, `grimpeur`, `boxe-air`, `marche-sur-place`, `genou-coude` ; `masse` = tous les autres exercices d'énergie, plus `squats-sautes`, `fentes-sautees`, `burpee-sans-saut`, `burpee-complet`, `grimpeur`, `bird-dog`, `tirage-yt`.
- [ ] **Générateur** : `ParametresSeance` remplace `contexteId` / `contraintes` / `ressenti` par `objectif: 'calories' | 'etirements'` (contraintes fixes maison en interne) ; la cible du cœur filtre `exercice.objectifs.includes(objectif)` avec les plages d'intensité de la Global Constraints ; mise en route et retour au calme inchangés (mobilité / détente) ; assouplissement et plafond de niveau inchangés ; pour `etirements`, aucun palier ne donne d'exercice d'énergie (adapter le palier 4 : rester dans les objectifs `etirements`). Structures : 5 et 10 min comme aujourd'hui ; 15 min = mise en route + 2 tours de 5 postes + repos 60 s entre les tours + retour au calme = 900 s exactement ; 30 min = 4 tours = 1800 s exactement (ajuster mise en route / retour au calme pour tomber juste) ; les blocs de tours portent `tour: { numero, total }` (même champ que les circuits) et le premier poste des tours 2+ porte le repos dans sa transition. Supprimer `STRUCTURE` de 3 min.
- [ ] **Prise de masse** (`circuits/masse.ts`) : `toursPourDuree(duree)` = 1 / 2 / 3 / 6 ; `familleSuivante(derniere: FamilleCircuit | null)` en rotation full_body → poussee → jambes → dos → full_body ; `circuitPourMasse(niveau, famille)` = le circuit de cette famille à ce niveau ; `construireSeanceMasse({ niveau, duree, famille, sansMateriel, graine })` réutilise `construireSeanceCircuit` avec le nombre de tours imposé (étendre l'option existante au lieu de `tourEnPlus`, sans changer les écrans de circuits).
- [ ] **Couverture** : analyse et rapport par objectif (calories, étirements) × intensité × durée ; le rapport du niveau 1 doit rester « Catalogue complet » (signaler sinon, sans changer les données).
- [ ] Tests (TDD) puis `npx jest`, `typecheck`, `lint`, `couverture`. Commit `feat: objectifs et durées dans le générateur`. Les écrans peuvent ne plus compiler côté types à cause du changement de `ParametresSeance` : dans ce cas, adapter `app/` au strict minimum pour que tout compile et que les tests existants d'écran passent ou soient marqués pour Task 2 (écrire lesquels dans le rapport).

### Task 2 (lot 2) : écrans, préférences, journal, Supabase

**Files:** `mobile/app/index.tsx`, `seance.tsx`, `bravo.tsx`, `go.tsx`, `journal.tsx` ; `mobile/src/preferences/*`, `mobile/src/seance/lancement.ts`, `parametres.ts` ; `mobile/src/journal/*`, `mobile/src/synchro/serveurSupabase.ts` ; `supabase/migrations/20261023120000_seances_objectif.sql` ; `docs/supabase.md`, `PRODUCT.md`, `DESIGN.md` ; icônes `flamme`, `muscle`, `etirement` dans `ui/icones/traces.ts` ; tests d'écrans.

- [ ] **Départ** : trois sections (objectif en 3 cartes pleine largeur avec icône dessinée ; intensité en 3 boutons ; durée en 4 boutons), bouton « Lancer ma séance », présélection depuis `flashcoach.choix.v2` (`{ objectif, duree }`) et `flashcoach.niveau` ; suppression des contextes, du ressenti, de la pastille de niveau et de sa feuille, et des cadenas Premium. Calories / étirements → `/seance?objectif=…&niveau=…&duree=…&graine=…&exclure=…` ; prise de masse → `/seance?circuit=<id>&tours=<n>&sansMateriel=…&graine=…` (famille suivante lue dans le journal, `sansMateriel` depuis la préférence existante).
- [ ] **Séance** : lit `objectif` ou `circuit` (+ `tours`) ; libellés de tour pour 15 / 30 min comme pour les circuits ; ancien lien sans objectif → départ.
- [ ] **Lien direct** `/go?objectif=&intensite=&duree=` (paramètres inconnus ignorés, valeurs absentes = derniers choix).
- [ ] **Bravo** : « L'effort ? » ajuste l'intensité enregistrée (Léger ↔ Moyen ↔ Lourd), texte « Prochaine séance : intensité <Nom> ».
- [ ] **Journal** : entrée `objectif: Objectif | null` (anciennes entrées : null, affichage contexte · ressenti comme avant) ; nouvelles lignes « Brûler des calories · Moyen · 10 min » ; circuits inchangés. Validation : durée 5 / 10 / 15 / 30 pour une entrée à objectif (et règles existantes pour les anciennes et les circuits).
- [ ] **Supabase** : migration ajoutant `objectif text` (contrainte sur les 3 valeurs) et rendant `contexte_id` / `ressenti` facultatifs ; conversion ligne ↔ entrée ; `docs/supabase.md` (4e migration).
- [ ] `PRODUCT.md` (positionnement « l'objectif d'abord », écran de départ, Premium à redéfinir) et `DESIGN.md` (écran de départ) mis à jour.
- [ ] Tests (TDD) ; vérification au navigateur (port 8090 ; le 8081 est à Mattia) à 375 × 812 et 360 × 740. Commit `feat: écran de départ par objectif`.
