import styles from "./AILoadingState.module.css";
import { Trans } from "react-i18next";

const AILoadingState = () => {
  return (
    <div className={styles.aiLoadingContainer}>
      <div className={styles.sparkle}></div>
      <div className={styles.sparkle}></div>
      <div className={styles.sparkle}></div>
      <h2 className={styles.aiLoadingTitle}>
        <Trans i18nKey="jobs.list.ai.loadingTitle">
          Az Orion AI elemzi a lehetőségeket...
        </Trans>
      </h2>
      <p className={styles.aiLoadingSubtitle}>
        <Trans i18nKey="jobs.list.ai.loadingSubtitle">
          Hamarosan mutatjuk a legjobb találatokat! Ez akár egy percet is
          igénybe vehet.
        </Trans>
      </p>
    </div>
  );
};

export default AILoadingState;
