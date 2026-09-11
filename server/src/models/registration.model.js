const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
    {
        tournament: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tournament',
            required: [true, 'Tournament ID is required']
        },
        team: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team',
            required: [true, 'Team ID is required']
        },
        registeredBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Registered by user is required']
        },
        players: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true
                },
                role: {
                    type: String,
                    enum: ['CAPTAIN', 'PLAYER', 'SUBSTITUTE'],
                    default: 'PLAYER'
                },
                registeredAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        status: {
            type: String,
            enum: ['APPROVED', 'PENDING', 'REJECTED', 'CANCELLED'],
            default: 'APPROVED'
        },
        paymentStatus: {
            type: String,
            enum: ['NOT_REQUIRED', 'PENDING', 'COMPLETED', 'FAILED'],
            default: 'NOT_REQUIRED'
        },
        notes: {
            type: String,
            trim: true,
            maxlength: [500, 'Notes cannot exceed 500 characters'],
            default: ''
        }
    },
    {
        timestamps: true
    }
);

// Prevent duplicate registrations for the same team in the same tournament
registrationSchema.index({ tournament: 1, team: 1 }, { unique: true });

// Secondary indexes for queries
registrationSchema.index({ tournament: 1, status: 1 });
registrationSchema.index({ team: 1 });
registrationSchema.index({ registeredBy: 1 });
registrationSchema.index({ 'players.user': 1 });

const Registration = mongoose.model('Registration', registrationSchema);

module.exports = Registration;
