// src/services/applicationService.ts
import { API_BASE_URL } from "./ApiConfig.ts";

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
export interface click_count
{
    click_count: number;
}

export interface Applicant {
    id: number;
    user_id: number;
    last_updated: string;
    users: ApplicantUser;
    click_count: click_count;
}

const handleResponse = async (response: Response) => {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
    }
    return data;
};

export const getApplicantsForAdvertisement = async (advertisementId: string) => {
    const response = await fetch(`${API_BASE_URL}/advertisements/${advertisementId}/applications`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });
    return handleResponse(response);
};

export const updateApplicationStatus = async (applicationId: number, status: "accepted" | "rejected") => {
    const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/status`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status }),
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
