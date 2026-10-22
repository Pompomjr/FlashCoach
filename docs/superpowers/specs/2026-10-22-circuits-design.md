# Séances prêtes en circuit — spec

Validée avec Mattia le 2026-10-22. Contenu (13 séances, règles tirées des études, 6 nouveaux exercices, sources) : `docs/superpowers/specs/2026-10-22-circuits-proposition.md` (v2), qui fait partie de cette spec. Ce document fixe comment on les construit.

## Objectif

Proposer, à côté de la séance flash en un tap, **13 séances prêtes en circuit** (30 s par poste, 5 postes, 1 min 30 de repos entre les tours) pour les personnes qui s'entraînent déjà. Gratuit.

## Principes

- La séance flash reste le cœur : **le chemin en un tap ne change pas** et l'écran de départ ne gagne aucune ligne.
- Les circuits sont **joués par le lecteur de séance existant** (pause, passer, terminer, maintien de l'écran, journal, Bravo identiques).
- Les contenus sont **des données** (comme le catalogue) : ajouter un circuit = ajouter une entrée.
- Sécurité : tout poste qui demande un meuble a une alternative sans meuble ; l'app ne prétend jamais qu'un meuble est sûr.
- Promesse : « renforcement progressif » ; jamais « prise de masse garantie ».

## 1. Données

`mobile/src/circuits/types.ts` :

```ts
export type FamilleCircuit = 'full_body' | 'poussee' | 'jambes' | 'dos' | 'cardio';
export type Materiel = 'chaise' | 'table';

export interface Poste {
  exerciceId: string;
  // Pour un exercice bilatéral fait d'un seul côté sur ce poste (« Squat bulgare G »).
  cote?: 'gauche' | 'droite';
  // Remplaçant quand l'utilisateur n'a pas le meuble demandé par l'exercice.
  sansMateriel?: string;
}

export interface Circuit {
  id: string;            // ex. 'full-body-doux'
  nom: string;           // ex. 'Full body'
  famille: FamilleCircuit;
  niveau: Niveau;        // Doux / Tonique / Costaud
  tours: number;         // 3 ou 4
  tourFacultatif: boolean; // vrai pour Costaud (5e tour proposé)
  postes: [Poste, Poste, Poste, Poste, Poste];
}
```

- `mobile/src/circuits/circuits.ts` : les 13 circuits **exactement** comme dans la proposition v2 (ordre des postes, tours, côtés G/D). Alternatives sans meuble : tractions sous la table → Y-T au sol ; dips sur une chaise → pompes sur les genoux ; pompes inclinées → pompes au mur ; pompes pieds surélevés → pompes ; squat bulgare → fentes arrière (même côté).
- `materielDe(exerciceId)` : chaise pour `pompe-inclinee`, `dips-chaise`, `squat-bulgare`, `pompe-pieds-sureleves`, `assis-debout` ; table pour `tractions-australiennes`.
- Validation (test) : chaque id existe dans le catalogue ; 5 postes ; un exercice `bilateral` a toujours un `cote` ou est alterné par nature (liste blanche : `genou-coude`, `pompe-archer`, `pompe-spiderman`, `fentes-arriere`, `patineur`, `bird-dog`) ; toute paire G/D est complète dans le circuit ; chaque exercice à meuble a un `sansMateriel` qui n'en demande pas ; tours = 3 (Doux), 4 (Tonique, Costaud).

## 2. Construction de la séance

`construireSeanceCircuit(circuit, { sansMateriel: boolean, tourEnPlus: boolean }): Seance` (pur, testé) :
- **Échauffement** 4 postes de 5 s + 25 s : `rotation-epaules`, `cercles-hanches`, `marche-sur-place`, `rotation-poignets` (= 2 min).
- **Tours** : `tours` (+1 si `tourEnPlus` et `tourFacultatif`) × 5 postes ; chaque poste 10 s de transition + 30 s d'effort ; le **premier poste des tours 2 et suivants** a 90 s de transition (le repos, avec l'aperçu de l'exercice suivant).
- **Retour au calme** 2 postes de 5 s + 25 s : `respiration-ventre`, `etirement-ciel` (= 1 min).
- Durées : 3 tours = 16 min 00, 4 tours = 20 min 50, 5 tours = 25 min 40.
- `Bloc` gagne deux champs facultatifs (sans effet sur la séance flash) : `tour?: { numero: number; total: number }` sur les blocs des tours, et `cote?: 'gauche' | 'droite'` (côté imposé). `coteCourant` renvoie le côté imposé quand il existe.
- La `Seance` produite porte `circuitId`, `niveau` du circuit, `contexteId: 'maison'`, `ressenti: 'en_forme'`, `duree` = minutes arrondies.

## 3. Écrans

- **Départ** : un bouton icône en haut à gauche (cible 48 dp, nouvelle icône dessinée « circuit » : deux flèches en boucle), symétrique de « Mon journal », `accessibilityLabel="Séances prêtes"`. Aucune ligne ajoutée ; l'écran tient toujours sans défilement à 375 × 812 et 360 × 740.
- **`app/circuits.tsx` — liste** : titre « Séances prêtes » ; filtre Doux / Tonique / Costaud (pré-sélectionné sur le niveau enregistré `flashcoach.niveau`) ; une carte par circuit du niveau : nom, famille, « 4 tours · 21 min », matériel (« chaise », « table » ou « sans matériel ») ; sous la liste : « Conseil : 2 séances par semaine, jours non consécutifs. Garde 1 à 3 répétitions en réserve. »
- **`app/circuit/[id].tsx` — détail** : nom, durée, liste des 5 postes (avec G/D), matériel ; interrupteur « Je n'ai pas de meuble stable » (visible seulement si le circuit en demande ; mémorisé `flashcoach.sansMateriel`) qui remplace les postes concernés dans la liste ; pour un Costaud, interrupteur « Ajouter un 5e tour » ; bouton « C'est parti » → `/seance?circuit=<id>&sansMateriel=0|1&tourEnPlus=0|1&graine=…`. Texte de prudence quand un meuble est demandé : « Utilise une chaise ou une table stable, ni pliante ni vitrée. »
- **Séance** (`app/seance.tsx`) : si `circuit` est présent, la séance vient de `construireSeanceCircuit` ; sinon comportement actuel inchangé. En-tête : « Tour 2 / 4 » pendant les tours (« Échauffement », « Retour au calme » autour). Pendant le repos (transition de 90 s) : « Repos · À suivre : <exercice> ». Au début du dernier tour : « Dernier tour ! Va au bout si la technique reste propre. » Côté imposé affiché comme les côtés actuels.
- **Bravo** : inchangé (résumé, « Tu te sens mieux ? », « L'effort ? » qui ajuste le niveau enregistré).

## 4. Journal et sauvegarde

- `EntreeJournal` gagne `circuitId: string | null` (absent dans les anciennes entrées → null). Quand `circuitId` est présent, `duree` est le nombre de minutes de la séance (entier 1-60) ; sinon la règle actuelle (3, 5, 10) s'applique.
- Journal : la ligne affiche le nom du circuit à la place du contexte (« Full body · Tonique »).
- Supabase : migration `supabase/migrations/20261022120000_seances_circuit.sql` : ajoute `circuit_id text`, remplace la contrainte `duree in (3,5,10)` par `duree between 1 and 60` ; conversion ligne ↔ entrée mise à jour ; `docs/supabase.md` liste la nouvelle migration.

## 5. Nouveaux exercices

Les 6 de la proposition v2 §4 (`pompe-inclinee`, `pompe-genoux`, `pompe-classique`, `tirage-yt`, `bird-dog`, `pont-une-jambe`), ajoutés au catalogue (ils servent aussi à la séance flash) avec leurs poses (vues : profil, sauf `bird-dog` profil, `tirage-yt` profil ; accessoire chaise pour `pompe-inclinee`). Le rapport de couverture doit rester « Catalogue complet » au niveau 1.

## 6. Tests

- Données : validation du §1 sur les 13 circuits ; correspondance exacte avec la proposition v2 (tableau en dur dans le test).
- Construction : durées exactes (3/4/5 tours), repos de 90 s au bon endroit, `tour` et `cote` posés, substitutions sans meuble, tour en plus réservé aux Costaud.
- Lecteur/affichage : côté imposé, libellés « Tour n / N », « Repos », « Dernier tour ».
- Écrans : bouton « Séances prêtes » au départ (et départ toujours sans défilement), liste filtrée par niveau, détail et interrupteurs, lancement, journal avec le nom du circuit.
- Journal / synchro : anciennes entrées valides ; entrée circuit avec durée 21 acceptée ; aller-retour Supabase.

## Hors périmètre

Phrases de motivation (plus tard) ; suivi des répétitions par exercice ; variantes lestées ; programme sur plusieurs semaines ; circuits créés par l'utilisateur.
