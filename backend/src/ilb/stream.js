import {StreamChat} from 'stream-chat';
import "dotenv/config";

const apiKey = process.env.STEAMAPI_KEY;
const apiSecret = process.env.STEAMAPI_SECRET;

if(!apiKey || !apiSecret) {
    throw new Error("STREAM_API_KEY and STREAM_API_SECRET must be set in environment variables");
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (userData) => {
    try {
        
        await streamClient.upsertUsers([userData]);
        return userData;

    } catch (error) {
        console.error("Error upserting Stream user:", error);
        throw new Error("Failed to upsert Stream user");
    }
};


export const generateStreamToken = (userId) => {
    try {
        
        const userIdStr = userId.toString();
        return streamClient.createToken(userIdStr);

    } catch (error) {
        console.error("Error generating Stream token:", error);
        throw new Error("Failed to generate Stream token");
    }
}