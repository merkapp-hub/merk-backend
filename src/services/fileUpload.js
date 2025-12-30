const multer = require('multer');
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
    cloud_name: process.env.CLOUDNARY_CLOUD_NAME,
    api_key: process.env.CLOUDNARY_API_KEY,
    api_secret: process.env.CLOUDNARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: (req, file) => {
        const isPDF = file.mimetype === 'application/pdf';
        return {
            folder: "merk_uploads",
            resource_type: isPDF ? 'raw' : 'image',
            format: isPDF ? 'pdf' : undefined, // Let Cloudinary auto-detect image format
            public_id: Date.now() + "-" + file.originalname.replace(/\.[^/.]+$/, ""), // Remove extension
            transformation: isPDF ? undefined : [
                { width: 1200, height: 1200, crop: 'limit' }, // Limit max size
                { quality: 'auto' } // Auto quality
            ]
        };
    },
});

module.exports = {
    upload: multer({
        storage: storage,
        limits: { 
            fileSize: 10 * 1024 * 1024,     // 10MB per file
            fieldSize: 25 * 1024 * 1024,    // 25MB field size
            fieldNameSize: 100,             // Max field name size
            fields: 20,                     // Max number of non-file fields
            files: 10                       // Max number of files
        },
        fileFilter: (req, file, cb) => {
            console.log('Multer fileFilter - Checking file:', {
                fieldname: file.fieldname,
                originalname: file.originalname,
                mimetype: file.mimetype,
                size: file.size
            });
            
            if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
                cb(null, true);
            } else {
                cb(new Error('Only image and PDF files are allowed!'), false);
            }
        }
    }),  
    cloudinary
};