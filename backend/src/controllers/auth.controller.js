import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { upsertStreamUser } from "../ilb/stream.js";


export async function signup(req, res) {
    const { email, password, fullName } = req.body;
    try {
        if (!email || !password || !fullName) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists, please use a different one" });
        }

        const index = Math.floor(Math.random() * 100) + 1; // Random index for avatar 
        const randomAvater = `https://avatar.iran.liara.run/public/${index}.png`;
        const newUser = await User.create({
            email,
            password,
            fullName,
            profilePic: randomAvater
        });

        
        try {
            console.log("Upserting Stream user:", newUser._id);
            
            await upsertStreamUser({
                id: newUser._id.toString(),
                name: newUser.fullName,
                image: newUser.profilePic || ""
            })

            console.log("Stream user upserted successfully" , newUser.fullName);

        } catch (error) {
            console.error("Error upserting Stream user:", error);
            return res.status(500).json({ message: "Failed to create user in Stream" });
        }


        const token = jwt.sign(
            { userId: newUser._id }, process.env.JWT_SECRET_KEY,
            { expiresIn: "7d" }
        );

        res.cookie('jwt', token, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production' // Use secure cookies in production
        })


        res.status(201).json({
            success: true,
            user:newUser,   
        })

    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({ message: "Internal server error" });
    }

}
export async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isPasswordCorrect = await user.matchPassword(password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign(
            { userId: user._id }, process.env.JWT_SECRET_KEY,
            { expiresIn: "7d" }
        );

        res.cookie('jwt', token, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production' // Use secure cookies in production
        });

        res.status(200).json({
            success: true,
            user: user,
        });

    } catch (error) {
        
        console.error("Error during login:", error);
        res.status(500).json({ message: "Internal server error" });

    }
}
export async function logout(req, res) {
    res.clearCookie('jwt');
    res.status(200).json({success:true, message: "Logged out successfully" });
}