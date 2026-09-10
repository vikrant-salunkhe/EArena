const { z } = require('zod');

const createTeamSchema = z.object({
    name: z.string()
        .min(2, 'Team name must be at least 2 characters')
        .max(50, 'Team name cannot exceed 50 characters')
        .trim(),
    tag: z.string()
        .min(2, 'Team tag must be at least 2 characters')
        .max(5, 'Team tag cannot exceed 5 characters')
        .toUpperCase()
        .trim(),
    game: z.string()
        .min(2, 'Game name must be at least 2 characters')
        .trim(),
    description: z.string()
        .max(500, 'Description cannot exceed 500 characters')
        .optional()
        .default('')
});

const updateTeamSchema = z.object({
    name: z.string()
        .min(2, 'Team name must be at least 2 characters')
        .max(50, 'Team name cannot exceed 50 characters')
        .trim()
        .optional(),
    tag: z.string()
        .min(2, 'Team tag must be at least 2 characters')
        .max(5, 'Team tag cannot exceed 5 characters')
        .toUpperCase()
        .trim()
        .optional(),
    game: z.string()
        .min(2, 'Game name must be at least 2 characters')
        .trim()
        .optional(),
    description: z.string()
        .max(500, 'Description cannot exceed 500 characters')
        .optional()
});

const transferCaptainSchema = z.object({
    newCaptainId: z.string().min(1, 'New captain ID is required')
});

const joinTeamByCodeSchema = z.object({
    joinCode: z.string()
        .min(4, 'Join code must be at least 4 characters')
        .max(12, 'Join code cannot exceed 12 characters')
        .toUpperCase()
        .trim()
});

module.exports = {
    createTeamSchema,
    updateTeamSchema,
    transferCaptainSchema,
    joinTeamByCodeSchema
};
