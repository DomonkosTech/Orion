import React from "react";
import { Navigate } from "react-router-dom";

interface Props {
    children: React.ReactElement;
}

function IsLoggedIn({ children }: Props) {
    const loggedIn = localStorage.getItem("loggedIn") === "true";

    if (!loggedIn) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default IsLoggedIn;
