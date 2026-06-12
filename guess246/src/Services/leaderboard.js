/* === Leaderboard service ===
   Stores scores in localStorage (what players see), and mirrors
   every finished game to the cloud when Supabase is configured
   (what the admin dashboard sees) — see Services/backend.js. */

import { sendScore, backendConfigured, fetchScores } from "./backend.js";

/* === Storage settings === */
const KEY = "gb_leaderboard_v1";
const MAX_ENTRIES_PER_DIFFICULTY = 50;
const GUEST_NUMS_KEY = "gb_guest_nums";

/* === Seed data ===
   Dummy Bajan players shown the first time the game runs, so the
   leaderboard never looks empty. Real scores mix in alongside these.
   Scores are realistic for 8 rounds at each difficulty's point rates.
   `daysAgo` is converted to a timestamp when the data is seeded. */
const SEED_ENTRIES = [
  // Easy board (100 pts a guess, no time bonus)
  { name: "Shaquille", difficulty: "easy", score: 925, correct: 8, rounds: 8, daysAgo: 2 },
  { name: "Auntie Marva", difficulty: "easy", score: 850, correct: 7, rounds: 8, daysAgo: 5 },
  { name: "Dwayne from Oistins", difficulty: "easy", score: 700, correct: 6, rounds: 8, daysAgo: 1 },
  { name: "Keisha B", difficulty: "easy", score: 625, correct: 6, rounds: 8, daysAgo: 9 },
  { name: "Trident Tre", difficulty: "easy", score: 500, correct: 5, rounds: 8, daysAgo: 3 },
  { name: "Jamar", difficulty: "easy", score: 400, correct: 4, rounds: 8, daysAgo: 7 },
  { name: "Cherisse", difficulty: "easy", score: 300, correct: 3, rounds: 8, daysAgo: 4 },

  // Medium board (200 pts a guess + time bonus)
  { name: "De ZR Conductor", difficulty: "medium", score: 2240, correct: 8, rounds: 8, daysAgo: 3 },
  { name: "Shanice", difficulty: "medium", score: 1875, correct: 7, rounds: 8, daysAgo: 6 },
  { name: "Bushy Park Bobby", difficulty: "medium", score: 1540, correct: 6, rounds: 8, daysAgo: 2 },
  { name: "Ricardo", difficulty: "medium", score: 1220, correct: 5, rounds: 8, daysAgo: 8 },
  { name: "Tameka", difficulty: "medium", score: 980, correct: 4, rounds: 8, daysAgo: 1 },
  { name: "Lil Akeem", difficulty: "medium", score: 640, correct: 3, rounds: 8, daysAgo: 5 },

  // Hard board (300 pts a guess + time bonus — only real Bajans up here)
  { name: "Granny Esme", difficulty: "hard", score: 3120, correct: 8, rounds: 8, daysAgo: 4 },
  { name: "Fish Cake Phil", difficulty: "hard", score: 2650, correct: 7, rounds: 8, daysAgo: 2 },
  { name: "Soca Sherry", difficulty: "hard", score: 2100, correct: 6, rounds: 8, daysAgo: 7 },
  { name: "Mighty Gabby Fan", difficulty: "hard", score: 1480, correct: 4, rounds: 8, daysAgo: 3 },
  { name: "Cou-Cou King", difficulty: "hard", score: 960, correct: 3, rounds: 8, daysAgo: 6 },
];

/* Build the seed entries with real timestamps */
function buildSeed() {
  const DAY = 24 * 60 * 60 * 1000;
  return SEED_ENTRIES.map(({ daysAgo, ...entry }) => ({
    ...entry,
    date: Date.now() - daysAgo * DAY,
  }));
}

/* === Read scores ===
   Returns every saved entry; seeds the dummy players on first run
   (only when no leaderboard exists yet). */
function readAll() {
  try {
    const stored = localStorage.getItem(KEY);
    if (stored === null) {
      const seed = buildSeed();
      localStorage.setItem(KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(stored) ?? [];
  } catch {
    return [];
  }
}

/* === Get rankings ===
   Top scores for one difficulty, best first (ties: earliest wins). */
export function getLeaderboard(difficulty) {
  return readAll()
    .filter((e) => e.difficulty === difficulty)
    .sort((a, b) => b.score - a.score || a.date - b.date);
}

/* === Save a finished game ===
   Stores the entry and returns the player's rank (1-based). */
export function saveScore({ name, score, difficulty, correct, rounds }) {
  const entry = { name, score, difficulty, correct, rounds, date: Date.now() };
  const all = readAll();
  all.push(entry);
  sendScore(entry); // cloud mirror for the admin dashboard

  // keep only the best entries per difficulty so the list never grows forever
  const kept = [];
  for (const diff of ["easy", "medium", "hard"]) {
    kept.push(
      ...all
        .filter((e) => e.difficulty === diff)
        .sort((a, b) => b.score - a.score || a.date - b.date)
        .slice(0, MAX_ENTRIES_PER_DIFFICULTY)
    );
  }
  localStorage.setItem(KEY, JSON.stringify(kept));

  // find where this game landed on the local board
  const board = getLeaderboard(difficulty);
  const idx = board.findIndex((e) => e.date === entry.date && e.name === entry.name);
  const rank = idx === -1 ? board.length : idx + 1;

  // return the entry's date too, so the caller can highlight this exact
  // run on the leaderboard (cloud rows round-trip the same date)
  return { rank, date: entry.date };
}

/* === Personal best ===
   Player's highest score for a difficulty (or null if none yet). */
export function getPersonalBest(name, difficulty) {
  const scores = getLeaderboard(difficulty).filter((e) => e.name === name);
  return scores.length ? scores[0].score : null;
}

/* === Guest names ===
   Each guest gets a unique "Guest (N)" so they're told apart on the
   leaderboard. N is random in 1-1000; once every number in that range
   is taken it draws from 1000-10000 instead. Checks the cloud (when
   configured) plus local data so numbers don't collide. */

/* Guest numbers already seen in local data + assigned on this device */
function localGuestNumbers() {
  const used = new Set();
  for (const diff of ["easy", "medium", "hard"]) {
    for (const e of getLeaderboard(diff)) {
      const m = /^Guest \((\d+)\)$/.exec(e.name);
      if (m) used.add(Number(m[1]));
    }
  }
  try {
    for (const n of JSON.parse(localStorage.getItem(GUEST_NUMS_KEY)) ?? []) used.add(n);
  } catch {
    /* ignore */
  }
  return used;
}

export async function generateGuestName() {
  const used = localGuestNumbers();

  // also avoid numbers already taken by guests across all players
  if (backendConfigured) {
    const rows = await fetchScores();
    if (rows) {
      for (const r of rows) {
        const m = /^Guest \((\d+)\)$/.exec(r.name);
        if (m) used.add(Number(m[1]));
      }
    }
  }

  const pickFree = (min, max) => {
    for (let i = 0; i < 100; i++) {
      const n = Math.floor(Math.random() * (max - min + 1)) + min;
      if (!used.has(n)) return n;
    }
    for (let n = min; n <= max; n++) if (!used.has(n)) return n; // range full-ish
    return null;
  };

  // how many of 1-1000 are taken — once it's full, move to the wider range
  let lowTaken = 0;
  for (const n of used) if (n >= 1 && n <= 1000) lowTaken++;

  const num =
    (lowTaken >= 1000 ? pickFree(1000, 10000) : pickFree(1, 1000)) ??
    pickFree(1000, 10000) ??
    Math.floor(Math.random() * 9000 + 1000);

  // remember on this device so we don't reuse it before it reaches the board
  try {
    const arr = JSON.parse(localStorage.getItem(GUEST_NUMS_KEY)) ?? [];
    arr.push(num);
    localStorage.setItem(GUEST_NUMS_KEY, JSON.stringify(arr.slice(-2000)));
  } catch {
    /* ignore */
  }

  return `Guest (${num})`;
}
