const userService = require('../services/user.service');
const ApiResponse = require('../utils/apiResponse');

exports.getProfile = async (req, res, next) => {
    try {
        const profile = await userService.getProfile(req.user.id);
        res.status(200).json(new ApiResponse(200, profile, 'Profile fetched successfully.'));
    } catch (error) {
        next(error);
    }
};

exports.updateProfile = async (req, res, next) => {
    try {
        const updatedProfile = await userService.updateProfile(req.user.id, req.body);
        res.status(200).json(new ApiResponse(200, updatedProfile, 'Profile updated successfully.'));
    } catch (error) {
        next(error);
    }
};

exports.uploadAvatar = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json(new ApiResponse(400, null, 'Please upload an image file.'));
        }

        const result = await userService.uploadAvatar(req.user.id, req.file.buffer);
        res.status(200).json(new ApiResponse(200, result, 'Avatar uploaded successfully.'));
    } catch (error) {
        next(error);
    }
};

exports.deleteAvatar = async (req, res, next) => {
    try {
        await userService.deleteAvatar(req.user.id);
        res.status(200).json(new ApiResponse(200, {}, 'Avatar removed successfully.'));
    } catch (error) {
        next(error);
    }
};
