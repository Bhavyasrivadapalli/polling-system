// src/components/Student/StudentOptionCard.jsx
import "../../styles/student.css";

export default function StudentOptionCard({ index, text, selected, onClick }) {
  return (
    <div
      className={`big-option ${selected ? "big-option-selected" : ""}`}
      onClick={onClick}
    >
      <div className="big-left">
        <div className={`big-number ${selected ? "big-number-active" : ""}`}>
          {index + 1}
        </div>

        <span className="big-option-text">{text}</span>
      </div>
    </div>
  );
}
