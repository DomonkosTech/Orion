import { API_BASE_URL } from "./apiConfig";


const handleResponse = async (response: Response) => {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    return data;
};


export const getCompanyMessages = async () => {
    const response = await fetch(`${API_BASE_URL}/company/messages`, {
        method: "GET",
        credentials: "include",
    });
    return handleResponse(response);
};

export const getUserMessages = async () => {
    const response = await fetch(`${API_BASE_URL}/user/messages`, {
        method: "GET",
        credentials: "include",
    });
    return handleResponse(response);
};

export const readUserSystemMessage = async (messageId: number) => {
    const response = await fetch(`${API_BASE_URL}/user/messages/read/${messageId}`, {
        method: "PATCH",
        credentials: "include",
    });
    return handleResponse(response);
}

export const readCompanySystemMessage = async (messageId: number) => {
    const response = await fetch(`${API_BASE_URL}/company/messages/read/${messageId}`, {
        method: "PATCH",
        credentials: "include",
    });
    return handleResponse(response);
}
