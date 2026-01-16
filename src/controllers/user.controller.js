import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import {uplodeOnCloudinary} from "../utils/cloudnary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser=asyncHandler(async(req,res)=>{
    // get user detiles from frontend
    // validation- not empty
    // check if user exist : from username or email
    // check for images and check for avatar
    // uploded them to cloudinary, avatar
    // create user object- create entry in db
    // remove password and refresh token field from response
    // check for user creation 
    // return res 
    const {fullName,email,username,password}=req.body;
    console.log("email:",email);
    // if(fullName===""){
    //     throw new ApiError(400, "full name is required")
    // }
    // one more way of doing the same thing is

    if(
        [fullName,email,username,password].some((field)=>
        field?.trim()==="")
    ){
        throw new ApiError(400,"all fileds are required")
    }

    const existedUser= User.findOne({
        $or:[{email},{username}]
    })

    if(existedUser){
        throw new ApiError(409,"User with email or username alredy exist")
    }

    const avatarLocalPath=req.files?.avatar[0]?.path;
    const coverImageLocalPath=req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400,"Avatar file is required")
    }

    const avatar= await uplodeOnCloudinary(avatarLocalPath);
    const coverImage= await uplodeOnCloudinary(coverImageLocalPath);

    if(!avatar){
         throw new ApiError(400,"avatar filed is required")
    }

     const user= await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url ||"",
        password,
        username: username.toLowerCase()
    })

     const createdUser=await  User.findById(user._id).select(
        "-password -refreshTokens"
     )

     if(!createdUser){
        throw new ApiError(500,"something went wrong while regestring the user")
     }
    return res.status(201).json(
        new ApiResponse(200,createdUser,"user registerd successfully ")
    )
})

export  {registerUser}