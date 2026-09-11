const registrationService = require('../services/registration.service');
const ApiResponse = require('../utils/apiResponse');

exports.registerTeam = async (req, res, next) => {
    try {
        const registration = await registrationService.registerTeam(req.user.id, req.body);
        res.status(201).json(
            new ApiResponse(201, registration, 'Team registered for tournament successfully! 🎉')
        );
    } catch (error) {
        next(error);
    }
};

exports.getRegistrations = async (req, res, next) => {
    try {
        const data = await registrationService.getRegistrations(req.query);
        res.status(200).json(
            new ApiResponse(200, data, 'Registrations fetched successfully.')
        );
    } catch (error) {
        next(error);
    }
};

exports.getMyRegistrations = async (req, res, next) => {
    try {
        const data = await registrationService.getMyRegistrations(req.user.id);
        res.status(200).json(
            new ApiResponse(200, data, 'My tournament registrations fetched successfully.')
        );
    } catch (error) {
        next(error);
    }
};

exports.checkRegistrationStatus = async (req, res, next) => {
    try {
        const data = await registrationService.checkRegistrationStatus(
            req.params.tournamentId,
            req.user.id
        );
        res.status(200).json(
            new ApiResponse(200, data, 'Registration status checked successfully.')
        );
    } catch (error) {
        next(error);
    }
};

exports.getRegistrationById = async (req, res, next) => {
    try {
        const data = await registrationService.getRegistrationById(req.params.registrationId);
        res.status(200).json(
            new ApiResponse(200, data, 'Registration details fetched successfully.')
        );
    } catch (error) {
        next(error);
    }
};

exports.updateRegistrationStatus = async (req, res, next) => {
    try {
        const updated = await registrationService.updateRegistrationStatus(
            req.params.registrationId,
            req.user.id,
            req.user.role,
            req.body
        );
        res.status(200).json(
            new ApiResponse(200, updated, 'Registration status updated successfully.')
        );
    } catch (error) {
        next(error);
    }
};

exports.cancelRegistration = async (req, res, next) => {
    try {
        const result = await registrationService.cancelRegistration(
            req.params.registrationId,
            req.user.id,
            req.user.role
        );
        res.status(200).json(
            new ApiResponse(200, result, 'Registration cancelled successfully.')
        );
    } catch (error) {
        next(error);
    }
};
