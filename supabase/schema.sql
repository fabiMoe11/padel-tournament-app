create schema if not exists public;

create table if not exists tournaments (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Americano / Mexicano Padel Tournament',
  status text not null default 'setup',
  player_names jsonb not null default '[]'::jsonb,
  current_round integer not null default 1,
  rounds jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references tournaments(id) on delete cascade,
  name text not null,
  display_order integer not null default 0,
  matches_played integer not null default 0,
  byes integer not null default 0,
  match_points integer not null default 0,
  games_won integer not null default 0,
  games_lost integer not null default 0,
  wins integer not null default 0,
  ties integer not null default 0,
  losses integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists rounds (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references tournaments(id) on delete cascade,
  round_number integer not null,
  state text not null default 'pending',
  matches jsonb not null default '[]'::jsonb,
  byes jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references tournaments(id) on delete cascade,
  round_number integer not null,
  court integer not null,
  team_a jsonb not null,
  team_b jsonb not null,
  score_a integer not null default 0,
  score_b integer not null default 0,
  submitted_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists byes (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references tournaments(id) on delete cascade,
  round_number integer not null,
  player_name text not null,
  created_at timestamptz not null default now()
);
