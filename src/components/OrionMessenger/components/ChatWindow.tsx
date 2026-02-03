import React, { useEffect, useRef, useState } from "react";
import { useMessenger } from "../hooks/useMessenger";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import styles from "../MessengerPage.module.css";
import { useTranslation, Trans } from "react-i18next";

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
  const {
    selectedCompany,
    messages,
    messagesLoading,
    messagesError,
    sendError,
    lastReadUserMessageId
  } = useMessenger();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showLoader, setShowLoader] = useState(false);
  const [minTimePassed, setMinTimePassed] = useState(false);

  // EFFECT 1: Handle the start of loading and the timer.
  useEffect(() => {
    if (selectedCompany) {
      setShowLoader(true);
      setMinTimePassed(false);

      const timer = setTimeout(() => {
        setMinTimePassed(true);
      }, 250); // Wait time set to 250ms

      return () => clearTimeout(timer);
    } else {
      setShowLoader(false);
    }
  }, [selectedCompany]);

  // EFFECT 2: Handle the end of loading.
  useEffect(() => {
    if (showLoader && !messagesLoading && minTimePassed) {
      setShowLoader(false);
    }
  }, [showLoader, messagesLoading, minTimePassed]);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!showLoader) {
      scrollToBottom();
    }
  }, [messages, showLoader]);

  return (
    <section className={styles.chatPane}>
      <div className={styles.chatHeader}>
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
              messages.map((m, index) => {
                const isUser = m.sender_type === "USER";
                const initials = getInitials(selectedCompany?.company_name);
                return (
                  <MessageBubble
                    key={m.id}
                    message={m}
                    isUser={isUser}
                    initials={initials}
                    isLastRead={isUser && m.id === lastReadUserMessageId}
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