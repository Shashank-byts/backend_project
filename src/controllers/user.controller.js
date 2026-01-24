import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import { uplodeOnCloudinary } from "../utils/cloudnary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
// console.log("user controller");

const generateTokens = async (userId) => {
    try {
        // here we are finding the user
        const user = await User.findById(userId);
        // here we are generating the access token
        const accessToken = user.generateAccessToken();
        // here we are generating the refresh token
        const refreshToken = user.generateRefreshToken();
        // here we are pushing the refresh token to the user
        user.refreshTokens.push(refreshToken);
        // here we are saving the user
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "something went wrong while generating tokens")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // get user detiles from frontend
    // validation- not empty
    // check if user exist : from username or email
    // check for images and check for avatar
    // uploded them to cloudinary, avatar
    // create user object- create entry in db
    // remove password and refresh token field from response
    // check for user creation 
    // return res 
    console.log("into the registerUser function");
    const { fullName, email, username, password } = req.body;
    console.log("email:", email);
    // if(fullName===""){
    //     throw new ApiError(400, "full name is required")
    // }
    // one more way of doing the same thing is

    if (
        [fullName, email, username, password].some((field) =>
            field?.trim() === "")
    ) {
        throw new ApiError(400, "all fileds are required")
    }

    const existedUser = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username alredy exist")
    }
    console.log(req.files, "req.files");
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }
    console.log(avatarLocalPath, "avatarLocalPath");
    console.log(coverImageLocalPath, "coverImageLocalPath");
    const avatar = await uplodeOnCloudinary(avatarLocalPath);
    const coverImage = await uplodeOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "avatar filed is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        password,
        username: username.toLowerCase(),
        email
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshTokens"
    )

    if (!createdUser) {
        throw new ApiError(500, "something went wrong while regestring the user")
    }
    return res.status(201).json(
        new ApiResponse(200, createdUser, "user registerd successfully ")
    )
})
const loginUser = asyncHandler(async (req, res) => {
    // get data form req
    // username or email and password
    // check for user exist
    // check for password
    // generate access and refresh token
    // store refresh token in db
    // return res

    const { username, email, password } = req.body;
    console.log("email:", email);
    if (!username || !email) {
        throw new ApiError(400, "username or email is required")
    }
    if (!password) {
        throw new ApiError(400, "password is required")
    }
    // here we are checking if the user exist or not
    const user = await User.findOne({
        $or: [{ email }, { username }],
    })
    // now if there is no user then , that user does not exist in the db
    if (!user) {
        throw new ApiError(404, "user not found");
    }
    // there is a difference between User and user
    // User is the model
    // user is the document
    // nowwe are checking if the password is correct or not
    const isPasswordValid = await user.isPasswordValid(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "invalid credentials");
    }

    // here we are generating the access and refresh token from the user id
    const { accessToken, refreshToken } = await generateTokens(user._id);

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshTokens"
    );
    const options = {
        httpOnly: true,
        secure: true,
    }
    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, {
                user: loggedInUser,
                accessToken,
                refreshToken,
            }, "user logged in successfully"
            )
        )

})

const logoutUser = asyncHandler(async (req, res) => {
    // get refresh token from cookie
    // check for user exist
    // remove refresh token from db
    // return res
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshTokens: []
            }
        },
        { new: true }
    )

    const options = {
        httpOnly: true,
        secure: true,
    }
    res.clearCookie("accessToken", options)
    res.clearCookie("refreshToken", options)
    return res.status(200).json(
        new ApiResponse(200, null, "user logged out successfully")
    )

})
export { registerUser, loginUser, logoutUser }