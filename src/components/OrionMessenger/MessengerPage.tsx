import React from "react";
import { MessengerProvider } from "./context/MessengerContext";
import ConversationList from "./components/ConversationList";
import ChatWindow from "./components/ChatWindow";
import styles from "./MessengerPage.module.css";
import { Header } from "../Header/Header";
import { useMessenger } from "./hooks/useMessenger";

const MessengerLayout: React.FC = () => {
    const { selectedCompanyId } = useMessenger();

    return (
        <div className={`${styles.container} ${selectedCompanyId ? styles.chatActive : ''}`}>
            <ConversationList />
            <ChatWindow />
        </div>
    );
};

const MessengerPage: React.FC = () => {

    return (
        <div className={styles.pageWrapper}>
            <MessengerProvider>
                <Header/>
                <MessengerLayout />
            </MessengerProvider>
        </div>
    );
};

export default MessengerPage;