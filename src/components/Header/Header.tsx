import React from "react";
import styles from "./Header.module.css";

// Components
import Button from "../Button/Button";

// Server / hooks
import { useLogout } from "../../services/authService";

interface NavItem {
    label: string;
    href: string;
}

interface HeaderProps {
    companyName?: string;
    userInitials?: string;
    logoColor?: string;
    navItems?: NavItem[];
    actions?: React.ReactNode;
}

export function Header({
                           companyName = "Orion",
                           userInitials = "KYS",
                           logoColor = "#1a1a1a",
                           navItems = [
                               { label: "Dashboard", href: "/dashboard" },
                               { label: "Projects", href: "/projects" },
                               { label: "Team", href: "/team" },
                           ],
                           actions,
                       }: HeaderProps) {
    const handleLogout = useLogout();

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                {/* Left: Logo / Brand */}
                <a href="/" className={styles.logo}>
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
                    {navItems.map((item) => (
                        <a
                            key={item.href}
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
                    >
                        <span
                            style={{
                                fontSize: "0.85rem",
                                fontWeight: 600,
                            }}
                        >
                            {userInitials}
                        </span>
                    </button>

                    {actions}

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
}
