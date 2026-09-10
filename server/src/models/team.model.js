const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Team name is required'],
            unique: true,
            trim: true,
            minlength: [2, 'Team name must be at least 2 characters'],
            maxlength: [50, 'Team name cannot exceed 50 characters']
        },
        tag: {
            type: String,
            required: [true, 'Team tag is required'],
            trim: true,
            uppercase: true,
            minlength: [2, 'Team tag must be at least 2 characters'],
            maxlength: [5, 'Team tag cannot exceed 5 characters']
        },
        game: {
            type: String,
            required: [true, 'Game name is required'],
            trim: true
        },
        description: {
            type: String,
            default: '',
            trim: true,
            maxlength: [500, 'Description cannot exceed 500 characters']
        },
        logo: {
            type: String,
            default: ''
        },
        captain: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Team must have a captain']
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        joinCode: {
            type: String,
            unique: true,
            trim: true,
            uppercase: true
        }
    },
    {
        timestamps: true
    }
);

// Indexes for fast lookup and search
teamSchema.index({ name: 'text', tag: 'text' });
teamSchema.index({ game: 1 });
teamSchema.index({ captain: 1 });

const Team = mongoose.model('Team', teamSchema);

module.exports = Team;
