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
