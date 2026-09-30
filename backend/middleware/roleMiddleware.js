// Authorize specific roles
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${roles.join(', ')}]. Your role is '${req.user ? req.user.role : 'unauthenticated'}'.`,
      });
    }
    next();
  };
};

module.exports = { authorizeRoles };
