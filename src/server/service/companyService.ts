import { supabase } from "../../lib/supabaseClient.ts";
import { companyUpdateProfileSchema } from "../../validation/Validation.ts";
import { createSystemMessage } from "./systemmessageService.ts";

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
    // Zod validation
    const validation = companyUpdateProfileSchema.safeParse(data);
    if (!validation.success) {
        throw new Error(validation.error.errors[0].message);
    }

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

// Get company stats
export const getCompanyStats = async (companyId: number) => {

    // get company stats from the database using the RPC function
    const { data: stats, error } = await supabase
        .rpc('get_company_dashboard_stats', { target_company_id: companyId });

    if (error) {
        console.error("error getting company stats:", error);
    }

    // get last 4 job applications from the database
    const { data: lastApplications, error: err } = await supabase
        .from("job_applications")
        .select(`last_updated, users (fname, lname), advertisement!inner (title,company_id)`)
        .eq("advertisement.company_id", companyId)
        .order("last_updated", { ascending: false })
        .limit(4);

    if (err) throw err;

    return { stats, lastApplications };

}

// show employees
export const getEmployees = async (companyId: number) => {
    const { data: employees, error: error } = await supabase
        .from("employees")
        .select("*, users( email, lname, fname)")
        .eq("company_id", companyId)
        .order("position");

    if (error) throw error;
    return employees;
}

// delete employee
export const deleteEmployee = async (employeeId: number, companyId: number) => {
    const { data, error } = await supabase
        .from("employees")
        .delete()
        .eq("id", employeeId)
        .eq("company_id", companyId)
        .select('*')

    if (error) throw error

    if (!data || data.length === 0) {
        throw new Error("Employee not found")
    }

    createSystemMessage(data[0].user_id, 'Munkaviszony megszűnése!', `Tájékoztatjuk, hogy partnercégünknél a(z) ${data[0].position} pozícióban fennálló munkaviszonya megszűnt. Amennyiben szeretné, segítünk új álláslehetőséget találni.`, 'USER')

    return { success: true, deletedEmployee: data[0] }
}
