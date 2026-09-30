const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const Technician = require('../models/Technician');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'repair_service_super_secret_jwt_key_2026_case_study_132');

      // Check role and fetch user
      let user = null;
      if (decoded.role === 'customer') {
        user = await Customer.findById(decoded.id).select('-password');
      } else if (decoded.role === 'technician') {
        user = await Technician.findById(decoded.id).select('-password');
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User belonging to this token no longer exists.',
        });
      }

      req.user = {
        id: user._id.toString(),
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: decoded.role,
      };

      return next();
    } catch (error) {
      console.error('JWT verification error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, invalid or expired token.',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided in Authorization header.',
    });
  }
};

module.exports = { protect };
