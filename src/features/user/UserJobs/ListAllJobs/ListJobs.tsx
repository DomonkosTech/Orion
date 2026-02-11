import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";
import styles from "./ListJobs.module.css";

// Components
import { Header } from "../../../../components/Header/Header.tsx";
import FilterBar from "./components/FilterBar.tsx";
import JobCard from "./components/JobCard.tsx";
import SkeletonCard from "./components/SkeletonCard.tsx";
import EmptyState from "./components/EmptyState.tsx";
import { getAdvertisements, type Job, OrionAI as OrionAIApi } from "../../../../Api/advertisementApi.ts";
import BannerKicker from "../../../../components/BannerKicker/BannerKicker.tsx";
import Footer from "../../../../components/Footer/Footer.tsx";
import Button from "../../../../components/Button/Button.tsx";


// Helper for formatting currency
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("hu-HU", {
        style: "currency",
        currency: "HUF",
        maximumFractionDigits: 0,
    }).format(amount);
};

const ListJobs: React.FC = () => {
    const { t } = useTranslation('user');
    const PAGE_SIZE = 21;
    const [jobs, setJobs] = useState<Job[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [isAISearchActive, setIsAISearchActive] = useState(false);

    // Filters
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [locationFilter, setLocationFilter] = useState<string>("");
    const [positionFilter, setPositionFilter] = useState<string>("");
    const [minWage, setMinWage] = useState<string>("");

    // Applied filters state to ensure pagination uses the same filters as the search
    const [appliedFilters, setAppliedFilters] = useState({
        searchTerm: "",
        locationFilter: "",
        positionFilter: "",
        minWage: "",
        isAI: false
    });

    const navigate = useNavigate();

    // Navigation handlers
    const handleshowClick = (adId: number) => {
        navigate(`/job/show/${adId}`);
    };

    const fetchAIJobs = async (input: string, wage: string) => {
        setLoading(true);
        setError(null);
        try {
            const numericWage = parseInt(wage) || 2000;
            const response = await OrionAIApi(input, numericWage);
            if (response.success && Array.isArray(response.data)) {
                setJobs(response.data);
                setTotalCount(response.data.length);
                // Mark that current results are AI-driven only after successful fetch
                setAppliedFilters({
                    searchTerm: input,
                    locationFilter: "",
                    positionFilter: "",
                    minWage: wage,
                    isAI: true
                });
            } else {
                setJobs([]);
                setTotalCount(0);
            }
        } catch (err) {
            console.error(err);
            setError(t('jobs.list.ai.error'));
        } finally {
            setLoading(false);
        }
    };

    const fetchJobs = async (
        q: string = "",
        loc: string = "",
        pos: string = "",
        wage: string = "",
        pg: number = 1
    ) => {
        setLoading(true);
        try {
            const data = await getAdvertisements(q, loc, pos, wage, pg, PAGE_SIZE);

            if (data.success) {
                if (pg === 1) {
                    setJobs(data.advertisements);
                } else {
                    setJobs((prev) => [...prev, ...data.advertisements]);
                }
                // Only update totalCount if it's provided
                if (data.totalCount !== undefined) {
                    setTotalCount(Number(data.totalCount));
                }
            } else {
                if (pg === 1) {
                    setJobs([]);
                }
                throw new Error(data.error || "Hiba.");
            }
        } catch (err) {
            console.error(err);
            // Only set main error if it's the first page, otherwise we lose the list
            if (pg === 1) {
                setError(err instanceof Error ? err.message : "Ismeretlen hiba.");
            }
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchJobs();
    }, []);

    // Load more when page increases
    useEffect(() => {
        if (page > 1 && !appliedFilters.isAI) {
            fetchJobs(
                appliedFilters.searchTerm,
                appliedFilters.locationFilter,
                appliedFilters.positionFilter,
                appliedFilters.minWage,
                page
            );
        }
    }, [page]);

    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setError(null);
        setPage(1);

        if (isAISearchActive) {
            // For AI search, only set the AI flag after successful fetch to avoid
            // showing AI badge on stale results
            fetchAIJobs(searchTerm, minWage);
        } else {
            setAppliedFilters({
                searchTerm,
                locationFilter,
                positionFilter,
                minWage,
                isAI: false
            });
            fetchJobs(searchTerm, locationFilter, positionFilter, minWage, 1);
        }
    };

    const clearFilters = () => {
        setSearchTerm("");
        setLocationFilter("");
        setPositionFilter("");
        setMinWage("");
        setPage(1);
        setError(null);
        setAppliedFilters({
            searchTerm: "",
            locationFilter: "",
            positionFilter: "",
            minWage: "",
            isAI: false
        });
        setIsAISearchActive(false);
        fetchJobs("", "", "", "", 1);
    };

    const handleLoadMore = () => {
        setPage((prev) => prev + 1);
    };

    // Determine if we should show the "Load More" button
    // If totalCount is available, use it.
    // Fallback: If totalCount is missing (0), check if we have a full page of results.
    const showLoadMore = !appliedFilters.isAI && (totalCount > 0
        ? jobs.length < totalCount
        : (jobs.length > 0 && jobs.length % PAGE_SIZE === 0));

    const isLoadingAI = loading && isAISearchActive;

    return (
        <div className={styles.pageWrapper}>
            <Header />

            <main className={styles.mainContent}>
                <div className={styles.container}>
                    {/* Dashboard Style Header */}
                    <div className={styles.dashboardHeader}>
                        <div className={styles.welcomeSection}>
                            <div className={styles.kickerWrapper}>
                                <BannerKicker>{t('jobs.list.kicker')}</BannerKicker>
                            </div>
                            <h1 className={styles.heroTitle}>
                                <Trans t={t} i18nKey="jobs.list.title">
                                    Találja meg a <span className={styles.accent}>jövőjét!</span>
                                </Trans>
                            </h1>
                            <p className={styles.heroSubtitle}>
                                {totalCount > 0 ? (
                                    <Trans t={t} i18nKey={appliedFilters.isAI ? "jobs.list.ai.subtitle" : "jobs.list.subtitle"} values={{ count: totalCount }}>
                                        Fedezzen fel <strong>{totalCount}</strong> nyitott pozíciót vezető cégeknél.
                                    </Trans>
                                ) : (
                                    <Trans t={t} i18nKey="jobs.list.subtitleDefault">
                                        Fedezzen fel <strong>több száz</strong> nyitott pozíciót vezető cégeknél.
                                    </Trans>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Filter Section */}
                    <FilterBar
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        locationFilter={locationFilter}
                        onLocationChange={setLocationFilter}
                        positionFilter={positionFilter}
                        onPositionChange={setPositionFilter}
                        minWage={minWage}
                        onMinWageChange={setMinWage}
                        onClear={clearFilters}
                        onSubmit={handleSearch}
                        isAISearchActive={isAISearchActive}
                        onToggleAISearch={() => {
                            const newActive = !isAISearchActive;
                            setIsAISearchActive(newActive);
                            if (!newActive) {
                                // Switching back to normal search
                                setSearchTerm(""); // Clear the input field as requested
                                setAppliedFilters({
                                    searchTerm: "",
                                    locationFilter,
                                    positionFilter,
                                    minWage,
                                    isAI: false
                                });
                                fetchJobs("", locationFilter, positionFilter, minWage, 1);
                            }
                        }}
                        onAISuggestionSelect={(text) => { setSearchTerm(text); handleSearch(); }}
                        isLoadingAI={loading && isAISearchActive}
                    />

                    {/* Jobs Grid */}
                    {error && (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{t('jobs.list.errorTitle')}</h3>
                            <p style={{ color: 'var(--muted)' }}>{error}</p>
                        </div>
                    )}

                    {!loading && !error && jobs.length === 0 && (
                        <EmptyState onClear={clearFilters} />
                    )}

                    {!error && (
                        <>
                            {isLoadingAI && (
                                <div className={styles.aiLoadingContainer}>
                                    <div className={styles.overlaySpinner}></div>
                                    <span className={styles.overlayText}>{t('jobs.list.ai.aiWait')}</span>
                                </div>
                            )}

                            {!isLoadingAI && jobs.length > 0 && (
                                <div className={styles.grid}>
                                    {jobs.map((job) => (
                                        <JobCard
                                            key={job.id}
                                            job={job}
                                            onOpen={() => handleshowClick(job.id)}
                                            formatCurrency={formatCurrency}
                                            isAI={appliedFilters.isAI}
                                        />
                                    ))}
                                    {loading && [1, 2, 3].map((n) => <SkeletonCard key={n} />)}
                                </div>
                            )}

                            {jobs.length === 0 && loading && !isLoadingAI && (
                                <div className={styles.grid}>
                                    {[1, 2, 3, 4, 5, 6].map((n) => <SkeletonCard key={n} />)}
                                </div>
                            )}

                            {!isLoadingAI && showLoadMore && (
                                <div className={styles.pagination}>
                                    <Button
                                        onClick={handleLoadMore}
                                        disabled={loading}
                                        variant="secondary"
                                        color="orion-blue"
                                    >
                                        {loading ? t('jobs.list.loading') : t('jobs.list.loadMore')}
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ListJobs;
