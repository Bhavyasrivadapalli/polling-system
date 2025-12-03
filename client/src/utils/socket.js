import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

// ⭐ VERY IMPORTANT FIX
// Save our socket.id so ParticipantsBox can identify who is "You"
socket.on("connect", () => {
  localStorage.setItem("socketId", socket.id);
});

export default socket;
