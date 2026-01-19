import React, { useState, useEffect, useRef } from 'react';
import styles from './NotificationDropdown.module.css';

interface Notification {
    id: number;
    title: string;
    description: string;
    isRead: boolean;
}

const NotificationDropdown: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const notifications: Notification[] = [
        { id: 1, title: 'System update scheduled', description: 'Friday at 11:00 PM', isRead: false },
        { id: 2, title: 'New security policy', description: 'Uploaded to the portal', isRead: false },
        { id: 3, title: 'Financial review', description: 'Available for download', isRead: true },
    ];

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
                    {!notifications.every(n => n.isRead) && <span className={styles.badgeDot} />}
                </div>
                <span className={styles.triggerLabel}>System Alert: Update Friday</span>
                <span className={styles.arrow}>{isOpen ? '▲' : '▼'}</span>
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.header}>
                        <span>NOTIFICATIONS</span>
                        <button className={styles.markReadBtn}>Mark all as read</button>
                    </div>

                    <div className={styles.list}>
                        {notifications.map((notif) => (
                            <div key={notif.id} className={styles.item}>
                                <div className={`${styles.statusIndicator} ${notif.isRead ? styles.read : styles.unread}`} />
                                <div className={styles.itemContent}>
                                    <strong className={styles.itemTitle}>{notif.title}</strong>
                                    <div className={styles.itemDescription}>{notif.description}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <a href="/logs" className={styles.viewAll}>View All System Logs</a>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;