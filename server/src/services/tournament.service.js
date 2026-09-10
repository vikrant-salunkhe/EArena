const Tournament = require('../models/tournament.model');
const ApiError = require('../utils/apiError');
const cloudinary = require('../config/cloudinary');

class TournamentService {
    /**
     * Extract Cloudinary public_id from a secure_url.
     */
    _extractPublicId(url) {
        if (!url) return null;
        try {
            const parts = url.split('/upload/');
            if (parts.length < 2) return null;
            const pathAfterUpload = parts[1].replace(/^v\d+\//, '');
            return pathAfterUpload.replace(/\.[^/.]+$/, '');
        } catch {
            return null;
        }
    }

    /**
     * Create a new tournament in DRAFT status.
     */
    async createTournament(organizerId, data) {
        const tournament = await Tournament.create({
            title: data.title.trim(),
            game: data.game.trim(),
            format: data.format || 'Single Elimination',
            description: data.description ? data.description.trim() : '',
            rules: data.rules ? data.rules.trim() : '',
            organizer: organizerId,
            entryFee: Number(data.entryFee) || 0,
            prizePool: Number(data.prizePool) || 0,
            teamSize: Number(data.teamSize) || 4,
            maxTeams: Number(data.maxTeams) || 16,
            registrationDeadline: new Date(data.registrationDeadline),
            startDate: new Date(data.startDate),
            endDate: data.endDate ? new Date(data.endDate) : undefined,
            status: 'DRAFT'
        });

        return await this.getTournamentById(tournament._id);
    }

    /**
     * Get paginated list of tournaments with flexible filtering and search.
     */
    async getTournaments(query = {}) {
        const page = Math.max(1, parseInt(query.page, 10) || 1);
        const limit = Math.max(1, Math.min(50, parseInt(query.limit, 10) || 10));
        const skip = (page - 1) * limit;

        const filter = {};

        // Exclude drafts from general public listing unless specifically asked by organizer or status filter
        if (query.status && query.status !== 'all') {
            filter.status = query.status.toUpperCase();
        } else if (!query.organizer) {
            filter.status = { $ne: 'DRAFT' };
        }

        if (query.game && query.game !== 'all') {
            filter.game = { $regex: new RegExp(`^${query.game.trim()}$`, 'i') };
        }

        if (query.organizer) {
            filter.organizer = query.organizer;
        }

        if (query.search) {
            const searchRegex = new RegExp(query.search.trim(), 'i');
            filter.$or = [
                { title: searchRegex },
                { game: searchRegex }
            ];
        }

        const [tournaments, totalItems] = await Promise.all([
            Tournament.find(filter)
                .populate('organizer', 'name username avatar email role')
                .sort(query.sort ? query.sort : { startDate: 1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Tournament.countDocuments(filter)
        ]);

        return {
            items: tournaments,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(totalItems / limit) || 1,
                totalItems
            }
        };
    }

    /**
     * Get tournament details by ID.
     */
    async getTournamentById(tournamentId) {
        const tournament = await Tournament.findById(tournamentId)
            .populate('organizer', 'name username avatar email role createdAt bio')
            .lean();

        if (!tournament) {
            throw new ApiError(404, 'Tournament not found');
        }

        return tournament;
    }

    /**
     * Get tournaments organized by a specific user.
     */
    async getMyOrganizedTournaments(organizerId) {
        const tournaments = await Tournament.find({ organizer: organizerId })
            .populate('organizer', 'name username avatar email role')
            .sort({ createdAt: -1 })
            .lean();

        return tournaments;
    }

    /**
     * Update tournament details.
     */
    async updateTournament(tournamentId, userId, userRole, updateData) {
        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
            throw new ApiError(404, 'Tournament not found');
        }

        const isOwner = tournament.organizer.toString() === userId.toString();
        const isAdmin = userRole === 'ADMIN';

        if (!isOwner && !isAdmin) {
            throw new ApiError(403, 'Only the tournament organizer or an admin can update this tournament');
        }

        if (tournament.status === 'LIVE' || tournament.status === 'COMPLETED') {
            throw new ApiError(400, `Cannot edit a tournament that is already ${tournament.status}`);
        }

        const editableFields = [
            'title', 'game', 'format', 'description', 'rules',
            'entryFee', 'prizePool', 'teamSize', 'maxTeams',
            'registrationDeadline', 'startDate', 'endDate'
        ];

        for (const field of editableFields) {
            if (updateData[field] !== undefined) {
                if (field === 'registrationDeadline' || field === 'startDate' || field === 'endDate') {
                    tournament[field] = new Date(updateData[field]);
                } else if (field === 'entryFee' || field === 'prizePool' || field === 'teamSize' || field === 'maxTeams') {
                    tournament[field] = Number(updateData[field]);
                } else {
                    tournament[field] = updateData[field];
                }
            }
        }

        // Validate dates if updated
        if (tournament.registrationDeadline > tournament.startDate) {
            throw new ApiError(400, 'Registration deadline cannot be after start date');
        }

        await tournament.save();
        return await this.getTournamentById(tournamentId);
    }

    /**
     * Delete tournament.
     */
    async deleteTournament(tournamentId, userId, userRole) {
        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
            throw new ApiError(404, 'Tournament not found');
        }

        const isOwner = tournament.organizer.toString() === userId.toString();
        const isAdmin = userRole === 'ADMIN';

        if (!isOwner && !isAdmin) {
            throw new ApiError(403, 'Only the tournament organizer or an admin can delete this tournament');
        }

        if (tournament.status !== 'DRAFT' && tournament.status !== 'CANCELLED') {
            throw new ApiError(400, 'Only tournaments in DRAFT or CANCELLED status can be deleted. Cancel the tournament first.');
        }

        // Clean up Cloudinary banner
        if (tournament.banner) {
            const publicId = this._extractPublicId(tournament.banner);
            if (publicId) {
                try {
                    await cloudinary.uploader.destroy(publicId);
                } catch (err) {
                    console.error('Failed to delete tournament banner from Cloudinary:', err.message);
                }
            }
        }

        await Tournament.findByIdAndDelete(tournamentId);
        return true;
    }

    /**
     * Publish tournament (DRAFT -> UPCOMING).
     */
    async publishTournament(tournamentId, userId, userRole) {
        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
            throw new ApiError(404, 'Tournament not found');
        }

        const isOwner = tournament.organizer.toString() === userId.toString();
        const isAdmin = userRole === 'ADMIN';

        if (!isOwner && !isAdmin) {
            throw new ApiError(403, 'Only the tournament organizer or an admin can publish this tournament');
        }

        if (tournament.status !== 'DRAFT') {
            throw new ApiError(400, `Tournament is already in ${tournament.status} status`);
        }

        tournament.status = 'UPCOMING';
        await tournament.save();

        return await this.getTournamentById(tournamentId);
    }

    /**
     * Start tournament (UPCOMING -> LIVE).
     */
    async startTournament(tournamentId, userId, userRole) {
        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
            throw new ApiError(404, 'Tournament not found');
        }

        const isOwner = tournament.organizer.toString() === userId.toString();
        const isAdmin = userRole === 'ADMIN';

        if (!isOwner && !isAdmin) {
            throw new ApiError(403, 'Only the tournament organizer or an admin can start this tournament');
        }

        if (tournament.status !== 'UPCOMING') {
            throw new ApiError(400, `Tournament cannot be started from ${tournament.status} status`);
        }

        tournament.status = 'LIVE';
        await tournament.save();

        return await this.getTournamentById(tournamentId);
    }

    /**
     * End tournament (LIVE -> COMPLETED).
     */
    async endTournament(tournamentId, userId, userRole) {
        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
            throw new ApiError(404, 'Tournament not found');
        }

        const isOwner = tournament.organizer.toString() === userId.toString();
        const isAdmin = userRole === 'ADMIN';

        if (!isOwner && !isAdmin) {
            throw new ApiError(403, 'Only the tournament organizer or an admin can end this tournament');
        }

        if (tournament.status !== 'LIVE') {
            throw new ApiError(400, `Tournament cannot be completed from ${tournament.status} status`);
        }

        tournament.status = 'COMPLETED';
        if (!tournament.endDate) {
            tournament.endDate = new Date();
        }
        await tournament.save();

        return await this.getTournamentById(tournamentId);
    }

    /**
     * Cancel tournament.
     */
    async cancelTournament(tournamentId, userId, userRole) {
        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
            throw new ApiError(404, 'Tournament not found');
        }

        const isOwner = tournament.organizer.toString() === userId.toString();
        const isAdmin = userRole === 'ADMIN';

        if (!isOwner && !isAdmin) {
            throw new ApiError(403, 'Only the tournament organizer or an admin can cancel this tournament');
        }

        if (tournament.status === 'COMPLETED') {
            throw new ApiError(400, 'Cannot cancel an already completed tournament');
        }

        tournament.status = 'CANCELLED';
        await tournament.save();

        return await this.getTournamentById(tournamentId);
    }

    /**
     * Upload / replace tournament banner.
     */
    async uploadBanner(tournamentId, userId, userRole, fileBuffer) {
        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
            throw new ApiError(404, 'Tournament not found');
        }

        const isOwner = tournament.organizer.toString() === userId.toString();
        const isAdmin = userRole === 'ADMIN';

        if (!isOwner && !isAdmin) {
            throw new ApiError(403, 'Only the tournament organizer or an admin can upload a banner');
        }

        // Delete old banner if exists
        if (tournament.banner) {
            const publicId = this._extractPublicId(tournament.banner);
            if (publicId) {
                try {
                    await cloudinary.uploader.destroy(publicId);
                } catch (err) {
                    console.error('Failed to delete old tournament banner from Cloudinary:', err.message);
                }
            }
        }

        // Upload new banner
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'earena/tournaments',
                    transformation: [
                        { width: 1280, height: 720, crop: 'fill' }
                    ]
                },
                (error, result) => {
                    if (error) return reject(new ApiError(500, 'Banner upload failed'));
                    resolve(result);
                }
            );
            uploadStream.end(fileBuffer);
        });

        tournament.banner = result.secure_url;
        await tournament.save();

        return { banner: result.secure_url };
    }
}

module.exports = new TournamentService();
