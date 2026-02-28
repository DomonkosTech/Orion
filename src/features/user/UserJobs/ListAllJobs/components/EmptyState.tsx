import React from "react";
import styles from "./EmptyState.module.css";
import Button from "../../../../../components/Button/Button.tsx";
import { Trans } from "react-i18next";

type Props = {
    onClear: () => void;
};

const EmptyState: React.FC<Props> = ({ onClear }) => {
    return (
        <div className={styles.container}>
            <div className={styles.iconWrapper}>
                🔍
            </div>
            <h3 className={styles.title}>
                <Trans i18nKey="jobs.list.empty.title">
                    Nincs találat a keresésre
                </Trans>
            </h3>
            <p className={styles.description}>
                <Trans i18nKey="jobs.list.empty.description">
                    Sajnos nem találtunk olyan állást, ami megfelelne a beállított szűrőknek.
                    Próbálja meg módosítani a keresési feltételeket vagy törölje a szűrőket.
                </Trans>
            </p>

            <div className={styles.buttonWrapper}>
                <Button type="button" variant="secondary" onClick={onClear}>
                    <Trans i18nKey="jobs.list.empty.clearFilters">
                        Szűrők törlése
                    </Trans>
                </Button>
            </div>
        </div>
    );
};

export default EmptyState;
