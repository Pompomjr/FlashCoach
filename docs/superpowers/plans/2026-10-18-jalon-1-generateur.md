# Jalon 1 : squelette, catalogue embarqué et générateur de séances

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal :** une app Expo qui démarre, embarque un catalogue de 10 exercices de test et 5 contextes, et génère des séances de 3, 5 ou 10 minutes qui respectent toujours les contraintes du contexte, avec un test exhaustif et un rapport de couverture du catalogue.

**Architecture :** tout le jalon est du TypeScript pur, sans réseau. `src/catalogue/` contient les types et les données embarquées. `src/generateur/` est une suite de petites fonctions pures (filtres, hasard contrôlé, structure, cibles, génération, couverture), toutes testées avec Jest. L'écran `app/index.tsx` (Expo Router) affiche une séance générée, pour vérifier que l'ensemble s'assemble dans l'app.

**Tech Stack :** Expo (dernier SDK, template `blank-typescript`), Expo Router, TypeScript strict, Jest via `jest-expo`, ESLint via `eslint-config-expo`, `tsx` pour le script de couverture.

**Spec :** pages Notion « Positionnement » (https://app.notion.com/p/3fdbb6b7372c8146828df800a00c5e19) et « Fiche technique » (https://app.notion.com/p/3fdbb6b7372c8145ae9eee2dc2185906). Ce jalon implémente le jalon 1 de la fiche technique, sections 2 à 4.

## Global Constraints

- L'app Expo vit dans `C:\dev\projects\FlashCoach\mobile`. Le dépôt git est à la racine `C:\dev\projects\FlashCoach`. **Toutes les commandes se lancent depuis `mobile/`**, sauf mention contraire.
- TypeScript `strict: true`. Noms de code en français, sans accents dans les identifiants (`catalogue`, `generateur`, `seance`, `contraintes`…).
- Local d'abord : le générateur est une fonction pure, sans réseau ni stockage.
- **Les contraintes ne sont jamais assouplies.** Ordre d'assouplissement quand le catalogue manque : intensité, puis effet, puis répétition d'un exercice.
- Contraintes → filtres : tenue de ville → transpiration faible uniquement **et** pas de sol ; silencieux → pas de sauts ; sur place → exercices « sur place » uniquement ; pas de sol → pas d'exercices au sol.
- Ressenti → cœur de séance : raide → mobilité 1-2 ; stressé → détente 1 ; mou → énergie 1-2 ; en forme → énergie 2-3. Mise en route : mobilité, intensité 1. Retour au calme : détente, intensité 1.
- Durées : 3, 5 ou 10 minutes, remplies **exactement** (180, 300, 600 s). Cœur de 5 min : 4 exercices de 40 s d'effort + 10 s de transition. 10 min : 2 tours de cœur (8 exercices différents).
- Contextes : `reveil` et `maison` gratuits ; `bureau`, `voyage`, `dehors` premium.
- Textes visibles : ton complice, apostrophe typographique `’`. Jamais « pas d'excuse », jamais de promesse de perte de poids.
- Palette : bleu `#3A506B`, orange `#F97316`, gris foncé `#2D3748`, gris clair `#EDF2F7`, noir `#000000`. Jamais de texte blanc sur l'orange (contraste insuffisant).
- Scheme de lien direct : `flashcoach`.
- Chaque commit se termine par la ligne `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Structure des fichiers

```
FlashCoach/
  .gitignore                          ignore .claude/settings.local.json
  docs/superpowers/plans/…            ce plan
  mobile/
    app/_layout.tsx                   pile Expo Router, sans en-tête
    app/index.tsx                     écran provisoire : une séance générée
    eslint.config.js
    scripts/couverture.ts             affiche le rapport de couverture
    src/catalogue/types.ts            types du catalogue + listes RESSENTIS, DUREES
    src/catalogue/exercices.ts        10 exercices de test
    src/catalogue/contextes.ts        5 contextes
    src/catalogue/validation.ts       contrôle d'intégrité du catalogue
    src/catalogue/catalogue.test.ts
    src/test-utils/fabrique.ts        fabriquerExercice(), SANS_CONTRAINTE (tests seulement)
    src/generateur/types.ts           Phase, Bloc, ParametresSeance, Seance, NiveauAssouplissement
    src/generateur/filtres.ts         contraintes → filtre strict
    src/generateur/aleatoire.ts       hasard contrôlé par graine
    src/generateur/structure.ts       phases et minutage par durée
    src/generateur/cibles.ts          ressenti/phase → cible, correspondance par niveau
    src/generateur/generer.ts         genererSeance()
    src/generateur/couverture.ts      analyserCouverture(), formaterRapport()
    src/generateur/*.test.ts          tests à côté de chaque module
```

---

### Task 1 : squelette Expo et catalogue embarqué

**Files :**
- Create : `.gitignore` (racine), projet `mobile/` (généré), `mobile/app/_layout.tsx`, `mobile/app/index.tsx`, `mobile/eslint.config.js`
- Create : `mobile/src/catalogue/types.ts`, `mobile/src/catalogue/exercices.ts`, `mobile/src/catalogue/contextes.ts`, `mobile/src/catalogue/validation.ts`, `mobile/src/test-utils/fabrique.ts`
- Delete : `mobile/App.tsx`, `mobile/index.ts`
- Test : `mobile/src/catalogue/catalogue.test.ts`

**Interfaces :**
- Consumes : rien.
- Produces :
  - `src/catalogue/types.ts` : types `Tenue`, `Bruit`, `Espace`, `Transpiration`, `Effet`, `Zone`, `Intensite`, `Ressenti`, `Duree`, interfaces `Contraintes`, `Exercice`, `Contexte`, constantes `RESSENTIS: readonly Ressenti[]`, `DUREES: readonly Duree[]`.
  - `EXERCICES: Exercice[]` (`src/catalogue/exercices.ts`), `CONTEXTES: Contexte[]` (`src/catalogue/contextes.ts`, `CONTEXTES[0]` est `reveil`).
  - `validerCatalogue(exercices: Exercice[], contextes: Contexte[]): string[]` (liste d'erreurs, vide si tout va bien).
  - `fabriquerExercice(surcharge?: Partial<Exercice>): Exercice` et `SANS_CONTRAINTE: Contraintes` (`src/test-utils/fabrique.ts`).

- [ ] **Step 1 : initialiser le dépôt git à la racine**

Depuis `C:\dev\projects\FlashCoach` :

```bash
git init -b main
printf '.claude/settings.local.json\n' > .gitignore
```

Le dépôt doit exister **avant** de créer l'app, pour que `create-expo-app` n'en crée pas un second dans `mobile/`.

- [ ] **Step 2 : créer l'app Expo**

Depuis `C:\dev\projects\FlashCoach` :

```bash
npx create-expo-app@latest mobile --template blank-typescript
```

Expected : un dossier `mobile/` avec `package.json`, `app.json`, `tsconfig.json`, `App.tsx`, `index.ts`, `assets/`.

- [ ] **Step 3 : installer Expo Router, le web et les outils**

Depuis `mobile/` :

```bash
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar react-dom react-native-web @expo/metro-runtime
npx expo install -- --save-dev jest-expo jest @types/jest eslint eslint-config-expo
npm install --save-dev tsx
```

- [ ] **Step 4 : configurer package.json et app.json**

Depuis `mobile/` :

```bash
npm pkg set main=expo-router/entry
npm pkg set scripts.test=jest scripts.typecheck="tsc --noEmit" scripts.lint="expo lint" scripts.couverture="tsx scripts/couverture.ts"
npm pkg set jest.preset=jest-expo
node -e "const fs=require('fs');const j=JSON.parse(fs.readFileSync('app.json','utf8'));j.expo.name='Flash Coach';j.expo.slug='flashcoach';j.expo.scheme='flashcoach';j.expo.plugins=[...(j.expo.plugins||[]).filter(p=>p!=='expo-router'),'expo-router'];fs.writeFileSync('app.json',JSON.stringify(j,null,2)+'\n')"
rm App.tsx index.ts
```

Puis vérifier que `tsconfig.json` contient bien `"strict": true` dans `compilerOptions` (c'est le cas du template ; sinon l'ajouter).

- [ ] **Step 5 : écrire la configuration ESLint**

`mobile/eslint.config.js` :

```js
// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
]);
```

- [ ] **Step 6 : écrire la pile de navigation et l'écran provisoire**

`mobile/app/_layout.tsx` :

```tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

`mobile/app/index.tsx` (remplacé à la Task 8) :

```tsx
import { StyleSheet, Text, View } from 'react-native';

export default function Accueil() {
  return (
    <View style={styles.conteneur}>
      <Text style={styles.titre}>Flash Coach</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EDF2F7' },
  titre: { fontSize: 32, fontWeight: '700', color: '#3A506B' },
});
```

- [ ] **Step 7 : écrire la fabrique de test**

`mobile/src/test-utils/fabrique.ts` :

```ts
import type { Contraintes, Exercice } from '../catalogue/types';

// Exercice neutre pour les tests : chaque test surcharge seulement ce qui l’intéresse.
export function fabriquerExercice(surcharge: Partial<Exercice> = {}): Exercice {
  return {
    id: 'exercice-test',
    nom: 'Exercice test',
    consigne: 'Consigne de test.',
    animation: 'test.json',
    sol: false,
    sauts: false,
    transpiration: 'faible',
    espace: 'sur_place',
    effets: ['energie'],
    intensite: 2,
    zone: 'global',
    bilateral: false,
    ...surcharge,
  };
}

export const SANS_CONTRAINTE: Contraintes = {
  tenue: 'sport',
  bruit: 'normal',
  espace: 'un_peu',
  sol: true,
};
```

- [ ] **Step 8 : écrire le test du catalogue (il doit échouer)**

`mobile/src/catalogue/catalogue.test.ts` :

```ts
import { fabriquerExercice } from '../test-utils/fabrique';
import { CONTEXTES } from './contextes';
import { EXERCICES } from './exercices';
import { validerCatalogue } from './validation';

describe('validerCatalogue', () => {
  it('accepte le catalogue embarqué', () => {
    expect(validerCatalogue(EXERCICES, CONTEXTES)).toEqual([]);
  });

  it('signale un exercice en double', () => {
    const ex = fabriquerExercice({ id: 'a' });
    expect(validerCatalogue([ex, ex], [])).toContain('Exercice en double : a');
  });

  it('signale un exercice sans effet', () => {
    expect(validerCatalogue([fabriquerExercice({ id: 'b', effets: [] })], [])).toContain(
      'Exercice sans effet : b',
    );
  });

  it('signale une animation qui n’est pas un fichier Lottie', () => {
    expect(validerCatalogue([fabriquerExercice({ id: 'c', animation: 'c.png' })], [])).toContain(
      'Animation invalide : c',
    );
  });

  it('signale un contexte en double', () => {
    const ctx = CONTEXTES[0];
    expect(validerCatalogue([], [ctx, ctx])).toContain(`Contexte en double : ${ctx.id}`);
  });
});

describe('catalogue embarqué', () => {
  it('contient 10 exercices de test', () => {
    expect(EXERCICES).toHaveLength(10);
  });

  it('propose 5 contextes, dans l’ordre d’affichage', () => {
    expect(CONTEXTES.map((c) => c.id)).toEqual(['reveil', 'maison', 'bureau', 'voyage', 'dehors']);
  });

  it('rend gratuits uniquement Au réveil et À la maison', () => {
    expect(CONTEXTES.filter((c) => !c.premium).map((c) => c.id)).toEqual(['reveil', 'maison']);
  });

  it('règle le bureau en tenue de ville, silencieux, sur place, sans sol', () => {
    const bureau = CONTEXTES.find((c) => c.id === 'bureau');
    expect(bureau?.contraintes).toEqual({
      tenue: 'ville',
      bruit: 'silencieux',
      espace: 'sur_place',
      sol: false,
    });
  });
});
```

- [ ] **Step 9 : lancer le test pour vérifier qu'il échoue**

Run : `npx jest src/catalogue`
Expected : FAIL avec `Cannot find module './contextes'`.

- [ ] **Step 10 : écrire les types du catalogue**

`mobile/src/catalogue/types.ts` :

```ts
export type Tenue = 'sport' | 'ville';
export type Bruit = 'normal' | 'silencieux';
export type Espace = 'sur_place' | 'un_peu';
export type Transpiration = 'faible' | 'moyenne' | 'elevee';
export type Effet = 'mobilite' | 'detente' | 'energie';
export type Zone = 'haut' | 'bas' | 'tronc' | 'global';
export type Intensite = 1 | 2 | 3;
export type Ressenti = 'raide' | 'stresse' | 'mou' | 'en_forme';
export type Duree = 3 | 5 | 10;

export const RESSENTIS: readonly Ressenti[] = ['raide', 'stresse', 'mou', 'en_forme'];
export const DUREES: readonly Duree[] = [3, 5, 10];

export interface Contraintes {
  tenue: Tenue;
  bruit: Bruit;
  espace: Espace;
  sol: boolean;
}

export interface Exercice {
  id: string;
  nom: string;
  consigne: string;
  animation: string;
  sol: boolean;
  sauts: boolean;
  transpiration: Transpiration;
  espace: Espace;
  effets: Effet[];
  intensite: Intensite;
  zone: Zone;
  // Si vrai, le lecteur de séance (jalon 2) fait le côté gauche puis le droit.
  bilateral: boolean;
}

// Un contexte n'est qu'un réglage de contraintes déjà rempli : en ajouter un ne demande pas de nouvelle version de l'app.
export interface Contexte {
  id: string;
  nom: string;
  emoji: string;
  contraintes: Contraintes;
  premium: boolean;
  ordre: number;
}
```

- [ ] **Step 11 : écrire les 10 exercices de test**

`mobile/src/catalogue/exercices.ts` :

```ts
import type { Exercice } from './types';

// Catalogue de test du jalon 1 : 10 exercices pour faire tourner le générateur.
// Le contenu réel (40-60 exercices + animations Lottie) arrive au jalon 7.
export const EXERCICES: Exercice[] = [
  {
    id: 'rotation-epaules',
    nom: 'Rotation des épaules',
    consigne: 'Grands cercles, lentement, comme si tu dessinais avec tes coudes.',
    animation: 'rotation-epaules.json',
    sol: false,
    sauts: false,
    transpiration: 'faible',
    espace: 'sur_place',
    effets: ['mobilite'],
    intensite: 1,
    zone: 'haut',
    bilateral: false,
  },
  {
    id: 'respiration-carree',
    nom: 'Respiration carrée',
    consigne: 'Inspire 4 secondes, bloque 4, souffle 4, bloque 4. Rien d’autre à faire.',
    animation: 'respiration-carree.json',
    sol: false,
    sauts: false,
    transpiration: 'faible',
    espace: 'sur_place',
    effets: ['detente'],
    intensite: 1,
    zone: 'global',
    bilateral: false,
  },
  {
    id: 'inclinaison-laterale',
    nom: 'Inclinaison latérale',
    consigne: 'Bras au-dessus de la tête, tu te penches doucement sur le côté. Tu respires, tu t’étires.',
    animation: 'inclinaison-laterale.json',
    sol: false,
    sauts: false,
    transpiration: 'faible',
    espace: 'sur_place',
    effets: ['mobilite', 'detente'],
    intensite: 1,
    zone: 'tronc',
    bilateral: true,
  },
  {
    id: 'pompes-mur',
    nom: 'Pompes contre le mur',
    consigne: 'Mains sur le mur, corps bien droit : tu rapproches le nez du mur, puis tu repousses.',
    animation: 'pompes-mur.json',
    sol: false,
    sauts: false,
    transpiration: 'faible',
    espace: 'sur_place',
    effets: ['energie'],
    intensite: 2,
    zone: 'haut',
    bilateral: false,
  },
  {
    id: 'squat-lent',
    nom: 'Squat lent',
    consigne: 'Pieds écartés, tu descends comme pour t’asseoir sur une chaise invisible, puis tu remontes.',
    animation: 'squat-lent.json',
    sol: false,
    sauts: false,
    transpiration: 'moyenne',
    espace: 'sur_place',
    effets: ['energie'],
    intensite: 2,
    zone: 'bas',
    bilateral: false,
  },
  {
    id: 'marche-genoux-hauts',
    nom: 'Marche genoux hauts',
    consigne: 'Sur place, tu montes les genoux à hauteur de hanches, sans sauter : les voisins dorment.',
    animation: 'marche-genoux-hauts.json',
    sol: false,
    sauts: false,
    transpiration: 'moyenne',
    espace: 'sur_place',
    effets: ['energie'],
    intensite: 2,
    zone: 'global',
    bilateral: false,
  },
  {
    id: 'jumping-jacks',
    nom: 'Jumping jacks',
    consigne: 'Tu sautes en écartant bras et jambes, puis tu reviens. On réveille tout le corps !',
    animation: 'jumping-jacks.json',
    sol: false,
    sauts: true,
    transpiration: 'elevee',
    espace: 'un_peu',
    effets: ['energie'],
    intensite: 3,
    zone: 'global',
    bilateral: false,
  },
  {
    id: 'fentes-arriere',
    nom: 'Fentes arrière',
    consigne: 'Un grand pas en arrière, le genou descend vers le sol, et tu reviens. Une jambe, puis l’autre.',
    animation: 'fentes-arriere.json',
    sol: false,
    sauts: false,
    transpiration: 'moyenne',
    espace: 'un_peu',
    effets: ['energie'],
    intensite: 2,
    zone: 'bas',
    bilateral: true,
  },
  {
    id: 'chat-vache',
    nom: 'Chat-vache',
    consigne: 'À quatre pattes, tu arrondis le dos comme un chat, puis tu le creuses doucement.',
    animation: 'chat-vache.json',
    sol: true,
    sauts: false,
    transpiration: 'faible',
    espace: 'sur_place',
    effets: ['mobilite'],
    intensite: 1,
    zone: 'tronc',
    bilateral: false,
  },
  {
    id: 'planche',
    nom: 'Planche',
    consigne: 'Sur les avant-bras, corps gainé des talons à la tête. Tu respires, tu tiens.',
    animation: 'planche.json',
    sol: true,
    sauts: false,
    transpiration: 'moyenne',
    espace: 'sur_place',
    effets: ['energie'],
    intensite: 3,
    zone: 'tronc',
    bilateral: false,
  },
];
```

- [ ] **Step 12 : écrire les 5 contextes**

`mobile/src/catalogue/contextes.ts` :

```ts
import type { Contexte } from './types';

export const CONTEXTES: Contexte[] = [
  {
    id: 'reveil',
    nom: 'Au réveil',
    emoji: '🛏️',
    premium: false,
    ordre: 1,
    // En pyjama : tenue souple, mais petit espace et silence (la maison dort encore).
    contraintes: { tenue: 'sport', bruit: 'silencieux', espace: 'sur_place', sol: true },
  },
  {
    id: 'maison',
    nom: 'À la maison',
    emoji: '🏠',
    premium: false,
    ordre: 2,
    contraintes: { tenue: 'sport', bruit: 'normal', espace: 'un_peu', sol: true },
  },
  {
    id: 'bureau',
    nom: 'Au bureau',
    emoji: '💼',
    premium: true,
    ordre: 3,
    contraintes: { tenue: 'ville', bruit: 'silencieux', espace: 'sur_place', sol: false },
  },
  {
    id: 'voyage',
    nom: 'En voyage',
    emoji: '🧳',
    premium: true,
    ordre: 4,
    contraintes: { tenue: 'sport', bruit: 'silencieux', espace: 'sur_place', sol: true },
  },
  {
    id: 'dehors',
    nom: 'Dehors',
    emoji: '🌳',
    premium: true,
    ordre: 5,
    contraintes: { tenue: 'sport', bruit: 'normal', espace: 'un_peu', sol: false },
  },
];
```

- [ ] **Step 13 : écrire la validation du catalogue**

`mobile/src/catalogue/validation.ts` :

```ts
import type { Contexte, Exercice } from './types';

// Contrôle d'intégrité, utile dès que le catalogue grossit (jalon 7) ou vient de Supabase (jalon 4).
export function validerCatalogue(exercices: Exercice[], contextes: Contexte[]): string[] {
  const erreurs: string[] = [];

  const idsExercices = new Set<string>();
  for (const ex of exercices) {
    if (idsExercices.has(ex.id)) erreurs.push(`Exercice en double : ${ex.id}`);
    idsExercices.add(ex.id);
    if (ex.effets.length === 0) erreurs.push(`Exercice sans effet : ${ex.id}`);
    if (!ex.animation.endsWith('.json')) erreurs.push(`Animation invalide : ${ex.id}`);
    if (ex.consigne.trim() === '') erreurs.push(`Consigne vide : ${ex.id}`);
  }

  const idsContextes = new Set<string>();
  for (const ctx of contextes) {
    if (idsContextes.has(ctx.id)) erreurs.push(`Contexte en double : ${ctx.id}`);
    idsContextes.add(ctx.id);
  }

  return erreurs;
}
```

- [ ] **Step 14 : lancer les tests, le typage et le lint**

Run : `npx jest src/catalogue && npm run typecheck && npm run lint`
Expected : 9 tests PASS, aucune erreur TypeScript, aucune erreur ESLint.

- [ ] **Step 15 : vérifier que l'app se construit**

Run : `npx expo export --platform web`
Expected : export réussi dans `dist/` (ignoré par git via le `.gitignore` du template ; sinon ajouter `dist/` à `mobile/.gitignore`).

- [ ] **Step 16 : commit**

Depuis `C:\dev\projects\FlashCoach` :

```bash
git add .gitignore docs mobile
git commit -m "feat: squelette Expo et catalogue embarqué de test" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2 : filtres de contraintes

**Files :**
- Create : `mobile/src/generateur/filtres.ts`
- Test : `mobile/src/generateur/filtres.test.ts`

**Interfaces :**
- Consumes : `Contraintes`, `Exercice` (`src/catalogue/types.ts`) ; `fabriquerExercice`, `SANS_CONTRAINTE` (`src/test-utils/fabrique.ts`).
- Produces : `respecteContraintes(exercice: Exercice, contraintes: Contraintes): boolean` et `filtrerCatalogue(catalogue: Exercice[], contraintes: Contraintes): Exercice[]`.

- [ ] **Step 1 : écrire le test (il doit échouer)**

`mobile/src/generateur/filtres.test.ts` :

```ts
import type { Contraintes } from '../catalogue/types';
import { fabriquerExercice, SANS_CONTRAINTE } from '../test-utils/fabrique';
import { filtrerCatalogue, respecteContraintes } from './filtres';

describe('respecteContraintes', () => {
  it('accepte tout quand rien ne limite', () => {
    const exigeant = fabriquerExercice({ sol: true, sauts: true, transpiration: 'elevee', espace: 'un_peu' });
    expect(respecteContraintes(exigeant, SANS_CONTRAINTE)).toBe(true);
  });

  it('en tenue de ville, refuse ce qui fait transpirer', () => {
    const ville: Contraintes = { ...SANS_CONTRAINTE, tenue: 'ville' };
    expect(respecteContraintes(fabriquerExercice({ transpiration: 'moyenne' }), ville)).toBe(false);
    expect(respecteContraintes(fabriquerExercice({ transpiration: 'faible' }), ville)).toBe(true);
  });

  it('en tenue de ville, refuse le sol même sans transpiration', () => {
    const ville: Contraintes = { ...SANS_CONTRAINTE, tenue: 'ville' };
    expect(respecteContraintes(fabriquerExercice({ transpiration: 'faible', sol: true }), ville)).toBe(false);
  });

  it('en silencieux, refuse les sauts', () => {
    const silencieux: Contraintes = { ...SANS_CONTRAINTE, bruit: 'silencieux' };
    expect(respecteContraintes(fabriquerExercice({ sauts: true }), silencieux)).toBe(false);
    expect(respecteContraintes(fabriquerExercice({ sauts: false }), silencieux)).toBe(true);
  });

  it('sur place, refuse ce qui demande de la place', () => {
    const surPlace: Contraintes = { ...SANS_CONTRAINTE, espace: 'sur_place' };
    expect(respecteContraintes(fabriquerExercice({ espace: 'un_peu' }), surPlace)).toBe(false);
    expect(respecteContraintes(fabriquerExercice({ espace: 'sur_place' }), surPlace)).toBe(true);
  });

  it('sans sol, refuse les exercices au sol', () => {
    const sansSol: Contraintes = { ...SANS_CONTRAINTE, sol: false };
    expect(respecteContraintes(fabriquerExercice({ sol: true }), sansSol)).toBe(false);
    expect(respecteContraintes(fabriquerExercice({ sol: false }), sansSol)).toBe(true);
  });
});

describe('filtrerCatalogue', () => {
  it('ne garde que les exercices compatibles, dans le même ordre', () => {
    const debout = fabriquerExercice({ id: 'debout', sol: false });
    const auSol = fabriquerExercice({ id: 'au-sol', sol: true });
    const deboutBis = fabriquerExercice({ id: 'debout-bis', sol: false });
    const resultat = filtrerCatalogue([debout, auSol, deboutBis], { ...SANS_CONTRAINTE, sol: false });
    expect(resultat.map((ex) => ex.id)).toEqual(['debout', 'debout-bis']);
  });
});
```

- [ ] **Step 2 : lancer le test pour vérifier qu'il échoue**

Run : `npx jest src/generateur/filtres`
Expected : FAIL avec `Cannot find module './filtres'`.

- [ ] **Step 3 : implémenter les filtres**

`mobile/src/generateur/filtres.ts` :

```ts
import type { Contraintes, Exercice } from '../catalogue/types';

// Filtre strict : c'est la promesse de l'app, il n'est jamais assoupli.
export function respecteContraintes(exercice: Exercice, contraintes: Contraintes): boolean {
  if (contraintes.tenue === 'ville' && (exercice.transpiration !== 'faible' || exercice.sol)) return false;
  if (contraintes.bruit === 'silencieux' && exercice.sauts) return false;
  if (contraintes.espace === 'sur_place' && exercice.espace !== 'sur_place') return false;
  if (!contraintes.sol && exercice.sol) return false;
  return true;
}

export function filtrerCatalogue(catalogue: Exercice[], contraintes: Contraintes): Exercice[] {
  return catalogue.filter((exercice) => respecteContraintes(exercice, contraintes));
}
```

- [ ] **Step 4 : lancer le test pour vérifier qu'il passe**

Run : `npx jest src/generateur/filtres`
Expected : 7 tests PASS.

- [ ] **Step 5 : commit**

```bash
git add src/generateur/filtres.ts src/generateur/filtres.test.ts
git commit -m "feat: filtres stricts des contraintes de contexte" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3 : hasard contrôlé par graine

**Files :**
- Create : `mobile/src/generateur/aleatoire.ts`
- Test : `mobile/src/generateur/aleatoire.test.ts`

**Interfaces :**
- Consumes : rien.
- Produces : `creerAleatoire(graine: number): () => number` (valeurs dans [0, 1)) et `choisirAuHasard<T>(liste: readonly T[], alea: () => number): T` (lève `Error('Liste vide')` sur une liste vide).

- [ ] **Step 1 : écrire le test (il doit échouer)**

`mobile/src/generateur/aleatoire.test.ts` :

```ts
import { choisirAuHasard, creerAleatoire } from './aleatoire';

describe('creerAleatoire', () => {
  it('donne la même suite pour la même graine', () => {
    const a = creerAleatoire(42);
    const b = creerAleatoire(42);
    expect(Array.from({ length: 5 }, () => a())).toEqual(Array.from({ length: 5 }, () => b()));
  });

  it('donne une autre suite pour une autre graine', () => {
    expect(creerAleatoire(1)()).not.toBe(creerAleatoire(2)());
  });

  it('reste entre 0 inclus et 1 exclu', () => {
    const alea = creerAleatoire(7);
    for (let i = 0; i < 1000; i++) {
      const valeur = alea();
      expect(valeur).toBeGreaterThanOrEqual(0);
      expect(valeur).toBeLessThan(1);
    }
  });
});

describe('choisirAuHasard', () => {
  it('renvoie un élément de la liste', () => {
    const liste = ['a', 'b', 'c'];
    expect(liste).toContain(choisirAuHasard(liste, creerAleatoire(3)));
  });

  it('finit par choisir chaque élément', () => {
    const alea = creerAleatoire(5);
    const vus = new Set(Array.from({ length: 100 }, () => choisirAuHasard(['a', 'b', 'c'], alea)));
    expect(vus).toEqual(new Set(['a', 'b', 'c']));
  });

  it('lève une erreur sur une liste vide', () => {
    expect(() => choisirAuHasard([], creerAleatoire(3))).toThrow('Liste vide');
  });
});
```

- [ ] **Step 2 : lancer le test pour vérifier qu'il échoue**

Run : `npx jest src/generateur/aleatoire`
Expected : FAIL avec `Cannot find module './aleatoire'`.

- [ ] **Step 3 : implémenter le hasard contrôlé**

`mobile/src/generateur/aleatoire.ts` :

```ts
// Générateur mulberry32 : même graine, même suite. Permet de rejouer une séance à l'identique dans les tests.
export function creerAleatoire(graine: number): () => number {
  let etat = graine >>> 0;
  return () => {
    etat = (etat + 0x6d2b79f5) >>> 0;
    let t = etat;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function choisirAuHasard<T>(liste: readonly T[], alea: () => number): T {
  if (liste.length === 0) throw new Error('Liste vide');
  return liste[Math.floor(alea() * liste.length)];
}
```

- [ ] **Step 4 : lancer le test pour vérifier qu'il passe**

Run : `npx jest src/generateur/aleatoire`
Expected : 6 tests PASS.

- [ ] **Step 5 : commit**

```bash
git add src/generateur/aleatoire.ts src/generateur/aleatoire.test.ts
git commit -m "feat: hasard contrôlé par graine" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4 : structure des séances et cibles par ressenti

**Files :**
- Create : `mobile/src/generateur/types.ts`, `mobile/src/generateur/structure.ts`, `mobile/src/generateur/cibles.ts`
- Test : `mobile/src/generateur/structure.test.ts`, `mobile/src/generateur/cibles.test.ts`

**Interfaces :**
- Consumes : `Contraintes`, `Duree`, `Effet`, `Exercice`, `Intensite`, `Ressenti`, `DUREES` (`src/catalogue/types.ts`) ; `fabriquerExercice` (`src/test-utils/fabrique.ts`).
- Produces :
  - `src/generateur/types.ts` : `Phase = 'mise_en_route' | 'coeur' | 'retour_au_calme'`, `NiveauAssouplissement = 0 | 1 | 2 | 3`, interfaces `Bloc { exercice; phase; transitionS; effortS }`, `ParametresSeance { contexteId; contraintes; ressenti; duree; graine; exclure? }`, `Seance { contexteId; contraintes; ressenti; duree; graine; blocs; dureeTotaleS; assouplissement }`.
  - `STRUCTURE_PAR_DUREE: Record<Duree, PlanPhase[]>` avec `PlanPhase { phase: Phase; nombre: number; transitionS: number; effortS: number }`.
  - `Cible { effet: Effet; intensiteMin: Intensite; intensiteMax: Intensite }`, `CIBLE_PAR_RESSENTI: Record<Ressenti, Cible>`, `cibleDePhase(phase: Phase, ressenti: Ressenti): Cible`, `correspond(exercice: Exercice, cible: Cible, niveau: NiveauAssouplissement): boolean`.

- [ ] **Step 1 : écrire les types du générateur**

`mobile/src/generateur/types.ts` :

```ts
import type { Contraintes, Duree, Exercice, Ressenti } from '../catalogue/types';

export type Phase = 'mise_en_route' | 'coeur' | 'retour_au_calme';

// 0 : séance idéale ; 1 : intensité assouplie ; 2 : effet assoupli ; 3 : exercice répété.
// Les contraintes, elles, ne sont jamais assouplies.
export type NiveauAssouplissement = 0 | 1 | 2 | 3;

export interface Bloc {
  exercice: Exercice;
  phase: Phase;
  // La transition précède l'effort : on y montre l'exercice qui arrive.
  transitionS: number;
  effortS: number;
}

export interface ParametresSeance {
  contexteId: string;
  contraintes: Contraintes;
  ressenti: Ressenti;
  duree: Duree;
  graine: number;
  // Exercices de la séance précédente, à éviter quand c'est possible.
  exclure?: string[];
}

export interface Seance {
  contexteId: string;
  contraintes: Contraintes;
  ressenti: Ressenti;
  duree: Duree;
  graine: number;
  blocs: Bloc[];
  dureeTotaleS: number;
  // Le plus fort assouplissement utilisé dans la séance.
  assouplissement: NiveauAssouplissement;
}
```

- [ ] **Step 2 : écrire les tests de structure et de cibles (ils doivent échouer)**

`mobile/src/generateur/structure.test.ts` :

```ts
import { DUREES } from '../catalogue/types';
import { STRUCTURE_PAR_DUREE } from './structure';

describe('STRUCTURE_PAR_DUREE', () => {
  for (const duree of DUREES) {
    it(`remplit exactement ${duree} minutes`, () => {
      const total = STRUCTURE_PAR_DUREE[duree].reduce(
        (somme, plan) => somme + plan.nombre * (plan.transitionS + plan.effortS),
        0,
      );
      expect(total).toBe(duree * 60);
    });

    it(`enchaîne mise en route, cœur et retour au calme en ${duree} minutes`, () => {
      expect(STRUCTURE_PAR_DUREE[duree].map((plan) => plan.phase)).toEqual([
        'mise_en_route',
        'coeur',
        'retour_au_calme',
      ]);
    });
  }

  it('fait un cœur de 4 exercices de 40 s + 10 s de transition en 5 minutes', () => {
    expect(STRUCTURE_PAR_DUREE[5][1]).toEqual({ phase: 'coeur', nombre: 4, transitionS: 10, effortS: 40 });
  });

  it('réduit le cœur à 2 exercices en 3 minutes', () => {
    expect(STRUCTURE_PAR_DUREE[3][1].nombre).toBe(2);
  });

  it('fait deux tours de cœur, soit 8 exercices, en 10 minutes', () => {
    expect(STRUCTURE_PAR_DUREE[10][1].nombre).toBe(8);
  });
});
```

`mobile/src/generateur/cibles.test.ts` :

```ts
import { fabriquerExercice } from '../test-utils/fabrique';
import { cibleDePhase, correspond, type Cible } from './cibles';

describe('cibleDePhase', () => {
  it('met en route en mobilité douce, quel que soit le ressenti', () => {
    expect(cibleDePhase('mise_en_route', 'en_forme')).toEqual({ effet: 'mobilite', intensiteMin: 1, intensiteMax: 1 });
  });

  it('termine en détente douce, quel que soit le ressenti', () => {
    expect(cibleDePhase('retour_au_calme', 'mou')).toEqual({ effet: 'detente', intensiteMin: 1, intensiteMax: 1 });
  });

  it('règle le cœur selon le ressenti', () => {
    expect(cibleDePhase('coeur', 'raide')).toEqual({ effet: 'mobilite', intensiteMin: 1, intensiteMax: 2 });
    expect(cibleDePhase('coeur', 'stresse')).toEqual({ effet: 'detente', intensiteMin: 1, intensiteMax: 1 });
    expect(cibleDePhase('coeur', 'mou')).toEqual({ effet: 'energie', intensiteMin: 1, intensiteMax: 2 });
    expect(cibleDePhase('coeur', 'en_forme')).toEqual({ effet: 'energie', intensiteMin: 2, intensiteMax: 3 });
  });
});

describe('correspond', () => {
  const cible: Cible = { effet: 'energie', intensiteMin: 2, intensiteMax: 2 };
  const ideal = fabriquerExercice({ effets: ['energie'], intensite: 2 });
  const tropIntense = fabriquerExercice({ effets: ['energie'], intensite: 3 });
  const autreEffet = fabriquerExercice({ effets: ['detente'], intensite: 1 });

  it('exige l’effet et l’intensité au niveau 0', () => {
    expect(correspond(ideal, cible, 0)).toBe(true);
    expect(correspond(tropIntense, cible, 0)).toBe(false);
    expect(correspond(autreEffet, cible, 0)).toBe(false);
  });

  it('assouplit l’intensité au niveau 1, mais garde l’effet', () => {
    expect(correspond(tropIntense, cible, 1)).toBe(true);
    expect(correspond(autreEffet, cible, 1)).toBe(false);
  });

  it('assouplit aussi l’effet à partir du niveau 2', () => {
    expect(correspond(autreEffet, cible, 2)).toBe(true);
    expect(correspond(autreEffet, cible, 3)).toBe(true);
  });
});
```

- [ ] **Step 3 : lancer les tests pour vérifier qu'ils échouent**

Run : `npx jest src/generateur/structure src/generateur/cibles`
Expected : FAIL avec `Cannot find module './structure'` et `Cannot find module './cibles'`.

- [ ] **Step 4 : implémenter la structure**

`mobile/src/generateur/structure.ts` :

```ts
import type { Duree } from '../catalogue/types';
import type { Phase } from './types';

export interface PlanPhase {
  phase: Phase;
  nombre: number;
  transitionS: number;
  effortS: number;
}

// Chaque durée est remplie à la seconde près : 180, 300 et 600 s.
export const STRUCTURE_PAR_DUREE: Record<Duree, PlanPhase[]> = {
  3: [
    { phase: 'mise_en_route', nombre: 1, transitionS: 5, effortS: 25 },
    { phase: 'coeur', nombre: 2, transitionS: 10, effortS: 40 },
    { phase: 'retour_au_calme', nombre: 2, transitionS: 5, effortS: 20 },
  ],
  5: [
    { phase: 'mise_en_route', nombre: 2, transitionS: 5, effortS: 20 },
    { phase: 'coeur', nombre: 4, transitionS: 10, effortS: 40 },
    { phase: 'retour_au_calme', nombre: 2, transitionS: 5, effortS: 20 },
  ],
  10: [
    { phase: 'mise_en_route', nombre: 3, transitionS: 5, effortS: 25 },
    { phase: 'coeur', nombre: 8, transitionS: 10, effortS: 45 },
    { phase: 'retour_au_calme', nombre: 2, transitionS: 5, effortS: 30 },
  ],
};
```

- [ ] **Step 5 : implémenter les cibles**

`mobile/src/generateur/cibles.ts` :

```ts
import type { Effet, Exercice, Intensite, Ressenti } from '../catalogue/types';
import type { NiveauAssouplissement, Phase } from './types';

export interface Cible {
  effet: Effet;
  intensiteMin: Intensite;
  intensiteMax: Intensite;
}

export const CIBLE_PAR_RESSENTI: Record<Ressenti, Cible> = {
  raide: { effet: 'mobilite', intensiteMin: 1, intensiteMax: 2 },
  stresse: { effet: 'detente', intensiteMin: 1, intensiteMax: 1 },
  mou: { effet: 'energie', intensiteMin: 1, intensiteMax: 2 },
  en_forme: { effet: 'energie', intensiteMin: 2, intensiteMax: 3 },
};

const CIBLE_MISE_EN_ROUTE: Cible = { effet: 'mobilite', intensiteMin: 1, intensiteMax: 1 };
const CIBLE_RETOUR_AU_CALME: Cible = { effet: 'detente', intensiteMin: 1, intensiteMax: 1 };

export function cibleDePhase(phase: Phase, ressenti: Ressenti): Cible {
  if (phase === 'mise_en_route') return CIBLE_MISE_EN_ROUTE;
  if (phase === 'retour_au_calme') return CIBLE_RETOUR_AU_CALME;
  return CIBLE_PAR_RESSENTI[ressenti];
}

// Ordre d'assouplissement de la fiche technique : l'intensité d'abord (niveau 1), puis l'effet (niveau 2).
export function correspond(exercice: Exercice, cible: Cible, niveau: NiveauAssouplissement): boolean {
  const effetOk = niveau >= 2 || exercice.effets.includes(cible.effet);
  const intensiteOk =
    niveau >= 1 || (exercice.intensite >= cible.intensiteMin && exercice.intensite <= cible.intensiteMax);
  return effetOk && intensiteOk;
}
```

- [ ] **Step 6 : lancer les tests pour vérifier qu'ils passent**

Run : `npx jest src/generateur/structure src/generateur/cibles && npm run typecheck`
Expected : 15 tests PASS (9 de structure, 6 de cibles), aucune erreur TypeScript.

- [ ] **Step 7 : commit**

```bash
git add src/generateur/types.ts src/generateur/structure.ts src/generateur/structure.test.ts src/generateur/cibles.ts src/generateur/cibles.test.ts
git commit -m "feat: structure des séances et cibles par ressenti" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5 : générateur de séances

**Files :**
- Create : `mobile/src/generateur/generer.ts`
- Test : `mobile/src/generateur/generer.test.ts`

**Interfaces :**
- Consumes : `filtrerCatalogue` (Task 2) ; `creerAleatoire`, `choisirAuHasard` (Task 3) ; `STRUCTURE_PAR_DUREE`, `cibleDePhase`, `correspond`, `Cible`, types `Bloc`, `NiveauAssouplissement`, `ParametresSeance`, `Seance` (Task 4).
- Produces : `genererSeance(params: ParametresSeance, catalogue: Exercice[]): Seance`. Lève `Error('Aucun exercice compatible avec le contexte <id>')` si aucun exercice ne respecte les contraintes.

- [ ] **Step 1 : écrire le test (il doit échouer)**

`mobile/src/generateur/generer.test.ts` :

```ts
import type { Contraintes, Exercice } from '../catalogue/types';
import { fabriquerExercice, SANS_CONTRAINTE } from '../test-utils/fabrique';
import { genererSeance } from './generer';
import type { ParametresSeance, Seance } from './types';

const MOBILITE = [
  fabriquerExercice({ id: 'mob-1', effets: ['mobilite'], intensite: 1, zone: 'haut' }),
  fabriquerExercice({ id: 'mob-2', effets: ['mobilite'], intensite: 1, zone: 'bas' }),
];
const DETENTE = [
  fabriquerExercice({ id: 'det-1', effets: ['detente'], intensite: 1, zone: 'global' }),
  fabriquerExercice({ id: 'det-2', effets: ['detente'], intensite: 1, zone: 'tronc' }),
];
const ENERGIE = [
  fabriquerExercice({ id: 'ene-1', effets: ['energie'], intensite: 2, zone: 'haut' }),
  fabriquerExercice({ id: 'ene-2', effets: ['energie'], intensite: 2, zone: 'bas' }),
  fabriquerExercice({ id: 'ene-3', effets: ['energie'], intensite: 2, zone: 'tronc' }),
  fabriquerExercice({ id: 'ene-4', effets: ['energie'], intensite: 2, zone: 'global' }),
  fabriquerExercice({ id: 'ene-5', effets: ['energie'], intensite: 2, zone: 'haut' }),
];
const CATALOGUE: Exercice[] = [...MOBILITE, ...DETENTE, ...ENERGIE];
const SILENCIEUX: Contraintes = { ...SANS_CONTRAINTE, bruit: 'silencieux' };

function parametres(surcharge: Partial<ParametresSeance> = {}): ParametresSeance {
  return { contexteId: 'test', contraintes: SANS_CONTRAINTE, ressenti: 'mou', duree: 5, graine: 1, ...surcharge };
}

function ids(seance: Seance): string[] {
  return seance.blocs.map((bloc) => bloc.exercice.id);
}

describe('genererSeance', () => {
  it('suit la structure de 5 minutes', () => {
    const seance = genererSeance(parametres(), CATALOGUE);
    expect(seance.blocs.map((bloc) => bloc.phase)).toEqual([
      'mise_en_route',
      'mise_en_route',
      'coeur',
      'coeur',
      'coeur',
      'coeur',
      'retour_au_calme',
      'retour_au_calme',
    ]);
    expect(seance.dureeTotaleS).toBe(300);
  });

  it('recopie les paramètres dans la séance', () => {
    const seance = genererSeance(parametres({ contexteId: 'maison', ressenti: 'raide', duree: 3, graine: 9 }), CATALOGUE);
    expect(seance).toMatchObject({ contexteId: 'maison', ressenti: 'raide', duree: 3, graine: 9, contraintes: SANS_CONTRAINTE });
  });

  it('met en route en mobilité et termine en détente', () => {
    const seance = genererSeance(parametres(), CATALOGUE);
    for (const bloc of seance.blocs) {
      if (bloc.phase === 'mise_en_route') expect(bloc.exercice.effets).toContain('mobilite');
      if (bloc.phase === 'retour_au_calme') expect(bloc.exercice.effets).toContain('detente');
    }
  });

  it('oriente le cœur selon le ressenti', () => {
    const coeur = genererSeance(parametres({ ressenti: 'mou' }), CATALOGUE).blocs.filter((b) => b.phase === 'coeur');
    for (const bloc of coeur) {
      expect(bloc.exercice.effets).toContain('energie');
      expect(bloc.exercice.intensite).toBeLessThanOrEqual(2);
    }
  });

  it('ne répète aucun exercice quand le catalogue suffit', () => {
    const seance = genererSeance(parametres(), CATALOGUE);
    expect(new Set(ids(seance)).size).toBe(seance.blocs.length);
    expect(seance.assouplissement).toBe(0);
  });

  it('est reproductible avec la même graine', () => {
    expect(ids(genererSeance(parametres({ graine: 123 }), CATALOGUE))).toEqual(
      ids(genererSeance(parametres({ graine: 123 }), CATALOGUE)),
    );
  });

  it("évite les exercices de la séance précédente quand c'est possible", () => {
    for (let graine = 1; graine <= 20; graine++) {
      expect(ids(genererSeance(parametres({ graine, exclure: ['ene-1'] }), CATALOGUE))).not.toContain('ene-1');
    }
  });

  it('alterne les zones du corps dans le cœur', () => {
    for (let graine = 1; graine <= 20; graine++) {
      const coeur = genererSeance(parametres({ graine }), CATALOGUE).blocs.filter((b) => b.phase === 'coeur');
      for (let i = 1; i < coeur.length; i++) {
        expect(coeur[i].exercice.zone).not.toBe(coeur[i - 1].exercice.zone);
      }
    }
  });

  it("assouplit d'abord l'intensité, en gardant l'effet", () => {
    const intenses = ENERGIE.slice(0, 4).map((ex) => ({ ...ex, intensite: 3 as const }));
    const seance = genererSeance(parametres({ ressenti: 'mou' }), [...MOBILITE, ...DETENTE, ...intenses]);
    expect(seance.assouplissement).toBe(1);
    for (const bloc of seance.blocs.filter((b) => b.phase === 'coeur')) {
      expect(bloc.exercice.effets).toContain('energie');
    }
  });

  it('ne viole jamais les contraintes, même en assouplissant tout le reste', () => {
    const saut = fabriquerExercice({ id: 'saut', sauts: true, effets: ['energie'], intensite: 2 });
    const seance = genererSeance(parametres({ contraintes: SILENCIEUX }), [saut, MOBILITE[0], DETENTE[0]]);
    expect(ids(seance)).not.toContain('saut');
    expect(seance.assouplissement).toBe(3);
    expect(seance.dureeTotaleS).toBe(300);
  });

  it("ne fait jamais deux fois de suite le même exercice, même en répétant", () => {
    const seance = genererSeance(parametres({ duree: 10 }), [MOBILITE[0], DETENTE[0]]);
    const suite = ids(seance);
    for (let i = 1; i < suite.length; i++) {
      expect(suite[i]).not.toBe(suite[i - 1]);
    }
  });

  it("lève une erreur quand aucun exercice n'est compatible", () => {
    const saut = fabriquerExercice({ id: 'saut', sauts: true });
    expect(() => genererSeance(parametres({ contraintes: SILENCIEUX }), [saut])).toThrow(
      'Aucun exercice compatible avec le contexte test',
    );
  });
});
```

- [ ] **Step 2 : lancer le test pour vérifier qu'il échoue**

Run : `npx jest src/generateur/generer`
Expected : FAIL avec `Cannot find module './generer'`.

- [ ] **Step 3 : implémenter le générateur**

`mobile/src/generateur/generer.ts` :

```ts
import type { Exercice } from '../catalogue/types';
import { choisirAuHasard, creerAleatoire } from './aleatoire';
import { cibleDePhase, correspond } from './cibles';
import { filtrerCatalogue } from './filtres';
import { STRUCTURE_PAR_DUREE } from './structure';
import type { Bloc, NiveauAssouplissement, ParametresSeance, Seance } from './types';

const NIVEAUX: NiveauAssouplissement[] = [0, 1, 2, 3];

// Plus la pénalité est faible, plus l'exercice est souhaitable à cette place.
function penalite(exercice: Exercice, precedent: Exercice | undefined, recents: Set<string>): number {
  let total = 0;
  if (precedent !== undefined && precedent.id === exercice.id) total += 4;
  if (recents.has(exercice.id)) total += 2;
  if (precedent !== undefined && precedent.zone === exercice.zone) total += 1;
  return total;
}

function departager(
  candidats: Exercice[],
  precedent: Exercice | undefined,
  recents: Set<string>,
  alea: () => number,
): Exercice {
  const penalites = candidats.map((exercice) => penalite(exercice, precedent, recents));
  const minimum = Math.min(...penalites);
  return choisirAuHasard(
    candidats.filter((_, index) => penalites[index] === minimum),
    alea,
  );
}

export function genererSeance(params: ParametresSeance, catalogue: Exercice[]): Seance {
  // 1. Filtrer : les contraintes sont strictes et ne sont jamais assouplies.
  const compatibles = filtrerCatalogue(catalogue, params.contraintes);
  if (compatibles.length === 0) {
    throw new Error(`Aucun exercice compatible avec le contexte ${params.contexteId}`);
  }

  const alea = creerAleatoire(params.graine);
  const recents = new Set(params.exclure ?? []);
  const utilises = new Set<string>();
  const blocs: Bloc[] = [];
  let assouplissement: NiveauAssouplissement = 0;

  for (const plan of STRUCTURE_PAR_DUREE[params.duree]) {
    const cible = cibleDePhase(plan.phase, params.ressenti);
    for (let i = 0; i < plan.nombre; i++) {
      const precedent = blocs.length > 0 ? blocs[blocs.length - 1].exercice : undefined;
      // 2-3. Classer selon la cible et choisir, en assouplissant niveau par niveau.
      // Au niveau 3 tout exercice compatible est candidat : la boucle trouve toujours.
      for (const niveau of NIVEAUX) {
        const candidats = compatibles.filter(
          (exercice) => (niveau === 3 || !utilises.has(exercice.id)) && correspond(exercice, cible, niveau),
        );
        if (candidats.length === 0) continue;
        const exercice = departager(candidats, precedent, recents, alea);
        utilises.add(exercice.id);
        blocs.push({ exercice, phase: plan.phase, transitionS: plan.transitionS, effortS: plan.effortS });
        if (niveau > assouplissement) assouplissement = niveau;
        break;
      }
    }
  }

  return {
    contexteId: params.contexteId,
    contraintes: params.contraintes,
    ressenti: params.ressenti,
    duree: params.duree,
    graine: params.graine,
    blocs,
    dureeTotaleS: blocs.reduce((total, bloc) => total + bloc.transitionS + bloc.effortS, 0),
    assouplissement,
  };
}
```

- [ ] **Step 4 : lancer le test pour vérifier qu'il passe**

Run : `npx jest src/generateur/generer && npm run typecheck`
Expected : 12 tests PASS, aucune erreur TypeScript.

- [ ] **Step 5 : commit**

```bash
git add src/generateur/generer.ts src/generateur/generer.test.ts
git commit -m "feat: générateur de séances à règles" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6 : test exhaustif sur le catalogue embarqué

**Files :**
- Test : `mobile/src/generateur/generer.exhaustif.test.ts`

**Interfaces :**
- Consumes : `CONTEXTES`, `EXERCICES`, `RESSENTIS`, `DUREES` (Task 1) ; `respecteContraintes` (Task 2) ; `genererSeance` (Task 5).
- Produces : rien (filet de sécurité pour les jalons suivants).

- [ ] **Step 1 : écrire le test exhaustif**

`mobile/src/generateur/generer.exhaustif.test.ts` :

```ts
import { CONTEXTES } from '../catalogue/contextes';
import { EXERCICES } from '../catalogue/exercices';
import { DUREES, RESSENTIS } from '../catalogue/types';
import { respecteContraintes } from './filtres';
import { genererSeance } from './generer';

const GRAINES = [1, 2, 3, 42, 2026];

// 5 contextes × 4 ressentis × 3 durées = 60 combinaisons, chacune avec plusieurs graines.
describe('générateur sur le catalogue embarqué', () => {
  for (const contexte of CONTEXTES) {
    for (const ressenti of RESSENTIS) {
      for (const duree of DUREES) {
        it(`${contexte.id} + ${ressenti} + ${duree} min`, () => {
          for (const graine of GRAINES) {
            const seance = genererSeance(
              { contexteId: contexte.id, contraintes: contexte.contraintes, ressenti, duree, graine },
              EXERCICES,
            );

            expect(seance.blocs.length).toBeGreaterThan(0);
            const total = seance.blocs.reduce((somme, bloc) => somme + bloc.transitionS + bloc.effortS, 0);
            expect(total).toBe(duree * 60);

            for (const bloc of seance.blocs) {
              expect(respecteContraintes(bloc.exercice, contexte.contraintes)).toBe(true);
            }
            for (let i = 1; i < seance.blocs.length; i++) {
              expect(seance.blocs[i].exercice.id).not.toBe(seance.blocs[i - 1].exercice.id);
            }
          }
        });
      }
    }
  }
});
```

- [ ] **Step 2 : lancer le test**

Run : `npx jest src/generateur/generer.exhaustif`
Expected : 60 tests PASS. Ce test vérifie un comportement déjà implémenté à la Task 5, il passe donc du premier coup. S'il échoue, c'est un bug du générateur : le corriger dans `generer.ts` avec superpowers:systematic-debugging, jamais en affaiblissant le test.

- [ ] **Step 3 : vérifier que le test sait échouer**

Le test contrôle les séances avec `respecteContraintes` : casser `filtres.ts` casserait aussi le contrôle, et le test passerait quand même. On casse donc le générateur. Dans `mobile/src/generateur/generer.ts`, remplacer temporairement `const compatibles = filtrerCatalogue(catalogue, params.contraintes);` par `const compatibles = catalogue;`.
Run : `npx jest src/generateur/generer.exhaustif`
Expected : FAIL sur de nombreuses combinaisons, notamment toutes les `bureau` (exercices au sol ou qui font transpirer acceptés en tenue de ville).
Puis **remettre la ligne d'origine** et relancer : 60 tests PASS.

- [ ] **Step 4 : commit**

```bash
git add src/generateur/generer.exhaustif.test.ts
git commit -m "test: 60 combinaisons contexte, ressenti, durée sur le catalogue embarqué" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7 : rapport de couverture du catalogue

**Files :**
- Create : `mobile/src/generateur/couverture.ts`, `mobile/scripts/couverture.ts`
- Test : `mobile/src/generateur/couverture.test.ts`

**Interfaces :**
- Consumes : `CONTEXTES`, `EXERCICES`, `RESSENTIS`, `DUREES`, types `Contexte`, `Duree`, `Exercice`, `Ressenti` (Task 1) ; `filtrerCatalogue` (Task 2) ; `CIBLE_PAR_RESSENTI`, `correspond`, `NiveauAssouplissement` (Task 4) ; `genererSeance` (Task 5).
- Produces : `LigneCouverture { contexteId: string; ressenti: Ressenti; compatibles: number; ideaux: number; assouplissement: Record<Duree, NiveauAssouplissement> }`, `analyserCouverture(catalogue: Exercice[], contextes: Contexte[]): LigneCouverture[]`, `formaterRapport(lignes: LigneCouverture[]): string`, et la commande `npm run couverture`.

- [ ] **Step 1 : écrire le test (il doit échouer)**

`mobile/src/generateur/couverture.test.ts` :

```ts
import { CONTEXTES } from '../catalogue/contextes';
import { EXERCICES } from '../catalogue/exercices';
import type { Contexte } from '../catalogue/types';
import { fabriquerExercice, SANS_CONTRAINTE } from '../test-utils/fabrique';
import { analyserCouverture, formaterRapport, type LigneCouverture } from './couverture';

const LIBRE: Contexte = { id: 'libre', nom: 'Libre', emoji: '✨', premium: false, ordre: 1, contraintes: SANS_CONTRAINTE };
const SILENCE: Contexte = { ...LIBRE, id: 'silence', contraintes: { ...SANS_CONTRAINTE, bruit: 'silencieux' } };

describe('analyserCouverture', () => {
  const catalogue = [
    fabriquerExercice({ id: 'mob', effets: ['mobilite'], intensite: 1 }),
    fabriquerExercice({ id: 'det', effets: ['detente'], intensite: 1 }),
    fabriquerExercice({ id: 'saut', sauts: true, effets: ['energie'], intensite: 2 }),
  ];

  it('produit une ligne par contexte et par ressenti', () => {
    expect(analyserCouverture(catalogue, [LIBRE, SILENCE])).toHaveLength(8);
  });

  it('compte les exercices compatibles et ceux qui collent au ressenti', () => {
    const ligne = analyserCouverture(catalogue, [LIBRE]).find((l) => l.ressenti === 'mou');
    expect(ligne?.compatibles).toBe(3);
    expect(ligne?.ideaux).toBe(1);
  });

  it('signale un contexte sans aucun exercice compatible, sans planter', () => {
    const lignes = analyserCouverture([catalogue[2]], [SILENCE]);
    expect(lignes.every((l) => l.compatibles === 0)).toBe(true);
    expect(lignes[0].assouplissement).toEqual({ 3: 3, 5: 3, 10: 3 });
  });

  it('fonctionne sur le catalogue embarqué', () => {
    expect(analyserCouverture(EXERCICES, CONTEXTES)).toHaveLength(20);
  });
});

describe('formaterRapport', () => {
  const ideale: LigneCouverture = {
    contexteId: 'maison',
    ressenti: 'mou',
    compatibles: 8,
    ideaux: 5,
    assouplissement: { 3: 0, 5: 0, 10: 0 },
  };

  it('annonce un catalogue complet', () => {
    expect(formaterRapport([ideale])).toBe('Catalogue complet : toutes les combinaisons sont idéales.');
  });

  it('liste les combinaisons à compléter', () => {
    const manque: LigneCouverture = {
      ...ideale,
      contexteId: 'bureau',
      compatibles: 4,
      ideaux: 1,
      assouplissement: { 3: 0, 5: 1, 10: 3 },
    };
    const rapport = formaterRapport([ideale, manque]);
    expect(rapport).toContain('1 combinaison(s) sur 2 à compléter :');
    expect(rapport).toContain(
      '- bureau + mou : 1 exercice(s) idéal(aux) sur 4 compatible(s) (3 min : idéal, 5 min : intensité assouplie, 10 min : exercices répétés)',
    );
    expect(rapport).not.toContain('- maison');
  });
});
```

- [ ] **Step 2 : lancer le test pour vérifier qu'il échoue**

Run : `npx jest src/generateur/couverture`
Expected : FAIL avec `Cannot find module './couverture'`.

- [ ] **Step 3 : implémenter l'analyse et le rapport**

`mobile/src/generateur/couverture.ts` :

```ts
import { DUREES, RESSENTIS, type Contexte, type Duree, type Exercice, type Ressenti } from '../catalogue/types';
import { CIBLE_PAR_RESSENTI, correspond } from './cibles';
import { filtrerCatalogue } from './filtres';
import { genererSeance } from './generer';
import type { NiveauAssouplissement } from './types';

export interface LigneCouverture {
  contexteId: string;
  ressenti: Ressenti;
  // Exercices qui respectent les contraintes du contexte.
  compatibles: number;
  // Parmi eux, ceux qui collent au ressenti (effet et intensité) pour le cœur de séance.
  ideaux: number;
  assouplissement: Record<Duree, NiveauAssouplissement>;
}

const LIBELLES: Record<NiveauAssouplissement, string> = {
  0: 'idéal',
  1: 'intensité assouplie',
  2: 'effet assoupli',
  3: 'exercices répétés',
};

// Graine fixe : le rapport reste le même d'un lancement à l'autre.
const GRAINE_RAPPORT = 1;

export function analyserCouverture(catalogue: Exercice[], contextes: Contexte[]): LigneCouverture[] {
  const lignes: LigneCouverture[] = [];
  for (const contexte of contextes) {
    const compatibles = filtrerCatalogue(catalogue, contexte.contraintes);
    for (const ressenti of RESSENTIS) {
      const cible = CIBLE_PAR_RESSENTI[ressenti];
      const niveau = (duree: Duree): NiveauAssouplissement =>
        compatibles.length === 0
          ? 3
          : genererSeance(
              { contexteId: contexte.id, contraintes: contexte.contraintes, ressenti, duree, graine: GRAINE_RAPPORT },
              catalogue,
            ).assouplissement;
      lignes.push({
        contexteId: contexte.id,
        ressenti,
        compatibles: compatibles.length,
        ideaux: compatibles.filter((exercice) => correspond(exercice, cible, 0)).length,
        assouplissement: { 3: niveau(3), 5: niveau(5), 10: niveau(10) },
      });
    }
  }
  return lignes;
}

export function formaterRapport(lignes: LigneCouverture[]): string {
  const aCompleter = lignes.filter((ligne) => DUREES.some((duree) => ligne.assouplissement[duree] > 0));
  if (aCompleter.length === 0) return 'Catalogue complet : toutes les combinaisons sont idéales.';
  return [
    `${aCompleter.length} combinaison(s) sur ${lignes.length} à compléter :`,
    ...aCompleter.map((ligne) => {
      const details = DUREES.map((duree) => `${duree} min : ${LIBELLES[ligne.assouplissement[duree]]}`).join(', ');
      return `- ${ligne.contexteId} + ${ligne.ressenti} : ${ligne.ideaux} exercice(s) idéal(aux) sur ${ligne.compatibles} compatible(s) (${details})`;
    }),
  ].join('\n');
}
```

- [ ] **Step 4 : lancer le test pour vérifier qu'il passe**

Run : `npx jest src/generateur/couverture`
Expected : 6 tests PASS.

- [ ] **Step 5 : écrire le script**

`mobile/scripts/couverture.ts` :

```ts
// Usage : npm run couverture
// Liste les combinaisons contexte + ressenti qui manquent d'exercices : c'est la liste de contenu à produire.
import { CONTEXTES } from '../src/catalogue/contextes';
import { EXERCICES } from '../src/catalogue/exercices';
import { analyserCouverture, formaterRapport } from '../src/generateur/couverture';

console.log(formaterRapport(analyserCouverture(EXERCICES, CONTEXTES)));
```

- [ ] **Step 6 : lancer le script**

Run : `npm run couverture`
Expected : un rapport qui commence par `N combinaison(s) sur 20 à compléter :`, avec notamment des lignes `- bureau + …`. C'est normal avec seulement 10 exercices de test : le bureau n'a que 4 exercices compatibles.

- [ ] **Step 7 : commit**

```bash
git add src/generateur/couverture.ts src/generateur/couverture.test.ts scripts/couverture.ts
git commit -m "feat: rapport de couverture du catalogue" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8 : écran de démonstration et vérification finale

**Files :**
- Modify : `mobile/app/index.tsx` (remplacement complet)

**Interfaces :**
- Consumes : `CONTEXTES`, `EXERCICES` (Task 1) ; `genererSeance` (Task 5).
- Produces : rien (écran provisoire, remplacé au jalon 2 par le parcours « Où es-tu ? »).

- [ ] **Step 1 : remplacer l'écran provisoire**

`mobile/app/index.tsx` :

```tsx
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { CONTEXTES } from '../src/catalogue/contextes';
import { EXERCICES } from '../src/catalogue/exercices';
import { genererSeance } from '../src/generateur/generer';

// Écran provisoire du jalon 1 : affiche une séance générée pour vérifier que tout s'assemble.
// Remplacé au jalon 2 par le parcours « Où es-tu ? » → « Comment tu te sens ? » → Go.
export default function Accueil() {
  const reveil = CONTEXTES[0];
  const seance = useMemo(
    () =>
      genererSeance(
        { contexteId: reveil.id, contraintes: reveil.contraintes, ressenti: 'mou', duree: 5, graine: Date.now() },
        EXERCICES,
      ),
    [reveil],
  );

  return (
    <ScrollView contentContainerStyle={styles.conteneur}>
      <Text style={styles.titre}>Flash Coach</Text>
      <Text style={styles.sousTitre}>
        {reveil.emoji} {reveil.nom} · Mou · 5 min
      </Text>
      {seance.blocs.map((bloc, index) => (
        <View key={`${bloc.exercice.id}-${index}`} style={styles.bloc}>
          <Text style={styles.nom}>{bloc.exercice.nom}</Text>
          <Text style={styles.detail}>
            {bloc.phase} · {bloc.effortS} s
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  conteneur: { flexGrow: 1, gap: 12, padding: 24, paddingTop: 64, backgroundColor: '#EDF2F7' },
  titre: { fontSize: 32, fontWeight: '700', color: '#3A506B' },
  sousTitre: { fontSize: 16, color: '#2D3748', marginBottom: 8 },
  bloc: { padding: 16, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#F97316', backgroundColor: '#FFFFFF' },
  nom: { fontSize: 18, fontWeight: '600', color: '#2D3748' },
  detail: { fontSize: 14, color: '#3A506B', marginTop: 4 },
});
```

- [ ] **Step 2 : lancer toute la suite**

Run : `npm test && npm run typecheck && npm run lint`
Expected : 8 fichiers de test, 115 tests PASS (9 catalogue, 7 filtres, 6 hasard, 9 structure, 6 cibles, 12 générateur, 60 exhaustif, 6 couverture), aucune erreur TypeScript, aucune erreur ESLint.

- [ ] **Step 3 : vérifier l'app dans le navigateur**

Run : `npx expo export --platform web` (Expected : export réussi), puis lancer `npx expo start --web --port 8081` en arrière-plan et ouvrir `http://localhost:8081`.
Expected : fond gris clair, titre « Flash Coach » en bleu, sous-titre « 🛏️ Au réveil · Mou · 5 min », puis 8 cartes à liseré orange : 2 `mise_en_route`, 4 `coeur`, 2 `retour_au_calme`. Ni « Jumping jacks » (Au réveil est silencieux) ni « Fentes arrière » (Au réveil est sur place) n'apparaissent. Recharger la page donne une autre séance (graine = heure). Arrêter le serveur ensuite.

- [ ] **Step 4 : commit**

Depuis `mobile/` :

```bash
git add app/index.tsx
git commit -m "feat: écran de démonstration du générateur" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
