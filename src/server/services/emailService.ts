import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import {supabase} from "../../lib/supabaseClient.ts";

const JWT_SECRET = process.env.JWT_SECRET;

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    },
});
const api_url = process.env.FRONTEND_API_URL




export const sendEmail = async (email: string) => {
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


    await transporter.sendMail({
        from: `"Feladó" <${process.env.GMAIL_USER}>`,
        to: `${email}`,
        subject: "Email verifikáció",
        text: `\nszia kérlek azonosítsd az emailedet az alábbi linkre kattintva:\n\n ${verificationUrl}\n\n üdvözlettel Orion csapata!`,
    });
}

interface ActivationPayload {
    userId: string;
    type: string;
}

export const activateEmail = async (token: string) => {
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
