import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMessenger } from "../hooks/useMessenger";
import styles from "../MessengerPage.module.css";
import { useTranslation } from "react-i18next";

const MessageInput: React.FC = () => {
    const { t } = useTranslation('components');
    const { selectedCompanyId, selectedCompany, sendMessage, sending } = useMessenger();
    const [inputText, setInputText] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;

            if (textareaRef.current.scrollHeight > 150) {
                textareaRef.current.style.overflowY = "auto";
            } else {
                textareaRef.current.style.overflowY = "hidden";
            }
        }
    }, [inputText]);

    const handleSend = () => {
        if (!selectedCompanyId || sending || !inputText.trim()) return;
        sendMessage(inputText);
        setInputText("");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const isDisabled = !selectedCompanyId;
    const isButtonDisabled = isDisabled || !inputText.trim() || sending;

    return (
        <motion.div 
            layout
            className={styles.inputBar}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
            <motion.textarea
                layout
                ref={textareaRef}
                placeholder={selectedCompany ? t('messageInput.placeholder') : t('messageInput.placeholderDisabled')}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isDisabled}
                className={`${styles.inputField} ${isDisabled ? styles.inputFieldDisabled : ""}`}
                rows={1}
                whileFocus={{ 
                    boxShadow: "0 0 0 2px rgba(99, 102, 241, 0.2)",
                    borderColor: "#6366f1"
                }}
            />
            <motion.button
                layout
                initial={false}
                animate={{ 
                    scale: isButtonDisabled ? 0.95 : 1,
                    opacity: isButtonDisabled ? 0.7 : 1,
                    backgroundColor: isButtonDisabled ? "#e2e8f0" : "#6366f1"
                }}
                whileHover={isButtonDisabled ? {} : { 
                    scale: 1.05,
                    backgroundColor: "#4f46e5",
                    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)"
                }}
                whileTap={isButtonDisabled ? {} : { scale: 0.95 }}
                disabled={isButtonDisabled}
                onClick={handleSend}
                className={`${styles.sendButton} ${isButtonDisabled ? styles.sendButtonDisabled : styles.sendButtonActive}`}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
                <AnimatePresence mode="wait">
                    {sending ? (
                        <motion.span 
                            key="sending"
                            initial={{ opacity: 0, scale: 0.5, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.5, y: -10 }}
                            style={{ display: "flex", alignItems: "center", gap: "8px" }}
                        >
                            <motion.span 
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                style={{ display: "inline-block" }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                </svg>
                            </motion.span> 
                            {t('messageInput.sending')}
                        </motion.span>
                    ) : (
                        <motion.span 
                            key="send"
                            initial={{ opacity: 0, scale: 0.5, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.5, y: -10 }}
                            style={{ display: "flex", alignItems: "center", gap: "8px" }}
                        >
                            {t('messageInput.send')}
                            <motion.span
                                animate={inputText.trim() ? { x: [0, 2, 0], y: [0, -2, 0] } : {}}
                                transition={{ repeat: Infinity, duration: 2 }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="22" y1="2" x2="11" y2="13"></line>
                                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                </svg>
                            </motion.span>
                        </motion.span>
                    )}
                </AnimatePresence>
            </motion.button>
        </motion.div>
    );
};

export default MessageInput;