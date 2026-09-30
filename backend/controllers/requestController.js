const RepairRequest = require('../models/RepairRequest');
const Technician = require('../models/Technician');

// Valid status transitions map for technicians
const VALID_STATUS_TRANSITIONS = {
  Pending: ['Assigned', 'Cancelled'],
  Assigned: ['In Progress', 'Cancelled'],
  'In Progress': ['Completed', 'Cancelled'],
  Completed: [],
  Cancelled: [],
};

// @desc    Create a new repair request with photo upload stored in MongoDB
// @route   POST /api/requests
// @access  Private (Customer only)
const createRequest = async (req, res, next) => {
  try {
    const { technician, applianceType, brand, issueDescription } = req.body;

    // Photo file is required
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: 'Appliance photo is required.',
      });
    }

    // Check if selected technician exists
    const techExists = await Technician.findById(technician);
    if (!techExists) {
      return res.status(400).json({
        success: false,
        message: 'Selected technician does not exist in the system.',
      });
    }

    const repairRequest = new RepairRequest({
      customer: req.user.id,
      technician,
      applianceType,
      brand: brand || 'Generic / Unspecified',
      issueDescription,
      photo: {
        data: req.file.buffer,
        contentType: req.file.mimetype || 'image/jpeg',
      },
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

    repairRequest.photoPath = `/api/requests/${repairRequest._id}/photo`;
    await repairRequest.save();

    const populatedRequest = await RepairRequest.findById(repairRequest._id)
      .populate('customer', 'name email phone address')
      .populate('technician', 'name email phone specialization');

    res.status(201).json({
      success: true,
      message: 'Repair request raised and assigned successfully.',
      data: populatedRequest,
    });
  } catch (error) {
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

// @desc    Get appliance photo stream securely from MongoDB
// @route   GET /api/requests/:id/photo
// @access  Private (Owner customer or Assigned Technician)
const getRequestPhoto = async (req, res, next) => {
  try {
    const request = await RepairRequest.findById(req.params.id).select('+photo.data customer technician');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Repair request not found.',
      });
    }

    const userId = req.user.id;
    const isOwnerCustomer =
      req.user.role === 'customer' &&
      request.customer &&
      request.customer.toString() === userId;

    const isAssignedTechnician =
      req.user.role === 'technician' &&
      request.technician &&
      request.technician.toString() === userId;

    if (!isOwnerCustomer && !isAssignedTechnician) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to access this photo.',
      });
    }

    if (!request.photo || !request.photo.data) {
      return res.status(404).json({
        success: false,
        message: 'Appliance photo not found for this request.',
      });
    }

    res.set('Content-Type', request.photo.contentType || 'image/jpeg');
    res.set('Cache-Control', 'private, max-age=86400');
    return res.send(request.photo.data);
  } catch (error) {
    next(error);
  }
};

// @desc    Update repair request status (Technician workflow & Customer cancellation)
// @route   PATCH /api/requests/:id/status
// @access  Private (Assigned Technician or Owner Customer)
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

    const currentStatus = request.status;

    // 1. Customer cancellation logic
    if (req.user.role === 'customer') {
      if (request.customer.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You can only cancel your own repair requests.',
        });
      }

      if (newStatus !== 'Cancelled') {
        return res.status(400).json({
          success: false,
          message: 'Customers are only permitted to cancel requests.',
        });
      }

      if (currentStatus !== 'Assigned') {
        return res.status(400).json({
          success: false,
          message: `Customers can only cancel requests while status is 'Assigned'. Current status is '${currentStatus}'.`,
        });
      }
    } else if (req.user.role === 'technician') {
      // 2. Technician workflow logic
      if (request.technician.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You are only allowed to update status for repair requests assigned to you.',
        });
      }

      const allowedTransitions = VALID_STATUS_TRANSITIONS[currentStatus] || [];
      if (!allowedTransitions.includes(newStatus) && currentStatus !== newStatus) {
        return res.status(400).json({
          success: false,
          message: `Invalid status transition from '${currentStatus}' to '${newStatus}'. Allowed transitions: [${allowedTransitions.join(', ')}]`,
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Unauthorized role.',
      });
    }

    // Append to status history audit trail
    const roleCapitalized = req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1);
    const historyEntry = {
      status: newStatus,
      changedAt: new Date(),
      changedBy: `${req.user.name} (${roleCapitalized})`,
      role: req.user.role,
      note:
        note ||
        (newStatus === 'Cancelled' && req.user.role === 'customer'
          ? 'Repair request cancelled by customer.'
          : `Status updated from ${currentStatus} to ${newStatus}.`),
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
  getRequestPhoto,
  updateRequestStatus,
};
