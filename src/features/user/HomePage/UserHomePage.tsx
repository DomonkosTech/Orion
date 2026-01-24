import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search,
    Briefcase,
    FileText,
    ChevronRight,
    Settings,
    MessageSquare,
    TrendingUp,
    MapPin,
    Building2,
    ArrowRight,
    Sparkles,
    Zap,
    Target
} from "lucide-react";
import styles from "./UserHomePage.module.css";

// components
import { Header } from "../../../components/Header/Header.tsx";
import BannerKicker from "../../../components/BannerKicker/BannerKicker.tsx";
import Button from "../../../components/Button/Button.tsx";
import Footer from "../../../components/Footer/Footer.tsx";
import { useAuth } from "../../../hooks/useAuth";
import { getJobApplications, getTop3Advertisements, type AdvertisementDetails } from "../../../api/advertisementApi.ts";
import { getChatPartners } from "../../../api/messageApi.ts";

function UserHomePage() {
    const navigate = useNavigate();
    const { name } = useAuth();
    const [bestMatch, setBestMatch] = useState<AdvertisementDetails | null>(null);
    const [stats, setStats] = useState({ applications: 0, messages: 0, views: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [applicationsData, topAds, chatPartners] = await Promise.all([
                    getJobApplications(),
                    getTop3Advertisements(),
                    getChatPartners()
                ]);

                setStats(prev => ({
                    ...prev,
                    applications: (applicationsData.submit?.length || 0) + (applicationsData.work?.length || 0),
                    messages: chatPartners?.length || 0,
                    views: 0
                }));

                if (topAds && topAds.length > 0) {
                    setBestMatch(topAds[0]);
                }
            } catch (err) {
                console.error("Hiba az adatok lekérésekor:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const navigationItems = [
        {
            title: "Álláskeresés",
            icon: <Search size={24} />,
            path: "/listjobs",
            description: "Keressen az aktuális ajánlatok között"
        },
        {
            title: "Jelentkezéseim",
            icon: <Briefcase size={24} />,
            path: "/jobapplications",
            description: "Kövesse nyomon folyamatait"
        },
        {
            title: "Dokumentumok",
            icon: <FileText size={24} />,
            path: "/uploadresume",
            description: "Önéletrajz és egyéb fájlok"
        },
        {
            title: "Üzenetek",
            icon: <MessageSquare size={24} />,
            path: "/messenger",
            description: "Beszélgessen a munkaadókkal"
        }
    ];

    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.mainContent}>
                <div className={styles.container}>
                    {/* Welcome Header */}
                    <div className={styles.dashboardHeader}>
                        <div className={styles.welcomeSection}>
                            <div className={styles.kickerWrapper}>
                                <BannerKicker>Személyes Vezérlőpult</BannerKicker>
                            </div>
                            <h1 className={styles.heroTitle}>
                                Szia, <span className={styles.accent}>{name}!</span> 👋
                            </h1>
                            <p className={styles.heroSubtitle}>
                                Itt egy áttekintés a mai karrierlehetőségeidről és folyamataidról.
                            </p>
                        </div>
                        <div className={styles.headerActions}>
                            <Button
                                onClick={() => navigate("/EditUserProfile")}
                                variant="secondary"
                                color="orion-blue"
                            >
                                <Settings size={18} style={{ marginRight: '8px' }} />
                                Profil beállítások
                            </Button>
                        </div>
                    </div>

                    <div className={styles.dashboardGrid}>
                        {/* Stats Row */}
                        <section className={styles.statsRow}>
                            <div className={styles.statCard}>
                                <div className={styles.statIcon}><Target size={28} /></div>
                                <div className={styles.statInfo}>
                                    <span className={styles.statLabel}>Jelentkezések</span>
                                    <span className={styles.statValue}>{stats.applications}</span>
                                </div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={styles.statIcon}><MessageSquare size={28} /></div>
                                <div className={styles.statInfo}>
                                    <span className={styles.statLabel}>Üzenetek</span>
                                    <span className={styles.statValue}>{stats.messages}</span>
                                </div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={styles.statIcon}><TrendingUp size={28} /></div>
                                <div className={styles.statInfo}>
                                    <span className={styles.statLabel}>Profil megtekintés</span>
                                    <span className={styles.statValue}>{stats.views}</span>
                                </div>
                            </div>
                            <div className={styles.statCard} title="Ez a mutató azt jelzi, hogy mennyire illik az Ön profilja (tapasztalat, készségek) az aktuális piaci igényekhez.">
                                <div className={styles.statIcon}><Sparkles size={28} /></div>
                                <div className={styles.statInfo}>
                                    <span className={styles.statLabel}>Egyezési mutató</span>
                                    <span className={styles.statValue}>92%</span>
                                </div>
                            </div>
                        </section>

                        {/* Featured Content: Best Match */}
                        <section className={styles.featuredSection}>
                            <div className={styles.bestMatchCard}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.matchBadge}>
                                        <Zap size={16} fill="currentColor" />
                                        Kiemelt Ajánlat
                                    </div>
                                </div>
                                <div className={styles.cardBody}>
                                    {loading ? (
                                        <div className={styles.skeleton}></div>
                                    ) : bestMatch ? (
                                        <>
                                            <h2 className={styles.matchTitle}>{bestMatch.title}</h2>
                                            <div className={styles.matchDetails}>
                                                <div className={styles.detailItem}>
                                                    <Building2 size={20} />
                                                    <span>{bestMatch.company_name || "Orion Partner"}</span>
                                                </div>
                                                <div className={styles.detailItem}>
                                                    <MapPin size={20} />
                                                    <span>{bestMatch.location}</span>
                                                </div>
                                            </div>
                                            <p className={styles.matchDescription}>
                                                Ez a pozíció 98%-ban egyezik az Ön tapasztalatával és készségeivel.
                                                {bestMatch.company_name ? ` A(z) ${bestMatch.company_name} aktívan keresi az új csapattagot.` : " Egy partnerünk aktívan keresi az új csapattagot."}
                                            </p>
                                            <Button
                                                onClick={() => navigate(`/job/show/${bestMatch.id}`)}
                                                variant="primary"
                                                color="orion-blue"
                                                className={styles.matchBtn}
                                            >
                                                Részletek megtekintése <ArrowRight size={20} style={{ marginLeft: '12px' }} />
                                            </Button>
                                        </>
                                    ) : (
                                        <div className={styles.emptyMatch}>
                                            <Search size={48} className={styles.emptyIcon} />
                                            <p>Jelenleg nincs az Ön profiljához illő kiemelt ajánlatunk.</p>
                                            <Button
                                                variant="secondary"
                                                color="orion-blue"
                                                onClick={() => navigate("/listjobs")}
                                            >
                                                Összes állás böngészése
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Quick Actions Sidebar */}
                        <aside className={styles.quickActions}>
                            <div className={styles.navGroup}>
                                {navigationItems.map((item, index) => (
                                    <button
                                        key={index}
                                        className={styles.navItem}
                                        onClick={() => navigate(item.path)}
                                    >
                                        <div className={styles.navIconWrapper}>
                                            {item.icon}
                                        </div>
                                        <div className={styles.navText}>
                                            <span className={styles.navTitle}>{item.title}</span>
                                            <span className={styles.navSub}>{item.description}</span>
                                        </div>
                                        <ChevronRight size={18} className={styles.navArrow} />
                                    </button>
                                ))}
                            </div>

                            <div className={styles.helpCard}>
                                <h4>Segítségre van szüksége?</h4>
                                <p>Karrier tanácsadóink segítenek a legtöbbet kihozni a profiljából.</p>
                                <Button
                                    variant="secondary"
                                    color="orion-blue"
                                    onClick={() => navigate("/messenger")}
                                    className={styles.helpBtn}
                                >
                                    Chat indítása
                                </Button>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default UserHomePage;