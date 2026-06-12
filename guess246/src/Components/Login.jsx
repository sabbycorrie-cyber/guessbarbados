/* === Authentication component ===
   Login / sign-up with localStorage accounts, plus guest play.
   On success the ZR loading screen plays before entering the game. */
import { useState } from "react";
import LoadingScreen from "./LoadingScreen";
import { track, identify } from "../Services/analytics.js";
import { generateGuestName } from "../Services/leaderboard.js";

/* Accounts are stored as gb_user_<username> so they can't
   collide with other localStorage keys */
const USER_PREFIX = "gb_user_";

function Login({ onLogin }) {
  /* Form state */
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const finishLogin = (loggedInUser) => {
    setLoading(true);
    // brief ZR boarding animation before entering the game
    setTimeout(() => onLogin(loggedInUser), 2200);
  };

  /* Handle form submission for both login and sign-up */
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Validate required fields
    if (!username.trim() || !password) {
      setError("Please fill in both fields");
      return;
    }

    const storageKey = USER_PREFIX + username.trim().toLowerCase();

    /* Login flow — verify saved credentials */
    if (isLogin) {
      const storedUser = JSON.parse(localStorage.getItem(storageKey));
      if (storedUser && storedUser.password === password) {
        track("user_login", { player: storedUser.username });
        identify(storedUser.username);
        finishLogin(storedUser);
      } else {
        setError("Incorrect username or password");
      }
    } else {
      /* Sign-up flow — reject taken usernames */
      if (localStorage.getItem(storageKey)) {
        setError("That username is already taken");
        return;
      }
      const newUser = { username: username.trim(), password, email };
      localStorage.setItem(storageKey, JSON.stringify(newUser));
      track("user_signup", { player: newUser.username, email: email || null });
      identify(newUser.username);
      finishLogin(newUser);
    }
  };

  /* Guest mode — no account. Each guest gets a unique "Guest (N)" name
     so they're told apart on the leaderboard. */
  const playAsGuest = async () => {
    const guestName = await generateGuestName();
    track("guest_play", { player: guestName });
    finishLogin({ username: guestName, guest: true });
  };

  if (loading) {
    return <LoadingScreen />;
  }

  /* Render login / sign-up form */
  return (
    <div className="auth-screen screen">
      <div className="auth-card glass rise">
        <h2 className="card-title">{isLogin ? "Welcome back" : "Join de crew"}</h2>
        <p className="card-subtitle">
          {isLogin
            ? "Log in to keep yuh spot on de leaderboard"
            : "Sign up so de island knows yuh name"}
        </p>

        <form onSubmit={handleSubmit} className="form">
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {!isLogin && (
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email (optional)"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn btn-gold">
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        <button className="link-button" onClick={() => { setIsLogin(!isLogin); setError(""); }}>
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
        </button>

        <div className="divider"><span>or</span></div>

        <button className="btn btn-ghost" onClick={playAsGuest}>
          Play as guest
        </button>
      </div>
    </div>
  );
}

export default Login;
