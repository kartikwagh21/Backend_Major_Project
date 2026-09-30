const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const technicianSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Technician name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Technician email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^[0-9+-\s()]{7,20}$/, 'Please provide a valid phone number'],
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required (e.g. AC, Refrigerator, Washing Machine)'],
      trim: true,
    },
    role: {
      type: String,
      default: 'technician',
      enum: ['technician'],
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving if modified
technicianSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password helper
technicianSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Technician', technicianSchema);
