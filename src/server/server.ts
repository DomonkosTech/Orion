import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { supabase } from "../lib/supabaseClient.ts";

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
app.use("/api", authRoutes);

// User Routes (Profile, Resume)
app.use("/api", userRoutes);

// Company Routes (Profile)
app.use("/api", companyRoutes);

// Advertisement Routes (Create, Read, Update, Delete)
app.use("/api", advertisementRoutes);

// Applicant Routes (Submit, Track, Accept/Reject)
app.use("/api", applicantRoutes);

// systemmessage Routes (Read, Update)
app.use("/api", systemmessageRoute);

// Email Routes (Send Email)
app.use("/api/email", emailRoute);

// Message Routes (Send Message, Read Messages, Delete Messages)
app.use("/api/chat", messageRoute);

// OrionAI Routes
app.use("/api", OrionAIRoute);

// Create HTTP server
const server = createServer(app);

// Initialize WebSocket Server
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
    console.log("New WebSocket connection");

    ws.on("message", (message) => {
        console.log("Received:", message);
    });

    ws.on("close", () => {
        console.log("WebSocket disconnected");
    });
});

// Subscribe to Supabase changes
supabase
    .channel('messages')
    .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
            console.log('New message received from Supabase:', payload);
            // Broadcast to all connected WebSocket clients
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        type: 'NEW_MESSAGE',
                        payload: payload.new
                    }));
                }
            });
        }
    )
    .subscribe((status, error) => {
        console.log("Supabase subscription status:", status);
        if (error) {
            console.error("Supabase subscription error:", error);
        }
    });

// Start server
server.listen(4000, () => console.log("Server running on http://localhost:4000"));