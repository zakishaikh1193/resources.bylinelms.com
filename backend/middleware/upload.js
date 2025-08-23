const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_PATH || './uploads';

// Enhanced directory creation with better error handling
try {
  if (!fs.existsSync(uploadDir)) {
    console.log(`Creating upload directory: ${uploadDir}`);
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`Upload directory created successfully: ${uploadDir}`);
  } else {
    console.log(`Upload directory already exists: ${uploadDir}`);
  }
  
  // Test write permissions
  const testFile = path.join(uploadDir, 'test-write-permission.tmp');
  fs.writeFileSync(testFile, 'test');
  fs.unlinkSync(testFile);
  console.log(`Upload directory is writable: ${uploadDir}`);
} catch (error) {
  console.error('Upload directory setup error:', {
    uploadDir,
    error: error.message,
    code: error.code,
    errno: error.errno
  });
  throw new Error(`Failed to setup upload directory: ${error.message}`);
}

// Configure storage - optimized for speed
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Log the destination for debugging
    console.log(`File upload destination: ${uploadDir} for file: ${file.originalname}`);
    console.log(`Current working directory: ${process.cwd()}`);
    console.log(`Upload directory absolute path: ${path.resolve(uploadDir)}`);
    
    // Simple flat structure for faster access
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp for better organization
    const timestamp = Date.now();
    const uniqueName = `${timestamp}-${uuidv4()}${path.extname(file.originalname)}`;
    console.log(`Generated filename: ${uniqueName} for original: ${file.originalname}`);
    cb(null, uniqueName);
  }
});

// File filter function - simplified and faster
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'csv', 'zip', 'rar',
    'mp4','mp3', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'jpg', 'jpeg', 'png', 'gif'
  ];
  
  const fileExtension = path.extname(file.originalname).toLowerCase().substring(1);
  
  if (allowedTypes.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`File type .${fileExtension} is not allowed`), false);
  }
};

// Configure multer - optimized for large files
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 1024, // 1GB limit
    files: 2, // Allow 2 files: main file + preview image
    fieldSize: 10 * 1024 * 1024, // 10MB for text fields
    fieldNameSize: 100,
    fieldValueSize: 10 * 1024 * 1024 // 10MB for field values
  }
});

// Preview image filter - only images
const previewImageFilter = (req, file, cb) => {
  const allowedImageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const fileExtension = path.extname(file.originalname).toLowerCase().substring(1);
  
  if (allowedImageTypes.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`Preview image must be: ${allowedImageTypes.join(', ')}`), false);
  }
};

// Configure multer for preview images
const previewImageUpload = multer({
  storage: storage,
  fileFilter: previewImageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for preview images
    files: 1
  }
});

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
  console.error('File upload error details:', {
    message: error.message,
    code: error.code,
    field: error.field,
    storageErrors: error.storageErrors,
    stack: error.stack
  });

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 1GB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 2 files allowed (main file + preview image).'
      });
    }
    if (error.code === 'LIMIT_FIELD_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Field size too large.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field received.'
      });
    }
  }
  
  if (error.message.includes('File type')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  if (error.message.includes('Failed to setup upload directory')) {
    return res.status(500).json({
      success: false,
      message: error.message,
      error: process.env.NODE_ENV === 'development' ? {
        uploadDir: process.env.UPLOAD_PATH || './uploads',
        code: error.code
      } : undefined
    });
  }
  
  // Enhanced error response
  return res.status(500).json({
    success: false,
    message: 'File upload failed',
    error: process.env.NODE_ENV === 'development' ? {
      message: error.message,
      code: error.code,
      field: error.field
    } : undefined
  });
};

// Single file upload middleware
const uploadSingle = upload.single('file');

// Multiple files upload middleware (main file + preview image)
const uploadMultiple = upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'preview_image', maxCount: 1 }
]);

// Preview image upload middleware
const uploadPreviewImage = previewImageUpload.single('preview_image');

module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadPreviewImage,
  handleUploadError
};
