import React, { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
    type CompanyChatPartner,
    type Message,
    getUserChatPartners,
    getMessagesForUser,
    sendUserMessage
} from "../../../api/messageApi.ts";

interface MessengerContextType {
    partners: CompanyChatPartner[];
    partnersLoading: boolean;
    partnersError: string | null;
    selectedCompanyId: number | null;
    setSelectedCompanyId: (id: number | null) => void;
    selectedCompany: CompanyChatPartner | null;
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
    const [partners, setPartners] = useState<CompanyChatPartner[]>([]);
    const [partnersLoading, setPartnersLoading] = useState(false);
    const [partnersError, setPartnersError] = useState<string | null>(null);

    const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
    const selectedCompany = useMemo(
        () => partners.find((p) => p.company_id === selectedCompanyId) ?? null,
        [partners, selectedCompanyId]
    );

    const [messages, setMessages] = useState<Message[]>([]);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [messagesError, setMessagesError] = useState<string | null>(null);

    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);

    const lastReadUserMessageId = useMemo(() => {
        const readUserMessages = messages.filter(
            (m) => m.sender_type === "USER" && m.is_read
        );
        if (readUserMessages.length === 0) return null;
        const last = readUserMessages.reduce((acc, cur) =>
            new Date(cur.created_at).getTime() > new Date(acc.created_at).getTime()
                ? cur
                : acc
        );
        return last.id;
    }, [messages]);

    useEffect(() => {
        let cancelled = false;
        async function loadPartners() {
            setPartnersLoading(true);
            setPartnersError(null);
            try {
                const json = await getUserChatPartners();
                const data: CompanyChatPartner[] = json?.data ?? [];
                if (!cancelled) {
                    setPartners(data);
                    if (data.length > 0) setSelectedCompanyId((prev) => prev ?? data[0].company_id);
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
    }, []);

    useEffect(() => {
        if (!selectedCompanyId) return;
        let cancelled = false;
        async function loadMessages() {
            setMessagesLoading(true);
            setMessagesError(null);
            try {
                const json = await getMessagesForUser(selectedCompanyId!);
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
    }, [selectedCompanyId]);

    const sendMessage = async (text: string) => {
        if (!selectedCompanyId) return;
        const trimmedText = text.trim();
        if (!trimmedText) return;
        setSendError(null);

        const tempId = -Date.now();
        const optimistic: Message = {
            id: tempId,
            user_id: 0,
            company_id: selectedCompanyId,
            message: trimmedText,
            sender_type: "USER",
            created_at: new Date().toISOString(),
            is_read: false,
        };

        setMessages((prev) => [...prev, optimistic]);
        setSending(true);

        try {
            const res = await sendUserMessage(trimmedText, selectedCompanyId);
            const data = (res?.data ?? []) as unknown as Message[];
            const created: Message | undefined = Array.isArray(data) ? data[0] : (data as unknown as Message);

            if (created && typeof created.id === "number") {
                setMessages((prev) => prev.map((m) => (m.id === tempId ? created : m)));
            } else {
                try {
                    const json = await getMessagesForUser(selectedCompanyId);
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
                selectedCompanyId,
                setSelectedCompanyId,
                selectedCompany,
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