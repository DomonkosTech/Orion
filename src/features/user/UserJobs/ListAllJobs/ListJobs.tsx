import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";
import styles from "./ListJobs.module.css";

// Components
import FilterBar from "./components/FilterBar.tsx";
import JobCard from "./components/JobCard.tsx";
import SkeletonCard from "./components/SkeletonCard.tsx";
import EmptyState from "./components/EmptyState.tsx";
import { getAdvertisements, type Job, OrionAI as OrionAIApi } from "../../../../Api/advertisementApi.ts";
import {getFavorites} from "../../../../Api/userApi.ts"

import BannerKicker from "../../../../components/layout/BannerKicker/BannerKicker.tsx";
import Button from "../../../../components/ui/Button/Button.tsx";
import AILoadingState from "./components/AILoadingState.tsx";

// sessionStorage keys for persisting UI state across back-navigation
const SS_SCROLL_Y = "orion_listjobs_scroll";
const SS_PAGES = "orion_listjobs_pages";
const SS_AI_CACHE = "orion_ai_cache";

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
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [jobs, setJobs] = useState<Job[]>([]);
    const [aiJobs, setAiJobs] = useState<Job[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [aiTotalCount, setAiTotalCount] = useState<number>(0);
    const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

    // Initialize filters from URL params so back-navigation restores search state
    const [searchTerm, setSearchTerm] = useState<string>(() => searchParams.get("q") || "");
    const [locationFilter, setLocationFilter] = useState<string>(() => searchParams.get("location") || "");
    const [positionFilter, setPositionFilter] = useState<string>(() => searchParams.get("position") || "");
    const [minWage, setMinWage] = useState<string>(() => searchParams.get("wage") || "");
    const [isAISearchActive, setIsAISearchActive] = useState(() => searchParams.get("ai") === "true");
    const [page, setPage] = useState<number>(() => {
        const p = parseInt(searchParams.get("page") || "1", 10);
        return Number.isFinite(p) && p > 0 ? p : 1;
    });

    // Applied filters state to ensure pagination uses the same filters as the search
    const [appliedFilters, setAppliedFilters] = useState({
        searchTerm: searchParams.get("q") || "",
        locationFilter: searchParams.get("location") || "",
        positionFilter: searchParams.get("position") || "",
        minWage: searchParams.get("wage") || "",
        isAI: searchParams.get("ai") === "true"
    });

    const handleFavoriteAdded = (jobId: number) => {
        setFavoriteIds((prev) => (prev.includes(jobId) ? prev : [...prev, jobId]));
    };

    const handleFavoriteRemoved = (jobId: number) => {
        setFavoriteIds((prev) => prev.filter((id) => id !== jobId));
    };

    // Navigation handlers
    const handleshowClick = (adId: number) => {
        sessionStorage.setItem(SS_SCROLL_Y, String(window.scrollY));
        if (!isAISearchActive) {
            sessionStorage.setItem(SS_PAGES, String(page));
        }
        navigate(`/job/show/${adId}`);
    };

    const fetchAIJobs = async (input: string, wage: string) => {
        setLoading(true);
        setError(null);
        try {
            const numericWage = parseInt(wage) || 2000;
            const response = await OrionAIApi(input, numericWage);
            if (response.success && Array.isArray(response.data)) {
                setAiJobs(response.data);
                setAiTotalCount(response.data.length);
                // Cache results so back-navigation doesn't re-trigger AI processing
                const cacheKey = `${input}::${wage}`;
                const aiCache = JSON.parse(sessionStorage.getItem(SS_AI_CACHE) || "{}");
                aiCache[cacheKey] = { results: response.data, timestamp: Date.now() };
                try {
                    sessionStorage.setItem(SS_AI_CACHE, JSON.stringify(aiCache));
                } catch { /* storage full — ignore */ }
            } else {
                setAiJobs([]);
                setAiTotalCount(0);
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

    const fetchFavorites = async () => {
        try {
            const favorites = await getFavorites(false);

            console.log("Favorites:", favorites);

            setFavoriteIds(
                favorites
                    .map((fav: { advertisement_id: number | string }) => Number(fav.advertisement_id))
                    .filter((id: number) => Number.isFinite(id))
            );
        } catch (error) {
            console.error("Failed to fetch favorites:", error);
        }
    };

    // Track whether we're restoring a previous session (for scroll restoration)
    const isRestoring = useRef(false);

    // Initial fetch — restore previous search from URL params if present
    useEffect(() => {
        fetchFavorites();

        const isAI = searchParams.get("ai") === "true";
        const q = searchParams.get("q") || "";
        const loc = searchParams.get("location") || "";
        const pos = searchParams.get("position") || "";
        const wage = searchParams.get("wage") || "";

        if (isAI || q || loc || pos || wage) {
            isRestoring.current = true;

            if (isAI) {
                // Check sessionStorage cache to avoid re-processing the AI query
                const cacheKey = `${q}::${wage}`;
                const raw = sessionStorage.getItem(SS_AI_CACHE);
                const aiCache = raw ? JSON.parse(raw) : {};
                const cached = aiCache[cacheKey];

                if (cached?.results?.length) {
                    setAiJobs(cached.results);
                    setAiTotalCount(cached.results.length);
                    setLoading(false);
                } else {
                    fetchAIJobs(q, wage);
                }
            } else {
                // Re-fetch all previously loaded pages in parallel
                const savedPages = parseInt(sessionStorage.getItem(SS_PAGES) || "1", 10);
                const safePages = Number.isFinite(savedPages) && savedPages > 0 ? savedPages : 1;

                setLoading(true);
                const promises = [];
                for (let p = 1; p <= safePages; p++) {
                    promises.push(getAdvertisements(q, loc, pos, wage, p, PAGE_SIZE));
                }

                Promise.all(promises).then((results) => {
                    const allJobs: Job[] = [];
                    for (const r of results) {
                        if (r.success && r.advertisements) {
                            allJobs.push(...r.advertisements);
                        }
                    }
                    setJobs(allJobs);
                    setTotalCount(Number(results[0]?.totalCount) || allJobs.length);
                    setPage(safePages);
                    setLoading(false);
                }).catch((err) => {
                    console.error(err);
                    setError(err instanceof Error ? err.message : "Ismeretlen hiba.");
                    setLoading(false);
                });
            }
        } else {
            fetchJobs();
        }
    }, []);

    // Restore scroll position after the restored jobs are rendered
    useLayoutEffect(() => {
        if (isRestoring.current && !loading && (jobs.length > 0 || aiJobs.length > 0)) {
            const savedY = sessionStorage.getItem(SS_SCROLL_Y);
            if (savedY) {
                const y = parseInt(savedY, 10);
                if (Number.isFinite(y) && y > 0) {
                    requestAnimationFrame(() => {
                        window.scrollTo(0, y);
                    });
                }
                sessionStorage.removeItem(SS_SCROLL_Y);
                sessionStorage.removeItem(SS_PAGES);
            }
            isRestoring.current = false;
        }
    }, [loading, jobs.length, aiJobs.length]);

    // Load more when page increases (skip during restoration — pages already fetched in parallel)
    useEffect(() => {
        if (page > 1 && !appliedFilters.isAI && !isRestoring.current) {
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
        setAppliedFilters({
            searchTerm,
            locationFilter,
            positionFilter,
            minWage,
            isAI: isAISearchActive
        });

        // Persist search state to URL so back-navigation restores it
        const params: Record<string, string> = {};
        if (isAISearchActive) params.ai = "true";
        if (searchTerm) params.q = searchTerm;
        if (locationFilter) params.location = locationFilter;
        if (positionFilter) params.position = positionFilter;
        if (minWage) params.wage = minWage;
        setSearchParams(params, { replace: true });

        if (isAISearchActive) {
            fetchAIJobs(searchTerm, minWage);
        } else {
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
        setAiJobs([]);
        setAiTotalCount(0);
        setSearchParams({}, { replace: true });
        sessionStorage.removeItem(SS_SCROLL_Y);
        sessionStorage.removeItem(SS_PAGES);
        sessionStorage.removeItem(SS_AI_CACHE);
        fetchJobs("", "", "", "", 1);
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        const params: Record<string, string> = {};
        for (const [key, value] of searchParams.entries()) {
            params[key] = value;
        }
        params.page = String(nextPage);
        setSearchParams(params, { replace: true });
    };

    // Derive displayed jobs based on current mode so each mode remembers its results
    const displayedJobs = isAISearchActive ? aiJobs : jobs;
    const displayedTotalCount = isAISearchActive ? aiTotalCount : totalCount;

    // Determine if we should show the "Load More" button
    // If totalCount is available, use it.
    // Fallback: If totalCount is missing (0), check if we have a full page of results.
    const showLoadMore = !appliedFilters.isAI && (totalCount > 0
        ? jobs.length < totalCount
        : (jobs.length > 0 && jobs.length % PAGE_SIZE === 0));

    return (
        <div className={styles.pageWrapper}>
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
                                {displayedTotalCount > 0 ? (
                                    <Trans t={t} i18nKey={isAISearchActive ? "jobs.list.ai.subtitle" : "jobs.list.subtitle"} values={{ count: displayedTotalCount }}>
                                        Fedezzen fel <strong>{displayedTotalCount}</strong> nyitott pozíciót vezető cégeknél.
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
                        onToggleAISearch={() => setIsAISearchActive(!isAISearchActive)}
                    />

                    {/* Jobs Grid */}
                    {error && (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{t('jobs.list.errorTitle')}</h3>
                            <p style={{ color: 'var(--muted)' }}>{error}</p>
                        </div>
                    )}

                    {loading && isAISearchActive ? (
                        <AILoadingState />
                    ) : (
                        <>
                            {!loading && !error && displayedJobs.length === 0 && (
                                <EmptyState onClear={clearFilters} />
                            )}

                            {!error && (
                                <>
                                    {displayedJobs.length > 0 && (
                                        <div className={styles.grid}>
                                            {displayedJobs.map((job) => (
                                                <JobCard
                                                    key={job.id}
                                                    job={job}
                                                    onOpen={() => handleshowClick(job.id)}
                                                    formatCurrency={formatCurrency}
                                                    isAI={isAISearchActive}
                                                    isFavorite={favoriteIds.includes(job.id)}
                                                    onFavoriteAdded={handleFavoriteAdded}
                                                    onFavoriteRemoved={handleFavoriteRemoved}
                                                />
                                            ))}
                                            {loading && [1, 2, 3].map((n) => <SkeletonCard key={n} />)}
                                        </div>
                                    )}
                                    {displayedJobs.length === 0 && loading && (
                                        <div className={styles.grid}>
                                            {[1, 2, 3, 4, 5, 6].map((n) => <SkeletonCard key={n} />)}
                                        </div>
                                    )}

                                    {showLoadMore && (
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
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ListJobs;
