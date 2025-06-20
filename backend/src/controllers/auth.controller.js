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

        // const index = Math.floor(Math.random() * 100) + 1; // Random index for avatar 
        // const randomAvater = `https://api.multiavatar.com/${Math.floor(Math.random()*100000)}.png`;
        
        const randomId = Math.floor(Math.random() * 100000);
        const randomAvater = `https://api.dicebear.com/8.x/adventurer/svg?seed=${randomId}`;

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

export async function onboard(req, res) {
    try {
        
        const userId = req.user._id;

        const {fullName,bio, nativeLanguage, learningLanguage, location} = req.body;

        if (!fullName || !bio || !nativeLanguage || !learningLanguage || !location) {
            return res.status(400).json({
                message: "All fields are required",
                missingFields: [
                    !fullName && "fullName",
                    !bio && "bio",
                    !nativeLanguage && "nativeLanguage",
                    !learningLanguage && "learningLanguage",
                    !location && "location"
                ].filter(Boolean),
             });
        }

        const updatedUser = await User.findByIdAndUpdate(userId, {
            ...req.body,
            isOnboarded: true
        },{ new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // todo update stream user

        try {
            await upsertStreamUser({
                id: updatedUser._id.toString(),
                name: updatedUser.fullName,
                image: updatedUser.profilePic || ""
            });
            console.log("Stream user updated successfully:", updatedUser.fullName);
        } catch (error) {
            console.error("Error updating Stream user during onboarding:", error);
            return res.status(500).json({ message: "Failed to update user in Stream" });
        }

        res.status(200).json({
            success: true,
            user: updatedUser,
        });
    } catch (error) {
        console.error("Error during onboarding:", error);
        res.status(500).json({ message: "Internal server error" });
    }
    
}

export async function changePassword(req, res) {
    try {
        
        const {currentPassword, newPassword} = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Current password and new password are required" });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: "New password must be at least 6 characters long" });
        }
        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const isPasswordCorrect = await user.matchPassword(currentPassword);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "Current password is incorrect" });
        }
        user.password = newPassword;
        await user.save();

        // remmove jwt token and redirect to login
        res.clearCookie('jwt');


        res.status(200).json({
            success: true,
            message: "Password changed successfully",
        });    

    } catch (error) {
        
        console.error("Error during password change:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
