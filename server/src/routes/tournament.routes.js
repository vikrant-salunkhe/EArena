const express = require('express');
const {
    createTournament,
    getTournaments,
    getTournamentDetails,
    getMyTournaments,
    updateTournament,
    deleteTournament,
    publishTournament,
    startTournament,
    endTournament,
    cancelTournament,
    uploadBanner
} = require('../controllers/tournament.controller');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
    createTournamentSchema,
    updateTournamentSchema
} = require('../validators/tournament.validator');
const upload = require('../config/multer');

const router = express.Router();

// Public routes
router.get('/', getTournaments);
router.get('/my-tournaments', protect, getMyTournaments);
router.get('/:tournamentId', getTournamentDetails);

// Protected routes
router.post('/', protect, validate(createTournamentSchema), createTournament);
router.patch('/:tournamentId', protect, validate(updateTournamentSchema), updateTournament);
router.patch('/:tournamentId/banner', protect, upload.single('banner'), uploadBanner);
router.patch('/:tournamentId/publish', protect, publishTournament);
router.patch('/:tournamentId/start', protect, startTournament);
router.patch('/:tournamentId/end', protect, endTournament);
router.patch('/:tournamentId/cancel', protect, cancelTournament);
router.delete('/:tournamentId', protect, deleteTournament);

module.exports = router;
