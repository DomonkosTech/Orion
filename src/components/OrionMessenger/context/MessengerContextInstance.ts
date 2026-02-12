import { createContext, useContext } from "react";
import type { Message } from "../../../Api/messageApi.ts";

export interface ChatPartner {
    id: number;
    name: string;
    last_message_at: string | null;
}

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
