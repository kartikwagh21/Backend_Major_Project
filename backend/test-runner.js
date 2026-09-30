const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_repair_service_12345';

const app = require('./server');

// 1x1 transparent PNG buffer
const dummyPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

let mongoServer;

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 Starting Automated Backend Integration & Workflow Tests');
  console.log('======================================================\n');

  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  console.log('✅ In-memory MongoDB started and connected successfully.\n');

  let customerToken = '';
  let customerId = '';
  let technicianToken = '';
  let technicianId = '';
  let otherTechToken = '';
  let otherCustomerId = '';
  let otherCustomerToken = '';
  let createdRequestId = '';
  let cancelTestRequestId = '';

  try {
    // 1. Register Customer
    console.log('Test 1: Register Customer...');
    const regCustRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Alice Customer',
        email: 'alice@example.com',
        password: 'password123',
        phone: '+1-555-0101',
        address: '123 Pine St, City',
        role: 'customer',
      });
    if (regCustRes.status === 201 && regCustRes.body.success) {
      customerToken = regCustRes.body.data.token;
      customerId = regCustRes.body.data.user._id;
      console.log('  PASSED: Customer registered with token and customerId:', customerId);
    } else {
      throw new Error(`Register customer failed: ${JSON.stringify(regCustRes.body)}`);
    }

    // 2. Register Technician
    console.log('Test 2: Register Technician...');
    const regTechRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Bob Technician',
        email: 'bob@example.com',
        password: 'password123',
        phone: '+1-555-0102',
        specialization: 'Air Conditioner (AC)',
        role: 'technician',
      });
    if (regTechRes.status === 201 && regTechRes.body.success) {
      technicianToken = regTechRes.body.data.token;
      technicianId = regTechRes.body.data.user._id;
      console.log('  PASSED: Technician registered with specialization:', regTechRes.body.data.user.specialization);
    } else {
      throw new Error(`Register technician failed: ${JSON.stringify(regTechRes.body)}`);
    }

    // 3. Register Other Technician (for 403 test)
    console.log('Test 3: Register Other Technician...');
    const regOtherTechRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Charlie Other Tech',
        email: 'charlie@example.com',
        password: 'password123',
        phone: '+1-555-0103',
        specialization: 'Refrigerator',
        role: 'technician',
      });
    otherTechToken = regOtherTechRes.body.data.token;
    console.log('  PASSED: Other technician registered.');

    // 4. Register Other Customer (for 403 test)
    console.log('Test 4: Register Other Customer...');
    const regOtherCustRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'David Other Customer',
        email: 'david@example.com',
        password: 'password123',
        phone: '+1-555-0104',
        role: 'customer',
      });
    otherCustomerToken = regOtherCustRes.body.data.token;
    otherCustomerId = regOtherCustRes.body.data.user._id;
    console.log('  PASSED: Other customer registered.');

    // 5. Login Verification
    console.log('Test 5: Login verification...');
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'alice@example.com',
        password: 'password123',
      });
    if (loginRes.status === 200 && loginRes.body.data.token) {
      console.log('  PASSED: Customer login successful.');
    } else {
      throw new Error('Login failed');
    }

    // 6. List Technicians (Customer only, non-sensitive fields)
    console.log('Test 6: Customer fetches technicians list...');
    const listTechsRes = await request(app)
      .get('/api/technicians')
      .set('Authorization', `Bearer ${customerToken}`);
    if (listTechsRes.status === 200 && listTechsRes.body.data.length >= 2) {
      const tech = listTechsRes.body.data[0];
      if (tech.name && tech.specialization && tech._id && !tech.password && !tech.email) {
        console.log('  PASSED: Non-sensitive technician list returned.');
      } else {
        throw new Error('Sensitive fields leaked in /api/technicians');
      }
    } else {
      throw new Error('List technicians failed');
    }

    // 7. Negative Test: Technician cannot access customer technician list
    console.log('Test 7: Technician attempts GET /api/technicians (Expect 403)...');
    const forbiddenTechsRes = await request(app)
      .get('/api/technicians')
      .set('Authorization', `Bearer ${technicianToken}`);
    if (forbiddenTechsRes.status === 403) {
      console.log('  PASSED: Received expected HTTP 403 Forbidden for technician.');
    } else {
      throw new Error(`Expected 403, got ${forbiddenTechsRes.status}`);
    }

    // 8. Negative Test: Missing photo on request creation -> HTTP 400
    console.log('Test 8: Negative test - Create request without photo (Expect 400)...');
    const missingPhotoRes = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${customerToken}`)
      .field('technician', technicianId)
      .field('applianceType', 'Refrigerator')
      .field('issueDescription', 'Refrigerator is not freezing ice in the top compartment.');
    if (missingPhotoRes.status === 400) {
      console.log('  PASSED: Received expected HTTP 400 for missing photo:', missingPhotoRes.body.message);
    } else {
      throw new Error(`Expected 400 for missing photo, got ${missingPhotoRes.status}`);
    }

    // 9. Create Repair Request with Photo (Multer memory buffer -> MongoDB)
    console.log('Test 9: Customer creates repair request with photo buffer...');
    const createReqRes = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${customerToken}`)
      .field('technician', technicianId)
      .field('applianceType', 'Air Conditioner (AC)')
      .field('brand', 'Daikin Inverter')
      .field('issueDescription', 'The AC is not cooling properly and making a strange rattling noise.')
      .attach('photo', dummyPng, 'test-appliance.png');

    if (createReqRes.status === 201 && createReqRes.body.success) {
      createdRequestId = createReqRes.body.data._id;
      const data = createReqRes.body.data;
      console.log('  PASSED: Repair request created with photo in MongoDB.');
      console.log('    - Request ID:', createdRequestId);
      console.log('    - photoPath API endpoint:', data.photoPath);
    } else {
      throw new Error(`Create repair request failed: ${JSON.stringify(createReqRes.body)}`);
    }

    // 10. Create second request for customer cancel test
    const createReq2Res = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${customerToken}`)
      .field('technician', technicianId)
      .field('applianceType', 'Microwave')
      .field('brand', 'Samsung')
      .field('issueDescription', 'Microwave display is blank and not powering on.')
      .attach('photo', dummyPng, 'microwave.png');
    cancelTestRequestId = createReq2Res.body.data._id;

    // 11. Customer views own requests
    console.log('Test 11: Customer views own requests (/api/requests/my)...');
    const myReqsRes = await request(app)
      .get('/api/requests/my')
      .set('Authorization', `Bearer ${customerToken}`);
    if (myReqsRes.status === 200 && myReqsRes.body.data.length === 2) {
      console.log('  PASSED: Customer sees exactly 2 own requests.');
    } else {
      throw new Error('Customer my requests test failed');
    }

    // 12. Other customer views own requests -> 0
    console.log('Test 12: Other customer views own requests (Isolation test)...');
    const otherCustReqsRes = await request(app)
      .get('/api/requests/my')
      .set('Authorization', `Bearer ${otherCustomerToken}`);
    if (otherCustReqsRes.status === 200 && otherCustReqsRes.body.data.length === 0) {
      console.log('  PASSED: Other customer sees 0 requests (Isolation verified).');
    } else {
      throw new Error('Customer isolation failed');
    }

    // 13. Assigned technician views assigned requests
    console.log('Test 13: Assigned technician views assigned requests...');
    const assignedReqsRes = await request(app)
      .get('/api/requests/assigned')
      .set('Authorization', `Bearer ${technicianToken}`);
    if (assignedReqsRes.status === 200 && assignedReqsRes.body.data.length === 2) {
      console.log('  PASSED: Assigned technician sees 2 requests.');
    } else {
      throw new Error('Technician assigned requests test failed');
    }

    // 14. Other technician views assigned requests -> 0
    console.log('Test 14: Other technician views assigned requests (Isolation test)...');
    const otherTechAssignedRes = await request(app)
      .get('/api/requests/assigned')
      .set('Authorization', `Bearer ${otherTechToken}`);
    if (otherTechAssignedRes.status === 200 && otherTechAssignedRes.body.data.length === 0) {
      console.log('  PASSED: Other technician sees 0 requests.');
    } else {
      throw new Error('Technician isolation failed');
    }

    // 15. Photo streaming test: Owner customer gets photo
    console.log('Test 15: Owner customer streams photo (GET /api/requests/:id/photo)...');
    const photoCustRes = await request(app)
      .get(`/api/requests/${createdRequestId}/photo`)
      .set('Authorization', `Bearer ${customerToken}`);
    if (photoCustRes.status === 200 && photoCustRes.headers['content-type'].includes('image')) {
      console.log('  PASSED: Photo streamed successfully to owner customer.');
    } else {
      throw new Error(`Customer photo stream failed, status: ${photoCustRes.status}`);
    }

    // 16. Photo streaming test: Assigned technician gets photo
    console.log('Test 16: Assigned technician streams photo (GET /api/requests/:id/photo)...');
    const photoTechRes = await request(app)
      .get(`/api/requests/${createdRequestId}/photo`)
      .set('Authorization', `Bearer ${technicianToken}`);
    if (photoTechRes.status === 200 && photoTechRes.headers['content-type'].includes('image')) {
      console.log('  PASSED: Photo streamed successfully to assigned technician.');
    } else {
      throw new Error(`Technician photo stream failed, status: ${photoTechRes.status}`);
    }

    // 17. Photo streaming negative test: Stranger gets 403
    console.log('Test 17: Unauthorized user attempts to stream photo (Expect 403)...');
    const photoStrangerRes = await request(app)
      .get(`/api/requests/${createdRequestId}/photo`)
      .set('Authorization', `Bearer ${otherCustomerToken}`);
    if (photoStrangerRes.status === 403) {
      console.log('  PASSED: Received expected HTTP 403 Forbidden for photo access.');
    } else {
      throw new Error(`Expected 403, got ${photoStrangerRes.status}`);
    }

    // 18. Customer cancellation: Owner customer cancels request from Assigned status
    console.log('Test 18: Owner customer cancels request from Assigned status...');
    const cancelRes = await request(app)
      .patch(`/api/requests/${cancelTestRequestId}/status`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ status: 'Cancelled', note: 'Customer resolved issue' });
    if (cancelRes.status === 200 && cancelRes.body.data.status === 'Cancelled') {
      console.log('  PASSED: Customer successfully cancelled request in Assigned status.');
    } else {
      throw new Error(`Customer cancel failed: ${JSON.stringify(cancelRes.body)}`);
    }

    // 19. Unassigned technician status update -> 403
    console.log('Test 19: Unassigned technician updates status (Expect 403)...');
    const forbiddenUpdateRes = await request(app)
      .patch(`/api/requests/${createdRequestId}/status`)
      .set('Authorization', `Bearer ${otherTechToken}`)
      .send({ status: 'In Progress' });
    if (forbiddenUpdateRes.status === 403) {
      console.log('  PASSED: Received expected HTTP 403 Forbidden.');
    } else {
      throw new Error(`Expected 403, got ${forbiddenUpdateRes.status}`);
    }

    // 20. Assigned technician updates status to In Progress
    console.log("Test 20: Assigned technician updates status to 'In Progress'...");
    const progressUpdateRes = await request(app)
      .patch(`/api/requests/${createdRequestId}/status`)
      .set('Authorization', `Bearer ${technicianToken}`)
      .send({ status: 'In Progress', note: 'Technician on-site.' });
    if (progressUpdateRes.status === 200 && progressUpdateRes.body.data.status === 'In Progress') {
      console.log('  PASSED: Status updated to In Progress.');
    } else {
      throw new Error('Status update to In Progress failed');
    }

    // 21. Customer cancel rejected when status is In Progress -> 400
    console.log('Test 21: Customer attempts cancel when status is In Progress (Expect 400)...');
    const invalidCancelRes = await request(app)
      .patch(`/api/requests/${createdRequestId}/status`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ status: 'Cancelled' });
    if (invalidCancelRes.status === 400) {
      console.log('  PASSED: Received expected HTTP 400 (Customer cancel rejected when not Assigned).');
    } else {
      throw new Error(`Expected 400, got ${invalidCancelRes.status}`);
    }

    // 22. Invalid status transition -> 400
    console.log('Test 22: Invalid backward status transition (Expect 400)...');
    const invalidTransitionRes = await request(app)
      .patch(`/api/requests/${createdRequestId}/status`)
      .set('Authorization', `Bearer ${technicianToken}`)
      .send({ status: 'Pending' });
    if (invalidTransitionRes.status === 400) {
      console.log('  PASSED: Received expected HTTP 400 for invalid transition.');
    } else {
      throw new Error(`Expected 400, got ${invalidTransitionRes.status}`);
    }

    // 23. Assigned technician updates to Completed
    console.log("Test 23: Assigned technician updates status to 'Completed'...");
    const completedUpdateRes = await request(app)
      .patch(`/api/requests/${createdRequestId}/status`)
      .set('Authorization', `Bearer ${technicianToken}`)
      .send({ status: 'Completed', note: 'All repairs finished and verified.' });
    if (completedUpdateRes.status === 200 && completedUpdateRes.body.data.status === 'Completed') {
      console.log('  PASSED: Status updated to Completed.');
    } else {
      throw new Error('Status update to Completed failed');
    }

    // 24. Update after terminal state -> 400
    console.log('Test 24: Update after terminal state (Expect 400)...');
    const terminalRes = await request(app)
      .patch(`/api/requests/${createdRequestId}/status`)
      .set('Authorization', `Bearer ${technicianToken}`)
      .send({ status: 'In Progress' });
    if (terminalRes.status === 400) {
      console.log('  PASSED: Received expected HTTP 400 for terminal state update.');
    } else {
      throw new Error(`Expected 400, got ${terminalRes.status}`);
    }

    console.log('\n======================================================');
    console.log('🎉 ALL 24 AUTOMATED TESTS PASSED PERFECTLY!');
    console.log('======================================================\n');
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
    process.exit(process.exitCode || 0);
  }
}

runTests();
