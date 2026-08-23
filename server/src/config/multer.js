const multer = require('multer');
const ApiError = require('../utils/apiError');

// Use memory storage so files are available as buffers for Cloudinary upload
const storage = multer.memoryStorage();

// Filter to only allow image files
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new ApiError(415, 'Only JPG, JPEG, PNG, and WEBP images are allowed'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB
    }
});

module.exports = upload;
