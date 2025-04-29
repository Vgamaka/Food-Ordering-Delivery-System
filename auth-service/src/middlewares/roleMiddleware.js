
// Allow only specific roles to access route
const restrictTo = (...allowedRoles) => {
    return (req, res, next) => {
      const userRole = req.user?.role;
  
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ message: `Access denied for role: ${userRole}` });
      }
  
      next();
    };
  };
  
  module.exports = { restrictTo };
  