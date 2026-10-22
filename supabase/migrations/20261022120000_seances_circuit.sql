-- Séances prêtes en circuit : identifiant du circuit et durées libres (1 à 60 minutes).
-- La contrainte remplacée est celle de la colonne « duree » créée par 20261019000000_seances.sql :
-- Postgres nomme une contrainte de colonne « table_colonne_check », donc ici seances_duree_check.
alter table public.seances add column circuit_id text;
alter table public.seances drop constraint if exists seances_duree_check;
alter table public.seances add constraint seances_duree_check check (duree between 1 and 60);
