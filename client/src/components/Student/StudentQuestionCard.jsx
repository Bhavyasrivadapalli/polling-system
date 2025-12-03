// src/components/Student/StudentQuestionCard.jsx
import "../../styles/student.css";

export default function StudentQuestionCard({ question, timeLeft }) {
  return (
    <div className="figma-main-card">

      {/* Question Row */}
      <div className="figma-header-row">
        <span className="figma-q-label">Question 1</span>

        <span className="figma-q-timer">
          ⏱️ 00:{String(timeLeft).padStart(2, "0")}
        </span>
      </div>

      {/* Dark Question Box */}
      <div className="figma-question-box">
        {question.text}
      </div>

    </div>
  );
}
