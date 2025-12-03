// src/pages/Student/Student.jsx
import { useEffect, useState, useRef } from "react";
import socket from "../../utils/socket";
import "../../styles/student.css";

import StudentQuestionCard from "../../components/Student/StudentQuestionCard";
import StudentOptionCard from "../../components/Student/StudentOptionCard";
import ChatBox from "../../components/Teacher/ChatBox";
import ParticipantsBox from "../../components/Teacher/ParticipantsBox";

export default function Student() {

  localStorage.setItem("role", "student");

  const [name, setName] = useState(
    sessionStorage.getItem("studentName") || ""
  );

  const [entered, setEntered] = useState(
    Boolean(sessionStorage.getItem("studentName"))
  );
  const [waiting, setWaiting] = useState(true);

  const [question, setQuestion] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [kicked, setKicked] = useState(false);

  const [showPopup, setShowPopup] = useState(false);
  const [tab, setTab] = useState("chat");

  // ------------------------------
  // CHAT STATE
  // ------------------------------
  const [chatMessages, setChatMessages] = useState(
    JSON.parse(localStorage.getItem("chatMessages") || "[]")
  );

  const pollId = localStorage.getItem("pollId");
  const timerRef = useRef(null);

  // ------------------------------
  // CHAT LISTENER
  // ------------------------------
  useEffect(() => {
    socket.off("chatMessage");

    socket.on("chatMessage", (data) => {
      setChatMessages((prev) => {
        const updated = [...prev, data];
        localStorage.setItem("chatMessages", JSON.stringify(updated));
        return updated;
      });
    });

    return () => socket.off("chatMessage");
  }, []);

  const sendChatMessage = (text) => {
    const payload = {
      name,
      message: text,
      pollId,
    };

    socket.emit("chatMessage", payload);
  };

  const clearChat = () => {
    setChatMessages([]);
    localStorage.removeItem("chatMessages");
  };

  // ------------------------------
  // SOCKET EVENTS
  // ------------------------------
  useEffect(() => {
    if (!entered || !pollId) return;

    socket.emit("joinPoll", { pollId, role: "student", name });

    setWaiting(true);

    socket.on("questionStarted", (data) => {
      setQuestion({
        questionId: data.questionId,
        text: data.text,
        options: data.options,
        timeLimit: data.timeLimit,
      });

      setSelected(null);
      setResults(null);
      setSubmitted(false);
      setWaiting(false);
      setTimeLeft(data.timeLimit ?? 0);

      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    });

    socket.on("showResults", (data) => {
      const formatted = {
        text: data.question.text,
        options: data.question.options.map((op, i) => ({
          text: op,
          percent: data.results[i] || 0,
        })),
      };

      setResults(formatted);
      setSubmitted(true);
      setQuestion(null);
      setWaiting(true);

      if (timerRef.current) clearInterval(timerRef.current);
    });

    socket.on("kicked", () => setKicked(true));

    socket.on("poll-ended", () => {
      setResults(null);
      setQuestion(null);
      setSubmitted(false);
      setWaiting(true);
      if (timerRef.current) clearInterval(timerRef.current);
    });

    return () => {
      socket.off("questionStarted");
      socket.off("showResults");
      socket.off("kicked");
      socket.off("poll-ended");
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [entered, pollId, name]);

  // ------------------------------
  // ENTER NAME
  // ------------------------------
  const handleContinue = () => {
    if (!name.trim()) return alert("Enter your name");

    sessionStorage.setItem("studentName", name.trim());
    localStorage.setItem("role", "student"); // 🔥 IMPORTANT FIX

    setEntered(true);
  };

  // ------------------------------
  // SUBMIT ANSWER
  // ------------------------------
  const submitAnswer = () => {
    if (!question) return;
    if (selected === null) return alert("Choose an option first");

    socket.emit("submitAnswer", {
      pollId,
      questionId: question.questionId,
      optionIndex: selected,
    });

    setSubmitted(true);
  };

  // ------------------------------
  // KICKED SCREEN
  // ------------------------------
  if (kicked) {
    return (
      <div className="student-kicked">
        <div className="badge">⭐ Intervue Poll</div>
        <h1 className="kicked-title">You’ve been Kicked out!</h1>
        <p className="kicked-sub">
          The teacher has removed you from the poll.
        </p>
      </div>
    );
  }

  // ------------------------------
  // NAME ENTRY SCREEN
  // ------------------------------
  if (!entered) {
    return (
      <div className="student-entry-container">
        <div className="entry-badge">⭐ Intervue Poll</div>

        <h1 className="entry-title">
          Let’s <span className="entry-purple">Get Started</span>
        </h1>

        <p className="entry-sub">Enter your name to join the poll.</p>

        <div className="entry-form">
          <label className="entry-label">Enter your Name</label>

          <input
            className="entry-input"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <button className="entry-btn" onClick={handleContinue}>
            Continue
          </button>
        </div>
      </div>
    );
  }

  // ------------------------------
  // WAITING SCREEN
  // ------------------------------
  if (waiting && !question && !results) {
    return (
      <div className="student-waiting">
        <div className="badge badge-figma">⭐ Intervue Poll</div>

        <div className="figma-wait-spinner"></div>

        <h2 className="figma-wait-text">
          Wait for the teacher to ask questions..
        </h2>

        <div
          className="floating-chat-btn"
          onClick={() => setShowPopup(!showPopup)}
        >
          💬
        </div>

        {showPopup && (
          <div className="popup-box">
            <div className="tabs">
              <span
                className={tab === "chat" ? "active" : ""}
                onClick={() => setTab("chat")}
              >
                Chat
              </span>
              <span
                className={tab === "participants" ? "active" : ""}
                onClick={() => setTab("participants")}
              >
                Participants
              </span>
            </div>

            {tab === "chat" ? (
              <ChatBox
                messages={chatMessages}
                onSend={sendChatMessage}
                onClear={clearChat}
                name={name}
              />
            ) : (
              <ParticipantsBox />
            )}
          </div>
        )}
      </div>
    );
  }

  // ------------------------------
  // QUESTION SCREEN
  // ------------------------------
  if (question) {
    return (
      <div className="student-container">
        <StudentQuestionCard question={question} timeLeft={timeLeft} />

        <div className="big-options-container">
          {question.options.map((op, idx) => (
            <StudentOptionCard
              key={idx}
              index={idx}
              text={op}
              selected={selected === idx}
              onClick={() => setSelected(idx)}
            />
          ))}
        </div>

        <div className="fullcard-submit-wrap">
          <button
            className="fullcard-submit"
            onClick={submitAnswer}
            disabled={submitted}
          >
            {submitted ? "Waiting..." : "Submit"}
          </button>
        </div>
      </div>
    );
  }

  // ------------------------------
  // RESULTS SCREEN
  // ------------------------------
  if (results) {
    return (
      <div className="student-container results-wrapper">
        <div
          className="floating-chat-btn"
          onClick={() => setShowPopup(!showPopup)}
        >
          💬
        </div>

        {showPopup && (
          <div className="popup-box">
            <div className="tabs">
              <span
                className={tab === "chat" ? "active" : ""}
                onClick={() => setTab("chat")}
              >
                Chat
              </span>
              <span
                className={tab === "participants" ? "active" : ""}
                onClick={() => setTab("participants")}
              >
                Participants
              </span>
            </div>

            {tab === "chat" ? (
              <ChatBox
                messages={chatMessages}
                onSend={sendChatMessage}
                onClear={clearChat}
                name={name}
              />
            ) : (
              <ParticipantsBox />
            )}
          </div>
        )}

        <div className="results-card">
          <div className="results-header">
            <h3 className="results-title">{results.text}</h3>
          </div>

          <div className="results-options">
            {results.options.map((op, idx) => (
              <div key={idx} className="results-option-row">
                <div className="results-option-label">{op.text}</div>
                <div className="results-bar">
                  <div
                    className="results-bar-fill"
                    style={{ width: `${op.percent}%` }}
                  >
                    {op.percent > 0 && (
                      <span className="results-bar-text">
                        {op.percent}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="results-percent">{op.percent}%</div>
              </div>
            ))}
          </div>
        </div>

        <div className="post-results-note">
          Wait for the teacher to ask a new question..
        </div>
      </div>
    );
  }

  return <></>;
}
