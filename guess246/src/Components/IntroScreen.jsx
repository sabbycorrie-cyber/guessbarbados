/* === Landing screen ===
   First thing players see — title, tagline and the Play /
   Leaderboard buttons over the intro background photo. */
function IntroScreen({ onStart, onShowLeaderboard }) {
  return (
    <div className="intro-screen screen">
      <div className="intro-card glass rise">
        <span className="chip">🇧🇧 De Ultimate Bajan Road Test</span>

        <h1 className="intro-title">
          Guess<span className="title-gold">Barbados</span>
        </h1>

        <p className="intro-note">
          Street by street. Parish by parish.
          <br />
          Let&apos;s see how Bajan yuh really is.
        </p>

        <div className="intro-actions">
          <button className="btn btn-gold btn-big" onClick={onStart}>
            Play
          </button>
          <button className="btn btn-ghost" onClick={onShowLeaderboard}>
            🏆 Leaderboard
          </button>
        </div>

        <p className="credits">Made in Barbados 🌴 by two island explorers</p>
      </div>
    </div>
  );
}

export default IntroScreen;
