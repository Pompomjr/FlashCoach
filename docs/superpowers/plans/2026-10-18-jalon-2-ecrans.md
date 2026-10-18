# Jalon 2 : écran de départ, lecteur de séance et écran Bravo

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Mode « économe » : chaque Task est un lot, relu une fois.

**Goal :** l'utilisateur ouvre l'app, lance une séance en un tap depuis un écran de départ unique (tout présélectionné), la suit avec un minuteur (pause, passer, terminer) et arrive sur un écran Bravo, dans le style de la maquette `docs/reference/maquette-parcours-seance.png`.

**Architecture :** trois écrans Expo Router (`app/index.tsx`, `app/seance.tsx`, `app/bravo.tsx`). La séance ne voyage pas entre écrans : on passe contexte, ressenti, durée, graine et exercices à éviter dans l'URL, et l'écran Séance la régénère à l'identique (générateur du jalon 1). Le lecteur est une machine à états pure (`src/seance/lecteur.ts`) reliée au temps par un hook. Les derniers choix sont gardés dans le stockage du téléphone derrière une petite interface `Stockage` remplaçable en test.

**Tech Stack :** Expo SDK 58, Expo Router 58, React 19.3, React Native 0.88, TypeScript strict, Jest (jest-expo), `@testing-library/react-native` ≥ 14 avec `expo-router/testing-library`, `@react-native-async-storage/async-storage`, `expo-keep-awake`, `expo-haptics`.

**Spec :** pages Notion « Positionnement » et « Fiche technique » ; conception validée le 2026-10-18 (écran de départ unique, zéro configuration, maquette FlutterFlow comme référence visuelle).

## Global Constraints

- App dans `C:\dev\projects\FlashCoach\mobile`, dépôt git à la racine, branche `jalon-2`. Toutes les commandes depuis `mobile/`.
- TypeScript strict, identifiants en français sans accents. Textes visibles : ton complice, jamais culpabilisant, apostrophe typographique `’`.
- **Zéro configuration :** aucun écran avant l'écran de départ, aucun compte, aucune question avant la première séance. Défauts au premier lancement : contexte `maison`, ressenti `mou`, 5 min. Ensuite, les derniers choix.
- Seuls `reveil` et `maison` sont disponibles ; les contextes Premium affichent un cadenas et le message « Bientôt avec Premium 🔒 » sans changer la sélection.
- Contrastes : fond `#3A506B` + texte `#EDF2F7` ; cartes `#2D3748` + texte `#EDF2F7` ; orange `#F97316` + texte `#000000` (**jamais de texte blanc sur l'orange**) ; carte claire `#EDF2F7` + texte `#2D3748` ; texte discret `#CBD5E0`.
- Les tests ne vont jamais dans `app/` (chaque fichier de `app/` est une route) : tests d'écrans dans `mobile/__tests__/`.
- Hors périmètre : journal et enregistrement de « Tu te sens mieux ? » (jalon 3), Supabase (jalon 4), paiement (jalon 5), animations Lottie et sons (jalon 7).
- Chaque commit se termine par `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Si une API d'une bibliothèque diffère de ce plan dans la version installée (SDK 58, RNTL 14), adapter au minimum, garder l'intention et les assertions, et le signaler dans le rapport.

## Structure des fichiers

```
mobile/
  app/_layout.tsx                 pile sans en-tête, fond bleu, barre d'état claire
  app/index.tsx                   écran de départ
  app/seance.tsx                  lecteur de séance
  app/bravo.tsx                   écran Bravo
  __tests__/ecrans.test.tsx       tests des trois écrans (expo-router/testing-library)
  src/abonnement/acces.ts         contexteDisponible() — gratuit seulement jusqu'au jalon 5
  src/preferences/stockage.ts     interface Stockage + stockageTelephone (AsyncStorage)
  src/preferences/preferences.ts  derniers choix et derniers exercices
  src/seance/lecteur.ts           machine à états du lecteur
  src/seance/affichage.ts         côté gauche/droit, format 0:21, minutes effectuées
  src/seance/parametres.ts        paramètres d'URL → ParametresSeance
  src/seance/useLecteurSeance.ts  minuteur + pause automatique en arrière-plan
  src/ui/theme.ts                 couleurs et mesures
  src/ui/libelles.ts              libellés des ressentis et des phases
  src/ui/CarteOption.tsx          carte sélectionnable
  src/ui/Bouton.tsx               bouton principal / secondaire
  src/test-utils/stockageMemoire.ts
```

---

### Task 1 : socle — dépendances, interface visuelle, accès et préférences

**Files :**
- Create : `src/ui/theme.ts`, `src/ui/libelles.ts`, `src/ui/CarteOption.tsx`, `src/ui/Bouton.tsx`, `src/abonnement/acces.ts`, `src/preferences/stockage.ts`, `src/preferences/preferences.ts`, `src/test-utils/stockageMemoire.ts`
- Test : `src/abonnement/acces.test.ts`, `src/preferences/preferences.test.ts`
- Modify : `package.json` (dépendances)

**Interfaces :**
- Produces :
  - `COULEURS`, `RAYON`, `ESPACE` (`src/ui/theme.ts`)
  - `LIBELLES_RESSENTI: Record<Ressenti, { libelle: string; emoji: string }>`, `LIBELLES_PHASE: Record<Phase, string>`
  - `CarteOption({ libelle, emoji?, selectionne, verrouille?, onPress, style? })` — rôle `button`, nom accessible = `libelle` (ou `"<libelle>, Premium"` si verrouillé), état `selected`
  - `Bouton({ libelle, onPress, variante?: 'principal' | 'secondaire' })` — rôle `button`, nom accessible = `libelle`
  - `contexteDisponible(contexteId: string): boolean`
  - `Stockage { lire(cle): Promise<string | null>; ecrire(cle, valeur): Promise<void> }`, `stockageTelephone: Stockage`
  - `Choix { contexteId; ressenti; duree }`, `CHOIX_PAR_DEFAUT`, `lireChoix(stockage)`, `ecrireChoix(stockage, choix)`, `lireDerniersExercices(stockage)`, `ecrireDerniersExercices(stockage, ids)`
  - `creerStockageMemoire(initial?) : Stockage & { contenu: Record<string, string> }`

- [ ] **Step 1 : installer les dépendances**

```bash
npx expo install @react-native-async-storage/async-storage expo-keep-awake expo-haptics
npx expo install -- --save-dev @testing-library/react-native
```

Vérifier dans `package.json` que `@testing-library/react-native` est en version 14 ou plus (exigence d'Expo Router pour SDK 58) ; sinon installer `@testing-library/react-native@^14` en dev.

- [ ] **Step 2 : écrire la mémoire de test et les tests (ils doivent échouer)**

`src/test-utils/stockageMemoire.ts` :

```ts
import type { Stockage } from '../preferences/stockage';

// Remplace le stockage du téléphone dans les tests ; `contenu` permet de l'inspecter.
export function creerStockageMemoire(initial: Record<string, string> = {}): Stockage & { contenu: Record<string, string> } {
  const contenu: Record<string, string> = { ...initial };
  return {
    contenu,
    lire: async (cle) => (cle in contenu ? contenu[cle] : null),
    ecrire: async (cle, valeur) => {
      contenu[cle] = valeur;
    },
  };
}
```

`src/abonnement/acces.test.ts` :

```ts
import { contexteDisponible } from './acces';

describe('contexteDisponible', () => {
  it('ouvre seulement les contextes gratuits tant que l’abonnement n’existe pas', () => {
    expect(['reveil', 'maison', 'bureau', 'voyage', 'dehors', 'inconnu'].filter((id) => contexteDisponible(id))).toEqual([
      'reveil',
      'maison',
    ]);
  });
});
```

`src/preferences/preferences.test.ts` :

```ts
import { creerStockageMemoire } from '../test-utils/stockageMemoire';
import {
  CHOIX_PAR_DEFAUT,
  ecrireChoix,
  ecrireDerniersExercices,
  lireChoix,
  lireDerniersExercices,
} from './preferences';
import type { Stockage } from './stockage';

const enPanne: Stockage = {
  lire: async () => {
    throw new Error('panne');
  },
  ecrire: async () => undefined,
};

describe('choix', () => {
  it('propose À la maison, Mou et 5 min au premier lancement', async () => {
    expect(await lireChoix(creerStockageMemoire())).toEqual({ contexteId: 'maison', ressenti: 'mou', duree: 5 });
  });

  it('retrouve les derniers choix', async () => {
    const stockage = creerStockageMemoire();
    await ecrireChoix(stockage, { contexteId: 'reveil', ressenti: 'raide', duree: 3 });
    expect(await lireChoix(stockage)).toEqual({ contexteId: 'reveil', ressenti: 'raide', duree: 3 });
  });

  it('revient aux choix par défaut si les données sont abîmées', async () => {
    const abime = (texte: string) => lireChoix(creerStockageMemoire({ 'flashcoach.choix': texte }));
    expect(await abime('{pas du json')).toEqual(CHOIX_PAR_DEFAUT);
    expect(await abime(JSON.stringify({ contexteId: 'maison', ressenti: 'fatigue', duree: 5 }))).toEqual(CHOIX_PAR_DEFAUT);
    expect(await abime(JSON.stringify({ contexteId: 'maison', ressenti: 'mou', duree: 7 }))).toEqual(CHOIX_PAR_DEFAUT);
    expect(await abime(JSON.stringify(null))).toEqual(CHOIX_PAR_DEFAUT);
  });

  it('ignore un contexte Premium enregistré', async () => {
    const stockage = creerStockageMemoire({
      'flashcoach.choix': JSON.stringify({ contexteId: 'bureau', ressenti: 'mou', duree: 5 }),
    });
    expect(await lireChoix(stockage)).toEqual(CHOIX_PAR_DEFAUT);
  });

  it('revient aux choix par défaut si le stockage est en panne', async () => {
    expect(await lireChoix(enPanne)).toEqual(CHOIX_PAR_DEFAUT);
  });
});

describe('derniers exercices', () => {
  it('sont vides au premier lancement', async () => {
    expect(await lireDerniersExercices(creerStockageMemoire())).toEqual([]);
  });

  it('sont retrouvés', async () => {
    const stockage = creerStockageMemoire();
    await ecrireDerniersExercices(stockage, ['squat-lent', 'planche']);
    expect(await lireDerniersExercices(stockage)).toEqual(['squat-lent', 'planche']);
  });

  it('sont ignorés si les données sont abîmées ou le stockage en panne', async () => {
    expect(await lireDerniersExercices(creerStockageMemoire({ 'flashcoach.derniers-exercices': '[1,2]' }))).toEqual([]);
    expect(await lireDerniersExercices(enPanne)).toEqual([]);
  });
});
```

Run : `npx jest src/abonnement src/preferences` — Expected : FAIL (`Cannot find module './acces'`, `'./preferences'`).

- [ ] **Step 3 : implémenter l'accès et les préférences**

`src/abonnement/acces.ts` :

```ts
import { CONTEXTES } from '../catalogue/contextes';

// Seuls les contextes gratuits sont ouverts tant que l'abonnement n'existe pas (jalon 5 : RevenueCat).
export function contexteDisponible(contexteId: string): boolean {
  return CONTEXTES.some((contexte) => contexte.id === contexteId && !contexte.premium);
}
```

`src/preferences/stockage.ts` :

```ts
import AsyncStorage from '@react-native-async-storage/async-storage';

// Petite interface pour remplacer le stockage du téléphone par une mémoire dans les tests.
export interface Stockage {
  lire(cle: string): Promise<string | null>;
  ecrire(cle: string, valeur: string): Promise<void>;
}

export const stockageTelephone: Stockage = {
  lire: (cle) => AsyncStorage.getItem(cle),
  ecrire: (cle, valeur) => AsyncStorage.setItem(cle, valeur),
};
```

`src/preferences/preferences.ts` :

```ts
import { contexteDisponible } from '../abonnement/acces';
import { DUREES, RESSENTIS, type Duree, type Ressenti } from '../catalogue/types';
import type { Stockage } from './stockage';

export interface Choix {
  contexteId: string;
  ressenti: Ressenti;
  duree: Duree;
}

// Zéro configuration : ce qui est présélectionné au tout premier lancement.
export const CHOIX_PAR_DEFAUT: Choix = { contexteId: 'maison', ressenti: 'mou', duree: 5 };

const CLE_CHOIX = 'flashcoach.choix';
const CLE_DERNIERS_EXERCICES = 'flashcoach.derniers-exercices';

// Une préférence illisible ou un stockage en panne ne doit jamais empêcher de lancer une séance.
async function lireSansErreur(stockage: Stockage, cle: string): Promise<unknown> {
  try {
    const texte = await stockage.lire(cle);
    return texte === null ? null : JSON.parse(texte);
  } catch {
    return null;
  }
}

function estChoix(valeur: unknown): valeur is Choix {
  if (typeof valeur !== 'object' || valeur === null) return false;
  const v = valeur as Record<string, unknown>;
  return (
    typeof v.contexteId === 'string' &&
    contexteDisponible(v.contexteId) &&
    RESSENTIS.includes(v.ressenti as Ressenti) &&
    DUREES.includes(v.duree as Duree)
  );
}

export async function lireChoix(stockage: Stockage): Promise<Choix> {
  const valeur = await lireSansErreur(stockage, CLE_CHOIX);
  return estChoix(valeur) ? { contexteId: valeur.contexteId, ressenti: valeur.ressenti, duree: valeur.duree } : CHOIX_PAR_DEFAUT;
}

export async function ecrireChoix(stockage: Stockage, choix: Choix): Promise<void> {
  await stockage.ecrire(CLE_CHOIX, JSON.stringify(choix));
}

export async function lireDerniersExercices(stockage: Stockage): Promise<string[]> {
  const valeur = await lireSansErreur(stockage, CLE_DERNIERS_EXERCICES);
  return Array.isArray(valeur) && valeur.every((id) => typeof id === 'string') ? valeur : [];
}

export async function ecrireDerniersExercices(stockage: Stockage, ids: string[]): Promise<void> {
  await stockage.ecrire(CLE_DERNIERS_EXERCICES, JSON.stringify(ids));
}
```

Run : `npx jest src/abonnement src/preferences` — Expected : 9 tests PASS.

- [ ] **Step 4 : écrire le thème, les libellés et les composants**

`src/ui/theme.ts` :

```ts
// Palette de la fiche. Contrastes : texte clair sur bleu ≈ 7,3:1 ; texte noir sur orange ≈ 7,5:1 ;
// jamais de blanc sur l'orange (≈ 2,8:1, illisible).
export const COULEURS = {
  fond: '#3A506B',
  carte: '#2D3748',
  carteClaire: '#EDF2F7',
  orange: '#F97316',
  texte: '#EDF2F7',
  texteSombre: '#2D3748',
  texteSurOrange: '#000000',
  texteDiscret: '#CBD5E0',
} as const;

export const RAYON = 16;
export const ESPACE = 16;
```

`src/ui/libelles.ts` :

```ts
import type { Ressenti } from '../catalogue/types';
import type { Phase } from '../generateur/types';

export const LIBELLES_RESSENTI: Record<Ressenti, { libelle: string; emoji: string }> = {
  raide: { libelle: 'Raide', emoji: '😣' },
  stresse: { libelle: 'Stressé', emoji: '😰' },
  mou: { libelle: 'Mou', emoji: '😴' },
  en_forme: { libelle: 'En forme', emoji: '💪' },
};

export const LIBELLES_PHASE: Record<Phase, string> = {
  mise_en_route: 'Mise en route',
  coeur: 'On y va',
  retour_au_calme: 'Retour au calme',
};
```

`src/ui/CarteOption.tsx` :

```tsx
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { COULEURS, RAYON } from './theme';

interface Props {
  libelle: string;
  emoji?: string;
  selectionne: boolean;
  verrouille?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export function CarteOption({ libelle, emoji, selectionne, verrouille = false, onPress, style }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={verrouille ? `${libelle}, Premium` : libelle}
      accessibilityState={{ selected: selectionne }}
      onPress={onPress}
      style={({ pressed }) => [styles.carte, selectionne && styles.selectionnee, pressed && styles.pressee, style]}
    >
      <Text style={[styles.texte, selectionne && styles.texteSelectionne, verrouille && styles.texteVerrouille]}>
        {emoji ? `${emoji}  ` : ''}
        {libelle}
        {verrouille ? '  🔒' : ''}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  carte: { backgroundColor: COULEURS.carte, borderRadius: RAYON, paddingVertical: 14, paddingHorizontal: 16 },
  selectionnee: { backgroundColor: COULEURS.orange },
  pressee: { opacity: 0.85 },
  texte: { color: COULEURS.texte, fontSize: 16, fontWeight: '600' },
  texteSelectionne: { color: COULEURS.texteSurOrange },
  texteVerrouille: { color: COULEURS.texteDiscret },
});
```

`src/ui/Bouton.tsx` :

```tsx
import { Pressable, StyleSheet, Text } from 'react-native';

import { COULEURS, RAYON } from './theme';

interface Props {
  libelle: string;
  onPress: () => void;
  variante?: 'principal' | 'secondaire';
}

export function Bouton({ libelle, onPress, variante = 'principal' }: Props) {
  const principal = variante === 'principal';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={libelle}
      onPress={onPress}
      style={({ pressed }) => [styles.base, principal ? styles.principal : styles.secondaire, pressed && styles.presse]}
    >
      <Text style={[styles.texte, principal ? styles.textePrincipal : styles.texteSecondaire]}>{libelle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { flexGrow: 1, borderRadius: RAYON, paddingVertical: 16, paddingHorizontal: 20, alignItems: 'center' },
  principal: { backgroundColor: COULEURS.orange },
  secondaire: { backgroundColor: COULEURS.carteClaire },
  presse: { opacity: 0.85 },
  texte: { fontSize: 18, fontWeight: '700' },
  textePrincipal: { color: COULEURS.texteSurOrange },
  texteSecondaire: { color: COULEURS.texteSombre },
});
```

- [ ] **Step 5 : vérifier et committer**

Run : `npx jest && npm run typecheck && npm run lint` — Expected : toute la suite PASS (123 du jalon 1 + 9), typage et lint propres.

```bash
git add package.json package-lock.json src/ui src/abonnement src/preferences src/test-utils/stockageMemoire.ts
git commit -m "feat: interface de base, accès aux contextes et préférences locales" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2 : lecteur de séance

**Files :**
- Create : `src/seance/lecteur.ts`, `src/seance/affichage.ts`, `src/seance/parametres.ts`, `src/seance/useLecteurSeance.ts`
- Test : `src/seance/lecteur.test.ts`, `src/seance/affichage.test.ts`, `src/seance/parametres.test.ts`, `src/seance/useLecteurSeance.test.ts`

**Interfaces :**
- Consumes : `Bloc`, `ParametresSeance` (`src/generateur/types.ts`), `CONTEXTES`, `DUREES`, `RESSENTIS`, `contexteDisponible` (Task 1), `fabriquerExercice` (`src/test-utils/fabrique.ts`).
- Produces :
  - `Etape = 'transition' | 'effort'`, `EtatLecteur { blocs; index; etape; restantMs; enPause; termine; ecouleMs; exercicesFaits }`, `ActionLecteur`, `creerEtatInitial(blocs)`, `lecteur(etat, action)`
  - `coteCourant(etat): 'gauche' | 'droite' | null`, `formaterTemps(ms): string` (`"0:21"`), `minutesEffectuees(ms): number`
  - `lireParametresSeance(brut): ParametresSeance | null`
  - `useLecteurSeance(blocs) → { etat, passer, basculerPause, terminer }`

- [ ] **Step 1 : écrire les tests (ils doivent échouer)**

`src/seance/lecteur.test.ts` :

```ts
import type { Bloc } from '../generateur/types';
import { fabriquerExercice } from '../test-utils/fabrique';
import { creerEtatInitial, lecteur, type EtatLecteur } from './lecteur';

const bloc = (id: string, transitionS: number, effortS: number): Bloc => ({
  exercice: fabriquerExercice({ id }),
  phase: 'coeur',
  transitionS,
  effortS,
});
const BLOCS = [bloc('a', 5, 20), bloc('b', 10, 40)];
const avancer = (etat: EtatLecteur, ms: number) => lecteur(etat, { type: 'avancer', ms });

describe('lecteur', () => {
  it('démarre sur la transition du premier exercice', () => {
    expect(creerEtatInitial(BLOCS)).toMatchObject({ index: 0, etape: 'transition', restantMs: 5000, enPause: false, termine: false, ecouleMs: 0, exercicesFaits: 0 });
  });

  it('refuse une séance vide', () => {
    expect(() => creerEtatInitial([])).toThrow();
  });

  it('passe à l’effort à la fin de la transition', () => {
    expect(avancer(creerEtatInitial(BLOCS), 5000)).toMatchObject({ index: 0, etape: 'effort', restantMs: 20000 });
  });

  it('enchaîne plusieurs étapes en un seul pas', () => {
    expect(avancer(creerEtatInitial(BLOCS), 28000)).toMatchObject({
      index: 1,
      etape: 'transition',
      restantMs: 7000,
      exercicesFaits: 1,
      ecouleMs: 28000,
    });
  });

  it('se termine à la fin du dernier exercice', () => {
    expect(avancer(creerEtatInitial(BLOCS), 75000)).toMatchObject({ termine: true, exercicesFaits: 2, ecouleMs: 75000 });
  });

  it('n’avance pas en pause, puis reprend', () => {
    const enPause = avancer(lecteur(creerEtatInitial(BLOCS), { type: 'pause' }), 3000);
    expect(enPause).toMatchObject({ enPause: true, restantMs: 5000, ecouleMs: 0 });
    expect(avancer(lecteur(enPause, { type: 'reprendre' }), 1000)).toMatchObject({ enPause: false, restantMs: 4000 });
  });

  it('passe au suivant sans compter l’exercice sauté', () => {
    const passe = lecteur(avancer(creerEtatInitial(BLOCS), 6000), { type: 'passer' });
    expect(passe).toMatchObject({ index: 1, etape: 'transition', restantMs: 10000, exercicesFaits: 0 });
    expect(lecteur(passe, { type: 'passer' })).toMatchObject({ termine: true });
  });

  it('relance le minuteur quand on passe pendant une pause', () => {
    const enPause = lecteur(creerEtatInitial(BLOCS), { type: 'pause' });
    expect(lecteur(enPause, { type: 'passer' }).enPause).toBe(false);
  });

  it('s’arrête quand on termine, et plus rien ne bouge ensuite', () => {
    const termine = lecteur(avancer(creerEtatInitial(BLOCS), 6000), { type: 'terminer' });
    expect(termine).toMatchObject({ termine: true, ecouleMs: 6000 });
    expect(avancer(termine, 5000)).toBe(termine);
    expect(lecteur(termine, { type: 'passer' })).toBe(termine);
  });

  it('ignore un pas nul ou négatif', () => {
    const depart = creerEtatInitial(BLOCS);
    expect(avancer(depart, 0)).toBe(depart);
    expect(avancer(depart, -100)).toBe(depart);
  });
});
```

`src/seance/affichage.test.ts` :

```ts
import type { Bloc } from '../generateur/types';
import { fabriquerExercice } from '../test-utils/fabrique';
import { coteCourant, formaterTemps, minutesEffectuees } from './affichage';
import { creerEtatInitial, lecteur } from './lecteur';

const blocDeuxCotes: Bloc = { exercice: fabriquerExercice({ bilateral: true }), phase: 'coeur', transitionS: 10, effortS: 40 };
const blocSimple: Bloc = { exercice: fabriquerExercice({ bilateral: false }), phase: 'coeur', transitionS: 10, effortS: 40 };

describe('coteCourant', () => {
  it('fait le côté gauche puis le côté droit pendant l’effort', () => {
    const effort = lecteur(creerEtatInitial([blocDeuxCotes]), { type: 'avancer', ms: 10000 });
    expect(coteCourant(lecteur(effort, { type: 'avancer', ms: 10000 }))).toBe('gauche');
    expect(coteCourant(lecteur(effort, { type: 'avancer', ms: 20000 }))).toBe('droite');
  });

  it('ne parle pas de côté pendant la transition ni pour un exercice simple', () => {
    expect(coteCourant(creerEtatInitial([blocDeuxCotes]))).toBeNull();
    expect(coteCourant(lecteur(creerEtatInitial([blocSimple]), { type: 'avancer', ms: 15000 }))).toBeNull();
  });
});

describe('formaterTemps', () => {
  it('affiche minutes et secondes, arrondies à la seconde supérieure', () => {
    expect(formaterTemps(21000)).toBe('0:21');
    expect(formaterTemps(20001)).toBe('0:21');
    expect(formaterTemps(65000)).toBe('1:05');
    expect(formaterTemps(0)).toBe('0:00');
  });
});

describe('minutesEffectuees', () => {
  it('arrondit à la minute la plus proche', () => {
    expect(minutesEffectuees(299000)).toBe(5);
    expect(minutesEffectuees(90000)).toBe(2);
    expect(minutesEffectuees(20000)).toBe(0);
  });
});
```

`src/seance/parametres.test.ts` :

```ts
import { lireParametresSeance } from './parametres';

describe('lireParametresSeance', () => {
  it('reconstruit les paramètres de la séance depuis l’URL', () => {
    expect(
      lireParametresSeance({ contexte: 'maison', ressenti: 'mou', duree: '5', graine: '42', exclure: 'planche,squat-lent' }),
    ).toEqual({
      contexteId: 'maison',
      contraintes: { tenue: 'sport', bruit: 'normal', espace: 'un_peu', sol: true },
      ressenti: 'mou',
      duree: 5,
      graine: 42,
      exclure: ['planche', 'squat-lent'],
    });
  });

  it('accepte une liste d’exercices à éviter vide ou absente', () => {
    expect(lireParametresSeance({ contexte: 'reveil', ressenti: 'raide', duree: '3', graine: '1' })?.exclure).toEqual([]);
    expect(lireParametresSeance({ contexte: 'reveil', ressenti: 'raide', duree: '3', graine: '1', exclure: '' })?.exclure).toEqual([]);
  });

  it('prend la première valeur quand un paramètre est répété', () => {
    expect(lireParametresSeance({ contexte: ['maison', 'reveil'], ressenti: 'mou', duree: '5', graine: '1' })?.contexteId).toBe('maison');
  });

  it('refuse des paramètres invalides ou un contexte Premium', () => {
    expect(lireParametresSeance({ contexte: 'bureau', ressenti: 'mou', duree: '5', graine: '1' })).toBeNull();
    expect(lireParametresSeance({ contexte: 'lune', ressenti: 'mou', duree: '5', graine: '1' })).toBeNull();
    expect(lireParametresSeance({ contexte: 'maison', ressenti: 'fatigue', duree: '5', graine: '1' })).toBeNull();
    expect(lireParametresSeance({ contexte: 'maison', ressenti: 'mou', duree: '7', graine: '1' })).toBeNull();
    expect(lireParametresSeance({ contexte: 'maison', ressenti: 'mou', duree: '5' })).toBeNull();
  });
});
```

`src/seance/useLecteurSeance.test.ts` :

```ts
import { act, renderHook } from '@testing-library/react-native';

import type { Bloc } from '../generateur/types';
import { fabriquerExercice } from '../test-utils/fabrique';
import { useLecteurSeance } from './useLecteurSeance';

const BLOCS: Bloc[] = [{ exercice: fabriquerExercice(), phase: 'coeur', transitionS: 5, effortS: 20 }];

describe('useLecteurSeance', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('fait avancer le minuteur avec le temps, et plus du tout en pause', async () => {
    const { result } = await renderHook(() => useLecteurSeance(BLOCS));
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(result.current.etat.restantMs).toBe(3000);

    await act(async () => {
      result.current.basculerPause();
    });
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(result.current.etat).toMatchObject({ enPause: true, restantMs: 3000 });
  });
});
```

(Si `renderHook` n'est pas asynchrone dans la version installée, retirer le `await` ; garder les assertions.)

Run : `npx jest src/seance` — Expected : FAIL (modules introuvables).

- [ ] **Step 2 : implémenter le lecteur**

`src/seance/lecteur.ts` :

```ts
import type { Bloc } from '../generateur/types';

export type Etape = 'transition' | 'effort';

export interface EtatLecteur {
  blocs: Bloc[];
  index: number;
  // La transition précède l'effort : on y montre l'exercice qui arrive.
  etape: Etape;
  restantMs: number;
  enPause: boolean;
  termine: boolean;
  // Temps réellement passé, pauses exclues : sert à l'écran Bravo.
  ecouleMs: number;
  // Exercices dont l'effort est allé jusqu'au bout (un exercice passé ne compte pas).
  exercicesFaits: number;
}

export type ActionLecteur =
  | { type: 'avancer'; ms: number }
  | { type: 'passer' }
  | { type: 'pause' }
  | { type: 'reprendre' }
  | { type: 'terminer' };

export function creerEtatInitial(blocs: Bloc[]): EtatLecteur {
  if (blocs.length === 0) throw new Error('Une séance compte au moins un exercice');
  return {
    blocs,
    index: 0,
    etape: 'transition',
    restantMs: blocs[0].transitionS * 1000,
    enPause: false,
    termine: false,
    ecouleMs: 0,
    exercicesFaits: 0,
  };
}

function blocSuivant(etat: EtatLecteur): EtatLecteur {
  const index = etat.index + 1;
  if (index >= etat.blocs.length) return { ...etat, termine: true, restantMs: 0 };
  return { ...etat, index, etape: 'transition', restantMs: etat.blocs[index].transitionS * 1000 };
}

// Un seul pas peut franchir plusieurs étapes (téléphone en veille, onglet en arrière-plan…).
function avancer(etat: EtatLecteur, ms: number): EtatLecteur {
  let courant = etat;
  let reste = ms;
  while (reste > 0 && !courant.termine) {
    const consomme = Math.min(reste, courant.restantMs);
    reste -= consomme;
    courant = { ...courant, restantMs: courant.restantMs - consomme, ecouleMs: courant.ecouleMs + consomme };
    if (courant.restantMs > 0) break;
    courant =
      courant.etape === 'transition'
        ? { ...courant, etape: 'effort', restantMs: courant.blocs[courant.index].effortS * 1000 }
        : blocSuivant({ ...courant, exercicesFaits: courant.exercicesFaits + 1 });
  }
  return courant;
}

export function lecteur(etat: EtatLecteur, action: ActionLecteur): EtatLecteur {
  if (etat.termine) return etat;
  switch (action.type) {
    case 'avancer':
      return etat.enPause || action.ms <= 0 ? etat : avancer(etat, action.ms);
    case 'passer':
      return blocSuivant({ ...etat, enPause: false });
    case 'pause':
      return { ...etat, enPause: true };
    case 'reprendre':
      return { ...etat, enPause: false };
    case 'terminer':
      return { ...etat, termine: true };
  }
}
```

`src/seance/affichage.ts` :

```ts
import type { EtatLecteur } from './lecteur';

// Exercice fait des deux côtés : première moitié de l'effort à gauche, seconde à droite.
export function coteCourant(etat: EtatLecteur): 'gauche' | 'droite' | null {
  const bloc = etat.blocs[etat.index];
  if (!bloc.exercice.bilateral || etat.etape !== 'effort') return null;
  return etat.restantMs > (bloc.effortS * 1000) / 2 ? 'gauche' : 'droite';
}

export function formaterTemps(ms: number): string {
  const secondes = Math.ceil(ms / 1000);
  return `${Math.floor(secondes / 60)}:${String(secondes % 60).padStart(2, '0')}`;
}

export function minutesEffectuees(ms: number): number {
  return Math.round(ms / 60000);
}
```

`src/seance/parametres.ts` :

```ts
import { contexteDisponible } from '../abonnement/acces';
import { CONTEXTES } from '../catalogue/contextes';
import { DUREES, RESSENTIS, type Duree, type Ressenti } from '../catalogue/types';
import type { ParametresSeance } from '../generateur/types';

type Brut = string | string[] | undefined;

export interface ParametresUrl {
  contexte?: Brut;
  ressenti?: Brut;
  duree?: Brut;
  graine?: Brut;
  exclure?: Brut;
}

const premier = (valeur: Brut) => (Array.isArray(valeur) ? valeur[0] : valeur);

// L'écran Séance régénère la séance à partir de l'URL : même graine, même séance.
export function lireParametresSeance(brut: ParametresUrl): ParametresSeance | null {
  const contexte = CONTEXTES.find((c) => c.id === premier(brut.contexte));
  const ressenti = premier(brut.ressenti) as Ressenti | undefined;
  const duree = Number(premier(brut.duree)) as Duree;
  const texteGraine = premier(brut.graine);
  const graine = Number(texteGraine);
  if (
    contexte === undefined ||
    !contexteDisponible(contexte.id) ||
    ressenti === undefined ||
    !RESSENTIS.includes(ressenti) ||
    !DUREES.includes(duree) ||
    texteGraine === undefined ||
    !Number.isFinite(graine)
  ) {
    return null;
  }
  const exclure = (premier(brut.exclure) ?? '').split(',').filter((id) => id !== '');
  return { contexteId: contexte.id, contraintes: contexte.contraintes, ressenti, duree, graine, exclure };
}
```

`src/seance/useLecteurSeance.ts` :

```ts
import { useEffect, useReducer, useRef } from 'react';
import { AppState } from 'react-native';

import type { Bloc } from '../generateur/types';
import { creerEtatInitial, lecteur } from './lecteur';

const PAS_MS = 250;

export function useLecteurSeance(blocs: Bloc[]) {
  const [etat, envoyer] = useReducer(lecteur, blocs, creerEtatInitial);
  const dernierInstant = useRef<number | null>(null);

  // On mesure le temps réellement écoulé : un minuteur JavaScript peut prendre du retard.
  useEffect(() => {
    if (etat.termine || etat.enPause) {
      dernierInstant.current = null;
      return;
    }
    dernierInstant.current = Date.now();
    const minuteur = setInterval(() => {
      const maintenant = Date.now();
      const ecoule = maintenant - (dernierInstant.current ?? maintenant);
      dernierInstant.current = maintenant;
      envoyer({ type: 'avancer', ms: ecoule });
    }, PAS_MS);
    return () => clearInterval(minuteur);
  }, [etat.termine, etat.enPause]);

  // Appel, notification, app en arrière-plan : la séance se met en pause.
  useEffect(() => {
    const abonnement = AppState.addEventListener('change', (statut) => {
      if (statut !== 'active') envoyer({ type: 'pause' });
    });
    return () => abonnement.remove();
  }, []);

  return {
    etat,
    passer: () => envoyer({ type: 'passer' }),
    basculerPause: () => envoyer({ type: etat.enPause ? 'reprendre' : 'pause' }),
    terminer: () => envoyer({ type: 'terminer' }),
  };
}
```

- [ ] **Step 3 : vérifier et committer**

Run : `npx jest && npm run typecheck && npm run lint` — Expected : tout PASS, propre.

```bash
git add src/seance
git commit -m "feat: lecteur de séance (minuteur, pause, passer, terminer)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3 : les trois écrans

**Files :**
- Modify : `app/_layout.tsx`, `app/index.tsx` (remplacement complet de l'écran de démonstration)
- Create : `app/seance.tsx`, `app/bravo.tsx`
- Test : `__tests__/ecrans.test.tsx`

**Interfaces :**
- Consumes : tout ce que produisent les Tasks 1 et 2, `CONTEXTES`, `EXERCICES`, `DUREES`, `RESSENTIS`, `genererSeance`.
- Produces : routes `/` (départ), `/seance?contexte&ressenti&duree&graine&exclure`, `/bravo?minutes&exercices`.

- [ ] **Step 1 : écrire les tests des écrans (ils doivent échouer)**

`__tests__/ecrans.test.tsx` :

```tsx
import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';

import Depart from '../app/index';
import Bravo from '../app/bravo';
import EcranSeance from '../app/seance';
import { stockageTelephone } from '../src/preferences/stockage';

jest.mock('../src/preferences/stockage', () => {
  const { creerStockageMemoire } = jest.requireActual('../src/test-utils/stockageMemoire');
  return { stockageTelephone: creerStockageMemoire() };
});
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Medium: 'medium' },
}));

const memoire = stockageTelephone as unknown as { contenu: Record<string, string> };
const ROUTES = { index: Depart, seance: EcranSeance, bravo: Bravo };

beforeEach(() => {
  for (const cle of Object.keys(memoire.contenu)) delete memoire.contenu[cle];
});

describe('écran de départ', () => {
  it('présélectionne À la maison, Mou et 5 min au premier lancement', async () => {
    await renderRouter(ROUTES, { initialUrl: '/' });
    expect(await screen.findByRole('button', { name: 'À la maison' })).toBeSelected();
    expect(screen.getByRole('button', { name: 'Mou' })).toBeSelected();
    expect(screen.getByRole('button', { name: '5 min' })).toBeSelected();
  });

  it('reprend les derniers choix', async () => {
    memoire.contenu['flashcoach.choix'] = JSON.stringify({ contexteId: 'reveil', ressenti: 'raide', duree: 3 });
    await renderRouter(ROUTES, { initialUrl: '/' });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Au réveil' })).toBeSelected());
    expect(screen.getByRole('button', { name: 'Raide' })).toBeSelected();
    expect(screen.getByRole('button', { name: '3 min' })).toBeSelected();
  });

  it('lance la séance en un seul tap et retient les choix', async () => {
    await renderRouter(ROUTES, { initialUrl: '/' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Lancer ma séance' }));
    await waitFor(() => expect(screen).toHavePathname('/seance'));
    expect(JSON.parse(memoire.contenu['flashcoach.choix'])).toEqual({ contexteId: 'maison', ressenti: 'mou', duree: 5 });
  });

  it('annonce Premium sans changer la sélection', async () => {
    await renderRouter(ROUTES, { initialUrl: '/' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Au bureau, Premium' }));
    expect(screen.getByText('Bientôt avec Premium 🔒')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'À la maison' })).toBeSelected();
  });
});

describe('écran de séance', () => {
  it('démarre la séance avec le compteur et le minuteur', async () => {
    await renderRouter(ROUTES, { initialUrl: '/seance?contexte=maison&ressenti=mou&duree=5&graine=1' });
    expect(await screen.findByText('1 / 8')).toBeTruthy();
    expect(screen.getByText('0:05')).toBeTruthy();
  });

  it('renvoie au départ si les paramètres sont invalides', async () => {
    await renderRouter(ROUTES, { initialUrl: '/seance?contexte=bureau&ressenti=mou&duree=5&graine=1' });
    await waitFor(() => expect(screen).toHavePathname('/'));
  });

  it('termine la séance et affiche le bilan', async () => {
    await renderRouter(ROUTES, { initialUrl: '/seance?contexte=maison&ressenti=mou&duree=5&graine=1' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Terminer la séance' }));
    await waitFor(() => expect(screen).toHavePathname('/bravo'));
    expect(screen.getByText('Pas grave, on remet ça quand tu veux.')).toBeTruthy();
  });
});

describe('écran Bravo', () => {
  it('résume la séance', async () => {
    await renderRouter(ROUTES, { initialUrl: '/bravo?minutes=5&exercices=8' });
    expect(await screen.findByText('Bravo !')).toBeTruthy();
    expect(screen.getByText('5 min · 8 exercices')).toBeTruthy();
  });

  it('remercie après la réponse à « Tu te sens mieux ? »', async () => {
    await renderRouter(ROUTES, { initialUrl: '/bravo?minutes=5&exercices=8' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Mieux' }));
    expect(screen.getByText('Merci !')).toBeTruthy();
  });

  it('repart vers le départ', async () => {
    await renderRouter(ROUTES, { initialUrl: '/bravo?minutes=5&exercices=8' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Et on est repartis' }));
    await waitFor(() => expect(screen).toHavePathname('/'));
  });
});
```

Run : `npx jest __tests__` — Expected : FAIL (routes `seance` et `bravo` introuvables, départ encore en mode démonstration).

- [ ] **Step 2 : la pile de navigation**

`app/_layout.tsx` :

```tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { COULEURS } from '../src/ui/theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COULEURS.fond } }} />
    </>
  );
}
```

- [ ] **Step 3 : l'écran de départ**

`app/index.tsx` (remplacement complet) :

```tsx
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { contexteDisponible } from '../src/abonnement/acces';
import { CONTEXTES } from '../src/catalogue/contextes';
import { DUREES, RESSENTIS } from '../src/catalogue/types';
import {
  CHOIX_PAR_DEFAUT,
  ecrireChoix,
  lireChoix,
  lireDerniersExercices,
  type Choix,
} from '../src/preferences/preferences';
import { stockageTelephone } from '../src/preferences/stockage';
import { Bouton } from '../src/ui/Bouton';
import { CarteOption } from '../src/ui/CarteOption';
import { LIBELLES_RESSENTI } from '../src/ui/libelles';
import { COULEURS, ESPACE } from '../src/ui/theme';

// Zéro configuration : tout est présélectionné, un seul tap suffit pour lancer la séance.
export default function Depart() {
  const [choix, setChoix] = useState<Choix>(CHOIX_PAR_DEFAUT);
  const [derniersExercices, setDerniersExercices] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let actif = true;
    Promise.all([lireChoix(stockageTelephone), lireDerniersExercices(stockageTelephone)]).then(([lus, ids]) => {
      if (!actif) return;
      setChoix(lus);
      setDerniersExercices(ids);
    });
    return () => {
      actif = false;
    };
  }, []);

  const choisirContexte = (contexteId: string) => {
    if (!contexteDisponible(contexteId)) {
      setMessage('Bientôt avec Premium 🔒');
      return;
    }
    setMessage(null);
    setChoix((actuel) => ({ ...actuel, contexteId }));
  };

  const lancer = () => {
    ecrireChoix(stockageTelephone, choix).catch(() => undefined);
    router.push({
      pathname: '/seance',
      params: {
        contexte: choix.contexteId,
        ressenti: choix.ressenti,
        duree: String(choix.duree),
        graine: String(Date.now()),
        exclure: derniersExercices.join(','),
      },
    });
  };

  return (
    <SafeAreaView style={styles.ecran}>
      <ScrollView contentContainerStyle={styles.contenu}>
        <Text style={styles.titre}>Flash Coach</Text>
        <Text style={styles.slogan}>Où que tu sois, 5 minutes pour te sentir mieux.</Text>

        <Text style={styles.section}>Où es-tu ?</Text>
        <View style={styles.grille}>
          {CONTEXTES.map((contexte) => (
            <CarteOption
              key={contexte.id}
              libelle={contexte.nom}
              emoji={contexte.emoji}
              selectionne={choix.contexteId === contexte.id}
              verrouille={!contexteDisponible(contexte.id)}
              onPress={() => choisirContexte(contexte.id)}
              style={styles.demiLargeur}
            />
          ))}
        </View>
        {message !== null && (
          <Text style={styles.message} accessibilityLiveRegion="polite">
            {message}
          </Text>
        )}

        <Text style={styles.section}>Comment tu te sens ?</Text>
        <View style={styles.grille}>
          {RESSENTIS.map((ressenti) => (
            <CarteOption
              key={ressenti}
              libelle={LIBELLES_RESSENTI[ressenti].libelle}
              emoji={LIBELLES_RESSENTI[ressenti].emoji}
              selectionne={choix.ressenti === ressenti}
              onPress={() => setChoix((actuel) => ({ ...actuel, ressenti }))}
              style={styles.demiLargeur}
            />
          ))}
        </View>

        <Text style={styles.section}>Combien de temps ?</Text>
        <View style={styles.ligne}>
          {DUREES.map((duree) => (
            <CarteOption
              key={duree}
              libelle={`${duree} min`}
              selectionne={choix.duree === duree}
              onPress={() => setChoix((actuel) => ({ ...actuel, duree }))}
              style={styles.tiers}
            />
          ))}
        </View>
      </ScrollView>
      <View style={styles.pied}>
        <Bouton libelle="Lancer ma séance" onPress={lancer} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: COULEURS.fond },
  contenu: { padding: ESPACE, paddingBottom: ESPACE * 2, gap: 12 },
  titre: { color: COULEURS.texte, fontSize: 28, fontWeight: '800', textAlign: 'center', marginTop: 8 },
  slogan: { color: COULEURS.texteDiscret, fontSize: 15, textAlign: 'center', marginBottom: 8 },
  section: { color: COULEURS.texte, fontSize: 20, fontWeight: '700', marginTop: 12 },
  grille: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  ligne: { flexDirection: 'row', gap: 10 },
  demiLargeur: { flexBasis: '47%', flexGrow: 1 },
  tiers: { flex: 1, alignItems: 'center' },
  message: { color: COULEURS.texteDiscret, fontSize: 15 },
  pied: { padding: ESPACE },
});
```

- [ ] **Step 4 : l'écran de séance**

`app/seance.tsx` :

```tsx
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EXERCICES } from '../src/catalogue/exercices';
import { genererSeance } from '../src/generateur/generer';
import type { ParametresSeance } from '../src/generateur/types';
import { ecrireDerniersExercices } from '../src/preferences/preferences';
import { stockageTelephone } from '../src/preferences/stockage';
import { coteCourant, formaterTemps, minutesEffectuees } from '../src/seance/affichage';
import { lireParametresSeance } from '../src/seance/parametres';
import { useLecteurSeance } from '../src/seance/useLecteurSeance';
import { Bouton } from '../src/ui/Bouton';
import { LIBELLES_PHASE } from '../src/ui/libelles';
import { COULEURS, ESPACE, RAYON } from '../src/ui/theme';

export default function EcranSeance() {
  const { contexte, ressenti, duree, graine, exclure } = useLocalSearchParams<{
    contexte: string;
    ressenti: string;
    duree: string;
    graine: string;
    exclure: string;
  }>();
  const parametres = useMemo(
    () => lireParametresSeance({ contexte, ressenti, duree, graine, exclure }),
    [contexte, ressenti, duree, graine, exclure],
  );
  if (parametres === null) return <Redirect href="/" />;
  return <LecteurSeance parametres={parametres} />;
}

function LecteurSeance({ parametres }: { parametres: ParametresSeance }) {
  useKeepAwake();
  const seance = useMemo(() => genererSeance(parametres, EXERCICES), [parametres]);
  const { etat, passer, basculerPause, terminer } = useLecteurSeance(seance.blocs);
  const bloc = etat.blocs[etat.index];
  const cote = coteCourant(etat);

  // Les exercices de cette séance seront évités la prochaine fois.
  useEffect(() => {
    ecrireDerniersExercices(stockageTelephone, seance.blocs.map((b) => b.exercice.id)).catch(() => undefined);
  }, [seance]);

  // Une vibration à chaque changement d'étape, pas au démarrage.
  const premierRendu = useRef(true);
  useEffect(() => {
    if (premierRendu.current) {
      premierRendu.current = false;
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
  }, [etat.index, etat.etape]);

  useEffect(() => {
    if (!etat.termine) return;
    router.replace({
      pathname: '/bravo',
      params: { minutes: String(minutesEffectuees(etat.ecouleMs)), exercices: String(etat.exercicesFaits) },
    });
  }, [etat.termine, etat.ecouleMs, etat.exercicesFaits]);

  return (
    <SafeAreaView style={styles.ecran}>
      <View style={styles.entete}>
        <Pressable accessibilityRole="button" accessibilityLabel="Quitter la séance" onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.retour}>‹</Text>
        </Pressable>
        <Text style={styles.compteur}>{`${etat.index + 1} / ${etat.blocs.length}`}</Text>
      </View>

      <View style={styles.carte}>
        <Text style={styles.phase}>{etat.etape === 'transition' ? 'À suivre' : LIBELLES_PHASE[bloc.phase]}</Text>
        <Text style={styles.nom}>{bloc.exercice.nom}</Text>
        {cote !== null && <Text style={styles.cote}>{cote === 'gauche' ? 'Côté gauche' : 'Côté droit'}</Text>}
        <Text style={styles.consigne}>{bloc.exercice.consigne}</Text>
      </View>

      <Text style={styles.minuteur} accessibilityRole="timer">
        {formaterTemps(etat.restantMs)}
      </Text>
      {etat.enPause && <Text style={styles.pause}>En pause</Text>}

      <View style={styles.actions}>
        <Bouton libelle={etat.enPause ? 'Reprendre' : 'Pause'} variante="secondaire" onPress={basculerPause} />
        <View style={styles.ligne}>
          <Bouton libelle="Passer" onPress={passer} />
          <Bouton libelle="Terminer la séance" variante="secondaire" onPress={terminer} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: COULEURS.fond, padding: ESPACE, gap: 16 },
  entete: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  retour: { color: COULEURS.texte, fontSize: 32, paddingHorizontal: 8 },
  compteur: { color: COULEURS.texte, fontSize: 18, fontWeight: '600' },
  carte: { backgroundColor: COULEURS.carteClaire, borderRadius: RAYON, padding: 24, gap: 8, minHeight: 220, justifyContent: 'center' },
  phase: { color: COULEURS.texteSombre, fontSize: 14, fontWeight: '700', textTransform: 'uppercase' },
  nom: { color: COULEURS.texteSombre, fontSize: 28, fontWeight: '800' },
  cote: { color: COULEURS.texteSombre, fontSize: 18, fontWeight: '700' },
  consigne: { color: COULEURS.texteSombre, fontSize: 16, lineHeight: 22 },
  minuteur: { color: COULEURS.texte, fontSize: 64, fontWeight: '800', textAlign: 'center', fontVariant: ['tabular-nums'] },
  pause: { color: COULEURS.texteDiscret, fontSize: 16, textAlign: 'center' },
  actions: { marginTop: 'auto', gap: 12 },
  ligne: { flexDirection: 'row', gap: 12 },
});
```

- [ ] **Step 5 : l'écran Bravo**

`app/bravo.tsx` :

```tsx
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Bouton } from '../src/ui/Bouton';
import { COULEURS, ESPACE } from '../src/ui/theme';

function resume(minutes: number, exercices: number): string {
  if (exercices === 0) return 'Pas grave, on remet ça quand tu veux.';
  const duree = minutes === 0 ? 'Moins d’une minute' : `${minutes} min`;
  return `${duree} · ${exercices} exercice${exercices > 1 ? 's' : ''}`;
}

export default function Bravo() {
  const params = useLocalSearchParams<{ minutes: string; exercices: string }>();
  const minutes = Number(params.minutes) || 0;
  const exercices = Number(params.exercices) || 0;
  // La réponse sera enregistrée dans le journal au jalon 3.
  const [repondu, setRepondu] = useState(false);

  return (
    <SafeAreaView style={styles.ecran}>
      <View style={styles.centre}>
        <View style={styles.coche}>
          <Text style={styles.texteCoche}>✓</Text>
        </View>
        <Text style={styles.titre}>{exercices === 0 ? 'À bientôt !' : 'Bravo !'}</Text>
        <Text style={styles.resume}>{resume(minutes, exercices)}</Text>

        <Text style={styles.question}>Tu te sens mieux ?</Text>
        {repondu ? (
          <Text style={styles.merci}>Merci !</Text>
        ) : (
          <View style={styles.ligne}>
            <Bouton libelle="Mieux" variante="secondaire" onPress={() => setRepondu(true)} />
            <Bouton libelle="Pareil" variante="secondaire" onPress={() => setRepondu(true)} />
          </View>
        )}
      </View>
      <Bouton libelle="Et on est repartis" onPress={() => router.replace('/')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: COULEURS.fond, padding: ESPACE },
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  coche: { width: 96, height: 96, borderRadius: 48, backgroundColor: COULEURS.orange, alignItems: 'center', justifyContent: 'center' },
  texteCoche: { color: COULEURS.texteSurOrange, fontSize: 48, fontWeight: '800' },
  titre: { color: COULEURS.texte, fontSize: 36, fontWeight: '800' },
  resume: { color: COULEURS.texte, fontSize: 18, textAlign: 'center' },
  question: { color: COULEURS.texte, fontSize: 18, fontWeight: '700', marginTop: 24 },
  ligne: { flexDirection: 'row', gap: 12, alignSelf: 'stretch' },
  merci: { color: COULEURS.texteDiscret, fontSize: 18 },
});
```

- [ ] **Step 6 : vérifier et committer**

Run : `npx jest && npm run typecheck && npm run lint && npx expo export --platform web` — Expected : tout PASS, propre, export réussi.

```bash
git add app __tests__
git commit -m "feat: écrans départ, séance et Bravo" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
