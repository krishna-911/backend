import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

 const userSignup = async (req, res) => {

   try {
     const {username, email, password} = req.body;
 
     if (
         [username, email, password].some((field) => field?.trim() === "")
     ) {
         return res.status(400).json({ message: "All fields are required" })
         
     }
 
     const existedUser = await User.findOne({
         $or: [{ username }, { email }]
     })
 
     if (existedUser) {
         return res.status(409).json({message: "User with email or username already exists"})
     }
 
     const user = User.create({
         username,
         email,
         password
     })

     const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
 
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
 
   } catch (error) {
            res.status(500).json({ message: "Server Error" });
   }
}

 const userSignin = async (req, res) => {

    try {
        const { username, email, password } = req.body;
    
        const user = await User.findOne({
            $or: [{ username }, { email }]
        })
    
        if(!user) {
            res.status(400).json({ message: "Username or email doesn't exist"})
        }
    
        const isPasswordValid = await user.isPasswordCorrect(password)
    
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid credentials"})
            }

            const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

            const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
        
            const options = {
                httpOnly: true,
                secure: true
            }
        
            return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200, 
                    {
                        user: loggedInUser, accessToken, refreshToken
                    },
                    "User logged In Successfully"
                )
            )    

    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }

}

export { userSignup, userSignin }