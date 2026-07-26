import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const OTP_LENGTH = 6;
const OTP_TTL_MIN = 5;
const RESEND_COOLDOWN_SEC = 30;
const RATE_LIMIT_PER_HOUR = 5;
const MAX_ATTEMPTS = 5;

function generateOtp(): string {
  let code = "";
  for (let i = 0; i < OTP_LENGTH; i++) {
    code += Math.floor(Math.random() * 10).toString();
  }
  return code;
}

function isExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() < Date.now();
}

async function sendSms(mobile: string, code: string): Promise<{ ok: boolean; devMode: boolean; error?: string }> {
  const smsApiKey = Deno.env.get("SMS_API_KEY");
  const smsProvider = Deno.env.get("SMS_PROVIDER");

  if (!smsApiKey || !smsProvider) {
    // Dev mode: no SMS provider configured. OTP returned to caller for testing.
    return { ok: true, devMode: true };
  }

  try {
    const message = `Your FoodBridge verification code is ${code}. It expires in ${OTP_TTL_MIN} minutes. Do not share it with anyone.`;
    const fullNumber = `91${mobile}`;

    if (smsProvider === "msg91") {
      const res = await fetch(`https://api.msg91.com/api/v5/flow`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "authkey": smsApiKey },
        body: JSON.stringify({
          sender: Deno.env.get("SMS_SENDER_ID") ?? "FOODBGE",
          mobiles: fullNumber,
          otp: code,
          message,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        return { ok: false, devMode: false, error: `SMS provider error: ${text}` };
      }
      return { ok: true, devMode: false };
    }

    if (smsProvider === "twilio") {
      const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID") ?? "";
      const authToken = Deno.env.get("TWILIO_AUTH_TOKEN") ?? "";
      const fromNumber = Deno.env.get("TWILIO_FROM_NUMBER") ?? "";
      if (!accountSid || !authToken || !fromNumber) {
        return { ok: false, devMode: false, error: "Twilio credentials incomplete" };
      }
      const res = await fetch(
        `https://${accountSid}:${authToken}@api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ From: fromNumber, To: `+${fullNumber}`, Body: message }),
        },
      );
      if (!res.ok) {
        const text = await res.text();
        return { ok: false, devMode: false, error: `Twilio error: ${text}` };
      }
      return { ok: true, devMode: false };
    }

    return { ok: true, devMode: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "SMS send failed";
    return { ok: false, devMode: false, error: msg };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Server not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const body = await req.json().catch(() => ({}));
    const action = body?.action;
    const mobile = String(body?.mobile ?? "").replace(/\D/g, "");

    if (!mobile) {
      return new Response(JSON.stringify({ error: "Mobile number is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (mobile.length !== 10) {
      return new Response(JSON.stringify({ error: "Mobile number must be 10 digits" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── SEND OTP ────────────────────────────────────────────────────────────
    if (action === "send") {
      // Check if mobile is already registered
      const { data: existingProfile } = await adminClient
        .from("profiles")
        .select("id")
        .eq("phone", mobile)
        .maybeSingle();

      if (existingProfile) {
        return new Response(JSON.stringify({ error: "This mobile number is already registered." }), {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Rate limit: max 5 requests per hour per mobile
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count: recentCount } = await adminClient
        .from("mobile_otps")
        .select("id", { count: "exact", head: true })
        .eq("mobile", mobile)
        .gte("created_at", oneHourAgo);

      if ((recentCount ?? 0) >= RATE_LIMIT_PER_HOUR) {
        return new Response(JSON.stringify({ error: "Too many OTP requests. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Resend cooldown: check the most recent OTP
      const { data: lastOtp } = await adminClient
        .from("mobile_otps")
        .select("created_at")
        .eq("mobile", mobile)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lastOtp) {
        const elapsedSec = (Date.now() - new Date(lastOtp.created_at).getTime()) / 1000;
        if (elapsedSec < RESEND_COOLDOWN_SEC) {
          const waitSec = Math.ceil(RESEND_COOLDOWN_SEC - elapsedSec);
          return new Response(JSON.stringify({
            error: `Please wait ${waitSec}s before requesting a new OTP.`,
            cooldownRemaining: waitSec,
          }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      // Generate and store the OTP
      const code = generateOtp();
      const expiresAt = new Date(Date.now() + OTP_TTL_MIN * 60 * 1000).toISOString();

      const { error: insertErr } = await adminClient
        .from("mobile_otps")
        .insert({ mobile, otp_code: code, purpose: "registration", expires_at: expiresAt });

      if (insertErr) {
        return new Response(JSON.stringify({ error: "Failed to generate OTP. Please try again." }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const smsResult = await sendSms(mobile, code);
      if (!smsResult.ok) {
        return new Response(JSON.stringify({ error: "Failed to send SMS. Please try again." }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const responseData: Record<string, unknown> = {
        success: true,
        message: `OTP sent to ${mobile}`,
        expiresIn: OTP_TTL_MIN * 60,
        resendAfter: RESEND_COOLDOWN_SEC,
      };

      if (smsResult.devMode) {
        responseData.devMode = true;
        responseData.otp = code;
      }

      return new Response(JSON.stringify(responseData), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── VERIFY OTP ──────────────────────────────────────────────────────────
    if (action === "verify") {
      const otpCode = String(body?.otp ?? "").trim();

      if (!otpCode || otpCode.length !== OTP_LENGTH) {
        return new Response(JSON.stringify({ error: "Please enter a valid 6-digit OTP." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: otpRow, error: fetchErr } = await adminClient
        .from("mobile_otps")
        .select("*")
        .eq("mobile", mobile)
        .eq("is_used", false)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchErr || !otpRow) {
        return new Response(JSON.stringify({ error: "No OTP found. Please request a new OTP." }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (isExpired(otpRow.expires_at)) {
        await adminClient.from("mobile_otps").update({ is_used: true }).eq("id", otpRow.id);
        return new Response(JSON.stringify({ error: "OTP has expired. Please request a new OTP.", expired: true }), {
          status: 410,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (otpRow.attempts >= MAX_ATTEMPTS) {
        await adminClient.from("mobile_otps").update({ is_used: true }).eq("id", otpRow.id);
        return new Response(JSON.stringify({ error: "Too many incorrect attempts. Please request a new OTP." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (otpRow.otp_code !== otpCode) {
        await adminClient.from("mobile_otps").update({ attempts: otpRow.attempts + 1 }).eq("id", otpRow.id);
        const remaining = MAX_ATTEMPTS - (otpRow.attempts + 1);
        return new Response(JSON.stringify({
          error: "Invalid OTP. Please try again.",
          attemptsRemaining: remaining,
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Success
      await adminClient.from("mobile_otps").update({
        is_used: true,
        is_verified: true,
        verified_at: new Date().toISOString(),
      }).eq("id", otpRow.id);

      return new Response(JSON.stringify({
        success: true,
        message: "Mobile Number Verified Successfully.",
        verified: true,
        verifiedAt: new Date().toISOString(),
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action. Use send or verify." }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
