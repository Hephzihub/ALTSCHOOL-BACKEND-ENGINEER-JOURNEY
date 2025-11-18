import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { connectInstance } from './database.mjs';
import { UserModel } from '../auth/auth.model.js';

let database;

beforeAll(async () => {
  database = await connectInstance();
});

afterAll(async () => {
  await database.disconnect();
});

beforeEach(async () => {
  await database.clear();
});

describe('Authentication Routes', () => {
  describe('GET /auth/signup', () => {
    it('should render signup page', async () => {
      const response = await request(app).get('/auth/signup');
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('Create Account');
      expect(response.text).toContain('Sign Up');
    });

    it('should redirect to /task if user is already logged in', async () => {
      // First register and login
      const agent = request.agent(app);
      await agent
        .post('/auth/register')
        .send({
          username: 'testuser',
          password: 'password123',
          confirmPassword: 'password123'
        });

      const response = await agent.get('/auth/signup');
      
      expect(response.status).toBe(302);
      expect(response.header.location).toBe('/task');
    });
  });

  describe('GET /auth/login', () => {
    it('should render login page', async () => {
      const response = await request(app).get('/auth/login');
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('Welcome Back');
      expect(response.text).toContain('Login');
    });

    it('should redirect to /task if user is already logged in', async () => {
      const agent = request.agent(app);
      await agent
        .post('/auth/register')
        .send({
          username: 'testuser',
          password: 'password123',
          confirmPassword: 'password123'
        });

      const response = await agent.get('/auth/login');
      
      expect(response.status).toBe(302);
      expect(response.header.location).toBe('/task');
    });
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'newuser',
          password: 'password123',
          confirmPassword: 'password123'
        });

      expect(response.status).toBe(302);
      expect(response.header.location).toBe('/task');

      const user = await UserModel.findOne({ username: 'newuser' });
      expect(user).toBeTruthy();
      expect(user.username).toBe('newuser');
    });

    it('should fail if username is too short', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'ab',
          password: 'password123',
          confirmPassword: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.text).toContain('must be at least 3 characters');
    });

    it('should fail if username is too long', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'a'.repeat(31),
          password: 'password123',
          confirmPassword: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.text).toContain('must be less than or equal to 30 characters');
    });

    it('should fail if password is too short', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser',
          password: '12345',
          confirmPassword: '12345'
        });

      expect(response.status).toBe(400);
      expect(response.text).toContain('must be at least 6 characters');
    });

    it('should fail if passwords do not match', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser',
          password: 'password123',
          confirmPassword: 'password456'
        });

      expect(response.status).toBe(400);
      expect(response.text).toContain('Passwords must match');
    });

    it('should fail if username contains non-alphanumeric characters', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'test@user',
          password: 'password123',
          confirmPassword: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.text).toContain('must only contain alpha-numeric characters');
    });

    it('should fail if username is missing', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          password: 'password123',
          confirmPassword: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.text).toContain('required');
    });

    it('should fail if username already exists', async () => {
      // Create first user
      await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser',
          password: 'password123',
          confirmPassword: 'password123'
        });

      // Try to create duplicate user
      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser',
          password: 'password456',
          confirmPassword: 'password456'
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should store username in lowercase', async () => {
      await request(app)
        .post('/auth/register')
        .send({
          username: 'TestUser',
          password: 'password123',
          confirmPassword: 'password123'
        });

      const user = await UserModel.findOne({ username: 'testuser' });
      expect(user).toBeTruthy();
      expect(user.username).toBe('testuser');
    });

    it('should hash the password', async () => {
      const password = 'password123';
      await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser',
          password,
          confirmPassword: password
        });

      const user = await UserModel.findOne({ username: 'testuser' }).select('+password');
      expect(user.password).not.toBe(password);
    });

    it('should create session after successful registration', async () => {
      const agent = request.agent(app);
      const response = await agent
        .post('/auth/register')
        .send({
          username: 'testuser',
          password: 'password123',
          confirmPassword: 'password123'
        });

      expect(response.status).toBe(302);
      
      // Try to access protected route
      const taskResponse = await agent.get('/task');
      expect(taskResponse.status).toBe(200);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Create a user for login tests
      await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser',
          password: 'password123',
          confirmPassword: 'password123'
        });
    });

    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'testuser',
          password: 'password123'
        });

      expect(response.status).toBe(302);
      expect(response.header.location).toBe('/task');
    });

    it('should fail with incorrect username', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'wronguser',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.text).toContain('Invalid Credentials');
    });

    it('should fail with incorrect password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.text).toContain('Invalid Credentials');
    });

    it('should be case-insensitive for username', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'TestUser',
          password: 'password123'
        });

      expect(response.status).toBe(302);
      expect(response.header.location).toBe('/task');
    });

    it('should fail if username is missing', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.text).toContain('required');
    });

    it('should fail if password is missing', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'testuser'
        });

      expect(response.status).toBe(400);
      expect(response.text).toContain('required');
    });

    it('should create session after successful login', async () => {
      const agent = request.agent(app);
      const response = await agent
        .post('/auth/login')
        .send({
          username: 'testuser',
          password: 'password123'
        });

      expect(response.status).toBe(302);

      // Try to access protected route
      const taskResponse = await agent.get('/task');
      expect(taskResponse.status).toBe(200);
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout successfully', async () => {
      const agent = request.agent(app);
      
      // First login
      await agent
        .post('/auth/register')
        .send({
          username: 'testuser',
          password: 'password123',
          confirmPassword: 'password123'
        });

      // Then logout
      const response = await agent.post('/auth/logout');

      expect(response.status).toBe(302);
      expect(response.header.location).toBe('/auth/login');
    });

    it('should destroy session after logout', async () => {
      const agent = request.agent(app);
      
      // Login
      await agent
        .post('/auth/register')
        .send({
          username: 'testuser',
          password: 'password123',
          confirmPassword: 'password123'
        });

      // Logout
      await agent.post('/auth/logout');

      // Try to access protected route
      const taskResponse = await agent.get('/task');
      expect(taskResponse.status).toBe(302);
      expect(taskResponse.header.location).toBe('/auth/login');
    });

    it('should work even if not logged in', async () => {
      const response = await request(app).post('/auth/logout');

      expect(response.status).toBe(302);
      expect(response.header.location).toBe('/auth/login');
    });
  });
});

describe('Authentication Middleware', () => {
  describe('Authenticate middleware', () => {
    it('should allow access with valid session', async () => {
      const agent = request.agent(app);
      
      await agent
        .post('/auth/register')
        .send({
          username: 'testuser',
          password: 'password123',
          confirmPassword: 'password123'
        });

      const response = await agent.get('/task');
      expect(response.status).toBe(200);
    });

    it('should redirect to login without session', async () => {
      const response = await request(app).get('/task');
      
      expect(response.status).toBe(302);
      expect(response.header.location).toBe('/auth/login');
    });

    it('should redirect to login with invalid token', async () => {
      const agent = request.agent(app);
      
      // Manually set an invalid session
      await agent
        .get('/task')
        .set('Cookie', ['connect.sid=invalid_session']);

      const response = await agent.get('/task');
      expect(response.status).toBe(302);
      expect(response.header.location).toBe('/auth/login');
    });
  });

  describe('isGuest middleware', () => {
    it('should allow access to login page when not authenticated', async () => {
      const response = await request(app).get('/auth/login');
      expect(response.status).toBe(200);
    });

    it('should redirect to /task when already authenticated', async () => {
      const agent = request.agent(app);
      
      await agent
        .post('/auth/register')
        .send({
          username: 'testuser',
          password: 'password123',
          confirmPassword: 'password123'
        });

      const response = await agent.get('/auth/login');
      expect(response.status).toBe(302);
      expect(response.header.location).toBe('/task');
    });
  });
});

describe('User Model', () => {
  it('should create user with hashed password', async () => {
    const user = await UserModel.create({
      username: 'testuser',
      password: 'password123'
    });

    expect(user.password).not.toBe('password123');
  });

  it('should not rehash password if not modified', async () => {
    const user = await UserModel.create({
      username: 'testuser',
      password: 'password123'
    });

    const originalHash = user.password;
    user.username = 'updateduser';
    await user.save();

    expect(user.password).toBe(originalHash);
  });

  it('should compare passwords correctly', async () => {
    const user = await UserModel.create({
      username: 'testuser',
      password: 'password123'
    });

    const foundUser = await UserModel.findOne({ username: 'testuser' }).select('+password');
    const isMatch = await foundUser.comparePassword('password123');
    const isNotMatch = await foundUser.comparePassword('wrongpassword');

    expect(isMatch).toBe(true);
    expect(isNotMatch).toBe(false);
  });

  it('should enforce unique username constraint', async () => {
    await UserModel.create({
      username: 'testuser',
      password: 'password123'
    });

    await expect(
      UserModel.create({
        username: 'testuser',
        password: 'password456'
      })
    ).rejects.toThrow();
  });

  it('should trim and lowercase username', async () => {
    const user = await UserModel.create({
      username: '  TestUser  ',
      password: 'password123'
    });

    expect(user.username).toBe('testuser');
  });

  it('should enforce minimum username length', async () => {
    await expect(
      UserModel.create({
        username: 'ab',
        password: 'password123'
      })
    ).rejects.toThrow();
  });

  it('should enforce minimum password length', async () => {
    await expect(
      UserModel.create({
        username: 'testuser',
        password: '12345'
      })
    ).rejects.toThrow();
  });

  it('should not select password by default', async () => {
    await UserModel.create({
      username: 'testuser',
      password: 'password123'
    });

    const user = await UserModel.findOne({ username: 'testuser' });
    expect(user.password).toBeUndefined();
  });

  it('should have timestamps', async () => {
    const user = await UserModel.create({
      username: 'testuser',
      password: 'password123'
    });

    expect(user.createdAt).toBeDefined();
    expect(user.updatedAt).toBeDefined();
  });
});