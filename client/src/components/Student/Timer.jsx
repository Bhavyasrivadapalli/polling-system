// src/components/Student/Timer.jsx
import "../../styles/student.css";

export default function Timer({ timeLeft, total }) {
  const width = total > 0 ? (timeLeft / total) * 100 : 0;
  return (
    <div className="timer-wrapper">
      <div className="timer-fill" style={{ width: `${width}%` }} />
    </div>
  );
}
