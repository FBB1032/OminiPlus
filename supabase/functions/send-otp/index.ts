// OminiPulse Edge Function: send-otp
// Issues a 6-digit password-reset OTP for an email and delivers it via
// Supabase built-in email (or Resend if RESEND_API_KEY is configured).
// Deploy: supabase functions deploy send-otp
import { createClient } from 'jsr:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS });
  }

  try {
    const { email } = await req.json();
    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );

    // OTP is generated + hashed server-side (see 0003_auth_functions.sql)
    const { data: code, error } = await admin.rpc('issue_password_reset_otp', {
      p_email: email.toLowerCase().trim(),
    });

    if (error) throw error;

    // Never reveal whether the account exists
    if (code === null) {
      return new Response(
        JSON.stringify({ success: true, message: 'If that account exists, an OTP has been sent.' }),
        { headers: { ...CORS, 'Content-Type': 'application/json' } }
      );
    }

    // Deliver via Resend when configured, else no-op (dev: OTP visible in logs)
    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (resendKey) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: Deno.env.get('OTP_FROM_EMAIL') ?? 'OminiPulse <no-reply@ominipulse.ai>',
          to: email,
          subject: 'Your OminiPulse password reset code',
          html: `
            <div style="font-family: Inter, Arial, sans-serif; padding: 24px;">
              <h2 style="color: #0f6e6e;">OminiPulse Password Reset</h2>
              <p>Use this one-time code to reset your password:</p>
              <p style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0f172a;">${code}</p>
              <p style="color: #64748b; font-size: 13px;">This code expires in 10 minutes. If you didn't request it, ignore this email.</p>
            </div>
          `,
        }),
      });
    } else {
      console.log(`[send-otp] DEV MODE — OTP for ${email}: ${code}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'If that account exists, an OTP has been sent.' }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});
