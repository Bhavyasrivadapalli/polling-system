require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const shortid = require("shortid");

// express setup
const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

const server = http.createServer(app);

// socket.io setup
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["*"],
    credentials: true
  }
});


// In-memory Poll DB
// poll = {
//   id,
//   title,
//   teacherSocketId,
//   teacherName,
//   students: { socketId: { name, answeredQuestionIds: Set } },
//   questions: [...],
//   timers: {}
// }
const polls = {};

// -----------------------
// Participants broadcast
// -----------------------
function broadcastParticipants(pollId) {
  const poll = polls[pollId];
  if (!poll) return;

  const students = Object.entries(poll.students || {}).map(([id, info]) => ({
    id,
    name: info.name,
  }));

  io.to(pollId).emit("participantsUpdate", {
    teacherId: poll.teacherSocketId || null,
    teacherName: poll.teacherName || null,
    students,
  });
}

// -----------------------
// Poll summary broadcast
// -----------------------
function broadcastPollSummary(pollId) {
  const poll = polls[pollId];
  if (!poll) return;

  const questions = poll.questions.map((q) => ({
    id: q.id,
    text: q.text,
    options: q.options,
    timeLimit: q.timeLimit,
    active: q.active,
    answers: Object.fromEntries(
      Object.entries(q.answers).map(([k, set]) => [k, set.size])
    ),
  }));

  io.to(pollId).emit("pollUpdate", {
    id: poll.id,
    title: poll.title,
    questions,
    studentCount: Object.keys(poll.students).length,
  });
}

// -----------------------
// Results computation
// -----------------------
function computeResultsPercent(question) {
  const counts = Object.fromEntries(
    Object.entries(question.answers).map(([k, set]) => [k, set.size])
  );

  const total = Object.values(counts).reduce((s, v) => s + v, 0) || 0;

  return question.options.map((text, i) => {
    const count = counts[i] || 0;
    const percent = total === 0 ? 0 : Math.round((count / total) * 100);
    return { text, count, percent };
  });
}

function emitShowResultsForQuestion(pollId, question) {
  const computed = computeResultsPercent(question);
  const percentArray = computed.map((r) => r.percent);

  io.to(pollId).emit("showResults", {
    questionId: question.id,
    question: { text: question.text, options: question.options },
    results: percentArray,
  });
}

// -----------------------
// API Routes
// -----------------------
app.post("/api/polls", (req, res) => {
  const { title } = req.body;

  const pollId = shortid.generate();
  polls[pollId] = {
    id: pollId,
    title: title || "Untitled Poll",
    teacherSocketId: null,
    teacherName: null,
    students: {},
    questions: [],
    timers: {},
  };

  res.status(201).json({ pollId });
});

app.post("/api/polls/:pollId/questions", (req, res) => {
  const { pollId } = req.params;
  const { text, options, timeLimit } = req.body;

  const poll = polls[pollId];
  if (!poll) return res.status(404).json({ error: "Poll not found" });

  const questionId = shortid.generate();
  const question = {
    id: questionId,
    text,
    options,
    timeLimit: timeLimit || 60,
    active: false,
    startedAt: null,
    answers: {},
  };

  question.options.forEach((_, i) => {
    question.answers[i] = new Set();
  });

  poll.questions.push(question);

  // broadcast new questions to teacher UI
  broadcastPollSummary(pollId);

  res.status(201).json({ message: "Question added", question });
});

// -----------------------
// Socket logic
// -----------------------
io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  // CHAT
  socket.on("chatMessage", ({ pollId, name, message }) => {
    if (!pollId || !message) return;
    io.to(pollId).emit("chatMessage", {
      name: name || "Anonymous",
      message,
      time: new Date().toISOString(),
    });
  });

  // JOIN POLL
  socket.on("joinPoll", ({ pollId, role, name }) => {
    const poll = polls[pollId];
    if (!poll) {
      socket.emit("errorMessage", "Poll not found");
      return;
    }

    socket.join(pollId);

    if (role === "teacher") {
      poll.teacherSocketId = socket.id;
      poll.teacherName = name || "Teacher";
      socket.emit("joinedAsTeacher", { pollId });
    } else {
      // store student name reliably
      poll.students[socket.id] = {
        name: name || "Student",
        answeredQuestionIds: new Set(),
      };
      socket.emit("joinedAsStudent", { pollId, name: poll.students[socket.id].name });
    }

    // Broadcast updated state
    broadcastPollSummary(pollId);
    broadcastParticipants(pollId);
  });

  // START QUESTION
  socket.on("startQuestion", ({ pollId, questionId }) => {
    const poll = polls[pollId];
    if (!poll) return;

    poll.questions.forEach((q) => (q.active = false));

    const question = poll.questions.find((q) => q.id === questionId);
    if (!question) {
      socket.emit("errorMessage", "Question not found");
      return;
    }

    // reset answers
    question.answers = {};
    question.options.forEach((_, i) => (question.answers[i] = new Set()));

    question.active = true;
    question.startedAt = Date.now();

    // clear old timer if any
    if (poll.timers[questionId]) {
      clearTimeout(poll.timers[questionId]);
      delete poll.timers[questionId];
    }

    // start countdown
    poll.timers[questionId] = setTimeout(() => {
      question.active = false;
      emitShowResultsForQuestion(pollId, question);
      broadcastPollSummary(pollId);
      delete poll.timers[questionId];
    }, question.timeLimit * 1000);

    // send question start
    io.to(pollId).emit("questionStarted", {
      questionId,
      text: question.text,
      options: question.options,
      timeLimit: question.timeLimit,
    });

    broadcastPollSummary(pollId);
  });

  // SUBMIT ANSWER
  socket.on("submitAnswer", (data) => {
    const { pollId, questionId } = data;
    const optionIndex = data.optionIndex ?? data.selectedIndex ?? data.selected;

    const poll = polls[pollId];
    if (!poll) return;

    const question = poll.questions.find((q) => q.id === questionId);
    if (!question || !question.active) return;

    const student = poll.students[socket.id];
    if (!student) return;

    if (student.answeredQuestionIds.has(questionId)) return;
    student.answeredQuestionIds.add(questionId);

    // ensure answers map exists
    if (!question.answers[optionIndex]) question.answers[optionIndex] = new Set();
    question.answers[optionIndex].add(socket.id);

    // broadcast summary only (timer handles results)
    broadcastPollSummary(pollId);
  });

  // END POLL (teacher-triggered)
  socket.on("poll-ended", ({ pollId }) => {
    const poll = polls[pollId];
    if (!poll) return;

    const activeQuestions = poll.questions.filter((q) => q.active);
    activeQuestions.forEach((question) => {
      if (poll.timers[question.id]) {
        clearTimeout(poll.timers[question.id]);
        delete poll.timers[question.id];
      }
      question.active = false;
      emitShowResultsForQuestion(pollId, question);
    });

    broadcastPollSummary(pollId);
  });

  // KICK STUDENT (teacher action)
  socket.on("kickStudent", ({ pollId, studentId }) => {
    const poll = polls[pollId];
    if (!poll) return;

    if (poll.students[studentId]) {
      // notify student
      io.to(studentId).emit("kicked");

      // try to disconnect the student's socket after a short delay
      setTimeout(() => {
        // remove from poll
        delete poll.students[studentId];

        // if socket still connected, remove from room and disconnect
        const targetSocket = io.sockets.sockets.get(studentId);
        if (targetSocket) {
          try {
            targetSocket.leave(pollId);
            // optionally fully disconnect:
            targetSocket.disconnect(true);
          } catch (err) {
            // ignore
          }
        }

        // broadcast updates
        broadcastParticipants(pollId);
        broadcastPollSummary(pollId);
      }, 30);
    }
  });

  // DISCONNECT handling
  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);

    for (const pollId in polls) {
      const poll = polls[pollId];

      if (poll.students[socket.id]) {
        delete poll.students[socket.id];
        broadcastParticipants(pollId);
        broadcastPollSummary(pollId);
      }

      if (poll.teacherSocketId === socket.id) {
        poll.teacherSocketId = null;
        poll.teacherName = null;
        broadcastParticipants(pollId);
        broadcastPollSummary(pollId);
      }
    }
  });
});

// Start server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log("Server running on", PORT));
