const mongoose = require('mongoose');
const RepairRequest = require('../models/RepairRequest');

// Middleware to verify ownership/assignment before viewing a request
const checkRequestAccess = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Repair Request ID format.',
      });
    }

    const repairRequest = await RepairRequest.findById(id)
      .populate('customer', 'name email phone address')
      .populate('technician', 'name email phone specialization');

    if (!repairRequest) {
      return res.status(404).json({
        success: false,
        message: 'Repair request not found.',
      });
    }

    const userId = req.user.id;
    const isOwnerCustomer =
      req.user.role === 'customer' &&
      repairRequest.customer &&
      repairRequest.customer._id.toString() === userId;

    const isAssignedTechnician =
      req.user.role === 'technician' &&
      repairRequest.technician &&
      repairRequest.technician._id.toString() === userId;

    if (!isOwnerCustomer && !isAssignedTechnician) {
      return res.status(403).json({
        success: false,
        message:
          req.user.role === 'customer'
            ? 'Forbidden: You can only view your own repair requests.'
            : 'Forbidden: You can only view repair requests assigned to you.',
      });
    }

    // Attach request to req object for downstream use
    req.repairRequest = repairRequest;
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to verify that logged-in technician is the one assigned to this request
const checkTechnicianAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Repair Request ID format.',
      });
    }

    const repairRequest = await RepairRequest.findById(id)
      .populate('customer', 'name email phone address')
      .populate('technician', 'name email phone specialization');

    if (!repairRequest) {
      return res.status(404).json({
        success: false,
        message: 'Repair request not found.',
      });
    }

    const userId = req.user.id;
    const isAssignedTechnician =
      repairRequest.technician &&
      repairRequest.technician._id.toString() === userId;

    if (!isAssignedTechnician) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only update repair requests assigned directly to you.',
      });
    }

    req.repairRequest = repairRequest;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkRequestAccess,
  checkTechnicianAssignment,
};
