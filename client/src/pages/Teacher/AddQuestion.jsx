import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AddQuestion() {
  const [question, setQuestion] = useState("");
  const [timeLimit, setTimeLimit] = useState(60);

  const [options, setOptions] = useState([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);

  const backendURL = "http://localhost:4000";
  const pollId = localStorage.getItem("pollId");

  const navigate = useNavigate();

  // If teacher has NOT created / joined poll
  if (!pollId) {
    return (
      <div style={{ padding: "30px", textAlign: "center" }}>
        <h2>No Poll Selected</h2>
        <p>Please go back and create or join a poll first.</p>
      </div>
    );
  }

  // ---------------------------------
  // ADD NEW OPTION
  // ---------------------------------
  const addNewOption = () => {
    setOptions([...options, { text: "", isCorrect: false }]);
  };

  // ---------------------------------
  // CHANGE OPTION TEXT
  // ---------------------------------
  const handleOptionText = (index, value) => {
    const updated = [...options];
    updated[index].text = value;
    setOptions(updated);
  };

  // ---------------------------------
  // SELECT CORRECT ANSWER
  // ---------------------------------
  const markAsCorrect = (index) => {
    const updated = options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index,
    }));
    setOptions(updated);
  };

  // ---------------------------------
  // SUBMIT QUESTION TO BACKEND
  // ---------------------------------
  const submitQuestion = async () => {
    if (!question.trim()) return alert("Enter a question");

    if (options.some((o) => !o.text.trim()))
      return alert("All options must have text");

    const correctExists = options.some((o) => o.isCorrect);
    if (!correctExists) return alert("Select the correct answer");

    try {
      const cleanOptions = options.map((o) => o.text.trim());
      const correctIndex = options.findIndex((o) => o.isCorrect);

      // API Request
      await axios.post(`${backendURL}/api/polls/${pollId}/questions`, {
        text: question.trim(),
        options: cleanOptions,
        timeLimit,
        correctIndex,
      });

      alert("Question added successfully!");

      // Redirect teacher to main page
      navigate("/teacher");

    } catch (err) {
      console.error("QUESTION ERROR:", err);
      alert("Failed to add question");
    }
  };

  return (
    <div style={{ maxWidth: "900px", margin: "40px auto", padding: "20px" }}>
      {/* Badge */}
      <div
        style={{
          background: "#4F0DCE",
          color: "white",
          width: "fit-content",
          padding: "8px 16px",
          borderRadius: "20px",
          fontWeight: 600,
          marginBottom: "25px",
        }}
      >
        ⭐ Intervue Poll
      </div>

      {/* Header */}
      <h1 style={{ fontSize: "36px", fontWeight: 700 }}>
        Let’s <span style={{ color: "#4F0DCE" }}>Get Started</span>
      </h1>
      <p style={{ color: "#6E6E6E", marginBottom: "30px" }}>
        Add a question and options. Students will receive it instantly.
      </p>

      {/* Question Card */}
      <div className="card">
        {/* Question input */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ fontWeight: 600 }}>Enter your question</label>

          {/* Time limit selector */}
          <select
            value={timeLimit}
            onChange={(e) => setTimeLimit(Number(e.target.value))}
            style={{
              float: "right",
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontSize: "14px",
            }}
          >
            <option value="60">60 seconds</option>
            <option value="45">45 seconds</option>
            <option value="30">30 seconds</option>
            <option value="15">15 seconds</option>
          </select>

          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question here..."
            maxLength={100}
            style={{
              width: "100%",
              height: "120px",
              marginTop: "10px",
              padding: "12px",
              border: "1px solid #E0E0E0",
              borderRadius: "10px",
              resize: "none",
              fontSize: "16px",
            }}
          ></textarea>

          <div style={{ textAlign: "right", color: "#6E6E6E" }}>
            {question.length}/100
          </div>
        </div>

        {/* Options */}
        <h3 style={{ marginTop: "20px" }}>Edit Options</h3>

        {options.map((opt, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "15px",
              gap: "20px",
            }}
          >
            <span
              style={{
                background: "#4F0DCE",
                color: "white",
                padding: "6px 12px",
                borderRadius: "50%",
                fontSize: "14px",
              }}
            >
              {index + 1}
            </span>

            <input
              className="input-box"
              style={{ width: "60%" }}
              placeholder="Enter option text"
              value={opt.text}
              onChange={(e) => handleOptionText(index, e.target.value)}
            />

            {/* Correct Answer Radio */}
            <div style={{ display: "flex", alignItems: "center" }}>
              <label>
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={opt.isCorrect}
                  onChange={() => markAsCorrect(index)}
                />
                Correct Answer
              </label>
            </div>
          </div>
        ))}

        {/* Add option */}
        <button
          onClick={addNewOption}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            border: "1px solid #4F0DCE",
            marginTop: "5px",
            background: "transparent",
            cursor: "pointer",
            color: "#4F0DCE",
            fontWeight: 600,
          }}
        >
          + Add more option
        </button>

        {/* Submit */}
        <div style={{ textAlign: "right", marginTop: "30px" }}>
          <button
            onClick={submitQuestion}
            style={{
              background: "linear-gradient(to right, #7765DA, #4F0DCE)",
              color: "white",
              border: "none",
              padding: "14px 40px",
              borderRadius: "30px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            Ask Question
          </button>
        </div>
      </div>
    </div>
  );
}
