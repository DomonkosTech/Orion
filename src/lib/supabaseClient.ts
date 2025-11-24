import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://nlabffngmifszpwrqetx.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sYWJmZm5nbWlmc3pwd3JxZXR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NjA3MjMsImV4cCI6MjA3NTQzNjcyM30.IEH4RRFex_Apkay3DIxGoAHrQ9Dtsr46XMKo2zdzPzU";
export const supabase = createClient(supabaseUrl, supabaseKey);