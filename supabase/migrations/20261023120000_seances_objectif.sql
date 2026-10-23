-- Écran de départ par objectif : chaque nouvelle séance porte son objectif, sans contexte ni ressenti.
-- Les anciennes lignes (contexte et ressenti, objectif nul) restent valides telles quelles.
alter table public.seances add column objectif text check (objectif in ('calories', 'masse', 'etirements'));
alter table public.seances alter column contexte_id drop not null;
alter table public.seances alter column ressenti drop not null;
