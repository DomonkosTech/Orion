import styles from "./BannerKicker.module.css";
import { useTranslation, Trans } from "react-i18next";

interface BannerKickerProps {
    children: React.ReactNode;
}

const BannerKicker = ({ children }: BannerKickerProps) => {
    const { t } = useTranslation('components');
    return (
        <div className={styles.bannerKicker}>
            <Trans i18nKey="bannerKicker.text" t={t}>
                Orion • {{children}}
            </Trans>
        </div>
    );
};

export default BannerKicker;