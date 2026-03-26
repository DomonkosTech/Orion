import React from "react";
import styles from "./Header.module.css";
import { useTranslation } from "react-i18next";

// Components
import NotificationDropdown from "../MessageDropDown/NotificationDropDown.tsx";
import ProfileDropdown from "../ProfileDropdown/ProfileDropdown.tsx";
import LanguageSelector from "../LanguageSelector/LanguageSelector.tsx";

// Server / hooks
import { useLogout } from "../../../Api/authApi.ts";
import { useAuth } from "../../../hooks/useAuth";

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
    const { t } = useTranslation('components');
    const handleLogout = useLogout();
    const { loggedIn, userType, loading, initials, name } = useAuth();

    if (loading) return null;

    let dynamicNavItems = navItems;

    if (loggedIn) {
        if (userType === "user" && dynamicNavItems.length === 0) {
            dynamicNavItems = [
                { label: t('header.home'), href: "/userhomepage" },
                { label: t('header.jobs'), href: "/listjobs" },
                { label: t('header.myApplications'), href: "/JobApplications" },
            ];
        } else if (userType === "company" && dynamicNavItems.length === 0) {
            dynamicNavItems = [
                { label: t('header.dashboard'), href: "/company" },
                { label: t('header.postJob'), href: "/AddJob" },
                { label: t('header.employees'), href: "/employees" },
            ];
        }
    } else if (dynamicNavItems.length === 0) {
        dynamicNavItems = [
            {label: t('header.home'), href: "/" },
            {label: t('header.login'), href: "/UserLoginPage"},
            {label: t('header.forCompanies'), href: "/CompanyLoginPage"}

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
                    {actions}
                    <LanguageSelector />
                    <NotificationDropdown />
                    <ProfileDropdown
                        loggedIn={loggedIn}
                        userType={userType}
                        handleLogout={handleLogout}
                        name={name}
                        initials={initials}
                    />
                </div>
            </div>
        </header>
    );
}