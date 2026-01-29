import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./ProfileDropdown.module.css";

interface ProfileDropdownProps {
    loggedIn: boolean;
    userType: string | null;
    handleLogout: () => void;
    name?: string;
    initials?: string;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
                                                             loggedIn,
                                                             userType,
                                                             handleLogout,
                                                             name,
                                                             initials
                                                         }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Helper to determine what text to show in the expanded label
    const getLabelText = () => {
        if (!loggedIn) return "Vendég";
        return name || (userType === "company" ? "Céges Fiók" : "Felhasználó");
    };

    return (
        <div className={styles.wrapper} ref={dropdownRef}>
            <button
                className={`${styles.trigger} ${isOpen ? styles.expanded : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-label="Profile Menu"
            >
                <span className={styles.initialsText}>
                    {loggedIn ? initials : "?"}
                </span>
                <span className={styles.triggerLabel}>
                    {getLabelText()}
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
                        <div className={styles.dropdownHeader}>
                            {loggedIn ? (userType === "user" ? `Szia, ${name || "Felhasználó"}!` : "Céges Fiók") : "Vendég"}
                        </div>

                        {loggedIn ? (
                            <>
                                <a href="/EditUserProfile" className={styles.item}>
                                    <div>
                                        <span className={styles.itemTitle}>Profilom</span>
                                        <span className={styles.itemDescription}>Személyes adatok kezelése</span>
                                    </div>
                                </a>
                                <button onClick={handleLogout} className={`${styles.item} ${styles.logoutAction}`}>
                                    <div>
                                        <span className={styles.itemTitle}>Kijelentkezés</span>
                                        <span className={styles.itemDescription}>Viszlát legközelebb!</span>
                                    </div>
                                </button>
                            </>
                        ) : (
                            <a href="/UserLoginPage" className={styles.item}>
                                <div>
                                    <span className={styles.itemTitle}>Bejelentkezés</span>
                                    <span className={styles.itemDescription}>Lépjen be a fiókjába</span>
                                </div>
                            </a>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProfileDropdown;
