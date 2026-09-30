const Technician = require('../models/Technician');

// @desc    Get all available technicians
// @route   GET /api/technicians
// @access  Private (Customer or Technician)
const getTechnicians = async (req, res, next) => {
  try {
    const { specialization, search } = req.query;

    const query = {};
    if (specialization) {
      query.specialization = new RegExp(specialization, 'i');
    }
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { specialization: new RegExp(search, 'i') },
      ];
    }

    const technicians = await Technician.find(query)
      .select('name specialization _id')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: technicians.length,
      data: technicians,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTechnicians,
};
