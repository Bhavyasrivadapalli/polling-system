import { io } from "socket.io-client";

const socket = io("https://polling-system-jeho.onrender.com", {
  transports: ["websocket"],   // 🚀 mandatory for Render
  withCredentials: false,
});

// save socket id
socket.on("connect", () => {
  localStorage.setItem("socketId", socket.id);
});

export default socket;
