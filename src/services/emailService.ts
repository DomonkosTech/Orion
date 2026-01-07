import { API_BASE_URL } from "./apiConfig";

export const verifyEmail = async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/email/user/verification`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
        credentials: "include",
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Sikertelen verifikáció");
    }

    return response.json();
};

export const sendVerificationEmail = async (email: string) => {
    const response = await fetch(`${API_BASE_URL}/email/user/verification`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
        credentials: "include",
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Sikertelen email küldés");
    }

    return response.json();
};
