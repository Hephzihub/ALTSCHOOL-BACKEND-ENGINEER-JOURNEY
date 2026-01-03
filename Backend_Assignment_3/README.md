# Task Management Application

A full-stack Node.js task management application with user authentication, built as part of the AltSchool Backend Engineer Journey. Users can create, read, update, and delete tasks while tracking their progress with real-time statistics.

## Features

- **User Authentication**: Secure user registration and login with JWT tokens and bcryptjs password hashing
- **Session Management**: Express sessions to maintain user state with configurable timeout (1 hour)
- **Task Management**: Full CRUD operations for tasks
  - Create tasks with title and description
  - Update task status (pending → completed → deleted)
  - Delete tasks permanently
  - Filter tasks by status (all, pending, completed)
- **Task Statistics**: Real-time stats showing total, pending, and completed task counts
- **Responsive UI**: EJS templating with clean, user-friendly interface
- **Input Validation**: Joi validation for request data
- **Password Security**: bcryptjs hashing for secure password storage

## Tech Stack

### Backend
- **Runtime**: Node.js (ES6 modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT, bcryptjs
- **Session Management**: express-session
- **Templating**: EJS
- **Validation**: Joi

### Testing
- **Test Framework**: Vitest
- **HTTP Testing**: Supertest
- **Test Database**: MongoDB Memory Server (in-memory MongoDB for testing)

### Development
- **Package Manager**: npm
- **Development Server**: Nodemon
- **Environment Variables**: dotenv

## Project Structure

```
├── auth/                      # Authentication module
│   ├── auth.controller.js      # Request handlers for auth routes
│   ├── auth.middleware.js      # Auth middleware (JWT verification)
│   ├── auth.model.js          # User schema and model
│   ├── auth.route.js          # Auth routes definition
│   └── auth.service.js        # Business logic for auth
├── tasks/                     # Task management module
│   ├── task.controller.js      # Request handlers for task routes
│   ├── task.middleware.js      # Task validation middleware
│   ├── task.model.js          # Task schema and model
│   ├── task.route.js          # Task routes definition
│   └── task.service.js        # Business logic for tasks
├── configs/
│   └── database.js            # MongoDB connection setup
├── utils/
│   └── jwt.js                 # JWT utility functions
├── public/
│   └── css/
│       └── style.css          # Application styles
├── views/                     # EJS templates
│   ├── 404.ejs               # 404 error page
│   ├── login.ejs             # Login page
│   ├── register.ejs          # Registration page
│   └── task.ejs              # Tasks dashboard page
├── tests/                     # Test suites
│   ├── auth.spec.js          # Authentication tests
│   ├── task.spec.js          # Task management tests
│   ├── database.mjs          # Test database setup
│   └── index.spec.mjs        # Application tests
├── app.js                     # Express app configuration
├── index.js                   # Server entry point
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB instance (local or Atlas)
- npm or yarn

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Backend_Assignment_3
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment variables**
   Create a `.env` file in the root directory:
   ```env
   PORT=3001
   DB_URL=mongodb://localhost:27017/task-management
   SESSION_SECRET=your-secret-key-here
   JWT_SECRET=your-jwt-secret-key
   ```

4. **Verify MongoDB connection**
   Ensure MongoDB is running on your system or use MongoDB Atlas with the appropriate connection string.

## Running the Application

### Development Mode
```bash
npm run dev
```
Runs the server with Nodemon for auto-reload. Server starts at `http://localhost:3001`

### Production Mode
```bash
npm start
```

### Testing
```bash
npm test
```
Runs all test suites in `tests/` directory using Vitest with verbose reporting.

## API Endpoints

### Authentication Routes
- `GET /auth/login` - Render login page
- `GET /auth/signup` - Render registration page
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Authenticate user
- `GET /auth/logout` - Log out user

### Task Routes
- `GET /task` - Get all tasks for logged-in user (with optional filter query)
- `POST /task` - Create a new task
- `PATCH /task/:id/:type` - Update task status
- `DELETE /task/:id` - Delete a task

### General Routes
- `GET /` - Root route (redirects to login or task dashboard)
- `GET /404` - 404 error page

## Usage

### Creating an Account
1. Navigate to `http://localhost:3001`
2. Click "Sign Up"
3. Enter a username (3-30 characters) and password (minimum 6 characters)
4. You'll be redirected to the task dashboard

### Managing Tasks
1. **Create Task**: Fill in the title (required) and description (optional), then submit
2. **View Tasks**: Filter by "All", "Pending", or "Completed" using the filter buttons
3. **Update Status**: Click the status button to mark a task as completed
4. **Delete Task**: Click the delete button to permanently remove a task
5. **View Stats**: See real-time statistics of your task counts

## Database Models

### User Schema
```javascript
{
  username: String (unique, 3-30 chars, lowercase),
  password: String (hashed, min 6 chars),
  createdAt: Date,
  updatedAt: Date
}
```

### Task Schema
```javascript
{
  userId: ObjectId (reference to User),
  title: String (required, 4-100 chars),
  description: String (optional, max 500 chars),
  status: String (enum: pending, completed, deleted),
  completedAt: Date (null unless completed),
  createdAt: Date,
  updatedAt: Date
}
```

## Security Features

- ✅ Password hashing with bcryptjs (10-salt rounds)
- ✅ JWT-based authentication
- ✅ Session-based request validation
- ✅ Input validation with Joi
- ✅ Protected routes requiring authentication
- ✅ CORS-friendly headers
- ✅ Environment variable protection for secrets

## Testing Coverage

The test suite includes:
- User registration and login tests
- Task CRUD operation tests
- Status update and filtering tests
- Authentication middleware tests
- Input validation tests
- Database connection tests

Run tests with coverage:
```bash
npm test
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `DB_URL` | MongoDB connection string | `mongodb://localhost:27017/task-management` |
| `SESSION_SECRET` | Secret key for session encryption | `your-secret-key` |
| `JWT_SECRET` | Secret key for JWT signing | `your-jwt-secret` |

## Troubleshooting

### Database Connection Errors
- Verify MongoDB is running: `mongosh` or check MongoDB Atlas connection
- Check `DB_URL` in `.env` file matches your MongoDB setup
- Ensure network access is allowed if using MongoDB Atlas

### Session Issues
- Clear browser cookies if session state is inconsistent
- Verify `SESSION_SECRET` is set in `.env`
- Check if session cookies are enabled in browser

### Test Failures
- Clear MongoDB Memory Server instances: `npm test -- --clearScreen`
- Ensure port `3001` is not in use by another process
- Check Node.js version compatibility (v14+)

## Development Workflow

1. Make changes to code
2. Server auto-reloads with Nodemon (in dev mode)
3. Run tests to validate changes: `npm test`
4. Check for errors in VS Code Problems panel
5. Commit and push changes

## Contributing

This is an assignment project for AltSchool. For improvements or bug reports, please create an issue or pull request.

## License

ISC

## Author

Oluwasegun Adedeji
