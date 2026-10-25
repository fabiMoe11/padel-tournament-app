# Americano / Mexicano Padel Tournament

A local laptop-based tournament organiser for a doubles padel event. It supports a full six-round format, live leaderboard, tournament history, CSV export, reset flow, and demo mode.

## Features

- Player setup for 4 to 25 players
- Local storage as the default storage adapter
- Optional Supabase storage when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are present
- Pure tournament logic separated from the UI
- Generate round pairings with bye selection and ranking-aware scheduling
- Round score entry and final submission
- Leaderboard and schedule/history pages
- CSV export and persisted tournament state
- Demo mode for rapid testing

## Run locally

```bash
npm install
npm run dev
```

Then open the Vite local URL shown in the terminal.

## Supabase setup

1. Create a Supabase project.
2. Copy `.env.example` to `.env`.
3. Add:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

4. The app will automatically use Supabase once the values are set.
5. Run the SQL below to create the supporting tables.

## Supabase SQL

```sql
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
```

## Algorithm summary

The generator is separated from the UI and designed to be a pure function:

`generateRound(players, history, settings, roundNumber)`

- For rounds 1-3 it generates many random assignment candidates (roughly 3000), evaluates them with a cost function, and keeps the lowest-cost option.
- For rounds 4-6 it ranks active players using current standings and a small random noise offset, groups them into court groups of four, and chooses the best pairing combination for each group.
- Bye selection prioritises fewest byes to date, then previous-round avoidance, then longest gap since last bye, then tie-break randomness.
- The bye distribution remains as even as possible over the whole six-round cycle.
- The ranking function sorts by average match points per match played, then average game differential per match played, then alphabetical order.

## Tournament rules

- Six rounds fixed by configuration, no round count input in the UI.
- Four courts available with a live calculation for active players and byes.
- Each match is doubles and scored in games, e.g. `4-3`.
- Team players both receive the same match result.
- Submitted results are final and cannot be edited.
- Tournament state is persisted automatically between reloads.

## Demo mode

Use the “Demo mode” button in the app to fill random scores through all six rounds so the whole flow can be exercised quickly.
