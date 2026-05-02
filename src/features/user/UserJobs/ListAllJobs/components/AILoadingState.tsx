import styles from "./AILoadingState.module.css";
import { useTranslation, Trans } from "react-i18next";

const AILoadingState = () => {
  const { t } = useTranslation("user");

  return (
    <div className={styles.aiLoadingContainer}>
      <div className={styles.sparkle}></div>
      <div className={styles.sparkle}></div>
      <div className={styles.sparkle}></div>
      <h2 className={styles.aiLoadingTitle}>
        <Trans i18nKey="jobs.list.ai.loadingTitle" t={t}>
          Az Orion AI elemzi a lehetőségeket...
        </Trans>
      </h2>
      <p className={styles.aiLoadingSubtitle}>
        <Trans i18nKey="jobs.list.ai.loadingSubtitle" t={t}>
          Hamarosan mutatjuk a legjobb találatokat! Ez akár egy percet is
          igénybe vehet.
        </Trans>
      </p>
    </div>
  );
};

export default AILoadingState;
