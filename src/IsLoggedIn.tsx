import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

interface Props {
    children: React.ReactElement;
    mode?: "protected" | "guest";
}

function IsLoggedIn({ children, mode = "protected" }: Props) {
    const [loading, setLoading] = useState(true);
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        fetch("http://localhost:4000/auth/check", {
            method: "GET",
            credentials: "include"
        })
            .then(res => res.json())
            .then(data => setLoggedIn(data.loggedIn))
            .catch(() => setLoggedIn(false))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div>Betöltés...</div>;
    }

    if (mode === "protected" && !loggedIn) {
        return <Navigate to="/UserLoginPage" replace />;
    }

    if (mode === "guest" && loggedIn) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default IsLoggedIn;
