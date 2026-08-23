const express = require('express');
const {
    getProfile,
    updateProfile,
    uploadAvatar,
    deleteAvatar
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { updateProfileSchema } = require('../validators/user.validator');
const upload = require('../config/multer');

const router = express.Router();

// All user routes require authentication
router.use(protect);

router.get('/profile', getProfile);
router.patch('/profile', validate(updateProfileSchema), updateProfile);
router.patch('/avatar', upload.single('avatar'), uploadAvatar);
router.delete('/avatar', deleteAvatar);

module.exports = router;
