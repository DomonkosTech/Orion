import { createContext, useContext } from "react";
import type { Message } from "../../../../Api/messageApi.ts";

export interface ChatPartner {
    id: number;
    name: string;
    last_message_at: string | null;
    is_read: boolean;
    sender_type?: "USER" | "COMPANY";
}

export const AVATAR_COLORS = [
    "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)", // Indigo/Purple
    "linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%)", // Blue/Teal
    "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)", // Amber/Red
    "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)", // Emerald/Blue
    "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)", // Pink/Violet
];

export interface MessengerContextType {
    partners: ChatPartner[];
    partnersLoading: boolean;
    partnersError: string | null;
    selectedPartnerId: number | null;
    setSelectedPartnerId: (id: number | null) => void;
    selectedPartner: ChatPartner | null;
    setNewChatPartner: (partner: ChatPartner | null) => void;
    messages: Message[];
    messagesLoading: boolean;
    messagesError: string | null;
    sendMessage: (text: string) => Promise<void>;
    sending: boolean;
    sendError: string | null;
    lastReadUserMessageId: number | null;
}

export const MessengerContext = createContext<MessengerContextType | undefined>(undefined);

export const useMessengerContext = () => {
    const context = useContext(MessengerContext);
    if (context === undefined) {
        throw new Error("useMessengerContext must be used within a MessengerProvider");
    }
    return context;
};
