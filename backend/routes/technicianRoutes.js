const express = require('express');
const router = express.Router();
const { getTechnicians } = require('../controllers/technicianController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Accessible to customers only for selecting a technician to assign
router.get('/', protect, authorizeRoles('customer'), getTechnicians);

module.exports = router;
