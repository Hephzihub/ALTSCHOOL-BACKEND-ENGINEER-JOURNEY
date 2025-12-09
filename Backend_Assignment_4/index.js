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
        yourRole: 'master'
      }
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
        yourRole: 'player'
      }
    });

    // Notify all other players in the session
    socket.to(sessionId).emit("player-joined", {
      player: session.players[session.players.length - 1],
      playerCount: session.players.length,
      players: session.players
    });

    console.log(`[GAME] ${username} joined session ${sessionId}`);
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
      socket.emit("question-created", { success: true });
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
    const timerDuration = 60000; // 60 seconds
    session.timer = setTimeout(() => {
      handleGameTimeout(sessionId);
    }, timerDuration);

    // Broadcast game started to all players
    io.to(sessionId).emit("game-started", {
      question: session.question,
      duration: 60,
      players: session.players
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

      // Notify all players
      io.to(sessionId).emit("game-ended", {
        result: 'winner',
        winner: {
          socketId: player.socketId,
          username: player.username,
          score: player.score
        },
        correctAnswer: session.answer,
        players: session.players
      });

      console.log(`[GAME] ${player.username} won in session ${sessionId}`);

      // Set winneer as new game master after delay
      setTimeout(() => {
        const newMaster = sessionManager.setNewMaster(sessionId, sessionId);
        
        if (newMaster) {
          io.to(sessionId).emit("new-game-master", {
            gamemaster: newMaster,
            message: `${newMaster.username} is the new game master!`
          });

          io.to(sessionId).emit("return-to-lobby", {
            session: sessionManager.getSession(sessionId)
          });
        }
      }, 5000); // 5 second delay

    } else {
      // Wrong answer
      const remainingAttempts = sessionManager.decrementAttempts(sessionId, socket.id);

      socket.emit("wrong-answer", {
        remainingAttempts,
        message: `Wrong answer! ${remainingAttempts} attempts remaining.`
      });

      // Notify other players
      socket.to(sessionId).emit("player-attempted", {
        username: player.username,
        attemptsRemaining: remainingAttempts
      });

      console.log(`[GAME] ${player.username} wrong answer, ${remainingAttempts} attempts left`);
    }
  });

  // Player leaves session
  socket.on("leave-session", (data) => {
    const { sessionId } = data;
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
      socket.emit("session-state", { session });
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

  // Notify all players
  io.to(sessionId).emit("game-ended", {
    result: 'timeout',
    winner: null,
    correctAnswer: session.answer,
    message: "Time's up! No winner this round.",
    players: session.players
  });

  console.log(`[GAME] Session ${sessionId} timed out`);

  // Schedule game master rotation
  // setTimeout(() => {
  //   const newMaster = sessionManager.rotateGameMaster(sessionId);
    
  //   if (newMaster) {
  //     io.to(sessionId).emit("new-game-master", {
  //       gamemaster: newMaster,
  //       message: `${newMaster.username} is the new game master!`
  //     });

  //     io.to(sessionId).emit("return-to-lobby", {
  //       session: sessionManager.getSession(sessionId)
  //     });
  //   }
  // }, 5000);
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

  // Notify remaining players
  socket.to(sessionId).emit("player-left", {
    socketId: socket.id,
    playerCount: result.session.players.length,
    players: result.session.players
  });

  // If game master left, notify about new game master
  if (result.newGameMaster) {
    io.to(sessionId).emit("new-game-master", {
      gamemaster: result.newGameMaster,
      message: `${result.newGameMaster.username} is now the game master!`
    });
  }
}

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});