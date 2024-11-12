import { asyncHandler } from "../helpers/asyncHandler.js";
import { ApiResponse } from "../helpers/ApiResponse.js";
import { ApiError } from "../helpers/ApiError.js";
import { User } from "../models/user-model.js";


const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave : false})
        return {accessToken, refreshToken};

    } catch (error) {
        throw new ApiError(500, "Something went wrong, cannot generate Tokens!")
    }
};

const registerUser = asyncHandler( async (req, res) => {
    const {fullName, email, password, phone} = req.body;
    console.log(fullName, email, password, phone);
    
    if( //validation.
        [fullName, password, email, phone].some((field) => {
            return field.trim() === "";
        })
    ){
        throw new ApiError(400, "Please fill all fields properly!");
    }

    //checking if user exists.
    const existingUser = await User.findOne({
        $or: [{phone}, {email}]
    });
    if(existingUser){
        throw new ApiError(409, "User already exists!");
    }

    //entry in db
    const user = await User.create({
        fullName,
        email,
        password,
        phone,
    });

    //validating the creation of user in database.
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "User cannot be registered, try again later!")
    }
    
    res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully!!"),
    )
});

const loginUser = asyncHandler( async(req, res) => {
    const {email, password} = req.body;
    console.log(req.body)
    console.log(email, password); 

    //checking the validity of the field.
    if(!(email)){
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({email})

    if(!user){
        throw new ApiError(404, "User not found");
    }
    const isValidPassword = await user.isPasswordCorrect(password);

    if(!isValidPassword){
        throw new ApiError(401, "Invalid password");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);
    //console.log(accessToken, refreshToken);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
    //console.log(loggedInUser);

    const cookieOptions = {
        httpOnly: true,
        secure: false,
    }

    res.status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
        new ApiResponse(200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged in successfully"
        )
    )
});

const logoutUser = asyncHandler( async(req, res) => {
    await User.findByIdAndUpdate(req.user._id,
        {
            // $set: {
            //     refreshToken: undefined,
            // }
            $unset: {
                refreshToken: 1, //removes the field itself from the document.
            }
        },
        {
            new: true,
        }
    )

    //deleting the accessToken from cookie.
    const cookieOptions = {
        httpOnly: true,
        secure: false,
    }

    console.log("User Logged Out!!");
    return res.status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged out successfully"))
});

const refreshAccessToken = asyncHandler( async(req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized Request!!");
    }

    //verify the refreshToken.
    const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    //check if the user still exists in the database.
    const user = await User.findById(decoded?._id);
    if(!user){
        throw new ApiError(401, "Invalid RefreshToken!!");
    }

    //now we have to match the encoded refreshToken stored in the database with our incomingRefreshToken.
    if(user?.refreshToken !== incomingRefreshToken){
        throw new ApiError(401, "Different RefreshTokens, Access Denied!!");
    }

    //generate a new accessToken.
    const cookieOptions = {
        httpOnly: true,
        secure: false,
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    return res.status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
        new ApiResponse(
            200, 
            {accessToken, refreshToken},
            "New Access Token and Refresh Token generated successfully!!"
        )
    )
});

const getAllUsers = asyncHandler( async (req, res) => {
    try {
        const users = await User.find({}).select("-password -refreshToken");
        res.status(200).json(new ApiResponse(200, users, "All Users fetched successfully!!"));
    } catch (error) {
        res.status(500).json(new ApiResponse(500, null, "Failed to fetch users."));
    }
});

const getUserById = asyncHandler( async (req, res) => {
    try {
        const userId = req.params.id;
        if(!userId){
            throw new ApiError(400, "User ID is required!!");
        }
        const currUser = await User.findById(userId).select("-password -refreshToken");
        if(!currUser){
            throw new ApiError(404, "User not found!!");
        }
        res.status(200).json(new ApiResponse(200, currUser, "User fetched successfully!!"));
    } catch (error) {
        res.status(500).json(new ApiResponse(500, null, "Failed to fetch user."));
    }
});

const updateUserData = asyncHandler( async (req, res) => {
    try {
        const userId = req.params.id;
        const {fullName, email, phone} = req.body;
        if(!userId){
            throw new ApiError(400, "User ID is required!!");
        }
        const updatedUser = await User.findByIdAndUpdate(userId, {
            fullName,
            email,
            phone,
        }, {
            new: true,
            runValidators: true,
        }).select("-password -refreshToken");
        if(!updatedUser){
            throw new ApiError(404, "User not found!!");
        }
        res.status(200).json(new ApiResponse(200, updatedUser, "User updated successfully!!"));
    } catch (error) {
        res.status(500).json(new ApiResponse(500, null, "Failed to update user."));
    }
});

const deleteUserById = asyncHandler( async (req, res) => {
    try {
        const userId = req.params.id;

        if(!userId){
            throw new ApiError(400, "User ID is required!!");
        }

        const deletedUser = await User.findByIdAndDelete(userId);

        if(!deletedUser){
            throw new ApiError(404, "User not found!!");
        }

        res.status(200).json(new ApiResponse(200, null, "User deleted successfully!!"));
    } catch(error){
        if(error instanceof ApiError){
            res.status(error.statusCode).json(new ApiResponse(error.statusCode, null, error.message));
        }else{
            res.status(500).json(new ApiResponse(500, null, "Failed to delete user."));
        }
    }
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getAllUsers,
    getUserById,
    updateUserData,
    deleteUserById,
}