// Quick test to verify Cloudinary configuration
require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDNARY_CLOUD_NAME,
    api_key: process.env.CLOUDNARY_API_KEY,
    api_secret: process.env.CLOUDNARY_API_SECRET
});

console.log('Testing Cloudinary configuration...');
console.log('Cloud Name:', process.env.CLOUDNARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDNARY_API_KEY ? 'Set' : 'Not set');
console.log('API Secret:', process.env.CLOUDNARY_API_SECRET ? 'Set' : 'Not set');

// Test connection
cloudinary.api.ping()
  .then(result => {
    console.log('✓ Cloudinary connection successful!');
    console.log('Result:', result);
  })
  .catch(error => {
    console.error('✗ Cloudinary connection failed!');
    console.error('Error:', error.message);
  });
