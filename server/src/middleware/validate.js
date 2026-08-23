const ApiError = require('../utils/apiError');

const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    } catch (error) {
        // Zod validation errors
        const formattedErrors = error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message
        }));

        const apiError = new ApiError(422, 'Validation failed', formattedErrors);
        next(apiError);
    }
};

module.exports = validate;
