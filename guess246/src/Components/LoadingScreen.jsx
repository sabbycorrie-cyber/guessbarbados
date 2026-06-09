import React from "react";
import "./LoadingScreen.css";
import person from "../assets/person.svg";
import minivan from "../assets/mini-van.svg";

function LoadingScreen() {
    return (
        <div className="loading-screen">

            <div className="loading-content">
                <h1 className="loading-title">
            Boarding Your ZR...
        </h1>

        <div className="animation-area">

            <img
            src={person}
            alt="Passenger"
            className="person-icon"
            />

            <img
            src={minivan}
            alt="ZR Van"
            className="van-icon"
            />

        </div>

        <p className="loading-text">
            Finding your seat...
        </p>

        </div>

        </div>

    );
}

export default LoadingScreen;