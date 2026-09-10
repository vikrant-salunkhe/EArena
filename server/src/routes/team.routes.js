const express = require('express');
const {
    createTeam,
    getTeams,
    getTeamDetails,
    getMyTeam,
    updateTeam,
    deleteTeam,
    joinTeamByCode,
    joinTeam,
    leaveTeam,
    transferCaptain,
    removeMember,
    regenerateJoinCode,
    uploadLogo,
    getTeamStats
} = require('../controllers/team.controller');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
    createTeamSchema,
    updateTeamSchema,
    transferCaptainSchema,
    joinTeamByCodeSchema
} = require('../validators/team.validator');
const upload = require('../config/multer');

const router = express.Router();

// Public routes
router.get('/', getTeams);
router.get('/my-team', protect, getMyTeam);
router.get('/:teamId', getTeamDetails);
router.get('/:teamId/dashboard', getTeamStats);

// Protected routes
router.post('/', protect, validate(createTeamSchema), createTeam);
router.post('/join', protect, validate(joinTeamByCodeSchema), joinTeamByCode);
router.post('/:teamId/join', protect, joinTeam);
router.post('/:teamId/leave', protect, leaveTeam);
router.post('/:teamId/join-code', protect, regenerateJoinCode);

router.patch('/:teamId', protect, validate(updateTeamSchema), updateTeam);
router.patch('/:teamId/logo', protect, upload.single('logo'), uploadLogo);
router.patch('/:teamId/captain', protect, validate(transferCaptainSchema), transferCaptain);

router.delete('/:teamId/members/:userId', protect, removeMember);
router.delete('/:teamId', protect, deleteTeam);

module.exports = router;
