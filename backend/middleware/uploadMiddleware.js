const multer = require('multer');
const path = require('path');

// Memory storage for ephemeral-disk environments (e.g. Render)
const storage = multer.memoryStorage();

// File filter (accepts all standard image formats including PNG, JPEG, WebP, SVG, GIF, AVIF)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'image/svg+xml',
    'image/gif',
    'image/avif',
  ];
  const allowedExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.avif'];
  const ext = path.extname(file.originalname || '').toLowerCase();

  if (
    allowedMimeTypes.includes(file.mimetype) ||
    allowedExtensions.includes(ext) ||
    (file.mimetype && file.mimetype.startsWith('image/'))
  ) {
    cb(null, true);
  } else {
    const error = new Error('Invalid file type. Please upload a valid image (PNG, JPEG, WebP, SVG).');
    error.name = 'MulterError';
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

const maxFileSizeMB = parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 5;

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxFileSizeMB * 1024 * 1024,
  },
});

// No-op cleanup helper kept for backwards compatibility
const deleteUploadedFile = () => {};

module.exports = {
  upload,
  deleteUploadedFile,
};
