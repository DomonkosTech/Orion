import React from "react";
import { MapPin, Heart, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import styles from "../ListJobs.module.css";
import Button from "../../../../../components/Button/Button.tsx";
import { addFavorite } from "../../../../../Api/advertisementApi.ts";

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
    isAI?: boolean;
};

const JobCard: React.FC<Props> = ({ job, onOpen, formatCurrency, isAI }) => {
    const { t } = useTranslation('user');

    const handleAddFavorite: React.MouseEventHandler<SVGSVGElement> = async (e) => {
        e.stopPropagation();
        try {
            await addFavorite(job.id);
            toast.success("sikeresen hozzáadva a kedvencekhez");
        } catch (err) {
            console.error("addFavorite failed:", err);
            toast.error("sikertelen hozzáadás a kedvencekhez");
        }
    };

    return (
        <div className={styles.card} onClick={onOpen}>
            {isAI && (
                <div className={styles.aiBadge}>
                    <span>{t('jobs.list.ai.badge')}</span>
                </div>
            )}
            <div className={styles.cardTopRow}>
                <div className={styles.logoPlaceholder}>
                    {job.title.charAt(0).toUpperCase()}
                </div>

                <Heart
                    className={styles.bookmarkIcon}
                    size={20}
                    onClick={handleAddFavorite}
                    role="button"
                    aria-label="Kedvencekhez adás"
                    tabIndex={0}
                />
            </div>

            <div>
                <h2 className={styles.title}>{job.title}</h2>
                <p className={styles.companyName}>Orion Partner</p>

                <div className={styles.badges}>
                    <span className={`${styles.badge} ${styles.badgePosition}`}>
                        {job.position}
                    </span>
                    <span className={`${styles.badge} ${styles.badgeLocation}`}>
                        <MapPin size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                        {job.location}
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
                    <Button type="button" color={"orion-blue"} variant={"secondary"}>
                        Részletek <ArrowRight size={16} style={{ marginLeft: '6px' }} />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default JobCard;
