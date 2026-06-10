/* === Admin dashboard ===
   Hidden control room for the two of us. Open the game with #admin
   at the end of the URL (e.g. guessbarbados.com/#admin), enter the
   admin password, and you get: player counts, games per difficulty,
   toughest locations, registered users, recent games and the raw
   event feed.

   DATA SOURCE:
   - Supabase configured  → island-wide data from every player.
   - Not configured (yet) → data from this browser only.
   The chip in the header shows which one you're looking at.

   The password is VITE_ADMIN_PASSWORD in .env.local
   (falls back to "guess246admin" — change it before going live!). */
import { useState, useEffect, useCallback } from "react";
import { getLocalEvents } from "../Services/analytics.js";
import { getLeaderboard } from "../Services/leaderboard.js";
import { backendConfigured, fetchEvents, fetchScores } from "../Services/backend.js";
import { DIFFICULTY } from "../data/places.js";

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "guess246admin";
const AUTH_KEY = "gb_admin_ok";

/* === Password gate === */
function AdminGate({ onUnlock }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, "1");
      onUnlock();
    } else {
      setError("Wrong password");
    }
  };

  return (
    <div className="auth-screen screen">
      <div className="auth-card glass rise">
        <h2 className="card-title">🔐 Admin</h2>
        <p className="card-subtitle">Founders only — enter de password</p>
        <form onSubmit={submit} className="form">
          <input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn btn-gold">
            Open dashboard
          </button>
        </form>
      </div>
    </div>
  );
}

/* === Stats helpers === */

/* Aggregate everything the panels need from raw events + scores */
function buildStats(events, scores) {
  const players = new Set();
  const users = new Map(); // username -> { email, lastSeen, games }
  const games = [];
  const spotStats = new Map(); // place -> { asked, missed }
  let roundsAnswered = 0;
  let roundsCorrect = 0;

  for (const e of events) {
    const p = e.data?.player;
    if (p) {
      players.add(p);
      const u = users.get(p) ?? { email: null, lastSeen: 0, games: 0 };
      u.lastSeen = Math.max(u.lastSeen, e.t);
      if (e.type === "user_signup") u.email = e.data?.email ?? u.email;
      if (e.type === "game_over") u.games += 1;
      users.set(p, u);
    }
    if (e.type === "game_over") games.push(e);
    if (e.type === "round_answer") {
      roundsAnswered += 1;
      if (e.data?.correct) roundsCorrect += 1;
      const place = e.data?.place;
      if (place) {
        const s = spotStats.get(place) ?? { asked: 0, missed: 0 };
        s.asked += 1;
        if (!e.data?.correct) s.missed += 1;
        spotStats.set(place, s);
      }
    }
  }

  /* Per-difficulty rollup from finished games */
  const perDifficulty = {};
  for (const id of Object.keys(DIFFICULTY)) {
    const g = games.filter((e) => e.data?.difficulty === id);
    perDifficulty[id] = {
      games: g.length,
      avgScore: g.length
        ? Math.round(g.reduce((sum, e) => sum + (e.data?.score ?? 0), 0) / g.length)
        : 0,
      best: g.length ? Math.max(...g.map((e) => e.data?.score ?? 0)) : 0,
    };
  }

  /* Toughest spots: highest miss rate, at least 2 attempts */
  const toughest = [...spotStats.entries()]
    .filter(([, s]) => s.asked >= 2)
    .map(([place, s]) => ({ place, ...s, missRate: s.missed / s.asked }))
    .sort((a, b) => b.missRate - a.missRate || b.asked - a.asked)
    .slice(0, 8);

  return {
    players: players.size,
    gamesPlayed: games.length,
    roundsAnswered,
    accuracy: roundsAnswered ? Math.round((roundsCorrect / roundsAnswered) * 100) : 0,
    perDifficulty,
    toughest,
    recentGames: games.slice(0, 12),
    users: [...users.entries()]
      .map(([name, u]) => ({ name, ...u }))
      .sort((a, b) => b.lastSeen - a.lastSeen),
    scores,
  };
}

const fmtTime = (t) =>
  new Date(t).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/* === The dashboard itself === */
function Dashboard({ onExit }) {
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  /* Pure data loader — cloud when configured, else this device */
  const loadData = useCallback(async () => {
    const [remoteEvents, remoteScores] = backendConfigured
      ? await Promise.all([fetchEvents(), fetchScores()])
      : [null, null];

    const evts = remoteEvents ?? getLocalEvents();
    const scores =
      remoteScores ??
      ["easy", "medium", "hard"].flatMap((d) => getLeaderboard(d));
    return { evts, stats: buildStats(evts, scores) };
  }, []);

  useEffect(() => {
    loadData().then((d) => {
      setEvents(d.evts);
      setStats(d.stats);
      setLoading(false);
    });
  }, [loadData]);

  /* Refresh button — show the spinner again while re-fetching */
  const refresh = () => {
    setLoading(true);
    loadData().then((d) => {
      setEvents(d.evts);
      setStats(d.stats);
      setLoading(false);
    });
  };

  if (loading || !stats) {
    return (
      <div className="screen admin-screen">
        <div className="streetview-loading" style={{ aspectRatio: "auto", flex: 1 }}>
          <span className="spinner" />
          <p>Counting de numbers…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="screen admin-screen">
      {/* Header */}
      <header className="hud glass admin-header">
        <h1 className="admin-title">📊 GuessBarbados Admin</h1>
        <div className="hud-stats">
          <span className={`chip ${backendConfigured ? "accent-sea" : ""}`}>
            {backendConfigured ? "☁ Cloud · all players" : "💻 This device only"}
          </span>
          <button className="btn btn-ghost btn-small" onClick={refresh}>
            ↻ Refresh
          </button>
          <button className="btn btn-ghost btn-small" onClick={onExit}>
            ← Back to game
          </button>
        </div>
      </header>

      {!backendConfigured && (
        <p className="admin-note">
          Showing activity from this browser only. To see every player
          island-wide, set up the free Supabase mirror — instructions in{" "}
          <code>src/Services/backend.js</code>.
        </p>
      )}

      {/* Headline numbers */}
      <div className="stat-grid">
        <div className="stat-card glass">
          <span className="stat-value">{stats.players}</span>
          <span className="stat-label">Players</span>
        </div>
        <div className="stat-card glass">
          <span className="stat-value">{stats.gamesPlayed}</span>
          <span className="stat-label">Games finished</span>
        </div>
        <div className="stat-card glass">
          <span className="stat-value">{stats.roundsAnswered}</span>
          <span className="stat-label">Rounds answered</span>
        </div>
        <div className="stat-card glass">
          <span className="stat-value">{stats.accuracy}%</span>
          <span className="stat-label">Overall accuracy</span>
        </div>
      </div>

      <div className="admin-grid">
        {/* Per-difficulty breakdown */}
        <section className="admin-panel glass">
          <h2>Routes</h2>
          <table className="data-table">
            <thead>
              <tr><th>Route</th><th>Games</th><th>Avg score</th><th>Best</th></tr>
            </thead>
            <tbody>
              {Object.values(DIFFICULTY).map((d) => (
                <tr key={d.id}>
                  <td><span className={`chip accent-${d.accent}`}>{d.label}</span></td>
                  <td>{stats.perDifficulty[d.id].games}</td>
                  <td>{stats.perDifficulty[d.id].avgScore.toLocaleString()}</td>
                  <td>{stats.perDifficulty[d.id].best.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Hardest locations */}
        <section className="admin-panel glass">
          <h2>Toughest spots</h2>
          {stats.toughest.length === 0 ? (
            <p className="admin-empty">Not enough answers yet.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Location</th><th>Asked</th><th>Missed</th></tr>
              </thead>
              <tbody>
                {stats.toughest.map((s) => (
                  <tr key={s.place}>
                    <td>{s.place}</td>
                    <td>{s.asked}</td>
                    <td className={s.missRate > 0.5 ? "miss-high" : ""}>
                      {Math.round(s.missRate * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Player accounts */}
        <section className="admin-panel glass">
          <h2>Players</h2>
          {stats.users.length === 0 ? (
            <p className="admin-empty">No player activity yet.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Games</th><th>Last seen</th></tr>
              </thead>
              <tbody>
                {stats.users.slice(0, 15).map((u) => (
                  <tr key={u.name}>
                    <td>{u.name}</td>
                    <td className="dim">{u.email ?? "—"}</td>
                    <td>{u.games}</td>
                    <td className="dim">{fmtTime(u.lastSeen)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Latest finished games */}
        <section className="admin-panel glass">
          <h2>Recent games</h2>
          {stats.recentGames.length === 0 ? (
            <p className="admin-empty">No games finished yet.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Player</th><th>Route</th><th>Score</th><th>Hits</th><th>When</th></tr>
              </thead>
              <tbody>
                {stats.recentGames.map((g) => (
                  <tr key={g.t}>
                    <td>{g.data?.player}</td>
                    <td>{DIFFICULTY[g.data?.difficulty]?.label ?? g.data?.difficulty}</td>
                    <td>{(g.data?.score ?? 0).toLocaleString()}</td>
                    <td>{g.data?.correct}/{g.data?.rounds}</td>
                    <td className="dim">{fmtTime(g.t)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Raw event feed */}
        <section className="admin-panel glass admin-panel-wide">
          <h2>Event feed</h2>
          {events.length === 0 ? (
            <p className="admin-empty">No events recorded yet.</p>
          ) : (
            <ul className="event-feed">
              {events.slice(0, 30).map((e) => (
                <li key={e.t + e.type}>
                  <span className="event-time dim">{fmtTime(e.t)}</span>
                  <span className="event-type">{e.type}</span>
                  <span className="event-detail dim">
                    {e.data?.player ?? ""}
                    {e.data?.difficulty ? ` · ${e.data.difficulty}` : ""}
                    {e.data?.place ? ` · ${e.data.place}` : ""}
                    {typeof e.data?.correct === "boolean"
                      ? e.data.correct ? " · ✓" : " · ✗"
                      : ""}
                    {e.data?.score != null ? ` · ${e.data.score} pts` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

/* === Gate + dashboard wrapper === */
function Admin({ onExit }) {
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem(AUTH_KEY) === "1"
  );

  if (!unlocked) return <AdminGate onUnlock={() => setUnlocked(true)} />;
  return <Dashboard onExit={onExit} />;
}

export default Admin;
