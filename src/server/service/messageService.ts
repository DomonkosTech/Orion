import { supabase } from "../../lib/supabaseClient.ts";


// get user chat partners
export const getUserChatPartners = async (userId: number) => {
    // 1. Call a Supabase Remote Procedure Call (RPC) to get chat partners.
    // This RPC is expected to handle the logic of finding distinct partners and their last messages.
    const { data: partners, error } = await supabase
        .rpc('get_user_chat_partners', { p_user_id: userId });

    if (error) throw error;

    return partners;
};

// get company chat partners
export const getCompanyChatPartners = async (companyId: number) => {
    // 1. Fetch all messages associated with the company, ordered by creation date descending.
    const { data: messages, error } = await supabase
        .from('messages')
        .select('user_id, message, is_read, sender_type, created_at')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

    if (error) throw error;

    // 2. Use a Map to store only the latest message for each unique user.
    const latestByUser = new Map<number, {
        user_id: number;
        message: string;
        is_read: boolean;
        sender_type: "USER" | "COMPANY";
        created_at: string;
    }>();

    for (const row of messages ?? []) {
        // If a user's message hasn't been added yet, it means this is their latest message due to sorting.
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

    // 3. Fetch user details (name) for all identified chat partners.
    const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, lname, fname')
        .in('id', userIds);

    if (usersError) throw usersError;

    // 4. Create a map for quick lookup of user details.
    const userMap = new Map((users ?? []).map((user) => [user.id, user]));

    // 5. Combine latest message data with user details to form the final list of chat partners.
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

// get chat messages
export const getChatMessages = async (userId: number, companyId:number, readerType: string) => {
    // 1. Fetch all messages between the specified user and company, ordered by creation time.
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', userId)
        .eq('company_id', companyId)
        .order('created_at', { ascending: true });

    if (error) throw error;

    // 2. Determine the sender type whose messages should be marked as read (the other party).
    const messageSenderType =
        readerType === 'USER' ? 'COMPANY' : 'USER';

    // 3. Mark messages sent by the other party as read.
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

// send message
export const sendMessage = async (userId: number, companyId: number, message: string, senderType: string) => {
    // 1. Insert the new message into the 'messages' table.
    const { data, error } = await supabase
        .from('messages')
        .insert({
            user_id: userId,
            company_id: companyId,
            message: message,
            sender_type: senderType
        }).select();
    if (error) throw error;

    return data;
};
