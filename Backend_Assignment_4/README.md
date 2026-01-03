# Guessing Game - Real-Time Multiplayer

A real-time multiplayer guessing game built with Node.js, Express, and Socket.IO. Players can create game sessions, invite friends via session codes, and compete in a turn-based number guessing challenge.

## Features

- **Real-Time Gameplay**: Leverages Socket.IO for instant communication between players
- **Session Management**: Create unique game sessions with 6-character alphanumeric codes
- **Multiplayer Support**: Multiple players can join the same game session
- **Score Tracking**: Persistent score tracking throughout the game
- **In-Game Chat**: Real-time messaging between players with timestamps
- **Game Master System**: The game creator has special privileges to control the session
- **Round Management**: Organized game rounds with automatic progression
- **Attempt Tracking**: Players have limited attempts per round
- **Timer-Based Gameplay**: Turn-based rounds with time management

## Project Structure

```
Backend_Assignment_4/
├── index.js                 # Main Express server and Socket.IO setup
├── package.json             # Project dependencies and scripts
├── public/
│   ├── index.html          # Frontend HTML interface
│   ├── script.js           # Client-side Socket.IO logic and UI management
│   └── styles.css          # Styling for the game interface
├── utils/
│   └── SessionManager.js   # Game session management and logic
└── test.html               # Testing utilities
```

## Technology Stack

- **Backend**: Node.js with Express.js
- **Real-Time Communication**: Socket.IO
- **Runtime Management**: Nodemon (development)
- **Environment Configuration**: dotenv

## Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd Backend_Assignment_4
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a .env file** (optional)
   ```bash
   PORT=3000
   ```

## Usage

### Development Mode
Start the server with automatic restart on file changes:
```bash
npm run dev
```

### Production Mode
Start the server:
```bash
npm start
```

The application will be available at `http://localhost:3000` (or your configured PORT).

## Game Flow

### Creating a Game
1. Enter your username on the home screen
2. Click "Create Game"
3. You'll receive a unique session code (6 characters)
4. Share the code with other players

### Joining a Game
1. Click "Join Game" from the home screen
2. Enter your username
3. Enter the session code provided by the game creator
4. Click "Join" to enter the game

### Playing
1. Wait for the game master to start the game
2. When it's your turn, submit your guess
3. Receive feedback (higher/lower/correct)
4. Track your score on the scoreboard
5. Chat with other players in real-time

## Key Components

### index.js
Main server file that handles:
- Express server setup
- Socket.IO connection management
- Game event handlers (create-game, join-game, start-game, etc.)
- Broadcasting game state to connected players

### utils/SessionManager.js
Core game logic responsible for:
- Session creation and management
- Player management (add, remove, update)
- Session code generation
- Game state validation
- Score calculation

### public/script.js
Client-side application handling:
- Socket.IO connection and event listeners
- UI screen management
- Message display and chat functionality
- Player list and scoreboard updates
- Game state synchronization

### public/index.html & styles.css
User interface featuring:
- Responsive design
- Multiple game screens (home, join, lobby, game)
- Chat interface
- Scoreboard
- Player list

## Socket.IO Events

### Client → Server
- `create-game`: Create a new game session
- `join-game`: Join an existing game session
- `start-game`: Initiate the game (game master only)
- `submit-answer`: Submit a guess for the current round
- `send-message`: Send a chat message
- `disconnect`: Player leaves the game

### Server → Client
- `game-created`: Confirmation of game creation
- `game-joined`: Confirmation of joining a game
- `game-started`: Game has begun
- `game-update`: Current game state update
- `system-message`: System notifications
- `error`: Error messages
- `winner`: Round winner announcement

## Environment Variables

- `PORT`: Server port (default: 3000)

## Dependencies

- `express` ^5.2.1 - Web framework
- `socket.io` ^4.8.1 - Real-time communication
- `dotenv` ^17.2.3 - Environment variable management
- `nodemon` ^3.1.11 - Development server auto-restart

## Game Rules

- Game master creates a session and thinks of a number
- Players join the session and attempt to guess the number
- Each player has a limited number of attempts per round
- Feedback is provided after each guess (higher/lower/correct)
- Scores are tracked based on guesses and attempts
- Multiple rounds can be played in a single session
- Chat is enabled for all players during the game

## Development

### Running Tests
```bash
npm test
```

### Auto-Restart During Development
The dev script uses `nodemon` to automatically restart the server when files change.

## Notes

- Sessions persist in memory; restarting the server clears all active sessions
- Username validation: required and must be unique within each session
- Session codes are case-insensitive (automatically converted to uppercase)
- Maximum 20 characters for usernames

## Future Enhancements

- Database persistence for sessions and scores
- User authentication and profiles
- Leaderboard system
- Custom game rules and difficulty levels
- Mobile app version
- Game history and statistics

## License

ISC

## Author

Oluwasegun Adedeji
