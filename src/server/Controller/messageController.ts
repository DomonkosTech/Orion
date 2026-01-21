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