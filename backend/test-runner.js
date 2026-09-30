const mongoose = require('mongoose');
const request = require('supertest');
const path = require('path');
const fs = require('fs');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_repair_service_12345';
process.env.UPLOAD_PATH = path.join(__dirname, 'test-uploads');

const app = require('./server');

// Create test image fixture
const testUploadDir = process.env.UPLOAD_PATH;
if (!fs.existsSync(testUploadDir)) {
  fs.mkdirSync(testUploadDir, { recursive: true });
}
const testImagePath = path.join(testUploadDir, 'test-appliance.png');
// 1x1 transparent PNG buffer
const dummyPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);
fs.writeFileSync(testImagePath, dummyPng);

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

    // 6. List Technicians
    console.log('Test 6: Customer fetches technicians list...');
    const listTechsRes = await request(app)
      .get('/api/technicians')
      .set('Authorization', `Bearer ${customerToken}`);
    if (listTechsRes.status === 200 && listTechsRes.body.data.length >= 2) {
      console.log('  PASSED: Found', listTechsRes.body.data.length, 'technicians.');
    } else {
      throw new Error('List technicians failed');
    }

    // 7. Create Repair Request with Photo (Multer)
    console.log('Test 7: Customer creates repair request with photo...');
    const createReqRes = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${customerToken}`)
      .field('technician', technicianId)
      .field('applianceType', 'Air Conditioner (AC)')
      .field('brand', 'Daikin Inverter')
      .field('issueDescription', 'The AC is not cooling properly and making a strange rattling noise.')
      .attach('photo', testImagePath);

    if (createReqRes.status === 201 && createReqRes.body.success) {
      createdRequestId = createReqRes.body.data._id;
      const data = createReqRes.body.data;
      console.log('  PASSED: Repair request created successfully.');
      console.log('    - Request ID:', createdRequestId);
      console.log('    - Stored photoPath:', data.photoPath);
      console.log('    - Status:', data.status);
      console.log('    - Assigned Technician Name:', data.technician?.name);
      console.log('    - Customer Name:', data.customer?.name);
    } else {
      throw new Error(`Create repair request failed: ${JSON.stringify(createReqRes.body)}`);
    }

    // 8. Customer views own requests
    console.log('Test 8: Customer views own requests (/api/requests/my)...');
    const myReqsRes = await request(app)
      .get('/api/requests/my')
      .set('Authorization', `Bearer ${customerToken}`);
    if (myReqsRes.status === 200 && myReqsRes.body.data.length === 1) {
      console.log('  PASSED: Customer sees exactly 1 own request.');
    } else {
      throw new Error('Customer my requests test failed');
    }

    // 9. Other customer views own requests -> should see 0 requests (Isolation)
    console.log('Test 9: Other customer views own requests (Isolation test)...');
    const otherCustReqsRes = await request(app)
      .get('/api/requests/my')
      .set('Authorization', `Bearer ${otherCustomerToken}`);
    if (otherCustReqsRes.status === 200 && otherCustReqsRes.body.data.length === 0) {
      console.log('  PASSED: Other customer sees 0 requests (Data isolation verified).');
    } else {
      throw new Error('Customer isolation failed');
    }

    // 10. Technician views assigned requests (/api/requests/assigned)
    console.log('Test 10: Assigned technician views assigned requests...');
    const assignedReqsRes = await request(app)
      .get('/api/requests/assigned')
      .set('Authorization', `Bearer ${technicianToken}`);
    if (assignedReqsRes.status === 200 && assignedReqsRes.body.data.length === 1) {
      console.log('  PASSED: Assigned technician sees 1 request.');
    } else {
      throw new Error('Technician assigned requests test failed');
    }

    // 11. Other technician views assigned requests -> should see 0
    console.log('Test 11: Other technician views assigned requests (Isolation test)...');
    const otherTechAssignedRes = await request(app)
      .get('/api/requests/assigned')
      .set('Authorization', `Bearer ${otherTechToken}`);
    if (otherTechAssignedRes.status === 200 && otherTechAssignedRes.body.data.length === 0) {
      console.log('  PASSED: Other technician sees 0 requests (Technician isolation verified).');
    } else {
      throw new Error('Technician isolation failed');
    }

    // 12. Negative test: Unassigned technician attempts status update -> HTTP 403 Forbidden
    console.log('Test 12: Negative test - Unassigned technician updates status (Expect 403 Forbidden)...');
    const forbiddenUpdateRes = await request(app)
      .patch(`/api/requests/${createdRequestId}/status`)
      .set('Authorization', `Bearer ${otherTechToken}`)
      .send({ status: 'In Progress' });
    if (forbiddenUpdateRes.status === 403) {
      console.log('  PASSED: Received expected HTTP 403 Forbidden:', forbiddenUpdateRes.body.message);
    } else {
      throw new Error(`Expected 403, got ${forbiddenUpdateRes.status}: ${JSON.stringify(forbiddenUpdateRes.body)}`);
    }

    // 13. Assigned technician updates status from 'Assigned' -> 'In Progress'
    console.log("Test 13: Assigned technician updates status to 'In Progress'...");
    const progressUpdateRes = await request(app)
      .patch(`/api/requests/${createdRequestId}/status`)
      .set('Authorization', `Bearer ${technicianToken}`)
      .send({
        status: 'In Progress',
        note: 'Technician on-site inspecting compressor coils.',
      });
    if (progressUpdateRes.status === 200 && progressUpdateRes.body.data.status === 'In Progress') {
      console.log('  PASSED: Status successfully updated to In Progress.');
      console.log('    - Status History count:', progressUpdateRes.body.data.statusHistory.length);
    } else {
      throw new Error(`Status update failed: ${JSON.stringify(progressUpdateRes.body)}`);
    }

    // 14. Negative test: Invalid status transition (e.g. In Progress -> Pending) -> HTTP 400
    console.log('Test 14: Negative test - Invalid status transition (Expect 400 Bad Request)...');
    const invalidTransitionRes = await request(app)
      .patch(`/api/requests/${createdRequestId}/status`)
      .set('Authorization', `Bearer ${technicianToken}`)
      .send({ status: 'Pending' });
    if (invalidTransitionRes.status === 400) {
      console.log('  PASSED: Received expected HTTP 400 Bad Request:', invalidTransitionRes.body.message);
    } else {
      throw new Error(`Expected 400, got ${invalidTransitionRes.status}`);
    }

    // 15. Assigned technician updates status from 'In Progress' -> 'Completed'
    console.log("Test 15: Assigned technician updates status to 'Completed'...");
    const completedUpdateRes = await request(app)
      .patch(`/api/requests/${createdRequestId}/status`)
      .set('Authorization', `Bearer ${technicianToken}`)
      .send({
        status: 'Completed',
        note: 'Replaced rattling fan motor and verified temperature drop.',
      });
    if (completedUpdateRes.status === 200 && completedUpdateRes.body.data.status === 'Completed') {
      console.log('  PASSED: Status successfully updated to Completed.');
    } else {
      throw new Error(`Status update to Completed failed: ${JSON.stringify(completedUpdateRes.body)}`);
    }

    // 16. Negative test: Updating from terminal Completed status -> HTTP 400
    console.log('Test 16: Negative test - Update after Completed terminal state (Expect 400)...');
    const terminalUpdateRes = await request(app)
      .patch(`/api/requests/${createdRequestId}/status`)
      .set('Authorization', `Bearer ${technicianToken}`)
      .send({ status: 'In Progress' });
    if (terminalUpdateRes.status === 400) {
      console.log('  PASSED: Received expected HTTP 400 (Terminal state enforcement verified).');
    } else {
      throw new Error(`Expected 400 for terminal update, got ${terminalUpdateRes.status}`);
    }

    // 17. Negative test: Missing photo on request creation -> HTTP 400
    console.log('Test 17: Negative test - Create request without photo (Expect 400)...');
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

    // 18. Negative test: Other customer viewing request details -> HTTP 403 Forbidden
    console.log('Test 18: Negative test - Other customer views request details (Expect 403)...');
    const otherCustViewRes = await request(app)
      .get(`/api/requests/${createdRequestId}`)
      .set('Authorization', `Bearer ${otherCustomerToken}`);
    if (otherCustViewRes.status === 403) {
      console.log('  PASSED: Received expected HTTP 403 Forbidden for unauthorized request view.');
    } else {
      throw new Error(`Expected 403, got ${otherCustViewRes.status}`);
    }

    // 19. Authorized customer viewing request details -> HTTP 200
    console.log('Test 19: Authorized customer views request details...');
    const authCustViewRes = await request(app)
      .get(`/api/requests/${createdRequestId}`)
      .set('Authorization', `Bearer ${customerToken}`);
    if (authCustViewRes.status === 200 && authCustViewRes.body.data.statusHistory.length === 3) {
      console.log('  PASSED: Request details fetched with 3 statusHistory audit items.');
    } else {
      throw new Error('Authorized view failed');
    }

    console.log('\n======================================================');
    console.log('🎉 ALL 19 INTEGRATION & WORKFLOW TESTS PASSED PERFECTLY!');
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
    // Clean up test uploads
    if (fs.existsSync(testUploadDir)) {
      fs.rmSync(testUploadDir, { recursive: true, force: true });
    }
    process.exit(process.exitCode || 0);
  }
}

runTests();
