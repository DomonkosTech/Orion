import React from "react";
import type {CompanyChatPartner} from "../../../api/messageApi.ts";
import styles from "../MessengerPage.module.css";

interface ConversationItemProps {
    partner: CompanyChatPartner;
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
        return new Date(value).toLocaleString();
    } catch {
        return String(value);
    }
}

const ConversationItem: React.FC<ConversationItemProps> = ({ partner, isActive, onClick, style }) => {
    const initials = getInitials(partner.company_name);
    const itemClass = isActive ? `${styles.partnerItem} ${styles.partnerItemActive}` : styles.partnerItem;

    return (
        <div className={itemClass} onClick={onClick} style={style}>
            <div className={styles.avatar}>{initials}</div>
            <div style={{ minWidth: 0, flex: 1 }}>
                <div className={styles.partnerName}>{partner.company_name}</div>
                <div className={styles.smallMuted}>{formatDateTime(partner.last_message_at)}</div>
            </div>
        </div>
    );
};

export default ConversationItem;