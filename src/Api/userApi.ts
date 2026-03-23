// src/services/userServise.ts
import { API_BASE_URL } from "./ApiConfig.ts";

export interface UserProfileData {
    email: string;
    phone_number: string;
    birth_place: string;
    birth_date: string;
    address: string;
    tax_number: string;
    nationality: string;
    short_bio: string;
    qualifications: string;
    lname: string;
    fname: string;
}

export interface Documents {
    personal_id: string;
    address_card_number: string;
}

export interface UserRegistrationData extends UserProfileData, Documents {
    password: string;
    terms_accepted: boolean;
}

export interface UserLoginData {
    email: string;
    password: string;
    rememberMe: boolean;
}
export interface DashboardStats{
    total_applications: number;
    profile_views?: number;
    resume_views?: number;
    accepted_applications?: number;
}

const handleResponse = async (response: Response) => {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    return data;
};

export const uploadResume = async (file: File) => {
    const formData = new FormData();
    formData.append("resume", file);

    const response = await fetch(`${API_BASE_URL}/upload-resume`, {
        method: "POST",
        body: formData,
        credentials: "include",
    });

    return handleResponse(response);
};

export const loginUser = async (loginData: UserLoginData) => {
    const response = await fetch(`${API_BASE_URL}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(loginData),
    });
    return handleResponse(response);
}

export const registerUser = async (userData: UserRegistrationData) => {
    const response = await fetch(`${API_BASE_URL}/user/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
    });
    return handleResponse(response);
};

export const getUserProfile = async () => {
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: "GET",
        credentials: "include",
    });
    return handleResponse(response);
};

export const updateUserProfile = async (profileData: { user: UserProfileData, documents: Documents | null }) => {
    const payload = {
        ...profileData.user,
        documents: profileData.documents,
    };

    const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
    });
    return handleResponse(response);
};

export const deleteResume = async () => {
    const response = await fetch(`${API_BASE_URL}/delete-resume`, {
        method: "DELETE",
        credentials: "include",
    });
    return handleResponse(response);
};

export const getUserStatistics = async () => {
    const response = await fetch(`${API_BASE_URL}/user/stat`, {
        method: "GET",
        credentials: "include",
    });
    return handleResponse(response);
}

export const getUserResume = async () => {
    const response = await fetch(`${API_BASE_URL}/resume`, {
        method: "GET",
        credentials: "include",
    });
    return handleResponse(response);
}

export const incrementProfileViews = async (userId: number) => {
    const response = await fetch(`${API_BASE_URL}/user/profile/views/${userId}`, {
        method: "PATCH",
        credentials: "include",
    });
    return handleResponse(response);
}

export const incrementResumeViews = async (userId: number) => {
    const response = await fetch(`${API_BASE_URL}/user/resume/views/${userId}`, {
        method: "PATCH",
        credentials: "include",
    });
    return handleResponse(response);
}

