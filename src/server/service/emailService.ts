import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import {supabase} from "../../lib/supabaseClient.ts";
import bcrypt from "bcryptjs";

// Environment variable for JWT secret key
const JWT_SECRET = process.env.JWT_SECRET;

// Interface for the JWT payload used in activation and reset tokens
interface ActivationPayload {
    userId?: string;
    companyId?: string;
    type: string;
}

// Configure Nodemailer transporter for sending emails
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false
    }
});
const api_url = process.env.FRONTEND_API_URL

// Új segédfüggvény az email küldéshez
export const sendEmail = async (to: string, subject: string, text: string) => {
    await transporter.sendMail({
        from: `"Orion" <${process.env.EMAIL}>`,
        to,
        subject,
        text,
    });
};

// Email verification for users
export const sendUserActivationEmail = async (email: string) => {
    // 1. Find the user by email and check if they are not yet activated.
    const {data, error} = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .eq('activated', false)
        .maybeSingle();

    if(data === null || error) throw new Error("User not found or already activated");

    // 2. Generate a JWT activation token with a 1-hour expiry.
    const token = jwt.sign({userId: data.id, type: "activation"}, JWT_SECRET!, {expiresIn: '1h'});
    const verificationUrl = `${api_url}/user/verify?token=${token}`;

    // 3. Store or update the activation token in the 'user_email_tokens' table.
    const { error: upsertError } = await supabase
        .from('user_email_tokens')
        .upsert({
            user_id: data.id,
            token: token,
            expires_at: new Date(Date.now() + 3600 * 1000)
        },{ onConflict: 'user_id' });

    if (upsertError) throw upsertError;


    // 4. Send the activation email to the user.
    await sendEmail(
        email,
        "Email verifikáció",
        `\nszia kérlek azonosítsd az emailedet az alábbi linkre kattintva:\n\n ${verificationUrl}\n\n üdvözlettel Orion csapata!`
    );
};

// Email verification for companies
export const sendCompanyActivationEmail = async (email: string) => {
    // 1. Find the company by email and check if they are not yet verified.
    const {data, error} = await supabase
        .from('companies')
        .select('id')
        .eq('email', email)
        .eq('verified', false)
        .maybeSingle();

    if(data === null || error){
        throw new Error("User not found or already activated");
    }

    // 2. Generate a JWT activation token with a 1-hour expiry.
    const token = jwt.sign({companyId: data.id, type: "activation"}, JWT_SECRET!, {expiresIn: '1h'});
    const verificationUrl = `${api_url}/company/verify?token=${token}`;

    // 3. Store or update the activation token in the 'company_email_tokens' table.
    const { error: upsertError } = await supabase
        .from('company_email_tokens')
        .upsert({
            company_id: data.id,
            token: token,
            expires_at: new Date(Date.now() + 3600 * 1000)
        },{ onConflict: 'company_id' });

    if (upsertError) throw upsertError;

    // 4. Send the activation email to the company.
    await sendEmail(
        email,
        "Email verifikáció",
        `\nszia kérlek azonosítsd a céges email-t az alábbi linkre kattintva:\n\n ${verificationUrl}\n\n üdvözlettel Orion csapata!`
    );
};

// Activate user account
export const activateUserAccount = async (token: string) => {
    // 1. Verify and decode the JWT token.
    const payload = jwt.verify(
        token,
        process.env.JWT_SECRET!
    ) as ActivationPayload;

    // 2. Validate the token type.
    if (payload.type !== "activation") {
        throw new Error("Invalid token type");
    }

    // 3. Retrieve the user ID associated with the token from the database.
    const {data, error} = await supabase
        .from('user_email_tokens')
        .select('user_id')
        .eq('token', token)
        .maybeSingle();

    if(data === null || error) throw new Error("Invalid token or expired");

    // 4. Update the user's 'activated' status to true.
    const {error: updateError} = await supabase
        .from('users')
        .update({activated: true})
        .eq('id', data.user_id);

    if(updateError) throw updateError;
};

// Activate company account
export const activateCompanyAccount = async (token: string) => {
    // 1. Verify and decode the JWT token.
    const payload = jwt.verify(
        token,
        process.env.JWT_SECRET!
    ) as ActivationPayload;

    // 2. Validate the token type.
    if (payload.type !== "activation") {
        throw new Error("Invalid token type");
    }

    // 3. Retrieve the company ID associated with the token from the database.
    const {data, error} = await supabase
        .from('company_email_tokens')
        .select('company_id')
        .eq('token', token)
        .maybeSingle();

    if(data === null || error) throw new Error("Invalid token or expired");

    // 4. Update the company's 'verified' status to true.
    const {error: updateError} = await supabase
        .from('companies')
        .update({verified: true})
        .eq('id', data.company_id);

    if(updateError) throw updateError;
};

// Password reset for users
export const sendUserPasswordResetEmail = async (email: string) => {
    // 1. Find the user by email.
    const {data, error} = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();
    if(data === null || error) throw new Error("User not found");

    // 2. Generate a JWT reset token with a 1-hour expiry.
    const token = jwt.sign({userId: data.id, type: "reset"}, JWT_SECRET!, {expiresIn: '1h'});
    const resetUrl = `${api_url}/user/password/?token=${token}`;

    // 3. Store or update the reset token in the 'user_email_tokens' table.
    const { error: upsertError } = await supabase
        .from('user_email_tokens')
        .upsert({
            user_id: data.id,
            token: token,
            expires_at: new Date(Date.now() + 3600 * 1000)
        },{ onConflict: 'user_id' });

    if (upsertError) throw upsertError;

    // 4. Send the password reset email to the user.
    await sendEmail(
        email,
        "jelszó visszaállítás",
        `\nszia jelszód megváltozatását az alábbi linkre kattintva tudod megtenni:\n\n ${resetUrl}\n\n üdvözlettel Orion csapata!`
    );
};

// Password reset for companies
export const sendCompanyPasswordResetEmail = async (email: string) => {
    // 1. Find the company by email.
    const {data, error} = await supabase
        .from('companies')
        .select('id')
        .eq('email', email)
        .maybeSingle();

    if(data === null || error) throw new Error("company not found");

    // 2. Generate a JWT reset token with a 1-hour expiry.
    const token = jwt.sign({companyId: data.id, type: "reset"}, JWT_SECRET!, {expiresIn: '1h'});

    const resetUrl = `${api_url}/company/password/?token=${token}`;

    // 3. Store or update the reset token in the 'company_email_tokens' table.
    const { error: upsertError } = await supabase
        .from('company_email_tokens')
        .upsert({
            company_id: data.id,
            token: token,
            expires_at: new Date(Date.now() + 3600 * 1000)
        },{ onConflict: 'company_id' });

    if (upsertError) throw upsertError;

    // 4. Send the password reset email to the company.
    await sendEmail(
        email,
        "jelszó visszaállítás",
        `\nszia jelszód megváltozatását az alábbi linkre kattintva tudod megtenni:\n\n ${resetUrl}\n\n üdvözlettel Orion csapata!`
    );
};

// Save new user password
export const saveNewUserPassword = async (token: string, password: string) => {
    // 1. Verify and decode the JWT token.
    const payload = jwt.verify(
        token,
        process.env.JWT_SECRET!
    ) as ActivationPayload;

    // 2. Validate the token type.
    if (payload.type !== "reset") {
        throw new Error("Invalid token type");
    }

    // 3. Retrieve the user ID associated with the token from the database.
    const {data, error} = await supabase
        .from('user_email_tokens')
        .select('user_id')
        .eq('token', token)
        .maybeSingle();

    if(data === null || error) throw new Error("Invalid token or expired");

    // 4. Hash the new password before storing it.
    const password_hash = await bcrypt.hash(password, 12);

    // 5. Update the user's password hash in the 'user_credentials' table.
    const {error: updateError} = await supabase
        .from('user_credentials')
        .update({password_hash: password_hash})
        .eq('user_id', data.user_id);

    if(updateError) throw updateError;

    // 6. Delete the used password reset token to prevent reuse.
    const {error: deleteError} = await supabase
        .from('user_email_tokens')
        .delete()
        .eq('token', token);

    if(deleteError) throw deleteError;
};

// Save new company password
export const saveNewCompanyPassword = async (token: string, password: string) => {
    // 1. Verify and decode the JWT token.
    const payload = jwt.verify(
        token,
        process.env.JWT_SECRET!
    ) as ActivationPayload;

    // 2. Validate the token type.
    if (payload.type !== "reset") {
        throw new Error("Invalid token type");
    }

    // 3. Retrieve the company ID associated with the token from the database.
    const {data, error} = await supabase
        .from('company_email_tokens')
        .select('company_id')
        .eq('token', token)
        .maybeSingle();

    if(data === null || error) throw new Error("Invalid token or expired");

    // 4. Hash the new password before storing it.
    const password_hash = await bcrypt.hash(password, 12);

    // 5. Update the company's password hash in the 'company_credentials' table.
    const {error: updateError} = await supabase
        .from('company_credentials')
        .update({password_hash: password_hash})
        .eq('company_id', data.company_id);

    if(updateError) throw updateError;

    // 6. Delete the used password reset token to prevent reuse.
    const {error: deleteError} = await supabase
        .from('company_email_tokens')
        .delete()
        .eq('token', token);

    if(deleteError) throw deleteError;
};
