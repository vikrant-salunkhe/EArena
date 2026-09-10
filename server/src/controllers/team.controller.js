const teamService = require('../services/team.service');
const ApiResponse = require('../utils/apiResponse');

exports.createTeam = async (req, res, next) => {
    try {
        const team = await teamService.createTeam(req.user.id, req.body);
        res.status(201).json(new ApiResponse(201, team, 'Team created successfully.'));
    } catch (error) {
        next(error);
    }
};

exports.getTeams = async (req, res, next) => {
    try {
        const data = await teamService.getTeams(req.query);
        res.status(200).json(new ApiResponse(200, data, 'Teams fetched successfully.'));
    } catch (error) {
        next(error);
    }
};

exports.getTeamDetails = async (req, res, next) => {
    try {
        const team = await teamService.getTeamById(req.params.teamId);
        res.status(200).json(new ApiResponse(200, team, 'Team details fetched successfully.'));
    } catch (error) {
        next(error);
    }
};

exports.getMyTeam = async (req, res, next) => {
    try {
        const team = await teamService.getMyTeam(req.user.id);
        res.status(200).json(new ApiResponse(200, team, 'My team fetched successfully.'));
    } catch (error) {
        next(error);
    }
};

exports.updateTeam = async (req, res, next) => {
    try {
        const updatedTeam = await teamService.updateTeam(req.params.teamId, req.user.id, req.user.role, req.body);
        res.status(200).json(new ApiResponse(200, updatedTeam, 'Team updated successfully.'));
    } catch (error) {
        next(error);
    }
};

exports.deleteTeam = async (req, res, next) => {
    try {
        await teamService.deleteTeam(req.params.teamId, req.user.id, req.user.role);
        res.status(200).json(new ApiResponse(200, {}, 'Team deleted successfully.'));
    } catch (error) {
        next(error);
    }
};

exports.joinTeamByCode = async (req, res, next) => {
    try {
        const team = await teamService.joinByCode(req.body.joinCode, req.user.id);
        res.status(200).json(new ApiResponse(200, team, 'Joined team successfully.'));
    } catch (error) {
        next(error);
    }
};

exports.joinTeam = async (req, res, next) => {
    try {
        const team = await teamService.joinTeam(req.params.teamId, req.user.id);
        res.status(200).json(new ApiResponse(200, team, 'Joined team successfully.'));
    } catch (error) {
        next(error);
    }
};

exports.leaveTeam = async (req, res, next) => {
    try {
        await teamService.leaveTeam(req.params.teamId, req.user.id);
        res.status(200).json(new ApiResponse(200, {}, 'Left team successfully.'));
    } catch (error) {
        next(error);
    }
};

exports.transferCaptain = async (req, res, next) => {
    try {
        const team = await teamService.transferCaptain(
            req.params.teamId,
            req.user.id,
            req.user.role,
            req.body.newCaptainId
        );
        res.status(200).json(new ApiResponse(200, team, 'Captain role transferred successfully.'));
    } catch (error) {
        next(error);
    }
};

exports.removeMember = async (req, res, next) => {
    try {
        const team = await teamService.removeMember(
            req.params.teamId,
            req.user.id,
            req.user.role,
            req.params.userId
        );
        res.status(200).json(new ApiResponse(200, team, 'Team member removed successfully.'));
    } catch (error) {
        next(error);
    }
};

exports.regenerateJoinCode = async (req, res, next) => {
    try {
        const result = await teamService.regenerateJoinCode(req.params.teamId, req.user.id, req.user.role);
        res.status(200).json(new ApiResponse(200, result, 'Join code regenerated successfully.'));
    } catch (error) {
        next(error);
    }
};

exports.uploadLogo = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json(new ApiResponse(400, null, 'Please upload an image file.'));
        }

        const result = await teamService.uploadLogo(req.params.teamId, req.user.id, req.user.role, req.file.buffer);
        res.status(200).json(new ApiResponse(200, result, 'Team logo uploaded successfully.'));
    } catch (error) {
        next(error);
    }
};

exports.getTeamStats = async (req, res, next) => {
    try {
        const stats = await teamService.getTeamStats(req.params.teamId);
        res.status(200).json(new ApiResponse(200, stats, 'Team statistics fetched successfully.'));
    } catch (error) {
        next(error);
    }
};
