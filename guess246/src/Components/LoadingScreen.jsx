/* === Login loading screen ===
   Full-screen "Boarding Your ZR..." moment shown after login,
   using the shared ZR van animation. */
import "./LoadingScreen.css";
import ZRLoader from "./ZRLoader.jsx";

function LoadingScreen() {
    return (
        <div className="loading-screen">

            <div className="loading-content">
                <h1 className="loading-title">
            Boarding Your ZR...
        </h1>

        <ZRLoader />

        <p className="loading-text">
            Finding your seat...
        </p>

        </div>

        </div>

    );
}

export default LoadingScreen;
