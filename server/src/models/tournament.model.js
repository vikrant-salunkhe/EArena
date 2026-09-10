const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Tournament title is required'],
            trim: true,
            minlength: [3, 'Title must be at least 3 characters'],
            maxlength: [100, 'Title cannot exceed 100 characters']
        },
        game: {
            type: String,
            required: [true, 'Game name is required'],
            trim: true
        },
        format: {
            type: String,
            enum: ['Single Elimination', 'Double Elimination', 'Round Robin'],
            default: 'Single Elimination'
        },
        banner: {
            type: String,
            default: ''
        },
        description: {
            type: String,
            default: '',
            trim: true,
            maxlength: [2000, 'Description cannot exceed 2000 characters']
        },
        rules: {
            type: String,
            default: '',
            trim: true,
            maxlength: [3000, 'Rules cannot exceed 3000 characters']
        },
        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Tournament must have an organizer']
        },
        entryFee: {
            type: Number,
            default: 0,
            min: [0, 'Entry fee cannot be negative']
        },
        prizePool: {
            type: Number,
            default: 0,
            min: [0, 'Prize pool cannot be negative']
        },
        teamSize: {
            type: Number,
            default: 4,
            min: [1, 'Team size must be at least 1'],
            max: [10, 'Team size cannot exceed 10']
        },
        maxTeams: {
            type: Number,
            default: 16,
            min: [2, 'Max teams must be at least 2'],
            max: [128, 'Max teams cannot exceed 128']
        },
        registrationDeadline: {
            type: Date,
            required: [true, 'Registration deadline is required']
        },
        startDate: {
            type: Date,
            required: [true, 'Tournament start date is required']
        },
        endDate: {
            type: Date
        },
        status: {
            type: String,
            enum: ['DRAFT', 'UPCOMING', 'LIVE', 'COMPLETED', 'CANCELLED'],
            default: 'DRAFT'
        }
    },
    {
        timestamps: true
    }
);

// Indexes
tournamentSchema.index({ title: 'text', game: 'text' });
tournamentSchema.index({ game: 1 });
tournamentSchema.index({ status: 1 });
tournamentSchema.index({ startDate: 1 });
tournamentSchema.index({ organizer: 1 });

const Tournament = mongoose.model('Tournament', tournamentSchema);
module.exports = Tournament;
