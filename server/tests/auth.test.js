const request = require('supertest');
const app = require('../app');
const db = require('./db');
const User = require('../models/User');

// Jest hook: runs before all tests
beforeAll(async () => await db.connect());

// Jest hook: runs after each test
afterEach(async () => await db.clear());

// Jest hook: runs after all tests
afterAll(async () => await db.close());

describe('Auth Endpoints', () => {
  it('should register a new user', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      firstName: 'Test',
      lastName: 'Buyer',
      username: 'testbuyer',
      email: 'buyer@example.com',
      phoneNumber: '1234567890',
      password: 'Password@123',
    });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('requiresOtp');
    expect(res.body.requiresOtp).toBe(true);
  });

  it('should login an existing user', async () => {
    // First create a user
    await request(app).post('/api/auth/signup').send({
      firstName: 'Login',
      lastName: 'User',
      username: 'loginuser',
      phoneNumber: '5555555555',
      email: 'login@example.com',
      password: 'Password@123',
    });

    // Manually verify user phone to allow login
    await User.findOneAndUpdate({ email: 'login@example.com' }, { isPhoneVerified: true });

    const res = await request(app).post('/api/auth/login').send({
      email: 'login@example.com',
      password: 'Password@123',
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should not login with invalid password', async () => {
    await request(app).post('/api/auth/signup').send({
      firstName: 'Protect',
      lastName: 'User',
      username: 'protectuser',
      phoneNumber: '9999999999',
      email: 'protect@example.com',
      password: 'Password@123',
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'protect@example.com',
      password: 'wrongpassword',
    });
    expect(res.statusCode).toEqual(401);
  });
});
