# Brancher Flash Coach à Supabase

Guide pas à pas pour créer le projet Supabase qui sauvegarde le journal des séances. Sans cette configuration, l'app reste entièrement locale.

## 1. Créer le projet

1. Va sur supabase.com, connecte-toi, puis **New project**.
2. Région : **Central EU (Frankfurt)**.
3. Choisis un mot de passe de base de données et garde-le dans un gestionnaire de mots de passe.

## 2. Activer les connexions anonymes

1. **Authentication → Sign In / Providers**.
2. Active **Allow anonymous sign-ins**.
3. Rien d'autre à activer pour rattacher un e-mail à une session anonyme : l'app le fait avec `updateUser({ email })`. **Allow manual linking** ne concerne que `linkIdentity` (OAuth) et n'est pas nécessaire : laisse-le désactivé.

## 3. Code par e-mail

1. **Authentication → Providers → Email** : activé, avec **Confirm email** activé.
2. **Authentication → Emails** : dans les modèles **Change Email Address** et **Magic Link**, remplace le lien par le code `{{ .Token }}`. Exemple de texte : « Ton code Flash Coach : {{ .Token }} ».
3. Longueur du code : **6 chiffres**.

## 4. Créer la table

1. **SQL Editor** → New query.
2. Colle le contenu de `supabase/migrations/20261019000000_seances.sql`.
3. **Run**.
4. La migration ne contient pas de `grant` : c'est le réglage par défaut de Supabase sur le schéma `public` qui permet au rôle `authenticated` (les utilisateurs anonymes en font partie) d'utiliser la table. La sécurité par ligne (RLS) limite ensuite chacun à ses propres lignes. Si ton projet n'expose pas automatiquement les nouvelles tables, ajoute `grant select, insert, update on public.seances to authenticated;`.

## 5. Brancher l'app

1. **Project Settings → API Keys** : copie l'URL du projet et la clé « publishable ».
2. Crée `mobile/.env.local` :

   ```
   EXPO_PUBLIC_SUPABASE_URL=https://<ton-projet>.supabase.co
   EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```

3. Ce fichier est ignoré par git (`.env*.local`). Ne mets jamais la clé `service_role` / secrète dedans.
4. Relance `npx expo start`.

## 6. Vérifier

- Fais une séance sur le téléphone : **Table Editor → `seances`** contient une ligne.
- **Authentication → Users** montre un utilisateur anonyme.
- Teste « Sauvegarder mon journal » avec ton e-mail.
- Supabase impose au moins 60 secondes entre deux e-mails (réglage par défaut) : « Renvoyer le code » reste donc inactif 60 s, et un nouvel envoi plus tôt serait refusé.
- Après une connexion à un compte existant, l'utilisateur anonyme remplacé et ses lignes restent sur le serveur (personne ne peut plus y accéder). Leur nettoyage est prévu au jalon 6.

## 7. Avant la publication (jalons 6 et 7)

- Le service d'e-mail intégré est limité (quelques e-mails par heure) : configure un SMTP.
- Active un CAPTCHA (Turnstile) contre les abus de connexions anonymes.
- Limite par IP des connexions anonymes : 30 par heure par défaut.
