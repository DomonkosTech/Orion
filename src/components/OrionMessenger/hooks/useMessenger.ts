import { useMessengerContext } from "../context/MessengerContext";

export const useMessenger = () => {
    return useMessengerContext();
};