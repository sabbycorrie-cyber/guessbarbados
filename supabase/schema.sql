-- === GuessBarbados cloud mirror ===
-- Run this ONCE in your Supabase project's SQL editor
-- (supabase.com → your project → SQL Editor → paste → Run).
--
-- Then add to guess246/.env.local:
--   VITE_SUPABASE_URL=https://<project-id>.supabase.co
--   VITE_SUPABASE_ANON_KEY=<anon public key from Project Settings → API>

-- Every analytics event the game fires (signups, logins, game
-- starts, every answer, finished games, leaderboard views)
create table if not exists events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  player text,
  type text not null,
  data jsonb not null default '{}'
);

-- One row per finished game (mirrors the in-game leaderboard)
create table if not exists scores (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  player text not null,
  difficulty text not null,
  score int not null,
  correct int not null,
  rounds int not null
);

-- Helpful indexes for the admin dashboard queries
create index if not exists events_created_at_idx on events (created_at desc);
create index if not exists scores_score_idx on scores (difficulty, score desc);

-- Row Level Security: the game runs in the browser with the public
-- anon key, so allow anonymous INSERT (writing events/scores) and
-- SELECT (the admin dashboard reads with the same key).
--
-- NOTE: this means anyone with the anon key could technically read
-- the data too. Fine while getting started; when you want to lock
-- it down, remove the select policies and read via a Supabase
-- dashboard login or an edge function instead.
alter table events enable row level security;
alter table scores enable row level security;

create policy "anon insert events" on events for insert to anon with check (true);
create policy "anon select events" on events for select to anon using (true);
create policy "anon insert scores" on scores for insert to anon with check (true);
create policy "anon select scores" on scores for select to anon using (true);
