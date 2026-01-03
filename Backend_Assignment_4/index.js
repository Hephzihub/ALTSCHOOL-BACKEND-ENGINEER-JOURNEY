import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { config } from "dotenv";
import { sessionManager } from "./utils/SessionManager.js";

config();

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

// Socket.IO Event Handlers
io.on("connection", (socket) => {
  console.log(`[CONNECTION] User connected: ${socket.id}`);

  // Create a new game session
  socket.on("create-game", (data) => {
    const { username } = data;

    if (!username || username.trim() === "") {
      socket.emit("error", { message: "Username is required" });
      return;
    }

    const session = sessionManager.createSession({
      socketId: socket.id,
      username: username.trim()
    });

    // Join the socket room
    socket.join(session.sessionId);

    // Send session data back to creator
    socket.emit("game-created", {
      sessionId: session.sessionId,
      session: {
        sessionId: session.sessionId,
        players: session.players,
        state: session.state,
        yourRole: 'master',
        chatEnabled: session.chatEnabled,
        currentRound: session.currentRound
      }
    });

    // Send system message
    io.to(session.sessionId).emit("system-message", {
      type: 'system',
      content: `${username} created the session`,
      timestamp: Date.now()
    });

    console.log(`[GAME] ${username} created session ${session.sessionId}`);
  });

  // Join an existing game session
  socket.on("join-game", (data) => {
    const { sessionId, username } = data;

    if (!username || username.trim() === "") {
      socket.emit("error", { message: "Username is required" });
      return;
    }

    if (!sessionId || sessionId.trim() === "") {
      socket.emit("error", { message: "Session code is required" });
      return;
    }

    const session = sessionManager.joinSession(sessionId.toUpperCase(), {
      socketId: socket.id,
      username: username.trim()
    });

    if (!session) {
      socket.emit("error", { 
        message: "Could not join session. It may not exist, be in progress, or username is taken." 
      });
      return;
    }

    // Join the socket room
    socket.join(sessionId);

    // Send session data to the new player
    socket.emit("game-joined", {
      sessionId: session.sessionId,
      session: {
        sessionId: session.sessionId,
        players: session.players,
        state: session.state,
        yourRole: 'player',
        chatEnabled: session.chatEnabled,
        currentRound: session.currentRound
      }
    });

    // Notify all players in the session
    io.to(sessionId).emit("player-joined", {
      player: session.players[session.players.length - 1],
      playerCount: session.players.length,
      players: session.players
    });

    // Send system message to all
    io.to(sessionId).emit("system-message", {
      type: 'system',
      content: `${username} joined the session`,
      timestamp: Date.now()
    });

    console.log(`[GAME] ${username} joined session ${sessionId}`);
  });

  // Send chat message
  socket.on("send-message", (data) => {
    const { sessionId, message } = data;

    const session = sessionManager.getSession(sessionId);

    if (!session) {
      socket.emit("error", { message: "Session not found" });
      return;
    }

    // Check if chat is enabled (no regular chat during game, allow for game master)
    if (!session.chatEnabled && !sessionManager.isGameMaster(sessionId, socket.id)) {
      socket.emit("error", { message: "Chat is disabled during the game" });
      return;
    }

    const player = sessionManager.getPlayer(sessionId, socket.id);

    if (!player) {
      socket.emit("error", { message: "Player not found" });
      return;
    }

    if (!message || message.trim() === "") {
      return;
    }

    // Broadcast message to all players
    io.to(sessionId).emit("chat-message", {
      type: 'chat',
      username: player.username,
      content: message.trim(),
      timestamp: Date.now(),
      socketId: socket.id
    });

    console.log(`[CHAT] ${player.username}: ${message}`);
  });

  // Game master creates question
  socket.on("create-question", (data) => {
    const { sessionId, question, answer } = data;

    if (!sessionManager.isGameMaster(sessionId, socket.id)) {
      socket.emit("error", { message: "Only game master can create questions" });
      return;
    }

    if (!question || !answer || question.trim() === "" || answer.trim() === "") {
      socket.emit("error", { message: "Question and answer are required" });
      return;
    }

    const success = sessionManager.setQuestion(sessionId, question, answer);

    if (success) {
      const player = sessionManager.getPlayer(sessionId, socket.id);
      
      // Notify game master
      socket.emit("question-created", { question, answer });
      
      // Send system message to all (without revealing answer)
      io.to(sessionId).emit("system-message", {
        type: 'system',
        content: `${player.username} set a question. Ready to start!`,
        timestamp: Date.now()
      });

      console.log(`[GAME] Question set for session ${sessionId}`);
    } else {
      socket.emit("error", { message: "Failed to create question" });
    }
  });

  // Game master starts the game
  socket.on("start-game", (data) => {
    const { sessionId } = data;

    if (!sessionManager.isGameMaster(sessionId, socket.id)) {
      socket.emit("error", { message: "Only game master can start the game" });
      return;
    }

    const result = sessionManager.startGame(sessionId);

    if (!result.success) {
      socket.emit("error", { message: result.error });
      return;
    }

    const session = result.session;

    // Start 60-second timer
    const timerDuration = 60000;
    session.timer = setTimeout(() => {
      handleGameTimeout(sessionId);
    }, timerDuration);

    // Broadcast game started to all players
    io.to(sessionId).emit("game-started", {
      question: session.question,
      duration: 60,
      players: session.players,
      chatEnabled: session.chatEnabled
    });

    // Send system message
    io.to(sessionId).emit("system-message", {
      type: 'game-start',
      content: `Game started! You have 60 seconds to answer.`,
      timestamp: Date.now()
    });

    console.log(`[GAME] Session ${sessionId} started`);
  });

  // Player submits an answer
  socket.on("submit-answer", (data) => {
    const { sessionId, answer } = data;

    const session = sessionManager.getSession(sessionId);

    if (!session) {
      socket.emit("error", { message: "Session not found" });
      return;
    }

    if (session.state !== 'in-progress') {
      socket.emit("error", { message: "Game is not in progress" });
      return;
    }

    const player = sessionManager.getPlayer(sessionId, socket.id);

    if (!player) {
      socket.emit("error", { message: "Player not found" });
      return;
    }

    if (player.role === 'master') {
      socket.emit("error", { message: "Game master cannot submit answers" });
      return;
    }

    if (player.attempts <= 0) {
      socket.emit("error", { message: "No attempts remaining" });
      return;
    }

    const submittedAnswer = answer.trim().toLowerCase();
    const correctAnswer = session.answer;

    if (submittedAnswer === correctAnswer) {
      // Correct answer!
      const endResult = sessionManager.endGame(sessionId, {
        winner: socket.id,
        reason: 'correct'
      });

      // Send system message about winner
      io.to(sessionId).emit("system-message", {
        type: 'winner',
        content: `${player.username} got it right! +10 points`,
        timestamp: Date.now()
      });

      // Notify all players
      io.to(sessionId).emit("game-ended", {
        result: 'winner',
        winner: {
          socketId: player.socketId,
          username: player.username,
          score: player.score
        },
        correctAnswer: session.answer,
        players: session.players,
        chatEnabled: session.chatEnabled
      });

      console.log(`[GAME] ${player.username} won in session ${sessionId}`);

      // Set winner as new game master after delay
      setTimeout(() => {
        const newMaster = sessionManager.setNewMaster(sessionId, socket.id);
        
        if (newMaster) {
          io.to(sessionId).emit("new-game-master", {
            gameMaster: newMaster,
            players: session.players
          });

          // Send system message
          io.to(sessionId).emit("system-message", {
            type: 'system',
            content: `${newMaster.username} is now the game master!`,
            timestamp: Date.now()
          });
        }
      }, 3000); // 3 second delay

    } else {
      // Wrong answer
      const remainingAttempts = sessionManager.decrementAttempts(sessionId, socket.id);

      socket.emit("wrong-answer", {
        remainingAttempts,
        message: `Wrong answer! ${remainingAttempts} attempt(s) remaining.`
      });

      // Notify all players via system message
      io.to(sessionId).emit("system-message", {
        type: 'attempt',
        content: `${player.username} answered incorrectly (${remainingAttempts} attempt(s) left)`,
        timestamp: Date.now()
      });

      console.log(`[GAME] ${player.username} wrong answer, ${remainingAttempts} attempts left`);
    }
  });

  // Player leaves session
  socket.on("leave-session", (data) => {
    const { sessionId } = data;
    console.log(`[GAME] Player ${socket.id} leaving session ${sessionId}`);
    handlePlayerLeave(socket, sessionId);
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`[CONNECTION] User disconnected: ${socket.id}`);
    
    // Find and remove player from any session they're in
    for (const [sessionId, session] of sessionManager.sessions) {
      const player = session.players.find(p => p.socketId === socket.id);
      if (player) {
        handlePlayerLeave(socket, sessionId);
        break;
      }
    }
  });

  // Get current session state
  socket.on("get-session-state", (data) => {
    const { sessionId } = data;
    const session = sessionManager.getSession(sessionId);

    if (session) {
      const player = sessionManager.getPlayer(sessionId, socket.id);
      socket.emit("session-state", { 
        session,
        yourRole: player ? player.role : null
      });
    } else {
      socket.emit("error", { message: "Session not found" });
    }
  });
});

// Helper function to handle game timeout
function handleGameTimeout(sessionId) {
  const session = sessionManager.getSession(sessionId);

  if (!session || session.state !== 'in-progress') {
    return;
  }

  const endResult = sessionManager.endGame(sessionId, {
    winner: null,
    reason: 'timeout'
  });

  // Send system message
  io.to(sessionId).emit("system-message", {
    type: 'timeout',
    content: `Time's up! The answer was: ${session.answer}`,
    timestamp: Date.now()
  });

  // Notify all players
  io.to(sessionId).emit("game-ended", {
    result: 'timeout',
    winner: null,
    correctAnswer: session.answer,
    message: "Time's up! No winner this round.",
    players: session.players,
    chatEnabled: session.chatEnabled
  });

  console.log(`[GAME] Session ${sessionId} timed out`);
}

// Helper function to handle player leaving
function handlePlayerLeave(socket, sessionId) {
  const result = sessionManager.removePlayer(sessionId, socket.id);

  if (!result) {
    return;
  }

  socket.leave(sessionId);

  if (result.shouldDelete) {
    console.log(`[GAME] Session ${sessionId} deleted - no players remaining`);
    return;
  }

  // Send system message
  io.to(sessionId).emit("system-message", {
    type: 'system',
    content: `${result.removedPlayer.username} left the session`,
    timestamp: Date.now()
  });

  // Notify remaining players
  socket.to(sessionId).emit("player-left", {
    socketId: socket.id,
    playerCount: result.session.players.length,
    players: result.session.players
  });

  // If game master left, notify about new game master
  if (result.newGameMaster) {
    io.to(sessionId).emit("new-game-master", {
      gameMaster: result.newGameMaster,
      players: result.session.players
    });

    // Send system message
    io.to(sessionId).emit("system-message", {
      type: 'system',
      content: `${result.newGameMaster.username} is now the game master!`,
      timestamp: Date.now()
    });
  }
}

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});