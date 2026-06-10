# Guess246

A Barbados geography guessing game built with React, Vite and the Google Street View Static API.
You're shown a Street View photo from somewhere on the island — guess the road and parish before the clock runs out.

## Features

- **Three difficulties** — Easy (town spots, no timer), Medium (main roads, 20s), Hard (country back roads, 6 choices, 12s, zoomed-in view)
- **Scoring** with time bonuses and streak bonuses (🔥)
- **Leaderboard** per difficulty with medals, accuracy and personal bests (stored locally for now — swap `src/Services/leaderboard.js` for Firebase/Supabase to go online)
- **Accounts or guest play**, with sessions saved between visits
- Street View imagery is validated via the (free) metadata endpoint so players never see Google's grey "no imagery" tile

## How to run

1. Clone the repository
2. `cd guess246`
3. `npm install`
4. Open `.env.local` (copy `.env.local.example` if it doesn't exist) and set `VITE_GOOGLE_MAPS_API_KEY` to our Google Maps API key
5. `npm run dev`

## Analytics & Admin dashboard

Where the data ends up:

| Data | Where it goes |
|---|---|
| Page views | Vercel Analytics dashboard (only when deployed on Vercel) |
| Game events (signups, logins, every answer, finished games) | Local event log in each player's browser, **plus** the Supabase cloud mirror once configured |
| Leaderboard scores & accounts | Each player's browser, **plus** the `scores` table in Supabase once configured |

**Admin dashboard:** open the game with `#admin` at the end of the URL
(e.g. `http://localhost:5173/#admin`) and enter the admin password
(`VITE_ADMIN_PASSWORD` in `.env.local`; default `guess246admin` — change it!).
It shows players, games per difficulty, toughest locations, recent games and
the raw event feed.

Without Supabase the dashboard shows activity from that browser only. To see
**every player island-wide**: create a free project at supabase.com, run
`supabase/schema.sql` in its SQL editor, and add `VITE_SUPABASE_URL` +
`VITE_SUPABASE_ANON_KEY` to `.env.local`. Full steps in
`guess246/src/Services/backend.js`.

## Adding locations

All locations live in `guess246/src/data/places.js`, grouped by difficulty.
Each entry needs a `street`, `parish`, `lat`, `lon` and optionally `heading`/`pitch`.
The difficulty rules (rounds, timer, points, zoom) are in the same file.
