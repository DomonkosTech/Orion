import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMessenger } from "../hooks/useMessenger";
import type { Message } from "../../../../Api/messageApi";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import styles from "../MessengerPage.module.css";
import { useTranslation, Trans } from "react-i18next";
import { useAuth } from "../../../../hooks/useAuth";
import { Menu } from "lucide-react";
import { Header } from "../../../../components/layout/Header/Header";
import { AVATAR_COLORS } from "../context/MessengerContextInstance";

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
    const containerRef = useRef<HTMLDivElement>(null);
    const prevCompanyIdRef = useRef<number | null>(null);

    const [delayedLoading, setDelayedLoading] = useState(false);

    // Reset scroll to top immediately when a new conversation is selected
    // This prevents "inheriting" the scroll position from the previous chat
    useEffect(() => {
        if (selectedCompany?.company_id && containerRef.current) {
            containerRef.current.scrollTop = 0;
        }
    }, [selectedCompany?.company_id]);

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

    const scrollToBottom = (behavior: ScrollBehavior = "smooth", delay = 50) => {
        // Use a timeout to ensure the DOM has updated and Framer Motion layout is ready
        setTimeout(() => {
            if (containerRef.current && messagesEndRef.current) {
                const { scrollHeight, clientHeight } = containerRef.current;
                
                // ONLY scroll if the content exceeds the container height
                if (scrollHeight > clientHeight) {
                    messagesEndRef.current.scrollIntoView({ behavior });
                    
                    // Double-check scroll for 100% reliability on initial load or large updates
                    if (delay > 100) {
                        setTimeout(() => {
                            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                        }, 150);
                    }
                }
            }
        }, delay);
    };

    useEffect(() => {
        if (!showLoader && selectedCompany && messages.length > 0) {
            const isNewConversation = prevCompanyIdRef.current !== selectedCompany.company_id;
            
            // If it's a new conversation, wait 100ms for a quick but visible transition
            // Otherwise (new message), use a shorter delay for responsiveness
            const delay = isNewConversation ? 100 : 50;
            
            scrollToBottom("smooth", delay);
            prevCompanyIdRef.current = selectedCompany.company_id;
        }
    }, [messages, showLoader, selectedCompany]);

    const handleBack = () => {
        setSelectedCompanyId(null);
    };

    return (
        <section className={styles.chatPane}>
            <div className={styles.mobileOnly}>
                <Header />
            </div>
            <motion.div 
                layout
                className={styles.chatHeader}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={selectedCompany?.company_id || "empty"}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ 
                            duration: 0.1 
                        }}
                        style={{ display: "flex", alignItems: "center", width: "100%" }}
                    >
                        <motion.button
                            whileHover={{ scale: 1.1, backgroundColor: "rgba(241, 245, 249, 1)" }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleBack}
                            className={`${styles.headerBackButton} ${styles.mobileHeaderBackButton} ${styles.chatBackButton}`}
                            style={{ marginRight: '12px' }}
                            title={t('chatWindow.back')}
                        >
                            <Menu size={24} />
                        </motion.button>
                        {selectedCompany ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", fontWeight: 600 }}>
                                <motion.div 
                                    layoutId={`avatar-header-${selectedCompany.company_id}`}
                                    className={styles.avatar}
                                    style={{ 
                                        width: 32, 
                                        height: 32, 
                                        minWidth: 32, 
                                        fontSize: "0.8rem", 
                                        borderRadius: "12px",
                                        background: AVATAR_COLORS[Math.abs(selectedCompany.company_id) % AVATAR_COLORS.length]
                                    }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                >
                                    {getInitials(selectedCompany.company_name)}
                                </motion.div>
                                <motion.span layout="position">{selectedCompany.company_name}</motion.span>
                            </div>
                        ) : (
                            <motion.span layout="position">{t('chatWindow.selectConversation')}</motion.span>
                        )}
                    </motion.div>
                </AnimatePresence>
            </motion.div>
            
            <div ref={containerRef} className={styles.messagesContainer}>
                <AnimatePresence mode="wait">
                    {!selectedCompany && !showLoader && (
                        <motion.div 
                            key="no-selection"
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -10 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className={styles.emptyState}
                        >
                            <motion.div 
                                animate={{ 
                                    y: [0, -15, 0],
                                    scale: [1, 1.1, 1],
                                    rotate: [0, 5, -5, 0]
                                }}
                                transition={{ 
                                    repeat: Infinity, 
                                    duration: 4, 
                                    ease: "easeInOut" 
                                }}
                                style={{ fontSize: "4rem", marginBottom: "1.5rem", filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.1))" }}
                            >
                                💬
                            </motion.div>
                            <div style={{ fontWeight: 500, color: "#64748b" }}><Trans i18nKey="chatWindow.emptyState" t={t} /></div>
                        </motion.div>
                    )}
                    {showLoader && (
                        <motion.div 
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className={`${styles.emptyState} ${styles.loadingState}`}
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                style={{ 
                                    width: 40, 
                                    height: 40, 
                                    border: "3px solid #e2e8f0", 
                                    borderTopColor: "#6366f1", 
                                    borderRadius: "50%",
                                    marginBottom: "1rem"
                                }}
                            />
                            {t('chatWindow.loading')}
                        </motion.div>
                    )}
                    {messagesError && !showLoader && (
                        <motion.div 
                            key="error"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={styles.emptyState} 
                            style={{ color: "#ef4444" }}
                        >
                            {messagesError}
                        </motion.div>
                    )}
                    {!showLoader && !messagesError && selectedCompany && (
                        <motion.div
                            key={`chat-${selectedCompany.company_id}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.1 }}
                            style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}
                        >
                            {sendError && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, height: "auto", scale: 1 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    style={{
                                        padding: "12px 16px",
                                        background: "#fee2e2",
                                        color: "#b91c1c",
                                        borderRadius: "12px",
                                        marginBottom: "16px",
                                        fontSize: "0.9rem",
                                        border: "1px solid #fecaca",
                                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                                    }}
                                >
                                    {t('chatWindow.sendError', { error: sendError })}
                                </motion.div>
                            )}
                            {messages.length === 0 ? (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                    className={styles.emptyState}
                                >
                                    <motion.div 
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        style={{ fontSize: "4rem", marginBottom: "1.5rem" }}
                                    >
                                        👋
                                    </motion.div>
                                    <div style={{ fontWeight: 500, color: "#64748b" }}><Trans i18nKey="chatWindow.noMessages" t={t} /></div>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    layout
                                    style={{ display: "flex", flexDirection: "column", gap: "12px" }}
                                >
                                    {messages.map((m: Message) => {
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
                                            />
                                        );
                                    })}
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <MessageInput />
        </section>
    );
};

export default ChatWindow;