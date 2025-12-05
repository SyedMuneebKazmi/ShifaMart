const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) return res.status(401).json({ success: false, message: 'Not authorized. No token provided.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    if (!user.isActive) return res.status(403).json({ success: false, message: 'Account is deactivated' });

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Authentication error', error: error.message });
  }
};

// Authorize roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'User not authenticated' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ success: false, message: `User role ${req.user.role} not authorized` });
    next();
  };
};

// Optional auth
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (user?.isActive) req.user = user;
      } catch (error) {
        console.log('Optional auth token error:', error.message);
      }
    }
    next();
  } catch (error) {
    console.log('Optional auth error:', error.message);
    next();
  }
};
