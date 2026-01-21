import React, { useState, useRef, useEffect } from "react";
import styles from "./Header.module.css";

// Components
import NotificationDropdown from "../MessageDropDown/NotificationDropDown.tsx";
import ProfileDropdown from "../ProfileDropdown/ProfileDropdown.tsx";

// Server / hooks
import { useLogout } from "../../api/authApi.ts";
import { useAuth } from "../../hooks/useAuth";

interface NavItem {
    label: string;
    href: string;
}

interface HeaderProps {
    companyName?: string;
    logoColor?: string;
    navItems?: NavItem[];
    actions?: React.ReactNode;
}

export function Header({
                           companyName = "Orion",
                           logoColor = "#1a1a1a",
                           navItems = [],
                           actions,
                       }: HeaderProps) {
    const handleLogout = useLogout();
    const { loggedIn, userType, loading, initials, name } = useAuth();

    // Dropdown state logic
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (loading) return null;

    let dynamicNavItems = navItems;

    if (loggedIn) {
        if (userType === "user" && dynamicNavItems.length === 0) {
            dynamicNavItems = [
                { label: "Kezdőlap", href: "/userhomepage" },
                { label: "Állások", href: "/listjobs" },
                { label: "Jelentkezéseim", href: "/JobApplications" },
            ];
        } else if (userType === "company" && dynamicNavItems.length === 0) {
            dynamicNavItems = [
                { label: "Vezérlőpult", href: "/company" },
                { label: "Hirdetés feladása", href: "/AddJob" },
                { label: "Alkalmazottak", href: "/employees" },
            ];
        }
    } else if (dynamicNavItems.length === 0) {
        dynamicNavItems = [
            {label: "Kezdőlap", href: "/" },
            {label: "Bejelentkezés", href: "/UserLoginPage"},
            {label: "Cégeknek", href: "/CompanyLoginPage"}

        ];
    }

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                {/* Left: Logo */}
                <a href={loggedIn ? (userType === "company" ? "/company" : "/userhomepage") : "/"} className={styles.logo}>
                    <div className={styles.logoBox} style={{ background: logoColor }}>
                        <div className={styles.logoInner} />
                    </div>
                    {companyName}
                </a>

                {/* Center: Navigation */}
                <nav className={styles.nav}>
                    {dynamicNavItems.map((item, index) => (
                        <a key={`${item.href}-${index}`} href={item.href} className={styles.navLink}>
                            {item.label}
                        </a>
                    ))}
                </nav>

                {/* Right: Actions */}
                <div className={styles.actions}>
                    <NotificationDropdown />

                    <div className={styles.profileWrapper} ref={menuRef}>
                        <button
                            className={styles.iconButton}
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label="Profile Menu"
                        >
                            <span className={styles.initialsText}>
                                {loggedIn ? initials : "?"}
                            </span>
                            <span className={styles.arrow}>▼</span>
                        </button>

                        {isMenuOpen && (
                            <ProfileDropdown
                                loggedIn={loggedIn}
                                userType={userType}
                                handleLogout={handleLogout}
                                name={name}
                            />
                        )}
                    </div>
                    {actions}
                </div>
            </div>
        </header>
    );
}