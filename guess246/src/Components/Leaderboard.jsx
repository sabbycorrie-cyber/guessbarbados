/* === Leaderboard panel ===
   Top-10 list with a tab per difficulty. Used in two places:
   the modal (intro / difficulty screens) and the game-over screen.
   `highlightDate` marks the run the player just finished. */
import { useState } from "react";
import { getLeaderboard } from "../Services/leaderboard.js";
import { DIFFICULTY } from "../data/places.js";

/* Medal icons for the top three ranks */
const MEDALS = ["🥇", "🥈", "🥉"];

function Leaderboard({ initialTab = "easy", currentUser, highlightDate, onClose }) {
  const [tab, setTab] = useState(initialTab);
  const entries = getLeaderboard(tab).slice(0, 10);

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
      {entries.length === 0 ? (
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
                <span className="player">
                  {e.name}
                  {e.name === currentUser && <em> (you)</em>}
                </span>
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
        Scores are saved on this device for now — online rankings coming soon.
      </p>
    </div>
  );
}

export default Leaderboard;
