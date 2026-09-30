const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const Technician = require('../models/Technician');

// Helper to generate JWT
const generateToken = (id, role, email) => {
  return jwt.sign(
    { id, role, email },
    process.env.JWT_SECRET || 'repair_service_super_secret_jwt_key_2026_case_study_132',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

// @desc    Register a customer or technician
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role = 'customer', specialization, address } = req.body;

    if (!['customer', 'technician'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be either 'customer' or 'technician'.",
      });
    }

    // Check if email is already taken across both collections
    const existingCustomer = await Customer.findOne({ email });
    const existingTech = await Technician.findOne({ email });

    if (existingCustomer || existingTech) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    let user;
    if (role === 'technician') {
      if (!specialization) {
        return res.status(400).json({
          success: false,
          message: 'Technician specialization is required (e.g. AC, Refrigerator, Washing Machine).',
        });
      }
      user = await Technician.create({
        name,
        email,
        password,
        phone,
        specialization,
        role: 'technician',
      });
    } else {
      user = await Customer.create({
        name,
        email,
        password,
        phone,
        address: address || '',
        role: 'customer',
      });
    }

    const token = generateToken(user._id, user.role, user.email);

    res.status(201).json({
      success: true,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully.`,
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          ...(user.specialization && { specialization: user.specialization }),
          ...(user.address && { address: user.address }),
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user (Customer or Technician)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    let user = null;

    // First try the requested role if provided
    if (role === 'technician') {
      user = await Technician.findOne({ email: email.toLowerCase() }).select('+password');
    } else if (role === 'customer') {
      user = await Customer.findOne({ email: email.toLowerCase() }).select('+password');
    }

    // If not found in requested role, check the other collection as fallback
    if (!user) {
      user = await Customer.findOne({ email: email.toLowerCase() }).select('+password');
    }
    if (!user) {
      user = await Technician.findOne({ email: email.toLowerCase() }).select('+password');
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No account found with this email. Please create an account first.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please try again.',
      });
    }

    const token = generateToken(user._id, user.role, user.email);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          ...(user.specialization && { specialization: user.specialization }),
          ...(user.address && { address: user.address }),
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current authenticated user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    let user;
    if (req.user.role === 'customer') {
      user = await Customer.findById(req.user.id).select('-password');
    } else {
      user = await Technician.findById(req.user.id).select('-password');
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
};
