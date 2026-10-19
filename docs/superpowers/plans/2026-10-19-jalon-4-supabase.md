# Jalon 4 — Supabase : sauvegarde du journal — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sauvegarder le journal dans Supabase en arrière-plan (session anonyme silencieuse) et permettre de le retrouver sur un autre téléphone grâce à une liaison facultative par code reçu par e-mail.

**Architecture:** Le journal local reste la source de vérité. Chaque écriture du journal marque l'entrée dans une file d'envoi locale ; un moteur de synchro à vol unique (session → restauration éventuelle → envoi) tourne au démarrage, au retour au premier plan et en fin de séance. Tout ce qui touche Supabase passe par deux interfaces (`Authentification`, `ServeurJournal`) qui ont chacune une version en mémoire pour les tests ; sans configuration Supabase, aucune instance n'est créée et l'app se comporte exactement comme avant.

**Tech Stack:** Expo SDK 58, Expo Router 58 (routes dans `mobile/app/`), React Native 0.88, TypeScript strict, `@supabase/supabase-js` 2.x (dernière version compatible installée par `npx expo install`), AsyncStorage (déjà présent), Jest via jest-expo, RNTL 14 (`render`/`fireEvent`/`renderRouter` asynchrones).

**Spec:** `docs/superpowers/specs/2026-10-19-jalon-4-supabase-design.md`

## Global Constraints

- Local d'abord : aucun appel réseau sur le chemin d'une séance ; aucune attente, aucun indicateur, aucune erreur réseau affichée hors de l'écran de sauvegarde. Toute fonction de synchro absorbe ses erreurs.
- Zéro configuration : rien n'est demandé avant la première séance ; la liaison n'est proposée que depuis le journal.
- Sans `EXPO_PUBLIC_SUPABASE_URL` ou `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, aucun client n'est créé, la synchro ne fait rien, le lien de sauvegarde est masqué. (Écart assumé avec la spec : Supabase nomme désormais la clé publique « publishable key » ; une ancienne clé `anon` se colle dans la même variable.)
- Seule la clé publique est dans l'app, jamais `service_role`.
- Minimum de données : uniquement les champs actuels de `EntreeJournal` ; aucun identifiant d'appareil.
- Clés de stockage : file d'envoi `flashcoach.synchro.v1`, drapeau de restauration `flashcoach.restauration.v1`.
- Limite du journal : 500 entrées (`TAILLE_MAX_JOURNAL`) ; paquets d'envoi de 100 au plus.
- Textes (exacts) : lien « Sauvegarder mon journal » ; ligne liée « Journal sauvegardé · <email> » ; titre « Garde ton journal en sécurité » ; phrase « On t'envoie un code pour le retrouver sur n'importe quel téléphone. » ; bouton « Recevoir mon code » ; « Code envoyé à <email> » ; bouton « Valider » ; liens « Renvoyer le code » (inactif 30 s) et « Changer d'e-mail » ; fin « C'est sauvegardé. » ou « Ton journal est de retour. » ; bouton « Retour au journal ». Erreurs : « Ce code ne marche pas. Vérifie-le ou demande-en un autre. » ; « Pas de connexion pour l'instant. Réessaie dans un moment. » ; « Trop d'essais d'un coup. Réessaie dans quelques minutes. » ; « Ça n'a pas marché. Réessaie dans un moment. » ; e-mail mal formé : « Vérifie ton adresse e-mail. »
- Design : celui de `DESIGN.md` (fond `COULEURS.fond`, cartes `COULEURS.carte`, orange réservé à l'action, jamais de texte blanc sur l'orange, cibles 48 dp, `TYPO`).
- Tous les tests existants restent verts sans affaiblir leur intention ; `npx jest`, `npm run typecheck`, `npm run lint` propres depuis `mobile/`.
- Commits terminés par `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` ; ne jamais committer `.claude/`, `.superpowers/`, ni `mobile/.env.local`.

## Structure des fichiers

| Fichier | Rôle | Tâche |
|---|---|---|
| `mobile/src/preferences/serie.ts` | File d'opérations par stockage (extraite de `journal.ts`) | 1 |
| `mobile/src/journal/journal.ts` | + marquage de la file d'envoi, lecture « si lisible », fusion | 1 |
| `mobile/src/journal/fusion.ts` | Fusion pure locale ∪ distante | 1 |
| `mobile/src/synchro/fileEnvoi.ts` | File d'envoi versionnée | 1 |
| `mobile/src/synchro/serveur.ts` | Interface `ServeurJournal` | 1 |
| `mobile/src/synchro/serveurMemoire.ts` | Faux serveur pour les tests | 1 |
| `mobile/src/synchro/synchro.ts` | `synchroniser`, `restaurer` | 1 |
| `mobile/src/compte/auth.ts` | Interface `Authentification`, types, `ErreurCompte` | 2 |
| `mobile/src/compte/authMemoire.ts` | Fausse authentification pour les tests | 2 |
| `mobile/src/compte/session.ts` | `assurerSession` | 2 |
| `mobile/src/compte/configuration.ts` | Lecture des variables d'environnement | 2 |
| `mobile/src/compte/client.ts` | Client Supabase unique | 2 |
| `mobile/src/compte/authSupabase.ts` | `Authentification` sur Supabase | 2 |
| `mobile/src/synchro/serveurSupabase.ts` | `ServeurJournal` sur Supabase + conversion ligne | 2 |
| `mobile/src/synchro/moteur.ts` | Moteur à vol unique, restauration différée | 2 |
| `mobile/src/synchro/instance.ts` | Instances de l'app (`authApp`, `moteurApp`, `demanderSynchro`) | 2 |
| `mobile/src/synchro/useSynchro.ts` | Déclencheurs démarrage / premier plan | 2 |
| `mobile/app/_layout.tsx`, `seance.tsx`, `bravo.tsx` | Branchements des déclencheurs | 2 |
| `supabase/migrations/20261019000000_seances.sql` | Table et RLS | 2 |
| `docs/supabase.md` | Guide de mise en route pour Mattia | 2 |
| `mobile/src/compte/liaison.ts` | Validation e-mail/code, messages d'erreur | 3 |
| `mobile/app/sauvegarde.tsx` | Écran de sauvegarde | 3 |
| `mobile/app/journal.tsx` | Lien et ligne d'état | 3 |

---

### Task 1 (lot 1) : file d'envoi, synchro et restauration contre un faux serveur

**Files:**
- Create: `mobile/src/preferences/serie.ts`, `mobile/src/journal/fusion.ts`, `mobile/src/journal/fusion.test.ts`, `mobile/src/synchro/fileEnvoi.ts`, `mobile/src/synchro/fileEnvoi.test.ts`, `mobile/src/synchro/serveur.ts`, `mobile/src/synchro/serveurMemoire.ts`, `mobile/src/synchro/synchro.ts`, `mobile/src/synchro/synchro.test.ts`
- Modify: `mobile/src/journal/journal.ts`, `mobile/src/journal/journal.test.ts` (ajouts seulement)

**Interfaces:**
- Consumes: `Stockage` (`src/preferences/stockage.ts`), `EntreeJournal`, `TAILLE_MAX_JOURNAL`, `lireJournal`, `ajouterEntree`, `mettreAJourEntree` (`src/journal/journal.ts`).
- Produces:
  - `enSerie<T>(stockage: Stockage, operation: () => Promise<T>): Promise<T>` (`src/preferences/serie.ts`)
  - `estEntreeJournal(valeur: unknown): valeur is EntreeJournal`, `lireJournalSiLisible(stockage): Promise<EntreeJournal[] | null>`, `fusionnerDansJournal(stockage, distantes: EntreeJournal[]): Promise<string[] | null>` (`src/journal/journal.ts`)
  - `fusionner(locales: EntreeJournal[], distantes: EntreeJournal[]): EntreeJournal[]` (`src/journal/fusion.ts`)
  - `CLE_FILE_ENVOI = 'flashcoach.synchro.v1'`, `type VersionsEnvoi = Record<string, number>`, `lireFileEnvoi(stockage): Promise<VersionsEnvoi>`, `marquerAEnvoyer(stockage, ids: string[]): Promise<void>`, `retirerSiInchangees(stockage, envoyees: VersionsEnvoi): Promise<void>` (`src/synchro/fileEnvoi.ts`)
  - `interface ServeurJournal { envoyer(entrees: EntreeJournal[]): Promise<void>; recuperer(): Promise<EntreeJournal[]> }` (`src/synchro/serveur.ts`)
  - `class ServeurMemoire implements ServeurJournal` avec `lignes: Map<string, EntreeJournal>`, `enPanne: boolean`, `envois: EntreeJournal[][]`, `pendantEnvoi?: () => Promise<void>` (`src/synchro/serveurMemoire.ts`)
  - `TAILLE_PAQUET = 100`, `type ResultatSynchro = 'rien' | 'envoye' | 'echec'`, `synchroniser(stockage, serveur): Promise<ResultatSynchro>`, `restaurer(stockage, serveur): Promise<boolean>` (`src/synchro/synchro.ts`)

- [ ] **Step 1: Extraire la file d'opérations**

Créer `mobile/src/preferences/serie.ts` (code déplacé tel quel depuis `journal.ts`) :

```ts
import type { Stockage } from './stockage';

// Lire-modifier-écrire n'est pas atomique : on met les opérations d'un même stockage en file.
// Partagée par le journal et la file d'envoi, pour qu'elles ne s'entrelacent jamais.
const files = new WeakMap<Stockage, Promise<unknown>>();

export function enSerie<T>(stockage: Stockage, operation: () => Promise<T>): Promise<T> {
  const precedente = files.get(stockage) ?? Promise.resolve();
  const suivante = precedente.then(operation, operation);
  files.set(stockage, suivante.catch(() => undefined));
  return suivante;
}
```

Dans `journal.ts`, supprimer `files` et `enSerie` locaux et ajouter `import { enSerie } from '../preferences/serie';`. Lancer `npx jest src/journal` : PASS (aucun changement de comportement).

- [ ] **Step 2: Tests de la fusion (échouent)**

`mobile/src/journal/fusion.test.ts` :

```ts
import { fusionner } from './fusion';
import { TAILLE_MAX_JOURNAL } from './journal';
import { fabriquerEntree } from '../test-utils/journal';

const le = (jour: number) => new Date(2026, 9, jour, 8).toISOString();

describe('fusionner', () => {
  it('réunit les deux journaux, du plus récent au plus ancien', () => {
    const locales = [fabriquerEntree({ id: 'b', debut: le(12) })];
    const distantes = [fabriquerEntree({ id: 'a', debut: le(10) }), fabriquerEntree({ id: 'c', debut: le(14) })];
    expect(fusionner(locales, distantes).map((e) => e.id)).toEqual(['c', 'b', 'a']);
  });

  it('garde la version du téléphone quand une séance existe des deux côtés', () => {
    const locale = fabriquerEntree({ id: 'x', apres: 'mieux' });
    const distante = fabriquerEntree({ id: 'x', apres: null });
    expect(fusionner([locale], [distante])).toEqual([locale]);
  });

  it(`ne garde que les ${TAILLE_MAX_JOURNAL} plus récentes`, () => {
    const distantes = Array.from({ length: TAILLE_MAX_JOURNAL + 5 }, (_, i) =>
      fabriquerEntree({ id: `d${i}`, debut: new Date(2026, 0, 1, 0, i).toISOString() }),
    );
    const resultat = fusionner([], distantes);
    expect(resultat).toHaveLength(TAILLE_MAX_JOURNAL);
    expect(resultat[0].id).toBe(`d${TAILLE_MAX_JOURNAL + 4}`);
  });
});
```

Run: `npx jest src/journal/fusion` → FAIL (module `./fusion` introuvable).

- [ ] **Step 3: Implémenter la fusion**

`mobile/src/journal/fusion.ts` :

```ts
import { TAILLE_MAX_JOURNAL, type EntreeJournal } from './journal';

// Restauration : union par identifiant, le téléphone l'emporte (il peut avoir une réponse plus récente).
export function fusionner(locales: EntreeJournal[], distantes: EntreeJournal[]): EntreeJournal[] {
  const parId = new Map<string, EntreeJournal>();
  for (const entree of distantes) parId.set(entree.id, entree);
  for (const entree of locales) parId.set(entree.id, entree);
  return [...parId.values()]
    .sort((a, b) => Date.parse(b.debut) - Date.parse(a.debut))
    .slice(0, TAILLE_MAX_JOURNAL);
}
```

Run: `npx jest src/journal/fusion` → PASS.

- [ ] **Step 4: Tests de la file d'envoi (échouent)**

`mobile/src/synchro/fileEnvoi.test.ts` :

```ts
import { CLE_FILE_ENVOI, lireFileEnvoi, marquerAEnvoyer, retirerSiInchangees } from './fileEnvoi';
import { creerStockageMemoire } from '../test-utils/stockageMemoire';

describe('file d’envoi', () => {
  it('est vide au départ', async () => {
    expect(await lireFileEnvoi(creerStockageMemoire())).toEqual({});
  });

  it('numérote chaque modification d’une entrée', async () => {
    const stockage = creerStockageMemoire();
    await marquerAEnvoyer(stockage, ['a']);
    await marquerAEnvoyer(stockage, ['a', 'b']);
    expect(await lireFileEnvoi(stockage)).toEqual({ a: 2, b: 1 });
  });

  it('ne retire que les entrées restées identiques pendant l’envoi', async () => {
    const stockage = creerStockageMemoire();
    await marquerAEnvoyer(stockage, ['a', 'b']);
    const envoyees = await lireFileEnvoi(stockage);
    await marquerAEnvoyer(stockage, ['b']);
    await retirerSiInchangees(stockage, envoyees);
    expect(await lireFileEnvoi(stockage)).toEqual({ b: 2 });
  });

  it('écarte une file abîmée', async () => {
    const stockage = creerStockageMemoire({ [CLE_FILE_ENVOI]: '{pas du json' });
    expect(await lireFileEnvoi(stockage)).toEqual({});
    const autre = creerStockageMemoire({ [CLE_FILE_ENVOI]: JSON.stringify({ a: 'x', b: 2 }) });
    expect(await lireFileEnvoi(autre)).toEqual({ b: 2 });
  });

  it('n’écrit rien quand la lecture échoue, pour ne jamais perdre la file', async () => {
    const ecrire = jest.fn(async () => undefined);
    const stockage = { lire: jest.fn(async () => { throw new Error('panne'); }), ecrire };
    await marquerAEnvoyer(stockage, ['a']);
    await retirerSiInchangees(stockage, { a: 1 });
    expect(ecrire).not.toHaveBeenCalled();
  });

  it('ne rejette jamais quand l’écriture échoue', async () => {
    const stockage = { lire: async () => null, ecrire: async () => { throw new Error('panne'); } };
    await expect(marquerAEnvoyer(stockage, ['a'])).resolves.toBeUndefined();
  });
});
```

Run: `npx jest src/synchro/fileEnvoi` → FAIL (module introuvable).

- [ ] **Step 5: Implémenter la file d'envoi**

`mobile/src/synchro/fileEnvoi.ts` :

```ts
import { enSerie } from '../preferences/serie';
import type { Stockage } from '../preferences/stockage';

export const CLE_FILE_ENVOI = 'flashcoach.synchro.v1';

// Identifiant d'entrée → numéro de sa dernière modification locale.
export type VersionsEnvoi = Record<string, number>;

type Lecture = { lue: true; versions: VersionsEnvoi } | { lue: false };

async function lireBrut(stockage: Stockage): Promise<Lecture> {
  let texte: string | null;
  try {
    texte = await stockage.lire(CLE_FILE_ENVOI);
  } catch {
    return { lue: false };
  }
  try {
    const valeur: unknown = texte === null ? {} : JSON.parse(texte);
    const versions: VersionsEnvoi = {};
    if (typeof valeur === 'object' && valeur !== null && !Array.isArray(valeur)) {
      for (const [id, version] of Object.entries(valeur)) {
        if (Number.isInteger(version) && (version as number) > 0) versions[id] = version as number;
      }
    }
    return { lue: true, versions };
  } catch {
    return { lue: true, versions: {} };
  }
}

async function ecrireSansErreur(stockage: Stockage, versions: VersionsEnvoi): Promise<void> {
  try {
    await stockage.ecrire(CLE_FILE_ENVOI, JSON.stringify(versions));
  } catch {
    // La sauvegarde attendra : l'entrée reste dans le journal local.
  }
}

export function lireFileEnvoi(stockage: Stockage): Promise<VersionsEnvoi> {
  return enSerie(stockage, async () => {
    const lecture = await lireBrut(stockage);
    return lecture.lue ? lecture.versions : {};
  });
}

export function marquerAEnvoyer(stockage: Stockage, ids: string[]): Promise<void> {
  return enSerie(stockage, async () => {
    const lecture = await lireBrut(stockage);
    if (!lecture.lue) return;
    const versions = { ...lecture.versions };
    for (const id of ids) versions[id] = (versions[id] ?? 0) + 1;
    await ecrireSansErreur(stockage, versions);
  });
}

// Une entrée modifiée pendant l'envoi garde sa place : sa nouvelle version partira au tour suivant.
export function retirerSiInchangees(stockage: Stockage, envoyees: VersionsEnvoi): Promise<void> {
  return enSerie(stockage, async () => {
    const lecture = await lireBrut(stockage);
    if (!lecture.lue) return;
    const versions = { ...lecture.versions };
    for (const [id, version] of Object.entries(envoyees)) {
      if (versions[id] === version) delete versions[id];
    }
    await ecrireSansErreur(stockage, versions);
  });
}
```

Run: `npx jest src/synchro/fileEnvoi` → PASS.

- [ ] **Step 6: Tests du marquage dans le journal (échouent)**

Ajouter à la fin du `describe('journal', …)` de `mobile/src/journal/journal.test.ts` (imports à compléter : `lireFileEnvoi` depuis `../synchro/fileEnvoi`, `fusionnerDansJournal`, `lireJournalSiLisible`, `estEntreeJournal` depuis `./journal`) :

```ts
  it('marque à envoyer chaque séance créée ou complétée', async () => {
    const stockage = creerStockageMemoire();
    await ajouterEntree(stockage, fabriquerEntree({ id: 'a' }));
    expect(await lireFileEnvoi(stockage)).toEqual({ a: 1 });
    await mettreAJourEntree(stockage, 'a', { apres: 'mieux' });
    expect(await lireFileEnvoi(stockage)).toEqual({ a: 2 });
  });

  it('ne marque rien quand l’écriture du journal échoue', async () => {
    const memoire = creerStockageMemoire();
    const stockage = {
      lire: memoire.lire,
      ecrire: async (cle: string, valeur: string) => {
        if (cle === CLE_JOURNAL) throw new Error('panne');
        await memoire.ecrire(cle, valeur);
      },
    };
    await ajouterEntree(stockage, fabriquerEntree({ id: 'a' }));
    expect(await lireFileEnvoi(stockage)).toEqual({});
  });

  it('distingue un journal illisible d’un journal vide', async () => {
    expect(await lireJournalSiLisible(creerStockageMemoire())).toEqual([]);
    const enPanne = { lire: async () => { throw new Error('panne'); }, ecrire: async () => undefined };
    expect(await lireJournalSiLisible(enPanne)).toBeNull();
  });

  it('fusionne des séances retrouvées et renvoie les identifiants du journal obtenu', async () => {
    const stockage = creerStockageMemoire();
    await ajouterEntree(stockage, fabriquerEntree({ id: 'local', debut: new Date(2026, 9, 12).toISOString() }));
    const ids = await fusionnerDansJournal(stockage, [fabriquerEntree({ id: 'distante', debut: new Date(2026, 9, 10).toISOString() })]);
    expect(ids).toEqual(['local', 'distante']);
    expect((await lireJournal(stockage)).map((e) => e.id)).toEqual(['local', 'distante']);
  });

  it('expose la garde des entrées pour valider les séances venues du serveur', () => {
    expect(estEntreeJournal(fabriquerEntree())).toBe(true);
    expect(estEntreeJournal({ ...fabriquerEntree(), duree: 7 })).toBe(false);
  });
```

Run: `npx jest src/journal/journal` → FAIL.

- [ ] **Step 7: Implémenter dans `journal.ts`**

Modifications de `mobile/src/journal/journal.ts` :
1. Renommer `estEntree` en `estEntreeJournal` et l'exporter (mettre à jour ses usages internes).
2. `ecrireSansErreur` renvoie `Promise<boolean>` (`true` après écriture, `false` dans le `catch`).
3. Ajouter les imports `import { fusionner } from './fusion';` et `import { marquerAEnvoyer } from '../synchro/fileEnvoi';`.
4. Remplacer `ajouterEntree` et `mettreAJourEntree`, ajouter `lireJournalSiLisible` et `fusionnerDansJournal` :

```ts
export function lireJournalSiLisible(stockage: Stockage): Promise<EntreeJournal[] | null> {
  return enSerie(stockage, async () => {
    const lecture = await lireBrut(stockage);
    return lecture.lue ? lecture.entrees : null;
  });
}

export async function ajouterEntree(stockage: Stockage, entree: EntreeJournal): Promise<void> {
  const ecrite = await enSerie(stockage, async () => {
    const lecture = await lireBrut(stockage);
    // Lecture en échec : on n'écrit pas, pour ne pas effacer l'historique existant.
    if (!lecture.lue) return false;
    const sansDoublon = lecture.entrees.filter((e) => e.id !== entree.id);
    return ecrireSansErreur(stockage, [entree, ...sansDoublon].slice(0, TAILLE_MAX_JOURNAL));
  });
  // Sauvegarde en ligne : seule une séance réellement écrite part vers le serveur.
  if (ecrite) await marquerAEnvoyer(stockage, [entree.id]);
}

export async function mettreAJourEntree(stockage: Stockage, id: string, changement: ChangementEntree): Promise<void> {
  const ecrite = await enSerie(stockage, async () => {
    const lecture = await lireBrut(stockage);
    if (!lecture.lue) return false;
    const cible = lecture.entrees.find((e) => e.id === id);
    if (!cible) return false;
    const modifiee: unknown = { ...cible, ...changement };
    // Une entrée devenue invalide ne doit pas être écrite : elle disparaîtrait à la prochaine lecture.
    if (!estEntreeJournal(modifiee)) return false;
    return ecrireSansErreur(
      stockage,
      lecture.entrees.map((e) => (e.id === id ? modifiee : e)),
    );
  });
  if (ecrite) await marquerAEnvoyer(stockage, [id]);
}

// Restauration : renvoie les identifiants du journal fusionné, ou null si rien n'a pu être écrit.
export function fusionnerDansJournal(stockage: Stockage, distantes: EntreeJournal[]): Promise<string[] | null> {
  return enSerie(stockage, async () => {
    const lecture = await lireBrut(stockage);
    if (!lecture.lue) return null;
    const fusion = fusionner(lecture.entrees, distantes);
    return (await ecrireSansErreur(stockage, fusion)) ? fusion.map((e) => e.id) : null;
  });
}
```

Run: `npx jest src/journal` → PASS. Run `npx jest` : si un test existant d'écran compte les écritures du stockage ou inspecte toutes ses clés, l'adapter pour ignorer la clé `flashcoach.synchro.v1` sans affaiblir ce qu'il vérifie.

- [ ] **Step 8: Interface serveur et faux serveur**

`mobile/src/synchro/serveur.ts` :

```ts
import type { EntreeJournal } from '../journal/journal';

// Le seul contact de la synchro avec le réseau ; une version en mémoire remplace Supabase dans les tests.
export interface ServeurJournal {
  // Upsert idempotent : renvoyer deux fois la même entrée ne crée pas de doublon.
  envoyer(entrees: EntreeJournal[]): Promise<void>;
  // Toutes les séances de l'utilisateur courant, déjà validées.
  recuperer(): Promise<EntreeJournal[]>;
}
```

`mobile/src/synchro/serveurMemoire.ts` :

```ts
import type { EntreeJournal } from '../journal/journal';
import type { ServeurJournal } from './serveur';

// Faux serveur des tests : `enPanne` simule une coupure, `pendantEnvoi` une action concurrente.
export class ServeurMemoire implements ServeurJournal {
  lignes = new Map<string, EntreeJournal>();
  enPanne = false;
  envois: EntreeJournal[][] = [];
  pendantEnvoi?: () => Promise<void>;

  async envoyer(entrees: EntreeJournal[]): Promise<void> {
    if (this.pendantEnvoi) await this.pendantEnvoi();
    if (this.enPanne) throw new Error('serveur en panne');
    this.envois.push(entrees);
    for (const entree of entrees) this.lignes.set(entree.id, entree);
  }

  async recuperer(): Promise<EntreeJournal[]> {
    if (this.enPanne) throw new Error('serveur en panne');
    return [...this.lignes.values()];
  }
}
```

- [ ] **Step 9: Tests de la synchro (échouent)**

`mobile/src/synchro/synchro.test.ts` :

```ts
import { CLE_JOURNAL, ajouterEntree, lireJournal, mettreAJourEntree } from '../journal/journal';
import { creerStockageMemoire } from '../test-utils/stockageMemoire';
import { fabriquerEntree } from '../test-utils/journal';
import { lireFileEnvoi, marquerAEnvoyer } from './fileEnvoi';
import { ServeurMemoire } from './serveurMemoire';
import { TAILLE_PAQUET, restaurer, synchroniser } from './synchro';

describe('synchroniser', () => {
  it('ne fait rien quand la file est vide', async () => {
    const serveur = new ServeurMemoire();
    expect(await synchroniser(creerStockageMemoire(), serveur)).toBe('rien');
    expect(serveur.envois).toEqual([]);
  });

  it('envoie les séances marquées puis vide la file', async () => {
    const stockage = creerStockageMemoire();
    const serveur = new ServeurMemoire();
    await ajouterEntree(stockage, fabriquerEntree({ id: 'a' }));
    expect(await synchroniser(stockage, serveur)).toBe('envoye');
    expect(serveur.lignes.get('a')).toEqual(fabriquerEntree({ id: 'a' }));
    expect(await lireFileEnvoi(stockage)).toEqual({});
  });

  it('garde la file quand le serveur est en panne', async () => {
    const stockage = creerStockageMemoire();
    const serveur = new ServeurMemoire();
    serveur.enPanne = true;
    await ajouterEntree(stockage, fabriquerEntree({ id: 'a' }));
    expect(await synchroniser(stockage, serveur)).toBe('echec');
    expect(await lireFileEnvoi(stockage)).toEqual({ a: 1 });
  });

  it('renvoie au tour suivant une séance modifiée pendant l’envoi', async () => {
    const stockage = creerStockageMemoire();
    const serveur = new ServeurMemoire();
    await ajouterEntree(stockage, fabriquerEntree({ id: 'a' }));
    serveur.pendantEnvoi = async () => {
      serveur.pendantEnvoi = undefined;
      await mettreAJourEntree(stockage, 'a', { apres: 'mieux' });
    };
    await synchroniser(stockage, serveur);
    expect(await lireFileEnvoi(stockage)).toEqual({ a: 2 });
    await synchroniser(stockage, serveur);
    expect(serveur.lignes.get('a')?.apres).toBe('mieux');
    expect(await lireFileEnvoi(stockage)).toEqual({});
  });

  it('oublie les séances sorties du journal', async () => {
    const stockage = creerStockageMemoire();
    const serveur = new ServeurMemoire();
    await marquerAEnvoyer(stockage, ['disparue']);
    expect(await synchroniser(stockage, serveur)).toBe('rien');
    expect(serveur.envois).toEqual([]);
    expect(await lireFileEnvoi(stockage)).toEqual({});
  });

  it(`envoie par paquets de ${TAILLE_PAQUET} au plus`, async () => {
    const stockage = creerStockageMemoire();
    const serveur = new ServeurMemoire();
    for (let i = 0; i < TAILLE_PAQUET + 1; i += 1) await ajouterEntree(stockage, fabriquerEntree({ id: `e${i}` }));
    await synchroniser(stockage, serveur);
    expect(serveur.envois.map((paquet) => paquet.length)).toEqual([TAILLE_PAQUET, 1]);
  });

  it('n’efface pas la file quand le journal est illisible', async () => {
    const memoire = creerStockageMemoire();
    await marquerAEnvoyer(memoire, ['a']);
    const stockage = {
      lire: async (cle: string) => {
        if (cle === CLE_JOURNAL) throw new Error('panne');
        return memoire.lire(cle);
      },
      ecrire: memoire.ecrire,
    };
    expect(await synchroniser(stockage, new ServeurMemoire())).toBe('echec');
    expect(await lireFileEnvoi(memoire)).toEqual({ a: 1 });
  });
});

describe('restaurer', () => {
  it('ramène les séances du compte et les marque pour le compte retrouvé', async () => {
    const stockage = creerStockageMemoire();
    const serveur = new ServeurMemoire();
    serveur.lignes.set('ancienne', fabriquerEntree({ id: 'ancienne', debut: new Date(2026, 9, 1).toISOString() }));
    await ajouterEntree(stockage, fabriquerEntree({ id: 'recente', debut: new Date(2026, 9, 18).toISOString() }));
    expect(await restaurer(stockage, serveur)).toBe(true);
    expect((await lireJournal(stockage)).map((e) => e.id)).toEqual(['recente', 'ancienne']);
    expect(Object.keys(await lireFileEnvoi(stockage)).sort()).toEqual(['ancienne', 'recente']);
  });

  it('échoue sans rien toucher quand le serveur est en panne', async () => {
    const stockage = creerStockageMemoire();
    const serveur = new ServeurMemoire();
    serveur.enPanne = true;
    await ajouterEntree(stockage, fabriquerEntree({ id: 'a' }));
    expect(await restaurer(stockage, serveur)).toBe(false);
    expect((await lireJournal(stockage)).map((e) => e.id)).toEqual(['a']);
  });
});
```

Run: `npx jest src/synchro/synchro` → FAIL (module introuvable).

- [ ] **Step 10: Implémenter la synchro**

`mobile/src/synchro/synchro.ts` :

```ts
import { fusionnerDansJournal, lireJournalSiLisible, type EntreeJournal } from '../journal/journal';
import type { Stockage } from '../preferences/stockage';
import { lireFileEnvoi, marquerAEnvoyer, retirerSiInchangees } from './fileEnvoi';
import type { ServeurJournal } from './serveur';

export const TAILLE_PAQUET = 100;

export type ResultatSynchro = 'rien' | 'envoye' | 'echec';

// Ne rejette jamais : un échec laisse la file intacte, le prochain déclencheur réessaiera.
export async function synchroniser(stockage: Stockage, serveur: ServeurJournal): Promise<ResultatSynchro> {
  try {
    const file = await lireFileEnvoi(stockage);
    if (Object.keys(file).length === 0) return 'rien';
    const journal = await lireJournalSiLisible(stockage);
    // Journal illisible : on ne sait pas ce qui existe, on ne retire rien.
    if (journal === null) return 'echec';
    const parId = new Map(journal.map((e) => [e.id, e]));
    const aEnvoyer = Object.keys(file)
      .map((id) => parId.get(id))
      .filter((e): e is EntreeJournal => e !== undefined);
    for (let debut = 0; debut < aEnvoyer.length; debut += TAILLE_PAQUET) {
      await serveur.envoyer(aEnvoyer.slice(debut, debut + TAILLE_PAQUET));
    }
    // Les séances sorties du journal (limite de 500) sont retirées sans envoi.
    await retirerSiInchangees(stockage, file);
    return aEnvoyer.length > 0 ? 'envoye' : 'rien';
  } catch {
    return 'echec';
  }
}

// Après connexion à un compte existant : on fusionne ses séances puis tout le journal repart vers ce compte.
export async function restaurer(stockage: Stockage, serveur: ServeurJournal): Promise<boolean> {
  try {
    const distantes = await serveur.recuperer();
    const ids = await fusionnerDansJournal(stockage, distantes);
    if (ids === null) return false;
    await marquerAEnvoyer(stockage, ids);
    return true;
  } catch {
    return false;
  }
}
```

Run: `npx jest src/synchro src/journal` → PASS.

- [ ] **Step 11: Vérifier et committer**

Run depuis `mobile/` : `npx jest`, `npm run typecheck`, `npm run lint` → tout propre.

```bash
git add mobile/src/preferences/serie.ts mobile/src/journal mobile/src/synchro
git commit -m "feat: file d'envoi et synchro du journal (faux serveur)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2 (lot 2) : Supabase, session anonyme, moteur et déclencheurs

**Files:**
- Create: `mobile/src/compte/auth.ts`, `authMemoire.ts`, `session.ts`, `session.test.ts`, `configuration.ts`, `configuration.test.ts`, `client.ts`, `authSupabase.ts`, `authSupabase.test.ts`; `mobile/src/synchro/serveurSupabase.ts`, `serveurSupabase.test.ts`, `moteur.ts`, `moteur.test.ts`, `instance.ts`, `useSynchro.ts`; `supabase/migrations/20261019000000_seances.sql`; `docs/supabase.md`
- Modify: `mobile/package.json` / `package-lock.json` (dépendance), `mobile/app/_layout.tsx`, `mobile/app/seance.tsx`, `mobile/app/bravo.tsx`, `mobile/__tests__/ecrans.test.tsx` (ajouts)

**Interfaces:**
- Consumes (Task 1): `ServeurJournal`, `ServeurMemoire`, `synchroniser`, `restaurer`, `estEntreeJournal`, `EntreeJournal`, `Stockage`, `stockageTelephone`.
- Produces:
  - `src/compte/auth.ts` : `interface EtatCompte { utilisateurId: string; email: string | null; anonyme: boolean }` ; `type ModeCode = 'liaison' | 'connexion'` ; `type GenreErreur = 'code-invalide' | 'reseau' | 'trop-de-tentatives' | 'inconnue'` ; `class ErreurCompte extends Error { genre: GenreErreur }` ; `interface Authentification { sessionCourante(): Promise<EtatCompte | null>; creerSessionAnonyme(): Promise<EtatCompte>; demanderCode(email: string): Promise<ModeCode>; confirmerCode(email: string, code: string, mode: ModeCode): Promise<EtatCompte> }`
  - `src/compte/authMemoire.ts` : `class AuthMemoire implements Authentification` avec `etat: EtatCompte | null`, `comptes: Map<string, string>` (e-mail → utilisateurId), `codeAttendu = '123456'`, `enPanne: boolean`
  - `src/compte/session.ts` : `assurerSession(auth: Authentification): Promise<EtatCompte | null>`
  - `src/compte/configuration.ts` : `configurationSupabase(env?): { url: string; cle: string } | null`
  - `src/synchro/moteur.ts` : `CLE_RESTAURATION = 'flashcoach.restauration.v1'` ; `interface Moteur { demanderSynchro(): Promise<void>; restaurerApresConnexion(): Promise<boolean> }` ; `creerMoteur(deps: { stockage: Stockage; serveur: ServeurJournal; auth: Authentification }): Moteur`
  - `src/synchro/instance.ts` : `authApp: Authentification | null`, `moteurApp: Moteur | null`, `demanderSynchro(): void`
  - `src/synchro/useSynchro.ts` : `useSynchro(): void`

- [ ] **Step 1: Dépendance**

Depuis `mobile/` : `npx expo install @supabase/supabase-js`. Vérifier que `npx jest` reste vert (si Jest refuse de transformer le paquet, ajouter `@supabase` à `transformIgnorePatterns` dans la config `jest` de `package.json`, en conservant le motif existant de jest-expo).

- [ ] **Step 2: Interface d'authentification et fausse implémentation**

`mobile/src/compte/auth.ts` :

```ts
export interface EtatCompte {
  utilisateurId: string;
  email: string | null;
  anonyme: boolean;
}

// liaison : l'e-mail est rattaché à la session anonyme ; connexion : l'e-mail avait déjà un compte.
export type ModeCode = 'liaison' | 'connexion';

export type GenreErreur = 'code-invalide' | 'reseau' | 'trop-de-tentatives' | 'inconnue';

export class ErreurCompte extends Error {
  constructor(readonly genre: GenreErreur) {
    super(genre);
    this.name = 'ErreurCompte';
  }
}

// Isole Supabase : les écrans et la synchro ne voient que cette interface.
export interface Authentification {
  sessionCourante(): Promise<EtatCompte | null>;
  creerSessionAnonyme(): Promise<EtatCompte>;
  // Envoie un code à 6 chiffres ; bascule seule vers la connexion si l'e-mail a déjà un compte.
  demanderCode(email: string): Promise<ModeCode>;
  confirmerCode(email: string, code: string, mode: ModeCode): Promise<EtatCompte>;
}
```

`mobile/src/compte/authMemoire.ts` :

```ts
import { ErreurCompte, type Authentification, type EtatCompte, type ModeCode } from './auth';

// Fausse authentification des tests : `comptes` liste les e-mails déjà liés à un compte.
export class AuthMemoire implements Authentification {
  etat: EtatCompte | null = null;
  comptes = new Map<string, string>();
  codeAttendu = '123456';
  enPanne = false;
  creations = 0;

  async sessionCourante(): Promise<EtatCompte | null> {
    if (this.enPanne) throw new ErreurCompte('reseau');
    return this.etat;
  }

  async creerSessionAnonyme(): Promise<EtatCompte> {
    if (this.enPanne) throw new ErreurCompte('reseau');
    this.creations += 1;
    this.etat = { utilisateurId: `anonyme-${this.creations}`, email: null, anonyme: true };
    return this.etat;
  }

  async demanderCode(email: string): Promise<ModeCode> {
    if (this.enPanne) throw new ErreurCompte('reseau');
    return this.comptes.has(email) ? 'connexion' : 'liaison';
  }

  async confirmerCode(email: string, code: string, mode: ModeCode): Promise<EtatCompte> {
    if (this.enPanne) throw new ErreurCompte('reseau');
    if (code !== this.codeAttendu) throw new ErreurCompte('code-invalide');
    const utilisateurId = mode === 'connexion' ? this.comptes.get(email)! : this.etat?.utilisateurId ?? 'nouveau';
    this.comptes.set(email, utilisateurId);
    this.etat = { utilisateurId, email, anonyme: false };
    return this.etat;
  }
}
```

- [ ] **Step 3: Session (test puis code)**

`mobile/src/compte/session.test.ts` :

```ts
import { AuthMemoire } from './authMemoire';
import { assurerSession } from './session';

describe('assurerSession', () => {
  it('reprend la session existante sans en créer', async () => {
    const auth = new AuthMemoire();
    auth.etat = { utilisateurId: 'u1', email: null, anonyme: true };
    expect(await assurerSession(auth)).toEqual(auth.etat);
    expect(auth.creations).toBe(0);
  });

  it('crée une session anonyme au premier lancement', async () => {
    const auth = new AuthMemoire();
    expect(await assurerSession(auth)).toMatchObject({ anonyme: true });
    expect(auth.creations).toBe(1);
  });

  it('renvoie null sans rejeter quand le réseau manque', async () => {
    const auth = new AuthMemoire();
    auth.enPanne = true;
    await expect(assurerSession(auth)).resolves.toBeNull();
  });
});
```

Run → FAIL. Puis `mobile/src/compte/session.ts` :

```ts
import type { Authentification, EtatCompte } from './auth';

// Silencieuse : jamais d'écran, jamais d'erreur ; sans réseau on réessaiera au prochain déclencheur.
export async function assurerSession(auth: Authentification): Promise<EtatCompte | null> {
  try {
    return (await auth.sessionCourante()) ?? (await auth.creerSessionAnonyme());
  } catch {
    return null;
  }
}
```

Run → PASS.

- [ ] **Step 4: Moteur (test puis code)**

`mobile/src/synchro/moteur.test.ts` :

```ts
import { AuthMemoire } from '../compte/authMemoire';
import { ajouterEntree, lireJournal } from '../journal/journal';
import { creerStockageMemoire } from '../test-utils/stockageMemoire';
import { fabriquerEntree } from '../test-utils/journal';
import { CLE_RESTAURATION, creerMoteur } from './moteur';
import { ServeurMemoire } from './serveurMemoire';

function preparer() {
  const stockage = creerStockageMemoire();
  const serveur = new ServeurMemoire();
  const auth = new AuthMemoire();
  return { stockage, serveur, auth, moteur: creerMoteur({ stockage, serveur, auth }) };
}

describe('moteur de synchro', () => {
  it('crée la session puis envoie le journal', async () => {
    const { stockage, serveur, auth, moteur } = preparer();
    await ajouterEntree(stockage, fabriquerEntree({ id: 'a' }));
    await moteur.demanderSynchro();
    expect(auth.etat?.anonyme).toBe(true);
    expect(serveur.lignes.has('a')).toBe(true);
  });

  it('n’envoie rien sans session (pas de réseau)', async () => {
    const { stockage, serveur, auth, moteur } = preparer();
    auth.enPanne = true;
    await ajouterEntree(stockage, fabriquerEntree({ id: 'a' }));
    await moteur.demanderSynchro();
    expect(serveur.envois).toEqual([]);
  });

  it('ne lance jamais deux synchros à la fois et rejoue une seule fois les demandes arrivées pendant', async () => {
    const { stockage, serveur, moteur } = preparer();
    await ajouterEntree(stockage, fabriquerEntree({ id: 'a' }));
    let enVol = 0;
    let maximum = 0;
    serveur.pendantEnvoi = async () => {
      enVol += 1;
      maximum = Math.max(maximum, enVol);
      await ajouterEntree(stockage, fabriquerEntree({ id: `b${serveur.envois.length}` }));
      enVol -= 1;
    };
    const premiere = moteur.demanderSynchro();
    const autres = [moteur.demanderSynchro(), moteur.demanderSynchro()];
    await Promise.all([premiere, ...autres]);
    expect(maximum).toBe(1);
    expect(serveur.envois.length).toBe(2);
  });

  it('ne rejette jamais', async () => {
    const { serveur, moteur } = preparer();
    serveur.enPanne = true;
    await expect(moteur.demanderSynchro()).resolves.toBeUndefined();
  });

  it('restaure après connexion et efface le drapeau', async () => {
    const { stockage, serveur, auth, moteur } = preparer();
    auth.etat = { utilisateurId: 'u1', email: 'a@b.fr', anonyme: false };
    serveur.lignes.set('ancienne', fabriquerEntree({ id: 'ancienne' }));
    expect(await moteur.restaurerApresConnexion()).toBe(true);
    expect((await lireJournal(stockage)).map((e) => e.id)).toEqual(['ancienne']);
    expect(stockage.contenu[CLE_RESTAURATION]).toBe('0');
  });

  it('garde le drapeau et réessaie au démarrage suivant quand la restauration échoue', async () => {
    const { stockage, serveur, auth, moteur } = preparer();
    auth.etat = { utilisateurId: 'u1', email: 'a@b.fr', anonyme: false };
    serveur.enPanne = true;
    expect(await moteur.restaurerApresConnexion()).toBe(false);
    expect(stockage.contenu[CLE_RESTAURATION]).toBe('1');
    serveur.enPanne = false;
    serveur.lignes.set('ancienne', fabriquerEntree({ id: 'ancienne' }));
    await creerMoteur({ stockage, serveur, auth }).demanderSynchro();
    expect((await lireJournal(stockage)).map((e) => e.id)).toEqual(['ancienne']);
  });
});
```

Run → FAIL. Puis `mobile/src/synchro/moteur.ts` :

```ts
import type { Authentification } from '../compte/auth';
import { assurerSession } from '../compte/session';
import type { Stockage } from '../preferences/stockage';
import type { ServeurJournal } from './serveur';
import { restaurer, synchroniser } from './synchro';

// '1' tant qu'une restauration après connexion reste à faire (survit à la fermeture de l'app).
export const CLE_RESTAURATION = 'flashcoach.restauration.v1';

export interface Moteur {
  // Ne rejette jamais ; les demandes reçues pendant un tour en déclenchent un seul de plus.
  demanderSynchro(): Promise<void>;
  // Après connexion à un compte existant : vrai si ses séances sont de retour dans le journal.
  restaurerApresConnexion(): Promise<boolean>;
}

async function lireDrapeau(stockage: Stockage): Promise<boolean> {
  try {
    return (await stockage.lire(CLE_RESTAURATION)) === '1';
  } catch {
    return false;
  }
}

async function ecrireDrapeau(stockage: Stockage, actif: boolean): Promise<void> {
  try {
    await stockage.ecrire(CLE_RESTAURATION, actif ? '1' : '0');
  } catch {
    // Au pire, la restauration ne sera pas retentée : le compte reste lié.
  }
}

export function creerMoteur({ stockage, serveur, auth }: { stockage: Stockage; serveur: ServeurJournal; auth: Authentification }): Moteur {
  let enCours: Promise<void> | null = null;
  let relancer = false;

  async function tour(): Promise<void> {
    const session = await assurerSession(auth);
    if (session === null) return;
    if ((await lireDrapeau(stockage)) && (await restaurer(stockage, serveur))) await ecrireDrapeau(stockage, false);
    await synchroniser(stockage, serveur);
  }

  function demanderSynchro(): Promise<void> {
    if (enCours !== null) {
      relancer = true;
      return enCours;
    }
    enCours = (async () => {
      try {
        do {
          relancer = false;
          await tour();
        } while (relancer);
      } catch {
        // Jamais d'erreur vers les écrans.
      } finally {
        enCours = null;
      }
    })();
    return enCours;
  }

  async function restaurerApresConnexion(): Promise<boolean> {
    await ecrireDrapeau(stockage, true);
    await demanderSynchro();
    // Une synchro déjà en vol a pu se terminer avant d'avoir vu le drapeau : on en relance une.
    if (await lireDrapeau(stockage)) await demanderSynchro();
    return !(await lireDrapeau(stockage));
  }

  return { demanderSynchro, restaurerApresConnexion };
}
```

Run `npx jest src/synchro src/compte` → PASS.

- [ ] **Step 5: Configuration (test puis code)**

`mobile/src/compte/configuration.test.ts` :

```ts
import { configurationSupabase } from './configuration';

describe('configurationSupabase', () => {
  it('est absente sans les deux variables', () => {
    expect(configurationSupabase({})).toBeNull();
    expect(configurationSupabase({ EXPO_PUBLIC_SUPABASE_URL: 'https://x.supabase.co' })).toBeNull();
    expect(configurationSupabase({ EXPO_PUBLIC_SUPABASE_URL: ' ', EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'k' })).toBeNull();
  });

  it('renvoie l’URL et la clé publique', () => {
    expect(
      configurationSupabase({ EXPO_PUBLIC_SUPABASE_URL: 'https://x.supabase.co', EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_k' }),
    ).toEqual({ url: 'https://x.supabase.co', cle: 'sb_publishable_k' });
  });
});
```

`mobile/src/compte/configuration.ts` :

```ts
type Variables = Record<string, string | undefined>;

// Expo n'injecte les variables EXPO_PUBLIC_* que lues littéralement : d'où l'objet construit ici.
const VARIABLES_APP: Variables = {
  EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
};

// Sans les deux valeurs, l'app reste entièrement locale (aucun client, aucune synchro).
export function configurationSupabase(env: Variables = VARIABLES_APP): { url: string; cle: string } | null {
  const url = env.EXPO_PUBLIC_SUPABASE_URL?.trim();
  const cle = env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  return url && cle ? { url, cle } : null;
}
```

Run → PASS.

- [ ] **Step 6: Client, authentification et serveur Supabase (tests sans réseau)**

`mobile/src/compte/client.ts` :

```ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

// Un seul client pour toute l'app ; la session (anonyme ou liée) est gardée sur le téléphone.
export function creerClient({ url, cle }: { url: string; cle: string }): SupabaseClient {
  const client = createClient(url, cle, {
    auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
  });
  // Le jeton ne se rafraîchit que quand l'app est au premier plan.
  AppState.addEventListener('change', (etat) => {
    if (etat === 'active') client.auth.startAutoRefresh();
    else client.auth.stopAutoRefresh();
  });
  return client;
}
```

`mobile/src/compte/authSupabase.ts` :

```ts
import type { AuthError, SupabaseClient, User } from '@supabase/supabase-js';

import { ErreurCompte, type Authentification, type EtatCompte, type GenreErreur, type ModeCode } from './auth';

function etatDe(user: User): EtatCompte {
  return { utilisateurId: user.id, email: user.email || null, anonyme: user.is_anonymous ?? false };
}

const CODES_TROP = ['over_email_send_rate_limit', 'over_request_rate_limit', 'over_sms_send_rate_limit'];
const CODES_CODE = ['otp_expired', 'otp_invalid'];

export function genreDe(erreur: Pick<AuthError, 'code' | 'name' | 'status'>): GenreErreur {
  if (erreur.name === 'AuthRetryableFetchError' || erreur.status === 0) return 'reseau';
  if (erreur.status === 429 || CODES_TROP.includes(erreur.code ?? '')) return 'trop-de-tentatives';
  if (CODES_CODE.includes(erreur.code ?? '')) return 'code-invalide';
  return 'inconnue';
}

export function emailDejaUtilise(erreur: Pick<AuthError, 'code'>): boolean {
  return erreur.code === 'email_exists' || erreur.code === 'user_already_exists';
}

export class AuthSupabase implements Authentification {
  constructor(private readonly client: SupabaseClient) {}

  async sessionCourante(): Promise<EtatCompte | null> {
    const { data, error } = await this.client.auth.getSession();
    if (error) throw new ErreurCompte(genreDe(error));
    return data.session ? etatDe(data.session.user) : null;
  }

  async creerSessionAnonyme(): Promise<EtatCompte> {
    const { data, error } = await this.client.auth.signInAnonymously();
    if (error || !data.user) throw new ErreurCompte(error ? genreDe(error) : 'inconnue');
    return etatDe(data.user);
  }

  async demanderCode(email: string): Promise<ModeCode> {
    const liaison = await this.client.auth.updateUser({ email });
    if (!liaison.error) return 'liaison';
    if (!emailDejaUtilise(liaison.error)) throw new ErreurCompte(genreDe(liaison.error));
    const connexion = await this.client.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
    if (connexion.error) throw new ErreurCompte(genreDe(connexion.error));
    return 'connexion';
  }

  async confirmerCode(email: string, code: string, mode: ModeCode): Promise<EtatCompte> {
    const { data, error } = await this.client.auth.verifyOtp({
      email,
      token: code,
      type: mode === 'liaison' ? 'email_change' : 'email',
    });
    if (error || !data.user) throw new ErreurCompte(error ? genreDe(error) : 'inconnue');
    return etatDe(data.user);
  }
}
```

`mobile/src/compte/authSupabase.test.ts` (client factice, aucun réseau) :

```ts
import type { SupabaseClient } from '@supabase/supabase-js';

import { ErreurCompte } from './auth';
import { AuthSupabase, genreDe } from './authSupabase';

const utilisateur = (surcharge = {}) => ({ id: 'u1', email: '', is_anonymous: true, ...surcharge });

function clientFactice(auth: Record<string, jest.Mock>) {
  return { auth } as unknown as SupabaseClient;
}

describe('AuthSupabase', () => {
  it('lie l’e-mail à la session anonyme', async () => {
    const updateUser = jest.fn(async () => ({ data: {}, error: null }));
    const signInWithOtp = jest.fn();
    const auth = new AuthSupabase(clientFactice({ updateUser, signInWithOtp }));
    expect(await auth.demanderCode('a@b.fr')).toBe('liaison');
    expect(updateUser).toHaveBeenCalledWith({ email: 'a@b.fr' });
    expect(signInWithOtp).not.toHaveBeenCalled();
  });

  it('bascule vers la connexion quand l’e-mail a déjà un compte', async () => {
    const updateUser = jest.fn(async () => ({ data: {}, error: { code: 'email_exists', name: 'AuthApiError', status: 422 } }));
    const signInWithOtp = jest.fn(async () => ({ data: {}, error: null }));
    const auth = new AuthSupabase(clientFactice({ updateUser, signInWithOtp }));
    expect(await auth.demanderCode('a@b.fr')).toBe('connexion');
    expect(signInWithOtp).toHaveBeenCalledWith({ email: 'a@b.fr', options: { shouldCreateUser: false } });
  });

  it('vérifie le code avec le bon type', async () => {
    const verifyOtp = jest.fn(async () => ({ data: { user: utilisateur({ email: 'a@b.fr', is_anonymous: false }) }, error: null }));
    const auth = new AuthSupabase(clientFactice({ verifyOtp }));
    expect(await auth.confirmerCode('a@b.fr', '123456', 'liaison')).toEqual({ utilisateurId: 'u1', email: 'a@b.fr', anonyme: false });
    expect(verifyOtp).toHaveBeenCalledWith({ email: 'a@b.fr', token: '123456', type: 'email_change' });
    await auth.confirmerCode('a@b.fr', '123456', 'connexion');
    expect(verifyOtp).toHaveBeenLastCalledWith({ email: 'a@b.fr', token: '123456', type: 'email' });
  });

  it('traduit les erreurs en genres affichables', async () => {
    const verifyOtp = jest.fn(async () => ({ data: { user: null }, error: { code: 'otp_expired', name: 'AuthApiError', status: 403 } }));
    const auth = new AuthSupabase(clientFactice({ verifyOtp }));
    await expect(auth.confirmerCode('a@b.fr', '000000', 'liaison')).rejects.toEqual(new ErreurCompte('code-invalide'));
    expect(genreDe({ name: 'AuthRetryableFetchError', status: 0, code: undefined })).toBe('reseau');
    expect(genreDe({ name: 'AuthApiError', status: 429, code: 'over_email_send_rate_limit' })).toBe('trop-de-tentatives');
    expect(genreDe({ name: 'AuthApiError', status: 500, code: 'unexpected_failure' })).toBe('inconnue');
  });

  it('reprend ou crée la session', async () => {
    const getSession = jest.fn(async () => ({ data: { session: null }, error: null }));
    const signInAnonymously = jest.fn(async () => ({ data: { user: utilisateur() }, error: null }));
    const auth = new AuthSupabase(clientFactice({ getSession, signInAnonymously }));
    expect(await auth.sessionCourante()).toBeNull();
    expect(await auth.creerSessionAnonyme()).toEqual({ utilisateurId: 'u1', email: null, anonyme: true });
  });
});
```

(Si `ErreurCompte` égale mal avec `toEqual`, comparer `.genre` via `rejects.toMatchObject({ genre: 'code-invalide' })`.)

`mobile/src/synchro/serveurSupabase.ts` :

```ts
import type { SupabaseClient } from '@supabase/supabase-js';

import { estEntreeJournal, TAILLE_MAX_JOURNAL, type EntreeJournal } from '../journal/journal';
import type { ServeurJournal } from './serveur';

export interface LigneSeance {
  id: string;
  debut: string;
  contexte_id: string;
  ressenti: string;
  duree: number;
  graine: number;
  exercices: string[];
  ecoule_ms: number;
  exercices_faits: number;
  terminee: boolean;
  apres: string | null;
}

const COLONNES = 'id,debut,contexte_id,ressenti,duree,graine,exercices,ecoule_ms,exercices_faits,terminee,apres';

export function versLigne(e: EntreeJournal): LigneSeance {
  return {
    id: e.id,
    debut: e.debut,
    contexte_id: e.contexteId,
    ressenti: e.ressenti,
    duree: e.duree,
    graine: e.graine,
    exercices: e.exercices,
    ecoule_ms: Math.round(e.ecouleMs),
    exercices_faits: e.exercicesFaits,
    terminee: e.terminee,
    apres: e.apres,
  };
}

// Une ligne abîmée ou d'un format futur est ignorée plutôt que de casser la restauration.
export function depuisLigne(ligne: unknown): EntreeJournal | null {
  if (typeof ligne !== 'object' || ligne === null) return null;
  const l = ligne as Partial<LigneSeance>;
  const debut = typeof l.debut === 'string' && !Number.isNaN(Date.parse(l.debut)) ? new Date(l.debut).toISOString() : null;
  const entree: unknown = {
    id: l.id,
    debut,
    contexteId: l.contexte_id,
    ressenti: l.ressenti,
    duree: l.duree,
    graine: l.graine,
    exercices: l.exercices,
    ecouleMs: l.ecoule_ms,
    exercicesFaits: l.exercices_faits,
    terminee: l.terminee,
    apres: l.apres,
  };
  return estEntreeJournal(entree) ? entree : null;
}

export class ServeurSupabase implements ServeurJournal {
  constructor(private readonly client: SupabaseClient) {}

  async envoyer(entrees: EntreeJournal[]): Promise<void> {
    const misAJour = new Date().toISOString();
    const { error } = await this.client
      .from('seances')
      .upsert(entrees.map((e) => ({ ...versLigne(e), mis_a_jour: misAJour })), { onConflict: 'user_id,id' });
    if (error) throw error;
  }

  async recuperer(): Promise<EntreeJournal[]> {
    const { data, error } = await this.client
      .from('seances')
      .select(COLONNES)
      .order('debut', { ascending: false })
      .limit(TAILLE_MAX_JOURNAL);
    if (error) throw error;
    return (data ?? []).map(depuisLigne).filter((e): e is EntreeJournal => e !== null);
  }
}
```

`mobile/src/synchro/serveurSupabase.test.ts` :

```ts
import { fabriquerEntree } from '../test-utils/journal';
import { depuisLigne, versLigne } from './serveurSupabase';

describe('conversion séance ↔ ligne', () => {
  it('fait l’aller-retour sans perte', () => {
    const entree = fabriquerEntree({ apres: 'mieux' });
    expect(depuisLigne(versLigne(entree))).toEqual(entree);
  });

  it('normalise la date renvoyée par Postgres', () => {
    const entree = fabriquerEntree();
    const ligne = { ...versLigne(entree), debut: entree.debut.replace('Z', '+00:00') };
    expect(depuisLigne(ligne)?.debut).toBe(entree.debut);
  });

  it('ignore une ligne invalide', () => {
    expect(depuisLigne({ ...versLigne(fabriquerEntree()), duree: 7 })).toBeNull();
    expect(depuisLigne(null)).toBeNull();
    expect(depuisLigne({ ...versLigne(fabriquerEntree()), debut: 'pas une date' })).toBeNull();
  });
});
```

Run `npx jest src/compte src/synchro` → PASS (après avoir constaté l'échec avant chaque implémentation).

- [ ] **Step 7: Instances de l'app et déclencheurs**

`mobile/src/synchro/instance.ts` :

```ts
import { AuthSupabase } from '../compte/authSupabase';
import type { Authentification } from '../compte/auth';
import { creerClient } from '../compte/client';
import { configurationSupabase } from '../compte/configuration';
import { stockageTelephone } from '../preferences/stockage';
import { creerMoteur, type Moteur } from './moteur';
import { ServeurSupabase } from './serveurSupabase';

// Sans configuration Supabase, tout reste à null : l'app est exactement celle d'avant le jalon 4.
const configuration = configurationSupabase();
const client = configuration ? creerClient(configuration) : null;

export const authApp: Authentification | null = client ? new AuthSupabase(client) : null;
export const moteurApp: Moteur | null =
  client && authApp ? creerMoteur({ stockage: stockageTelephone, serveur: new ServeurSupabase(client), auth: authApp }) : null;

// Appelée sans attendre par les écrans : ne bloque ni ne rejette jamais.
export function demanderSynchro(): void {
  moteurApp?.demanderSynchro().catch(() => undefined);
}
```

`mobile/src/synchro/useSynchro.ts` :

```ts
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { demanderSynchro } from './instance';

// Monté une fois à la racine : au démarrage, puis à chaque retour de l'app au premier plan.
export function useSynchro(): void {
  useEffect(() => {
    demanderSynchro();
    const abonnement = AppState.addEventListener('change', (etat) => {
      if (etat === 'active') demanderSynchro();
    });
    return () => abonnement.remove();
  }, []);
}
```

Branchements :
- `mobile/app/_layout.tsx` : `import { useSynchro } from '../src/synchro/useSynchro';` et appeler `useSynchro();` en tête de `RootLayout` (avant `useFonts`, les hooks restant inconditionnels).
- `mobile/app/seance.tsx` : `import { demanderSynchro } from '../src/synchro/instance';` ; dans l'effet de fin (`etat.termine && aLeFocus`), remplacer l'appel `mettreAJourEntree(stockageTelephone, idJournal, {...});` par `mettreAJourEntree(stockageTelephone, idJournal, {...}).then(demanderSynchro);`.
- `mobile/app/bravo.tsx` : même import ; dans `repondre`, `mettreAJourEntree(stockageTelephone, params.seance, { apres }).then(demanderSynchro);`.

Tests d'écran à ajouter dans `mobile/__tests__/ecrans.test.tsx` : mocker l'instance en tête de fichier

```ts
jest.mock('../src/synchro/instance', () => ({ authApp: null, moteurApp: null, demanderSynchro: jest.fn() }));
```

puis (avec `import { demanderSynchro } from '../src/synchro/instance';`) ajouter :
- au rendu de la route `/` via `renderRouter(ROUTES, …)`, `demanderSynchro` a été appelé au moins une fois (démarrage) ;
- après une séance menée jusqu'à Bravo (reprendre le parcours d'un test existant qui arrive sur `/bravo`), `demanderSynchro` est appelé après la fin de séance, puis encore après un tap sur « Mieux » (`await waitFor(() => expect(demanderSynchro).toHaveBeenCalledTimes(n))` avec le compte relevé avant l'action + 1). Remettre le compteur à zéro dans le `beforeEach` existant (`jest.mocked(demanderSynchro).mockClear()`).

Vérifier aussi qu'aucun test existant ne casse parce que `_layout` importe désormais `useSynchro` (l'instance est mockée).

- [ ] **Step 8: Migration SQL**

`supabase/migrations/20261019000000_seances.sql` :

```sql
-- Journal des séances sauvegardé depuis l'app (jalon 4). Chacun ne voit que ses lignes.
create table public.seances (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id text not null,
  debut timestamptz not null,
  contexte_id text not null,
  ressenti text not null check (ressenti in ('raide', 'stresse', 'mou', 'en_forme')),
  duree smallint not null check (duree in (3, 5, 10)),
  graine bigint not null,
  exercices text[] not null,
  ecoule_ms integer not null check (ecoule_ms >= 0),
  exercices_faits smallint not null check (exercices_faits >= 0),
  terminee boolean not null,
  apres text check (apres in ('mieux', 'pareil')),
  mis_a_jour timestamptz not null default now(),
  primary key (user_id, id)
);

alter table public.seances enable row level security;

-- Les utilisateurs anonymes ont aussi le rôle « authenticated ».
create policy "seances : lire les siennes" on public.seances
  for select to authenticated using (user_id = (select auth.uid()));

create policy "seances : créer les siennes" on public.seances
  for insert to authenticated with check (user_id = (select auth.uid()));

create policy "seances : modifier les siennes" on public.seances
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Pas de politique delete : la suppression du compte et des données arrive au jalon 6.
```

- [ ] **Step 9: Guide `docs/supabase.md`**

Écrire `docs/supabase.md` (français, pas à pas, pour Mattia) avec exactement ces sections :
1. **Créer le projet** : supabase.com → New project, région « Central EU (Frankfurt) », mot de passe de base conservé dans un gestionnaire de mots de passe.
2. **Activer les connexions anonymes** : Authentication → Sign In / Providers → « Allow anonymous sign-ins » ; et « Allow manual linking » (nécessaire pour rattacher un e-mail à une session anonyme).
3. **Code par e-mail** : Authentication → Providers → Email activé, « Confirm email » activé ; Authentication → Emails → modèles « Change Email Address » et « Magic Link » : remplacer le lien par le code `{{ .Token }}` (exemple de texte en français : « Ton code Flash Coach : {{ .Token }} »). Longueur du code : 6 chiffres.
4. **Créer la table** : SQL Editor → coller le contenu de `supabase/migrations/20261019000000_seances.sql` → Run.
5. **Brancher l'app** : Project Settings → API Keys → copier l'URL du projet et la clé « publishable » ; créer `mobile/.env.local` :
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://<ton-projet>.supabase.co
   EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```
   Ce fichier est ignoré par git (`.env*.local`). Ne jamais y mettre la clé `service_role` / secrète. Relancer `npx expo start`.
6. **Vérifier** : faire une séance sur le téléphone → Table Editor → `seances` contient une ligne ; Authentication → Users montre un utilisateur anonyme ; tester « Sauvegarder mon journal » avec son e-mail.
7. **Avant la publication (jalon 6/7)** : le service d'e-mail intégré est limité (quelques e-mails par heure) → configurer un SMTP ; activer un CAPTCHA (Turnstile) contre les abus de connexions anonymes ; limite par IP des connexions anonymes (30/h par défaut).

- [ ] **Step 10: Vérifier et committer**

Run depuis `mobile/` : `npx jest`, `npm run typecheck`, `npm run lint` → propres. Vérifier `git status` : ni `.env.local`, ni `.claude/`, ni `.superpowers/`.

```bash
git add mobile/package.json mobile/package-lock.json mobile/src/compte mobile/src/synchro mobile/app/_layout.tsx mobile/app/seance.tsx mobile/app/bravo.tsx mobile/__tests__/ecrans.test.tsx supabase docs/supabase.md
git commit -m "feat: session anonyme et synchro Supabase du journal

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3 (lot 3) : écran « Sauvegarder mon journal » et restauration

**Files:**
- Create: `mobile/src/compte/liaison.ts`, `mobile/src/compte/liaison.test.ts`, `mobile/app/sauvegarde.tsx`, `mobile/__tests__/sauvegarde.test.tsx`
- Modify: `mobile/app/journal.tsx`, `mobile/__tests__/ecrans.test.tsx` (ajouts pour le journal)

**Interfaces:**
- Consumes (Task 2): `authApp: Authentification | null`, `moteurApp: Moteur | null` (`src/synchro/instance.ts`), `Authentification`, `EtatCompte`, `ModeCode`, `ErreurCompte`, `GenreErreur` (`src/compte/auth.ts`), `AuthMemoire` (`src/compte/authMemoire.ts`), `Moteur.restaurerApresConnexion()`.
- Produces: `emailValide(email: string): boolean`, `codeValide(code: string): boolean`, `MESSAGES_ERREUR: Record<GenreErreur, string>`, `messageErreur(erreur: unknown): string`, `DELAI_RENVOI_MS = 30000` (`src/compte/liaison.ts`) ; route `/sauvegarde`.

- [ ] **Step 1: Tests de `liaison` (échouent)**

`mobile/src/compte/liaison.test.ts` :

```ts
import { ErreurCompte } from './auth';
import { codeValide, emailValide, messageErreur } from './liaison';

describe('liaison', () => {
  it('reconnaît une adresse e-mail plausible', () => {
    expect(emailValide('mattia@exemple.fr')).toBe(true);
    expect(emailValide('  mattia@exemple.fr ')).toBe(true);
    expect(emailValide('mattia@exemple')).toBe(false);
    expect(emailValide('mattia exemple.fr')).toBe(false);
    expect(emailValide('')).toBe(false);
  });

  it('attend un code de 6 chiffres', () => {
    expect(codeValide('123456')).toBe(true);
    expect(codeValide('12345')).toBe(false);
    expect(codeValide('12a456')).toBe(false);
  });

  it('donne un message complice selon l’erreur, jamais le détail technique', () => {
    expect(messageErreur(new ErreurCompte('code-invalide'))).toBe('Ce code ne marche pas. Vérifie-le ou demande-en un autre.');
    expect(messageErreur(new ErreurCompte('reseau'))).toBe("Pas de connexion pour l'instant. Réessaie dans un moment.");
    expect(messageErreur(new ErreurCompte('trop-de-tentatives'))).toBe("Trop d'essais d'un coup. Réessaie dans quelques minutes.");
    expect(messageErreur(new Error('fetch failed: 500'))).toBe("Ça n'a pas marché. Réessaie dans un moment.");
  });
});
```

Run → FAIL.

- [ ] **Step 2: Implémenter `liaison.ts`**

```ts
import { ErreurCompte, type GenreErreur } from './auth';

export const DELAI_RENVOI_MS = 30000;

export const MESSAGES_ERREUR: Record<GenreErreur, string> = {
  'code-invalide': 'Ce code ne marche pas. Vérifie-le ou demande-en un autre.',
  reseau: "Pas de connexion pour l'instant. Réessaie dans un moment.",
  'trop-de-tentatives': "Trop d'essais d'un coup. Réessaie dans quelques minutes.",
  inconnue: "Ça n'a pas marché. Réessaie dans un moment.",
};

export const MESSAGE_EMAIL_INVALIDE = 'Vérifie ton adresse e-mail.';

export function emailValide(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function codeValide(code: string): boolean {
  return /^\d{6}$/.test(code);
}

export function messageErreur(erreur: unknown): string {
  return MESSAGES_ERREUR[erreur instanceof ErreurCompte ? erreur.genre : 'inconnue'];
}
```

Run → PASS.

- [ ] **Step 3: Tests de l'écran (échouent)**

`mobile/__tests__/sauvegarde.test.tsx` (même style que `ecrans.test.tsx` : stockage en mémoire mocké, `renderRouter`, RNTL asynchrone) :

```tsx
/// <reference path="../node_modules/expo-router/build/ts-declarations/expect.d.ts" />
import { fireEvent, waitFor } from '@testing-library/react-native';
import { act, renderRouter, screen } from 'expo-router/testing-library';

import Journal from '../app/journal';
import Sauvegarde from '../app/sauvegarde';
import { AuthMemoire } from '../src/compte/authMemoire';
import { ErreurCompte } from '../src/compte/auth';

const mockAuth = new AuthMemoire();
const mockRestaurer = jest.fn(async () => true);

jest.mock('../src/preferences/stockage', () => {
  const { creerStockageMemoire } = jest.requireActual('../src/test-utils/stockageMemoire');
  return { stockageTelephone: creerStockageMemoire() };
});
jest.mock('../src/synchro/instance', () => ({
  get authApp() {
    return mockAuth;
  },
  moteurApp: { demanderSynchro: jest.fn(async () => undefined), restaurerApresConnexion: () => mockRestaurer() },
  demanderSynchro: jest.fn(),
}));

const ROUTES = { journal: Journal, sauvegarde: Sauvegarde };

beforeEach(() => {
  mockAuth.etat = { utilisateurId: 'anonyme-1', email: null, anonyme: true };
  mockAuth.comptes.clear();
  mockAuth.enPanne = false;
  mockRestaurer.mockClear();
});

async function saisirEmail(email: string) {
  await renderRouter(ROUTES, { initialUrl: '/sauvegarde' });
  fireEvent.changeText(screen.getByLabelText('Adresse e-mail'), email);
  await fireEvent.press(screen.getByRole('button', { name: 'Recevoir mon code' }));
}

describe('Sauvegarder mon journal', () => {
  it('lie l’e-mail à la session anonyme avec le code reçu', async () => {
    await saisirEmail('mattia@exemple.fr');
    expect(await screen.findByText('Code envoyé à mattia@exemple.fr')).toBeTruthy();
    fireEvent.changeText(screen.getByLabelText('Code à 6 chiffres'), '123456');
    await fireEvent.press(screen.getByRole('button', { name: 'Valider' }));
    expect(await screen.findByText("C'est sauvegardé.")).toBeTruthy();
    expect(mockAuth.etat).toMatchObject({ email: 'mattia@exemple.fr', anonyme: false });
    expect(mockRestaurer).not.toHaveBeenCalled();
  });

  it('retrouve le journal d’un compte existant', async () => {
    mockAuth.comptes.set('mattia@exemple.fr', 'compte-1');
    await saisirEmail('mattia@exemple.fr');
    fireEvent.changeText(await screen.findByLabelText('Code à 6 chiffres'), '123456');
    await fireEvent.press(screen.getByRole('button', { name: 'Valider' }));
    expect(await screen.findByText('Ton journal est de retour.')).toBeTruthy();
    expect(mockRestaurer).toHaveBeenCalledTimes(1);
  });

  it('dit « C’est sauvegardé. » quand la restauration échoue après une connexion réussie', async () => {
    mockAuth.comptes.set('mattia@exemple.fr', 'compte-1');
    mockRestaurer.mockResolvedValueOnce(false);
    await saisirEmail('mattia@exemple.fr');
    fireEvent.changeText(await screen.findByLabelText('Code à 6 chiffres'), '123456');
    await fireEvent.press(screen.getByRole('button', { name: 'Valider' }));
    expect(await screen.findByText("C'est sauvegardé.")).toBeTruthy();
  });

  it('refuse une adresse mal formée sans rien envoyer', async () => {
    const demanderCode = jest.spyOn(mockAuth, 'demanderCode');
    await saisirEmail('mattia@exemple');
    expect(screen.getByText('Vérifie ton adresse e-mail.')).toBeTruthy();
    expect(demanderCode).not.toHaveBeenCalled();
    demanderCode.mockRestore();
  });

  it('explique un code faux sans quitter l’étape', async () => {
    await saisirEmail('mattia@exemple.fr');
    fireEvent.changeText(await screen.findByLabelText('Code à 6 chiffres'), '000000');
    await fireEvent.press(screen.getByRole('button', { name: 'Valider' }));
    expect(await screen.findByText('Ce code ne marche pas. Vérifie-le ou demande-en un autre.')).toBeTruthy();
    expect(screen.getByLabelText('Code à 6 chiffres')).toBeTruthy();
  });

  it('explique l’absence de réseau', async () => {
    mockAuth.enPanne = true;
    await saisirEmail('mattia@exemple.fr');
    expect(await screen.findByText("Pas de connexion pour l'instant. Réessaie dans un moment.")).toBeTruthy();
  });

  it('bloque « Renvoyer le code » pendant 30 secondes', async () => {
    jest.useFakeTimers();
    try {
      await saisirEmail('mattia@exemple.fr');
      const renvoyer = await screen.findByRole('button', { name: 'Renvoyer le code' });
      expect(renvoyer).toBeDisabled();
      await act(async () => {
        jest.advanceTimersByTime(30000);
      });
      expect(screen.getByRole('button', { name: 'Renvoyer le code' })).toBeEnabled();
    } finally {
      jest.useRealTimers();
    }
  });

  it('permet de changer d’e-mail', async () => {
    await saisirEmail('mattia@exemple.fr');
    await fireEvent.press(await screen.findByRole('button', { name: "Changer d'e-mail" }));
    expect(screen.getByLabelText('Adresse e-mail')).toBeTruthy();
  });

  it('revient au journal à la fin', async () => {
    await renderRouter(ROUTES, { initialUrl: '/journal' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Sauvegarder mon journal' }));
    expect(screen).toHavePathname('/sauvegarde');
    fireEvent.changeText(screen.getByLabelText('Adresse e-mail'), 'mattia@exemple.fr');
    await fireEvent.press(screen.getByRole('button', { name: 'Recevoir mon code' }));
    fireEvent.changeText(await screen.findByLabelText('Code à 6 chiffres'), '123456');
    await fireEvent.press(screen.getByRole('button', { name: 'Valider' }));
    await fireEvent.press(await screen.findByRole('button', { name: 'Retour au journal' }));
    await waitFor(() => expect(screen).toHavePathname('/journal'));
    expect(await screen.findByText('Journal sauvegardé · mattia@exemple.fr')).toBeTruthy();
  });

  it('ne propose plus la sauvegarde une fois le compte lié', async () => {
    mockAuth.etat = { utilisateurId: 'u1', email: 'mattia@exemple.fr', anonyme: false };
    await renderRouter(ROUTES, { initialUrl: '/journal' });
    expect(await screen.findByText('Journal sauvegardé · mattia@exemple.fr')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Sauvegarder mon journal' })).toBeNull();
  });
});
```

Dans `mobile/__tests__/ecrans.test.tsx` (où l'instance est mockée avec `authApp: null`), ajouter : « le journal ne propose pas la sauvegarde sans Supabase » → `queryByRole('button', { name: 'Sauvegarder mon journal' })` est `null` (avec journal vide et avec une entrée).

`ErreurCompte` importé dans le test sert si l'implémenteur ajoute un cas d'erreur `trop-de-tentatives` via `jest.spyOn(mockAuth, 'demanderCode').mockRejectedValueOnce(new ErreurCompte('trop-de-tentatives'))` : ajouter ce cas (message « Trop d'essais d'un coup. Réessaie dans quelques minutes. »).

Run `npx jest __tests__/sauvegarde` → FAIL (route absente).

- [ ] **Step 4: Écran `app/sauvegarde.tsx`**

```tsx
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ModeCode } from '../src/compte/auth';
import { DELAI_RENVOI_MS, MESSAGE_EMAIL_INVALIDE, codeValide, emailValide, messageErreur } from '../src/compte/liaison';
import { authApp, moteurApp } from '../src/synchro/instance';
import { Bouton } from '../src/ui/Bouton';
import { Icone } from '../src/ui/icones';
import { CIBLE_MIN, COULEURS, ELEVATION, ESPACE, RAYON, TYPO } from '../src/ui/theme';
import { ondulation } from '../src/ui/toucher';

type Etape = { nom: 'email' } | { nom: 'code'; mode: ModeCode } | { nom: 'fin'; restaure: boolean };

export default function Sauvegarde() {
  const [etape, setEtape] = useState<Etape>({ nom: 'email' });
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [occupe, setOccupe] = useState(false);
  const [renvoiPossible, setRenvoiPossible] = useState(false);
  const enVol = useRef(false);

  // « Renvoyer le code » reste inactif 30 s après chaque envoi.
  useEffect(() => {
    if (etape.nom !== 'code' || renvoiPossible) return;
    const minuteur = setTimeout(() => setRenvoiPossible(true), DELAI_RENVOI_MS);
    return () => clearTimeout(minuteur);
  }, [etape, renvoiPossible]);

  const retour = () => (router.canGoBack() ? router.back() : router.replace('/journal'));

  // Un seul appel à la fois : un double tap ne renvoie pas deux codes.
  const executer = async (action: () => Promise<void>) => {
    if (enVol.current || authApp === null) return;
    enVol.current = true;
    setOccupe(true);
    setErreur(null);
    try {
      await action();
    } catch (e) {
      setErreur(messageErreur(e));
    } finally {
      enVol.current = false;
      setOccupe(false);
    }
  };

  const recevoirCode = () => {
    const adresse = email.trim();
    if (!emailValide(adresse)) {
      setErreur(MESSAGE_EMAIL_INVALIDE);
      return;
    }
    executer(async () => {
      const mode = await authApp!.demanderCode(adresse);
      setEmail(adresse);
      setCode('');
      setRenvoiPossible(false);
      setEtape({ nom: 'code', mode });
    });
  };

  const valider = () => {
    if (etape.nom !== 'code' || !codeValide(code)) return;
    executer(async () => {
      await authApp!.confirmerCode(email, code, etape.mode);
      const restaure = etape.mode === 'connexion' && moteurApp !== null && (await moteurApp.restaurerApresConnexion());
      if (etape.mode === 'liaison') moteurApp?.demanderSynchro().catch(() => undefined);
      setEtape({ nom: 'fin', restaure });
    });
  };

  return (
    <SafeAreaView style={styles.ecran}>
      <View style={styles.entete}>
        <Pressable accessibilityRole="button" accessibilityLabel="Retour" onPress={retour} android_ripple={ondulation(COULEURS.texte)} style={styles.retour}>
          <Icone nom="retour" taille={28} />
        </Pressable>
      </View>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.contenu} keyboardShouldPersistTaps="handled">
          {etape.nom === 'email' && (
            <>
              <Text style={styles.titre} accessibilityRole="header">Garde ton journal en sécurité</Text>
              <Text style={styles.texte}>On t'envoie un code pour le retrouver sur n'importe quel téléphone.</Text>
              <TextInput
                accessibilityLabel="Adresse e-mail"
                value={email}
                onChangeText={(texte) => {
                  setEmail(texte);
                  setErreur(null);
                }}
                onSubmitEditing={recevoirCode}
                keyboardType="email-address"
                autoComplete="email"
                textContentType="emailAddress"
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="ton@email.fr"
                placeholderTextColor={COULEURS.texteDiscret}
                style={styles.champ}
              />
              {erreur !== null && <Text style={styles.erreur} accessibilityLiveRegion="polite">{erreur}</Text>}
              <Action libelle="Recevoir mon code" occupe={occupe} inactif={email.trim() === ''} onPress={recevoirCode} />
            </>
          )}

          {etape.nom === 'code' && (
            <>
              <Text style={styles.titre} accessibilityRole="header">{`Code envoyé à ${email}`}</Text>
              <TextInput
                accessibilityLabel="Code à 6 chiffres"
                value={code}
                onChangeText={(texte) => {
                  setCode(texte.replace(/\D/g, '').slice(0, 6));
                  setErreur(null);
                }}
                onSubmitEditing={valider}
                keyboardType="number-pad"
                autoComplete="one-time-code"
                textContentType="oneTimeCode"
                maxLength={6}
                style={[styles.champ, styles.champCode]}
              />
              {erreur !== null && <Text style={styles.erreur} accessibilityLiveRegion="polite">{erreur}</Text>}
              <Action libelle="Valider" occupe={occupe} inactif={!codeValide(code)} onPress={valider} />
              <View style={styles.liens}>
                <Lien libelle="Renvoyer le code" inactif={!renvoiPossible || occupe} onPress={recevoirCode} />
                <Lien
                  libelle="Changer d'e-mail"
                  inactif={occupe}
                  onPress={() => {
                    setErreur(null);
                    setEtape({ nom: 'email' });
                  }}
                />
              </View>
            </>
          )}

          {etape.nom === 'fin' && (
            <View style={styles.fin}>
              <View style={styles.coche} aria-hidden>
                <Icone nom="mieux" taille={40} couleur={COULEURS.texteSurOrange} />
              </View>
              <Text style={styles.titre} accessibilityRole="header" accessibilityLiveRegion="polite">
                {etape.restaure ? 'Ton journal est de retour.' : "C'est sauvegardé."}
              </Text>
              <Bouton libelle="Retour au journal" onPress={retour} />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Action({ libelle, occupe, inactif, onPress }: { libelle: string; occupe: boolean; inactif: boolean; onPress: () => void }) {
  const desactive = occupe || inactif;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={libelle}
      accessibilityState={{ disabled: desactive, busy: occupe }}
      disabled={desactive}
      onPress={onPress}
      android_ripple={ondulation(COULEURS.texteSurOrange)}
      style={[styles.action, desactive && styles.actionInactive]}
    >
      {occupe ? <ActivityIndicator color={COULEURS.texteSurOrange} /> : <Text style={styles.texteAction}>{libelle}</Text>}
    </Pressable>
  );
}

function Lien({ libelle, inactif, onPress }: { libelle: string; inactif: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={libelle}
      accessibilityState={{ disabled: inactif }}
      disabled={inactif}
      onPress={onPress}
      android_ripple={ondulation(COULEURS.texte)}
      style={styles.lien}
    >
      <Text style={[styles.texteLien, inactif && styles.texteLienInactif]}>{libelle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: COULEURS.fond },
  flex: { flex: 1 },
  entete: { padding: ESPACE },
  retour: { width: CIBLE_MIN, height: CIBLE_MIN, borderRadius: CIBLE_MIN / 2, alignItems: 'center', justifyContent: 'center' },
  contenu: { paddingHorizontal: ESPACE, paddingBottom: ESPACE * 2, gap: 16 },
  titre: { ...TYPO.headlineMedium, color: COULEURS.texte },
  texte: { ...TYPO.bodyLarge, color: COULEURS.texteDiscret },
  champ: {
    ...TYPO.bodyLarge,
    minHeight: CIBLE_MIN + 8,
    borderRadius: RAYON,
    paddingHorizontal: ESPACE,
    backgroundColor: COULEURS.carte,
    color: COULEURS.texte,
    ...ELEVATION.niveau1,
  },
  champCode: { ...TYPO.headlineMedium, letterSpacing: 8, textAlign: 'center' },
  erreur: { ...TYPO.bodyMedium, color: COULEURS.texte },
  action: { minHeight: CIBLE_MIN, borderRadius: RAYON, backgroundColor: COULEURS.orange, alignItems: 'center', justifyContent: 'center', paddingVertical: 14 },
  actionInactive: { opacity: 0.5 },
  texteAction: { ...TYPO.titleMedium, color: COULEURS.texteSurOrange },
  liens: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 },
  lien: { minHeight: CIBLE_MIN, justifyContent: 'center', paddingHorizontal: 4 },
  texteLien: { ...TYPO.labelLarge, color: COULEURS.texte, textDecorationLine: 'underline' },
  texteLienInactif: { color: COULEURS.texteDiscret, textDecorationLine: 'none' },
  fin: { alignItems: 'center', gap: 20, marginTop: 40 },
  coche: { width: 72, height: 72, borderRadius: 36, backgroundColor: COULEURS.orange, alignItems: 'center', justifyContent: 'center' },
});
```

Notes pour l'implémenteur : vérifier le contraste de `COULEURS.texte` sur `COULEURS.carte` (déjà validé dans `DESIGN.md`) ; le message d'erreur reste en `COULEURS.texte` (pas de rouge : le ton est complice, et l'annonce `accessibilityLiveRegion` porte l'information). Si un test RNTL ne voit pas `toBeDisabled` sur un `Pressable`, s'appuyer sur `accessibilityState.disabled` (déjà posé).

- [ ] **Step 5: Lien et ligne d'état dans le journal**

Dans `mobile/app/journal.tsx` :
1. Imports : `import { authApp } from '../src/synchro/instance';` et `import type { EtatCompte } from '../src/compte/auth';`.
2. État : `const [compte, setCompte] = useState<EtatCompte | null>(null);` ; dans le `useFocusEffect` existant, ajouter (avec la même garde `actif`) :

```ts
      authApp
        ?.sessionCourante()
        .then((etat) => {
          if (actif) setCompte(etat);
        })
        .catch(() => undefined);
```

3. Composant de pied :

```tsx
function PiedSauvegarde({ compte }: { compte: EtatCompte | null }) {
  if (authApp === null) return null;
  if (compte !== null && !compte.anonyme && compte.email !== null) {
    return <Text style={styles.sauvegarde}>{`Journal sauvegardé · ${compte.email}`}</Text>;
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Sauvegarder mon journal"
      onPress={() => router.push('/sauvegarde')}
      android_ripple={ondulation(COULEURS.texte)}
      style={styles.lienSauvegarde}
    >
      <Icone nom="journal" taille={22} />
      <Text style={styles.texteLienSauvegarde}>Sauvegarder mon journal</Text>
    </Pressable>
  );
}
```

4. L'afficher dans l'état vide (sous « Ta première séance apparaîtra ici. ») et en `ListFooterComponent={<PiedSauvegarde compte={compte} />}` de la `FlatList`.
5. Styles :

```ts
  sauvegarde: { ...TYPO.bodyMedium, color: COULEURS.texteDiscret, textAlign: 'center', marginTop: 8 },
  lienSauvegarde: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: CIBLE_MIN, borderRadius: RAYON, marginTop: 8 },
  texteLienSauvegarde: { ...TYPO.labelLarge, color: COULEURS.texte, textDecorationLine: 'underline' },
```

Run `npx jest` → PASS (nouveaux tests compris).

- [ ] **Step 6: Vérification visuelle**

`npx expo start --web --port 8090` (le 8081 peut être occupé) ; au format 375 × 812 et 360 × 740 avec un `.env.local` factice **non commité** (URL `https://exemple.supabase.co`, clé `sb_publishable_test`) pour faire apparaître le lien : journal vide et rempli (lien visible, discret), écran de sauvegarde étapes e-mail et code (clavier, champ, bouton inactif tant que vide), message d'erreur réseau (attendu avec l'URL factice). Supprimer le `.env.local` factice après. Une passe de corrections, une revérification, puis arrêter.

- [ ] **Step 7: Vérifier et committer**

Run depuis `mobile/` : `npx jest`, `npm run typecheck`, `npm run lint` → propres ; `git status` sans `.env.local`.

```bash
git add mobile/src/compte/liaison.ts mobile/src/compte/liaison.test.ts mobile/app/sauvegarde.tsx mobile/app/journal.tsx mobile/__tests__/sauvegarde.test.tsx mobile/__tests__/ecrans.test.tsx
git commit -m "feat: sauvegarde du journal par code e-mail et restauration

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Après les trois lots

Revue finale (Opus ou Codex) de toute la branche contre la spec, puis fusion sur décision de Mattia. Le branchement au vrai Supabase se fait ensuite avec Mattia en suivant `docs/supabase.md` (non couvert par les tests automatiques).
