import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import {supabase} from "../../lib/supabaseClient.ts";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET;

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


export const sendUserActivationEmail = async (email: string) => {
    const {data, error} = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .eq('activated', false)
        .maybeSingle();

    if(data === null || error) throw new Error("User not found or already activated");

    const token = jwt.sign({userId: data.id, type: "activation"}, JWT_SECRET!, {expiresIn: '1h'});
    const verificationUrl = `${api_url}/user/verify?token=${token}`;
    const { error: upsertError } = await supabase
        .from('user_email_tokens')
        .upsert({
            user_id: data.id,
            token: token,
            expires_at: new Date(Date.now() + 3600 * 1000)
        },{ onConflict: 'user_id' });

    if (upsertError) throw upsertError;


    await sendEmail(
        email,
        "Email verifikáció",
        `\nszia kérlek azonosítsd az emailedet az alábbi linkre kattintva:\n\n ${verificationUrl}\n\n üdvözlettel Orion csapata!`
    );
}

export const sendCompanyActivationEmail = async (email: string) => {
    const {data, error} = await supabase
        .from('companies')
        .select('id')
        .eq('email', email)
        .eq('verified', false)
        .maybeSingle();

    if(data === null || error){
        throw new Error("User not found or already activated");
    }

    const token = jwt.sign({companyId: data.id, type: "activation"}, JWT_SECRET!, {expiresIn: '1h'});
    const verificationUrl = `${api_url}/company/verify?token=${token}`;
    const { error: upsertError } = await supabase
        .from('company_email_tokens')
        .upsert({
            company_id: data.id,
            token: token,
            expires_at: new Date(Date.now() + 3600 * 1000)
        },{ onConflict: 'company_id' });

    if (upsertError) throw upsertError;


    await sendEmail(
        email,
        "Email verifikáció",
        `\nszia kérlek azonosítsd a céges email-t az alábbi linkre kattintva:\n\n ${verificationUrl}\n\n üdvözlettel Orion csapata!`
    );
}


interface ActivationPayload {
    userId?: string;
    companyId?: string;
    type: string;
}

export const activateUserAccount = async (token: string) => {
    const payload = jwt.verify(
        token,
        process.env.JWT_SECRET!
    ) as ActivationPayload;

    if (payload.type !== "activation") {
        throw new Error("Invalid token type");
    }
    const {data, error} = await supabase
        .from('user_email_tokens')
        .select('user_id')
        .eq('token', token)
        .maybeSingle();

    if(data === null || error) throw new Error("Invalid token or expired");


    const {error: updateError} = await supabase
        .from('users')
        .update({activated: true})
        .eq('id', data.user_id);

    if(updateError) throw updateError;
}

export const activateCompanyAccount = async (token: string) => {
    const payload = jwt.verify(
        token,
        process.env.JWT_SECRET!
    ) as ActivationPayload;

    if (payload.type !== "activation") {
        throw new Error("Invalid token type");
    }
    const {data, error} = await supabase
        .from('company_email_tokens')
        .select('company_id')
        .eq('token', token)
        .maybeSingle();

    if(data === null || error) throw new Error("Invalid token or expired");


    const {error: updateError} = await supabase
        .from('companies')
        .update({verified: true})
        .eq('id', data.company_id);

    if(updateError) throw updateError;
}

export const sendUserPasswordResetEmail = async (email: string) => {
    const {data, error} = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();
    if(data === null || error) throw new Error("User not found");

    const token = jwt.sign({userId: data.id, type: "reset"}, JWT_SECRET!, {expiresIn: '1h'});

    const resetUrl = `${api_url}/user/password/?token=${token}`;

    const { error: upsertError } = await supabase
        .from('user_email_tokens')
        .upsert({
            user_id: data.id,
            token: token,
            expires_at: new Date(Date.now() + 3600 * 1000)
        },{ onConflict: 'user_id' });

    if (upsertError) throw upsertError;

    await sendEmail(
        email,
        "jelszó visszaállítás",
        `\nszia jelszód megváltozatását az alábbi linkre kattintva tudod megtenni:\n\n ${resetUrl}\n\n üdvözlettel Orion csapata!`
    );
}


export const sendCompanyPasswordResetEmail = async (email: string) => {
    const {data, error} = await supabase
        .from('companies')
        .select('id')
        .eq('email', email)
        .maybeSingle();

    if(data === null || error) throw new Error("company not found");

    const token = jwt.sign({companyId: data.id, type: "reset"}, JWT_SECRET!, {expiresIn: '1h'});

    const resetUrl = `${api_url}/company/password/?token=${token}`;

    const { error: upsertError } = await supabase
        .from('company_email_tokens')
        .upsert({
            company_id: data.id,
            token: token,
            expires_at: new Date(Date.now() + 3600 * 1000)
        },{ onConflict: 'company_id' });

    if (upsertError) throw upsertError;

    await sendEmail(
        email,
        "jelszó visszaállítás",
        `\nszia jelszód megváltozatását az alábbi linkre kattintva tudod megtenni:\n\n ${resetUrl}\n\n üdvözlettel Orion csapata!`
    );
}




export const saveNewUserPassword = async (token: string, password: string) => {
    const payload = jwt.verify(
        token,
        process.env.JWT_SECRET!
    ) as ActivationPayload;

    if (payload.type !== "reset") {
        throw new Error("Invalid token type");
    }
    const {data, error} = await supabase
        .from('user_email_tokens')
        .select('user_id')
        .eq('token', token)
        .maybeSingle();

    if(data === null || error) throw new Error("Invalid token or expired");
    const password_hash = await bcrypt.hash(password, 12);
    const {error: updateError} = await supabase
        .from('user_credentials')
        .update({password_hash: password_hash})
        .eq('user_id', data.user_id);

    if(updateError) throw updateError;
    const {error: deleteError} = await supabase
        .from('user_email_tokens')
        .delete()
        .eq('token', token);

    if(deleteError) throw deleteError;
}


export const saveNewCompanyPassword = async (token: string, password: string) => {
    const payload = jwt.verify(
        token,
        process.env.JWT_SECRET!
    ) as ActivationPayload;

    if (payload.type !== "reset") {
        throw new Error("Invalid token type");
    }
    const {data, error} = await supabase
        .from('company_email_tokens')
        .select('company_id')
        .eq('token', token)
        .maybeSingle();

    if(data === null || error) throw new Error("Invalid token or expired");
    const password_hash = await bcrypt.hash(password, 12);
    const {error: updateError} = await supabase
        .from('company_credentials')
        .update({password_hash: password_hash})
        .eq('company_id', data.company_id);

    if(updateError) throw updateError;
    const {error: deleteError} = await supabase
        .from('company_email_tokens')
        .delete()
        .eq('token', token);

    if(deleteError) throw deleteError;
}
