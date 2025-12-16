import React from 'react';
import styles from './Header.module.css';

//Components
import Button from "../Buttons/Button";

//server components
import { useLogout } from "../../services/BazdmegPetiNincsGlobálisLogoutTeCsicskaCsináljEggyet";


interface HeaderProps {
    companyName?: string;
    userInitials?: string;
}

export const Header: React.FC<HeaderProps> = ({
                                                  companyName = "Orion",
                                                  userInitials = "SD",
                                              }) => {
    const handleLogout = useLogout();

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                {/* Left: Logo/Brand */}
                <a href="/" className={styles.logo}>
                    {/* Simple colored square to act as logo icon */}
                    <div style={{ width: 20, height: 20, background: '#1a1a1a', borderRadius: 4 }} />
                    {companyName}
                </a>

                {/* Center: Navigation */}
                <nav className={styles.nav}>
                    <a href="/dashboard" className={styles.navLink}>Dashboard</a>
                    <a href="/projects" className={styles.navLink}>Projects</a>
                    <a href="/team" className={styles.navLink}>Team</a>
                    <a href="/reports" className={styles.navLink}>Reports</a>
                </nav>

                {/* Right: User Actions */}
                <div className={styles.actions}>
                    <button
                        className={styles.iconButton}
                        aria-label="User Profile"
                    >
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{userInitials}</span>
                    </button>

                    <Button
                        className={styles.logoutButton}
                        onClick={handleLogout}
                    >
                        Log out
                    </Button>
                </div>
            </div>
        </header>
    );
};
