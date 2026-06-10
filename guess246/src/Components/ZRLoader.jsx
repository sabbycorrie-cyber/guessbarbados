/* === ZR van loading animation ===
   The person walking to board the ZR van. Used full-size on the
   login loading screen and small on the in-game round loader.
   Sizing is percentage-based so the whole van always fits and the
   animation stays centered, even on narrow phones. */
import person from "../assets/person.svg";
import minivan from "../assets/mini-van.svg";
import "./LoadingScreen.css";

function ZRLoader({ small = false }) {
  return (
    <div className={`animation-area ${small ? "animation-small" : ""}`}>
      <img src={person} alt="Passenger" className="person-icon" />
      <img src={minivan} alt="ZR Van" className="van-icon" />
    </div>
  );
}

export default ZRLoader;
