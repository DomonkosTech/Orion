import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";

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

// Email Routes (Send Email)
app.use("/api/email", emailRoute);

// Start server
app.listen(4000, () => console.log("Server running on http://localhost:4000"));