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

    // Relative photo path for URL serving (e.g. uploads/appliance-123.jpg)
    const photoPath = `uploads/${req.file.filename}`;

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

// @desc    Get single repair request details
// @route   GET /api/requests/:id
// @access  Private (Owner customer or assigned technician)
const getRequestById = async (req, res, next) => {
  try {
    // req.repairRequest is already populated and verified by checkRequestAccess middleware
    res.status(200).json({
      success: true,
      data: req.repairRequest,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update repair request status
// @route   PATCH /api/requests/:id/status
// @access  Private (Assigned technician only)
const updateRequestStatus = async (req, res, next) => {
  try {
    const { status: newStatus, note } = req.body;
    // req.repairRequest is populated & ownership verified by checkTechnicianAssignment middleware
    const repairRequest = req.repairRequest;

    const currentStatus = repairRequest.status;

    // Check if status is actually changing
    if (currentStatus === newStatus) {
      return res.status(400).json({
        success: false,
        message: `Request is already in '${currentStatus}' status.`,
      });
    }

    // Verify valid status workflow transition
    const allowedNextStatuses = VALID_STATUS_TRANSITIONS[currentStatus] || [];
    if (!allowedNextStatuses.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from '${currentStatus}' to '${newStatus}'. Allowed transitions: ${
          allowedNextStatuses.length > 0
            ? allowedNextStatuses.join(', ')
            : 'None (terminal status reached)'
        }.`,
      });
    }

    // Update status and push to statusHistory
    repairRequest.status = newStatus;
    repairRequest.statusHistory.push({
      status: newStatus,
      changedAt: new Date(),
      changedBy: `${req.user.name} (Technician)`,
      role: 'technician',
      note: note || `Status updated from '${currentStatus}' to '${newStatus}' by assigned technician.`,
    });

    await repairRequest.save();

    res.status(200).json({
      success: true,
      message: `Repair request status successfully updated to '${newStatus}'.`,
      data: repairRequest,
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
  VALID_STATUS_TRANSITIONS,
};
