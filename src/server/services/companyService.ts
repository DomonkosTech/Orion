import { supabase } from "../../lib/supabaseClient.ts";

interface CompanyProfileData {
    name?: string;
    phone_number?: string;
    address?: string;
    tax_number?: string;
    contact_person_name?: string;
    activity_scope?: string;
    website?: string;
    short_description?: string;
}

// Fetch company profile data by ID
export const getCompanyProfile = async (companyId: number) => {
    // Fetch basic company data from the database
    const { data: company, error } = await supabase
        .from("companies")
        .select("*")
        .eq("id", companyId)
        .maybeSingle();

    if (error) throw error;
    return company;
};

// Update company profile data
export const updateCompanyProfile = async (companyId: number, data: CompanyProfileData) => {
    // Update specific fields in the companies table
    const { data: updatedCompany, error } = await supabase
        .from("companies")
        .update({
            name: data.name,
            phone_number: data.phone_number,
            address: data.address,
            tax_number: data.tax_number,
            contact_person_name: data.contact_person_name,
            activity_scope: data.activity_scope,
            website: data.website,
            short_description: data.short_description
        })
        .eq("id", companyId)
        .select()
        .single();

    if (error) throw error;
    return updatedCompany;
};
