import React from "react";
import type {Message} from "../../../api/messageApi.ts";
import styles from "../MessengerPage.module.css";

interface MessageBubbleProps {
    message: Message;
    isUser: boolean;
    initials: string;
    isLastRead: boolean;
    style?: React.CSSProperties;
}

function formatDateTime(value?: string | null) {
    if (!value) return "";
    try {
        return new Date(value).toLocaleString();
    } catch {
        return String(value);
    }
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isUser, initials, isLastRead, style }) => {
    const text = message.content ?? message.message ?? "";
    const rowClass = isUser ? `${styles.bubbleRow} ${styles.bubbleRowUser}` : `${styles.bubbleRow} ${styles.bubbleRowCompany}`;
    const bubbleClass = isUser ? `${styles.bubble} ${styles.userBubble}` : `${styles.bubble} ${styles.companyBubble}`;

    return (
        <div className={rowClass} style={style}>
            <div className={bubbleClass}>
                <div>{text}</div>
                <div className={styles.smallMuted}>{formatDateTime(message.created_at)}</div>
                {isUser && isLastRead && (
                    <div className={styles.smallAvatar} title={"Látta a cég"}>
                        {initials}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageBubble;