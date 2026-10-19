# Jalon 4 — Supabase : session anonyme, sauvegarde du journal, liaison par e-mail

Validé avec Mattia le 2026-10-19. Découle de la page Notion « Fiche technique » (sections 1, 2, 3, 6, 7 et jalon 4) et de `PRODUCT.md`.

## Objectif

Sauvegarder le journal des séances dans Supabase, en arrière-plan, sans jamais rien demander avant une séance ni bloquer quoi que ce soit, et permettre de **retrouver** ce journal sur un autre téléphone grâce à une liaison facultative par code reçu par e-mail.

## Décisions de cadrage

| Décision | Choix | Raison |
|---|---|---|
| Périmètre | Session anonyme + synchronisation du journal + liaison e-mail | Une session anonyme seule ne survit pas à une désinstallation : sans liaison, la sauvegarde ne sert à personne et stocke des ressentis inutilement. |
| Catalogue distant | **Retiré du jalon 4** (écart avec la fiche) | Les illustrations sont des poses écrites en code : un exercice venu de Supabase n'aurait que la figurine de repli. Le catalogue et ses poses partiront ensemble par EAS Update. |
| Méthode de liaison | Code à 6 chiffres par e-mail | Fonctionne dans Expo Go ; Google demanderait un build de développement. Google pourra s'ajouter plus tard. |
| Projet Supabase | Coder d'abord contre un faux serveur, brancher ensuite | Mattia crée le projet (région Francfort) quand il veut ; le branchement réel est vérifié ensemble à ce moment-là. |

## Principes (non négociables)

1. **Local d'abord.** Le journal local reste la source de vérité sur le téléphone. Aucun appel réseau sur le chemin d'une séance ; aucune attente, aucun indicateur de chargement, aucune erreur réseau affichée hors de l'écran de sauvegarde.
2. **Zéro configuration.** Rien n'est demandé avant la première séance. La session anonyme est créée en silence. La liaison n'est proposée que depuis le journal, par un lien discret.
3. **Sans configuration Supabase, l'app est exactement celle d'aujourd'hui.** Si `EXPO_PUBLIC_SUPABASE_URL` ou `EXPO_PUBLIC_SUPABASE_ANON_KEY` manque, aucun client n'est créé, la synchro ne fait rien, le lien de sauvegarde est masqué. Les tests existants restent verts sans modification de leur intention.
4. **Seule la clé publique (anon) est dans l'app**, jamais la clé admin (`service_role`).
5. **Minimum de données** (le ressenti peut être vu comme une donnée de santé) : uniquement les champs actuels du journal, aucun identifiant d'appareil, aucune donnée de localisation.

## Architecture

```
app/ (écrans)                    src/compte/                 src/synchro/
  _layout.tsx  ── démarrage ──▶ session.ts ──────────────▶ declencheurs.ts
  seance.tsx   ── fin ────────────────────────────────────▶   │
  bravo.tsx    ── réponse ────────────────────────────────▶   ▼
  journal.tsx  ── lien ──▶ sauvegarde.tsx                  synchro.ts ──▶ ServeurJournal
                              │                              │   ▲          ├─ serveurSupabase.ts
                              ▼                              ▼   │          └─ serveurMemoire.ts (tests)
                          liaison.ts ── restauration ──▶ fusion.ts
src/journal/journal.ts ── chaque écriture ──▶ fileEnvoi.ts (file d'envoi locale)
```

### `src/compte/`

- `configuration.ts` : lit `process.env.EXPO_PUBLIC_SUPABASE_URL` et `process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY` ; expose `configurationSupabase(): { url, cleAnon } | null`.
- `client.ts` : crée **un seul** client `@supabase/supabase-js` si la configuration existe (persistance de session dans AsyncStorage, rafraîchissement automatique du jeton arrêté/relancé selon `AppState`, `detectSessionInUrl: false`) ; sinon `null`. Les écrans et la synchro ne touchent jamais ce client directement : ils passent par les interfaces ci-dessous.
- Interface `Authentification` (implémentée par Supabase, et par une fausse en mémoire pour les tests) :
  - `sessionCourante(): Promise<EtatCompte | null>`
  - `creerSessionAnonyme(): Promise<EtatCompte>`
  - `demanderLiaison(email): Promise<'code-envoye-liaison' | 'code-envoye-connexion'>`
  - `confirmerCode(email, code, mode): Promise<EtatCompte>`
  - `EtatCompte = { utilisateurId: string; email: string | null; anonyme: boolean }`
- `session.ts` : `assurerSession(auth)` renvoie la session existante ou en crée une anonyme ; **toutes les erreurs sont absorbées** (renvoie `null`), un seul essai en vol à la fois.
- `liaison.ts` : le parcours à **un seul chemin** :
  1. `demanderLiaison(email)` tente de rattacher l'e-mail à l'utilisateur anonyme courant (`auth.updateUser({ email })`, code envoyé par e-mail) → `'code-envoye-liaison'`.
  2. Si Supabase répond que l'e-mail appartient déjà à un compte, envoie un code de connexion à ce compte (`auth.signInWithOtp({ email, options: { shouldCreateUser: false } })`) → `'code-envoye-connexion'`.
  3. `confirmerCode` vérifie le code avec le type correspondant (`email_change` pour la liaison, `email` pour la connexion).
  4. Après une **connexion** à un compte existant : restauration (voir plus bas). Après une **liaison** : rien à restaurer, on continue d'envoyer.
  - Les noms exacts des méthodes, types d'OTP et codes d'erreur Supabase (`email_exists`, limites d'envoi) sont à confirmer contre la documentation de la version installée au moment du plan ; l'interface `Authentification` isole ce détail.

### `src/synchro/`

- `fileEnvoi.ts` : file d'envoi persistée sous la clé `flashcoach.synchro.v1`, de forme `{ [idEntree]: numeroDeVersion }`. `marquer(stockage, id)` incrémente la version de l'entrée ; `retirerSiInchangee(stockage, versionsEnvoyees)` ne retire une entrée que si sa version n'a pas bougé pendant l'envoi. Même mise en série des opérations que le journal (file par stockage). Lecture en échec : on n'écrit pas (ne jamais perdre la file).
- `src/journal/journal.ts` : `ajouterEntree` et `mettreAJourEntree` marquent l'entrée dans la file d'envoi **après** une écriture réussie du journal. Une entrée sortie du journal par la limite de 500 est simplement ignorée à l'envoi puis retirée de la file.
- Interface `ServeurJournal` : `envoyer(entrees: EntreeJournal[]): Promise<void>` (upsert idempotent sur `(user_id, id)`) et `recuperer(): Promise<EntreeJournal[]>` (toutes les lignes de l'utilisateur courant, validées avec la même garde que le journal local ; une ligne invalide est ignorée).
- `synchro.ts` : `synchroniser({ stockage, serveur, session })` :
  - ne fait rien sans session ou sans serveur ;
  - lit la file, lit le journal, envoie les entrées présentes par paquets de 100 au plus, puis retire celles dont la version n'a pas changé ;
  - un échec laisse la file intacte ; jamais plus d'une synchro à la fois (un appel pendant une synchro en cours en programme une seule de plus à la fin) ;
  - ne lève jamais d'erreur vers l'appelant ; renvoie un résultat (`'rien' | 'envoye' | 'echec'`) pour les tests.
- `fusion.ts` : `fusionner(locales, distantes)` → union par `id`, la version **locale** l'emporte en cas de doublon, tri du plus récent au plus ancien (`debut`), limite 500.
- `restauration` (dans `synchro.ts`) : après connexion à un compte existant, `recuperer()` puis fusion dans le journal local (dans la file de mise en série du journal), puis toutes les entrées locales sont marquées à envoyer (elles appartiennent désormais au compte retrouvé).
- `declencheurs.ts` : hook `useSynchro()` monté une fois dans `app/_layout.tsx` : au démarrage `assurerSession` puis `synchroniser` ; `synchroniser` au retour de l'app au premier plan (`AppState` → `active`) ; une fonction `demanderSynchro()` appelée à la fin d'une séance (`app/seance.tsx`) et à la réponse « Mieux » / « Pareil » (`app/bravo.tsx`). En cas d'échec : nouvel essai au déclencheur suivant, pas de minuterie de réessai.

## Données côté Supabase

Migration versionnée `supabase/migrations/20261019000000_seances.sql` :

- Table `public.seances` :
  - `user_id uuid not null default auth.uid() references auth.users(id) on delete cascade`
  - `id text not null`
  - `debut timestamptz not null`, `contexte_id text not null`, `ressenti text not null`, `duree smallint not null`, `graine bigint not null`, `exercices text[] not null`, `ecoule_ms integer not null check (ecoule_ms >= 0)`, `exercices_faits smallint not null check (exercices_faits >= 0)`, `terminee boolean not null`, `apres text null check (apres in ('mieux', 'pareil'))`
  - `mis_a_jour timestamptz not null default now()` (mis à jour à chaque upsert)
  - clé primaire `(user_id, id)`
- RLS activée ; politiques `select`, `insert`, `update` limitées à `user_id = auth.uid()` (utilisateurs anonymes compris) ; **aucune** politique `delete` (la suppression du compte et des données arrive au jalon 6).
- Conversion `EntreeJournal` ↔ ligne (camelCase ↔ snake_case) dans `serveurSupabase.ts`, testée sans réseau.

Guide `docs/supabase.md` pour Mattia : créer le projet (région Europe, Francfort) ; activer les connexions anonymes ; activer la connexion par e-mail avec code (modèles d'e-mail « Confirm email change » et « Magic link » affichant `{{ .Token }}`) ; appliquer la migration (éditeur SQL) ; copier l'URL et la clé `anon` dans `mobile/.env.local` (non commité, `.gitignore` à vérifier) ; noter la limite d'envoi d'e-mails du service intégré (suffisante pour les tests, un SMTP sera nécessaire avant la publication) et l'option CAPTCHA contre les abus de connexions anonymes (à décider au jalon 6).

## Écran « Sauvegarder mon journal »

- Accès : dans `app/journal.tsx`, sous la liste (et dans l'état vide), un lien discret « Sauvegarder mon journal » (icône dessinée, cible 48 dp), visible seulement si Supabase est configuré. Une fois lié : à la place, une ligne « Journal sauvegardé · ton@email » (texte discret, pas d'action).
- Route `app/sauvegarde.tsx`, deux étapes sur le même écran, ton complice, design du monde existant (`DESIGN.md`) :
  1. **E-mail** : titre « Garde ton journal en sécurité », phrase « On t'envoie un code pour le retrouver sur n'importe quel téléphone. », champ e-mail (clavier e-mail, `autoComplete="email"`), bouton « Recevoir mon code ». E-mail mal formé → message sous le champ, bouton inactif tant que vide.
  2. **Code** : « Code envoyé à ton@email », champ code à 6 chiffres (clavier numérique, `autoComplete="one-time-code"`), bouton « Valider », lien « Renvoyer le code » (inactif 30 s), lien « Changer d'e-mail ».
  3. **Fin** : coche, « C'est sauvegardé. » (liaison) ou « Ton journal est de retour. » (connexion à un compte existant, après restauration), bouton « Retour au journal ».
- Erreurs (sous le champ, `accessibilityLiveRegion="polite"`) : code faux ou expiré → « Ce code ne marche pas. Vérifie-le ou demande-en un autre. » ; pas de réseau → « Pas de connexion pour l'instant. Réessaie dans un moment. » ; trop de tentatives → « Trop d'essais d'un coup. Réessaie dans quelques minutes. » ; tout autre échec → « Ça n'a pas marché. Réessaie dans un moment. » Jamais d'erreur technique brute.
- Pendant un envoi : bouton inactif avec indicateur, double-tap sans effet.

## Gestion des échecs

| Situation | Comportement |
|---|---|
| Pas de configuration Supabase | Rien ne change ; lien de sauvegarde masqué. |
| Pas de réseau au démarrage | Pas de session ; nouvel essai au retour au premier plan. Séances normales. |
| Supabase en panne pendant un envoi | La file reste intacte ; nouvel essai au déclencheur suivant. |
| Entrée modifiée pendant un envoi (réponse « Mieux » juste après la fin) | Elle reste dans la file et repart au tour suivant. |
| Jeton expiré | Rafraîchi par le client ; en cas d'échec, la synchro échoue silencieusement. |
| Restauration en échec après une connexion réussie | Le compte est lié ; le message de fin dit « C'est sauvegardé. » et la restauration est retentée au démarrage suivant (drapeau `flashcoach.restauration.v1`). |
| E-mail déjà utilisé | Bascule automatique vers la connexion à ce compte (étape transparente pour l'utilisateur). |

## Tests

- `fileEnvoi` : marquer, versions, retrait seulement si inchangée, lecture en échec sans écriture, mise en série.
- `journal` : ajout et mise à jour marquent l'entrée ; échec d'écriture du journal → pas de marquage ; tests existants inchangés.
- `synchro` avec `serveurMemoire` : rien à envoyer ; envoi réussi vide la file ; échec garde la file ; modification pendant l'envoi ; entrées sorties par la limite ; paquets de 100 ; pas de synchro concurrente ; sans session → rien.
- `fusion` : union, priorité locale, tri, limite 500.
- `session` et `liaison` avec une `Authentification` en mémoire : session existante, création anonyme, erreur absorbée ; liaison simple ; bascule vers connexion si l'e-mail existe ; restauration après connexion ; code faux.
- `serveurSupabase` : conversion entrée ↔ ligne (aller-retour), ligne invalide ignorée — sans réseau.
- Écrans (`renderRouter`) : lien masqué sans configuration ; lien visible avec ; parcours e-mail → code → fin ; messages d'erreur ; ligne « Journal sauvegardé » une fois lié ; la séance et Bravo déclenchent `demanderSynchro` sans attendre.
- Non couvert avant que Mattia crée le projet : le branchement au vrai Supabase (session anonyme, RLS, e-mails de code). Vérification manuelle guidée à ce moment-là, sur téléphone (Expo Go).

## Lots (mode économe : une revue par lot, une revue finale)

1. **File d'envoi et synchro** : `fileEnvoi`, marquage dans `journal.ts`, `ServeurJournal` + `serveurMemoire`, `synchro`, `fusion`.
2. **Supabase et déclencheurs** : dépendance `@supabase/supabase-js` (+ polyfills éventuels exigés par sa version), `configuration`, `client`, `Authentification` Supabase et mémoire, `session`, `serveurSupabase`, migration SQL, `useSynchro` et branchements dans `_layout`, `seance`, `bravo`, `docs/supabase.md`, `.env.local` ignoré.
3. **Liaison et écran de sauvegarde** : `liaison`, restauration, `app/sauvegarde.tsx`, lien et ligne d'état dans `app/journal.tsx`.

## Hors périmètre

Catalogue distant ; connexion Google ; suppression du compte et des données, politique de confidentialité, consentement (jalon 6) ; synchronisation des préférences et des « derniers exercices » ; synchronisation en temps réel entre deux téléphones actifs (la restauration se fait à la connexion).
