import { supabase } from "../../lib/supabaseClient.ts";
import { companyUpdateProfileSchema } from "../../validation/Validation.ts";
import { createSystemMessage } from "./systemmessageService.ts";

// Interface for company profile data, allowing partial updates
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
    // 1. Fetch basic company data from the 'companies' table
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
    // 1. Validate input data using Zod schema for data integrity
    const validation = companyUpdateProfileSchema.safeParse(data);
    if (!validation.success) {
        throw new Error(validation.error.errors[0].message);
    }

    // 2. Update specific fields in the 'companies' table
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
    // 1. Get company statistics using a Supabase RPC function
    const { data: stats, error } = await supabase
        .rpc('get_company_dashboard_stats', { target_company_id: companyId });

    if (error) {
        console.error("error getting company stats:", error);
    }

    // 2. Get the last 4 job applications for the company
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
    // 1. Fetch employee records from the 'employees' table
    const { data: employees, error: error } = await supabase
        .from("employees")
        .select("*, users( email, lname, fname)")
        .eq("company_id", companyId)
        .order("hire_date", { ascending: false });

    if (error) throw error;
    return employees;
}

// delete employee
export const deleteEmployee = async (employeeId: number, companyId: number) => {
    // 1. Delete the employee record from the 'employees' table
    const { data, error } = await supabase
        .from("employees")
        .delete()
        .eq("id", employeeId) // Match by employee ID
        .eq("company_id", companyId) // Ensure it belongs to the correct company
        .select('*') // Select the deleted record to return it

    if (error) throw error

    // 2. Check if an employee was actually found and deleted
    if (!data || data.length === 0) {
        throw new Error("Employee not found")
    }

    // 3. Create a system message for the user whose employment was terminated
    createSystemMessage(
        data[0].user_id,
        'Munkaviszony megszűnése!',
        `Tájékoztatjuk, hogy partnercégünknél a(z) ${data[0].position} pozícióban fennálló munkaviszonya megszűnt. Amennyiben szeretné, segítünk új álláslehetőséget találni.`,
        'USER'
    )

    return { success: true, deletedEmployee: data[0] }
}
