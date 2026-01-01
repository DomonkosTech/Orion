import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles.footerInner}>
                {/* Brand Section */}
                <div className={styles.footerCol}>
                    <div className={styles.footerBrand}>Orion</div>
                    <div className={styles.footerMuted}>Letisztult karrierportál élmény.</div>
                </div>

                {/* Navigation Links */}
                <div className={styles.footerCol}>
                    <div className={styles.footerTitle}>Gyors linkek</div>
                    <Link to="/listjobs" className={styles.footerLink}>Állások</Link>
                    <Link to="/jobapplication" className={styles.footerLink}>Jelentkezések</Link>
                    <Link to="/EditUserProfile" className={styles.footerLink}>Profil</Link>
                </div>

                {/* Contact Section */}
                <div className={styles.footerCol}>
                    <div className={styles.footerTitle}>Kapcsolat</div>
                    <a className={styles.footerLink} href="mailto:info@orion.hu">
                        info@orion.hu
                    </a>
                    <div className={styles.footerMuted}>+36 1 234 5678</div>
                </div>
            </div>

            <div className={styles.footerBottom}>
                © {currentYear} Orion. Minden jog fenntartva.
            </div>
        </footer>
    );
};

export default Footer;