import { API_BASE_URL } from "./apiConfig";

export const verifyUserEmail = async (token: string) => {
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

export const sendUserPasswordResetEmail = async (email: string) => {
    const response = await fetch(`${API_BASE_URL}/email/user/password/reset`, {
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
}


export const sendCompanyPasswordResetEmail = async (email: string) => {
    const response = await fetch(`${API_BASE_URL}/email/company/password/reset`, {
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
}

export const saveNewUserPassword = async (token: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/email/user/password/reset`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
        credentials: "include",
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Sikertelen jelszó megváltoztatás")
    }
    return response.json();
}


export const saveNewCompanyPassword = async (token: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/email/company/password/reset`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
        credentials: "include",
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Sikertelen jelszó megváltoztatás")
    }
    return response.json();
}

export const verifyCompanyEmail = async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/email/company/verification`, {
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

export const sendUserVerificationEmail = async (email: string) => {
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

export const sendCompanyVerificationEmail = async (email: string) => {
    const response = await fetch(`${API_BASE_URL}/email/company/verification`, {
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
