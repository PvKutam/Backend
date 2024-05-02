import { v2 as cloudinary } from "cloudinary";
import fs from "fs"
          
cloudinary.config({ 
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEYS, 
  api_secret:process.env.CLOUDINARY_API_SECRET,
});


const uploadonCloudinary= async(loacalfilepath)=>{
    try {
       if (!loacalfilepath) return null
        
       const responce = await cloudinary.uploader.upload(loacalfilepath,
        { resource_type: "auto" });
        // console.log("file uploaded successfull on cloudnary",responce.url);
        fs.unlinkSync(loacalfilepath)
        return responce
} catch (error) {
    fs.unlinkSync(loacalfilepath)
    return null;
}
}


export {uploadonCloudinary}   

