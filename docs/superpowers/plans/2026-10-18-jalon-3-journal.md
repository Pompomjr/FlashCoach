# Jalon 3 : journal des séances

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Mode « économe » : chaque Task est un lot, relu une fois.

**Goal :** chaque séance est enregistrée sur le téléphone (créée au lancement, complétée à la fin, avec la réponse à « Tu te sens mieux ? »), et un écran « Mon journal » montre la preuve de la promesse (« Séances qui t’ont fait du bien : 9 sur 10 ») et la liste des séances.

**Architecture :** un module pur `src/journal/` (lecture, ajout, mise à jour, résumé) au-dessus de l'interface `Stockage` du jalon 2, avec des opérations mises en série pour éviter qu'une écriture en écrase une autre. L'écran Séance crée l'entrée au montage, la complète à la fin (ou garde le temps fait si l'on quitte) et passe son identifiant à Bravo, qui y enregistre la réponse. Nouvel écran `app/journal.tsx`, accessible par un lien « Mon journal » sur le départ.

**Tech Stack :** identique au jalon 2 (Expo SDK 58, Expo Router 58, TypeScript strict, Jest + RNTL 14 + expo-router/testing-library). Aucune nouvelle dépendance.

**Spec :** conception validée par Mattia le 2026-10-18 (voir session) ; fiche technique Notion section 3 (« Séance (journal) ») et section 6 (« App fermée en pleine séance → enregistrée non terminée »).

## Global Constraints

- App dans `C:\dev\projects\FlashCoach\mobile`, dépôt à la racine, branche `jalon-3`. Commandes depuis `mobile/`.
- TypeScript strict, identifiants en français sans accents. Textes visibles : ton complice, jamais culpabilisant (une séance non finie est « écourtée », jamais « ratée »), apostrophe typographique `’`, formulations neutres en genre.
- **Zéro configuration intacte :** le lien « Mon journal » n'ajoute aucune étape avant le lancement ; le lancement reste en un tap.
- **Le journal ne bloque jamais une séance :** lecture et écriture absorbent toutes les erreurs du stockage, comme les préférences.
- Stockage : clé `flashcoach.journal.v1`, entrées les plus récentes en premier, 500 au maximum.
- Données locales uniquement (Supabase au jalon 4). Journal ouvert à tous jusqu'au jalon 5 (Premium), sans code de restriction.
- Contrastes du jalon 2 (`src/ui/theme.ts`), jamais de texte blanc sur l'orange. Tests jamais dans `app/`.
- Chaque commit se termine par `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Ne pas toucher au générateur (`src/generateur/`) : une autre session travaille dessus.

---

### Task 1 : module journal

**Files :**
- Create : `src/journal/journal.ts`, `src/journal/affichage.ts`, `src/test-utils/journal.ts`
- Test : `src/journal/journal.test.ts`, `src/journal/affichage.test.ts`

**Interfaces :**
- Consumes : `Stockage` (`src/preferences/stockage.ts`), `Duree`, `Ressenti`, `DUREES`, `RESSENTIS` (`src/catalogue/types.ts`), `minutesEffectuees` (`src/seance/affichage.ts`), `creerStockageMemoire` (`src/test-utils/stockageMemoire.ts`).
- Produces :
  - `Apres = 'mieux' | 'pareil'`, `EntreeJournal`, `ChangementEntree`, `CLE_JOURNAL`, `TAILLE_MAX_JOURNAL`
  - `creerIdentifiant(): string`, `lireJournal(stockage): Promise<EntreeJournal[]>`, `ajouterEntree(stockage, entree): Promise<void>`, `mettreAJourEntree(stockage, id, changement): Promise<void>`, `resumeJournal(entrees): { seances; repondues; mieux }`
  - `formaterDate(iso): string` (« dim. 18 oct. · 7h05 »), `formaterBilan(ecouleMs, exercicesFaits, terminee): string`, `texteResume(resume): string | null`
  - `fabriquerEntree(surcharge?): EntreeJournal` (`src/test-utils/journal.ts`)

- [ ] **Step 1 : écrire la fabrique et les tests (ils doivent échouer)**

`src/test-utils/journal.ts` :

```ts
import type { EntreeJournal } from '../journal/journal';

export function fabriquerEntree(surcharge: Partial<EntreeJournal> = {}): EntreeJournal {
  return {
    id: 'entree-test',
    debut: new Date(2026, 9, 18, 7, 5).toISOString(),
    contexteId: 'maison',
    ressenti: 'mou',
    duree: 5,
    graine: 1,
    exercices: ['rotation-epaules', 'squat-lent'],
    ecouleMs: 300000,
    exercicesFaits: 8,
    terminee: true,
    apres: null,
    ...surcharge,
  };
}
```

`src/journal/journal.test.ts` :

```ts
import type { Stockage } from '../preferences/stockage';
import { fabriquerEntree } from '../test-utils/journal';
import { creerStockageMemoire } from '../test-utils/stockageMemoire';
import {
  CLE_JOURNAL,
  TAILLE_MAX_JOURNAL,
  ajouterEntree,
  creerIdentifiant,
  lireJournal,
  mettreAJourEntree,
  resumeJournal,
} from './journal';

const enPanne: Stockage = {
  lire: async () => {
    throw new Error('panne');
  },
  ecrire: async () => {
    throw new Error('panne');
  },
};

describe('journal', () => {
  it('est vide au premier lancement', async () => {
    expect(await lireJournal(creerStockageMemoire())).toEqual([]);
  });

  it('garde les séances, la plus récente en premier', async () => {
    const stockage = creerStockageMemoire();
    await ajouterEntree(stockage, fabriquerEntree({ id: 'a' }));
    await ajouterEntree(stockage, fabriquerEntree({ id: 'b' }));
    expect((await lireJournal(stockage)).map((e) => e.id)).toEqual(['b', 'a']);
  });

  it(`ne garde que les ${TAILLE_MAX_JOURNAL} dernières séances`, async () => {
    const anciennes = Array.from({ length: TAILLE_MAX_JOURNAL }, (_, i) => fabriquerEntree({ id: `e${i}` }));
    const stockage = creerStockageMemoire({ [CLE_JOURNAL]: JSON.stringify(anciennes) });
    await ajouterEntree(stockage, fabriquerEntree({ id: 'nouvelle' }));
    const journal = await lireJournal(stockage);
    expect(journal).toHaveLength(TAILLE_MAX_JOURNAL);
    expect(journal[0].id).toBe('nouvelle');
    expect(journal.some((e) => e.id === `e${TAILLE_MAX_JOURNAL - 1}`)).toBe(false);
  });

  it('complète une séance sans toucher aux autres', async () => {
    const stockage = creerStockageMemoire();
    await ajouterEntree(stockage, fabriquerEntree({ id: 'a', terminee: false, ecouleMs: 0, exercicesFaits: 0 }));
    await ajouterEntree(stockage, fabriquerEntree({ id: 'b' }));
    await mettreAJourEntree(stockage, 'a', { terminee: true, ecouleMs: 180000, exercicesFaits: 5, apres: 'mieux' });
    const [b, a] = await lireJournal(stockage);
    expect(a).toMatchObject({ id: 'a', terminee: true, ecouleMs: 180000, exercicesFaits: 5, apres: 'mieux' });
    expect(b).toEqual(fabriquerEntree({ id: 'b' }));
  });

  it('ignore la mise à jour d’une séance inconnue', async () => {
    const stockage = creerStockageMemoire();
    await ajouterEntree(stockage, fabriquerEntree({ id: 'a' }));
    await mettreAJourEntree(stockage, 'inconnue', { apres: 'mieux' });
    expect(await lireJournal(stockage)).toEqual([fabriquerEntree({ id: 'a' })]);
  });

  it('applique les opérations dans l’ordre même lancées sans attendre', async () => {
    const stockage = creerStockageMemoire();
    await Promise.all([
      ajouterEntree(stockage, fabriquerEntree({ id: 'a', apres: null })),
      mettreAJourEntree(stockage, 'a', { apres: 'pareil' }),
      ajouterEntree(stockage, fabriquerEntree({ id: 'b' })),
    ]);
    const journal = await lireJournal(stockage);
    expect(journal.map((e) => e.id)).toEqual(['b', 'a']);
    expect(journal[1].apres).toBe('pareil');
  });

  it('écarte les données abîmées et garde les entrées valides', async () => {
    expect(await lireJournal(creerStockageMemoire({ [CLE_JOURNAL]: '{pas du json' }))).toEqual([]);
    const melange = [fabriquerEntree({ id: 'ok' }), { id: 'cassee' }, fabriquerEntree({ id: 'ko', ressenti: 'fatigue' as never })];
    const journal = await lireJournal(creerStockageMemoire({ [CLE_JOURNAL]: JSON.stringify(melange) }));
    expect(journal.map((e) => e.id)).toEqual(['ok']);
  });

  it('ne bloque jamais quand le stockage est en panne', async () => {
    expect(await lireJournal(enPanne)).toEqual([]);
    await expect(ajouterEntree(enPanne, fabriquerEntree())).resolves.toBeUndefined();
    await expect(mettreAJourEntree(enPanne, 'a', { apres: 'mieux' })).resolves.toBeUndefined();
  });

  it('crée des identifiants différents', () => {
    expect(creerIdentifiant()).not.toBe(creerIdentifiant());
  });
});

describe('resumeJournal', () => {
  it('compte les séances, les réponses et les « mieux »', () => {
    const entrees = [
      fabriquerEntree({ id: 'a', apres: 'mieux' }),
      fabriquerEntree({ id: 'b', apres: 'pareil' }),
      fabriquerEntree({ id: 'c', apres: null }),
      fabriquerEntree({ id: 'd', apres: 'mieux' }),
    ];
    expect(resumeJournal(entrees)).toEqual({ seances: 4, repondues: 3, mieux: 2 });
  });
});
```

`src/journal/affichage.test.ts` :

```ts
import { formaterBilan, formaterDate, texteResume } from './affichage';

describe('formaterDate', () => {
  it('donne le jour, la date et l’heure locale en français', () => {
    expect(formaterDate(new Date(2026, 9, 18, 7, 5).toISOString())).toBe('dim. 18 oct. · 7h05');
    expect(formaterDate(new Date(2026, 0, 1, 18, 30).toISOString())).toBe('jeu. 1 janv. · 18h30');
  });

  it('reste vide pour une date illisible', () => {
    expect(formaterDate('pas une date')).toBe('');
  });
});

describe('formaterBilan', () => {
  it('résume la durée et les exercices', () => {
    expect(formaterBilan(300000, 8, true)).toBe('5 min · 8 exercices');
    expect(formaterBilan(60000, 1, true)).toBe('1 min · 1 exercice');
  });

  it('signale une séance écourtée, sans jugement', () => {
    expect(formaterBilan(20000, 0, false)).toBe('Moins d’une minute · écourtée');
    expect(formaterBilan(180000, 0, false)).toBe('3 min · écourtée');
  });
});

describe('texteResume', () => {
  it('ne dit rien quand il n’y a aucune séance', () => {
    expect(texteResume({ seances: 0, repondues: 0, mieux: 0 })).toBeNull();
  });

  it('invite à répondre quand aucune séance n’a de réponse', () => {
    expect(texteResume({ seances: 3, repondues: 0, mieux: 0 })).toBe(
      'Réponds à « Tu te sens mieux ? » après une séance pour suivre tes progrès.',
    );
  });

  it('montre la preuve de la promesse', () => {
    expect(texteResume({ seances: 12, repondues: 10, mieux: 9 })).toBe('Séances qui t’ont fait du bien : 9 sur 10');
  });
});
```

Run : `npx jest src/journal` — Expected : FAIL (modules introuvables).

- [ ] **Step 2 : implémenter le journal**

`src/journal/journal.ts` :

```ts
import { DUREES, RESSENTIS, type Duree, type Ressenti } from '../catalogue/types';
import type { Stockage } from '../preferences/stockage';

export type Apres = 'mieux' | 'pareil';

export interface EntreeJournal {
  id: string;
  // Date ISO du lancement.
  debut: string;
  contexteId: string;
  ressenti: Ressenti;
  duree: Duree;
  graine: number;
  exercices: string[];
  ecouleMs: number;
  exercicesFaits: number;
  // Vrai si la séance est allée au bout ; faux si elle a été écourtée (Terminer, Quitter, app fermée).
  terminee: boolean;
  apres: Apres | null;
}

export type ChangementEntree = Partial<Pick<EntreeJournal, 'ecouleMs' | 'exercicesFaits' | 'terminee' | 'apres'>>;

export const CLE_JOURNAL = 'flashcoach.journal.v1';
export const TAILLE_MAX_JOURNAL = 500;

export function creerIdentifiant(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function estEntree(valeur: unknown): valeur is EntreeJournal {
  if (typeof valeur !== 'object' || valeur === null) return false;
  const v = valeur as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.debut === 'string' &&
    typeof v.contexteId === 'string' &&
    RESSENTIS.includes(v.ressenti as Ressenti) &&
    DUREES.includes(v.duree as Duree) &&
    typeof v.graine === 'number' &&
    Array.isArray(v.exercices) &&
    v.exercices.every((id) => typeof id === 'string') &&
    typeof v.ecouleMs === 'number' &&
    v.ecouleMs >= 0 &&
    typeof v.exercicesFaits === 'number' &&
    v.exercicesFaits >= 0 &&
    typeof v.terminee === 'boolean' &&
    (v.apres === null || v.apres === 'mieux' || v.apres === 'pareil')
  );
}

// Le journal ne doit jamais bloquer une séance : lecture et écriture absorbent toutes les erreurs.
async function lireSansErreur(stockage: Stockage): Promise<EntreeJournal[]> {
  try {
    const texte = await stockage.lire(CLE_JOURNAL);
    const valeur: unknown = texte === null ? [] : JSON.parse(texte);
    return Array.isArray(valeur) ? valeur.filter(estEntree) : [];
  } catch {
    return [];
  }
}

async function ecrireSansErreur(stockage: Stockage, entrees: EntreeJournal[]): Promise<void> {
  try {
    await stockage.ecrire(CLE_JOURNAL, JSON.stringify(entrees));
  } catch {
    // Une séance non enregistrée vaut mieux qu'une séance bloquée.
  }
}

// Lire-modifier-écrire n'est pas atomique : on met les opérations d'un même stockage en file.
const files = new WeakMap<Stockage, Promise<unknown>>();

function enSerie<T>(stockage: Stockage, operation: () => Promise<T>): Promise<T> {
  const precedente = files.get(stockage) ?? Promise.resolve();
  const suivante = precedente.then(operation, operation);
  files.set(stockage, suivante.catch(() => undefined));
  return suivante;
}

export function lireJournal(stockage: Stockage): Promise<EntreeJournal[]> {
  return enSerie(stockage, () => lireSansErreur(stockage));
}

export function ajouterEntree(stockage: Stockage, entree: EntreeJournal): Promise<void> {
  return enSerie(stockage, async () => {
    const entrees = await lireSansErreur(stockage);
    const sansDoublon = entrees.filter((e) => e.id !== entree.id);
    await ecrireSansErreur(stockage, [entree, ...sansDoublon].slice(0, TAILLE_MAX_JOURNAL));
  });
}

export function mettreAJourEntree(stockage: Stockage, id: string, changement: ChangementEntree): Promise<void> {
  return enSerie(stockage, async () => {
    const entrees = await lireSansErreur(stockage);
    if (!entrees.some((e) => e.id === id)) return;
    await ecrireSansErreur(
      stockage,
      entrees.map((e) => (e.id === id ? { ...e, ...changement } : e)),
    );
  });
}

export function resumeJournal(entrees: EntreeJournal[]): { seances: number; repondues: number; mieux: number } {
  return {
    seances: entrees.length,
    repondues: entrees.filter((e) => e.apres !== null).length,
    mieux: entrees.filter((e) => e.apres === 'mieux').length,
  };
}
```

`src/journal/affichage.ts` :

```ts
import { minutesEffectuees } from '../seance/affichage';

const JOURS = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
const MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

// Format fixe (pas toLocaleDateString) : même rendu sur tous les téléphones et dans les tests.
export function formaterDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${JOURS[date.getDay()]} ${date.getDate()} ${MOIS[date.getMonth()]} · ${date.getHours()}h${minutes}`;
}

export function formaterBilan(ecouleMs: number, exercicesFaits: number, terminee: boolean): string {
  const minutes = minutesEffectuees(ecouleMs);
  const parties = [minutes === 0 ? 'Moins d’une minute' : `${minutes} min`];
  if (exercicesFaits > 0) parties.push(`${exercicesFaits} exercice${exercicesFaits > 1 ? 's' : ''}`);
  if (!terminee) parties.push('écourtée');
  return parties.join(' · ');
}

export function texteResume(resume: { seances: number; repondues: number; mieux: number }): string | null {
  if (resume.seances === 0) return null;
  if (resume.repondues === 0) return 'Réponds à « Tu te sens mieux ? » après une séance pour suivre tes progrès.';
  return `Séances qui t’ont fait du bien : ${resume.mieux} sur ${resume.repondues}`;
}
```

- [ ] **Step 3 : vérifier et committer**

Run : `npx jest && npm run typecheck && npm run lint` — Expected : tout PASS (193 + nouveaux), propre.

```bash
git add src/journal src/test-utils/journal.ts
git commit -m "feat: journal local des séances" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2 : enregistrement dans la séance et Bravo, écran « Mon journal »

**Files :**
- Modify : `app/seance.tsx`, `app/bravo.tsx`, `app/index.tsx`, `__tests__/ecrans.test.tsx`
- Create : `app/journal.tsx`

**Interfaces :**
- Consumes : Task 1 (`ajouterEntree`, `mettreAJourEntree`, `lireJournal`, `resumeJournal`, `creerIdentifiant`, `Apres`, `EntreeJournal`, `formaterDate`, `formaterBilan`, `texteResume`, `fabriquerEntree`, `CLE_JOURNAL`), `stockageTelephone`, `CONTEXTES`, `LIBELLES_RESSENTI`, `COULEURS`, `ESPACE`, `RAYON`.
- Produces : route `/journal` ; `/bravo` accepte en plus `seance=<id d'entrée>`.

- [ ] **Step 1 : écrire les tests (ils doivent échouer)**

Dans `__tests__/ecrans.test.tsx` : importer `Journal from '../app/journal'`, `fabriquerEntree` (`../src/test-utils/journal`) et `CLE_JOURNAL` (`../src/journal/journal`) ; ajouter `journal: Journal` à `ROUTES` ; ajouter l'aide

```ts
const journalEnMemoire = () => JSON.parse(memoire.contenu[CLE_JOURNAL] ?? '[]');
```

puis ces tests (minuteurs factices et `act` comme les tests existants de fin naturelle ; RNTL 14 asynchrone) :

```tsx
describe('journal : enregistrement', () => {
  it('crée une entrée écourtée dès le début de la séance', async () => {
    await renderRouter(ROUTES, { initialUrl: SEANCE });
    await waitFor(() => expect(journalEnMemoire()).toHaveLength(1));
    expect(journalEnMemoire()[0]).toMatchObject({
      contexteId: 'maison',
      ressenti: 'mou',
      duree: 5,
      graine: 1,
      terminee: false,
      apres: null,
      ecouleMs: 0,
      exercicesFaits: 0,
    });
    expect(journalEnMemoire()[0].exercices).toHaveLength(8);
  });

  it('marque la séance allée au bout et passe son identifiant à Bravo', async () => {
    jest.useFakeTimers();
    await renderRouter(ROUTES, { initialUrl: SEANCE });
    await act(async () => {
      jest.advanceTimersByTime(301000);
    });
    await waitFor(() => expect(screen).toHavePathname('/bravo'));
    const [entree] = journalEnMemoire();
    expect(entree).toMatchObject({ terminee: true, exercicesFaits: 8, ecouleMs: 300000 });
    // Vérifier que l'URL de Bravo contient seance=<entree.id>, avec la même méthode que le test existant de fin naturelle.
  });

  it('garde la séance écourtée quand on termine avant la fin', async () => {
    jest.useFakeTimers();
    await renderRouter(ROUTES, { initialUrl: SEANCE });
    await act(async () => {
      jest.advanceTimersByTime(7000);
    });
    await fireEvent.press(screen.getByRole('button', { name: 'Terminer la séance' }));
    await waitFor(() => expect(screen).toHavePathname('/bravo'));
    expect(journalEnMemoire()[0]).toMatchObject({ terminee: false, ecouleMs: 7000, exercicesFaits: 0 });
  });

  it('garde le temps fait quand on quitte la séance', async () => {
    jest.useFakeTimers();
    await renderRouter(ROUTES, { initialUrl: SEANCE });
    await act(async () => {
      jest.advanceTimersByTime(7000);
    });
    await fireEvent.press(screen.getByRole('button', { name: 'Quitter la séance' }));
    await waitFor(() => expect(journalEnMemoire()[0]).toMatchObject({ terminee: false, ecouleMs: 7000 }));
  });

  it('enregistre la réponse à « Tu te sens mieux ? »', async () => {
    memoire.contenu[CLE_JOURNAL] = JSON.stringify([fabriquerEntree({ id: 'e1' })]);
    await renderRouter(ROUTES, { initialUrl: '/bravo?minutes=5&exercices=8&seance=e1' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Mieux' }));
    await waitFor(() => expect(journalEnMemoire()[0].apres).toBe('mieux'));
    expect(screen.getByText('Merci !')).toBeTruthy();
  });

  it('ne pose pas la question quand rien n’a été fait', async () => {
    await renderRouter(ROUTES, { initialUrl: '/bravo?minutes=0&exercices=0' });
    expect(await screen.findByText('À bientôt !')).toBeTruthy();
    expect(screen.queryByText('Tu te sens mieux ?')).toBeNull();
  });
});

describe('écran Mon journal', () => {
  it('s’ouvre depuis le départ sans gêner le lancement', async () => {
    await renderRouter(ROUTES, { initialUrl: '/' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Mon journal' }));
    await waitFor(() => expect(screen).toHavePathname('/journal'));
  });

  it('invite à faire une première séance quand il est vide', async () => {
    await renderRouter(ROUTES, { initialUrl: '/journal' });
    expect(await screen.findByText('Ta première séance apparaîtra ici.')).toBeTruthy();
  });

  it('montre la preuve de la promesse et les séances', async () => {
    memoire.contenu[CLE_JOURNAL] = JSON.stringify([
      fabriquerEntree({ id: 'a', apres: 'mieux' }),
      fabriquerEntree({ id: 'b', apres: 'pareil', contexteId: 'reveil', ressenti: 'raide' }),
      fabriquerEntree({ id: 'c', apres: null, terminee: false, ecouleMs: 20000, exercicesFaits: 0 }),
    ]);
    await renderRouter(ROUTES, { initialUrl: '/journal' });
    expect(await screen.findByText('Séances qui t’ont fait du bien : 1 sur 2')).toBeTruthy();
    expect(screen.getByText('🏠 À la maison · 😴 Mou → 😊 Mieux')).toBeTruthy();
    expect(screen.getByText('🛏️ Au réveil · 😣 Raide → 😐 Pareil')).toBeTruthy();
    expect(screen.getByText('Moins d’une minute · écourtée')).toBeTruthy();
    expect(screen.getAllByText('dim. 18 oct. · 7h05')).toHaveLength(3);
  });
});
```

Run : `npx jest __tests__` — Expected : FAIL (route `journal` absente, entrées non créées, lien absent).

- [ ] **Step 2 : enregistrer dans la séance**

Dans `app/seance.tsx`, composant `LecteurSeance` :

- Imports : `useState` depuis `react` ; `ajouterEntree`, `creerIdentifiant`, `mettreAJourEntree` depuis `../src/journal/journal`.
- Identifiant stable : `const [idJournal] = useState(creerIdentifiant);`
- Références : `const termineeParUtilisateur = useRef(false);`, `const finalisee = useRef(false);`, `const dernierEtat = useRef(etat);` synchronisée **dans un effet** (pas pendant le rendu) : `useEffect(() => { dernierEtat.current = etat; });`
- Remplacer l'effet qui écrit les derniers exercices par :

```tsx
  // Au lancement : derniers exercices (évités la prochaine fois) et entrée du journal, écourtée par défaut.
  // Si l'on quitte (‹, retour système), on garde le temps réellement fait.
  useEffect(() => {
    const ids = seance.blocs.map((b) => b.exercice.id);
    ecrireDerniersExercices(stockageTelephone, ids).catch(() => undefined);
    ajouterEntree(stockageTelephone, {
      id: idJournal,
      debut: new Date().toISOString(),
      contexteId: seance.contexteId,
      ressenti: seance.ressenti,
      duree: seance.duree,
      graine: seance.graine,
      exercices: ids,
      ecouleMs: 0,
      exercicesFaits: 0,
      terminee: false,
      apres: null,
    });
    const etatAuDemontage = dernierEtat;
    return () => {
      if (finalisee.current) return;
      const { ecouleMs, exercicesFaits } = etatAuDemontage.current;
      mettreAJourEntree(stockageTelephone, idJournal, { ecouleMs, exercicesFaits });
    };
  }, [seance, idJournal]);
```

  (Si ESLint signale encore la lecture d'une ref au nettoyage, garder ce comportement — c'est voulu : on veut le dernier état — et désactiver l'avertissement sur la ligne avec un commentaire qui l'explique.)

- Dans l'effet de fin (celui qui fait `router.replace` vers `/bravo`), avant la navigation :

```tsx
    finalisee.current = true;
    mettreAJourEntree(stockageTelephone, idJournal, {
      ecouleMs: etat.ecouleMs,
      exercicesFaits: etat.exercicesFaits,
      terminee: !termineeParUtilisateur.current,
    });
```

  et ajouter `seance: idJournal` aux `params` de `/bravo` (ajouter `idJournal` aux dépendances de l'effet).
- Bouton « Terminer la séance » : `onPress={() => { termineeParUtilisateur.current = true; terminer(); }}` (extraire en fonction `terminerAvantLaFin` si plus lisible).

- [ ] **Step 3 : enregistrer la réponse dans Bravo**

Dans `app/bravo.tsx` :

- Lire aussi `seance` dans `useLocalSearchParams<{ minutes: string; exercices: string; seance: string }>()`.
- Remplacer le commentaire « La réponse sera enregistrée dans le journal au jalon 3. » et les deux `onPress` par :

```tsx
  const repondre = (apres: Apres) => {
    if (params.seance) mettreAJourEntree(stockageTelephone, params.seance, { apres });
    setRepondu(true);
  };
```

  (`Mieux` → `repondre('mieux')`, `Pareil` → `repondre('pareil')` ; imports `mettreAJourEntree`, type `Apres`, `stockageTelephone`.)
- N'afficher la question « Tu te sens mieux ? » et ses boutons (ou « Merci ! ») que si `!rienFait`.

- [ ] **Step 4 : lien « Mon journal » sur le départ**

Dans `app/index.tsx`, au-dessus du titre « Flash Coach », dans le `ScrollView` :

```tsx
        <View style={styles.entete}>
          <Pressable accessibilityRole="button" accessibilityLabel="Mon journal" onPress={() => router.push('/journal')} hitSlop={8}>
            <Text style={styles.lienJournal}>Mon journal</Text>
          </Pressable>
        </View>
```

Styles : `entete: { flexDirection: 'row', justifyContent: 'flex-end' }`, `lienJournal: { color: COULEURS.texte, fontSize: 15, fontWeight: '600', textDecorationLine: 'underline' }` ; importer `Pressable`. Ne rien changer d'autre au départ (garde du double appui, présélection, lecture au focus).

- [ ] **Step 5 : l'écran « Mon journal »**

`app/journal.tsx` :

```tsx
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CONTEXTES } from '../src/catalogue/contextes';
import { formaterBilan, formaterDate, texteResume } from '../src/journal/affichage';
import { lireJournal, resumeJournal, type EntreeJournal } from '../src/journal/journal';
import { stockageTelephone } from '../src/preferences/stockage';
import { LIBELLES_RESSENTI } from '../src/ui/libelles';
import { COULEURS, ESPACE, RAYON } from '../src/ui/theme';

const LIBELLES_APRES = { mieux: '😊 Mieux', pareil: '😐 Pareil' } as const;

export default function Journal() {
  const [entrees, setEntrees] = useState<EntreeJournal[] | null>(null);

  // Relu à chaque affichage : une séance vient peut-être de se terminer.
  useFocusEffect(
    useCallback(() => {
      let actif = true;
      lireJournal(stockageTelephone).then((lues) => {
        if (actif) setEntrees(lues);
      });
      return () => {
        actif = false;
      };
    }, []),
  );

  const retour = () => (router.canGoBack() ? router.back() : router.replace('/'));
  const resume = entrees === null ? null : texteResume(resumeJournal(entrees));

  return (
    <SafeAreaView style={styles.ecran}>
      <View style={styles.entete}>
        <Pressable accessibilityRole="button" accessibilityLabel="Retour" onPress={retour} hitSlop={12}>
          <Text style={styles.retour}>‹</Text>
        </Pressable>
        <Text style={styles.titre} accessibilityRole="header">
          Mon journal
        </Text>
      </View>

      {entrees !== null && entrees.length === 0 && <Text style={styles.vide}>Ta première séance apparaîtra ici.</Text>}

      {entrees !== null && entrees.length > 0 && (
        <FlatList
          data={entrees}
          keyExtractor={(entree) => entree.id}
          contentContainerStyle={styles.liste}
          ListHeaderComponent={
            resume === null ? null : (
              <View style={styles.resume}>
                <Text style={styles.texteResume}>{resume}</Text>
              </View>
            )
          }
          renderItem={({ item }) => <LigneJournal entree={item} />}
        />
      )}
    </SafeAreaView>
  );
}

function LigneJournal({ entree }: { entree: EntreeJournal }) {
  const contexte = CONTEXTES.find((c) => c.id === entree.contexteId);
  const avant = LIBELLES_RESSENTI[entree.ressenti];
  const apres = entree.apres === null ? '' : ` → ${LIBELLES_APRES[entree.apres]}`;
  return (
    <View style={styles.ligne}>
      <Text style={styles.date}>{formaterDate(entree.debut)}</Text>
      <Text style={styles.principal}>
        {`${contexte?.emoji ?? '📍'} ${contexte?.nom ?? entree.contexteId} · ${avant.emoji} ${avant.libelle}${apres}`}
      </Text>
      <Text style={styles.detail}>{formaterBilan(entree.ecouleMs, entree.exercicesFaits, entree.terminee)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: COULEURS.fond },
  entete: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: ESPACE },
  retour: { color: COULEURS.texte, fontSize: 32, paddingHorizontal: 8 },
  titre: { color: COULEURS.texte, fontSize: 24, fontWeight: '800' },
  vide: { color: COULEURS.texteDiscret, fontSize: 16, textAlign: 'center', marginTop: 48, paddingHorizontal: ESPACE },
  liste: { padding: ESPACE, gap: 12 },
  resume: { backgroundColor: COULEURS.orange, borderRadius: RAYON, padding: ESPACE, marginBottom: 4 },
  texteResume: { color: COULEURS.texteSurOrange, fontSize: 18, fontWeight: '700' },
  ligne: { backgroundColor: COULEURS.carte, borderRadius: RAYON, padding: ESPACE, gap: 4 },
  date: { color: COULEURS.texteDiscret, fontSize: 14 },
  principal: { color: COULEURS.texte, fontSize: 16, fontWeight: '600' },
  detail: { color: COULEURS.texteDiscret, fontSize: 14 },
});
```

- [ ] **Step 6 : vérifier et committer**

Run : `npx jest && npm run typecheck && npm run lint && npx expo export --platform web` — Expected : tout PASS, propre, export réussi.

```bash
git add app __tests__
git commit -m "feat: séances enregistrées dans le journal et écran Mon journal" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
