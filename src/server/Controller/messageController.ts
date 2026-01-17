import { supabase } from "../../lib/supabaseClient.ts";


// get system messages for user
export const getusersystemmessages = async (companyId: number) => {
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
        .or(`target_type.eq.ALL,target_type.eq.COMPANY`)
        .eq("target_id", companyId);

    if (allError) throw allError;

    const filtered = allMessages?.filter(msg => !readIds.includes(msg.id)) || [];

    return filtered.sort((a, b) => (new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
};