import { API_BASE_URL } from "./ApiConfig.ts";


const handleResponse = async (response: Response) => {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    return data;
};


// Get notifications for logged-in company
// GET /notifications/company
export const getCompanyMessages = async () => {
    const response = await fetch(`${API_BASE_URL}/notifications/company`, {
        method: "GET",
        credentials: "include",
    });
    return handleResponse(response);
};

// Get notifications for logged-in user
// GET /notifications
export const getUserMessages = async () => {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
        method: "GET",
        credentials: "include",
    });
    return handleResponse(response);
};

// Mark a user notification as read
// PATCH /notifications/:id/read
export const readUserSystemMessage = async (messageId: number) => {
    const response = await fetch(`${API_BASE_URL}/notifications/${messageId}/read`, {
        method: "PATCH",
        credentials: "include",
    });
    return handleResponse(response);
};

// Mark a company notification as read
// PATCH /notifications/:id/read/company
export const readCompanySystemMessage = async (messageId: number) => {
    const response = await fetch(`${API_BASE_URL}/notifications/${messageId}/read/company`, {
        method: "PATCH",
        credentials: "include",
    });
    return handleResponse(response);
};
