import React, { useEffect, useRef, useState } from "react";
import { useMessenger } from "../hooks/useMessenger";
import type { Message } from "../../../Api/messageApi";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import styles from "../MessengerPage.module.css";
import { useTranslation, Trans } from "react-i18next";
import { useAuth } from "../../../hooks/useAuth";
import { ChevronLeft } from "lucide-react";

function getInitials(name?: string) {
    if (!name) return "?";
    const trimmed = name.trim();
    if (!trimmed) return "?";
    const letters = trimmed
        .split(/\s+/)
        .map((s) => s[0])
        .join("");
    const take = (letters || trimmed).slice(0, 2);
    return take.toUpperCase();
}

const ChatWindow: React.FC = () => {
    const { t } = useTranslation('components');
    const { userType } = useAuth();
    const {
        selectedCompany,
        messages,
        messagesLoading,
        messagesError,
        sendError,
        lastReadUserMessageId,
        setSelectedCompanyId
    } = useMessenger();

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Use a local state to delay the appearance of the loader slightly to avoid flickering
    // but ensure it clears as soon as messagesLoading is false.
    const [delayedLoading, setDelayedLoading] = useState(false);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (messagesLoading) {
            timer = setTimeout(() => setDelayedLoading(true), 150);
        } else {
            setDelayedLoading(false);
        }
        return () => clearTimeout(timer);
    }, [messagesLoading]);

    const showLoader = messagesLoading && delayedLoading;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (!showLoader) {
            scrollToBottom();
        }
    }, [messages, showLoader]);

    const handleBack = () => {
        setSelectedCompanyId(null);
    };

    return (
        <section className={styles.chatPane}>
            <div className={styles.chatHeader}>
                <button
                    onClick={handleBack}
                    className={`${styles.headerBackButton} ${styles.mobileHeaderBackButton} ${styles.chatBackButton}`}
                    style={{ marginRight: '12px' }}
                    title={t('chatWindow.back')}
                >
                    <ChevronLeft size={24} />
                </button>
                {selectedCompany ? selectedCompany.company_name : t('chatWindow.selectConversation')}
            </div>
            <div className={styles.messagesContainer}>
                {!selectedCompany && !showLoader && (
                    <div className={styles.emptyState}>
                        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>💬</div>
                        <div><Trans i18nKey="chatWindow.emptyState" t={t} /></div>
                    </div>
                )}
                {showLoader && (
                    <div className={`${styles.emptyState} ${styles.loadingState}`}>{t('chatWindow.loading')}</div>
                )}
                {messagesError && !showLoader && (
                    <div className={styles.emptyState} style={{ color: "#ef4444" }}>{messagesError}</div>
                )}
                {!showLoader && !messagesError && selectedCompany && (
                    <>
                        {sendError && (
                            <div style={{
                                padding: "12px 16px",
                                background: "#fee2e2",
                                color: "#b91c1c",
                                borderRadius: "8px",
                                marginBottom: "16px",
                                fontSize: "0.9rem"
                            }}>
                                {t('chatWindow.sendError', { error: sendError })}
                            </div>
                        )}
                        {messages.length === 0 ? (
                            <div className={styles.emptyState}>
                                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>👋</div>
                                <div><Trans i18nKey="chatWindow.noMessages" t={t} /></div>
                            </div>
                        ) : (
                            messages.map((m: Message, index: number) => {
                                const isUserMessage = m.sender_type === "USER";
                                const isMyMessage = (userType === "user" && isUserMessage) || (userType === "company" && !isUserMessage);
                                const initials = getInitials(selectedCompany?.company_name);

                                return (
                                    <MessageBubble
                                        key={m.id}
                                        message={m}
                                        isMyMessage={isMyMessage}
                                        initials={initials}
                                        isLastRead={isMyMessage && m.id === lastReadUserMessageId}
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    />
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>
            <MessageInput />
        </section>
    );
};

export default ChatWindow;