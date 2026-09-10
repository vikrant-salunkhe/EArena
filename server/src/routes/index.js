const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const teamRoutes = require('./team.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/teams', teamRoutes);

module.exports = router;

