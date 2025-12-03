// src/components/Teacher/QuestionCard.jsx

import "../../styles/teacher.css";

export default function QuestionCard({ question, results }) {

  // If showing results
  if (results) {
    return (
      <div className="question-card">
        <h3>Results</h3>

        <div className="question-title">{results.text}</div>

        <div className="options-wrapper">
          {results.options.map((op, i) => (
            <div key={i} className="result-row">
              <span className="result-label">{op.text}</span>

              <div className="result-bar">
                <div
                  className="result-fill"
                  style={{ width: `${op.percent}%` }}
                />
              </div>

              <span className="result-percent">{op.percent}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // If showing active question
  if (question) {
    return (
      <div className="question-card">
        <h3>Active Question</h3>

        <div className="question-title">{question.text}</div>

        <div className="options-wrapper">
          {question.options.map((op, i) => (
            <div key={i} className="teacher-option-row">
              <span className="teacher-option-number">{i + 1}.</span>
              <span className="teacher-option-text">{op}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
