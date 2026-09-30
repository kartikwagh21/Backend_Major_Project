const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const getUploadDir = () => {
  const uploadDir = path.resolve(process.env.UPLOAD_PATH || 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
};

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = getUploadDir();
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `appliance-${timestamp}-${random}${ext}`);
  },
});

// File filter (images only)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
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

// Helper to remove an uploaded file if validation or process fails
const deleteUploadedFile = (filePath) => {
  if (!filePath) return;
  const fullPath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(filePath);

  if (fs.existsSync(fullPath)) {
    fs.unlink(fullPath, (err) => {
      if (err) {
        console.error(`[Upload Cleanup Error]: Failed to delete ${fullPath}:`, err.message);
      }
    });
  }
};

module.exports = {
  upload,
  deleteUploadedFile,
};
