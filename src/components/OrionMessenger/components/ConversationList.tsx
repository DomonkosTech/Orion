import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMessenger } from "../hooks/useMessenger";
import ConversationItem from "./ConversationItem";
import styles from "../MessengerPage.module.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2
    }
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  show: { 
    opacity: 1, 
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  },
  exit: { opacity: 0, x: -10 }
};

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
          <motion.button 
            whileHover={{ scale: 1.1, x: -2, backgroundColor: "rgba(241, 245, 249, 1)" }}
            whileTap={{ scale: 0.9 }}
            onClick={handleBack} 
            className={styles.headerBackButton} 
            title={t('conversationList.back')}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
              <ArrowLeft size={24} />
          </motion.button>
          <motion.span 
            layout
            style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600 }}
          >
              {t('conversationList.title')}
          </motion.span>
      </div>
      <AnimatePresence mode="wait">
        {partnersLoading && (
          <motion.div 
            key="loading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`${styles.sidebarState} ${styles.loadingState}`}
          >
            {t('conversationList.loading')}
          </motion.div>
        )}
        {partnersError && (
          <motion.div 
            key="error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={styles.sidebarState} 
            style={{ color: "#ef4444" }}
          >
            {partnersError}
          </motion.div>
        )}
        {!partnersLoading && !partnersError && partners.length === 0 && (
          <motion.div 
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={styles.sidebarState}
          >
            {t('conversationList.empty')}
          </motion.div>
        )}
        {!partnersLoading && !partnersError && partners.length > 0 && (
          <motion.div 
            key="list"
            variants={listVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}
          >
            {partners.map((p) => (
              <motion.div key={p.id} variants={itemVariants} layout>
                <ConversationItem
                  partner={p}
                  isActive={p.id === selectedCompanyId}
                  onClick={() => setSelectedCompanyId(p.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
};

export default ConversationList;