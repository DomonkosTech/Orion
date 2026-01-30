

const API_BASE_URL = "http://localhost:4000/api"

export interface CompanyChatPartner {
    company_id: number;
    company_name: string;
    last_message_at: string | null;
}

export interface UserChatPartner {
    user_id: number;
    user_lname: string,
    user_fname: string,
    last_message_at: string | null;
}

export interface Message {
    id: number;
    user_id: number;
    company_id: number;
    content?: string;
    message?: string;
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

export const getUserChatPartners = async () => {
    const response = await fetch(`${API_BASE_URL}/chat/user`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });
    return handleResponse(response);
};

export const getCompanyChatPartners = async () => {
    const response = await fetch(`${API_BASE_URL}/chat/company`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });
    return handleResponse(response);
};

export const getMessagesForUser = async (companyId: number) => {
    const response = await fetch(`${API_BASE_URL}/chat/user/message/${companyId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });
    return handleResponse(response);
};

export const getMessagesForCompany = async (userId: number) => {
    const response = await fetch(`${API_BASE_URL}/chat/company/message/${userId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });
    return handleResponse(response);
};

export const sendUserMessage = async (message: string, companyId: number) => {
    const response = await fetch(`${API_BASE_URL}/chat/user/send`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            companyId: companyId,
            message: message,
        }),
        credentials: "include",
    });

    return handleResponse(response);
};

export const sendCompanyMessage = async (message: string, userId: number) => {
    const response = await fetch(`${API_BASE_URL}/chat/company/send`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({

            companyId: userId,
            message: message,
        }),
        credentials: "include",
    });

    return handleResponse(response);
};


