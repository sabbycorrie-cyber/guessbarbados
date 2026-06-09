/* === Difficulty selection screen ===
   Shows one card per difficulty (rules pulled from data/places.js)
   plus the top bar with the greeting, leaderboard and logout. */
import { DIFFICULTY } from "../data/places.js";

/* Card icon per difficulty */
const ICONS = { easy: "🏖️", medium: "🚐", hard: "🌴" };

function DifficultySelect({ user, onPick, onShowLeaderboard, onLogout }) {
  return (
    <div className="difficulty-screen screen">
      <header className="top-bar">
        <span className="chip">
          Wuh gine on, <strong>{user?.username ?? "Guest"}</strong>!
        </span>
        <div className="top-bar-actions">
          <button className="btn btn-ghost btn-small" onClick={onShowLeaderboard}>
            🏆 Leaderboard
          </button>
          <button className="btn btn-ghost btn-small" onClick={onLogout}>
            Log out
          </button>
        </div>
      </header>

      <h1 className="section-title">Pick yuh route</h1>
      <p className="section-subtitle">How deep in de island yuh ready to go?</p>

      {/* One clickable card per difficulty */}
      <div className="difficulty-grid">
        {Object.values(DIFFICULTY).map((d) => (
          <button
            key={d.id}
            className={`difficulty-card glass accent-${d.accent}`}
            onClick={() => onPick(d.id)}
          >
            <span className="difficulty-icon">{ICONS[d.id]}</span>
            <h2 className="difficulty-label">{d.label}</h2>
            <p className="difficulty-tagline">{d.tagline}</p>
            <p className="difficulty-blurb">{d.blurb}</p>

            <ul className="difficulty-facts">
              <li>{d.rounds} rounds</li>
              <li>{d.timer ? `${d.timer}s per round` : "No timer"}</li>
              <li>{d.base} pts a guess</li>
            </ul>

            <span className="difficulty-go">Start →</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default DifficultySelect;
