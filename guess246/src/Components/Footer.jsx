/* === Site footer ===
   Company logo bottom-left + link row bottom-right that opens
   pop-up modals: How to play, Guidelines, and About.
   Reuses the app's existing .modal-backdrop / .modal styles. */
import { useState, useEffect } from "react";
import "./footer.css";

/* Modal content lives here so it's easy to edit in one place */
const MODALS = {
  howto: {
    title: "How to play",
    body: (
      <>
        <p>
          Each round drops you somewhere in Barbados via a Street View photo.
          Look for clues — signs, coastline, buildings — and pick the right
          location before the timer runs out.
        </p>
        <p>
          Correct answers earn base points, plus a time bonus for answering
          fast and a streak bonus for consecutive correct guesses. Finish all
          rounds to land on the leaderboard!
        </p>
      </>
    ),
  },
  guidelines: {
    title: "Guidelines",
    body: (
      <>
        <p>Play fair and have fun:</p>
        <p>
          One account per player — leaderboard names should be respectful and
          family-friendly. No automated tools or scripts; manipulated scores
          may be removed. Be kind: this game is for everyone, from seasoned
          Bajans to first-time visitors.
        </p>
      </>
    ),
  },
  about: {
    title: "About",
    body: (
      <>
        <p>
          Proudly founded by <strong>two Bajans</strong> 🇧🇧 who wanted the
          world to see Barbados the way locals do — one street corner at a
          time.
        </p>
        <p>
          Whether you grew up driving these roads or you&apos;re discovering
          them for the first time: welcome, and enjoy de ride.
        </p>
      </>
    ),
  },
};

function Footer() {
  const [open, setOpen] = useState(null); // null | "howto" | "guidelines" | "about"
  const modal = open ? MODALS[open] : null;

  /* Close on Escape key */
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <footer className="site-footer">
        {/* Company logo — drop your file in /public/logo.png.
            Hides itself gracefully if the file isn't there yet. */}
        <img
          className="footer-logo"
          src="/logo.png"
          alt="Company logo"
          onError={(e) => (e.currentTarget.style.display = "none")}
        />

        <nav className="footer-links" aria-label="Footer">
          <button onClick={() => setOpen("howto")}>How to play</button>
          <span aria-hidden="true">·</span>
          <button onClick={() => setOpen("guidelines")}>Guidelines</button>
          <span aria-hidden="true">·</span>
          <button onClick={() => setOpen("about")}>About</button>
        </nav>
      </footer>

      {modal && (
        <div className="modal-backdrop" onClick={() => setOpen(null)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label={modal.title}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="footer-modal-head">
              <h2>{modal.title}</h2>
              <button
                className="footer-modal-close"
                onClick={() => setOpen(null)}
                aria-label="Close"
              >
                ×
              </button>
            </header>
            <div className="footer-modal-body">{modal.body}</div>
          </div>
        </div>
      )}
    </>
  );
}

export default Footer;
