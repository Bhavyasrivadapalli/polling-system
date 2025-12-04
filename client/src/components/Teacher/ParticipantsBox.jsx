// src/components/Teacher/ParticipantsBox.jsx

import { useEffect, useState, useRef } from "react";
import socket from "../../utils/socket";
import "../../styles/teacher.css";

export default function ParticipantsBox() {
  const [participants, setParticipants] = useState({
    teacherId: null,
    teacherName: null,
    students: [],
  });

  const pollId = localStorage.getItem("pollId");

  // --- FINAL & CORRECT ROLE DETECTION ---
  // Students store userId in sessionStorage
  // Teacher stores userId in localStorage
  const userIdLS =
    sessionStorage.getItem("userId") ||
    localStorage.getItem("userId") ||
    "";

  // You are teacher ONLY if your ID matches teacherId from backend
  const isTeacherLocal =
    participants.teacherId?.toString() === userIdLS.toString();

  const cacheKey = pollId ? `participants_cache_${pollId}` : null;
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!pollId) return;

    // Load cache so switching tabs doesn't clear list
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && Array.isArray(parsed.students)) {
          setParticipants(parsed);
        }
      }
    } catch (e) {
      console.warn("Cache load failed", e);
    }

    const handleParticipantsUpdate = (data) => {
      console.log("RECEIVED PARTICIPANTS:", data);

      const normalized = {
        teacherId: data.teacherId ?? null,
        teacherName: data.teacherName ?? data.teacher ?? null,
        students: Array.isArray(data.students) ? data.students : [],
      };

      if (mountedRef.current) {
        setParticipants(normalized);
      }

      try {
        sessionStorage.setItem(cacheKey, JSON.stringify(normalized));
      } catch (e) {
        console.warn("Cache save failed", e);
      }
    };

    socket.on("participantsUpdate", handleParticipantsUpdate);

    socket.emit("getParticipants", { pollId });

    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      socket.off("participantsUpdate", handleParticipantsUpdate);
    };
  }, [pollId, cacheKey]);

  const kickStudent = (studentId, studentName) => {
    if (!isTeacherLocal) return;

    if (!window.confirm(`Kick ${studentName}?`)) return;

    socket.emit("kickStudent", { pollId, studentId });
  };

  return (
    <div className="participants-box">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            {isTeacherLocal && <th style={{ textAlign: "right" }}>Action</th>}
          </tr>
        </thead>

        <tbody>

          {/* Teacher Row */}
          {participants.teacherName && (
            <tr>
              <td>
                <strong>⭐ {participants.teacherName}</strong>
              </td>
              {isTeacherLocal && <td></td>}
            </tr>
          )}

          {/* Students List */}
          {participants.students.length > 0 ? (
            participants.students.map((s) => {
              const sid = s.id ?? s.studentId ?? s.userId;

              return (
                <tr key={sid}>
                  <td>{s.name}</td>

                  {isTeacherLocal && (
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="kick-button"
                        onClick={() => kickStudent(sid, s.name)}
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          textDecoration: "underline",
                          color: "#c00",
                        }}
                      >
                        Kick out
                      </button>
                    </td>
                  )}
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={isTeacherLocal ? 2 : 1} style={{ color: "#777" }}>
                No participants yet
              </td>
            </tr>
          )}

        </tbody>
      </table>
    </div>
  );
}
