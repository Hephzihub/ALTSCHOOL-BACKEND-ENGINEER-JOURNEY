// utils/sessionManager.js

class SessionManager {
  constructor() {
    this.sessions = new Map();
  }

  /**
   * Generate a unique 6-character session code
   */
  generateSessionCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code;
    
    do {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
      }
    } while (this.sessions.has(code)); // Ensure uniqueness
    
    return code;
  }

  /**
   * Create a new game session
   * @param {Object} gameMaster - { socketId, username }
   * @returns {Object} Session data with sessionId
   */
  createSession(gameMaster) {
    const sessionId = this.generateSessionCode();
    
    const session = {
      sessionId,
      state: 'waiting', // 'waiting', 'in-progress', 'ended'
      players: [
        {
          socketId: gameMaster.socketId,
          username: gameMaster.username,
          score: 0,
          role: 'master',
          attempts: 3,
          isActive: true
        }
      ],
      question: null,
      answer: null,
      timer: null,
      createdAt: Date.now(),
      currentRound: 0
    };

    this.sessions.set(sessionId, session);
    console.log(`[SESSION] Created session ${sessionId} by ${gameMaster.username}`);
    
    return session;
  }

  /**
   * Add a player to an existing session
   * @param {string} sessionId
   * @param {Object} player - { socketId, username }
   * @returns {Object|null} Updated session or null if failed
   */
  joinSession(sessionId, player) {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      console.log(`[SESSION] Join failed: Session ${sessionId} not found`);
      return null;
    }

    if (session.state !== 'waiting') {
      console.log(`[SESSION] Join failed: Session ${sessionId} is ${session.state}`);
      return null;
    }

    // Check for duplicate username
    const usernameExists = session.players.some(p => 
      p.username.toLowerCase() === player.username.toLowerCase()
    );

    if (usernameExists) {
      console.log(`[SESSION] Join failed: Username ${player.username} already exists`);
      return null;
    }

    const newPlayer = {
      socketId: player.socketId,
      username: player.username,
      score: 0,
      role: 'player',
      attempts: 3,
      isActive: true
    };

    session.players.push(newPlayer);
    console.log(`[SESSION] ${player.username} joined session ${sessionId}`);
    
    return session;
  }

  /**
   * Remove a player from a session
   * @param {string} sessionId
   * @param {string} socketId
   * @returns {Object|null} { session, wasGameMaster, newGameMaster, shouldDelete }
   */
  removePlayer(sessionId, socketId) {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return null;
    }

    const playerIndex = session.players.findIndex(p => p.socketId === socketId);
    
    if (playerIndex === -1) {
      return null;
    }

    const removedPlayer = session.players[playerIndex];
    const wasGameMaster = removedPlayer.role === 'master';
    
    session.players.splice(playerIndex, 1);
    console.log(`[SESSION] ${removedPlayer.username} left session ${sessionId}`);

    // If no players left, mark for deletion
    if (session.players.length === 0) {
      this.deleteSession(sessionId);
      return { session: null, wasGameMaster, newGameMaster: null, shouldDelete: true };
    }

    // If game master left, assign new one
    let newGameMaster = null;
    if (wasGameMaster) {
      newGameMaster = session.players[0];
      newGameMaster.role = 'master';
      console.log(`[SESSION] ${newGameMaster.username} is now game master of ${sessionId}`);
    }

    return { session, wasGameMaster, newGameMaster, shouldDelete: false };
  }

  /**
   * Delete a session
   * @param {string} sessionId
   */
  deleteSession(sessionId) {
    const session = this.sessions.get(sessionId);
    
    if (session && session.timer) {
      clearTimeout(session.timer);
    }
    
    this.sessions.delete(sessionId);
    console.log(`[SESSION] Deleted session ${sessionId}`);
  }

  /**
   * Get session by ID
   * @param {string} sessionId
   * @returns {Object|null}
   */
  getSession(sessionId) {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Update session state
   * @param {string} sessionId
   * @param {Object} updates
   * @returns {Object|null} Updated session
   */
  updateSession(sessionId, updates) {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return null;
    }

    Object.assign(session, updates);
    return session;
  }

  /**
   * Set question and answer for a session
   * @param {string} sessionId
   * @param {string} question
   * @param {string} answer
   * @returns {boolean} Success status
   */
  setQuestion(sessionId, question, answer) {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return false;
    }

    session.question = question.trim();
    session.answer = answer.trim().toLowerCase();
    console.log(`[SESSION] Question set for session ${sessionId}`);
    
    return true;
  }

  /**
   * Start a game session
   * @param {string} sessionId
   * @returns {Object|null} { success, error, session }
   */
  startGame(sessionId) {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    if (session.players.length < 2) {
      return { success: false, error: 'Need at least 2 players' };
    }

    if (!session.question || !session.answer) {
      return { success: false, error: 'Question and answer required' };
    }

    if (session.state !== 'waiting') {
      return { success: false, error: 'Game already in progress' };
    }

    // Reset all player attempts
    session.players.forEach(player => {
      player.attempts = 3; // revisit this later
    });

    session.state = 'in-progress';
    session.currentRound++;
    console.log(`[SESSION] Game started in session ${sessionId}`);
    
    return { success: true, session };
  }

  /**
   * End a game session
   * @param {string} sessionId
   * @param {Object} result - { winner: socketId|null, reason: 'correct'|'timeout' }
   * @returns {Object|null}
   */
  endGame(sessionId, result) {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return null;
    }

    // Clear timer if exists
    if (session.timer) {
      clearTimeout(session.timer);
      session.timer = null;
    }

    // Award points if there's a winner
    if (result.winner) {
      const winner = session.players.find(p => p.socketId === result.winner);
      if (winner) {
        winner.score += 10;
        console.log(`[SESSION] ${winner.username} won round ${session.currentRound} in ${sessionId}`);
      }
      session.state = 'ended';
    } else {
      console.log(`[SESSION] Round ${session.currentRound} in ${sessionId} ended with no winner`);
      session.state = 'waiting';
    }

    
    return { session, result };
  }

  /**
   * Rotate game master to next player
   * @param {string} sessionId
   * @param {string} winnerSocketId
   * @returns {Object|null} New game master
   */
  setNewMaster(sessionId, winnerSocketId) {
    const session = this.sessions.get(sessionId);
    
    if (!session || session.players.length === 0) {
      return null;
    }

    // Find current game master and remove role
    const currentMasterIndex = session.players.findIndex(p => p.role === 'master');
    
    if (currentMasterIndex !== -1) {
      session.players[currentMasterIndex].role = 'player';
    }

    // Find winner and assign as new game master
    const newMaster = session.players.find(p => p.socketId === winnerSocketId);
    
    if (!newMaster) {
      return null;
    }

    newMaster.role = 'master';

    // Reset session for next round
    session.state = 'waiting';
    session.question = null;
    session.answer = null;

    console.log(`[SESSION] ${newMaster.username} is now game master in ${sessionId}`);
    
    return newMaster;
  }

  /**
   * Check if user is game master
   * @param {string} sessionId
   * @param {string} socketId
   * @returns {boolean}
   */
  isGameMaster(sessionId, socketId) {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return false;
    }

    const player = session.players.find(p => p.socketId === socketId);
    return player && player.role === 'master';
  }

  /**
   * Get player by socket ID
   * @param {string} sessionId
   * @param {string} socketId
   * @returns {Object|null}
   */
  getPlayer(sessionId, socketId) {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return null;
    }

    return session.players.find(p => p.socketId === socketId) || null;
  }

  /**
   * Decrement player attempts
   * @param {string} sessionId
   * @param {string} socketId
   * @returns {number} Remaining attempts
   */
  decrementAttempts(sessionId, socketId) {
    const player = this.getPlayer(sessionId, socketId);
    
    if (!player) {
      return 0;
    }

    player.attempts = Math.max(0, player.attempts - 1);
    return player.attempts;
  }

  /**
   * Get all active sessions count
   * @returns {number}
   */
  getActiveSessionsCount() {
    return this.sessions.size;
  }

  /**
   * Get session statistics
   * @param {string} sessionId
   * @returns {Object|null}
   */
  getSessionStats(sessionId) {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return null;
    }

    return {
      sessionId: session.sessionId,
      playerCount: session.players.length,
      state: session.state,
      currentRound: session.currentRound,
      hasQuestion: !!session.question,
      uptime: Date.now() - session.createdAt
    };
  }
}

// Export singleton instance
export const sessionManager = new SessionManager();