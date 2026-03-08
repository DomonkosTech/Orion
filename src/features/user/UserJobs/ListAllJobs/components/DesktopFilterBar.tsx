import React from "react";
import { Search, MapPin, Briefcase, X, Sparkles, ArrowRight, Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";
import styles from "../ListJobs.module.css";
import InputField from "../../../../../components/InputField/InputField.tsx";

type Props = {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    locationFilter: string;
    onLocationChange: (value: string) => void;
    positionFilter: string;
    onPositionChange: (value: string) => void;
    minWage: string;
    onMinWageChange: (value: string) => void;
    onClear: () => void;
    onSubmit: (e: React.FormEvent) => void;
    isAISearchActive: boolean;
    onToggleAISearch: () => void;
    hasActiveFilters: boolean;
    suggestions: string[];
};

export const DesktopFilterBar: React.FC<Props> = ({
                                                      searchTerm,
                                                      onSearchChange,
                                                      locationFilter,
                                                      onLocationChange,
                                                      positionFilter,
                                                      onPositionChange,
                                                      minWage,
                                                      onMinWageChange,
                                                      onClear,
                                                      onSubmit,
                                                      isAISearchActive,
                                                      onToggleAISearch,
                                                      hasActiveFilters,
                                                      suggestions,
                                                  }) => {
    const { t } = useTranslation('user');

    // Desktop placeholder text does not get trimmed
    const placeholderText = isAISearchActive ? t('jobs.list.ai.inputPlaceholder') : t('jobs.list.ai.inputPlaceholderDefault');

    return (
        <form className={`${styles.searchForm} ${isAISearchActive ? styles.aiFormActive : ""}`} onSubmit={onSubmit}>
            <div className={styles.topBar}>
                <div className={`${styles.searchBarWrapper} ${isAISearchActive ? styles.searchBarAIActive : ""}`}>
                    <Search size={20} className={styles.inputIcon} />
                    <InputField
                        type="text"
                        placeholder={placeholderText}
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className={`${styles.searchInput} ${isAISearchActive ? styles.aiActiveInput : ""}`}
                    />
                    <button
                        type="submit"
                        className={`${styles.mainSubmitButton} ${isAISearchActive ? styles.aiSearchSubmit : ""}`}
                    >
                        <div className={styles.buttonContentWrapper}>
                            <span className={`${styles.buttonText} ${isAISearchActive ? styles.hidden : ""}`}>
                                {t('jobs.list.ai.buttonLabelDefault')}
                            </span>
                            <ArrowRight
                                size={20}
                                className={`${styles.buttonIcon} ${!isAISearchActive ? styles.hidden : ""}`}
                            />
                        </div>
                    </button>
                </div>
                <div className={styles.aiToggleWrapperDesktop}>
                    <button
                        type="button"
                        onClick={onToggleAISearch}
                        className={`${styles.aiToggle} ${isAISearchActive ? styles.aiToggleActive : ""}`}
                        title={t('jobs.list.ai.toggleLabel')}
                    >
                        <Sparkles size={18} />
                        <span>{t('jobs.list.ai.toggleLabel')}</span>
                    </button>
                </div>
            </div>

            <div className={`${styles.collapsibleWrapper} ${isAISearchActive ? styles.expanded : ""}`}>
                <div className={styles.aiSuggestions}>
                    {suggestions.map((text, i) => (
                        <button
                            key={i}
                            type="button"
                            className={styles.suggestionChip}
                            onClick={() => onSearchChange(text)}
                        >
                            {text}
                        </button>
                    ))}
                </div>
            </div>

            <div className={`${styles.collapsibleWrapper} ${!isAISearchActive ? styles.expanded : ""}`}>
                <div className={styles.filtersBar}>
                    <div className={styles.filterGroup}>
                        <MapPin size={18} className={styles.inputIcon} />
                        <InputField
                            type="text"
                            placeholder={t('jobs.list.ai.locationPlaceholder')}
                            value={locationFilter}
                            onChange={(e) => onLocationChange(e.target.value)}
                            className={styles.filterControl}
                        />
                    </div>

                    <div className={styles.filterGroup}>
                        <Briefcase size={18} className={styles.inputIcon} />
                        <InputField
                            type="text"
                            placeholder={t('jobs.list.ai.positionPlaceholder')}
                            value={positionFilter}
                            onChange={(e) => onPositionChange(e.target.value)}
                            className={styles.filterControl}
                        />
                    </div>

                    <div className={`${styles.filterGroup} ${styles.wageGroup}`}>
                        <Wallet size={18} className={styles.inputIcon} />
                        <InputField
                            type="number"
                            min={0}
                            placeholder={t('jobs.list.ai.wagePlaceholder')}
                            value={minWage}
                            onChange={(e) => onMinWageChange(e.target.value)}
                            className={`${styles.filterControl} ${styles.wageInput}`}
                        />
                        <span className={styles.wageSuffix}>Ft</span>
                    </div>

                    <button
                        type="button"
                        onClick={onClear}
                        className={styles.clearButton}
                        disabled={!hasActiveFilters}
                    >
                        <X/>
                    </button>
                </div>
            </div>
        </form>
    );
};
