// OminiPulse Edge Function: reset-password
// Verifies the OTP and sets the new password against Supabase auth.users,
// so the reset works identically from mobile and web clients.
// Deploy: supabase functions deploy reset-password
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
    const { email, otp, newPassword } = await req.json();
    if (!email || !otp || !newPassword) {
      return new Response(
        JSON.stringify({ error: 'email, otp and newPassword are required' }),
        { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
      );
    }
    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return new Response(
        JSON.stringify({ error: 'Password must be at least 8 characters' }),
        { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
      );
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );
    const normalizedEmail = String(email).toLowerCase().trim();

    // 1. Verify + burn the OTP (single use, attempt-capped)
    const { data: otpValid, error: otpError } = await admin.rpc(
      'consume_password_reset_otp',
      { p_email: normalizedEmail, p_otp: String(otp) }
    );
    if (otpError) throw otpError;
    if (!otpValid) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired OTP code' }),
        { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Update the auth password server-side
    const { data: userList, error: userError } = await admin.auth.admin.listUsers();
    if (userError) throw userError;

    const target = userList.users.find((u) => u.email === normalizedEmail);
    if (!target) {
      return new Response(
        JSON.stringify({ error: 'Account not found' }),
        { status: 404, headers: { ...CORS, 'Content-Type': 'application/json' } }
      );
    }

    const { error: updateError } = await admin.auth.admin.updateUserById(target.id, {
      password: newPassword,
    });
    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ success: true, message: 'Password updated. You can now sign in.' }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});
