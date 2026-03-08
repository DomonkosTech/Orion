import React, { useState } from "react";
import { Search, MapPin, Briefcase, X, Sparkles, ArrowRight, Wallet, SlidersHorizontal } from "lucide-react";
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

export const MobileFilterBar: React.FC<Props> = ({
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
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    
    const aiPlaceholder = t('jobs.list.ai.inputPlaceholderMobile');
    const defaultPlaceholder = t('jobs.list.ai.inputPlaceholderDefaultMobile');
    const placeholderText = isAISearchActive ? aiPlaceholder : defaultPlaceholder;

    const mobileOverlay = isMobileFiltersOpen ? (
        <div className={styles.mobileOverlay}>
            <div className={styles.mobileOverlayHeader}>
                <h3>Szűrők</h3>
                <button type="button" onClick={() => setIsMobileFiltersOpen(false)} className={styles.closeOverlayBtn}>
                    <X size={24} />
                </button>
            </div>
            <div className={styles.mobileOverlayContent}>
             <div className={`${styles.collapsibleWrapper} ${styles.expanded}`}>
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
               <button 
                  type="button" 
                  className={styles.mobileApplyButton} 
                  onClick={(e) => {
                      setIsMobileFiltersOpen(false);
                      // Trigger form submission manually since this button is technically
                      // outside the normal flow and we just want to apply filters.
                      onSubmit(e as unknown as React.FormEvent);
                  }}
               >
                   Szűrés alkalmazása
               </button>
            </div>
        </div>
    ) : null;

    return (
        <>
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
                    <button 
                        type="button" 
                        className={`${styles.mobileFilterIcon} ${isAISearchActive ? styles.mobileFilterIconHidden : ""}`}
                        onClick={() => setIsMobileFiltersOpen(true)}
                    >
                        <SlidersHorizontal size={24} />
                    </button>
                    <div className={styles.aiToggleWrapper}>
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
            </form>
            {mobileOverlay}
        </>
    );
};
