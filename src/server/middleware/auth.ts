import type {Request, Response, NextFunction} from "express";
import jwt from "jsonwebtoken";
import { supabase } from "../../lib/supabaseClient.ts";

// Extend Express Request type to include user/company data
export interface AuthRequest extends Request {
    userId?: number;
    companyId?: number;
    userType?: 'user' | 'company';
}

// Middleware: Verify JWT token
export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.cookies.auth_token;
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!token) {
        return res.status(401).json({ error: "Missing token" });
    }

    if (!JWT_SECRET) {
        return res.status(500).json({ error: "JWT secret not configured" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as {
            userId?: number;
            companyId?: number;
            userType: 'user' | 'company'
        };

        req.userId = decoded.userId;
        req.companyId = decoded.companyId;
        req.userType = decoded.userType;

        next();
    } catch {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};

// Middleware: Verify user exists in database
export const verifyUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userId) {
        return res.status(401).json({ error: "User ID not found in token" });
    }

    try {
        const { data: user } = await supabase
            .from("users")
            .select("id")
            .eq("id", req.userId)
            .maybeSingle();

        if (!user) {
            return res.status(403).json({ error: "Please login" });
        }

        next();
    } catch {
        return res.status(500).json({ error: "Internal server error" });
    }
};

// Middleware: Verify company exists in database
export const verifyCompany = async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.companyId) {
        return res.status(401).json({ error: "Company ID not found in token" });
    }

    try {
        const { data: company } = await supabase
            .from("companies")
            .select("id")
            .eq("id", req.companyId)
            .maybeSingle();

        if (!company) {
            return res.status(403).json({ error: "Please login" });
        }

        next();
    } catch {
        return res.status(500).json({ error: "Internal server error" });
    }
};
