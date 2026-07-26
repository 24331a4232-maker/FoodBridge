export interface SendOtpResult {
  success: boolean;
  error?: string;
  devMode?: boolean;
  otp?: string;
  expiresIn?: number;
  resendAfter?: number;
  cooldownRemaining?: number;
}

export interface VerifyOtpResult {
  success: boolean;
  error?: string;
  verified?: boolean;
  verifiedAt?: string;
  attemptsRemaining?: number;
  expired?: boolean;
}

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mobile-otp`;

export async function sendOtp(mobile: string): Promise<SendOtpResult> {
  try {
    const res = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ action: 'send', mobile }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data?.error ?? 'Failed to send OTP', cooldownRemaining: data?.cooldownRemaining };
    }
    return {
      success: true,
      devMode: data.devMode,
      otp: data.otp,
      expiresIn: data.expiresIn,
      resendAfter: data.resendAfter,
    };
  } catch {
    return { success: false, error: 'Network error. Please try again.' };
  }
}

export async function verifyOtp(mobile: string, otp: string): Promise<VerifyOtpResult> {
  try {
    const res = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ action: 'verify', mobile, otp }),
    });
    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data?.error ?? 'Verification failed',
        attemptsRemaining: data?.attemptsRemaining,
        expired: data?.expired,
      };
    }
    return { success: true, verified: true, verifiedAt: data.verifiedAt };
  } catch {
    return { success: false, error: 'Network error. Please try again.' };
  }
}

export const OTP_LENGTH = 6;
export const RESEND_COOLDOWN_SEC = 30;
