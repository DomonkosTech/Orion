import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ChatPartner } from "../context/MessengerContextInstance";
import { AVATAR_COLORS } from "../context/MessengerContextInstance";
import styles from "../MessengerPage.module.css";

interface ConversationItemProps {
    partner: ChatPartner;
    isActive: boolean;
    onClick: () => void;
    style?: React.CSSProperties;
}

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

const ConversationItem: React.FC<ConversationItemProps> = ({ partner, isActive, onClick }) => {
    const initials = getInitials(partner.name);
    const itemClass = isActive ? `${styles.partnerItem} ${styles.partnerItemActive}` : styles.partnerItem;

    const avatarStyle = useMemo(() => {
        // Deterministic color based on ID
        const colorIndex = Math.abs(partner.id) % AVATAR_COLORS.length;
        return { 
            background: AVATAR_COLORS[colorIndex],
            borderRadius: "18px" 
        };
    }, [partner.id]);

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, x: -10, filter: "blur(5px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            whileHover={{ 
                x: 4,
                backgroundColor: "rgba(241, 245, 249, 0.8)",
                transition: { type: "spring", stiffness: 400, damping: 25 }
            }}
            whileTap={{ scale: 0.97 }}
            transition={{
                type: "spring",
                stiffness: 260,
                damping: 20
            }}
            className={itemClass} 
            onClick={onClick}
        >
            <motion.div 
                layoutId={`avatar-list-${partner.id}`}
                className={styles.avatar} 
                style={avatarStyle}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30
                }}
            >
                {initials}
            </motion.div>
            <div style={{ minWidth: 0, flex: 1 }}>
                <motion.div layout className={styles.partnerName}>{partner.name}</motion.div>
                <motion.div layout className={styles.smallMuted}>{formatDateTime(partner.last_message_at)}</motion.div>
            </div>
            <AnimatePresence>
                {isActive && (
                    <motion.div 
                        layoutId="active-indicator"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30
                        }}
                        style={{ 
                            width: 6, 
                            height: 6, 
                            backgroundColor: "#6366f1", 
                            borderRadius: "50%",
                            marginLeft: 8,
                            boxShadow: "0 0 8px rgba(99, 102, 241, 0.5)"
                        }} 
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ConversationItem;