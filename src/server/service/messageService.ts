import { supabase } from "../../lib/supabaseClient.ts";



export const getUserChatPartners = async (userId: number) => {
    const { data: partners, error } = await supabase
        .rpc('get_user_chat_partners', { p_user_id: userId });

    if (error) throw error

    return partners
}

export const getCompanyChatPartners = async (companyId: number) => {
    const { data: messages, error } = await supabase
        .from('messages')
        .select('user_id, message, is_read, sender_type, created_at')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

    if (error) throw error;

    const latestByUser = new Map<number, {
        user_id: number;
        message: string;
        is_read: boolean;
        sender_type: "USER" | "COMPANY";
        created_at: string;
    }>();

    for (const row of messages ?? []) {
        if (!latestByUser.has(row.user_id)) {
            latestByUser.set(row.user_id, row as {
                user_id: number;
                message: string;
                is_read: boolean;
                sender_type: "USER" | "COMPANY";
                created_at: string;
            });
        }
    }

    const userIds = Array.from(latestByUser.keys());
    if (userIds.length === 0) return [];

    const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, lname, fname')
        .in('id', userIds);

    if (usersError) throw usersError;

    const userMap = new Map((users ?? []).map((user) => [user.id, user]));

    return userIds
        .map((userId) => {
            const latest = latestByUser.get(userId);
            const user = userMap.get(userId);

            if (!latest || !user) return null;

            return {
                user_id: userId,
                user_lname: user.lname,
                user_fname: user.fname,
                last_message_at: latest.created_at,
                message: latest.message,
                is_read: latest.sender_type === "COMPANY" ? true : latest.is_read,
                sender_type: latest.sender_type,
            };
        })
        .filter((partner): partner is {
            user_id: number;
            user_lname: string;
            user_fname: string;
            last_message_at: string;
            message: string;
            is_read: boolean;
            sender_type: "USER" | "COMPANY";
        } => partner !== null);
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

export const sendMessage = async (userId: number, companyId: number, message: string, senderType: string) => {
    const { data, error } = await supabase
        .from('messages')
        .insert({
            user_id: userId,
            company_id: companyId,
            message: message,
            sender_type: senderType
        }).select();
    if (error) throw error;

    return data
}
