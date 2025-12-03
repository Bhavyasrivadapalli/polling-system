// src/components/Teacher/OptionItem.jsx
export default function OptionItem({
  index,
  option,
  handleTextChange,
  markAsCorrect,
}) {
  return (
    <div
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
        value={option} // FIXED — option is a plain string
        onChange={(e) => handleTextChange(index, e.target.value)}
      />

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <label>
          <input
            type="radio"
            name="correctAnswer"
            checked={option.isCorrect}
            onChange={() => markAsCorrect(index)}
          />
          Yes
        </label>

        <label>
          <input
            type="radio"
            name="correctAnswer"
            checked={!option.isCorrect}
            onChange={() => markAsCorrect(index)}
          />
          No
        </label>
      </div>
    </div>
  );
}
