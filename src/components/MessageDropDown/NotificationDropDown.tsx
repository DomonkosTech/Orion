import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, User, Info, CheckCircle2, RefreshCcw, BellOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import styles from './NotificationDropdown.module.css';
import { useAuth } from "../../hooks/useAuth";
import {
    getCompanyMessages,
    getUserMessages,
    readCompanySystemMessage,
    readUserSystemMessage
} from "../../Api/systemmessageApi.ts";
import { useNavigate } from 'react-router-dom';

interface SystemNotification {
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

const formatRelativeTime = (dateString?: string, language: string = 'hu') => {
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
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString(language, { month: 'short', day: 'numeric' });
};

const NotificationDropdown: React.FC = () => {
    const { t, i18n } = useTranslation('components');
    const [isOpen, setIsOpen] = useState(false);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { userType, loggedIn } = useAuth();
    const [notifications, setNotifications] = useState<SystemNotification[]>([]);
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
                const mappedNotifications: SystemNotification[] = messages.map((msg: { 
                    id: number; 
                    subject?: string; 
                    title?: string; 
                    message?: string; 
                    description?: string; 
                    content?: string; 
                    created_at?: string; 
                }) => ({
                    id: msg.id,
                    title: msg.subject || msg.title || t('notificationDropdown.systemMessage'),
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

            // Immediately remove the notification from the list with animation
            setNotifications(prev => prev.filter(n => n.id !== id));
            
            // If the removed notification was expanded, collapse it
            if (expandedId === id) {
                setExpandedId(null);
            }
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
        setIsAnimating(true);
        setExpandedId(expandedId === id ? null : id);
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    if (!loggedIn) return null;

    return (
        <div className={styles.wrapper} ref={dropdownRef}>
            <button
                className={`${styles.trigger} ${isOpen ? styles.expanded : ''}`}
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
                    {unreadCount > 0 
                        ? t('notificationDropdown.newMessage', { count: unreadCount }) 
                        : t('notificationDropdown.messages')}
                </span>
                <span className={styles.arrow}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease' }}>
                        <path d="m6 9 6 6 6-6"/>
                    </svg>
                </span>
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
                            <span>{t('notificationDropdown.title')}</span>
                            {notifications.length > 0 && (
                                <button className={styles.markReadBtn} onClick={handleMarkAllAsRead}>
                                    {t('notificationDropdown.markAllRead')}
                                </button>
                            )}
                        </div>

                        <div className={`${styles.list} ${isAnimating ? styles.animating : ''}`}>
                            <AnimatePresence initial={false}>
                                {notifications.length === 0 ? (
                                    <motion.div 
                                        key="empty"
                                        className={styles.emptyState}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <BellOff size={48} className={styles.emptyIcon} />
                                        <span className={styles.emptyText}>{t('notificationDropdown.allRead')}</span>
                                    </motion.div>
                                ) : (
                                    notifications.map((notif) => (
                                        <motion.div
                                            key={notif.id}
                                            className={styles.item}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.15 }}
                                            onClick={() => handleNotificationClick(notif.id)}
                                        >
                                            <CategoryIcon type={notif.type || 'alert'} isRead={notif.isRead} />
                                            
                                            <div className={styles.itemContent}>
                                                <div className={styles.itemHeader}>
                                                    <h4 className={styles.itemTitle}>{notif.title}</h4>
                                                    <span className={styles.itemDate}>{formatRelativeTime(notif.created_at, i18n.language)}</span>
                                                </div>
                                                
                                                <p className={styles.itemDescription}>
                                                    {expandedId === notif.id 
                                                        ? notif.description 
                                                        : (notif.description.length > 50 
                                                            ? `${notif.description.substring(0, 50)}...` 
                                                            : notif.description)}
                                                </p>

                                                <AnimatePresence>
                                                    {expandedId === notif.id && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                            onAnimationStart={() => setIsAnimating(true)}
                                                            onAnimationComplete={() => setIsAnimating(false)}
                                                            className={styles.detailsSection}
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <div className={styles.actions}>
                                                                {notif.type === 'update' && (
                                                                    <button 
                                                                        className={`${styles.actionBtn} ${styles.primaryAction}`}
                                                                        onClick={() => window.location.reload()}
                                                                    >
                                                                        <RefreshCcw size={14} style={{ marginRight: 6 }} />
                                                                        {t('notificationDropdown.refreshPage')}
                                                                    </button>
                                                                )}
                                                                {notif.type === 'message' && (
                                                                    <button 
                                                                        className={`${styles.actionBtn} ${styles.secondaryAction}`}
                                                                        onClick={() => navigate('/profile')}
                                                                    >
                                                                        {t('notificationDropdown.viewProfile')}
                                                                    </button>
                                                                )}
                                                                {!notif.isRead && (
                                                                    <button 
                                                                        className={`${styles.actionBtn} ${styles.secondaryAction}`}
                                                                        onClick={() => handleMarkAsRead(notif.id)}
                                                                    >
                                                                        <CheckCircle2 size={14} style={{ marginRight: 6 }} />
                                                                        {t('notificationDropdown.markRead')}
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
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationDropdown;