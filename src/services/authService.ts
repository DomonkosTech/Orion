import { useNavigate } from "react-router-dom";
import {toast} from "react-hot-toast";

const API_BASE_URL = "http://localhost:4000/api";



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
