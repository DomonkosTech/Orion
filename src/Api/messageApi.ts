
const API_BASE_URL = "http://localhost:4000/api"


export interface CompanyChatPartner {
    company_id: number;
    company_name: string;
    message_id: number;
    sender_type: "USER" | "COMPANY";
    message: string;
    is_read: boolean;
    created_at: string;
}

export interface UserChatPartner {
    user_id: number;
    user_lname: string,
    user_fname: string,
    last_message_at: string | null;
    message: string | null;
    is_read: boolean;
    sender_type: "USER" | "COMPANY";
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

// Get all conversations (chat partners) for the logged-in user
// GET /messages/conversations
export const getUserChatPartners = async () => {
    const response = await fetch(`${API_BASE_URL}/messages/conversations`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });
    return handleResponse(response);
};

// Get all conversations (chat partners) for the logged-in company
// GET /messages/conversations/company
export const getCompanyChatPartners = async () => {
    const response = await fetch(`${API_BASE_URL}/messages/conversations/company`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });
    return handleResponse(response);
};

// Get messages in a conversation (user perspective)
// GET /messages/conversations/:id
export const getMessagesForUser = async (companyId: number) => {
    const response = await fetch(`${API_BASE_URL}/messages/conversations/${companyId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });
    return handleResponse(response);
};

// Get messages in a conversation (company perspective)
// GET /messages/conversations/:id/company
export const getMessagesForCompany = async (userId: number) => {
    const response = await fetch(`${API_BASE_URL}/messages/conversations/${userId}/company`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });
    return handleResponse(response);
};

// Send a message (user)
// POST /messages
export const sendUserMessage = async (message: string, companyId: number) => {
    const response = await fetch(`${API_BASE_URL}/messages`, {
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

// Send a message (company)
// POST /messages/company
export const sendCompanyMessage = async (message: string, userId: number) => {
    const response = await fetch(`${API_BASE_URL}/messages/company`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            userId: userId,
            message: message,
        }),
        credentials: "include",
    });

    return handleResponse(response);
};


