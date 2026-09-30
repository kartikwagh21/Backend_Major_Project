const express = require('express');
const router = express.Router();
const {
  createRequest,
  getMyRequests,
  getAssignedRequests,
  getRequestById,
  updateRequestStatus,
} = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const {
  checkRequestAccess,
  checkTechnicianAssignment,
} = require('../middleware/ownershipMiddleware');
const { upload } = require('../middleware/uploadMiddleware');
const {
  createRequestValidationRules,
  updateStatusValidationRules,
  idParamValidationRules,
  handleValidationErrors,
} = require('../middleware/validateMiddleware');

// Specific routes FIRST before dynamic /:id parameter

// 1. GET /api/requests/my - Logged-in customer only
router.get('/my', protect, authorizeRoles('customer'), getMyRequests);

// 2. GET /api/requests/assigned - Logged-in technician only
router.get(
  '/assigned',
  protect,
  authorizeRoles('technician'),
  getAssignedRequests
);

// 3. POST /api/requests - Customer raises repair request with appliance photo
router.post(
  '/',
  protect,
  authorizeRoles('customer'),
  upload.single('photo'),
  createRequestValidationRules,
  handleValidationErrors,
  createRequest
);

// 4. PATCH /api/requests/:id/status - Assigned technician only updates status
router.patch(
  '/:id/status',
  protect,
  authorizeRoles('technician'),
  updateStatusValidationRules,
  handleValidationErrors,
  checkTechnicianAssignment,
  updateRequestStatus
);

// 5. GET /api/requests/:id - Request details (Owner customer or assigned technician only)
router.get(
  '/:id',
  protect,
  idParamValidationRules,
  handleValidationErrors,
  checkRequestAccess,
  getRequestById
);

module.exports = router;
