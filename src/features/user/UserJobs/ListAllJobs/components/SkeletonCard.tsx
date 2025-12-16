import React from "react";
import styles from "../ListJobs.module.css";

const SkeletonCard: React.FC = () => (
    <div className={styles.skeletonCard}>
        <div className={`${styles.skLogo} ${styles.shimmer}`}></div>
        <div className={`${styles.skTitle} ${styles.shimmer}`}></div>
        <div className={`${styles.skText} ${styles.shimmer}`}></div>
        <div className={`${styles.skText} ${styles.shimmer}`}></div>
        <div className={`${styles.skTextShort} ${styles.shimmer}`}></div>
        <div className={`${styles.skFooter} ${styles.shimmer}`}></div>
    </div>
);

export default SkeletonCard;
