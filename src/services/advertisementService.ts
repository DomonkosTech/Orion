// src/services/advertisementService.ts

export interface Company {
    name?: string;
}
export interface Advertisement {
    title?: string;
}

export interface Job {
    id: number;
    title: string;
    position: string;
    location: string;
    hourly_wage: number;
    tasks: string;
    requirements: string;
    job_description: string;
}

export interface AdvertisementDetails {
    title: string;
    position: string;
    location: string;
    hourly_wage: string;
    tasks: string;
    requirements: string;
    job_description: string;
    is_active: boolean;
}

export interface JobApplicationData {
    id: number;
    user_id: number;
    advertisement_id?: number;
    status?: string;
    last_updated?: string;
    company_id?: number;
    position?: string;
    job_title?: string;
    hourly_wage?: number;
    hire_date?: string;
    company?: Company;
    advertisment?: Advertisement;
}

const API_BASE_URL = "http://localhost:4000/api";

const handleResponse = async (response: Response) => {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    return data;
};

export const getJobApplications = async () => {
    const response = await fetch(`${API_BASE_URL}/addadvertisment/getallsubmit`, {
        method: "POST",
        credentials: "include",
    });
    return handleResponse(response);
}

export const getAdvertisements = async () => {
    const response = await fetch(`${API_BASE_URL}/advertisements`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
    });
    return handleResponse(response);
};

export const getAdvertisementById = async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/advertisements/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
    });
    return handleResponse(response);
};

export const submitApplication = async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id }),
    });
    return handleResponse(response);
};
