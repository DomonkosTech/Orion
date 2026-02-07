import React, { useState, useRef, useEffect } from "react";
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

            // Only show scrollbar if content exceeds max-height (150px)
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
        <div className={styles.inputBar}>
            <textarea
                ref={textareaRef}
                placeholder={selectedCompany ? t('messageInput.placeholder') : t('messageInput.placeholderDisabled')}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isDisabled}
                className={`${styles.inputField} ${isDisabled ? styles.inputFieldDisabled : ""}`}
                rows={1}
            />
            <button
                disabled={isButtonDisabled}
                onClick={handleSend}
                className={`${styles.sendButton} ${isButtonDisabled ? styles.sendButtonDisabled : styles.sendButtonActive}`}
            >
                {sending ? (
                    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="animate-spin">⟳</span> {t('messageInput.sending')}
            </span>
                ) : (
                    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {t('messageInput.send')}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
            </span>
                )}
            </button>
        </div>
    );
};

export default MessageInput;