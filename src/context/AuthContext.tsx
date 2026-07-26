import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { Profile, UserRole } from '@/types';

export interface SignUpResult {
  error: string | null;
  fieldErrors?: { username?: string; email?: string; phone?: string };
}

export const roleDashboardPath: Record<UserRole, string> = {
  admin: '/dashboard/admin',
  volunteer: '/dashboard/volunteer',
  donor: '/dashboard/donor',
  restaurant: '/dashboard/restaurant',
  ngo: '/dashboard/ngo',
};

interface AuthContextValue {
  user: import('@supabase/supabase-js').User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (identifier: string, password: string) => Promise<{ error: string | null }>;
  signUp: (params: {
    email: string;
    password: string;
    fullName: string;
    username: string;
    phone: string;
    role: UserRole;
    organization?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  }) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthContextValue['user']>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .maybeSingle();
    setProfile(data as Profile | null);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (identifier: string, password: string) => {
    const id = identifier.trim();
    if (!id) return { error: 'Please enter your email or username' };

    // If it looks like an email, sign in directly with email
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(id);
    if (isEmail) {
      const { error } = await supabase.auth.signInWithPassword({ email: id, password });
      if (error) return { error: 'Invalid username/email or password.' };
      // Update last_login timestamp
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase.from('profiles').update({ last_login: new Date().toISOString() }).eq('id', session.user.id);
      }
      return { error: null };
    }

    // Otherwise, look up the email associated with this username (case-insensitive)
    const { data: profileRow, error: lookupError } = await supabase
      .from('profiles')
      .select('email')
      .ilike('username', id)
      .maybeSingle();

    if (lookupError || !profileRow) {
      return { error: 'Invalid username/email or password.' };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: profileRow.email,
      password,
    });
    if (error) return { error: 'Invalid username/email or password.' };
    // Update last_login timestamp
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.from('profiles').update({ last_login: new Date().toISOString() }).eq('id', session.user.id);
    }
    return { error: null };
  };

  const signUp = async (params: {
    email: string;
    password: string;
    fullName: string;
    username: string;
    phone: string;
    role: UserRole;
    organization?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  }): Promise<SignUpResult> => {
    const email = params.email.trim().toLowerCase();
    const username = params.username.trim();
    const phone = params.phone.trim();

    // Check for duplicates before creating the auth account
    const fieldErrors: NonNullable<SignUpResult['fieldErrors']> = {};

    const [usernameCheck, emailCheck, phoneCheck] = await Promise.all([
      supabase.from('profiles').select('id').ilike('username', username).maybeSingle(),
      supabase.from('profiles').select('id').eq('email', email).maybeSingle(),
      supabase.from('profiles').select('id').eq('phone', phone).maybeSingle(),
    ]);

    if (usernameCheck.data) fieldErrors.username = 'Username is already taken.';
    if (emailCheck.data) fieldErrors.email = 'Email is already registered.';
    if (phoneCheck.data) fieldErrors.phone = 'Mobile number is already registered.';

    if (Object.keys(fieldErrors).length > 0) {
      return { error: 'Please fix the errors below.', fieldErrors };
    }

    // Create the auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: params.fullName.trim(),
          username,
          phone,
          role: params.role,
          organization: params.organization?.trim() ?? '',
          address: params.address?.trim() ?? '',
          city: params.city?.trim() ?? '',
          state: params.state?.trim() ?? '',
          pincode: params.pincode?.trim() ?? '',
        },
      },
    });

    if (error) {
      if (error.message.toLowerCase().includes('already registered')) {
        return { error: 'Email is already registered.', fieldErrors: { email: 'Email is already registered.' } };
      }
      return { error: error.message };
    }

    if (data.user) {
      const { error: insertError } = await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: params.fullName.trim(),
        email,
        username,
        phone,
        role: params.role,
        organization: params.organization?.trim() ?? '',
        address: params.address?.trim() ?? '',
        city: params.city?.trim() ?? '',
        state: params.state?.trim() ?? '',
        pincode: params.pincode?.trim() ?? '',
      });

      if (insertError) {
        // The DB unique constraint caught a race condition — clean up the auth user
        await supabase.auth.signOut();
        const msg = insertError.message.toLowerCase();
        if (msg.includes('username')) {
          return { error: 'Username is already taken.', fieldErrors: { username: 'Username is already taken.' } };
        }
        if (msg.includes('email')) {
          return { error: 'Email is already registered.', fieldErrors: { email: 'Email is already registered.' } };
        }
        if (msg.includes('phone')) {
          return { error: 'Mobile number is already registered.', fieldErrors: { phone: 'Mobile number is already registered.' } };
        }
        return { error: 'Could not create your profile. Please try again.' };
      }
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    // Clear all auth/session data from storage so no stale session lingers
    try {
      localStorage.removeItem('sb-' + (import.meta.env.VITE_SUPABASE_URL as string).replace(/^https?:\/\//, '').replace(/\./g, '-') + '-auth-token');
    } catch { /* ignore */ }
    try {
      Object.keys(localStorage).filter((k) => k.startsWith('sb-') && k.endsWith('-auth-token')).forEach((k) => localStorage.removeItem(k));
    } catch { /* ignore */ }
    try {
      Object.keys(sessionStorage).filter((k) => k.startsWith('sb-') && k.endsWith('-auth-token')).forEach((k) => sessionStorage.removeItem(k));
    } catch { /* ignore */ }
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
