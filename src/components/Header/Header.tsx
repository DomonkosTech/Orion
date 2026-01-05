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

export function Header({
                           companyName = "Orion",
                           logoColor = "#1a1a1a",
                           navItems = [],
                           actions,
                       }: HeaderProps) {
    const handleLogout = useLogout();
    const { loggedIn, userType, loading } = useAuth();

    // Ha még töltődik az auth status, nem jelenítünk meg semmit, vagy egy loadert
    if (loading) {
        return null; // Vagy <header className={styles.header}>Loading...</header>
    }

    // Dinamikus tartalom a userType alapján
    let displayInitials = "V"; // Alapértelmezett: Vendég
    let dynamicNavItems = navItems;

    if (loggedIn) {
        if (userType === "user") {
            displayInitials = "U";
            // Itt felülírhatjuk a navItems-et user specifikus linkekkel, ha a props üres
            if (dynamicNavItems.length === 0) {
                dynamicNavItems = [
                    { label: "Kezdőlap", href: "/userhomepage" },
                    { label: "Állások", href: "/listjobs" },
                    { label: "Jelentkezéseim", href: "/JobApplications" },
                ];
            }
        } else if (userType === "company") {
            displayInitials = "C";
            if (dynamicNavItems.length === 0) {
                dynamicNavItems = [
                    { label: "Vezérlőpult", href: "/company" },
                    { label: "Hirdetés feladása", href: "/AddJob" },
                    { label: "Alkalmazottak", href: "/employees" },
                ];
            }
        }
    } else {
        // Vendég menü
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
                    <button
                        className={styles.iconButton}
                        aria-label="User Profile"
                        title={loggedIn ? (userType === "user" ? "Felhasználó" : "Cég") : "Vendég"}
                    >
                        <span
                            style={{
                                fontSize: "0.85rem",
                                fontWeight: 600,
                            }}
                        >
                            {displayInitials}
                        </span>
                    </button>

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
