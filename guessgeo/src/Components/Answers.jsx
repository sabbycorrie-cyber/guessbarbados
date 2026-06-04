/* Answer selection component */
import { useState } from "react";

function Answers(props) {
const { options = [], correctAnswer, onAnswer } = props;
const [selected, setSelected] = useState(null);

// Sound effects
const correctSound = new Audio("/sounds/correct.mp3");
const wrongSound = new Audio("/sounds/wrong.mp3");

const handleClick = (option) => {
    if (selected) return; // ignore if already selected
    setSelected(option);

    if (option?.trim().toLowerCase() === correctAnswer?.trim().toLowerCase() 
    ) {
        correctSound.currentTime = 0;
        correctSound.play();
    } else {
        wrongSound.currentTime = 0;
        wrongSound.play();
    }

    // Delay next round feedback
    setTimeout(() => {
    onAnswer(option);
    setSelected(null);
    }, 1500);
};

return (
    <div>
    {options.map((option, index) => {
        let buttonClass = "";

        if (selected) {
        if (option === correctAnswer) buttonClass = "correct";
        else if (option === selected) buttonClass = "wrong";
        }

        return (
        <button key={index} className={buttonClass} onClick={() => handleClick(option)}>
            {option}
        </button>
        );
    })}
    </div>
);
}

export default Answers;