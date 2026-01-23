

const API_BASE_URL = "http://localhost:4000/api"

export interface ChatPartner {
    company_id: number;
    company_name: string;
    last_message_at: string | null;
}

export interface Message {
    id: number;
    user_id: number;
    company_id: number;
    content?: string; // in case backend uses 'content'
    message?: string; // in case backend uses 'message'
    sender_type: "USER" | "COMPANY";
    created_at: string;
    is_read?: boolean;
}

const handleResponse = async (response: Response) => {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
    }
    return data;
};

export const getChatPartners = async () => {
    const response = await fetch(`${API_BASE_URL}/chat/user`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });
    return handleResponse(response);
};

export const getMessagesForCompany = async (companyId: number) => {
    const response = await fetch(`${API_BASE_URL}/chat/user/message/${companyId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });
    return handleResponse(response);
};
