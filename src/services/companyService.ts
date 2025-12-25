// src/services/companyService.ts

export interface CompanyLoginData {
    email: string;
    password: string;
    rememberMe: boolean;
}

const API_BASE_URL = "http://localhost:4000/api";

const handleResponse = async (response: Response) => {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    return data;
};

export const loginCompany = async (loginData: CompanyLoginData) => {
    const response = await fetch(`${API_BASE_URL}/company/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(loginData),
    });
    return handleResponse(response);
}