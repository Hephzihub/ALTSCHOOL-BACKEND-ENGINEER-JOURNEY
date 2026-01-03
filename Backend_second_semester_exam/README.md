# Blog API

A comprehensive RESTful API for a blogging platform built with Express.js and MongoDB. This project demonstrates modern backend development practices including authentication, file uploads, rate limiting, and error tracking.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Testing](#testing)
- [Error Handling & Monitoring](#error-handling--monitoring)

## ✨ Features

- **User Authentication**: JWT-based authentication with token blacklist support
- **Post Management**: Create, read, update, and delete blog posts
- **Draft & Publish States**: Posts can be saved as drafts or published
- **Avatar Management**: User profile avatars uploaded via Cloudinary
- **Reading Time Calculation**: Automatic calculation of post reading time
- **Read Count Tracking**: Track the number of times a post has been read
- **Rate Limiting**: API rate limiting (100 requests per 15 minutes per IP)
- **Error Tracking**: Sentry integration for error monitoring
- **File Upload Handling**: Secure file uploads with validation
- **Password Hashing**: Bcrypt-based password hashing
- **Comprehensive Testing**: Unit tests with Vitest and coverage reporting

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js (v5.1.0)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **File Storage**: Cloudinary
- **File Upload**: Multer
- **Password Hashing**: bcryptjs
- **Validation**: Joi
- **Rate Limiting**: express-rate-limit
- **Error Tracking**: Sentry
- **Testing**: Vitest + Supertest
- **Development**: Nodemon

## 📁 Project Structure

```
.
├── config/
│   ├── cloudinary.js       # Cloudinary configuration
│   ├── database.js         # MongoDB connection
│   └── instrument.js       # Sentry instrumentation
├── user/
│   ├── user.model.js       # User schema
│   ├── user.controller.js  # User request handlers
│   ├── user.middleware.js  # Auth & validation middleware
│   ├── user.route.js       # User routes
│   └── user.service.js     # User business logic
├── post/
│   ├── post.model.js       # Post schema
│   ├── post.controller.js  # Post request handlers
│   ├── post.middleware.js  # Validation & upload middleware
│   ├── post.route.js       # Post routes
│   └── post.service.js     # Post business logic
├── utils/
│   ├── jwt.js              # JWT utilities
│   ├── tokenBlacklist.js   # Token blacklist management
│   └── uploadHandler.js    # File upload handling
├── middleware/
│   └── logger.js           # Logging middleware
├── tests/
│   ├── auth.spec.js        # Authentication tests
│   ├── post.spec.js        # Post endpoint tests
│   ├── index.spec.js       # General API tests
│   └── database.js         # Test database setup
├── uploads/
│   ├── avatars/            # User avatar storage
│   └── posts/              # Post image storage
├── app.js                  # Express app configuration
├── index.js                # Server entry point
├── package.json            # Dependencies & scripts
└── README.md               # This file
```

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB database
- Cloudinary account

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Backend_second_semester_exam
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables** (see [Environment Variables](#environment-variables))
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Verify Cloudinary connection** (optional)
   ```bash
   npm run cloudinary:test
   ```

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3001

# Database
DB_URL=mongodb://localhost:27017/blog_db

# Cloudinary (Image Storage)
cloudinary_cloud_name=your_cloud_name
cloudinary_api_key=your_api_key
cloudinary_api_secret=your_api_secret

# JWT
JWT_SECRET=your_jwt_secret_key

# Sentry (Error Tracking) - Optional
SENTRY_DSN=your_sentry_dsn
```

## 🚀 Running the Application

### Development
```bash
npm run dev
```
Runs the server with Nodemon for automatic restart on file changes.

### Production
```bash
npm start
```
Runs the server normally.

### Testing
```bash
npm test
```
Runs all tests with Vitest and generates coverage report.

### Test Watch Mode
```bash
npm run test:watch
```
Runs tests in watch mode for development.

## 📡 API Endpoints

### Base URL
```
http://localhost:3001/api/v1
```

### Authentication Endpoints (`/auth`)

#### Register User
```http
POST /auth/signup
Content-Type: multipart/form-data

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "avatar_url": <file>  // Optional
}

Response: 201 Created
{
  "user": { ... },
  "token": "jwt_token"
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}

Response: 200 OK
{
  "user": { ... },
  "token": "jwt_token"
}
```

#### Update Avatar
```http
PATCH /auth/user/avatar
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "avatar_url": <file>
}

Response: 200 OK
{
  "user": { ... }
}
```

### Post Endpoints (`/posts`)

#### Get All Published Posts
```http
GET /posts
Query Parameters:
  - page: number (pagination)
  - limit: number (items per page)

Response: 200 OK
{
  "posts": [
    {
      "_id": "...",
      "title": "Post Title",
      "description": "Post description",
      "author_id": "...",
      "state": "published",
      "read_count": 5,
      "reading_time": 2,
      "tags": ["tag1", "tag2"],
      "image_url": "...",
      "body": "Post content...",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 10
}
```

#### Get Single Post
```http
GET /posts/:id

Response: 200 OK
{
  "post": { ... }
}
```

#### Get User's Posts
```http
GET /posts/user/me
Authorization: Bearer <token>

Response: 200 OK
{
  "posts": [...]
}
```

#### Create Post
```http
POST /posts
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "title": "Post Title",
  "description": "Post description",
  "body": "Post content...",
  "tags": ["tag1", "tag2"],
  "image_url": <file>  // Optional
}

Response: 201 Created
{
  "post": { ... }
}
```

#### Update Post
```http
PATCH /posts/:id
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "title": "Updated Title",
  "description": "Updated description",
  "body": "Updated content...",
  "tags": ["tag1"],
  "image_url": <file>  // Optional
}

Response: 200 OK
{
  "post": { ... }
}
```

#### Publish Post
```http
PATCH /posts/:id/publish
Authorization: Bearer <token>

Response: 200 OK
{
  "post": { 
    ...
    "state": "published"
  }
}
```

#### Delete Post
```http
DELETE /posts/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Post deleted successfully"
}
```

## 🔐 Authentication

The API uses **JWT (JSON Web Tokens)** for authentication.

### How It Works

1. User registers or logs in
2. Server returns a JWT token
3. Client includes token in subsequent requests via `Authorization: Bearer <token>` header
4. Server validates token and processes request
5. Upon logout, token is added to blacklist

### Protected Routes

The following routes require authentication:
- `PATCH /auth/user/avatar` - Update user avatar
- `POST /posts` - Create a post
- `GET /posts/user/me` - Get user's posts
- `PATCH /posts/:id` - Update a post
- `PATCH /posts/:id/publish` - Publish a post
- `DELETE /posts/:id` - Delete a post

### Token Blacklist

Tokens are blacklisted on logout and during token refresh to prevent reuse of expired or revoked tokens. The blacklist is stored in Redis for performance.

## 🧪 Testing

This project includes comprehensive unit and integration tests using **Vitest** and **Supertest**.

### Test Files
- `tests/auth.spec.js` - Authentication endpoint tests
- `tests/post.spec.js` - Post CRUD operation tests
- `tests/index.spec.js` - General API tests

### Run Tests
```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# View coverage report
# Coverage report is generated in the `coverage/` directory
```

## 📊 Error Handling & Monitoring

### Sentry Integration

The application is configured with Sentry for real-time error tracking and monitoring:

- Automatic error capture and reporting
- Stack traces and breadcrumbs
- Performance monitoring
- Custom error context

### Error Response Format

All errors follow a consistent format:

```json
{
  "error": "Error message",
  "statusCode": 400,
  "details": "Additional error details"
}
```

### Rate Limiting

- **Limit**: 100 requests per IP address
- **Window**: 15 minutes
- **Response**: 429 Too Many Requests when limit exceeded

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the LICENSE file for details.


## Author

Oluwasegun Adedeji


## 📞 Support

For issues or questions, please create an issue in the repository or contact the development team.

---

**Last Updated**: January 2024
