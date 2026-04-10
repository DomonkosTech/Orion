import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import styles from './LanguageSelector.module.css';

interface Language {
    code: string;
    name: string;
    prefix: string;
}

const LANGUAGES: Language[] = [
    { code: 'hu', name: 'Magyar', prefix: 'HU' },
    { code: 'en', name: 'English', prefix: 'EN' },
    { code: 'de', name: 'Deutsch', prefix: 'DE' }
];

const LanguageSelector: React.FC = () => {
    const { i18n, t } = useTranslation('components');
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Get current language object
    const currentLangCode = (i18n.language || 'hu').split('-')[0]; // Handle 'en-US' -> 'en'
    const currentLang = LANGUAGES.find(l => l.code === currentLangCode) || LANGUAGES[0];

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
        setIsOpen(false);
    };

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className={styles.wrapper} ref={dropdownRef}>
            <button
                className={`${styles.trigger} ${isOpen ? styles.expanded : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-label="Language Selector"
            >
                <div className={styles.triggerContent}>
                    <span className={styles.prefixWrapper}>{currentLang.prefix}</span>
                    <span className={styles.triggerLabel}>{currentLang.name}</span>
                </div>
                <span className={styles.arrow}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease' }}>
                        <path d="m6 9 6 6 6-6"/>
                    </svg>
                </span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className={styles.dropdown}
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                        <div className={styles.dropdownHeader}>
                            {t('languageSelector.title', 'Language')}
                        </div>

                        {LANGUAGES.map((lang) => (
                            <button
                                key={lang.code}
                                className={`${styles.item} ${currentLang.code === lang.code ? styles.active : ''}`}
                                onClick={() => changeLanguage(lang.code)}
                            >
                                <span className={styles.itemPrefix}>{lang.prefix}</span>
                                <span className={styles.itemTitle}>{lang.name}</span>
                                {currentLang.code === lang.code && (
                                    <Check size={16} className={styles.checkIcon} />
                                )}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LanguageSelector;