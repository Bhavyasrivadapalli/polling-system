import { useState, useEffect } from "react";
import axios from "axios";
import socket from "../../utils/socket";
import { useNavigate } from "react-router-dom";

import "../../styles/teacher.css";

// UI Components
import QuestionCard from "../../components/Teacher/QuestionCard";
import ChatBox from "../../components/Teacher/ChatBox";
import ParticipantsBox from "../../components/Teacher/ParticipantsBox";

export default function Teacher() {
  const [title, setTitle] = useState("");
  const [pollId, setPollId] = useState(localStorage.getItem("pollId") || "");
  const [pollDetails, setPollDetails] = useState(null);

  const [activeQuestion, setActiveQuestion] = useState(null);
  const [results, setResults] = useState(null);

  const [showPopup, setShowPopup] = useState(false);
  const [tab, setTab] = useState("chat");

  const [chatMessages, setChatMessages] = useState(
    JSON.parse(localStorage.getItem("chatMessages") || "[]")
  );

  const navigate = useNavigate();
  const backendURL = "https://polling-system-jeho.onrender.com";

  // -------------------------------------------------
  // SET TEACHER ROLE + NAME (Important)
  // -------------------------------------------------
  useEffect(() => {
    localStorage.setItem("teacherName", "Teacher");
    localStorage.setItem("role", "teacher");
  }, []);

  // -------------------------------------------------
  // SOCKET LISTENERS (Poll, Questions)
  // -------------------------------------------------
  useEffect(() => {
    socket.on("pollUpdate", (data) => {
      setPollDetails(data);

      const current = data.questions.find((q) => q.active === true);
      setActiveQuestion(current || null);
    });

    socket.on("questionStarted", (q) => {
      setResults(null);
      setActiveQuestion({
        id: q.questionId,
        text: q.text,
        options: q.options,
        timeLimit: q.timeLimit,
      });
    });

    socket.on("showResults", (packet) => {
      const formatted = {
        text: packet.question.text,
        options: packet.question.options.map((op, i) => ({
          text: op,
          percent: packet.results[i] || 0,
        })),
      };

      setActiveQuestion(null);
      setResults(formatted);
    });

    return () => {
      socket.off("pollUpdate");
      socket.off("questionStarted");
      socket.off("showResults");
    };
  }, []);

  // -------------------------------------------------
  // CHAT SOCKET LISTENER
  // -------------------------------------------------
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

  // -------------------------------------------------
  // SEND CHAT MESSAGE
  // -------------------------------------------------
  const sendChatMessage = (text) => {
    const payload = {
      name: "Teacher",
      message: text,
      pollId,
    };
    socket.emit("chatMessage", payload);
  };

  // -------------------------------------------------
  // CLEAR CHAT
  // -------------------------------------------------
  const clearChat = () => {
    setChatMessages([]);
    localStorage.removeItem("chatMessages");
  };

  // -------------------------------------------------
  // CREATE POLL
  // -------------------------------------------------
  const createPoll = async () => {
    if (!title.trim()) return alert("Enter poll title");

    try {
      const res = await axios.post(`${backendURL}/api/polls`, { title });
      const newId = res.data.pollId;

      setPollId(newId);
      localStorage.setItem("pollId", newId);

      socket.emit("joinPoll", { pollId: newId, role: "teacher" });

      localStorage.setItem("userId", socket.id);
      localStorage.setItem("role", "teacher");

      alert("Poll Created Successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to create poll");
    }
  };

  // -------------------------------------------------
  // JOIN EXISTING POLL
  // -------------------------------------------------
  const joinExistingPoll = () => {
    if (!pollId.trim()) return alert("Enter Poll ID");

    socket.emit("joinPoll", { pollId, role: "teacher" });
    localStorage.setItem("pollId", pollId);

    localStorage.setItem("userId", socket.id);
    localStorage.setItem("role", "teacher");

    alert("Joined Poll Successfully!");
  };

  // -------------------------------------------------
  // START QUESTION
  // -------------------------------------------------
  const startQuestion = (questionId) => {
    const savedId = localStorage.getItem("pollId");
    socket.emit("startQuestion", { pollId: savedId, questionId });
  };

  // -------------------------------------------------
  // END POLL
  // -------------------------------------------------
  const endPollForEveryone = () => {
    const savedId = localStorage.getItem("pollId");
    socket.emit("poll-ended", { pollId: savedId });

    setActiveQuestion(null);
    setResults(null);

    alert("Poll Ended for all Students");
  };

  return (
    <div className="teacher-container">
      
      {/* TOP RIGHT */}
    

      {/* 🔥 INSTRUCTIONS CARD */}
      <div className="instructions-card">
        <h3>📘 How to Use</h3>
        <ul>
          <li>Step 1: Create a new poll → you will get a Poll ID</li>
          <li>Step 2: Enter the Poll ID and join the poll</li>
          <li>Step 3: Go to “Ask a new question” and add questions</li>
          <li>Step 4: After adding questions, join the poll again</li>
          <li>Step 5: Now the questions will appear in the list</li>
          <li>Step 6: Click “Start Question” to begin the poll</li>
        </ul>
      </div>

      {/* ACTIVE QUESTION / RESULTS */}
      {activeQuestion ? (
        <>
          <QuestionCard question={activeQuestion} />


          <div className="end-btn-container">
            <button className="end-btn" onClick={endPollForEveryone}>
              🔴 End Poll
            </button>
          </div>
        </>
      ) : results ? (
        <QuestionCard results={results} />
      ) : (
        <div className="no-question">
          <h2>No active question yet</h2>
          <p>Start a question from the list below.</p>
        </div>
      )}

      {/* ASK QUESTION BUTTON */}
      <div className="ask-btn-container">
        <button
          className="ask-btn"
          onClick={() => navigate("/teacher/add-question")}
        >
          + Ask a new question
        </button>
      </div>

      {/* SETUP SECTION */}
      <div className="setup-section">

        {/* CREATE POLL */}
        <div className="card">
          <h3>Create Poll</h3>
          <input
            className="input-box"
            placeholder="Enter poll title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <button className="btn-primary" onClick={createPoll}>
            Create Poll
          </button>
        </div>

        {/* JOIN POLL */}
        <div className="card">
          <h3>Join Existing Poll</h3>
          <input
            className="input-box"
            placeholder="Enter Poll ID"
            value={pollId}
            onChange={(e) => setPollId(e.target.value)}
          />

          <button className="btn-primary" onClick={joinExistingPoll}>
            Join Poll
          </button>
        </div>

        {/* QUESTION LIST */}
        {pollDetails && (
          <div className="card">
            <h2>Questions</h2>

            {pollDetails.questions.map((q) => (
              <div key={q.id} className="question-card-list">
                <h3>{q.text}</h3>

                <p>Options: {q.options.join(", ")}</p>

                <button
                  className="btn-primary"
                  onClick={() => startQuestion(q.id)}
                >
                  Start Question
                </button>

                {q.active && <p style={{ color: "green" }}>ACTIVE</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FLOATING CHAT ICON */}
      <div
        className="floating-chat-btn"
        onClick={() => setShowPopup(!showPopup)}
      >
        💬
      </div>

      {/* POPUP */}
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
              name="Teacher"
            />
          ) : (
            <ParticipantsBox />
          )}
        </div>
      )}

    </div>
  );
}
