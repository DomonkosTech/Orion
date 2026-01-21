import { supabase } from "../../lib/supabaseClient.ts";



export const getAllUserChatPartners = async (userId: number) => {
    const { data: partners, error } = await supabase
        .rpc('get_user_chat_partners', { p_user_id: userId });

    if (error) throw error

    return partners
}

export const getAllCompanyChatPartners = async (companyId: number) => {
    const { data: partners, error } = await supabase
        .rpc('get_company_chat_partners', { p_company_id: companyId });

    if (error) throw error

    return partners
}

export const getChatMessages = async (userId: number, companyId:number, readerType: string) => {
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', userId)
        .eq('company_id', companyId)
        .order('created_at', { ascending: true });

    if (error) throw error;

    const messageSenderType =
        readerType === 'USER' ? 'COMPANY' : 'USER';


    const {error: updateError} = await supabase
        .from('messages')
        .update({
            is_read: true
        })
        .eq('user_id', userId)
        .eq('company_id', companyId)
        .eq('sender_type', messageSenderType)
        .eq('is_read', false);

    if (updateError) throw updateError;

    return data;
};