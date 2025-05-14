// import { v2 as cloudinary } from 'cloudinary';

const cloudinary= require('cloudinary').v2

// For thread

const { CloudinaryStorage } = require('multer-storage-cloudinary'); 


cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key:process.env.CLOUD_API_KEY , 
    api_secret:process.env.CLOUD_API_SECRET, // Click 'View API Keys' above to copy your API secret
    secure:true
});

// module.exports= cloudinary

// For thread

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'twitterThreads',
      allowedFormats: ['jpg', 'jpeg', 'png'],
    },
  });
  
  module.exports = { cloudinary, storage };


