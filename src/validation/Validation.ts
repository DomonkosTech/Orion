import { z } from "zod";

// --- Reusable Logic ---
export const passwordConfirmRefinement = (data: any, ctx: z.RefinementCtx) => {
    if (data.confirmPassword !== data.password) {
        ctx.addIssue({
            code: "custom",
            message: "A jelszavak nem egyeznek",
            path: ["confirmPassword"],
        });
    }
};


const authBase = z.object({
    email: z.string().email("Érvénytelen email cím"),
    password: z.string()
        .min(8, "A jelszónak legalább 8 karakternek kell lennie")
        .regex(/[a-z]/, "Tartalmaznia kell legalább egy kisbetűt")
        .regex(/[A-Z]/, "Tartalmaznia kell legalább egy nagybetűt")
        .regex(/[0-9]/, "Tartalmaznia kell legalább egy számot")
        .regex(/[^a-zA-Z0-9]/, "Tartalmaznia kell legalább egy speciális szimbólumot"),
    confirmPassword: z.string(),
});

// --- User Registration ---
export const userRegisterObject = authBase.extend({
    lname: z.string().min(2, "Vezetéknév legalább 2 karakter").regex(/^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ\s]+$/, "A mező csak betűket tartalmazhat"),
    fname: z.string().min(2, "Keresztnév legalább 2 karakter").regex(/^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ\s]+$/, "A mező csak betűket tartalmazhat"),
    birth_place: z.string().min(2, "Születési hely legalább 2 karakter"),
    birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Érvénytelen dátum"),
    address: z.string().min(5, "A cím legalább 5 karakter"),
    phone_number: z.string().regex(/^[0-9+\s-]{7,20}$/, "Érvénytelen telefonszám"),
    tax_number: z.string().trim().min(1, "Az adószám kötelező").regex(/^[0-9-]+$/i, "Az adószám csak számokat és kötőjelet tartalmazhat"),
    nationality: z.string().min(5, "A nemzetiseg legalább 5 karakter").regex(/^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ\s]+$/, "A mező csak betűket tartalmazhat"),
    qualifications: z.string().min(10, "A végzettségek legalább 10 karakter"),
    short_bio: z.string().min(10, "A bemutatkozás legalább 10 karakter").max(250, "A bemutatkozás maximum 250 karakter lehet"),
    personal_id: z.string().length(8, "A személyi igazolvány számnak pontosan 8 karakternek kell lennie").regex(/^\d{6}[A-Z]{2}$/, "Érvénytelen formátum"),
    address_card_number: z.string().length(8, "A lakcímkártya számnak pontosan 8 karakternek kell lennie").regex(/^\d{6}[A-Z]{2}$/, "Érvénytelen formátum"),
    terms_accepted: z.literal(true, { errorMap: () => ({ message: "El kell fogadnia a feltételeket" }) }),
});

export const userRegisterSchema = userRegisterObject.superRefine(passwordConfirmRefinement);

// --- Company Registration ---
    export const companyRegisterObject = authBase.extend({
    name: z.string().min(2, "A cégnév legalább 2 karakter"),
    address: z.string().min(5, "A cím legalább 5 karakter"),
    tax_number: z.string().trim().length(13, "Az adószám pontosan 13 karakter").regex(/^\d{8}-\d{1}-\d{2}$/, "Helyes alak: 12345678-X-YY"),
    contact_person_name: z.string().min(2, "Kapcsolattartó neve legalább 2 karakter").regex(/^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ\s]+$/, "A mező csak betűket tartalmazhat"),
    activity_scope: z.string().min(15, "Tevékenységi kör megadása kötelező (min. 15 karakter)"),
    website: z.string().trim().optional().refine((v) => !v || /^https?:\/\//i.test(v) || /^[\w.-]+\.[a-z]{2,}$/i.test(v), "Érvénytelen weboldal cím"),
    short_description: z.string().min(10, "A leírás legalább 10 karakter").max(500, "Maximum 500 karakter"),
    phone_number: z.string().regex(/^[0-9+\s-]{7,20}$/, "Érvénytelen telefonszám"),
    terms_accepted: z.literal(true, { errorMap: () => ({ message: "El kell fogadnia a feltételeket" }) }),
});

export const companyRegisterSchema = companyRegisterObject.superRefine(passwordConfirmRefinement);

// --- Login Validation ---
export const loginSchema = z.object({
    email: z.string().email("Érvénytelen email cím formátum"),
    password: z.string().min(4, "A jelszó megadása kötelező"),
    rememberMe: z.boolean(),
});

// --- User Profile Update (Partial fields) ---
export const userUpdateProfileSchema = z.object({
    email: z.string().email("Érvénytelen email cím").optional(),
    lname: z.string().min(2, "Vezetéknév legalább 2 karakter").regex(/^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ\s]+$/, "A mező csak betűket tartalmazhat").optional(),
    fname: z.string().min(2, "Keresztnév legalább 2 karakter").regex(/^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ\s]+$/, "A mező csak betűket tartalmazhat").optional(),
    birth_place: z.string().min(2, "Születési hely legalább 2 karakter").optional(),
    birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Érvénytelen dátum").optional(),
    address: z.string().min(5, "A cím legalább 5 karakter").optional(),
    phone_number: z.string().regex(/^[0-9+\s-]{7,20}$/, "Érvénytelen telefonszám").optional(),
    tax_number: z.string().trim().regex(/^[0-9-]+$/i, "Az adószám csak számokat és kötőjelet tartalmazhat").optional(),
    nationality: z.string().min(5, "A nemzetiseg legalább 5 karakter").regex(/^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ\s]+$/, "A mező csak betűket tartalmazhat").optional(),
    qualifications: z.string().min(10, "A végzettségek legalább 10 karakter").optional(),
    short_bio: z.string().min(10, "A bemutatkozás legalább 10 karakter").max(250, "A bemutatkozás maximum 250 karakter lehet").optional(),
    documents: z.object({
        personal_id: z.string().length(8, "A személyi igazolvány számnak pontosan 8 karakternek kell lennie").regex(/^\d{6}[A-Z]{2}$/, "Érvénytelen formátum"),
        address_card_number: z.string().length(8, "A lakcímkártya számnak pontosan 8 karakternek kell lennie").regex(/^\d{6}[A-Z]{2}$/, "Érvénytelen formátum"),
    }).optional(),
});

// --- Company Profile Update (Partial fields) ---
export const companyUpdateProfileSchema = z.object({
    name: z.string().min(2, "A cégnév legalább 2 karakter").optional(),
    address: z.string().min(5, "A cím legalább 5 karakter").optional(),
    tax_number: z.string().length(13, "Az adószám pontosan 13 karakter").regex(/^\d{8}-\d{1}-\d{2}$/, "Helyes alak: 12345678-X-YY").optional(),
    contact_person_name: z.string().min(2, "Kapcsolattartó neve legalább 2 karakter").regex(/^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ\s]+$/, "A mező csak betűket tartalmazhat").optional(),
    activity_scope: z.string().min(15, "Tevékenységi kör megadása kötelező (min. 15 karakter)").optional(),
    website: z.string().trim().optional().refine((v) => !v || /^https?:\/\//i.test(v) || /^[\w.-]+\.[a-z]{2,}$/i.test(v), "Érvénytelen weboldal cím"),
    short_description: z.string().min(10, "A leírás legalább 10 karakter").max(500, "Maximum 500 karakter").optional(),
    phone_number: z.string().regex(/^[0-9+\s-]{7,20}$/, "Érvénytelen telefonszám").optional(),
});

// --- Type Exports ---
export type UserRegisterInput = z.infer<typeof userRegisterSchema>;
export type CompanyRegisterInput = z.infer<typeof companyRegisterSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UserUpdateProfileInput = z.infer<typeof userUpdateProfileSchema>;
export type CompanyUpdateProfileInput = z.infer<typeof companyUpdateProfileSchema>;