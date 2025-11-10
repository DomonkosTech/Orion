import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

interface Props {
    children: React.ReactElement;
    mode?: "user" | "guest" | "company";
}

function IsLoggedIn({ children, mode = "user" }: Props) {
    const [loading, setLoading] = useState(true);
    const [loggedIn, setLoggedIn] = useState(false);
    const [userType, setUserType] = useState<"user" | "company" | null>(null);

    useEffect(() => {
        fetch("http://localhost:4000/auth/check", {
            method: "GET",
            credentials: "include"
        })
            .then(res => res.json())
            .then(data => {
                setLoggedIn(data.loggedIn);
                setUserType(data.userType || null);
            })
            .catch(() => {
                setLoggedIn(false);
                setUserType(null);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div>Betöltés...</div>;
    }

    // Guest mód: ha be van jelentkezve, átirányítás
    if (mode === "guest" && loggedIn) {
        return <Navigate to="/" replace />;
    }

    // User mód: csak user típusú felhasználók érhetik el
    if (mode === "user" && (!loggedIn || userType !== "user")) {
        return <Navigate to="/UserLoginPage" replace />;
    }

    // Company mód: csak company típusú felhasználók érhetik el
    if (mode === "company" && (!loggedIn || userType !== "company")) {
        return <Navigate to="/CompanyLoginPage" replace />;
    }

    return children;
}

export default IsLoggedIn;
