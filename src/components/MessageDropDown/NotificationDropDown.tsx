import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, User, Info, CheckCircle2, RefreshCcw, BellOff } from 'lucide-react';
import styles from './NotificationDropdown.module.css';
import { useAuth } from "../../hooks/useAuth";
import {
    getCompanyMessages,
    getUserMessages,
    readCompanySystemMessage,
    readUserSystemMessage
} from "../../api/messageApi";
import { useNavigate } from 'react-router-dom';

interface Notification {
    id: number;
    title: string;
    description: string;
    isRead: boolean;
    created_at?: string;
    type?: 'update' | 'message' | 'alert';
}

const getNotificationType = (title: string): 'update' | 'message' | 'alert' => {
    const t = title.toLowerCase();
    if (t.includes('frissítés') || t.includes('update') || t.includes('system')) return 'update';
    if (t.includes('üzenet') || t.includes('message') || t.includes('profil')) return 'message';
    return 'alert';
};

const CategoryIcon = ({ type, isRead }: { type: string, isRead: boolean }) => {
    const iconProps = { size: 18, strokeWidth: 2 };
    switch (type) {
        case 'update':
            return (
                <div className={`${styles.iconWrapper} bg-blue-50 text-blue-500`}>
                    <Settings {...iconProps} />
                    {!isRead && <div className={styles.unreadPulse} />}
                </div>
            );
        case 'message':
            return (
                <div className={`${styles.iconWrapper} bg-purple-50 text-purple-500`}>
                    <User {...iconProps} />
                    {!isRead && <div className={styles.unreadPulse} />}
                </div>
            );
        default:
            return (
                <div className={`${styles.iconWrapper} bg-amber-50 text-amber-500`}>
                    <Info {...iconProps} />
                    {!isRead && <div className={styles.unreadPulse} />}
                </div>
            );
    }
};

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
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { userType, loggedIn } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const navigate = useNavigate();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setExpandedId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch notifications
    const fetchMessages = async () => {
        if (!loggedIn) return;

        try {
            let response;
            if (userType === 'company') {
                response = await getCompanyMessages();
            } else if (userType === 'user') {
                response = await getUserMessages();
            }

            const messages = response?.data;

            if (Array.isArray(messages)) {
                const mappedNotifications: Notification[] = messages.map((msg: any) => ({
                    id: msg.id,
                    title: msg.subject || msg.title || 'Rendszerüzenet',
                    description: msg.message || msg.description || msg.content || '',
                    isRead: false,
                    created_at: msg.created_at,
                    type: getNotificationType(msg.subject || msg.title || '')
                }));

                setNotifications(mappedNotifications);
            }
        } catch (error) {
            console.error("Failed to fetch messages", error);
        }
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 60000);
        return () => clearInterval(interval);
    }, [loggedIn, userType]);

    const handleMarkAsRead = async (id: number) => {
        try {
            if (userType === 'company') {
                await readCompanySystemMessage(id);
            } else if (userType === 'user') {
                await readUserSystemMessage(id);
            }

            setNotifications(prev => prev.map(n =>
                n.id === id ? { ...n, isRead: true } : n
            ));
        } catch (error) {
            console.error("Failed to mark message as read", error);
        }
    };

    const handleMarkAllAsRead = async () => {
        const unread = notifications.filter(n => !n.isRead);
        for (const n of unread) {
            await handleMarkAsRead(n.id);
        }
    };

    const handleNotificationClick = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
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

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className={styles.dropdown}
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                        <div className={styles.header}>
                            <span>ÉRTESÍTÉSEK</span>
                            {notifications.length > 0 && (
                                <button className={styles.markReadBtn} onClick={handleMarkAllAsRead}>
                                    Összes olvasott
                                </button>
                            )}
                        </div>

                        <div className={styles.list}>
                            {notifications.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <BellOff size={48} className={styles.emptyIcon} />
                                    <span className={styles.emptyText}>Minden elolvasva!</span>
                                </div>
                            ) : (
                                notifications.map((notif, index) => (
                                    <motion.div
                                        key={notif.id}
                                        className={styles.item}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => handleNotificationClick(notif.id)}
                                    >
                                        <CategoryIcon type={notif.type || 'alert'} isRead={notif.isRead} />
                                        
                                        <div className={styles.itemContent}>
                                            <div className={styles.itemHeader}>
                                                <h4 className={styles.itemTitle}>{notif.title}</h4>
                                                <span className={styles.itemDate}>{formatRelativeTime(notif.created_at)}</span>
                                            </div>
                                            
                                            <p className={styles.itemDescription}>
                                                {expandedId === notif.id 
                                                    ? notif.description 
                                                    : (notif.description.length > 60 
                                                        ? `${notif.description.substring(0, 60)}...` 
                                                        : notif.description)}
                                            </p>

                                            <AnimatePresence>
                                                {expandedId === notif.id && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className={styles.detailsSection}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <div className={styles.actions}>
                                                            {notif.type === 'update' && (
                                                                <button 
                                                                    className={`${styles.actionBtn} ${styles.primaryAction}`}
                                                                    onClick={() => window.location.reload()}
                                                                >
                                                                    <RefreshCcw size={14} style={{ display: 'inline', marginRight: 4 }} />
                                                                    Oldal frissítése
                                                                </button>
                                                            )}
                                                            {notif.type === 'message' && (
                                                                <button 
                                                                    className={`${styles.actionBtn} ${styles.secondaryAction}`}
                                                                    onClick={() => navigate('/profile')}
                                                                >
                                                                    Profil megtekintése
                                                                </button>
                                                            )}
                                                            {!notif.isRead && (
                                                                <button 
                                                                    className={`${styles.actionBtn} ${styles.secondaryAction}`}
                                                                    onClick={() => handleMarkAsRead(notif.id)}
                                                                >
                                                                    <CheckCircle2 size={14} style={{ display: 'inline', marginRight: 4 }} />
                                                                    Megjelölés olvasottként
                                                                </button>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationDropdown;