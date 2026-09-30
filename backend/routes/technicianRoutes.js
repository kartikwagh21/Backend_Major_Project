const express = require('express');
const router = express.Router();
const { getTechnicians } = require('../controllers/technicianController');
const { protect } = require('../middleware/authMiddleware');

// Authenticated users (customers raising requests or technicians) can fetch technicians list
router.get('/', protect, getTechnicians);

module.exports = router;
