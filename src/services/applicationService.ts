// src/services/applicationService.ts
import { API_BASE_URL } from "./apiConfig";

export interface ApplicantUser {
    email: string;
    phone_number: string;
    birth_place: string;
    birth_date: string;
    address: string;
    nationality: string;
    short_bio: string;
    qualifications: string;
    lname: string;
    fname: string;
}

export interface Applicant {
    id: number;
    last_updated: string;
    users: ApplicantUser;
}

const handleResponse = async (response: Response) => {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
    }
    return data;
};

export const getApplicantsForAdvertisement = async (advertisementId: string) => {
    const response = await fetch(`${API_BASE_URL}/advertisements/${advertisementId}/applicants`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });
    return handleResponse(response);
};

export const acceptApplication = async (applicationId: number) => {
    const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/accept`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });
    return handleResponse(response);
};

export const rejectApplication = async (applicationId: number) => {
    const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/reject`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });
    return handleResponse(response);
};

export const getResumeUrl = async (applicationId: number) => {
    const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/resume`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });
    return handleResponse(response);
};
