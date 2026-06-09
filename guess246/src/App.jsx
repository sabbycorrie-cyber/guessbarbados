/* === Main application component ===
   Owns the screen flow: intro → login → difficulty select → game.
   Also controls the leaderboard modal and the saved user session. */
import { useState } from "react";
import IntroScreen from "./Components/IntroScreen.jsx";
import Login from "./Components/Login.jsx";
import DifficultySelect from "./Components/DifficultySelect.jsx";
import Game from "./Components/Game.jsx";
import Leaderboard from "./Components/Leaderboard.jsx";

function App() {
  /* === Session state ===
     Restore the saved user from localStorage on first render */
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("currentUser"));
    } catch {
      return null;
    }
  });
  const [screen, setScreen] = useState("intro"); // intro | login | difficulty | game
  const [difficulty, setDifficulty] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  /* === Navigation handlers === */

  // Play button: skip login if a session already exists
  const handleStart = () => setScreen(user ? "difficulty" : "login");

  // Persist the session and move to difficulty select
  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    localStorage.setItem("currentUser", JSON.stringify(loggedInUser));
    setScreen("difficulty");
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setUser(null);
    setScreen("intro");
  };

  const handlePickDifficulty = (id) => {
    setDifficulty(id);
    setScreen("game");
  };

  /* === Render the active screen === */
  return (
    <div className="app">
      {screen === "intro" && (
        <IntroScreen
          onStart={handleStart}
          onShowLeaderboard={() => setShowLeaderboard(true)}
        />
      )}

      {screen === "login" && <Login onLogin={handleLogin} />}

      {screen === "difficulty" && (
        <DifficultySelect
          user={user}
          onPick={handlePickDifficulty}
          onShowLeaderboard={() => setShowLeaderboard(true)}
          onLogout={handleLogout}
        />
      )}

      {screen === "game" && (
        <Game
          user={user}
          difficulty={difficulty}
          onExit={() => setScreen("difficulty")}
        />
      )}

      {/* Leaderboard modal — available from intro + difficulty screens */}
      {showLeaderboard && (
        <div className="modal-backdrop" onClick={() => setShowLeaderboard(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <Leaderboard
              currentUser={user?.username}
              onClose={() => setShowLeaderboard(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
