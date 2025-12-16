import { useNavigate } from "react-router-dom";

export const useLogout = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const res = await fetch("http://localhost:4000/api/logout", {
                method: "POST",
                credentials: "include",
            });
            const data = await res.json();
            if (data.success) {
                try { window.dispatchEvent(new Event("auth-changed")); } catch { /* empty */ }
                alert("Sikeresen kijelentkeztél!");
                navigate("/CompanyLoginPage");
            }
        } catch (err) {
            console.error("Logout error:", err);
            alert("Hiba történt a kijelentkezés során!");
        }
    }

    return handleLogout;
}
