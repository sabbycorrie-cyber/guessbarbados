/* Main game component*/
import { useState, useEffect } from "react";
import { getStreetViewURL } from "../Services/streetView";
import Score from "./Score.jsx";
import Question from "./Question.jsx";
import Answers from "./Answers.jsx";
import zrBg from "../assets/zr-bg.png";

function Game({ user }) {

    /* Available game locations */
    const PLACES = [
        { 
            street: "Bay Street",
            parish: "St. Michael",
            lat: 13.0888177,
            lon: -59.6087478,
            heading: 19.02,
            pitch: -10.19
        },

        { 
            street: "Broad Street",
            parish: "St. Michael",
            lat: 13.0974887,
            lon: -59.6164418,
            heading: 32.18,
            pitch: 14.83,
        },

        { 
            street: "Roebuck Street",
            parish: "St. Michael",
            lat: 13.1024068,
            lon: -59.6103241,
            heading: 263.31,
            pitch: -6.27,
        },

        { 
            street: "Upper Collymore Rock",
            parish: "St. Michael",
            lat: 13.0935766,
            lon: -59.5959958,
            heading: 79.37
        },

        { 
            street: "Spring Garden Highway",
            parish: "St. Michael",
            lat: 13.1166232,
            lon: -59.6267809,
            heading: 204.86,
            },

        {
            street: "Highway 1",
            parish: "St. James",
            lat: 13.1911512,
            lon: -59.6382856,
            heading: 146.49,
        },

        {
            street: "Carlisle Bay",
            parish: "St. Michael",
            lat: 13.086209,
            lon: -59.6092,
            heading: 253.45,
            pitch: 12.04
        },

        {
            street: "Highway 7",
            parish: "Christ Church",
            lat: 13.0746696,
            lon: -59.5891528,
            heading: 139.32
        }
    ];

    /* Game state */
    const [score, setScore] = useState(0);
    const [place, setPlace] = useState(null);
    const [options, setOptions] = useState([]);
    const [image, setImage] = useState(null);
    const [round, setRound] = useState(1);
    const [gameOver, setGameOver] = useState(false);
    
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [feedback, setFeedback] = useState("");
    const [usedPlaces, setUsedPlaces] = useState([]);

    /* Select an unused random location */
    const getRandomPlace = () => {
    const availablePlaces = PLACES.filter(
        (place) => !usedPlaces.some((used) => used.street === place.street && used.parish === place.parish
        )
    );

    if (availablePlaces.length === 0) {
        setUsedPlaces([]);
        return PLACES[Math.floor(Math.random() * PLACES.length)];
    }

    const randomPlace = availablePlaces[Math.floor(Math.random() * availablePlaces.length)];

    setUsedPlaces((prev) => [...prev, randomPlace]);

    if (availablePlaces.length === 0) {
        setUsedPlaces([]);
    }

    return randomPlace;
    };

    const shuffleArray = (array) => {
    return [...array] .sort(() => Math.random() - 0.5)
    }

    /* Game flow */

    /* Load a new round */
    const loadPlace = () => {

    // Select location data 
    const { lat, lon, street, parish, heading } = getRandomPlace();

    // Google Maps API key
    const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

    // Build Google Street View image URL
    const streetViewURL = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${lat},${lon}&fov=90&heading=${heading?? 120}&pitch=0&key=${API_KEY}`;

    // Update displayed image
    setImage(streetViewURL);
    console.log(streetViewURL);

    // Save correct answer
    const correctAnswer = `${street}, ${parish}`;
    setPlace(correctAnswer);

    /* Generate answer choices */
    const PLACE_POOL = PLACES.map(
        (p) => `${p.street}, ${p.parish}`
    );

    // Select incorrect options
    const wrongOptions = PLACE_POOL
        .filter((p) => p !== correctAnswer)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

    // Shuffle answer options
    setOptions(shuffleArray([correctAnswer, ...wrongOptions]));
    };

    /* Process player answer */
    const handleAnswer = (selected) => {
    setSelectedAnswer(selected);
    setShowResult(true);

    // Update score on correct answer
    if (selected === place) {
        setScore((prev) => prev + 1);
        setFeedback("Correct!");
    } else {
        setFeedback(`Incorrect! Answer: ${place}`);
    }

    // Delay before next round
    setTimeout(() => {
        if (round === 10) {
        setGameOver(true);
        } else {
        setRound((prev) => prev + 1);
        loadPlace();
        }
        setShowResult(false);
        setSelectedAnswer(null);
    }, 800);
};


    /* Load first round */
    useEffect(() => {
    loadPlace();
    }, []);

    const restartGame = () => {
        setScore(0);
        setRound(1);
        setGameOver(false);
        setUsedPlaces([]);
        setSelectedAnswer(null);
        setShowResult(false);
        loadPlace();
    };

    /* Final score screen */
    if (gameOver) {
        return (
            <div className="final-score-card">
                <h1>Game Over</h1>

                <p className="final-score">Final Score: {score}/10</p>

                <button className="play-again-button" 
                onClick={restartGame}>
                Play Again!
                </button>
                </div>
        );
    }

    /* Render game UI */
return (
    <div
        className="app-container"
        style={{
            backgroundImage: `url(${zrBg})`,
            backgroundSize: "85%",
            backgroundPosition: "center top",
            backgroundRepeat: "no-repeat",
            backgroundColor: "#000",
            minHeight: "100vh",
        }}
    >

<div className="game-content">

    <div className="answers-grid">
        <Answers
            options={options}
            correctAnswer={place}
            onAnswer={handleAnswer}
        />
    </div>

    <div className="streetview-container">
        <img
            src={image}
            alt="Street View"
            className="streetview-image"
        />
    </div>

        <div className="info-card">
        <p className="welcome">
            Welcome, {user ? user.username : "Guest"}!
        </p>

        <h2>Score: {score}</h2>
    </div>

</div>

    {showResult && (
        <div className="result-message">
            <p
                className={
                    selectedAnswer === place
                        ? "correct"
                        : "incorrect"
                }
            >
                {feedback}
            </p>
        </div>
    )}

        </div>
);
}

export default Game;