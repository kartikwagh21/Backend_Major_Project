const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: ['Pending', 'Assigned', 'In Progress', 'Completed', 'Cancelled'],
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
    changedBy: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['customer', 'technician', 'system'],
      default: 'technician',
    },
    note: {
      type: String,
      default: '',
    },
  },
  { _id: true }
);

const repairRequestSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer reference is required'],
    },
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Technician',
      required: [true, 'Assigned technician reference is required'],
    },
    applianceType: {
      type: String,
      required: [true, 'Appliance type is required'],
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
      default: 'Generic / Unspecified',
    },
    issueDescription: {
      type: String,
      required: [true, 'Issue description is required'],
      minlength: [10, 'Issue description must be at least 10 characters long'],
      trim: true,
    },
    photoPath: {
      type: String,
      required: [true, 'Appliance photo path is required'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Assigned', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Assigned',
    },
    statusHistory: [statusHistorySchema],
  },
  {
    timestamps: true,
  }
);

// Index for performance
repairRequestSchema.index({ customer: 1, createdAt: -1 });
repairRequestSchema.index({ technician: 1, status: 1 });

module.exports = mongoose.model('RepairRequest', repairRequestSchema);
