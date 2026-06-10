/* === Backend mirror (Supabase) ===
   Central place all game data flows through on its way to the cloud.

   WHERE DATA ENDS UP:
   - Without Supabase configured: everything stays in each player's
     browser (localStorage). The admin dashboard then only shows
     activity from the device it's opened on.
   - With Supabase configured: every event and score is also mirrored
     to your Supabase project, and the admin dashboard shows ALL
     players across all devices.

   SETUP (once, ~5 minutes):
   1. Create a free project at https://supabase.com
   2. Run supabase/schema.sql in the project's SQL editor
   3. Add to guess246/.env.local:
        VITE_SUPABASE_URL=https://<project-id>.supabase.co
        VITE_SUPABASE_ANON_KEY=<anon public key>
   4. Rebuild/redeploy. Done — no other code changes needed. */

const URL = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

/* True when the cloud mirror is wired up */
export const backendConfigured = Boolean(URL && KEY);

const HEADERS = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  "Content-Type": "application/json",
};

/* --- Writes (fire-and-forget: a failed mirror never breaks the game) --- */

/* Mirror one analytics event to the cloud */
export function sendEvent({ t, type, data }) {
  if (!backendConfigured) return;
  fetch(`${URL}/rest/v1/events`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      created_at: new Date(t).toISOString(),
      player: data?.player ?? null,
      type,
      data,
    }),
  }).catch(() => {});
}

/* Mirror one finished game to the cloud */
export function sendScore({ name, score, difficulty, correct, rounds, date }) {
  if (!backendConfigured) return;
  fetch(`${URL}/rest/v1/scores`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      created_at: new Date(date).toISOString(),
      player: name,
      difficulty,
      score,
      correct,
      rounds,
    }),
  }).catch(() => {});
}

/* --- Reads (used by the admin dashboard) --- */

export async function fetchEvents(limit = 2000) {
  if (!backendConfigured) return null;
  try {
    const res = await fetch(
      `${URL}/rest/v1/events?select=*&order=created_at.desc&limit=${limit}`,
      { headers: HEADERS }
    );
    const rows = await res.json();
    // normalise to the same shape as the local event log
    return rows.map((r) => ({
      t: new Date(r.created_at).getTime(),
      type: r.type,
      data: r.data ?? {},
    }));
  } catch {
    return null;
  }
}

export async function fetchScores(limit = 2000) {
  if (!backendConfigured) return null;
  try {
    const res = await fetch(
      `${URL}/rest/v1/scores?select=*&order=score.desc&limit=${limit}`,
      { headers: HEADERS }
    );
    const rows = await res.json();
    // normalise to the same shape as the local leaderboard entries
    return rows.map((r) => ({
      name: r.player,
      score: r.score,
      difficulty: r.difficulty,
      correct: r.correct,
      rounds: r.rounds,
      date: new Date(r.created_at).getTime(),
    }));
  } catch {
    return null;
  }
}
