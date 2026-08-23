const User = require('../models/user.model');
const ApiError = require('../utils/apiError');
const cloudinary = require('../config/cloudinary');

class UserService {
    async getProfile(userId) {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        return {
            _id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            bio: user.bio,
            country: user.country,
            status: user.status,
            createdAt: user.createdAt
        };
    }

    async updateProfile(userId, updateData) {
        // Only allow specific fields to be updated
        const allowedFields = ['name', 'bio', 'country'];
        const filteredData = {};

        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                filteredData[field] = updateData[field];
            }
        }

        if (Object.keys(filteredData).length === 0) {
            throw new ApiError(400, 'No valid fields provided for update');
        }

        const user = await User.findByIdAndUpdate(userId, filteredData, {
            new: true,
            runValidators: true
        });

        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        return {
            _id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            bio: user.bio,
            country: user.country,
            status: user.status,
            createdAt: user.createdAt
        };
    }

    async uploadAvatar(userId, fileBuffer) {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        // Delete existing avatar from Cloudinary if it exists
        if (user.avatar) {
            const publicId = this._extractPublicId(user.avatar);
            if (publicId) {
                try {
                    await cloudinary.uploader.destroy(publicId);
                } catch (err) {
                    // Log but don't block upload if old avatar deletion fails
                    console.error('Failed to delete old avatar from Cloudinary:', err.message);
                }
            }
        }

        // Upload new avatar to Cloudinary
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'earena/avatars',
                    transformation: [
                        { width: 300, height: 300, crop: 'fill', gravity: 'face' }
                    ]
                },
                (error, result) => {
                    if (error) return reject(new ApiError(500, 'Avatar upload failed'));
                    resolve(result);
                }
            );
            uploadStream.end(fileBuffer);
        });

        // Save URL to user
        user.avatar = result.secure_url;
        await user.save({ validateBeforeSave: false });

        return { avatar: result.secure_url };
    }

    async deleteAvatar(userId) {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        if (!user.avatar) {
            throw new ApiError(400, 'No avatar to delete');
        }

        // Delete from Cloudinary
        const publicId = this._extractPublicId(user.avatar);
        if (publicId) {
            try {
                await cloudinary.uploader.destroy(publicId);
            } catch (err) {
                console.error('Failed to delete avatar from Cloudinary:', err.message);
            }
        }

        // Reset avatar
        user.avatar = '';
        await user.save({ validateBeforeSave: false });

        return true;
    }

    /**
     * Extract Cloudinary public_id from a secure_url.
     * Example URL: https://res.cloudinary.com/demo/image/upload/v1234/earena/avatars/abc123.jpg
     * Public ID:   earena/avatars/abc123
     */
    _extractPublicId(url) {
        if (!url) return null;
        try {
            const parts = url.split('/upload/');
            if (parts.length < 2) return null;
            // Remove version prefix (v1234/) and file extension
            const pathAfterUpload = parts[1].replace(/^v\d+\//, '');
            const publicId = pathAfterUpload.replace(/\.[^/.]+$/, '');
            return publicId;
        } catch {
            return null;
        }
    }
}

module.exports = new UserService();
