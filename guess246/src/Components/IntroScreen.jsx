import { useState } from "react";
import introbg from "../assets/intro-bg.png";

function IntroScreen({ onStart }) {
    return (
        <>
        <div className="intro-screen">
        <div className="intro-card">

                    <p className="intro-note">
                        Street by street.
                        Parish by parish.
                        Let's see how Bajan yuh really is.
                    </p>

                    <button className="play-button" onClick={onStart}>
                        Play
                    </button>
                </div>
            </div>
        </>
    );
}

export default IntroScreen;