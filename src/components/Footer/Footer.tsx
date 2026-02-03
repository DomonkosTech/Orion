import { Link } from 'react-router-dom';
import styles from './Footer.module.css';
import { useTranslation } from 'react-i18next';

const Footer = () => {
    const { t } = useTranslation('components');
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles.footerInner}>
                {/* Brand Section */}
                <div className={styles.footerCol}>
                    <div className={styles.footerBrand}>Orion</div>
                    <div className={styles.footerMuted}>{t('footer.motto')}</div>
                </div>

                {/* Navigation Links */}
                <div className={styles.footerCol}>
                    <div className={styles.footerTitle}>{t('footer.quickLinks')}</div>
                    <Link to="/listjobs" className={styles.footerLink}>{t('footer.jobs')}</Link>
                    <Link to="/jobapplication" className={styles.footerLink}>{t('footer.applications')}</Link>
                    <Link to="/UserEditProfile" className={styles.footerLink}>{t('footer.profile')}</Link>
                </div>

                {/* Contact Section */}
                <div className={styles.footerCol}>
                    <div className={styles.footerTitle}>{t('footer.contact')}</div>
                    <a className={styles.footerLink} href="mailto:info@orion.hu">
                        info@orion.hu
                    </a>
                    <div className={styles.footerMuted}>+36 1 234 5678</div>
                </div>
            </div>

            <div className={styles.footerBottom}>
                {t('footer.copyright', { year: currentYear })}
            </div>
        </footer>
    );
};

export default Footer;