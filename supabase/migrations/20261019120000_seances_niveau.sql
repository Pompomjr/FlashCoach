-- Niveaux (Doux / Tonique / Costaud) et ressenti d'effort.
alter table public.seances
  add column niveau smallint not null default 1 check (niveau between 1 and 3),
  add column effort text check (effort in ('facile', 'juste', 'dur'));
