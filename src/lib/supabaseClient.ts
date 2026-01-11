
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();


const supabaseUrl = "https://nlabffngmifszpwrqetx.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

