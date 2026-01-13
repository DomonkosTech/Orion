// src/services/companyService.ts
import { API_BASE_URL } from "./apiConfig";

export interface CompanyLoginData {
    email: string;
    password: string;
    rememberMe: boolean;
}

export interface CompanyRegistrationData {
    email: string;
    password: string;
    name: string;
    address: string;
    tax_number: string;
    contact_person_name: string;
    activity_scope: string;
    website: string;
    short_description: string;
    phone_number: string;
    terms_accepted: boolean;
}

export interface CompanyProfile {
    name: string;
    address: string;
    tax_number: string;
    contact_person_name: string;
    activity_scope: string;
    website: string;
    short_description: string;
    phone_number: string;
}

const handleResponse = async (response: Response) => {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    return data;
};

export const registerCompany = async (registrationData: CompanyRegistrationData) => {
    const response = await fetch(`${API_BASE_URL}/company/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationData),
    });
    return handleResponse(response);
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

export const getCompanyProfile = async () => {
    const response = await fetch(`${API_BASE_URL}/company/profile`, {
        method: "GET",
        credentials: "include",
    });
    return handleResponse(response);
};

export const updateCompanyProfile = async (companyData: CompanyProfile) => {
    const response = await fetch(`${API_BASE_URL}/company/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(companyData),
    });
    return handleResponse(response);
};
