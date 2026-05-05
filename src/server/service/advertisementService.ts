import { supabase } from "../../lib/supabaseClient.ts";

interface AdvertisementData {
    title: string;
    position: string;
    location: string;
    hourly_wage: number;
    tasks: string;
    requirements: string;
    is_active: boolean;
    job_description: string;
}

// Create a new advertisement
export const createAdvertisement = async (companyId: number, data: AdvertisementData) => {
    const { title, position, location, hourly_wage, tasks, requirements, is_active, job_description } = data;

    // 1. Validate required fields
    if (!title || !position || !location || !job_description) {
        throw new Error("Please fill in all required fields.");
    }

    // 2. Validate hourly wage
    if (hourly_wage && hourly_wage < 0) {
        throw new Error("Hourly wage cannot be negative.");
    }

    // 3. Check advertisement limit (max 3 per company)
    const { count, error: counterror } = await supabase
        .from("advertisement")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true)
        .eq("company_id", companyId);


    if (counterror) throw counterror;

    if (count! >= 3) {
        throw new Error("You have reached the maximum limit of 3 advertisements. Please delete one to create a new one.");
    }

    // 4. Insert the new advertisement
    const { data: advertisement, error } = await supabase
        .from("advertisement")
        .insert([
            {
                title,
                position,
                location,
                hourly_wage,
                tasks,
                requirements,
                is_active: is_active ?? true,
                company_id: companyId,
                job_description,
            }
        ])
        .select()
        .single();

    if (error) throw error;

    return advertisement;
};

// Get all advertisements for a specific company
export const getCompanyAdvertisements = async (companyId: number) => {
    const { data, error } = await supabase
        .from("advertisement")
        .select("id, title, position, is_active")
        .eq("company_id", companyId)
        .order("id", { ascending: false });

    if (error) throw error;
    return data;
};

// Get a single advertisement by ID
export const getAdvertisementById = async (id: string) => {
    const { data: advertisement, error } = await supabase
        .from("advertisement")
        .select('id, title, position, location, hourly_wage, tasks, requirements, is_active, created_at, company_id, job_description, click_count, company:companies(name)')
        .eq("id", id)
        .maybeSingle();

    if (error) throw error;
    return advertisement;
};

// Update an existing advertisement
export const updateAdvertisement = async (id: string, companyId: number, data: Partial<AdvertisementData>) => {
    const { data: updatedAdvertisement, error } = await supabase
        .from("advertisement")
        .update({
            title: data.title,
            position: data.position,
            location: data.location,
            hourly_wage: data.hourly_wage,
            tasks: data.tasks,
            requirements: data.requirements,
            job_description: data.job_description,
        })
        .eq("id", id)
        .eq("company_id", companyId)
        .select()
        .single();

    if (error) throw error;
    return updatedAdvertisement;
};

// Get all active advertisements (for users)
export const getAllAdvertisements = async () => {
    const { data: advertisements, error } = await supabase
        .from("advertisement")
        .select("id,title,position,location,hourly_wage,tasks,requirements,job_description")
        .eq('is_active', true)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return advertisements;
};

// Get all top active advertisements
export const getTopAdvertisements = async () => {
    const { data: advertisements, error } = await supabase
        .from("advertisement")
        .select("id,title,position,location,hourly_wage,tasks,requirements,job_description")
        .eq('is_active', true)
        .order("created_at", { ascending: false })
        .limit(3);

    if (error) throw error;
    return advertisements;
};

// get selected jobs
export const getAdvertisementsByIds = async (ids: number[]) => {
    const { data: advertisements, error } = await supabase
        .from("advertisement")
        .select("id,title,position,location,hourly_wage,tasks,requirements,job_description")
        .in("id", ids)
        .eq('is_active', true)
        .limit(10);

    if (error) throw error;
    return advertisements;
}

// update the click number
export const incrementClickCount = async (id: string) => {
    const { error } = await supabase.rpc("increment_click_count", {
        ad_id: id
    });

    if (error) throw error;
};

// update advertisement status
export const updateAdvertisementStatus = async (id: string, status: boolean, companyId: number) => {
    if (status) {
        const { count, error: countError } = await supabase
            .from("advertisement")
            .select("*", { count: "exact", head: true })
            .eq("is_active", true)
            .eq("company_id", companyId);

        if (countError) throw countError;

        if (count! >= 3) {
            throw new Error("You have reached the maximum limit of 3 active advertisements. Please deactivate one to activate this one.");
        }
    }

    const { error } = await supabase
        .from("advertisement")
        .update({ is_active: status })
        .eq("id", id)
        .eq("company_id", companyId);

    if (error) throw error;
}

// Get all active advertisements (for users)
export const searchAdvertisements = async (q: string, location: string, position: string, hourly_wage: number, page: number, limit: number) => {
    let query = supabase
        .from("advertisement")
        .select("id,title,position,location,hourly_wage,tasks,requirements,job_description")
        .order("created_at", { ascending: false })
        .eq('is_active', true)

    if (q) {
        query = query.ilike("title", `%${q}%`)
    }
    if (location) {
        query = query.eq("location", location)
    }
    if (position) {
        query = query.eq("position", position)
    }
    if (hourly_wage) {
        query = query.gte("hourly_wage", hourly_wage)
    }
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: advertisements, error } = await query.range(from, to)

    if (error) throw error;
    return { advertisements};
};
