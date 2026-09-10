const { z } = require('zod');

const createTournamentSchema = z.object({
    title: z.string()
        .min(3, 'Title must be at least 3 characters')
        .max(100, 'Title cannot exceed 100 characters')
        .trim(),
    game: z.string()
        .min(2, 'Game name must be at least 2 characters')
        .trim(),
    format: z.enum(['Single Elimination', 'Double Elimination', 'Round Robin'])
        .default('Single Elimination'),
    description: z.string()
        .max(2000, 'Description cannot exceed 2000 characters')
        .optional()
        .default(''),
    rules: z.string()
        .max(3000, 'Rules cannot exceed 3000 characters')
        .optional()
        .default(''),
    entryFee: z.coerce.number()
        .min(0, 'Entry fee cannot be negative')
        .default(0),
    prizePool: z.coerce.number()
        .min(0, 'Prize pool cannot be negative')
        .default(0),
    teamSize: z.coerce.number()
        .int('Team size must be an integer')
        .min(1, 'Team size must be at least 1')
        .max(10, 'Team size cannot exceed 10')
        .default(4),
    maxTeams: z.coerce.number()
        .int('Max teams must be an integer')
        .min(2, 'Max teams must be at least 2')
        .max(128, 'Max teams cannot exceed 128')
        .default(16),
    registrationDeadline: z.string()
        .datetime({ message: 'Invalid registration deadline date format' })
        .or(z.string().min(1, 'Registration deadline is required')),
    startDate: z.string()
        .datetime({ message: 'Invalid start date format' })
        .or(z.string().min(1, 'Start date is required')),
    endDate: z.string().optional()
}).refine((data) => {
    const deadline = new Date(data.registrationDeadline);
    const start = new Date(data.startDate);
    return deadline <= start;
}, {
    message: 'Registration deadline must be on or before the tournament start date',
    path: ['registrationDeadline']
});

const updateTournamentSchema = z.object({
    title: z.string().min(3).max(100).trim().optional(),
    game: z.string().min(2).trim().optional(),
    format: z.enum(['Single Elimination', 'Double Elimination', 'Round Robin']).optional(),
    description: z.string().max(2000).optional(),
    rules: z.string().max(3000).optional(),
    entryFee: z.coerce.number().min(0).optional(),
    prizePool: z.coerce.number().min(0).optional(),
    teamSize: z.coerce.number().int().min(1).max(10).optional(),
    maxTeams: z.coerce.number().int().min(2).max(128).optional(),
    registrationDeadline: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional()
});

module.exports = {
    createTournamentSchema,
    updateTournamentSchema
};
