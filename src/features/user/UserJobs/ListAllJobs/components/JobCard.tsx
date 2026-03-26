import React from "react";
import { MapPin, Heart, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import styles from "../ListJobs.module.css";
import Button from "../../../../../components/ui/Button/Button.tsx";
import { addFavorite, removeFavorite } from "../../../../../Api/advertisementApi.ts";

type Job = {
    id: number;
    title: string;
    position: string;
    location: string;
    hourly_wage: number;
    tasks: string;
    company_name?: string;
    company?: {
        name?: string;
    };
};

type Props = {
    job: Job;
    onOpen: () => void;
    formatCurrency: (amount: number) => string;
    isAI?: boolean;
    isFavorite?: boolean;
    onFavoriteAdded?: (jobId: number) => void;
    onFavoriteRemoved?: (jobId: number) => void;
};

const JobCard: React.FC<Props> = ({
    job,
    onOpen,
    formatCurrency,
    isAI,
    isFavorite,
    onFavoriteAdded,
    onFavoriteRemoved,
}) => {
    const { t } = useTranslation('user');

    const handleToggleFavorite: React.MouseEventHandler<SVGSVGElement> = async (e) => {
        e.stopPropagation();

        try {
            if (isFavorite) {
                await removeFavorite(job.id);
                onFavoriteRemoved?.(job.id);
                toast.success(t('jobs.list.card.favoriteRemoved'));
            } else {
                await addFavorite(job.id);
                onFavoriteAdded?.(job.id);
                toast.success(t('jobs.list.card.favoriteAdded'));
            }
        } catch (err) {
            console.error("toggleFavorite failed:", err);
            toast.error(t('jobs.list.card.favoriteError'));
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
                    className={`${styles.bookmarkIcon} ${isFavorite ? styles.favorite : ''}`}
                    size={20}
                    fill={isFavorite ? "currentColor" : "none"}
                    onClick={handleToggleFavorite}
                    role="button"
                    aria-label="Kedvenc"
                    tabIndex={0}
                />
            </div>

            <div>
                <h2 className={styles.title}>{job.title}</h2>
                <p className={styles.companyName}>{job.company?.name || job.company_name || "Orion Partner"}</p>

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
                    <span className={styles.wageLabel}>{t('jobs.list.card.hourlyWage')}</span>
                    <span className={styles.wageValue}>
                        {formatCurrency(job.hourly_wage)}
                    </span>
                </div>

                <div onClick={(e) => { e.stopPropagation(); onOpen(); }}>
                    <Button type="button" color={"orion-blue"} variant={"secondary"}>
                        {t('jobs.list.card.details')} <ArrowRight size={16} style={{ marginLeft: '6px' }} />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default JobCard;
