const socket = io();

// Global state
let currentSession = null;
let currentRole = null;
let timerInterval = null;

// ===== UI MANAGEMENT FUNCTIONS =====

// Screen management
function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.remove("active");
  });
  document.getElementById(screenId).classList.add("active");
}

// Format timestamp
function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

// Add message to chat
function addMessage(messageData) {
  const container = document.getElementById("messages-container");
  const messageDiv = document.createElement("div");

  if (
    messageData.type === "system" ||
    messageData.type === "game-start" ||
    messageData.type === "winner" ||
    messageData.type === "timeout" ||
    messageData.type === "attempt"
  ) {
    // System message
    messageDiv.className = `message system`;
    messageDiv.innerHTML = `
      <div class="message-content ${messageData.type}">
        ${messageData.content}
      </div>
    `;
  } else {
    // Chat message
    const isOwn = messageData.socketId === socket.id;
    messageDiv.className = `message chat ${isOwn ? "own" : ""}`;
    messageDiv.innerHTML = `
      <div class="message-header">
        <span class="message-username">${messageData.username}</span>
        <span class="message-time">${formatTime(messageData.timestamp)}</span>
      </div>
      <div class="message-content chat">${messageData.content}</div>
    `;
  }

  container.appendChild(messageDiv);
  container.scrollTop = container.scrollHeight;
}

// Update players list
function updatePlayersList(players) {
  const list = document.getElementById("players-list");
  list.innerHTML = "";

  // Sort: game master first
  players.sort((a, b) => (a.role === "master" ? -1 : 1));

  players.forEach((player) => {
    const div = document.createElement("div");
    div.className = `player-item ${
      player.role === "master" ? "game-master" : ""
    } ${player.socketId === socket.id ? "you" : ""}`;
    div.innerHTML = `
      <div class="player-icon">
        ${
          player.role === "master"
            ? '<i class="fas fa-crown crown"></i>'
            : '<i class="fas fa-user"></i>'
        }
      </div>
      <span>${player.username} ${
      player.socketId === socket.id ? "(You)" : ""
    }</span>
    `;
    list.appendChild(div);
  });
}

// Update scoreboard
function updateScoreboard(players) {
  const scoreboard = document.getElementById("scoreboard");
  scoreboard.innerHTML = "";

  // Sort by score descending
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  sortedPlayers.forEach((player) => {
    const div = document.createElement("div");
    div.className = "score-item";
    div.innerHTML = `
      <span>
        ${player.role === "master" ? '<i class="fas fa-crown crown"></i> ' : ""}
        ${player.username}
        ${player.socketId === socket.id ? " (You)" : ""}
      </span>
      <span class="score-value">${player.score}</span>
    `;
    scoreboard.appendChild(div);
  });
}

// Update input area based on state
function updateInputArea(state, role, chatEnabled, hasQuestion) {
  // Hide all input types first
  document.getElementById("normal-chat-input").style.display = "none";
  document.getElementById("question-input-form").style.display = "none";
  document.getElementById("start-game-wrapper").style.display = "none";
  document.getElementById("answer-submit-input").style.display = "none";

  const chatInput = document.getElementById("chat-message-input");
  const sendBtn = document.querySelector("#normal-chat-input .send-btn");

  if (state === "waiting") {
    if (role === "master") {
      if (!hasQuestion) {
        // Game master needs to set question
        document.getElementById("question-input-form").style.display = "flex";
      } else {
        // Question is set, show start button
        document.getElementById("start-game-wrapper").style.display = "flex";
      }
      document.getElementById("normal-chat-input").style.display = "flex";
      document.getElementById("normal-chat-input").style.marginTop = "10px";
      chatInput.disabled = false;
      sendBtn.disabled = false;
      chatInput.placeholder = "Type a message...";
    } else {
      // Regular player - normal chat
      document.getElementById("normal-chat-input").style.display = "flex";
      // document.getElementById("normal-chat-input").style.marginTop = "0px";
      chatInput.disabled = false;
      sendBtn.disabled = false;
      chatInput.placeholder = "Type a message...";
    }
  } else if (state === "in-progress") {
    if (role === "master") {
      // Game master can't do anything during game
      document.getElementById("normal-chat-input").style.display = "flex";
      // chatInput.disabled = true;
      // sendBtn.disabled = true;
      chatInput.placeholder = "Tease your gamers...";
    } else {
      // Players submit answers
      document.getElementById("answer-submit-input").style.display = "flex";
    }
  }
}

// Update attempts display
function updateAttemptsDisplay(attempts) {
  const display = document.getElementById("attempts-display");
  display.innerHTML = "";

  for (let i = 0; i < 3; i++) {
    const heart = document.createElement("i");
    heart.className = `fas fa-heart ${i >= attempts ? "used" : ""}`;
    display.appendChild(heart);
  }
}

// Start timer
function startTimer(seconds) {
  clearInterval(timerInterval);

  const timerDisplay = document.getElementById("timer-display");
  const timerElement = document.getElementById("game-timer");

  timerElement.style.display = "flex";
  timerElement.classList.remove("warning", "danger");

  let remaining = seconds;
  timerDisplay.textContent = remaining;

  timerInterval = setInterval(() => {
    remaining--;
    timerDisplay.textContent = remaining;

    if (remaining <= 10) {
      timerElement.classList.add("danger");
    } else if (remaining <= 30) {
      timerElement.classList.add("warning");
    }

    if (remaining <= 0) {
      clearInterval(timerInterval);
    }
  }, 1000);
}

// Stop timer
function stopTimer() {
  clearInterval(timerInterval);
  document.getElementById("game-timer").style.display = "none";
}

// Copy session code
function copySessionCode() {
  const code = document.getElementById("chat-session-code").textContent;
  navigator.clipboard.writeText(code).then(() => {
    const btn = document.querySelector(".copy-code-btn");
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i>';
    setTimeout(() => {
      btn.innerHTML = originalHTML;
    }, 2000);
  });
}

// Send message
function sendMessage() {
  const input = document.getElementById("chat-message-input");
  const message = input.value.trim();

  if (message && currentSession) {
    socket.emit("send-message", {
      sessionId: currentSession,
      message: message,
    });
    input.value = "";
  }
}

// Set question
function setQuestion() {
  const question = document.getElementById("question-input").value.trim();
  const answer = document.getElementById("answer-input").value.trim();

  if (question && answer && currentSession) {
    socket.emit("create-question", {
      sessionId: currentSession,
      question: question,
      answer: answer,
    });
  } else {
    alert("Please enter both question and answer");
  }
}

// Clear all input fields, forms and messages
function clearAll() {
  document.getElementById("messages-container").innerHTML = "";
  document.getElementById("question-input").value = "";
  document.getElementById("answer-input").value = "";
  document.getElementById("chat-message-input").value = "";
  document.getElementById("answer-submit-field").value = "";
}

// Start game
function startGame() {
  if (currentSession) {
    socket.emit("start-game", {
      sessionId: currentSession,
    });
  }
}

// Submit answer
function submitAnswer() {
  const input = document.getElementById("answer-submit-field");
  const answer = input.value.trim();

  if (answer && currentSession) {
    socket.emit("submit-answer", {
      sessionId: currentSession,
      answer: answer,
    });
    input.value = "";
  }
}

// Leave session
function leaveSession() {
  if (currentSession) {
    socket.emit("leave-session", {
      sessionId: currentSession,
    });
    currentSession = null;
    currentRole = null;
    stopTimer();
    showScreen("home-screen");
    clearAll();
    // to do remove session code from local storage if implemented
  }
}

// Enter key handlers
document
  .getElementById("chat-message-input")
  ?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });

document
  .getElementById("answer-submit-field")
  ?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") submitAnswer();
  });

// Copy button handler
document
  .querySelector(".copy-code-btn")
  ?.addEventListener("click", copySessionCode);

// Create game button
document.getElementById("create-game-btn")?.addEventListener("click", () => {
  const username = document.getElementById("creator-username").value.trim();
  if (username) {
    socket.emit("create-game", { username });
    document.getElementById("creator-username").value = "";
    clearAll();
  } else {
    alert("Please enter your name");
  }
});

// Join game button
document.getElementById("join-game-btn")?.addEventListener("click", () => {
  const sessionId = document.getElementById("session-code").value.trim();
  const username = document.getElementById("username").value.trim();
  if (sessionId && username) {
    socket.emit("join-game", { sessionId, username });
    document.getElementById("session-code").value = "";
    document.getElementById("username").value = "";
    clearAll();
  } else {
    alert("Please enter both session code and your name");
  }
});

// ===== SOCKET EVENT HANDLERS =====

// Game created
socket.on("game-created", (data) => {
  currentSession = data.sessionId;
  currentRole = data.session.yourRole;

  document.getElementById("chat-session-code").textContent = data.sessionId;
  document.getElementById("header-player-count").textContent =
    data.session.players.length;

  updatePlayersList(data.session.players);
  updateScoreboard(data.session.players);
  updateInputArea(
    data.session.state,
    currentRole,
    data.session.chatEnabled,
    false
  );

  showScreen("chat-screen");
});

// Game joined
socket.on("game-joined", (data) => {
  currentSession = data.sessionId;
  currentRole = data.session.yourRole;

  document.getElementById("chat-session-code").textContent = data.sessionId;
  document.getElementById("header-player-count").textContent =
    data.session.players.length;

  updatePlayersList(data.session.players);
  updateScoreboard(data.session.players);
  updateInputArea(
    data.session.state,
    currentRole,
    data.session.chatEnabled,
    false
  );

  showScreen("chat-screen");
});

// Player joined
socket.on("player-joined", (data) => {
  document.getElementById("header-player-count").textContent = data.playerCount;
  updatePlayersList(data.players);
  updateScoreboard(data.players);
});

// Player left
socket.on("player-left", (data) => {
  document.getElementById("header-player-count").textContent = data.playerCount;
  updatePlayersList(data.players);
  updateScoreboard(data.players);
});

// Chat message
socket.on("chat-message", (data) => {
  addMessage(data);
});

// System message
socket.on("system-message", (data) => {
  addMessage(data);
});

// Question created
socket.on("question-created", (data) => {
  // Clear form
  document.getElementById("question-input").value = "";
  document.getElementById("answer-input").value = "";

  // Update input area to show start button
  updateInputArea("waiting", currentRole, true, true);
});

// Game started
socket.on("game-started", (data) => {
  // Show question banner
  document.getElementById("question-banner").style.display = "block";
  document.getElementById("active-question").textContent = data.question;

  // Update players and scoreboard
  updatePlayersList(data.players);
  updateScoreboard(data.players);

  // Get current player to check attempts
  const currentPlayer = data.players.find((p) => p.socketId === socket.id);
  if (currentPlayer && currentPlayer.role !== "master") {
    updateAttemptsDisplay(currentPlayer.attempts);
  }

  // Update input area
  updateInputArea("in-progress", currentRole, false, true);

  // Start timer
  startTimer(data.duration);
});

// Wrong answer
socket.on("wrong-answer", (data) => {
  updateAttemptsDisplay(data.remainingAttempts);

  // Show feedback
  addMessage({
    type: "system",
    content: data.message,
    timestamp: Date.now(),
  });
});

// Game ended
socket.on("game-ended", (data) => {
  stopTimer();

  // Hide question banner
  document.getElementById("question-banner").style.display = "none";

  // Update scoreboard with new scores
  updateScoreboard(data.players);

  // Update input area back to waiting
  updateInputArea("waiting", currentRole, data.chatEnabled, false);
});

// New game master
socket.on("new-game-master", (data) => {
  // Update role if you're the new game master
  const isNewMaster = data.gameMaster.socketId === socket.id;
  // if (isNewMaster) {
  //   currentRole = "master";
  // } 

  isNewMaster ? currentRole = "master" : currentRole = "player";

  // Update players list
  updatePlayersList(data.players);

  // Update input area
  updateInputArea("waiting", currentRole, true, false);
});

// Error handler
socket.on("error", (data) => {
  alert(data.message);
});

// Handle disconnect
socket.on("disconnect", () => {
  console.log("Disconnected from server");
  if (currentSession) {
    alert("Disconnected from server");
    showScreen("home-screen");
    currentSession = null;
    currentRole = null;
  }
});
