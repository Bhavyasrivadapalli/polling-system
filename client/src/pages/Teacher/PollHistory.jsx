import { useEffect, useState } from "react";
import "../../styles/teacher.css";
import PollHistoryCard from "../../components/Teacher/PollHistoryCard";

import socket from "../../utils/socket";

export default function PollHistory() {
  const [history, setHistory] = useState([]);

  const pollId = localStorage.getItem("pollId");

  useEffect(() => {
    if (!pollId) return;

    // Fetch past questions from backend
    socket.emit("getPollHistory", { pollId });

    socket.on("pollHistoryData", (data) => {
      setHistory(data.questions);
    });

    return () => {
      socket.off("pollHistoryData");
    };
  }, [pollId]);

  if (!pollId) {
    return (
      <div className="center-warning">
        <h2>No Poll Selected</h2>
        <p>Create or join a poll first.</p>
      </div>
    );
  }

  return (
    <div className="teacher-container">

      <h1 className="page-title">
        View <span className="purple">Poll History</span>
      </h1>

      <div className="history-list">
        {history.length === 0 && (
          <p style={{ color: "#6E6E6E" }}>No history found yet.</p>
        )}

        {history.map((q, i) => (
          <div key={i} style={{ marginBottom: "40px" }}>
            <h3 className="history-question-title">Question {i + 1}</h3>
            <PollHistoryCard question={q} />
          </div>
        ))}
      </div>

      {/* Floating chat button (same as teacher) */}
      <div
        className="floating-chat-btn"
        onClick={() => alert('Chat coming soon')}
      >
        💬
      </div>
    </div>
  );
}
