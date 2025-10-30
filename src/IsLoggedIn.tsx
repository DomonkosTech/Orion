import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

interface Props {
    children: React.ReactElement;
}

function IsLoggedIn({ children }: Props) {
    const [loading, setLoading] = useState(true);
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        fetch("http://localhost:4000/auth/check", {
            method: "GET",
            credentials: "include" // <-- fontos! ezzel küldi a cookie-t
        })
            .then(res => res.json())
            .then(data => {
                setLoggedIn(data.loggedIn);
            })
            .catch(() => {
                setLoggedIn(false);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div>Betöltés...</div>;
    }

    if (!loggedIn) {
        return <Navigate to="/UserLoginPage" replace />;
    }

    return children;
}

export default IsLoggedIn;
