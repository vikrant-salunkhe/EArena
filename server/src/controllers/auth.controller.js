const authService = require('../services/auth.service');
const ApiResponse = require('../utils/apiResponse');

// Cookie options
const getCookieOptions = () => ({
    expires: new Date(Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
});

exports.register = async (req, res, next) => {
    try {
        const userData = await authService.registerUser(req.body);
        res.status(201).json(new ApiResponse(201, userData, 'Account created successfully.'));
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const { user, token } = await authService.loginUser(email, password);

        res.status(200)
            .cookie('accessToken', token, getCookieOptions())
            .json(new ApiResponse(200, { user }, 'Login successful.'));
    } catch (error) {
        next(error);
    }
};

exports.logout = (req, res, next) => {
    try {
        res.status(200)
            .cookie('accessToken', 'none', {
                expires: new Date(Date.now() + 10 * 1000), // expire in 10 seconds
                httpOnly: true
            })
            .json(new ApiResponse(200, {}, 'Logged out successfully.'));
    } catch (error) {
        next(error);
    }
};

exports.forgotPassword = async (req, res, next) => {
    try {
        await authService.forgotPassword(req.body.email, req);
        res.status(200).json(new ApiResponse(200, {}, 'Email sent with password reset instructions.'));
    } catch (error) {
        next(error);
    }
};

exports.resetPassword = async (req, res, next) => {
    try {
        await authService.resetPassword(req.params.resetToken, req.body.password);
        res.status(200).json(new ApiResponse(200, {}, 'Password reset successfully. You can now login.'));
    } catch (error) {
        next(error);
    }
};

exports.getMe = async (req, res, next) => {
    try {
        const user = await authService.getCurrentUser(req.user.id);
        res.status(200).json(new ApiResponse(200, user, 'Current user data fetched successfully.'));
    } catch (error) {
        next(error);
    }
};
