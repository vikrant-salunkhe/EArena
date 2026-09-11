const Registration = require('../models/registration.model');
const Tournament = require('../models/tournament.model');
const Team = require('../models/team.model');
const ApiError = require('../utils/apiError');

class RegistrationService {
    /**
     * Register a team for a tournament.
     * Enforces captain authorization, roster size, registration deadline, and tournament capacity.
     */
    async registerTeam(userId, data) {
        const { tournamentId, teamId, notes } = data;

        // 1. Fetch tournament
        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
            throw new ApiError(404, 'Tournament not found.');
        }

        // Check tournament status
        if (tournament.status !== 'UPCOMING') {
            if (tournament.status === 'DRAFT') {
                throw new ApiError(400, 'Registrations are not open yet. Tournament is still in draft.');
            }
            if (tournament.status === 'LIVE' || tournament.status === 'COMPLETED') {
                throw new ApiError(400, 'Registrations are closed. Tournament is already active or finished.');
            }
            if (tournament.status === 'CANCELLED') {
                throw new ApiError(400, 'Cannot register for a cancelled tournament.');
            }
        }

        // Check registration deadline
        const now = new Date();
        if (now > new Date(tournament.registrationDeadline)) {
            throw new ApiError(400, 'Registration deadline has passed for this tournament.');
        }

        // 2. Fetch team
        const team = await Team.findById(teamId).populate('captain', 'name username email avatar').populate('members', 'name username email avatar');
        if (!team) {
            throw new ApiError(404, 'Team not found.');
        }

        // Verify that the user registering is the team's captain
        const isCaptain = team.captain._id.toString() === userId.toString();
        if (!isCaptain) {
            throw new ApiError(403, 'Only the team captain is permitted to register the team.');
        }

        // Verify team size (captain + members)
        const totalRosterCount = 1 + (team.members ? team.members.length : 0);
        if (totalRosterCount < tournament.teamSize) {
            throw new ApiError(
                400,
                `Your squad has ${totalRosterCount} player(s), but this tournament requires a minimum squad size of ${tournament.teamSize}. Please recruit more players before registering.`
            );
        }

        // Check if maximum tournament capacity has been reached
        const approvedCount = await Registration.countDocuments({
            tournament: tournamentId,
            status: { $in: ['APPROVED', 'PENDING'] }
        });

        if (approvedCount >= tournament.maxTeams) {
            throw new ApiError(400, 'Tournament has reached maximum team capacity. Registration is full.');
        }

        // Check if team is already registered
        const existingRegistration = await Registration.findOne({
            tournament: tournamentId,
            team: teamId
        });

        if (existingRegistration) {
            if (existingRegistration.status === 'CANCELLED') {
                // Allow re-activating cancelled registration
                existingRegistration.status = 'APPROVED';
                existingRegistration.registeredBy = userId;
                existingRegistration.notes = notes || '';
                // Update players roster snapshot
                existingRegistration.players = [
                    { user: team.captain._id, role: 'CAPTAIN', registeredAt: new Date() },
                    ...team.members.map((m) => ({ user: m._id, role: 'PLAYER', registeredAt: new Date() }))
                ];
                await existingRegistration.save();
                return await this.getRegistrationById(existingRegistration._id);
            }
            throw new ApiError(400, 'This team is already registered for this tournament.');
        }

        // Prepare player roster snapshot
        const playersSnapshot = [
            {
                user: team.captain._id,
                role: 'CAPTAIN',
                registeredAt: new Date()
            },
            ...(team.members || []).map((m) => ({
                user: m._id,
                role: 'PLAYER',
                registeredAt: new Date()
            }))
        ];

        // Create new registration
        const registration = await Registration.create({
            tournament: tournamentId,
            team: teamId,
            registeredBy: userId,
            players: playersSnapshot,
            status: 'APPROVED',
            paymentStatus: tournament.entryFee === 0 ? 'NOT_REQUIRED' : 'COMPLETED',
            notes: notes ? notes.trim() : ''
        });

        return await this.getRegistrationById(registration._id);
    }

    /**
     * Get list of registrations with filtering and pagination.
     */
    async getRegistrations(query = {}) {
        const page = Math.max(1, parseInt(query.page, 10) || 1);
        const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 20));
        const skip = (page - 1) * limit;

        const filter = {};

        if (query.tournamentId) {
            filter.tournament = query.tournamentId;
        }

        if (query.teamId) {
            filter.team = query.teamId;
        }

        if (query.status && query.status !== 'all') {
            filter.status = query.status.toUpperCase();
        }

        if (query.registeredBy) {
            filter.registeredBy = query.registeredBy;
        }

        const [items, totalItems] = await Promise.all([
            Registration.find(filter)
                .populate({
                    path: 'team',
                    select: 'name tag logo game captain members',
                    populate: [
                        { path: 'captain', select: 'name username avatar email' },
                        { path: 'members', select: 'name username avatar email' }
                    ]
                })
                .populate({
                    path: 'tournament',
                    select: 'title game format status startDate registrationDeadline banner entryFee prizePool organizer maxTeams teamSize'
                })
                .populate('registeredBy', 'name username avatar email')
                .populate('players.user', 'name username avatar email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Registration.countDocuments(filter)
        ]);

        return {
            items,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(totalItems / limit) || 1,
                totalItems
            }
        };
    }

    /**
     * Get single registration by ID.
     */
    async getRegistrationById(registrationId) {
        const registration = await Registration.findById(registrationId)
            .populate({
                path: 'team',
                select: 'name tag logo game captain members',
                populate: [
                    { path: 'captain', select: 'name username avatar email' },
                    { path: 'members', select: 'name username avatar email' }
                ]
            })
            .populate({
                path: 'tournament',
                select: 'title game format status startDate registrationDeadline banner entryFee prizePool organizer maxTeams teamSize',
                populate: { path: 'organizer', select: 'name username avatar email' }
            })
            .populate('registeredBy', 'name username avatar email')
            .populate('players.user', 'name username avatar email')
            .lean();

        if (!registration) {
            throw new ApiError(404, 'Registration record not found.');
        }

        return registration;
    }

    /**
     * Get registrations for all teams where user is either captain or member.
     */
    async getMyRegistrations(userId) {
        // Find all teams the user belongs to
        const userTeams = await Team.find({
            $or: [{ captain: userId }, { members: userId }]
        }).select('_id');

        const teamIds = userTeams.map((t) => t._id);

        const registrations = await Registration.find({
            $or: [
                { registeredBy: userId },
                { team: { $in: teamIds } }
            ]
        })
            .populate({
                path: 'team',
                select: 'name tag logo game captain members',
                populate: { path: 'captain', select: 'name username avatar' }
            })
            .populate({
                path: 'tournament',
                select: 'title game format status startDate registrationDeadline banner entryFee prizePool organizer maxTeams teamSize',
                populate: { path: 'organizer', select: 'name username avatar' }
            })
            .populate('registeredBy', 'name username avatar')
            .populate('players.user', 'name username avatar')
            .sort({ createdAt: -1 })
            .lean();

        return registrations;
    }

    /**
     * Check if user's captained team or user is registered for a specific tournament.
     */
    async checkRegistrationStatus(tournamentId, userId) {
        // Find user's captained teams
        const captainTeams = await Team.find({ captain: userId }).select('_id');
        const teamIds = captainTeams.map((t) => t._id);

        const registration = await Registration.findOne({
            tournament: tournamentId,
            team: { $in: teamIds },
            status: { $ne: 'CANCELLED' }
        })
            .populate('team', 'name tag logo')
            .lean();

        return {
            isRegistered: !!registration,
            registration: registration || null
        };
    }

    /**
     * Update registration status (Organizer or Admin only).
     */
    async updateRegistrationStatus(registrationId, userId, userRole, updateData) {
        const registration = await Registration.findById(registrationId).populate('tournament');
        if (!registration) {
            throw new ApiError(404, 'Registration not found.');
        }

        const isOrganizer =
            registration.tournament.organizer.toString() === userId.toString() ||
            userRole === 'ADMIN';

        if (!isOrganizer) {
            throw new ApiError(403, 'Only the tournament organizer or an admin can update registration status.');
        }

        if (updateData.status) {
            registration.status = updateData.status;
        }

        if (updateData.notes !== undefined) {
            registration.notes = updateData.notes;
        }

        await registration.save();
        return await this.getRegistrationById(registration._id);
    }

    /**
     * Cancel a registration.
     * Team captain can cancel before deadline. Organizer or Admin can cancel anytime.
     */
    async cancelRegistration(registrationId, userId, userRole) {
        const registration = await Registration.findById(registrationId)
            .populate('tournament')
            .populate('team');

        if (!registration) {
            throw new ApiError(404, 'Registration not found.');
        }

        const isCaptain = registration.team.captain.toString() === userId.toString();
        const isOrganizer =
            registration.tournament.organizer.toString() === userId.toString() ||
            userRole === 'ADMIN';

        if (!isCaptain && !isOrganizer) {
            throw new ApiError(403, 'You do not have permission to cancel this registration.');
        }

        // If captain is cancelling, ensure deadline has not passed
        if (isCaptain && !isOrganizer) {
            const now = new Date();
            if (now > new Date(registration.tournament.registrationDeadline)) {
                throw new ApiError(
                    400,
                    'Cannot cancel registration after the registration deadline has passed. Please contact the tournament organizer.'
                );
            }
        }

        registration.status = 'CANCELLED';
        await registration.save();

        return { message: 'Registration cancelled successfully.' };
    }
}

module.exports = new RegistrationService();
