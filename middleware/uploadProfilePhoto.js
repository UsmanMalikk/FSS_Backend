const multer = require('multer');
const path = require('path');

const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Add this to your existing upload configuration file
const profilePhotoStorage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
      return {
        folder: 'fss--employees-profile-photos', // Separate folder for profile photos
        resource_type: 'image', // Strictly for images
        format: 'jpg', // Convert all to JPG for consistency
        transformation: { width: 500, height: 500, crop: 'fill' }, // Standardize dimensions
        public_id: `${Date.now()}-${file.originalname.split('.')[0]}`, // Unique filename
      };
    },
  });
  
  const profilePhotoUpload = multer({ 
    storage: profilePhotoStorage,
    fileFilter: (req, file, cb) => {
        // console.log('⏳ File is being filtered:', file.originalname, file.mimetype);

      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'));
      }
    },
    limits: { fileSize: 5 * 1024 * 1024 }
  });
  
module.exports.uploadProfilePhotoMiddleware = profilePhotoUpload.single('profilePhoto');
