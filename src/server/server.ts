import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { setupRealtime } from "./realtime/RealtimeServer.ts";

// Import secret keys
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const JWT_SECRET = process.env.JWT_SECRET;
console.log("Encryption key loaded:", ENCRYPTION_KEY);
console.log("JWT secret loaded:", JWT_SECRET);

// Import Routes
import authRoutes from "./routes/authRoute.ts";
import userRoutes from "./routes/userRoute.ts";
import companyRoutes from "./routes/companyRoute.ts";
import advertisementRoutes from "./routes/advertisementRoute.ts";
import applicantRoutes from "./routes/applicantRoute.ts";
import emailRoute from "./routes/emailRoute.ts";
import systemmessageRoute from "./routes/systemmessageRoute.ts"
import messageRoute from "./routes/messageRoute.ts";
import OrionAIRoute from "./routes/OrionAIRoute.ts";


// Initialize Express app
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

// --- Routes Configuration ---

// Auth Routes (Login, Register, Logout, Check Auth)
app.use("/Api/auth", authRoutes);

// User Routes (Profile, Resume)
app.use("/Api/users", userRoutes);

// Company Routes (Profile)
app.use("/Api/companies", companyRoutes);

// Advertisement Routes (Create, Read, Update, Delete)
app.use("/Api", advertisementRoutes);

// Applicant Routes (Submit, Track, Accept/Reject)
app.use("/Api", applicantRoutes);

// systemmessage Routes (Read, Update)
app.use("/Api", systemmessageRoute);

// Email Routes (Send Email)
app.use("/Api/auth", emailRoute);

// Message Routes (Send Message, Read Messages, Delete Messages)
app.use("/Api/chat", messageRoute);

// OrionAI Routes
app.use("/Api", OrionAIRoute);

// Create an HTTP server
const server = createServer(app);

// Initialize Realtime (WebSocket + Supabase)
setupRealtime(server);

// Start server
server.listen(4000, () => console.log("Server running on http://localhost:4000"));