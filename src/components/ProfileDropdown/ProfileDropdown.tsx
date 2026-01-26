import React from "react";
import styles from "./ProfileDropdown.module.css";

interface ProfileDropdownProps {
    loggedIn: boolean;
    userType: string | null;
    handleLogout: () => void;
    name?: string;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ loggedIn, userType, handleLogout, name }) => {
    return (
        <div className={styles.dropdown}>
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
        </div>
    );
};

export default ProfileDropdown;
