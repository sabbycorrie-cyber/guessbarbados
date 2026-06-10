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

## Adding locations

All locations live in `guess246/src/data/places.js`, grouped by difficulty.
Each entry needs a `street`, `parish`, `lat`, `lon` and optionally `heading`/`pitch`.
The difficulty rules (rounds, timer, points, zoom) are in the same file.
