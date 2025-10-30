const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        error: 'No token provided, authorization denied' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by ID
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] } // Don't send password
    });

    if (!user) {
      return res.status(401).json({ 
        error: 'Token is valid but user not found' 
      });
    }

    // Add user to request object
    req.user = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone
    };

    console.log('🔐 [Auth] User authenticated:', {
      userId: user.id,
      email: user.email
    });

    next();
  } catch (error) {
    console.error('❌ [Auth] Authentication error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }

    res.status(500).json({ error: 'Server error during authentication' });
  }
};

// Optional middleware for routes that can work with or without authentication
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.userId, {
        attributes: { exclude: ['password'] }
      });

      if (user) {
        req.user = {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone
        };
        
        console.log('🔐 [Auth] Optional auth - User authenticated:', user.id);
      }
    }

    next();
  } catch (error) {
    // If token is invalid, just continue without user
    console.log('🔐 [Auth] Optional auth - No valid token, continuing...');
    next();
  }
};

// Admin middleware (if you need admin routes later)
const adminMiddleware = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if user is admin (you can add an isAdmin field to your User model later)
    // For now, we'll just allow all authenticated users
    // const user = await User.findByPk(req.user.id);
    // if (!user || !user.isAdmin) {
    //   return res.status(403).json({ error: 'Admin access required' });
    // }

    next();
  } catch (error) {
    console.error('❌ [Auth] Admin middleware error:', error);
    res.status(500).json({ error: 'Server error during admin verification' });
  }
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
  adminMiddleware
};