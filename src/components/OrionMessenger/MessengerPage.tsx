import React from "react";
import { MessengerProvider } from "./context/MessengerContext";
import ConversationList from "./components/ConversationList";
import ChatWindow from "./components/ChatWindow";
import styles from "./MessengerPage.module.css";
import { Header } from "../Header/Header";

const MessengerPage: React.FC = () => {

    return (
        <div className={styles.pageWrapper}>
            <MessengerProvider>
                <Header/>
                <div className={styles.container}>
                    <ConversationList />
                    <ChatWindow />
                </div>
            </MessengerProvider>
        </div>
    );
};

export default MessengerPage;