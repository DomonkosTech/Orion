// src/services/advertisementService.ts
import { API_BASE_URL } from "./ApiConfig.ts";

export interface Company {
    name?: string;
}
export interface Advertisement {
    title?: string;
}

export interface CompanyAdvertisement {
    id: number;
    title: string;
    location: string;
    position: string;
    is_active: boolean;
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

export interface CreateAdvertisementData {
    title: string;
    position: string;
    location: string;
    hourly_wage: number;
    tasks: string;
    requirements: string;
    job_description: string;
    is_active: boolean;
}

export interface UpdateAdvertisementData {
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
    advertisement?: Advertisement;
}

export class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);
        this.status = status;
        this.name = "ApiError";
    }
}

const handleResponse = async (response: Response) => {
    const data = await response.json();
    if (!response.ok) {
        throw new ApiError(data.error || `HTTP error! status: ${response.status}`, response.status);
    }
    return data;
};

export const getJobApplications = async () => {
    const response = await fetch(`${API_BASE_URL}/user/applications`, {
        method: "get",
        credentials: "include",
    });
    return handleResponse(response);
}


export const getAdvertisements = async (
    q: string = "",
    location: string = "",
    position: string = "",
    hourly_wage: number | string = "",
    page: number = 1,
    limit: number = 21
) => {
    const params = new URLSearchParams();
    if (q) params.append("q", q);
    if (location) params.append("location", location);
    if (position) params.append("position", position);
    if (hourly_wage) params.append("hourly_wage", String(hourly_wage));
    params.append("page", String(page));
    params.append("limit", String(limit));

    const response = await fetch(`${API_BASE_URL}/advertisements2?${params.toString()}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
    });
    return handleResponse(response);
};

export const getTop3Advertisements = async () => {
    const response = await fetch(`${API_BASE_URL}/advertisements/top3`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
    });
    return handleResponse(response);
};

export const getCompanyAdvertisements = async () => {
    const response = await fetch(`${API_BASE_URL}/company/advertisements`, {
        method: "GET",
        credentials: "include",
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

export const getAdvertisementForEdit = async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/advertisement/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
    });
    return handleResponse(response);
};

export const createAdvertisement = async (adData: CreateAdvertisementData) => {
    const response = await fetch(`${API_BASE_URL}/advertisements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(adData),
    });
    return handleResponse(response);
};

export const updateAdvertisement = async (id: string, adData: UpdateAdvertisementData) => {
    const response = await fetch(`${API_BASE_URL}/advertisements/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(adData),
    });
    return handleResponse(response);
};

export const updateviewcounter = async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/advertisements/${id}/views`, {
        method: "PATCH",
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

export const updateAdvertisementStatus = async (id: string, status: boolean)=> {
    const response = await fetch(`${API_BASE_URL}/advertisements/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: status }),
    });
    return handleResponse(response);
};

export const getEmployees = async () => {
    const response = await fetch(`${API_BASE_URL}/employees`, {
        method: "GET",
        credentials: "include",
    });
    return handleResponse(response);
}

export const deleteEmployee = async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
        method: "DELETE",
        credentials: "include",
    });
    return handleResponse(response);
}

export const OrionAI = async (userinput: string, wage: number = 2000) => {
    const response = await fetch(`${API_BASE_URL}/OrionAI`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            userinput: userinput,
            wage: wage,
        })
    });
    return handleResponse(response);
}

export const addFavorite = async (advertisementId: number) => {
    const response = await fetch(`${API_BASE_URL}/favorites`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            },
        body: JSON.stringify({
            advertisementId: advertisementId,
        })
    });
    return handleResponse(response)
}

export const getFavorites = async (includeAdvertisement: boolean = false) => {
    const params = new URLSearchParams();

    if (includeAdvertisement) {
        params.append("includeAdvertisement", "true");
    }

    const url = params.toString()
        ? `${API_BASE_URL}/favorites?${params.toString()}`
        : `${API_BASE_URL}/favorites`;

    const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
    });

    return handleResponse(response);
};
