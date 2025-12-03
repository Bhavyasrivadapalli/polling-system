import { useState } from "react";

export default function Home() {
  const [selectedRole, setSelectedRole] = useState("");

  const navigate = () => {
    if (!selectedRole) return alert("Please select a role");
    window.location.href = selectedRole === "student" ? "/student" : "/teacher";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        textAlign: "center",
      }}
    >
      
      {/* CENTER WIDTH WRAPPER */}
      <div style={{ maxWidth: "900px", width: "100%" }}>

        {/* Top Badge */}
        <div
          style={{
            background: "#4F0DCE",
            color: "white",
            width: "fit-content",
            padding: "8px 16px",
            borderRadius: "20px",
            margin: "0 auto 25px auto",
            fontWeight: "600",
          }}
        >
          ⭐ Intervue Poll
        </div>

        <h1 style={{ fontSize: "40px", marginTop: "10px", fontWeight: "700" }}>
          Welcome to the <span style={{ color: "#4F0DCE" }}>Live Polling System</span>
        </h1>

        <p style={{ color: "#6E6E6E", fontSize: "18px", marginTop: "5px" }}>
          Please select the role that best describes you to begin using the live polling system
        </p>

        {/* Role Selection */}
        <div
          style={{
            display: "flex",
            gap: "25px",
            justifyContent: "center",
            marginTop: "40px",
          }}
        >
          {/* STUDENT CARD */}
          <div
            onClick={() => setSelectedRole("student")}
            style={{
              width: "320px",
              padding: "25px",
              borderRadius: "10px",
              border:
                selectedRole === "student"
                  ? "3px solid #4F0DCE"
                  : "1px solid #E0E0E0",
              cursor: "pointer",
              textAlign: "left",
              transition: "0.2s",
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            }}
          >
            <h2 style={{ fontWeight: "700", marginBottom: "10px" }}>I’m a Student</h2>
            <p style={{ color: "#6E6E6E" }}>
              Participate in live polls and answer questions in real-time.
            </p>
          </div>

          {/* TEACHER CARD */}
          <div
            onClick={() => setSelectedRole("teacher")}
            style={{
              width: "320px",
              padding: "25px",
              borderRadius: "10px",
              border:
                selectedRole === "teacher"
                  ? "3px solid #4F0DCE"
                  : "1px solid #E0E0E0",
              cursor: "pointer",
              textAlign: "left",
              transition: "0.2s",
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            }}
          >
            <h2 style={{ fontWeight: "700", marginBottom: "10px" }}>I’m a Teacher</h2>
            <p style={{ color: "#6E6E6E" }}>
              Submit questions and view real-time results from students.
            </p>
          </div>
        </div>

        <button
          onClick={navigate}
          style={{
            marginTop: "50px",
            background: "linear-gradient(to right, #7765DA, #4F0DCE)",
            color: "white",
            padding: "14px 60px",
            border: "none",
            borderRadius: "50px",
            fontSize: "18px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Continue
        </button>
      </div>
      {/* END WRAPPER */}

    </div>
  );
}
