import { v2 as cloudinary } from "cloudinary";
import { response } from "express";

import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

console.log("cloudinary");
// console.log(localFilePath, "localFilePath");
const uplodeOnCloudinary = async (localFilePath) => {
    try {

        // console.log(localFilePath, "localFilePath");
        if (!localFilePath) return null;
        // uplode the file on cloudinary
        // console.log(localFilePath, "localFilePath");
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        console.log(response, "response");
        // file has been uploded succ
        console.log("file has been uploded on cloudinary", response.url)
        fs.unlinkSync(localFilePath);
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath)
        console.log(error, "error");
        return null;
        // remove the local file as the upload got faild
    }
}

export { uplodeOnCloudinary };