const tournamentService = require('../services/tournament.service');
const ApiResponse = require('../utils/apiResponse');

exports.createTournament = async (req, res, next) => {
    try {
        const tournament = await tournamentService.createTournament(req.user.id, req.body);
        res.status(201).json(new ApiResponse(201, tournament, 'Tournament created successfully in Draft status.'));
    } catch (error) {
        next(error);
    }
};

exports.getTournaments = async (req, res, next) => {
    try {
        const data = await tournamentService.getTournaments(req.query);
        res.status(200).json(new ApiResponse(200, data, 'Tournaments fetched successfully.'));
    } catch (error) {
        next(error);
    }
};

exports.getTournamentDetails = async (req, res, next) => {
    try {
        const tournament = await tournamentService.getTournamentById(req.params.tournamentId);
        res.status(200).json(new ApiResponse(200, tournament, 'Tournament details fetched successfully.'));
    } catch (error) {
        next(error);
    }
};

exports.getMyTournaments = async (req, res, next) => {
    try {
        const tournaments = await tournamentService.getMyOrganizedTournaments(req.user.id);
        res.status(200).json(new ApiResponse(200, tournaments, 'My tournaments fetched successfully.'));
    } catch (error) {
        next(error);
    }
};

exports.updateTournament = async (req, res, next) => {
    try {
        const updated = await tournamentService.updateTournament(
            req.params.tournamentId,
            req.user.id,
            req.user.role,
            req.body
        );
        res.status(200).json(new ApiResponse(200, updated, 'Tournament updated successfully.'));
    } catch (error) {
        next(error);
    }
};

exports.deleteTournament = async (req, res, next) => {
    try {
        await tournamentService.deleteTournament(
            req.params.tournamentId,
            req.user.id,
            req.user.role
        );
        res.status(200).json(new ApiResponse(200, {}, 'Tournament deleted successfully.'));
    } catch (error) {
        next(error);
    }
};

exports.publishTournament = async (req, res, next) => {
    try {
        const tournament = await tournamentService.publishTournament(
            req.params.tournamentId,
            req.user.id,
            req.user.role
        );
        res.status(200).json(new ApiResponse(200, tournament, 'Tournament published successfully! Registrations are now open.'));
    } catch (error) {
        next(error);
    }
};

exports.startTournament = async (req, res, next) => {
    try {
        const tournament = await tournamentService.startTournament(
            req.params.tournamentId,
            req.user.id,
            req.user.role
        );
        res.status(200).json(new ApiResponse(200, tournament, 'Tournament started! It is now LIVE.'));
    } catch (error) {
        next(error);
    }
};

exports.endTournament = async (req, res, next) => {
    try {
        const tournament = await tournamentService.endTournament(
            req.params.tournamentId,
            req.user.id,
            req.user.role
        );
        res.status(200).json(new ApiResponse(200, tournament, 'Tournament marked as COMPLETED.'));
    } catch (error) {
        next(error);
    }
};

exports.cancelTournament = async (req, res, next) => {
    try {
        const tournament = await tournamentService.cancelTournament(
            req.params.tournamentId,
            req.user.id,
            req.user.role
        );
        res.status(200).json(new ApiResponse(200, tournament, 'Tournament CANCELLED.'));
    } catch (error) {
        next(error);
    }
};

exports.uploadBanner = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json(new ApiResponse(400, null, 'Please upload a banner image.'));
        }

        const result = await tournamentService.uploadBanner(
            req.params.tournamentId,
            req.user.id,
            req.user.role,
            req.file.buffer
        );
        res.status(200).json(new ApiResponse(200, result, 'Tournament banner uploaded successfully.'));
    } catch (error) {
        next(error);
    }
};
