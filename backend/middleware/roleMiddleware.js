const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized user.' });
    }
    const userRole = String(req.user.role || '').toLowerCase();
    const allowedRoles = roles.map(r => String(r).toLowerCase());

    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden. Role '${req.user.role}' is not authorized for this action.`
      });
    }
    next();
  };
};

module.exports = { authorize, checkRole: authorize };
