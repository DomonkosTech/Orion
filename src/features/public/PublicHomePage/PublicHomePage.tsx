import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation, Trans } from "react-i18next";
import styles from "./PublicHomePage.module.css";

// components
import { Header } from "../../../components/Header/Header.tsx";
import BannerKicker from "../../../components/BannerKicker/BannerKicker.tsx";
import Button from "../../../components/Button/Button.tsx";
import Footer from "../../../components/Footer/Footer.tsx";
import { getTop3Advertisements, type CompanyAdvertisement } from "../../../Api/advertisementApi.ts";

function PublicHomePage() {
    const navigate = useNavigate();
    const { t } = useTranslation('public');
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
            <Header

            />

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

                            <Button
                                onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}
                                variant="secondary"
                                color="orion-blue"
                            >
                                {t('hero.secondaryCta')}
                            </Button>
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
                                    <div className={styles.featureIcon}>🚀</div>
                                    <div className={styles.featureBadge}>{t('valuePropositions.features.development.badge')}</div>
                                </div>
                                <h3 className={styles.featureTitle}>{t('valuePropositions.features.development.title')}</h3>
                                <p className={styles.featureText}>
                                    {t('valuePropositions.features.development.text')}
                                </p>
                            </article>

                            <article className={styles.feature}>
                                <div className={styles.featureTop}>
                                    <div className={styles.featureIcon}>🏠</div>
                                    <div className={styles.featureBadge}>{t('valuePropositions.features.flexibility.badge')}</div>
                                </div>
                                <h3 className={styles.featureTitle}>{t('valuePropositions.features.flexibility.title')}</h3>
                                <p className={styles.featureText}>
                                    {t('valuePropositions.features.flexibility.text')}
                                </p>
                            </article>

                            <article className={styles.feature}>
                                <div className={styles.featureTop}>
                                    <div className={styles.featureIcon}>💎</div>
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

            <Footer />
        </div>
    );
}

export default PublicHomePage;