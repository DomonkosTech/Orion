import React, { useEffect, useMemo, useState, useRef, type ReactNode } from "react";
import {
    type CompanyChatPartner,
    type UserChatPartner,
    type Message,
    getUserChatPartners,
    getCompanyChatPartners,
    getMessagesForUser,
    getMessagesForCompany,
    sendUserMessage,
    sendCompanyMessage,
} from "../../../Api/messageApi.ts";
import {wbsocket} from "../../../Api/ApiConfig.ts";
import { useAuth } from "../../../hooks/useAuth";
import { MessengerContext, type ChatPartner } from "./MessengerContextInstance";


export const MessengerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { userType, loading: authLoading, userData } = useAuth();

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
                    // Auto-selection removed for better mobile UX
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

    // WebSocket ref és state refek a stabil kapcsolathoz (hogy ne kelljen újracsatlakozni váltáskor)
    const ws = useRef<WebSocket | null>(null);
    const selectedPartnerIdRef = useRef(selectedPartnerId);
    const userRef = useRef(userData);
    const userTypeRef = useRef(userType);

    useEffect(() => {
        selectedPartnerIdRef.current = selectedPartnerId;
        userRef.current = userData;
        userTypeRef.current = userType;
    }, [selectedPartnerId, userData, userType]);

    // WebSocket connection with auto-reconnect
    useEffect(() => {
        if (authLoading || !userData) return;

        let reconnectTimeout: ReturnType<typeof setTimeout>;
        let isMounted = true;

        const connect = () => {
            if (!isMounted) return;
            // Ha már van aktív kapcsolat, ne csináljunk újat
            if (ws.current && (ws.current.readyState === WebSocket.OPEN || ws.current.readyState === WebSocket.CONNECTING)) {
                return;
            }

            console.log("Attempting to connect to WebSocket...");
            const socket = new WebSocket(wbsocket);
            ws.current = socket;

            socket.onopen = () => {
                console.log("Connected to WebSocket");
            };

            socket.onmessage = (event) => {
                console.log("WS Raw Message:", event.data);
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'NEW_MESSAGE') {
                        const rawMessage = data.payload;
                        console.log("New message payload:", rawMessage);
                        
                        // Normalize message structure (handle camelCase vs snake_case)
                        const newMessage: Message = {
                            ...rawMessage,
                            user_id: rawMessage.user_id || rawMessage.userId,
                            company_id: rawMessage.company_id || rawMessage.companyId,
                        };

                        // A refekből olvassuk ki az aktuális állapotot
                        const currentPartnerId = selectedPartnerIdRef.current;
                        const currentUser = userRef.current;
                        const currentUserType = userTypeRef.current;

                        // Check if the message belongs to the current conversation
                        if (currentPartnerId && currentUser) {
                            // Try to find the ID in various common properties
                            const myId = currentUserType === 'user' 
                                ? (currentUser.userId || currentUser.id || currentUser.user_id) 
                                : (currentUser.companyId || currentUser.id || currentUser.company_id);
                            
                            console.log("WS Check Relevance:", { 
                                currentUserType, 
                                currentPartnerId, 
                                myId, 
                                newMessage,
                                matchUser: currentUserType === 'user' && newMessage.company_id == currentPartnerId && newMessage.user_id == myId,
                                matchCompany: currentUserType === 'company' && newMessage.user_id == currentPartnerId && newMessage.company_id == myId
                            });
                            
                            // Use loose equality (==) to handle string/number mismatch
                            const isRelevant = 
                                (currentUserType === 'user' && newMessage.company_id == currentPartnerId && newMessage.user_id == myId) ||
                                (currentUserType === 'company' && newMessage.user_id == currentPartnerId && newMessage.company_id == myId);

                            if (isRelevant) {
                                setMessages((prev) => {
                                    // Avoid duplicates
                                    if (prev.some(m => m.id === newMessage.id)) return prev;
                                    return [...prev, newMessage];
                                });
                            }
                        } else {
                            console.log("WS: Missing partner or user info", { currentPartnerId, currentUser });
                        }
                    }
                } catch (error) {
                    console.error("Error processing WebSocket message:", error);
                }
            };

            socket.onclose = () => {
                console.log("WebSocket disconnected");
                ws.current = null;
                if (isMounted) {
                    console.log("Reconnecting in 3s...");
                    reconnectTimeout = setTimeout(connect, 3000);
                }
            };

            socket.onerror = (err) => {
                console.error("WebSocket error:", err);
                socket.close(); // This will trigger onclose
            };
        };

        connect();

        return () => {
            isMounted = false;
            clearTimeout(reconnectTimeout);
            if (ws.current) {
                // Remove listeners to avoid side effects during closing
                ws.current.onclose = null; 
                ws.current.close();
                ws.current = null;
            }
        };
    }, [userData, authLoading]); // Reconnect when user changes

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
                // If we don't get the created message back directly, we might rely on the websocket or re-fetch
                // But usually the API returns the created message.
                // If not, we keep the optimistic one until a refresh or WS update.
            }
        } catch (e) {
            setMessages((prev) => prev.filter((m) => m.id !== tempId));
            const errorMessage = e instanceof Error ? e.message : "Nem sikerült elküldeni az üzenetet. Próbáld újra.";
            setSendError(errorMessage);
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
