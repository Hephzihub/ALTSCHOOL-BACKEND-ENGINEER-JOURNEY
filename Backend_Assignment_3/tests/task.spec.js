import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { connectInstance } from './database.mjs';
import { UserModel } from '../auth/auth.model.js';
import { TaskModel } from '../tasks/task.model.js';

let database;
let authenticatedAgent;
let userId;

beforeAll(async () => {
  database = await connectInstance();
});

afterAll(async () => {
  await database.disconnect();
});

beforeEach(async () => {
  await database.clear();
  
  // Create authenticated agent for each test
  authenticatedAgent = request.agent(app);
  await authenticatedAgent
    .post('/auth/register')
    .send({
      username: 'testuser',
      password: 'password123',
      confirmPassword: 'password123'
    });
  
  const user = await UserModel.findOne({ username: 'testuser' });
  userId = user._id;
});

describe('Task Routes', () => {
  describe('GET /task', () => {
    it('should render task page when authenticated', async () => {
      const response = await authenticatedAgent.get('/task');
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('My Todo List');
      expect(response.text).toContain('Create New Task');
    });

    it('should redirect to login when not authenticated', async () => {
      const response = await request(app).get('/task');
      
      expect(response.status).toBe(302);
      expect(response.header.location).toBe('/auth/login');
    });

    it('should display user statistics', async () => {
      const response = await authenticatedAgent.get('/task');
      
      expect(response.text).toContain('Total Tasks');
      expect(response.text).toContain('Pending');
      expect(response.text).toContain('Completed');
    });

    it('should show empty state when no tasks', async () => {
      const response = await authenticatedAgent.get('/task');
      
      expect(response.text).toContain('No tasks found');
    });

    it('should display all tasks by default', async () => {
      await TaskModel.create({
        title: 'Task 1',
        description: 'Description 1',
        userId
      });
      await TaskModel.create({
        title: 'Task 2',
        status: 'completed',
        userId
      });

      const response = await authenticatedAgent.get('/task');
      
      expect(response.text).toContain('Task 1');
      expect(response.text).toContain('Task 2');
    });

    it('should filter pending tasks', async () => {
      await TaskModel.create({
        title: 'Pending Task',
        status: 'pending',
        userId
      });
      await TaskModel.create({
        title: 'Completed Task',
        status: 'completed',
        userId
      });

      const response = await authenticatedAgent.get('/task?filter=pending');
      
      expect(response.text).toContain('Pending Task');
      expect(response.text).not.toContain('Completed Task');
    });

    it('should filter completed tasks', async () => {
      await TaskModel.create({
        title: 'Pending Task',
        status: 'pending',
        userId
      });
      await TaskModel.create({
        title: 'Completed Task',
        status: 'completed',
        userId
      });

      const response = await authenticatedAgent.get('/task?filter=completed');
      
      expect(response.text).not.toContain('Pending Task');
      expect(response.text).toContain('Completed Task');
    });

    it('should only show tasks for authenticated user', async () => {
      const otherUser = await UserModel.create({
        username: 'otheruser',
        password: 'password123'
      });

      await TaskModel.create({
        title: 'My Task',
        userId
      });
      await TaskModel.create({
        title: 'Other User Task',
        userId: otherUser._id
      });

      const response = await authenticatedAgent.get('/task');
      
      expect(response.text).toContain('My Task');
      expect(response.text).not.toContain('Other User Task');
    });

    it('should not show deleted tasks', async () => {
      await TaskModel.create({
        title: 'Active Task',
        userId
      });
      await TaskModel.create({
        title: 'Deleted Task',
        status: 'deleted',
        userId
      });

      const response = await authenticatedAgent.get('/task');
      
      expect(response.text).toContain('Active Task');
      expect(response.text).not.toContain('Deleted Task');
    });

    it('should display correct statistics', async () => {
      await TaskModel.create({ title: 'Task 1', status: 'pending', userId });
      await TaskModel.create({ title: 'Task 2', status: 'pending', userId });
      await TaskModel.create({ title: 'Task 3', status: 'completed', userId });
      await TaskModel.create({ title: 'Task 4', status: 'deleted', userId });

      const response = await authenticatedAgent.get('/task');
      
      expect(response.text).toMatch(/Total Tasks.*3/s);
      expect(response.text).toMatch(/Pending.*2/s);
      expect(response.text).toMatch(/Completed.*1/s);
    });

    it('should display username in header', async () => {
      const response = await authenticatedAgent.get('/task');
      
      expect(response.text).toContain('testuser');
    });
  });

  describe('POST /task', () => {
    it('should create a new task successfully', async () => {
      const response = await authenticatedAgent
        .post('/task')
        .send({
          title: 'New Task',
          description: 'Task description'
        });

      expect(response.status).toBe(302);
      expect(response.header.location).toContain('/task?success=');

      const task = await TaskModel.findOne({ title: 'New Task' });
      expect(task).toBeTruthy();
      expect(task.description).toBe('Task description');
      expect(task.status).toBe('pending');
      expect(task.userId.toString()).toBe(userId.toString());
    });

    it('should create task without description', async () => {
      const response = await authenticatedAgent
        .post('/task')
        .send({
          title: 'New Task'
        });

      expect(response.status).toBe(302);

      const task = await TaskModel.findOne({ title: 'New Task' });
      expect(task).toBeTruthy();
      expect(task.description).toBe('');
    });

    it('should fail if title is missing', async () => {
      const response = await authenticatedAgent
        .post('/task')
        .send({
          description: 'Description only'
        });

      expect(response.status).toBe(400);
      
      const tasks = await TaskModel.find({ userId });
      expect(tasks.length).toBe(0);
    });

    it('should fail if title is too short', async () => {
      const response = await authenticatedAgent
        .post('/task')
        .send({
          title: 'abc'
        });

      expect(response.status).toBe(400);
      
      const tasks = await TaskModel.find({ userId });
      expect(tasks.length).toBe(0);
    });

    it('should fail if title is too long', async () => {
      const response = await authenticatedAgent
        .post('/task')
        .send({
          title: 'a'.repeat(101)
        });

      expect(response.status).toBe(400);
      
      const tasks = await TaskModel.find({ userId });
      expect(tasks.length).toBe(0);
    });

    it('should fail if description is too long', async () => {
      const response = await authenticatedAgent
        .post('/task')
        .send({
          title: 'Valid Title',
          description: 'a'.repeat(501)
        });

      expect(response.status).toBe(400);
      
      const tasks = await TaskModel.find({ userId });
      expect(tasks.length).toBe(0);
    });

    it('should redirect to login if not authenticated', async () => {
      const response = await request(app)
        .post('/task')
        .send({
          title: 'New Task'
        });

      expect(response.status).toBe(302);
      expect(response.header.location).toBe('/auth/login');
    });

    it('should trim task title', async () => {
      await authenticatedAgent
        .post('/task')
        .send({
          title: '  Trimmed Task  '
        });

      const task = await TaskModel.findOne({ userId });
      expect(task.title).toBe('Trimmed Task');
    });
  });

  describe('POST /task/updateTask/:id/completed', () => {
    it('should mark task as completed', async () => {
      const task = await TaskModel.create({
        title: 'Task to Complete',
        userId
      });

      const response = await authenticatedAgent
        .post(`/task/updateTask/${task._id}/completed`);

      expect(response.status).toBe(302);
      expect(response.header.location).toContain('/task?success=');

      const updatedTask = await TaskModel.findById(task._id);
      expect(updatedTask.status).toBe('completed');
      expect(updatedTask.completedAt).toBeTruthy();
    });

    it('should fail if task already completed', async () => {
      const task = await TaskModel.create({
        title: 'Already Completed',
        status: 'completed',
        completedAt: new Date(),
        userId
      });

      const response = await authenticatedAgent
        .post(`/task/updateTask/${task._id}/completed`);

      expect(response.status).toBe(400);
    });

    it('should fail if task does not exist', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await authenticatedAgent
        .post(`/task/updateTask/${fakeId}/completed`);

      expect(response.status).toBe(404);
    });

    it('should fail if task belongs to another user', async () => {
      const otherUser = await UserModel.create({
        username: 'otheruser',
        password: 'password123'
      });
      
      const task = await TaskModel.create({
        title: 'Other User Task',
        userId: otherUser._id
      });

      const response = await authenticatedAgent
        .post(`/task/updateTask/${task._id}/completed`);

      expect(response.status).toBe(404);
      
      const unchangedTask = await TaskModel.findById(task._id);
      expect(unchangedTask.status).toBe('pending');
    });

    it('should redirect to login if not authenticated', async () => {
      const task = await TaskModel.create({
        title: 'Task',
        userId
      });

      const response = await request(app)
        .post(`/task/updateTask/${task._id}/completed`);

      expect(response.status).toBe(302);
      expect(response.header.location).toBe('/auth/login');
    });
  });

  describe('POST /task/updateTask/:id/undo', () => {
    it('should undo completed task', async () => {
      const task = await TaskModel.create({
        title: 'Completed Task',
        status: 'completed',
        completedAt: new Date(),
        userId
      });

      const response = await authenticatedAgent
        .post(`/task/updateTask/${task._id}/undo`);

      expect(response.status).toBe(302);

      const updatedTask = await TaskModel.findById(task._id);
      expect(updatedTask.status).toBe('pending');
      expect(updatedTask.completedAt).toBeNull();
    });

    it('should work on pending task', async () => {
      const task = await TaskModel.create({
        title: 'Pending Task',
        userId
      });

      const response = await authenticatedAgent
        .post(`/task/updateTask/${task._id}/undo`);

      expect(response.status).toBe(302);

      const updatedTask = await TaskModel.findById(task._id);
      expect(updatedTask.status).toBe('pending');
    });

    it('should fail if task does not exist', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await authenticatedAgent
        .post(`/task/updateTask/${fakeId}/undo`);

      expect(response.status).toBe(404);
    });

    it('should fail if task belongs to another user', async () => {
      const otherUser = await UserModel.create({
        username: 'otheruser',
        password: 'password123'
      });
      
      const task = await TaskModel.create({
        title: 'Other User Task',
        status: 'completed',
        userId: otherUser._id
      });

      const response = await authenticatedAgent
        .post(`/task/updateTask/${task._id}/undo`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /task/delete/:id', () => {
    it('should mark task as deleted', async () => {
      const task = await TaskModel.create({
        title: 'Task to Delete',
        userId
      });

      const response = await authenticatedAgent
        .post(`/task/delete/${task._id}`);

      expect(response.status).toBe(302);

      const deletedTask = await TaskModel.findById(task._id);
      expect(deletedTask.status).toBe('deleted');
      expect(deletedTask.deletedAt).toBeTruthy();
    });

    it('should delete completed task', async () => {
      const task = await TaskModel.create({
        title: 'Completed Task',
        status: 'completed',
        userId
      });

      const response = await authenticatedAgent
        .post(`/task/delete/${task._id}`);

      expect(response.status).toBe(302);

      const deletedTask = await TaskModel.findById(task._id);
      expect(deletedTask.status).toBe('deleted');
    });

    it('should fail if task does not exist', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await authenticatedAgent
        .post(`/task/delete/${fakeId}`);

      expect(response.status).toBe(404);
    });

    it('should fail if task belongs to another user', async () => {
      const otherUser = await UserModel.create({
        username: 'otheruser',
        password: 'password123'
      });
      
      const task = await TaskModel.create({
        title: 'Other User Task',
        userId: otherUser._id
      });

      const response = await authenticatedAgent
        .post(`/task/delete/${task._id}`);

      expect(response.status).toBe(404);
      
      const unchangedTask = await TaskModel.findById(task._id);
      expect(unchangedTask.status).toBe('pending');
    });

    it('should redirect to login if not authenticated', async () => {
      const task = await TaskModel.create({
        title: 'Task',
        userId
      });

      const response = await request(app)
        .post(`/task/delete/${task._id}`);

      expect(response.status).toBe(302);
      expect(response.header.location).toBe('/auth/login');
    });
  });
});

describe('Task Model', () => {
  describe('Task Creation', () => {
    it('should create task with required fields', async () => {
      const task = await TaskModel.create({
        title: 'Test Task',
        userId
      });

      expect(task.title).toBe('Test Task');
      expect(task.userId.toString()).toBe(userId.toString());
      expect(task.status).toBe('pending');
      expect(task.description).toBe('');
    });

    it('should create task with description', async () => {
      const task = await TaskModel.create({
        title: 'Test Task',
        description: 'Task description',
        userId
      });

      expect(task.description).toBe('Task description');
    });

    it('should fail if title is missing', async () => {
      await expect(
        TaskModel.create({
          userId
        })
      ).rejects.toThrow();
    });

    it('should fail if userId is missing', async () => {
      await expect(
        TaskModel.create({
          title: 'Test Task'
        })
      ).rejects.toThrow();
    });

    it('should fail if title is too short', async () => {
      await expect(
        TaskModel.create({
          title: 'abc',
          userId
        })
      ).rejects.toThrow();
    });

    it('should fail if title is too long', async () => {
      await expect(
        TaskModel.create({
          title: 'a'.repeat(101),
          userId
        })
      ).rejects.toThrow();
    });

    it('should fail if description is too long', async () => {
      await expect(
        TaskModel.create({
          title: 'Test Task',
          description: 'a'.repeat(501),
          userId
        })
      ).rejects.toThrow();
    });

    it('should trim title', async () => {
      const task = await TaskModel.create({
        title: '  Test Task  ',
        userId
      });

      expect(task.title).toBe('Test Task');
    });

    it('should have timestamps', async () => {
      const task = await TaskModel.create({
        title: 'Test Task',
        userId
      });

      expect(task.createdAt).toBeDefined();
      expect(task.updatedAt).toBeDefined();
    });

    it('should have null completedAt and deletedAt initially', async () => {
      const task = await TaskModel.create({
        title: 'Test Task',
        userId
      });

      expect(task.completedAt).toBeNull();
      expect(task.deletedAt).toBeNull();
    });
  });

  describe('Task Methods', () => {
    it('should mark task as completed', async () => {
      const task = await TaskModel.create({
        title: 'Test Task',
        userId
      });

      await task.markAsCompleted();

      expect(task.status).toBe('completed');
      expect(task.completedAt).toBeTruthy();
      expect(task.completedAt).toBeInstanceOf(Date);
    });

    it('should mark task as deleted', async () => {
      const task = await TaskModel.create({
        title: 'Test Task',
        userId
      });

      await task.markAsDeleted();

      expect(task.status).toBe('deleted');
      expect(task.deletedAt).toBeTruthy();
      expect(task.deletedAt).toBeInstanceOf(Date);
    });

    it('should undo completion', async () => {
      const task = await TaskModel.create({
        title: 'Test Task',
        status: 'completed',
        completedAt: new Date(),
        userId
      });

      await task.undoCompletion();

      expect(task.status).toBe('pending');
      expect(task.completedAt).toBeNull();
    });

    it('should persist changes after method calls', async () => {
      const task = await TaskModel.create({
        title: 'Test Task',
        userId
      });

      await task.markAsCompleted();
      
      const foundTask = await TaskModel.findById(task._id);
      expect(foundTask.status).toBe('completed');
      expect(foundTask.completedAt).toBeTruthy();
    });
  });

  describe('Task Static Methods', () => {
    beforeEach(async () => {
      await TaskModel.create({ title: 'Pending 1', status: 'pending', userId });
      await TaskModel.create({ title: 'Pending 2', status: 'pending', userId });
      await TaskModel.create({ title: 'Completed 1', status: 'completed', userId });
      await TaskModel.create({ title: 'Deleted 1', status: 'deleted', userId });
    });

    it('should get all non-deleted tasks', async () => {
      const tasks = await TaskModel.getTasksByStatus(userId, 'all');
      
      expect(tasks.length).toBe(3);
      expect(tasks.some(t => t.title === 'Deleted 1')).toBe(false);
    });

    it('should get pending tasks only', async () => {
      const tasks = await TaskModel.getTasksByStatus(userId, 'pending');
      
      expect(tasks.length).toBe(2);
      expect(tasks.every(t => t.status === 'pending')).toBe(true);
    });

    it('should get completed tasks only', async () => {
      const tasks = await TaskModel.getTasksByStatus(userId, 'completed');
      
      expect(tasks.length).toBe(1);
      expect(tasks[0].status).toBe('completed');
    });

    it('should sort tasks by creation date (newest first)', async () => {
      const tasks = await TaskModel.getTasksByStatus(userId, 'all');
      
      for (let i = 0; i < tasks.length - 1; i++) {
        expect(tasks[i].createdAt >= tasks[i + 1].createdAt).toBe(true);
      }
    });

    it('should calculate correct task statistics', async () => {
      const stats = await TaskModel.getTaskStats(userId);
      
      expect(stats.total).toBe(3);
      expect(stats.pending).toBe(2);
      expect(stats.completed).toBe(1);
    });

    it('should not include deleted tasks in statistics', async () => {
      const stats = await TaskModel.getTaskStats(userId);
      
      expect(stats.total).toBe(3);
    });

    it('should return empty statistics for user with no tasks', async () => {
      const newUser = await UserModel.create({
        username: 'newuser',
        password: 'password123'
      });

      const stats = await TaskModel.getTaskStats(newUser._id);
      
      expect(stats.total).toBe(0);
      expect(stats.pending).toBe(0);
      expect(stats.completed).toBe(0);
    });

    it('should only return tasks for specific user', async () => {
      const otherUser = await UserModel.create({
        username: 'otheruser',
        password: 'password123'
      });
      
      await TaskModel.create({
        title: 'Other User Task',
        userId: otherUser._id
      });

      const tasks = await TaskModel.getTasksByStatus(userId, 'all');
      const stats = await TaskModel.getTaskStats(userId);
      
      expect(tasks.length).toBe(3);
      expect(stats.total).toBe(3);
    });
  });

  describe('Task Status Validation', () => {
    it('should accept valid status values', async () => {
      const pending = await TaskModel.create({
        title: 'Pending',
        status: 'pending',
        userId
      });
      expect(pending.status).toBe('pending');

      const completed = await TaskModel.create({
        title: 'Completed',
        status: 'completed',
        userId
      });
      expect(completed.status).toBe('completed');

      const deleted = await TaskModel.create({
        title: 'Deleted',
        status: 'deleted',
        userId
      });
      expect(deleted.status).toBe('deleted');
    });

    it('should reject invalid status values', async () => {
      await expect(
        TaskModel.create({
          title: 'Invalid Status',
          status: 'invalid',
          userId
        })
      ).rejects.toThrow();
    });
  });
});