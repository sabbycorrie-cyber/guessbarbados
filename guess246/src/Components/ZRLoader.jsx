/* === ZR van loading animations ===
   Two variants sharing the same art:
   - Full size (login screen): the person walks up and boards the van.
   - Small (between rounds):   just the van driving across the screen.
   Sizing is percentage-based so everything fits and stays centered,
   even on narrow phones. */
import person from "../assets/person.svg";
import minivan from "../assets/mini-van.svg";
import "./LoadingScreen.css";

/* One full drive-across of the small van, in ms. Game.jsx uses this
   to hold the round until the animation has played through. */
export const VAN_DRIVE_MS = 1400;

function ZRLoader({ small = false }) {
  /* Small variant — van drives from one side to the other */
  if (small) {
    return (
      <div className="animation-area animation-small">
        <img src={minivan} alt="ZR Van driving" className="van-drive" />
      </div>
    );
  }

  /* Full variant — person boards the parked van */
  return (
    <div className="animation-area">
      <img src={person} alt="Passenger" className="person-icon" />
      <img src={minivan} alt="ZR Van" className="van-icon" />
    </div>
  );
}

export default ZRLoader;
