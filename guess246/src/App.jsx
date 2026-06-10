/* === Main application component ===
   Owns the screen flow: intro → login → difficulty select → game.
   Also controls the leaderboard modal, the saved user session and
   the hidden admin dashboard (open the site with #admin in the URL). */
import { useState, useEffect } from "react";
import IntroScreen from "./Components/IntroScreen.jsx";
import Login from "./Components/Login.jsx";
import DifficultySelect from "./Components/DifficultySelect.jsx";
import Game from "./Components/Game.jsx";
import Leaderboard from "./Components/Leaderboard.jsx";
import Footer from "./Components/Footer.jsx";
import Admin from "./Components/Admin.jsx";
import { track } from "./Services/analytics.js";

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

  /* === Admin mode ===
     #admin in the URL opens the founders' dashboard */
  const [adminMode, setAdminMode] = useState(
    () => window.location.hash === "#admin"
  );
  useEffect(() => {
    const onHashChange = () => setAdminMode(window.location.hash === "#admin");
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

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

  // Track when players open the leaderboard
  const openLeaderboard = () => {
    track("leaderboard_view", { player: user?.username ?? null });
    setShowLeaderboard(true);
  };

  /* === Render the active screen === */
  if (adminMode) {
    return <Admin onExit={() => (window.location.hash = "")} />;
  }

  return (
    <div className="app">
      {screen === "intro" && (
        <IntroScreen
          onStart={handleStart}
          onShowLeaderboard={openLeaderboard}
        />
      )}

      {screen === "login" && <Login onLogin={handleLogin} />}

      {screen === "difficulty" && (
        <DifficultySelect
          user={user}
          onPick={handlePickDifficulty}
          onShowLeaderboard={openLeaderboard}
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

      {/* Logo + info links, visible on every screen */}
      <Footer />
    </div>
  );
}

export default App;
