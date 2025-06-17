import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';
dotenv.config();
import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
import chatRoutes from './routes/chat.route.js';
import { connectDB } from './ilb/db.js';

const app = express();
const PORT = process.env.PORT;
const __dirname = path.resolve();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true, // allow credentials (cookies, authorization headers, etc.)
}));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth",authRoutes);
app.use("/api/users",userRoutes);
app.use("/api/chat",chatRoutes);

if(process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
    });
}



app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
    connectDB();
})