import { useState } from "react";

function IntroScreen({ onStart }) {
return (

    <div className="intro-screen">
        <div className="intro-card">
        <h1 className="intro-title">GuessGeo</h1>

        <p className="intro-subtitle">
            Explore real places from around the world.
            Study the clues, make your guess, and see how many locations you can identify.
        </p>

        <p className="credits">
            S.C.E. - Gameplay | T.N. - Locations | O.E. - Styling
        </p>

        <p className="intro-note">
            Ready to explore?
        </p>

        <button className="play-button" onClick={onStart}>
            Sign In & Play
        </button>
        </div>
    </div>
    );
}

export default IntroScreen;