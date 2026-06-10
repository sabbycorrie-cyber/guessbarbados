/* === Main game component ===
   Runs one full game for the chosen difficulty: picks locations,
   shows the Street View photo, handles answers, the countdown
   timer, scoring (base + time bonus + streak bonus) and finally
   saves the result to the leaderboard. */
import { useState, useEffect, useRef, useCallback } from "react";
import { getStreetViewURL, hasStreetView } from "../Services/streetView.js";
import { saveScore, getPersonalBest } from "../Services/leaderboard.js";
import { track } from "../Services/analytics.js";
import { PLACES, DIFFICULTY, placeLabel } from "../data/places.js";
import Answers from "./Answers.jsx";
import Leaderboard from "./Leaderboard.jsx";
import ZRLoader from "./ZRLoader.jsx";

/* How long the right/wrong reveal stays on screen between rounds */
const REVEAL_MS = 1800;

function Game({ user, difficulty, onExit }) {
  /* Rules + location pool for the chosen difficulty */
  const cfg = DIFFICULTY[difficulty];
  const pool = PLACES[difficulty];

  /* Game state */
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [place, setPlace] = useState(null); // correct answer label
  const [options, setOptions] = useState([]);
  const [image, setImage] = useState(null);
  const [phase, setPhase] = useState("loading"); // loading | guessing | reveal | over
  const [selected, setSelected] = useState(null);
  const [lastGain, setLastGain] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(cfg.timer);
  const [finalRank, setFinalRank] = useState(null);
  const [finalDate, setFinalDate] = useState(null);
  const [isPersonalBest, setIsPersonalBest] = useState(false);

  const usedRef = useRef([]);
  const startedRef = useRef(false);

  /* Sound effects */
  const correctSound = useRef(null);
  const wrongSound = useRef(null);
  useEffect(() => {
    correctSound.current = new Audio("/sounds/correct.mp3");
    wrongSound.current = new Audio("/sounds/wrong.mp3");
  }, []);

  /* Select an unused location that has Street View imagery */
  const pickPlace = useCallback(async () => {
    let candidates = pool.filter((_, i) => !usedRef.current.includes(i));
    if (candidates.length === 0) {
      usedRef.current = [];
      candidates = [...pool];
    }

    while (candidates.length > 0) {
      const choice = candidates[Math.floor(Math.random() * candidates.length)];
      usedRef.current.push(pool.indexOf(choice));
      if (await hasStreetView(choice)) return choice;
      candidates = candidates.filter((c) => c !== choice);
    }
    // worst case: everything failed the check — just use anything
    return pool[Math.floor(Math.random() * pool.length)];
  }, [pool]);

  /* Fisher–Yates shuffle (unbiased, unlike sort(random)) */
  const shuffle = (array) => {
    const a = [...array];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  /* Load a new round */
  const loadRound = useCallback(async () => {
    setPhase("loading");
    setSelected(null);

    const chosen = await pickPlace();
    const correctAnswer = placeLabel(chosen);
    const url = getStreetViewURL(chosen, { fov: cfg.fov });

    const wrongOptions = shuffle(
      pool.map(placeLabel).filter((label) => label !== correctAnswer)
    ).slice(0, cfg.options - 1);

    // preload so the round starts with the photo already visible
    const img = new Image();
    img.onload = img.onerror = () => {
      setPlace(correctAnswer);
      setOptions(shuffle([correctAnswer, ...wrongOptions]));
      setImage(url);
      setSecondsLeft(cfg.timer);
      setPhase("guessing");
    };
    img.src = url;
  }, [cfg, pool, pickPlace]);

  /* First round (guarded against StrictMode double-mount) */
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    track("game_start", { player: user?.username ?? "Guest", difficulty });
    loadRound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadRound]);

  /* Process player answer (null = time ran out) */
  const handleAnswer = (option) => {
    if (phase !== "guessing") return;
    setSelected(option);
    setPhase("reveal");

    const isCorrect = option === place;
    const sound = isCorrect ? correctSound.current : wrongSound.current;
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(() => {});
    }

    /* Scoring: base points + time bonus (timed modes) + streak bonus */
    let gain = 0;
    let newStreak = 0;
    if (isCorrect) {
      const timeBonus = cfg.timer ? secondsLeft * 10 : 0;
      newStreak = streak + 1;
      const streakBonus = newStreak >= 2 ? 25 * Math.min(newStreak - 1, 4) : 0;
      gain = cfg.base + timeBonus + streakBonus;
      setCorrectCount((c) => c + 1);
      setScore((s) => s + gain);
    }
    setStreak(newStreak);
    setLastGain(gain);

    /* Every answer is tracked — powers the "toughest spots"
       table in the admin dashboard */
    track("round_answer", {
      player: user?.username ?? "Guest",
      difficulty,
      place,
      selected: option, // null = time ran out
      correct: isCorrect,
      secondsLeft: cfg.timer ? secondsLeft : null,
      round,
    });

    const finalScore = score + gain;
    const finalCorrect = correctCount + (isCorrect ? 1 : 0);

    setTimeout(() => {
      if (round === cfg.rounds) {
        finishGame(finalScore, finalCorrect);
      } else {
        setRound((r) => r + 1);
        loadRound();
      }
    }, REVEAL_MS);
  };

  /* Save the run to the leaderboard and show the final screen */
  const finishGame = (finalScore, finalCorrect) => {
    const name = user?.username ?? "Guest";
    const previousBest = getPersonalBest(name, difficulty);
    const rank = saveScore({
      name,
      score: finalScore,
      difficulty,
      correct: finalCorrect,
      rounds: cfg.rounds,
    });
    track("game_over", {
      player: name,
      difficulty,
      score: finalScore,
      correct: finalCorrect,
      rounds: cfg.rounds,
      rank,
    });
    setIsPersonalBest(previousBest === null || finalScore > previousBest);
    setFinalRank(rank);
    setFinalDate(Date.now());
    setPhase("over");
  };

  /* Countdown timer */
  useEffect(() => {
    if (phase !== "guessing" || !cfg.timer) return;
    const t = setTimeout(() => {
      if (secondsLeft <= 1) {
        handleAnswer(null); // time's up
      } else {
        setSecondsLeft((s) => s - 1);
      }
    }, 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, secondsLeft, cfg.timer]);

  /* Reset everything for a fresh game on the same difficulty */
  const restartGame = () => {
    usedRef.current = [];
    setScore(0);
    setStreak(0);
    setCorrectCount(0);
    setRound(1);
    setLastGain(0);
    setFinalRank(null);
    setIsPersonalBest(false);
    loadRound();
  };

  /* === Final score screen === */
  if (phase === "over") {
    return (
      <div className="gameover-screen screen">
        <div className="gameover-card glass rise">
          <span className={`chip accent-${cfg.accent}`}>{cfg.label} route complete</span>
          <h1 className="gameover-title">
            {correctCount === cfg.rounds
              ? "Yuh is a real Bajan! 🇧🇧"
              : correctCount >= cfg.rounds / 2
              ? "Not bad atall! 🌴"
              : "Yuh need a lil drive-bout 🚐"}
          </h1>

          <p className="final-score">{score.toLocaleString()} pts</p>
          <p className="final-detail">
            {correctCount} of {cfg.rounds} correct
            {finalRank && <> · #{finalRank} on de {cfg.label} board</>}
          </p>
          {isPersonalBest && <span className="best-badge">★ New personal best!</span>}

          <div className="gameover-actions">
            <button className="btn btn-gold" onClick={restartGame}>
              Play again
            </button>
            <button className="btn btn-ghost" onClick={onExit}>
              Change route
            </button>
          </div>
        </div>

        <div className="gameover-board glass rise-late">
          <Leaderboard
            initialTab={difficulty}
            currentUser={user?.username ?? "Guest"}
            highlightDate={finalDate}
          />
        </div>
      </div>
    );
  }

  /* === Round UI === */
  const timerPct = cfg.timer ? (secondsLeft / cfg.timer) * 100 : 100;

  return (
    <div className="game-screen screen">
      {/* Top bar: exit, round counter, score, streak, difficulty */}
      <header className="hud glass">
        <button className="btn btn-ghost btn-small" onClick={onExit}>
          ← Routes
        </button>

        <div className="hud-stats">
          <span className="hud-pill">
            Round <strong>{round}</strong>/{cfg.rounds}
          </span>
          <span className="hud-pill hud-score">
            <strong>{score.toLocaleString()}</strong> pts
          </span>
          {streak >= 2 && <span className="hud-pill hud-streak">🔥 {streak}</span>}
        </div>

        <span className={`chip accent-${cfg.accent}`}>{cfg.label}</span>
      </header>

      {/* Countdown bar (timed modes only) — flashes red under 5s */}
      {cfg.timer && phase !== "loading" && (
        <div className="timer-track" aria-label={`${secondsLeft} seconds left`}>
          <div
            className={`timer-fill ${secondsLeft <= 5 ? "danger" : ""}`}
            style={{ width: `${timerPct}%` }}
          />
        </div>
      )}

      <main className="game-content">
        {/* The mystery Street View photo */}
        <div className="streetview-card glass">
          <span className="streetview-tag">📍 Somewhere in Barbados…</span>
          {phase === "loading" ? (
            <div className="streetview-loading">
              <ZRLoader small />
              <p>Driving to de next spot…</p>
            </div>
          ) : (
            <img src={image} alt="Mystery Street View location" className="streetview-image" />
          )}
        </div>

        <h2 className="question">Where is dis place?</h2>

        <div className={`answers-wrap ${phase === "loading" ? "dim" : ""}`}>
          <Answers
            options={options}
            correctAnswer={place}
            selected={selected}
            revealed={phase === "reveal"}
            disabled={phase !== "guessing"}
            onSelect={handleAnswer}
          />
        </div>
      </main>

      {/* Right/wrong feedback toast shown between rounds */}
      {phase === "reveal" && (
        <div className={`result-toast ${selected === place ? "correct" : "incorrect"}`}>
          {selected === place ? (
            <>Correct! <strong>+{lastGain} pts</strong></>
          ) : selected === null ? (
            <>Time&apos;s up! It was <strong>{place}</strong></>
          ) : (
            <>Not quite — it was <strong>{place}</strong></>
          )}
        </div>
      )}
    </div>
  );
}

export default Game;
