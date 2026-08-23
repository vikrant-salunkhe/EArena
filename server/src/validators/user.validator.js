const { z } = require('zod');

const updateProfileSchema = z.object({
    name: z.string().min(1, 'Name cannot be empty').optional(),
    bio: z.string().max(300, 'Bio must be at most 300 characters').optional(),
    country: z.string().max(100, 'Country must be at most 100 characters').optional()
});

module.exports = {
    updateProfileSchema
};
