import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";


export async function getRecommendedUsers(req, res) {
    try {
        
        const currentUserId = req.user.id;
        const currentUser = req.user;

        const recommendedUsers = await User.find({
            $and:[
                {_id: { $ne: currentUserId } }, // Exclude current user
                {$id: { $nin: currentUser.friends } }, // Exclude current user's friends
                {isOnboarded: true} // Only onboarded users
            ]
        })

        res.status(200).json(recommendedUsers);

    } catch (error) {
        
        console.error("Error fetching recommended users:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getMyFriends(req, res) {
    try {
        
        const user = await User.findById(req.user.id).select('friends').populate("friends", "fullName profilePic nativeLanguage learningLanguage ");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user.friends);

    } catch (error) {
        
        console.error("Error fetching user's friends:", error);
        res.status(500).json({ message: "Internal server error" });
    }
    
}

export async function sendFriendRequest(req, res) {
    try {
        
        const myId = req.user.id;
        const {id:recipentId} = req.params;
        // prevent sending friend request to self
        if (myId === recipentId) {
            return res.status(400).json({ message: "You cannot send a friend request to yourself" });
        }

        const recipient = await User.findById(recipentId);
        if (!recipient) {
            return res.status(404).json({ message: "Recipient not found" });
        }

        // Check if the recipient is already a friend
        if(recipient.friends.includes(myId)) {
            return res.status(400).json({ message: "You are already friends with this user" });
        }

        // Check if a friend request already exists
        const existingRequest = await FriendRequest.findOne({
            $or:[
                {sender: myId, recipient: recipentId },
                {sender: recipentId, recipient: myId }
            ]
        });

        if( existingRequest) {
            return res.status(400).json({ message: "Friend request already exists" });
        }

        // Create a new friend request
        const friendRequest = await FriendRequest.create({
            sender: myId,
            recipient: recipentId
        });

        res.status(201).json(friendRequest);


    } catch (error) {
        console.error("Error sending friend request:", error);
        res.status(500).json({ message: "Internal server error" });
        
    }
}

export async function acceptFriendRequest(req, res) {
    try {
        
        const {id:requestId} = req.params;

        const friendRequest = await FriendRequest.findById(requestId);
        if (!friendRequest) {
            return res.status(404).json({ message: "Friend request not found" });
        }

        // Check if the current user is the recipient of the request
        if(friendRequest.recipient.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not authorized to accept this friend request" });
        }


        friendRequest.status = "accepted";  
        await friendRequest.save();

        // Add each other to friends list
        // $addtoset :  add element to an array only if it doesn't already exist
        await User.findByIdAndUpdate(friendRequest.sender, {
            $addToSet: { friends: friendRequest.recipient }
        });

        await User.findByIdAndUpdate(friendRequest.recipient, {
            $addToSet: { friends: friendRequest.sender }
        });

        res.status(200).json({ message: "Friend request accepted successfully" });

    } catch (error) {
        console.error("Error accepting friend request:", error);
        res.status(500).json({ message: "Internal server error" });        
    }
}


export async function getFriendRequests(req, res) {
    try {
        
        const incomingReqs = await FriendRequest.find({ recipient: req.user.id, status: "pending" })
            .populate("sender", "fullName profilePic nativeLanguage learningLanguage");

            const acceptedReqs = await FriendRequest.find({ sender: req.user.id, status: "accepted" })
            .populate("recipent", "fullName profilePic ");

        res.status(200).json({
            incomingReqs,
            acceptedReqs
        });

    } catch (error) {
        console.error("Error fetching friend requests:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getOutgoingFriendRequests(req, res) {
    try {
        
        const outgoingReqs = await FriendRequest.find({ sender: req.user.id, status: "pending" })
            .populate("recipient", "fullName profilePic nativeLanguage learningLanguage");

        res.status(200).json(outgoingReqs);

    } catch (error) {
        console.error("Error fetching outgoing friend requests:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
