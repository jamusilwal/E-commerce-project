import multer from 'multer';
import ApiError from '../utils/ApiError.js';

/**
 * Multer configuration for file uploads.
 * Stores files in memory (buffer) for Cloudinary upload.
 */
const storage = multer.memoryStorage();

// File filter — only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      ApiError.badRequest('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'),
      false
    );
  }
};

// Upload instances
export const uploadSingle = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
}).single('image');

export const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 5, // Max 5 files
  },
}).array('images', 5);

export default multer({ storage, fileFilter });
