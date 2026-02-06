import React, { useMemo } from "react";
import type { ChatPartner } from "../context/MessengerContext";
import styles from "../MessengerPage.module.css";

interface ConversationItemProps {
    partner: ChatPartner;
    isActive: boolean;
    onClick: () => void;
    style?: React.CSSProperties;
}

const AVATAR_COLORS = [
    "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)", // Indigo/Purple
    "linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%)", // Blue/Teal
    "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)", // Amber/Red
    "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)", // Emerald/Blue
    "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)", // Pink/Violet
];

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

const ConversationItem: React.FC<ConversationItemProps> = ({ partner, isActive, onClick, style }) => {
    const initials = getInitials(partner.name);
    const itemClass = isActive ? `${styles.partnerItem} ${styles.partnerItemActive}` : styles.partnerItem;

    const avatarStyle = useMemo(() => {
        // Deterministic color based on ID
        const colorIndex = Math.abs(partner.id) % AVATAR_COLORS.length;
        return { background: AVATAR_COLORS[colorIndex] };
    }, [partner.id]);

    return (
        <div className={itemClass} onClick={onClick} style={style}>
            <div className={styles.avatar} style={avatarStyle}>{initials}</div>
            <div style={{ minWidth: 0, flex: 1 }}>
                <div className={styles.partnerName}>{partner.name}</div>
                <div className={styles.smallMuted}>{formatDateTime(partner.last_message_at)}</div>
            </div>
        </div>
    );
};

export default ConversationItem;
