const request = require('supertest');
const app = require('../app');
const db = require('./db');

beforeAll(async () => await db.connect());
afterEach(async () => await db.clear());
afterAll(async () => await db.close());

describe('Product Endpoints', () => {
  let adminToken;
  let buyerToken;

  beforeEach(async () => {
    // Create Admin (Hack: Signup as buyer -> Elevate to Admin in DB)
    const User = require('../models/User'); // Import User model

    await request(app).post('/api/auth/signup').send({
      firstName: 'Admin',
      lastName: 'User',
      username: 'adminuser',
      phoneNumber: '0000000000',
      email: 'admin@example.com',
      password: 'Password@123',
    });
    
    await User.findOneAndUpdate({ email: 'admin@example.com' }, { role: 'admin' });

    // Login to get token
    const adminLogin = await request(app).post('/api/auth/login').send({
      email: 'admin@example.com',
      password: 'Password@123'
    });
    adminToken = adminLogin.body.token;

    // Create Buyer
    const buyerRes = await request(app).post('/api/auth/signup').send({
      firstName: 'Buyer',
      lastName: 'User',
      username: 'buyeruser',
      phoneNumber: '1111111111',
      email: 'buyer@example.com',
      password: 'Password@123',
    });
    // Need to verify mock buyer to get token? No, signup doesn't return token anymore.
    // Need to login as buyer.
    await User.findOneAndUpdate({ email: 'buyer@example.com' }, { isPhoneVerified: true });
    
    const buyerLogin = await request(app).post('/api/auth/login').send({
        email: 'buyer@example.com',
        password: 'Password@123'
    });
    buyerToken = buyerLogin.body.token;
  });

  it('should allow admin to create a product', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Product',
        image: '/images/sample.jpg',
        description: 'Test Description',
        price: 100,
        countInStock: 10,
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.name).toEqual('Test Product');
  });

  it('should NOT allow buyer to create a product', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        name: 'Hacker Product',
        image: '/images/sample.jpg',
        description: 'Test Description',
        price: 100,
        countInStock: 10,
      });

    expect(res.statusCode).toEqual(401);
  });

  it('should update a product', async () => {
    // 1. Create product as admin
    const createRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Original Name',
        image: '/img.jpg',
        description: 'Desc',
        price: 50,
        countInStock: 5,
      });

    const productId = createRes.body._id;

    // 2. Update as admin
    const updateRes = await request(app)
      .put(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Updated Name',
      });

    expect(updateRes.statusCode).toEqual(200);
    expect(updateRes.body.name).toEqual('Updated Name');
  });

  it('should delete a product', async () => {
    // 1. Create
    const createRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'To Delete',
        image: '/img.jpg',
        description: 'Desc',
        price: 50,
        countInStock: 5,
      });

    const productId = createRes.body._id;

    // 2. Delete
    const deleteRes = await request(app)
      .delete(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(deleteRes.statusCode).toEqual(200);

    // 3. Verify it's gone
    const fetchRes = await request(app).get(`/api/products/${productId}`);
    expect(fetchRes.statusCode).toEqual(404);
  });
});
