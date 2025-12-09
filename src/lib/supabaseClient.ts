
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://nlabffngmifszpwrqetx.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sYWJmZm5nbWlmc3pwd3JxZXR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTg2MDcyMywiZXhwIjoyMDc1NDM2NzIzfQ.q-Rhzv3VCnyiZKIhzNjFMyAjzgXCj8D8rJ7mVoTxgVg";

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

