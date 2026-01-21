import { supabase } from "../../lib/supabaseClient.ts";




////////////////////////////////////
//             company            //
////////////////////////////////////

// get system messages for the company
export const getcompanysystemmessages = async (companyId: number) => {
    const { data: readMessages, error: readError } = await supabase
        .from("system_message_reads")
        .select("message_id")
        .eq("target_type", "COMPANY")
        .eq("target_id", companyId);

    if (readError) throw readError;

    const readIds = readMessages?.map(r => r.message_id) || [];

    const { data: allMessages, error: allError } = await supabase
        .from("system_messages")
        .select("*")
        .or(`target_type.eq.ALL,and(target_type.eq.COMPANY,target_id.eq.${companyId})`);

    if (allError) throw allError;

    const filtered = allMessages?.filter(msg => !readIds.includes(msg.id)) || [];

    return filtered.sort((a, b) => (new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
};








////////////////////////////////////
//              user              //
////////////////////////////////////

// get system messages for the user
export const getusersystemmessages = async (userId: number) => {
    const { data: readMessages, error: readError } = await supabase
        .from("system_message_reads")
        .select("message_id")
        .eq("target_type", "USER")
        .eq("target_id", userId);

    if (readError) throw readError;

    const readIds = readMessages?.map(r => r.message_id) || [];

    const { data: allMessages, error: allError } = await supabase
        .from("system_messages")
        .select("*")
        .or(`target_type.eq.ALL,and(target_type.eq.USER,target_id.eq.${userId})`);

    if (allError) throw allError;

    const filtered = allMessages?.filter(msg => !readIds.includes(msg.id)) || [];

    return filtered.sort((a, b) => (new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
};


// read system message
export const readsystemmessage = async (targetId: number, messageId: number, targetType: string) => {
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