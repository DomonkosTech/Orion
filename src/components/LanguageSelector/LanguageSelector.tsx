import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './LanguageSelector.module.css';

const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className={styles.languageSelector}>
      <button onClick={() => changeLanguage('en')}>EN</button>
      <button onClick={() => changeLanguage('de')}>DE</button>
    </div>
  );
};

export default LanguageSelector;
