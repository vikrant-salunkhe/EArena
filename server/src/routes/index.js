const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const teamRoutes = require('./team.routes');
const tournamentRoutes = require('./tournament.routes');
const registrationRoutes = require('./registration.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/teams', teamRoutes);
router.use('/tournaments', tournamentRoutes);
router.use('/registrations', registrationRoutes);

module.exports = router;



