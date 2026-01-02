import { useNavigate } from "react-router-dom";
import {toast} from "react-hot-toast";
import { API_BASE_URL } from "./apiConfig";

export interface AuthStatus {
    loggedIn: boolean;
    userType?: "user" | "company" | null;
    user?: unknown;
}

export const checkAuthStatus = async (): Promise<AuthStatus> => {
    const res = await fetch(`${API_BASE_URL}/auth/status`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
    });
    if (!res.ok) {
        throw new Error("Failed to check auth status");
    }
    return res.json();
};

export const useLogout = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/logout`, {
                method: "POST",
                credentials: "include",
            });
            const data = await res.json();
            if (data.success) {
                try { window.dispatchEvent(new Event("auth-changed")); } catch { /* empty */ }
                toast.success("Sikeresen kijelentkeztél!");
                navigate("/CompanyLoginPage");
            }
        } catch (err) {
            console.error("Logout error:", err);
            toast.error("Hiba történt a kijelentkezés során!");
        }
    }

    return handleLogout;
}
