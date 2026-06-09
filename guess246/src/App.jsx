/* Main application component */
import { useState, useEffect } from "react";
import Login from "./Components/Login.jsx";
import Game from "./Components/Game.jsx";
import IntroScreen from "./Components/IntroScreen.jsx";

function App() {

/* Active user state */
  const [user, setUser] = useState(null);
  const [showIntro, setShowIntro] = useState(true);

/* Restore saved user session */
useEffect(() => {

  const savedUser = localStorage.getItem("currentUser");
  if (savedUser) {
    setUser(JSON.parse(savedUser));
  }
}
, []);

function startGame () {
  setShowIntro(false);
}

/* Render login or game screen */
return (
  <div>
    {showIntro ? (
      <IntroScreen onStart={startGame} />
    ) : !user ? (
    <Login setUser={setUser} />
    ) : (
      <Game user={user} />
    )}
  </div>
);

}

export default App;
