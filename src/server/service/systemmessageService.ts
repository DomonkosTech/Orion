import { supabase } from "../../lib/supabaseClient.ts";

// get system messages for the company
export const getCompanySystemMessages = async (companyId: number) => {
    // 1. Fetch IDs of messages already read by this company.
    const { data: readMessages, error: readError } = await supabase
        .from("system_message_reads")
        .select("message_id")
        .eq("target_type", "COMPANY")
        .eq("target_id", companyId);

    if (readError) throw readError;

    const readIds = readMessages?.map(r => r.message_id) || [];

    // 2. Fetch all system messages relevant to this company (either 'ALL' or specifically for this company).
    const { data: allMessages, error: allError } = await supabase
        .from("system_messages")
        .select("*")
        .or(`target_type.eq.ALL,and(target_type.eq.COMPANY,target_id.eq.${companyId})`);

    if (allError) throw allError;

    // 3. Filter out messages that have already been read by the company.
    const filtered = allMessages?.filter(msg => !readIds.includes(msg.id)) || [];

    // 4. Sort the unread messages by creation date, newest first.
    return filtered.sort((a, b) => (new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
};

// get system messages for the user
export const getUserSystemMessages = async (userId: number) => {
    // 1. Fetch IDs of messages already read by this user.
    const { data: readMessages, error: readError } = await supabase
        .from("system_message_reads")
        .select("message_id")
        .eq("target_type", "USER")
        .eq("target_id", userId);

    if (readError) throw readError;

    const readIds = readMessages?.map(r => r.message_id) || [];

    // 2. Fetch all system messages relevant to this user (either 'ALL' or specifically for this user).
    const { data: allMessages, error: allError } = await supabase
        .from("system_messages")
        .select("*")
        .or(`target_type.eq.ALL,and(target_type.eq.USER,target_id.eq.${userId})`);

    if (allError) throw allError;

    // 3. Filter out messages that have already been read by the user.
    const filtered = allMessages?.filter(msg => !readIds.includes(msg.id)) || [];

    // 4. Sort the unread messages by creation date, newest first.
    return filtered.sort((a, b) => (new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
};

// read system message
export const markSystemMessageAsRead = async (targetId: number, messageId: number, targetType: string) => {
    // 1. Insert a record into the 'system_message_reads' table to mark the message as read.
    const { error } = await supabase
        .from("system_message_reads")
        .insert({
            message_id: messageId,
            target_type: targetType,
            target_id: targetId
            });

    if (error) throw error;
    return true;
}

// create a system message
export const createSystemMessage = async (targetId: number, title: string, message: string, targetType: string) => {
    // 1. Validate the target type to ensure it's one of the allowed values.
    if (targetType ==='ALL' || targetType === 'USER' || targetType === 'COMPANY'){
        // 2. Insert the new system message into the 'system_messages' table.
        const { error } = await supabase
            .from("system_messages")
            .insert({
                title: title,
                message: message,
                target_type: targetType,
                target_id: targetId
            });
        if (error) throw error;
    }

    return true;
}
