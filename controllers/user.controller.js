import { User } from "../models/user.model.js";

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
 
     if (user) {
         return res.status(200).json({ message: "User registered successfully"})
     }
 
   } catch (error) {
            res.status(500).json({ message: "Server Error" });
   }
}

 const userSignin = async (req, res) => {

    try {
        const { username, email, password } = req.body;
    
        const user = User.findOne({
            $or: [{ username }, { email }]
        })
    
        if(!user) {
            res.status(400).json({ message: "Username or email doesn't exist"})
        }
    
        const isPasswordValid = await user.isPasswordCorrect(password)
    
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid credentials"})
            }
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }

}

export default {userSignup, userSignin}