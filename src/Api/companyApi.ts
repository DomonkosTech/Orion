// src/services/companyService.ts
import { API_BASE_URL } from "./ApiConfig.ts";

export interface CompanyLoginData {
    email: string;
    password: string;
    rememberMe: boolean;
}

export interface CompanyRegistrationData {
    email: string;
    password: string;
    confirmPassword?: string;
    name: string;
    address: string;
    tax_number: string;
    contact_person_name: string;
    activity_scope: string;
    website?: string;
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
    website?: string;
    short_description: string;
    phone_number: string;
}

export interface DashboardStats {
    views?: number;
    applicants?: number;
    employees?: number;
    conversion?: number;
}

export interface LastApplication {
    last_updated: string;
    users: {
        fname: string;
        lname: string;
    };
    advertisement: {
        title: string;
    };
}

const handleResponse = async (response: Response) => {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    return data;
};

export const registerCompany = async (registrationData: CompanyRegistrationData) => {
    const response = await fetch(`${API_BASE_URL}/auth/company/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationData),
    });
    return handleResponse(response);
};

export const loginCompany = async (loginData: CompanyLoginData) => {
    const response = await fetch(`${API_BASE_URL}/auth/company/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(loginData),
    });
    return handleResponse(response);
}

export const getCompanyProfile = async () => {
    const response = await fetch(`${API_BASE_URL}/companies/me`, {
        method: "GET",
        credentials: "include",
    });
    return handleResponse(response);
};

export const updateCompanyProfile = async (companyData: CompanyProfile) => {
    const response = await fetch(`${API_BASE_URL}/companies/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(companyData),
    });
    return handleResponse(response);
};

export const getCompanystat = async () => {
    const response = await fetch(`${API_BASE_URL}/companies/me/stats`, {
        method: "GET",
        credentials: "include",
    });
    return handleResponse(response);
}

export const getEmployees = async () => {
    const response = await fetch(`${API_BASE_URL}/companies/me/employees`, {
        method: "GET",
        credentials: "include",
    });
    return handleResponse(response);
}

export const deleteEmployee = async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/companies/me/employees/${id}`, {
        method: "DELETE",
        credentials: "include",
    });
    return handleResponse(response);
}
