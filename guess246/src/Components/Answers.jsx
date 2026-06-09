/* === Answer grid ===
   Purely presentational — Game owns the logic, timer and sounds.
   After a guess (`revealed`) the correct option turns green, the
   player's wrong pick turns red and the rest fade out. */
function Answers({ options, correctAnswer, selected, revealed, disabled, onSelect }) {
  return (
    <div className={`answers-grid ${options.length > 4 ? "answers-six" : ""}`}>
      {options.map((option) => {
        let cls = "answer-button";
        if (revealed) {
          if (option === correctAnswer) cls += " correct";
          else if (option === selected) cls += " wrong";
          else cls += " faded";
        }
        return (
          <button
            key={option}
            className={cls}
            disabled={disabled}
            onClick={() => onSelect(option)}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

export default Answers;
