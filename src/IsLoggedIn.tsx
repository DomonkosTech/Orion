import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { checkAuthStatus } from "./Api/authApi.ts";

interface Props {
    children?: React.ReactElement;
    mode?: "user" | "guest" | "company";
}

function IsLoggedIn({ children, mode = "user" }: Props) {
    const [loading, setLoading] = useState(true);
    const [loggedIn, setLoggedIn] = useState(false);
    const [userType, setUserType] = useState<"user" | "company" | null>(null);

    useEffect(() => {
        let mounted = true;

        const check = async () => {
            try {
                const data = await checkAuthStatus();
                if (!mounted) return;
                setLoggedIn(Boolean(data.loggedIn));
                setUserType(data.userType || null);
            } catch {
                if (!mounted) return;
                setLoggedIn(false);
                setUserType(null);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        // Initial check
        check();

        // React to global auth changes (emitted after login/logout)
        const handler = () => {
            setLoading(true);
            check();
        };
        window.addEventListener("auth-changed", handler);

        return () => {
            mounted = false;
            window.removeEventListener("auth-changed", handler);
        };
    }, []);

    if (loading) {
        return null;
    }

    // Guest mód: ha be van jelentkezve, irányítsuk a megfelelő kezdőoldalra
    if (mode === "guest" && loggedIn) {
        if (userType === "company") {
            return <Navigate to="/company" replace />;
        }
        return <Navigate to="/" replace />;
    }

    // User mód: csak user típusú felhasználók érhetik el
    if (mode === "user") {
        if (!loggedIn) {
            return <Navigate to="/UserLoginPage" replace />;
        }
        if (userType !== "user") {
            // Ha be van jelentkezve, de nem user, vigyük a saját kezdőoldalára
            if (userType === "company") {
                return <Navigate to="/company" replace />;
            }
            return <Navigate to="/UserLoginPage" replace />;
        }
    }

    // Company mód: csak company típusú felhasználók érhetik el
    if (mode === "company") {
        if (!loggedIn) {
            return <Navigate to="/CompanyLoginPage" replace />;
        }
        if (userType !== "company") {
            // Ha be van jelentkezve, de nem company, vigyük a saját kezdőoldalára
            if (userType === "user") {
                return <Navigate to="/" replace />;
            }
            return <Navigate to="/CompanyLoginPage" replace />;
        }
    }

    return children ? children : <Outlet />;
}

export default IsLoggedIn;
