import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation, Trans } from "react-i18next";
import styles from "./PublicHomePage.module.css";

// components
import BannerKicker from "../../../components/layout/BannerKicker/BannerKicker.tsx";
import Button from "../../../components/ui/Button/Button.tsx";
import { getTop3Advertisements, type CompanyAdvertisement } from "../../../Api/advertisementApi.ts";
import { useAuth } from "../../../hooks/useAuth.ts";

function PublicHomePage() {
    const navigate = useNavigate();
    const { t } = useTranslation('public');
    const { loggedIn, userType } = useAuth();
    const [featuredJobs, setFeaturedJobs] = useState<CompanyAdvertisement[]>([]);

    useEffect(() => {
        const fetchTopJobs = async () => {
            try {
                const data = await getTop3Advertisements();
                if (data.success) {
                    setFeaturedJobs(data.advertisements);
                }
            } catch (error) {
                console.error("Failed to fetch top jobs:", error);
            }
        };

        fetchTopJobs();
    }, []);

    return (
        <div className={styles.page}>
            <main>
                {/* Hero Section */}
                <section className={styles.hero}>
                    <div className={styles.heroInner}>
                        <BannerKicker>{t('hero.kicker')}</BannerKicker>

                        <h1 className={styles.heroTitle}>
                            <Trans i18nKey="hero.title">
                                Építse a jövőjét <span className={styles.accent}>szakértő</span> csapatunkban.
                            </Trans>
                        </h1>

                        <p className={styles.heroSubtitle}>
                            {t('hero.subtitle')}
                        </p>

                        <div className={styles.heroActions}>
                            <Button
                                onClick={() => navigate("/listjobs")}
                                color="orion-blue"
                                variant="primary"
                            >
                                {t('hero.mainCta')}
                            </Button>

                            {loggedIn ? (
                                <Button
                                    onClick={() => navigate(userType === "company" ? "/company" : "/userhomepage")}
                                    variant="secondary"
                                    color="orion-blue"
                                >
                                    Irány a Vezérlőpult
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => window.scrollTo({ top: 400, behavior: 'smooth' })}
                                    variant="secondary"
                                    color="orion-blue"
                                >
                                    {t('hero.secondaryCta')}
                                </Button>
                            )}
                        </div>
                    </div>
                </section>

                {/* Value Propositions */}
                <section className={styles.section} id="about">
                    <div className={styles.container}>
                        <div className={styles.sectionHead}>
                            <h2 className={styles.sectionTitle}>{t('valuePropositions.title')}</h2>
                            <p className={styles.sectionSubtitle}>
                                {t('valuePropositions.subtitle')}
                            </p>
                        </div>

                        <div className={styles.featuresGrid}>
                            <article className={styles.feature}>
                                <div className={styles.featureTop}>
                                    <div className={styles.featureIcon}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M7 17L17 7"/>
                                            <path d="M7 7h10v10"/>
                                        </svg>
                                    </div>
                                    <div className={styles.featureBadge}>{t('valuePropositions.features.development.badge')}</div>
                                </div>
                                <h3 className={styles.featureTitle}>{t('valuePropositions.features.development.title')}</h3>
                                <p className={styles.featureText}>
                                    {t('valuePropositions.features.development.text')}
                                </p>
                            </article>

                            <article className={styles.feature}>
                                <div className={styles.featureTop}>
                                    <div className={styles.featureIcon}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="10" width="18" height="11" rx="1"/>
                                            <path d="M3 10l9-7 9 7"/>
                                        </svg>
                                    </div>
                                    <div className={styles.featureBadge}>{t('valuePropositions.features.flexibility.badge')}</div>
                                </div>
                                <h3 className={styles.featureTitle}>{t('valuePropositions.features.flexibility.title')}</h3>
                                <p className={styles.featureText}>
                                    {t('valuePropositions.features.flexibility.text')}
                                </p>
                            </article>

                            <article className={styles.feature}>
                                <div className={styles.featureTop}>
                                    <div className={styles.featureIcon}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                        </svg>
                                    </div>
                                    <div className={styles.featureBadge}>{t('valuePropositions.features.value.badge')}</div>
                                </div>
                                <h3 className={styles.featureTitle}>{t('valuePropositions.features.value.title')}</h3>
                                <p className={styles.featureText}>
                                    {t('valuePropositions.features.value.text')}
                                </p>
                            </article>
                        </div>
                    </div>
                </section>

                {/* Featured Jobs Preview */}
                <section className={styles.sectionAlt}>
                    <div className={styles.container}>
                        <div className={styles.sectionHead}>
                            <h2 className={styles.sectionTitle}>{t('featuredJobs.title')}</h2>
                            <p className={styles.sectionSubtitle}>{t('featuredJobs.subtitle')}</p>
                        </div>

                        <div className={styles.jobList}>
                            {featuredJobs.map((job) => (
                                <div key={job.id} className={styles.jobCard}>
                                    <div className={styles.jobInfo}>
                                        <span className={styles.jobCategory}>{job.position}</span>
                                        <h4 className={styles.jobCardTitle}>{job.title}</h4>
                                        <p className={styles.jobLocation}>{job.location}</p>
                                    </div>
                                    <Button
                                        variant="secondary"
                                        color="orion-blue"
                                        onClick={() => navigate(`/job/show/${job.id}`)}
                                    >
                                        {t('featuredJobs.detailsButton')}
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <div className={styles.callout}>
                            <div className={styles.calloutLeft}>
                                <div className={styles.calloutTitle}>{t('featuredJobs.callout.title')}</div>
                                <div className={styles.calloutText}>
                                    {t('featuredJobs.callout.text')}
                                </div>
                            </div>
                            <Button
                                color="orion-blue"
                                onClick={() => navigate("/UserLoginPage")}
                            >
                                {t('featuredJobs.callout.cta')}
                            </Button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default PublicHomePage;