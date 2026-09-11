const express = require('express');
const {
    registerTeam,
    getRegistrations,
    getMyRegistrations,
    checkRegistrationStatus,
    getRegistrationById,
    updateRegistrationStatus,
    cancelRegistration
} = require('../controllers/registration.controller');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
    createRegistrationSchema,
    updateRegistrationStatusSchema
} = require('../validators/registration.validator');

const router = express.Router();

// Public / Protected query routes
router.get('/', getRegistrations);
router.get('/my-registrations', protect, getMyRegistrations);
router.get('/check/:tournamentId', protect, checkRegistrationStatus);
router.get('/:registrationId', protect, getRegistrationById);

// Registration actions
router.post('/', protect, validate(createRegistrationSchema), registerTeam);
router.patch('/:registrationId/status', protect, validate(updateRegistrationStatusSchema), updateRegistrationStatus);
router.delete('/:registrationId', protect, cancelRegistration);

module.exports = router;
