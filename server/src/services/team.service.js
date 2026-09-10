const crypto = require('crypto');
const Team = require('../models/team.model');
const ApiError = require('../utils/apiError');
const cloudinary = require('../config/cloudinary');

class TeamService {
    /**
     * Generate a unique 6-character team join code.
     */
    _generateJoinCode() {
        return crypto.randomBytes(3).toString('hex').toUpperCase();
    }

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
     * Create a new team.
     */
    async createTeam(userId, data) {
        // Check if user already captains a team
        const existingCaptainTeam = await Team.findOne({ captain: userId });
        if (existingCaptainTeam) {
            throw new ApiError(400, 'You already captain a team. You cannot create another team.');
        }

        // Check if user is already in any team
        const existingMemberTeam = await Team.findOne({ members: userId });
        if (existingMemberTeam) {
            throw new ApiError(400, `You are already a member of team "${existingMemberTeam.name}". Leave your current team first.`);
        }

        // Check if team name already exists (case-insensitive)
        const nameExists = await Team.findOne({
            name: { $regex: new RegExp(`^${data.name.trim()}$`, 'i') }
        });
        if (nameExists) {
            throw new ApiError(409, 'A team with this name already exists.');
        }

        let joinCode = this._generateJoinCode();
        // Ensure uniqueness of join code
        while (await Team.findOne({ joinCode })) {
            joinCode = this._generateJoinCode();
        }

        const team = await Team.create({
            name: data.name.trim(),
            tag: data.tag.trim().toUpperCase(),
            game: data.game.trim(),
            description: data.description ? data.description.trim() : '',
            captain: userId,
            members: [userId],
            joinCode
        });

        return await this.getTeamById(team._id);
    }

    /**
     * Get paginated list of teams with filters and search.
     */
    async getTeams(query = {}) {
        const page = Math.max(1, parseInt(query.page, 10) || 1);
        const limit = Math.max(1, Math.min(50, parseInt(query.limit, 10) || 10));
        const skip = (page - 1) * limit;

        const filter = {};

        if (query.game && query.game !== 'all') {
            filter.game = { $regex: new RegExp(`^${query.game.trim()}$`, 'i') };
        }

        if (query.search) {
            const searchRegex = new RegExp(query.search.trim(), 'i');
            filter.$or = [
                { name: searchRegex },
                { tag: searchRegex },
                { game: searchRegex }
            ];
        }

        const [teams, totalItems] = await Promise.all([
            Team.find(filter)
                .populate('captain', 'name username avatar role')
                .populate('members', 'name username avatar role')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Team.countDocuments(filter)
        ]);

        return {
            items: teams,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(totalItems / limit) || 1,
                totalItems
            }
        };
    }

    /**
     * Get team details by team ID.
     */
    async getTeamById(teamId) {
        const team = await Team.findById(teamId)
            .populate('captain', 'name username email avatar role createdAt bio country')
            .populate('members', 'name username email avatar role createdAt bio country')
            .lean();

        if (!team) {
            throw new ApiError(404, 'Team not found');
        }

        return team;
    }

    /**
     * Get the team for the currently logged in user (where user is captain or member).
     */
    async getMyTeam(userId) {
        const team = await Team.findOne({ members: userId })
            .populate('captain', 'name username email avatar role createdAt bio country')
            .populate('members', 'name username email avatar role createdAt bio country')
            .lean();

        return team || null;
    }

    /**
     * Update team details.
     */
    async updateTeam(teamId, userId, userRole, updateData) {
        const team = await Team.findById(teamId);
        if (!team) {
            throw new ApiError(404, 'Team not found');
        }

        const isCaptain = team.captain.toString() === userId.toString();
        const isAdmin = userRole === 'ADMIN';

        if (!isCaptain && !isAdmin) {
            throw new ApiError(403, 'Only the team captain or an admin can update team details');
        }

        if (updateData.name && updateData.name.trim() !== team.name) {
            const nameExists = await Team.findOne({
                _id: { $ne: teamId },
                name: { $regex: new RegExp(`^${updateData.name.trim()}$`, 'i') }
            });
            if (nameExists) {
                throw new ApiError(409, 'A team with this name already exists.');
            }
            team.name = updateData.name.trim();
        }

        if (updateData.tag) team.tag = updateData.tag.trim().toUpperCase();
        if (updateData.game) team.game = updateData.game.trim();
        if (updateData.description !== undefined) team.description = updateData.description.trim();

        await team.save();
        return await this.getTeamById(teamId);
    }

    /**
     * Delete team.
     */
    async deleteTeam(teamId, userId, userRole) {
        const team = await Team.findById(teamId);
        if (!team) {
            throw new ApiError(404, 'Team not found');
        }

        const isCaptain = team.captain.toString() === userId.toString();
        const isAdmin = userRole === 'ADMIN';

        if (!isCaptain && !isAdmin) {
            throw new ApiError(403, 'Only the team captain or an admin can delete the team');
        }

        // Remove logo from Cloudinary if exists
        if (team.logo) {
            const publicId = this._extractPublicId(team.logo);
            if (publicId) {
                try {
                    await cloudinary.uploader.destroy(publicId);
                } catch (err) {
                    console.error('Failed to delete team logo from Cloudinary:', err.message);
                }
            }
        }

        await Team.findByIdAndDelete(teamId);
        return true;
    }

    /**
     * Join team via join code.
     */
    async joinByCode(joinCode, userId) {
        const team = await Team.findOne({ joinCode: joinCode.trim().toUpperCase() });
        if (!team) {
            throw new ApiError(404, 'Invalid team join code');
        }

        // Check if user is already in this team
        if (team.members.some((m) => m.toString() === userId.toString())) {
            throw new ApiError(400, 'You are already a member of this team');
        }

        // Check if user is already in another team
        const existingTeam = await Team.findOne({ members: userId });
        if (existingTeam) {
            throw new ApiError(400, `You are already a member of team "${existingTeam.name}". Leave your current team first.`);
        }

        team.members.push(userId);
        await team.save();

        return await this.getTeamById(team._id);
    }

    /**
     * Join team directly by teamId.
     */
    async joinTeam(teamId, userId) {
        const team = await Team.findById(teamId);
        if (!team) {
            throw new ApiError(404, 'Team not found');
        }

        if (team.members.some((m) => m.toString() === userId.toString())) {
            throw new ApiError(400, 'You are already a member of this team');
        }

        const existingTeam = await Team.findOne({ members: userId });
        if (existingTeam) {
            throw new ApiError(400, `You are already a member of team "${existingTeam.name}". Leave your current team first.`);
        }

        team.members.push(userId);
        await team.save();

        return await this.getTeamById(teamId);
    }

    /**
     * Leave team.
     */
    async leaveTeam(teamId, userId) {
        const team = await Team.findById(teamId);
        if (!team) {
            throw new ApiError(404, 'Team not found');
        }

        const isMember = team.members.some((m) => m.toString() === userId.toString());
        if (!isMember) {
            throw new ApiError(400, 'You are not a member of this team');
        }

        const isCaptain = team.captain.toString() === userId.toString();
        if (isCaptain) {
            if (team.members.length > 1) {
                throw new ApiError(400, 'Team captain cannot leave without transferring captaincy or deleting the team.');
            } else {
                // Sole member and captain leaves -> delete the team
                return await this.deleteTeam(teamId, userId, 'ADMIN');
            }
        }

        team.members = team.members.filter((m) => m.toString() !== userId.toString());
        await team.save();

        return true;
    }

    /**
     * Transfer captaincy to another member in the team.
     */
    async transferCaptain(teamId, userId, userRole, newCaptainId) {
        const team = await Team.findById(teamId);
        if (!team) {
            throw new ApiError(404, 'Team not found');
        }

        const isCaptain = team.captain.toString() === userId.toString();
        const isAdmin = userRole === 'ADMIN';

        if (!isCaptain && !isAdmin) {
            throw new ApiError(403, 'Only the team captain or an admin can transfer captaincy');
        }

        if (userId.toString() === newCaptainId.toString()) {
            throw new ApiError(400, 'You are already the captain');
        }

        const isNewCaptainMember = team.members.some((m) => m.toString() === newCaptainId.toString());
        if (!isNewCaptainMember) {
            throw new ApiError(400, 'The designated new captain must be an active member of this team');
        }

        team.captain = newCaptainId;
        await team.save();

        return await this.getTeamById(teamId);
    }

    /**
     * Remove / Kick member from team.
     */
    async removeMember(teamId, userId, userRole, targetMemberId) {
        const team = await Team.findById(teamId);
        if (!team) {
            throw new ApiError(404, 'Team not found');
        }

        const isCaptain = team.captain.toString() === userId.toString();
        const isAdmin = userRole === 'ADMIN';

        if (!isCaptain && !isAdmin) {
            throw new ApiError(403, 'Only the team captain or an admin can remove team members');
        }

        if (targetMemberId.toString() === team.captain.toString()) {
            throw new ApiError(400, 'Cannot remove the team captain. Transfer captaincy first.');
        }

        const isMember = team.members.some((m) => m.toString() === targetMemberId.toString());
        if (!isMember) {
            throw new ApiError(400, 'User is not a member of this team');
        }

        team.members = team.members.filter((m) => m.toString() !== targetMemberId.toString());
        await team.save();

        return await this.getTeamById(teamId);
    }

    /**
     * Regenerate join code.
     */
    async regenerateJoinCode(teamId, userId, userRole) {
        const team = await Team.findById(teamId);
        if (!team) {
            throw new ApiError(404, 'Team not found');
        }

        const isCaptain = team.captain.toString() === userId.toString();
        const isAdmin = userRole === 'ADMIN';

        if (!isCaptain && !isAdmin) {
            throw new ApiError(403, 'Only the team captain or an admin can regenerate the join code');
        }

        let joinCode = this._generateJoinCode();
        while (await Team.findOne({ joinCode })) {
            joinCode = this._generateJoinCode();
        }

        team.joinCode = joinCode;
        await team.save();

        return { joinCode };
    }

    /**
     * Upload team logo.
     */
    async uploadLogo(teamId, userId, userRole, fileBuffer) {
        const team = await Team.findById(teamId);
        if (!team) {
            throw new ApiError(404, 'Team not found');
        }

        const isCaptain = team.captain.toString() === userId.toString();
        const isAdmin = userRole === 'ADMIN';

        if (!isCaptain && !isAdmin) {
            throw new ApiError(403, 'Only the team captain or an admin can update the team logo');
        }

        // Delete existing logo from Cloudinary if exists
        if (team.logo) {
            const publicId = this._extractPublicId(team.logo);
            if (publicId) {
                try {
                    await cloudinary.uploader.destroy(publicId);
                } catch (err) {
                    console.error('Failed to delete old team logo from Cloudinary:', err.message);
                }
            }
        }

        // Upload new logo
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'earena/teams',
                    transformation: [
                        { width: 400, height: 400, crop: 'fill' }
                    ]
                },
                (error, result) => {
                    if (error) return reject(new ApiError(500, 'Team logo upload failed'));
                    resolve(result);
                }
            );
            uploadStream.end(fileBuffer);
        });

        team.logo = result.secure_url;
        await team.save();

        return { logo: result.secure_url };
    }

    /**
     * Get team dashboard / stats.
     */
    async getTeamStats(teamId) {
        const team = await Team.findById(teamId);
        if (!team) {
            throw new ApiError(404, 'Team not found');
        }

        return {
            teamId: team._id,
            name: team.name,
            tag: team.tag,
            membersCount: team.members.length,
            tournamentsPlayed: 0,
            wins: 0,
            losses: 0,
            winRate: 0
        };
    }
}

module.exports = new TeamService();
