import React from "react";
import { useMessenger } from "../hooks/useMessenger";
import ConversationItem from "./ConversationItem";
import styles from "../MessengerPage.module.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

const ConversationList: React.FC = () => {
  const { partners, partnersLoading, partnersError, selectedCompanyId, setSelectedCompanyId } = useMessenger();
  const navigate = useNavigate();
  const { userType } = useAuth();
  const { t } = useTranslation('components');
  
  const handleBack = () => {
      if (userType === "company") {
          navigate("/company");
      } else {
          navigate("/userhomepage");
      }
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
          <button onClick={handleBack} className={styles.headerBackButton} title={t('conversationList.back')}>
              <ArrowLeft size={24} />
          </button>
          {t('conversationList.title')}
      </div>
      {partnersLoading && <div className={`${styles.sidebarState} ${styles.loadingState}`}>{t('conversationList.loading')}</div>}
      {partnersError && <div className={styles.sidebarState} style={{ color: "#ef4444" }}>{partnersError}</div>}
      {!partnersLoading && !partnersError && partners.length === 0 && (
        <div className={styles.sidebarState}>{t('conversationList.empty')}</div>
      )}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {partners.map((p, index) => (
          <ConversationItem
            key={p.company_id}
            partner={p}
            isActive={p.company_id === selectedCompanyId}
            onClick={() => setSelectedCompanyId(p.company_id)}
            style={{ animationDelay: `${index * 100}ms` }}
          />
        ))}
      </div>
    </aside>
  );
};

export default ConversationList;