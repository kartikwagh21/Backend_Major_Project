const mongoose = require('mongoose');
const request = require('supertest');
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_repair_service_12345';

const app = require('../server');

// 1x1 transparent PNG buffer
const dummyPngBuffer = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

let mongoServer;
let customerToken, customerId;
let technicianToken, technicianId;
let otherTechToken, otherTechId;
let otherCustomerToken, otherCustomerId;
let createdRequestId;
let assignedRequestId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('Repair Service Management System - API Integration Test Suite', () => {
  describe('1. Authentication & Registration', () => {
    it('should register a customer successfully with role customer', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Alice Customer',
          email: 'alice@example.com',
          password: 'password123',
          phone: '+1-555-0101',
          address: '123 Pine St, City',
          role: 'customer',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.role).toBe('customer');
      customerToken = res.body.data.token;
      customerId = res.body.data.user._id;
    });

    it('should register a technician successfully with specialization', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Bob Technician',
          email: 'bob@example.com',
          password: 'password123',
          phone: '+1-555-0102',
          specialization: 'Air Conditioner (AC)',
          role: 'technician',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.specialization).toBe('Air Conditioner (AC)');
      expect(res.body.data.user.role).toBe('technician');
      technicianToken = res.body.data.token;
      technicianId = res.body.data.user._id;
    });

    it('should register a second technician for authorization tests', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Charlie Other Tech',
          email: 'charlie@example.com',
          password: 'password123',
          phone: '+1-555-0103',
          specialization: 'Refrigerator',
          role: 'technician',
        });

      expect(res.status).toBe(201);
      otherTechToken = res.body.data.token;
      otherTechId = res.body.data.user._id;
    });

    it('should register a second customer for authorization tests', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'David Other Customer',
          email: 'david@example.com',
          password: 'password123',
          phone: '+1-555-0104',
          role: 'customer',
        });

      expect(res.status).toBe(201);
      otherCustomerToken = res.body.data.token;
      otherCustomerId = res.body.data.user._id;
    });

    it('should reject registration with an invalid role', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Hacker User',
          email: 'hacker@example.com',
          password: 'password123',
          phone: '+1-555-9999',
          role: 'administrator',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should login customer with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'alice@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it('should fetch authenticated user profile via GET /api/auth/me', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe('alice@example.com');
    });
  });

  describe('2. Technician Directory & Security', () => {
    it('should allow customers to list technicians with non-sensitive fields only', async () => {
      const res = await request(app)
        .get('/api/technicians')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
      const tech = res.body.data[0];
      expect(tech.name).toBeDefined();
      expect(tech.specialization).toBeDefined();
      expect(tech._id).toBeDefined();
      expect(tech.password).toBeUndefined();
      expect(tech.email).toBeUndefined();
    });

    it('should forbid technicians from accessing the customer-facing technicians list', async () => {
      const res = await request(app)
        .get('/api/technicians')
        .set('Authorization', `Bearer ${technicianToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('3. Repair Request Creation & Multer Memory Storage', () => {
    it('should reject request creation when photo is missing with 400', async () => {
      const res = await request(app)
        .post('/api/requests')
        .set('Authorization', `Bearer ${customerToken}`)
        .field('technician', technicianId)
        .field('applianceType', 'Refrigerator')
        .field('issueDescription', 'Refrigerator is not freezing ice in top compartment.');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/photo/i);
    });

    it('should create repair request with photo buffer stored in MongoDB', async () => {
      const res = await request(app)
        .post('/api/requests')
        .set('Authorization', `Bearer ${customerToken}`)
        .field('technician', technicianId)
        .field('applianceType', 'Air Conditioner (AC)')
        .field('brand', 'Daikin Inverter')
        .field('issueDescription', 'The AC is not cooling properly and making a strange rattling noise.')
        .attach('photo', dummyPngBuffer, 'test-appliance.png');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBeDefined();
      expect(res.body.data.status).toBe('Assigned');
      expect(res.body.data.photoPath).toBe(`/api/requests/${res.body.data._id}/photo`);

      createdRequestId = res.body.data._id;
    });

    it('should create a second repair request for customer cancellation tests', async () => {
      const res = await request(app)
        .post('/api/requests')
        .set('Authorization', `Bearer ${customerToken}`)
        .field('technician', technicianId)
        .field('applianceType', 'Washing Machine')
        .field('brand', 'Bosch')
        .field('issueDescription', 'Front load door is jammed shut with clothes inside.')
        .attach('photo', dummyPngBuffer, 'wm-inspection.png');

      expect(res.status).toBe(201);
      assignedRequestId = res.body.data._id;
    });
  });

  describe('4. Data Isolation & Ownership', () => {
    it('GET /api/requests/my returns only own requests for customer', async () => {
      const res = await request(app)
        .get('/api/requests/my')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
    });

    it('GET /api/requests/my returns 0 requests for another customer', async () => {
      const res = await request(app)
        .get('/api/requests/my')
        .set('Authorization', `Bearer ${otherCustomerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(0);
    });

    it('GET /api/requests/assigned returns only assigned requests for technician', async () => {
      const res = await request(app)
        .get('/api/requests/assigned')
        .set('Authorization', `Bearer ${technicianToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
    });

    it('GET /api/requests/assigned returns 0 requests for unassigned technician', async () => {
      const res = await request(app)
        .get('/api/requests/assigned')
        .set('Authorization', `Bearer ${otherTechToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(0);
    });

    it('GET /api/requests/:id returns 403 Forbidden for unauthorized customer', async () => {
      const res = await request(app)
        .get(`/api/requests/${createdRequestId}`)
        .set('Authorization', `Bearer ${otherCustomerToken}`);

      expect(res.status).toBe(403);
    });

    it('GET /api/requests/:id returns 200 for owner customer', async () => {
      const res = await request(app)
        .get(`/api/requests/${createdRequestId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(createdRequestId);
    });
  });

  describe('5. Secure Photo Streaming Route (GET /api/requests/:id/photo)', () => {
    it('should stream image buffer with correct Content-Type for owner customer', async () => {
      const res = await request(app)
        .get(`/api/requests/${createdRequestId}/photo`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/image/);
      expect(res.body).toBeDefined();
    });

    it('should stream image buffer for assigned technician', async () => {
      const res = await request(app)
        .get(`/api/requests/${createdRequestId}/photo`)
        .set('Authorization', `Bearer ${technicianToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/image/);
    });

    it('should return 403 Forbidden when an unauthorized user attempts to view photo', async () => {
      const res = await request(app)
        .get(`/api/requests/${createdRequestId}/photo`)
        .set('Authorization', `Bearer ${otherCustomerToken}`);

      expect(res.status).toBe(403);
    });

    it('should return 403 Forbidden when an unassigned technician attempts to view photo', async () => {
      const res = await request(app)
        .get(`/api/requests/${createdRequestId}/photo`)
        .set('Authorization', `Bearer ${otherTechToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('6. Customer Cancellation Workflow', () => {
    it('should allow owner customer to cancel request while status is Assigned', async () => {
      const res = await request(app)
        .patch(`/api/requests/${assignedRequestId}/status`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          status: 'Cancelled',
          note: 'Cancelled by customer because appliance started working.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('Cancelled');
      const latestHistory = res.body.data.statusHistory[res.body.data.statusHistory.length - 1];
      expect(latestHistory.status).toBe('Cancelled');
      expect(latestHistory.role).toBe('customer');
    });

    it('should reject customer cancellation on another customer request with 403', async () => {
      const res = await request(app)
        .patch(`/api/requests/${createdRequestId}/status`)
        .set('Authorization', `Bearer ${otherCustomerToken}`)
        .send({ status: 'Cancelled' });

      expect(res.status).toBe(403);
    });
  });

  describe('7. Technician Workflow & State Machine Enforcement', () => {
    it('should return 403 when unassigned technician attempts status update', async () => {
      const res = await request(app)
        .patch(`/api/requests/${createdRequestId}/status`)
        .set('Authorization', `Bearer ${otherTechToken}`)
        .send({ status: 'In Progress' });

      expect(res.status).toBe(403);
    });

    it('should allow assigned technician to progress status from Assigned to In Progress', async () => {
      const res = await request(app)
        .patch(`/api/requests/${createdRequestId}/status`)
        .set('Authorization', `Bearer ${technicianToken}`)
        .send({
          status: 'In Progress',
          note: 'Technician arrived on-site and inspecting appliance.',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('In Progress');
    });

    it('should reject customer cancellation once status is In Progress with 400', async () => {
      const res = await request(app)
        .patch(`/api/requests/${createdRequestId}/status`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ status: 'Cancelled' });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Assigned/i);
    });

    it('should reject invalid backward status transition (In Progress -> Pending) with 400', async () => {
      const res = await request(app)
        .patch(`/api/requests/${createdRequestId}/status`)
        .set('Authorization', `Bearer ${technicianToken}`)
        .send({ status: 'Pending' });

      expect(res.status).toBe(400);
    });

    it('should allow assigned technician to progress status from In Progress to Completed', async () => {
      const res = await request(app)
        .patch(`/api/requests/${createdRequestId}/status`)
        .set('Authorization', `Bearer ${technicianToken}`)
        .send({
          status: 'Completed',
          note: 'Motor replaced and verified complete functionality.',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Completed');
    });

    it('should reject status updates once request is in Completed terminal state with 400', async () => {
      const res = await request(app)
        .patch(`/api/requests/${createdRequestId}/status`)
        .set('Authorization', `Bearer ${technicianToken}`)
        .send({ status: 'In Progress' });

      expect(res.status).toBe(400);
    });
  });
});
