import React, { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
    type CompanyChatPartner,
    type UserChatPartner,
    type Message,
    getUserChatPartners,
    getCompanyChatPartners,
    getMessagesForUser,
    getMessagesForCompany,
    sendUserMessage,
    sendCompanyMessage
} from "../../../api/messageApi.ts";
import { useAuth } from "../../../hooks/useAuth";

export interface ChatPartner {
    id: number;
    name: string;
    last_message_at: string | null;
}

interface MessengerContextType {
    partners: ChatPartner[];
    partnersLoading: boolean;
    partnersError: string | null;
    selectedPartnerId: number | null;
    setSelectedPartnerId: (id: number | null) => void;
    selectedPartner: ChatPartner | null;
    messages: Message[];
    messagesLoading: boolean;
    messagesError: string | null;
    sendMessage: (text: string) => Promise<void>;
    sending: boolean;
    sendError: string | null;
    lastReadUserMessageId: number | null;
}

const MessengerContext = createContext<MessengerContextType | undefined>(undefined);

export const MessengerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { userType, loading: authLoading } = useAuth();

    const [partners, setPartners] = useState<ChatPartner[]>([]);
    const [partnersLoading, setPartnersLoading] = useState(false);
    const [partnersError, setPartnersError] = useState<string | null>(null);

    const [selectedPartnerId, setSelectedPartnerId] = useState<number | null>(null);
    const selectedPartner = useMemo(
        () => partners.find((p) => p.id === selectedPartnerId) ?? null,
        [partners, selectedPartnerId]
    );

    const [messages, setMessages] = useState<Message[]>([]);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [messagesError, setMessagesError] = useState<string | null>(null);

    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);

    const lastReadUserMessageId = useMemo(() => {
        const mySenderType = userType === "company" ? "COMPANY" : "USER";
        const readMyMessages = messages.filter(
            (m) => m.sender_type === mySenderType && m.is_read
        );
        if (readMyMessages.length === 0) return null;
        const last = readMyMessages.reduce((acc, cur) =>
            new Date(cur.created_at).getTime() > new Date(acc.created_at).getTime()
                ? cur
                : acc
        );
        return last.id;
    }, [messages, userType]);

    useEffect(() => {
        if (authLoading) return;

        let cancelled = false;
        async function loadPartners() {
            setPartnersLoading(true);
            setPartnersError(null);
            try {
                let data: ChatPartner[] = [];
                if (userType === "user") {
                    const json = await getUserChatPartners();
                    const raw = (json?.data ?? []) as CompanyChatPartner[];
                    data = raw.map(p => ({
                        id: p.company_id,
                        name: p.company_name,
                        last_message_at: p.last_message_at
                    }));
                } else if (userType === "company") {
                    const json = await getCompanyChatPartners();
                    const raw = (json?.data ?? []) as UserChatPartner[];
                    data = raw.map(p => ({
                        id: p.user_id,
                        name: `${p.user_lname} ${p.user_fname}`,
                        last_message_at: p.last_message_at
                    }));
                }

                if (!cancelled) {
                    setPartners(data);
                    // Only set initial partner if none is selected
                    if (data.length > 0) {
                        setSelectedPartnerId((prev) => {
                            if (prev !== null) return prev;
                            return data[0].id;
                        });
                    }
                }
            } catch {
                if (!cancelled) setPartnersError("hiba történt");
            } finally {
                if (!cancelled) setPartnersLoading(false);
            }
        }
        loadPartners();
        return () => {
            cancelled = true;
        };
    }, [userType, authLoading]);

    useEffect(() => {
        if (selectedPartnerId === null || authLoading) return;
        let cancelled = false;
        async function loadMessages() {
            setMessagesLoading(true);
            setMessagesError(null);
            try {
                let json;
                if (userType === "user") {
                    json = await getMessagesForUser(selectedPartnerId!);
                } else if (userType === "company") {
                    json = await getMessagesForCompany(selectedPartnerId!);
                }

                const data: Message[] = json?.data ?? [];
                if (!cancelled) setMessages(data);
            } catch {
                if (!cancelled) setMessagesError("Ismeretlen hiba történt");
            } finally {
                if (!cancelled) setMessagesLoading(false);
            }
        }
        loadMessages();
        return () => {
            cancelled = true;
        };
    }, [selectedPartnerId, userType, authLoading]);

    const sendMessage = async (text: string) => {
        if (!selectedPartnerId || !userType) return;
        const trimmedText = text.trim();
        if (!trimmedText) return;
        setSendError(null);

        const tempId = -Date.now();
        const optimistic: Message = {
            id: tempId,
            user_id: userType === "company" ? selectedPartnerId : 0,
            company_id: userType === "user" ? selectedPartnerId : 0,
            message: trimmedText,
            sender_type: userType === "company" ? "COMPANY" : "USER",
            created_at: new Date().toISOString(),
            is_read: false,
        };

        setMessages((prev) => [...prev, optimistic]);
        setSending(true);

        try {
            let res;
            if (userType === "user") {
                res = await sendUserMessage(trimmedText, selectedPartnerId);
            } else {
                res = await sendCompanyMessage(trimmedText, selectedPartnerId);
            }

            const data = (res?.data ?? []) as unknown as Message[];
            const created: Message | undefined = Array.isArray(data) ? data[0] : (data as unknown as Message);

            if (created && typeof created.id === "number") {
                setMessages((prev) => prev.map((m) => (m.id === tempId ? created : m)));
            } else {
                try {
                    let json;
                    if (userType === "user") {
                        json = await getMessagesForUser(selectedPartnerId);
                    } else {
                        json = await getMessagesForCompany(selectedPartnerId);
                    }
                    const data: Message[] = json?.data ?? [];
                    setMessages(data);
                } catch {
                    // ignore
                }
            }
        } catch (e: any) {
            setMessages((prev) => prev.filter((m) => m.id !== tempId));
            setSendError(e?.message || "Nem sikerült elküldeni az üzenetet. Próbáld újra.");
        } finally {
            setSending(false);
        }
    };

    return (
        <MessengerContext.Provider
            value={{
                partners,
                partnersLoading,
                partnersError,
                selectedPartnerId,
                setSelectedPartnerId,
                selectedPartner,
                messages,
                messagesLoading,
                messagesError,
                sendMessage,
                sending,
                sendError,
                lastReadUserMessageId,
            }}
        >
            {children}
        </MessengerContext.Provider>
    );
};

export const useMessengerContext = () => {
    const context = useContext(MessengerContext);
    if (context === undefined) {
        throw new Error("useMessengerContext must be used within a MessengerProvider");
    }
    return context;
};