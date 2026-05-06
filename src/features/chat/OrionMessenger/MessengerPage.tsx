import React from "react";
import { motion } from "framer-motion";
import { MessengerProvider } from "./context/MessengerContext";
import ConversationList from "./components/ConversationList";
import ChatWindow from "./components/ChatWindow";
import styles from "./MessengerPage.module.css";
import { useMessenger } from "./hooks/useMessenger";

const MessengerLayout: React.FC = () => {
    const { selectedCompanyId } = useMessenger();

    return (
        <motion.div 
            layout
            className={`${styles.container} ${selectedCompanyId ? styles.chatActive : ''}`}
        >
            <ConversationList />
            <ChatWindow />
        </motion.div>
    );
};

const MessengerPage: React.FC = () => {

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={styles.pageWrapper}
        >
            <MessengerProvider>
                <MessengerLayout />
            </MessengerProvider>
        </motion.div>
    );
};

export default MessengerPage;