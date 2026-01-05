import React from "react";
import styles from "./Header.module.css";

// Components
import Button from "../Button/Button";

// Server / hooks
import { useLogout } from "../../services/authService";
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

/**
 * Responsive header component that manages navigation and user actions based on authentication state.
 * Dynamically renders menu items for guests, users, and companies.
 */
export function Header({
                           companyName = "Orion",
                           logoColor = "#1a1a1a",
                           navItems = [],
                           actions,
                       }: HeaderProps) {
    const handleLogout = useLogout();
    const { loggedIn, userType, loading, initials } = useAuth();

    // Show nothing or a loader while auth status is loading
    if (loading) {
        return null; // Or <header className={styles.header}>Loading...</header>
    }

    // Determine navigation items based on user type
    let dynamicNavItems = navItems;

    if (loggedIn) {
        if (userType === "user") {
            // Override navItems with user-specific links if props are empty
            if (dynamicNavItems.length === 0) {
                dynamicNavItems = [
                    { label: "Kezdőlap", href: "/userhomepage" },
                    { label: "Állások", href: "/listjobs" },
                    { label: "Jelentkezéseim", href: "/JobApplications" },
                ];
            }
        } else if (userType === "company") {
            if (dynamicNavItems.length === 0) {
                dynamicNavItems = [
                    { label: "Vezérlőpult", href: "/company" },
                    { label: "Hirdetés feladása", href: "/AddJob" },
                    { label: "Alkalmazottak", href: "/employees" },
                ];
            }
        }
    } else {
        // Default menu for guests
        if (dynamicNavItems.length === 0) {
            dynamicNavItems = [
                { label: "Kezdőlap", href: "/" },
                { label: "Bejelentkezés", href: "/UserLoginPage" },
                { label: "Cégeknek", href: "/CompanyLoginPage" },
            ];
        }
    }

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                {/* Left: Logo / Brand */}
                <a href={loggedIn ? (userType === "company" ? "/company" : "/userhomepage") : "/"} className={styles.logo}>
                    <div
                        style={{
                            width: 20,
                            height: 20,
                            background: logoColor,
                            borderRadius: 4,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <div
                            style={{
                                width: 8,
                                height: 8,
                                background: "#ffffff",
                                borderRadius: 2,
                            }}
                        />
                    </div>

                    {companyName}
                </a>

                {/* Center: Navigation */}
                <nav className={styles.nav}>
                    {dynamicNavItems.map((item, index) => (
                        <a
                            key={`${item.href}-${index}`}
                            href={item.href}
                            className={styles.navLink}
                        >
                            {item.label}
                        </a>
                    ))}
                </nav>

                {/* Right: Actions */}
                <div className={styles.actions}>
                    {loggedIn && (
                        <button
                            className={styles.iconButton}
                            aria-label="User Profile"
                            title={userType === "user" ? "Felhasználó" : "Cég"}
                        >
                            <span

                                style={{
                                    fontSize: "0.85rem",
                                    fontWeight: 600,
                                }}
                            >
                                {initials}
                            </span>
                        </button>
                    )}

                    {actions}

                    {loggedIn && (
                        <Button
                            className={styles.logoutButton}
                            onClick={handleLogout}
                        >
                            Log out
                        </Button>
                    )}
                    {!loggedIn && (
                         <a href="/UserLoginPage" style={{ textDecoration: 'none' }}>
                            <Button className={styles.logoutButton}>
                                Log in
                            </Button>
                        </a>
                    )}
                </div>
            </div>
        </header>
    );
}
