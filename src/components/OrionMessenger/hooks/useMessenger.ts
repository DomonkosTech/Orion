import { useMessengerContext } from "../context/MessengerContext";

export const useMessenger = () => {
    const context = useMessengerContext();
    return {
        partners: context.partners,
        partnersLoading: context.partnersLoading,
        partnersError: context.partnersError,
        selectedCompanyId: context.selectedPartnerId,
        setSelectedCompanyId: context.setSelectedPartnerId,
        selectedCompany: context.selectedPartner ? {
            company_id: context.selectedPartner.id,
            company_name: context.selectedPartner.name,
            last_message_at: context.selectedPartner.last_message_at
        } : null,
        messages: context.messages,
        messagesLoading: context.messagesLoading,
        messagesError: context.messagesError,
        sendMessage: context.sendMessage,
        sending: context.sending,
        sendError: context.sendError,
        lastReadUserMessageId: context.lastReadUserMessageId
    };
};