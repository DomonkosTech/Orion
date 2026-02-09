import React from "react";
import { Search, MapPin, Briefcase, X, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import styles from "../ListJobs.module.css";
import InputField from "../../../../../components/InputField/InputField.tsx";
import Button from "../../../../../components/Button/Button.tsx";

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
};

const FilterBar: React.FC<Props> = ({
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
}) => {
    const { t } = useTranslation('user');
    const hasActiveFilters = Boolean(searchTerm || locationFilter || positionFilter || minWage);

    const suggestions = [
        "Java fejlesztő Budapesten 600e felett",
        "Részmunkaidős adminisztráció",
        "Diákmunka amihez nem kell tapasztalat",
        "Szakács állás Balaton környékén"
    ];

    return (
        <form className={`${styles.searchForm} ${isAISearchActive ? styles.aiFormActive : ""}`} onSubmit={onSubmit}>
            <div className={styles.topBar}>
                <div className={`${styles.searchBarWrapper} ${isAISearchActive ? styles.searchBarAIActive : ""}`}>
                    <Search size={20} className={styles.inputIcon} />
                    <InputField
                        type="text"
                        placeholder={isAISearchActive ? t('jobs.list.ai.inputPlaceholder') : t('jobs.list.ai.inputPlaceholderDefault')}
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className={`${styles.searchInput} ${isAISearchActive ? styles.aiActiveInput : ""}`}
                    />
                </div>
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

            {isAISearchActive && (
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
            )}

            <div className={styles.filtersBar}>
                <div className={`${styles.collapsibleGrid} ${isAISearchActive ? styles.collapsed : ""}`}>
                    <div className={styles.collapsibleContent}>
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
                    </div>
                </div>

                <div className={`${styles.filterGroup} ${styles.wageGroup} ${isAISearchActive ? styles.wageGroupAI : ""}`}>
                    <Search size={20} className={styles.inputIcon} />
                    <InputField
                        type="number"
                        min={0}
                        placeholder={t('jobs.list.ai.wagePlaceholder')}
                        value={minWage}
                        onChange={(e) => onMinWageChange(e.target.value)}
                        className={styles.filterControl}
                    />
                    {isAISearchActive && <span className={styles.constraintLabel}>Bér-korlát</span>}
                </div>

                <div className={styles.actions}>
                    <Button 
                        type="submit" 
                        color={"orion-blue"} 
                        className={`${styles.searchButton} ${isAISearchActive ? styles.searchButtonAI : ""}`}
                    >
                        {isAISearchActive ? t('jobs.list.ai.buttonLabel') : t('jobs.list.ai.buttonLabelDefault')}
                    </Button>

                    <button
                        type="button"
                        onClick={onClear}
                        className={styles.clearButton}
                        disabled={!hasActiveFilters}
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>
        </form>
    );
};

export default FilterBar;
