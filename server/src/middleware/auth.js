const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const ApiError = require('../utils/apiError');

// Protect routes
exports.protect = async (req, res, next) => {
    let token;

    // Check if token exists in cookies
    if (req.cookies && req.cookies.accessToken) {
        token = req.cookies.accessToken;
    } 
    // Fallback for authorization header (Bearer)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new ApiError(401, 'Not authorized to access this route'));
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if user still exists
        const user = await User.findById(decoded.id);
        if (!user) {
            return next(new ApiError(401, 'User no longer exists'));
        }

        // Check if user is suspended
        if (user.status === 'SUSPENDED') {
            return next(new ApiError(403, 'Your account has been suspended'));
        }

        req.user = user;
        next();
    } catch (error) {
        return next(new ApiError(401, 'Not authorized to access this route'));
    }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ApiError(403, `Role '${req.user.role}' is not authorized to access this route`));
        }
        next();
    };
};
