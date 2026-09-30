const { validationResult, body, param } = require('express-validator');
const { deleteUploadedFile } = require('./uploadMiddleware');

// Middleware to evaluate validation rules
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // If a file was uploaded as part of this request, remove it since validation failed
    if (req.file) {
      deleteUploadedFile(req.file.path);
    }

    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));

    return res.status(400).json({
      success: false,
      message: formattedErrors[0]?.message || 'Validation failed.',
      errors: formattedErrors,
    });
  }
  next();
};

// Validation rules for Registration
const registerValidationRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required.')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long.'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required.')
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .toLowerCase(),
  body('password')
    .notEmpty()
    .withMessage('Password is required.')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long.'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required.')
    .matches(/^[0-9+-\s()]{7,20}$/)
    .withMessage('Please provide a valid phone number.'),
  body('role')
    .optional()
    .isIn(['customer', 'technician'])
    .withMessage("Role must be either 'customer' or 'technician'."),
  body('specialization')
    .if(body('role').equals('technician'))
    .trim()
    .notEmpty()
    .withMessage('Specialization is required for technicians.'),
  body('address')
    .optional()
    .trim(),
];

// Validation rules for Login
const loginValidationRules = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required.')
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .toLowerCase(),
  body('password')
    .notEmpty()
    .withMessage('Password is required.'),
  body('role')
    .optional()
    .isIn(['customer', 'technician'])
    .withMessage("Role must be either 'customer' or 'technician'."),
];

// Validation rules for Repair Request Creation
const createRequestValidationRules = [
  body('technician')
    .notEmpty()
    .withMessage('Assigned technician ID is required.')
    .isMongoId()
    .withMessage('Technician must be a valid MongoDB ObjectId.'),
  body('applianceType')
    .trim()
    .notEmpty()
    .withMessage('Appliance type is required (e.g. AC, Washing Machine, Microwave).'),
  body('brand')
    .optional()
    .trim(),
  body('issueDescription')
    .trim()
    .notEmpty()
    .withMessage('Issue description is required.')
    .isLength({ min: 10 })
    .withMessage('Issue description must be at least 10 characters long.'),
  // Custom check for photo file
  (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Appliance photo is required. Please upload an image file using key "photo".',
        errors: [
          {
            field: 'photo',
            message: 'Appliance photo file is required.',
          },
        ],
      });
    }
    next();
  },
];

// Validation rules for Status Updates
const updateStatusValidationRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Repair Request ID parameter.'),
  body('status')
    .notEmpty()
    .withMessage('New status is required.')
    .isIn(['Pending', 'Assigned', 'In Progress', 'Completed', 'Cancelled'])
    .withMessage("Status must be one of: 'Pending', 'Assigned', 'In Progress', 'Completed', 'Cancelled'."),
  body('note')
    .optional()
    .trim(),
];

// Validation rules for ID param
const idParamValidationRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid resource ID parameter.'),
];

module.exports = {
  handleValidationErrors,
  registerValidationRules,
  loginValidationRules,
  createRequestValidationRules,
  updateStatusValidationRules,
  idParamValidationRules,
};
