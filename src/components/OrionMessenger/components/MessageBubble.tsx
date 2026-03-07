import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type {Message} from "../../../Api/messageApi.ts";
import styles from "../MessengerPage.module.css";
import { CheckCheck } from "lucide-react";

interface MessageBubbleProps {
    message: Message;
    isMyMessage: boolean;
    initials: string;
    isLastRead: boolean;
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

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isMyMessage, isLastRead }) => {
    const text = message.content ?? message.message ?? "";
    const rowClass = isMyMessage ? `${styles.bubbleRow} ${styles.bubbleRowUser}` : `${styles.bubbleRow} ${styles.bubbleRowCompany}`;
    const bubbleClass = isMyMessage ? `${styles.bubble} ${styles.userBubble}` : `${styles.bubble} ${styles.companyBubble}`;

    // Calculate dynamic width to maintain approx 75:25 aspect ratio
    const estimatedLength = text.length;
    const dynamicWidth = Math.ceil(30 * Math.sqrt(estimatedLength));

    return (
        <motion.div 
            layout
            initial={{ 
                opacity: 0, 
                y: 20, 
                scale: 0.8,
                rotate: isMyMessage ? 2 : -2
            }}
            animate={{ 
                opacity: 1, 
                y: 0, 
                scale: 1,
                rotate: 0
            }}
            transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 25,
                mass: 0.8,
                opacity: { duration: 0.2 }
            }}
            className={rowClass}
        >
            <motion.div 
                className={bubbleClass} 
                style={{ width: `${dynamicWidth}px` }}
                whileHover={{ 
                    scale: 1.02,
                    transition: { type: "spring", stiffness: 400, damping: 10 }
                }}
                whileTap={{ scale: 0.98 }}
            >
                <div style={{ wordBreak: 'break-word' }}>{text}</div>
                <div className={styles.messageFooter}>
                    <div className={styles.smallMuted}>{formatDateTime(message.created_at)}</div>
                    <AnimatePresence>
                        {isMyMessage && isLastRead && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0, x: 5 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0 }}
                                transition={{ type: "spring", stiffness: 500, damping: 20 }}
                            >
                                <CheckCheck size={14} className={styles.seenIcon}  />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default MessageBubble;