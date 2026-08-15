const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const ApiError = require('../utils/apiError');

class AuthService {
    // Generate JWT
    generateToken(id) {
        return jwt.sign({ id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });
    }

    async registerUser(userData) {
        const { email, username } = userData;

        // Check if user exists
        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            if (userExists.email === email) {
                throw new ApiError(409, 'Email already exists');
            }
            if (userExists.username === username) {
                throw new ApiError(409, 'Username already exists');
            }
        }

        const user = await User.create(userData);
        
        return {
            id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role
        };
    }

    async loginUser(email, password) {
        // Find user by email and include password for verification
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            throw new ApiError(401, 'Invalid email or password');
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new ApiError(401, 'Invalid email or password');
        }

        // Check if suspended
        if (user.status === 'SUSPENDED') {
            throw new ApiError(403, 'Your account has been suspended');
        }

        const token = this.generateToken(user._id);

        return {
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                role: user.role,
                avatar: user.avatar
            },
            token
        };
    }

    async forgotPassword(email, req) {
        const user = await User.findOne({ email });
        if (!user) {
            throw new ApiError(404, 'There is no user with that email');
        }

        // Get reset token
        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        // Create reset URL (assumes frontend is at CLIENT_URL)
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

        // In Development: Just log it to the console as requested by user
        console.log(`\n======================================================`);
        console.log(`[DEV] Password Reset Requested for ${email}`);
        console.log(`[DEV] Reset URL: ${resetUrl}`);
        console.log(`======================================================\n`);

        return true;
    }

    async resetPassword(resetToken, newPassword) {
        // Hash token to compare with db
        const crypto = require('crypto');
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            throw new ApiError(400, 'Invalid or expired token');
        }

        // Set new password
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        return true;
    }

    async getCurrentUser(userId) {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        return {
            id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            bio: user.bio,
            status: user.status
        };
    }
}

module.exports = new AuthService();
