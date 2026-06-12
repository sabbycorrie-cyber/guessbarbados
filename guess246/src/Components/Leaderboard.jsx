/* === Leaderboard panel ===
   Top-10 list with a tab per difficulty. Used in two places:
   the modal (intro / difficulty screens) and the game-over screen.
   `highlightDate` marks the run the player just finished.

   Data source:
   - Supabase configured  → real scores from every player (cloud).
   - Not configured       → this device's local scores + seed data. */
import { useState, useEffect } from "react";
import { getLeaderboard } from "../Services/leaderboard.js";
import { backendConfigured, fetchScores } from "../Services/backend.js";
import { DIFFICULTY } from "../data/places.js";

/* Medal icons for the top three ranks */
const MEDALS = ["🥇", "🥈", "🥉"];

function Leaderboard({ initialTab = "easy", currentUser, highlightDate, onClose }) {
  const [tab, setTab] = useState(initialTab);
  /* cloudScores: null until loaded (or when running in local-only mode) */
  const [cloudScores, setCloudScores] = useState(null);
  const [loading, setLoading] = useState(backendConfigured);

  /* Pull real scores from the cloud once on mount */
  useEffect(() => {
    if (!backendConfigured) return;
    let active = true;
    fetchScores().then((rows) => {
      if (!active) return;
      setCloudScores(rows ?? []); // [] = cloud reachable but empty
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  /* Rows for the active tab, best first, capped at 10 */
  let base = cloudScores
    ? cloudScores.filter((e) => e.difficulty === tab)
    : getLeaderboard(tab);

  /* On the game-over screen the just-finished score is still in flight
     to the cloud, so the fetch above may not see it yet. If so, pull it
     from local storage and merge it in so the player sees their result. */
  if (cloudScores && highlightDate && !cloudScores.some((e) => e.date === highlightDate)) {
    const mine = getLeaderboard(tab).find((e) => e.date === highlightDate);
    if (mine) base = [...base, mine];
  }

  const entries = base
    .sort((a, b) => b.score - a.score || a.date - b.date)
    .slice(0, 10);

  return (
    <div className="leaderboard">
      <div className="leaderboard-head">
        <h2 className="card-title">🏆 Leaderboard</h2>
        {onClose && (
          <button className="btn btn-ghost btn-small" onClick={onClose}>
            ✕
          </button>
        )}
      </div>

      {/* Difficulty tabs */}
      <div className="tabs">
        {Object.values(DIFFICULTY).map((d) => (
          <button
            key={d.id}
            className={`tab accent-${d.accent} ${tab === d.id ? "active" : ""}`}
            onClick={() => setTab(d.id)}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Ranked rows — current player's entry is highlighted */}
      {loading ? (
        <p className="leaderboard-empty">Loading de rankings…</p>
      ) : entries.length === 0 ? (
        <p className="leaderboard-empty">
          No scores yet — be de first pon de board!
        </p>
      ) : (
        <ol className="leaderboard-list">
          {entries.map((e, i) => {
            const isYou =
              e.name === currentUser &&
              (highlightDate ? e.date === highlightDate : true);
            return (
              <li
                key={e.date + e.name}
                className={`leaderboard-row ${isYou ? "is-you" : ""}`}
              >
                <span className="rank">{MEDALS[i] ?? i + 1}</span>
                <span className="player">{e.name}</span>
                <span className="accuracy">
                  {e.correct}/{e.rounds}
                </span>
                <span className="points">{e.score.toLocaleString()} pts</span>
              </li>
            );
          })}
        </ol>
      )}

      <p className="leaderboard-note">
        {backendConfigured
          ? "Live rankings from players across the island 🇧🇧"
          : "Scores are saved on this device for now — online rankings coming soon."}
      </p>
    </div>
  );
}

export default Leaderboard;
