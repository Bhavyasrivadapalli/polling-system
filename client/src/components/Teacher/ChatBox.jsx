// src/components/Teacher/ChatBox.jsx
import { useState, useEffect, useRef } from "react";
import socket from "../../utils/socket";
import "../../styles/chat.css";

export default function ChatBox() {
  const [messages, setMessages] = useState(
    JSON.parse(localStorage.getItem("chatMessages") || "[]")
  );
  const [msg, setMsg] = useState("");

  const name =
    sessionStorage.getItem("studentName") ||
    localStorage.getItem("teacherName") ||
    "Teacher";

  const pollId = localStorage.getItem("pollId");
  const bottomRef = useRef();

  // Save messages in local storage
  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  // Listen for incoming chat messages
  useEffect(() => {
    socket.off("chatMessage"); // prevent multiple listeners

    socket.on("chatMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => socket.off("chatMessage");
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message (FIXED)
  const sendMessage = () => {
    if (msg.trim() === "") return;

    const payload = {
      name,
      message: msg,
      pollId,
    };

    // send to server
    socket.emit("chatMessage", payload);

    // ❌ DO NOT add message here (causes duplicates)
    // setMessages((prev) => [...prev, payload]);

    setMsg("");
  };

  // Press Enter to send
  const handleKey = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  // Clear chat
  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem("chatMessages");
  };

  return (
    <div className="chatbox-container">

      {/* TOP BAR */}
      <div className="chatbox-top">
        <h3>Chat</h3>
        <button className="clear-btn" onClick={clearChat}>
          🗑 Clear
        </button>
      </div>

      {/* MESSAGES */}
      <div className="chatbox-messages">
        {messages.map((m, i) => (
          <div key={i} className="chat-msg-row">
            <p className="chat-sender">{m.name}</p>

            <div
              className={`chat-bubble 
                ${m.name === "Teacher" ? "bubble-teacher" :
                m.name === name ? "bubble-purple" : 
                "bubble-dark"}`}
            >
              {m.message}
            </div>
          </div>
        ))}
        <div ref={bottomRef}></div>
      </div>

      {/* INPUT AREA */}
      <div className="chatbox-input">
        <input
          type="text"
          value={msg}
          placeholder="Type a message..."
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={handleKey}
        />
        <button onClick={sendMessage}>➤</button>
      </div>
    </div>
  );
}
