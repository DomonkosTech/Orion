import { Link } from 'react-router-dom';
import styles from './Footer.module.css';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../hooks/useAuth';

const Footer = () => {
    const { t } = useTranslation('components');
    const { userType, loggedIn } = useAuth();
    const currentYear = new Date().getFullYear();

    const getHomeLink = () => {
        if (!loggedIn) return '/';
        return userType === 'company' ? '/company' : '/userhomepage';
    };

    return (
        <footer className={styles.footer}>
            <div className={styles.footerInner}>
                {/* Brand Section */}
                <div className={styles.footerCol}>
                    <Link to={getHomeLink()} className={styles.footerBrandLink}>
                        <div className={styles.footerBrand}>Orion</div>
                    </Link>
                    <div className={styles.footerMuted}>{t('footer.motto')}</div>
                </div>

                {/* Navigation Links */}
                <div className={styles.footerCol}>
                    <div className={styles.footerTitle}>{t('footer.quickLinks')}</div>
                    
                    {!loggedIn && (
                        <>
                            <Link to="/UserLoginPage" className={styles.footerLink}>{t('footer.login')}</Link>
                            <Link to="/UserRegisterPage" className={styles.footerLink}>{t('footer.register')}</Link>
                        </>
                    )}

                    {loggedIn && userType === 'user' && (
                        <>
                            <Link to="/listjobs" className={styles.footerLink}>{t('footer.jobs')}</Link>
                            <Link to="/JobApplications" className={styles.footerLink}>{t('footer.applications')}</Link>
                            <Link to="/usereditprofile" className={styles.footerLink}>{t('footer.profile')}</Link>
                        </>
                    )}

                    {loggedIn && userType === 'company' && (
                        <>
                            <Link to="/company" className={styles.footerLink}>{t('footer.dashboard')}</Link>
                            <Link to="/AddJob" className={styles.footerLink}>{t('footer.postJob')}</Link>
                            <Link to="/CompanyEditProfile" className={styles.footerLink}>{t('footer.profile')}</Link>
                        </>
                    )}
                </div>

                {/* Contact Section */}
                <div className={styles.footerCol}>
                    <div className={styles.footerTitle}>{t('footer.contact')}</div>
                    <a className={styles.footerLink} href={`mailto:${t('footer.email')}`}>
                        {t('footer.email')}
                    </a>
                    <a className={styles.footerLink} href={`tel:${t('footer.phone').replace(/\s+/g, '')}`}>
                        {t('footer.phone')}
                    </a>
                </div>
            </div>

            <div className={styles.footerBottom}>
                {t('footer.copyright', { year: currentYear })}
            </div>
        </footer>
    );
};

export default Footer;