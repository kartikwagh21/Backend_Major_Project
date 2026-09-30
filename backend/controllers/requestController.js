const RepairRequest = require('../models/RepairRequest');
const Technician = require('../models/Technician');
const { deleteUploadedFile } = require('../middleware/uploadMiddleware');

// Valid status transitions map
const VALID_STATUS_TRANSITIONS = {
  Pending: ['Assigned', 'Cancelled'],
  Assigned: ['In Progress', 'Cancelled'],
  'In Progress': ['Completed', 'Cancelled'],
  Completed: [],
  Cancelled: [],
};

// @desc    Create a new repair request with photo upload
// @route   POST /api/requests
// @access  Private (Customer only)
const createRequest = async (req, res, next) => {
  try {
    const { technician, applianceType, brand, issueDescription } = req.body;

    // Check if selected technician exists
    const techExists = await Technician.findById(technician);
    if (!techExists) {
      if (req.file) {
        deleteUploadedFile(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'Selected technician does not exist in the system.',
      });
    }

    // Relative photo path for URL serving (if uploaded, e.g. uploads/appliance-123.jpg; or default placeholder)
    const photoPath = req.file
      ? `uploads/${req.file.filename}`
      : req.body.photoPath || 'uploads/default_appliance.svg';

    const repairRequest = await RepairRequest.create({
      customer: req.user.id,
      technician,
      applianceType,
      brand: brand || 'Generic / Unspecified',
      issueDescription,
      photoPath,
      status: 'Assigned',
      statusHistory: [
        {
          status: 'Assigned',
          changedAt: new Date(),
          changedBy: `${req.user.name} (Customer)`,
          role: 'customer',
          note: `Repair request raised and assigned to technician ${techExists.name}.`,
        },
      ],
    });

    const populatedRequest = await RepairRequest.findById(repairRequest._id)
      .populate('customer', 'name email phone address')
      .populate('technician', 'name email phone specialization');

    res.status(201).json({
      success: true,
      message: 'Repair request raised and assigned successfully.',
      data: populatedRequest,
    });
  } catch (error) {
    if (req.file) {
      deleteUploadedFile(req.file.path);
    }
    next(error);
  }
};

// @desc    Get all requests belonging to the logged-in customer
// @route   GET /api/requests/my
// @access  Private (Customer only)
const getMyRequests = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { customer: req.user.id };

    if (status && status !== 'All') {
      query.status = status;
    }

    const requests = await RepairRequest.find(query)
      .populate('technician', 'name email phone specialization')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all requests assigned to the logged-in technician
// @route   GET /api/requests/assigned
// @access  Private (Technician only)
const getAssignedRequests = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { technician: req.user.id };

    if (status && status !== 'All') {
      query.status = status;
    }

    const requests = await RepairRequest.find(query)
      .populate('customer', 'name email phone address')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single repair request by ID
// @route   GET /api/requests/:id
// @access  Private (Customer owner or Assigned Technician)
const getRequestById = async (req, res, next) => {
  try {
    const request = await RepairRequest.findById(req.params.id)
      .populate('customer', 'name email phone address')
      .populate('technician', 'name email phone specialization');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Repair request not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update repair request status (Technician workflow)
// @route   PATCH /api/requests/:id/status
// @access  Private (Assigned Technician only)
const updateRequestStatus = async (req, res, next) => {
  try {
    const { status: newStatus, note } = req.body;
    const request = await RepairRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Repair request not found.',
      });
    }

    // Verify technician assignment
    if (req.user.role === 'technician' && request.technician.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are only allowed to update status for repair requests assigned to you.',
      });
    }

    const currentStatus = request.status;
    const allowedTransitions = VALID_STATUS_TRANSITIONS[currentStatus] || [];

    if (!allowedTransitions.includes(newStatus) && currentStatus !== newStatus) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from '${currentStatus}' to '${newStatus}'. Allowed transitions: [${allowedTransitions.join(', ')}]`,
      });
    }

    // Append to status history audit trail
    const historyEntry = {
      status: newStatus,
      changedAt: new Date(),
      changedBy: `${req.user.name} (${req.user.role})`,
      role: req.user.role,
      note: note || `Status updated from ${currentStatus} to ${newStatus}.`,
    };

    request.status = newStatus;
    request.statusHistory.push(historyEntry);

    await request.save();

    const updatedRequest = await RepairRequest.findById(request._id)
      .populate('customer', 'name email phone address')
      .populate('technician', 'name email phone specialization');

    res.status(200).json({
      success: true,
      message: `Request status updated to '${newStatus}' successfully.`,
      data: updatedRequest,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRequest,
  getMyRequests,
  getAssignedRequests,
  getRequestById,
  updateRequestStatus,
};
