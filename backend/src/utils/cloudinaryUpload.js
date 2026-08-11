const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

const uploadToCloudinary = (fileBuffer)=>{
    return new Promise((resolve,reject)=>{
        const stream = cloudinary.uploader.upload_stream(
            {
                folder :"seller documents",
                resource_type : "auto",
            },(error,result)=>{
            if(error) reject(error);
            else resolve(result);
        });
        streamifier.createReadStream(fileBuffer).pipe(stream);
    });
};

module.exports = uploadToCloudinary;