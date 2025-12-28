import React from "react";
import styles from "../ListJobs.module.css";
import Button from "../../../../../components/Buttons/Button.tsx";

type Job = {
    id: number;
    title: string;
    position: string;
    location: string;
    hourly_wage: number;
    tasks: string;
};

type Props = {
    job: Job;
    onOpen: () => void;
    formatCurrency: (amount: number) => string;
};

const JobCard: React.FC<Props> = ({ job, onOpen, formatCurrency }) => {
    return (
        <div className={styles.card} onClick={onOpen}>
            <div className={styles.cardTopRow}>
                <div className={styles.logoPlaceholder}>
                    {job.title.charAt(0).toUpperCase()}
                </div>
                <span className={styles.bookmarkIcon}>♥</span>
            </div>

            <div>
                <h2 className={styles.title}>{job.title}</h2>
                <p className={styles.companyName}>Orion Partner</p>

                <div className={styles.badges}>
                    <span className={`${styles.badge} ${styles.badgePosition}`}>
                        {job.position}
                    </span>
                    <span className={`${styles.badge} ${styles.badgeLocation}`}>
                        📍 {job.location}
                    </span>
                    {job.id % 3 === 0 && (
                        <span className={`${styles.badge} ${styles.badgeNew}`}>
                            ÚJ
                        </span>
                    )}
                </div>

                <p className={styles.description}>
                    {job.tasks}
                </p>
            </div>

            <div className={styles.cardFooter}>
                <div className={styles.wageWrapper}>
                    <span className={styles.wageLabel}>Órabér</span>
                    <span className={styles.wageValue}>
                        {formatCurrency(job.hourly_wage)}
                    </span>
                </div>

                <div onClick={(e) => { e.stopPropagation(); onOpen(); }}>
                    <Button type="button" variant="secondary">
                        Jelentkezés
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default JobCard;
