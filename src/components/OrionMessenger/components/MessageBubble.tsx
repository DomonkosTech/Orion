import React from "react";
import type {Message} from "../../../api/messageApi.ts";
import styles from "../MessengerPage.module.css";
import { useTranslation } from "react-i18next";
import { CheckCheck } from "lucide-react";

interface MessageBubbleProps {
    message: Message;
    isMyMessage: boolean;
    initials: string;
    isLastRead: boolean;
    style?: React.CSSProperties;
}

function formatDateTime(value?: string | null) {
    if (!value) return "";
    try {
        const date = new Date(value);
        return date.toLocaleString('hu-HU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    } catch {
        return String(value);
    }
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isMyMessage, initials, isLastRead, style }) => {
    const { t } = useTranslation('components');
    const text = message.content ?? message.message ?? "";
    const rowClass = isMyMessage ? `${styles.bubbleRow} ${styles.bubbleRowUser}` : `${styles.bubbleRow} ${styles.bubbleRowCompany}`;
    const bubbleClass = isMyMessage ? `${styles.bubble} ${styles.userBubble}` : `${styles.bubble} ${styles.companyBubble}`;

    return (
        <div className={rowClass} style={style}>
            <div className={bubbleClass}>
                <div style={{ wordBreak: 'break-word' }}>{text}</div>
                <div className={styles.messageFooter}>
                    <div className={styles.smallMuted}>{formatDateTime(message.created_at)}</div>
                    {isMyMessage && isLastRead && (
                        <CheckCheck size={14} className={styles.seenIcon} title={t('messageBubble.seenByCompany')} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;