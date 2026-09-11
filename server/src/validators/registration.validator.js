const { z } = require('zod');

// Regex for valid 24-character hex ObjectId
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const createRegistrationSchema = z.object({
    tournamentId: z.string({ required_error: 'Tournament ID is required' })
        .regex(objectIdRegex, 'Invalid Tournament ID format'),
    teamId: z.string({ required_error: 'Team ID is required' })
        .regex(objectIdRegex, 'Invalid Team ID format'),
    notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional().default('')
});

const updateRegistrationStatusSchema = z.object({
    status: z.enum(['APPROVED', 'PENDING', 'REJECTED', 'CANCELLED'], {
        required_error: 'Status is required'
    }),
    notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional()
});

module.exports = {
    createRegistrationSchema,
    updateRegistrationStatusSchema
};
