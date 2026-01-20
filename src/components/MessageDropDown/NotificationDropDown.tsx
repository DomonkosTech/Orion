import React, { useState, useEffect, useRef } from 'react';
import styles from './NotificationDropdown.module.css';
import { useAuth } from "../../hooks/useAuth";
import {
    getCompanyMessages,
    getUserMessages,
    readCompanySystemMessage,
    readUserSystemMessage
} from "../../api/messageApi";

interface Notification {
    id: number;
    title: string;
    description: string;
    isRead: boolean;
    created_at?: string;
}

const formatRelativeTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diff / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) return `${diffSeconds}s`;
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 31) return `${diffDays}d`;
    return date.toLocaleDateString('hu-HU', { year: '2-digit', month: 'short', day: 'numeric' });
};

const NotificationDropdown: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { userType, loggedIn } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch notifications
    useEffect(() => {
        const fetchMessages = async () => {
            if (!loggedIn) return;

            try {
                let response;
                if (userType === 'company') {
                    response = await getCompanyMessages();
                } else if (userType === 'user') {
                    response = await getUserMessages();
                }

                // Backend returns { success: true, data: [...] }
                const messages = response?.data;

                if (Array.isArray(messages)) {
                    // Map API response to Notification structure
                    const mappedNotifications: Notification[] = messages.map((msg: any) => ({
                        id: msg.id,
                        title: msg.subject || msg.title || 'Rendszerüzenet',
                        description: msg.message || msg.description || msg.content || '',
                        isRead: false, // Backend returns only unread messages
                        created_at: msg.created_at
                    }));

                    setNotifications(mappedNotifications);
                }
            } catch (error) {
                console.error("Failed to fetch messages", error);
            }
        };

        fetchMessages();

        // Poll for new messages every minute
        const interval = setInterval(fetchMessages, 60000);
        return () => clearInterval(interval);
    }, [loggedIn, userType]);

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.isRead) {
            try {
                if (userType === 'company') {
                    await readCompanySystemMessage(notification.id);
                } else if (userType === 'user') {
                    await readUserSystemMessage(notification.id);
                }

                // Update local state
                setNotifications(prev => prev.map(n =>
                    n.id === notification.id ? { ...n, isRead: true } : n
                ));
            } catch (error) {
                console.error("Failed to mark message as read", error);
            }
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    if (!loggedIn) return null;

    return (
        <div className={styles.wrapper} ref={dropdownRef}>
            <button
                className={styles.trigger}
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                <div className={styles.iconContainer}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    {unreadCount > 0 && <span className={styles.badgeDot} />}
                </div>
                <span className={styles.triggerLabel}>
                    {unreadCount > 0 ? `${unreadCount} új üzenet` : 'Üzenetek'}
                </span>
                <span className={styles.arrow}>{isOpen ? '▲' : '▼'}</span>
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.header}>
                        <span>ÉRTESÍTÉSEK</span>
                    </div>

                    <div className={styles.list}>
                        {notifications.length === 0 ? (
                            <div className={styles.item}>
                                <div className={styles.itemContent}>
                                    <div className={styles.itemDescription}>Nincs új értesítés.</div>
                                </div>
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    className={styles.item}
                                    onClick={() => handleNotificationClick(notif)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className={`${styles.statusIndicator} ${notif.isRead ? styles.read : styles.unread}`} />
                                    <div className={styles.itemContent}>
                                        <div className={styles.itemHeader}>
                                            <strong className={styles.itemTitle}>{notif.title}</strong>
                                            <span className={styles.itemDate}>{formatRelativeTime(notif.created_at)}</span>
                                        </div>
                                        <div className={styles.itemDescription}>
                                            {notif.description.length > 150
                                                ? `${notif.description.substring(0, 150)}...`
                                                : notif.description}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;