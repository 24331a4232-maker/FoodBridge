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
    return data as Profile | null;
  };

  // Wait for a profile row to appear (trigger may take a moment)
  const waitForProfile = async (uid: string, retries = 10): Promise<Profile | null> => {
    for (let i = 0; i < retries; i++) {
      const { data } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
      if (data) {
        setProfile(data as Profile);
        return data as Profile;
      }
      await new Promise((r) => setTimeout(r, 300));
    }
    return null;
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

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(id);
    let emailToUse = id;

    if (!isEmail) {
      const { data: profileRow } = await supabase
        .from('profiles')
        .select('email')
        .ilike('username', id)
        .maybeSingle();

      if (!profileRow) {
        return { error: 'Invalid email/username or password.' };
      }
      emailToUse = profileRow.email;
    }

    const { error } = await supabase.auth.signInWithPassword({ email: emailToUse, password });
    if (error) {
      return { error: 'Invalid email/username or password.' };
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await fetchProfile(session.user.id);
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

    // Pre-check for duplicates
    const fieldErrors: NonNullable<SignUpResult['fieldErrors']> = {};
    const [usernameCheck, emailCheck, phoneCheck] = await Promise.all([
      supabase.from('profiles').select('id').ilike('username', username).maybeSingle(),
      supabase.from('profiles').select('id').eq('email', email).maybeSingle(),
      supabase.from('profiles').select('id').eq('phone', phone).maybeSingle(),
    ]);

    if (usernameCheck.data) fieldErrors.username = 'Username already exists.';
    if (emailCheck.data) fieldErrors.email = 'Email is already registered.';
    if (phoneCheck.data) fieldErrors.phone = 'Mobile number already registered.';

    if (Object.keys(fieldErrors).length > 0) {
      return { error: 'Please fix the errors below.', fieldErrors };
    }

    // Create the auth user — the database trigger auto-creates the profile row
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
          email: email,
        },
      },
    });

    if (error) {
      if (error.message.toLowerCase().includes('already registered')) {
        return { error: 'Email is already registered.', fieldErrors: { email: 'Email is already registered.' } };
      }
      return { error: error.message };
    }

    if (!data.user) {
      return { error: 'Registration failed. Please try again.' };
    }

    // Wait for the trigger to create the profile row
    const newProfile = await waitForProfile(data.user.id, 15);

    if (!newProfile) {
      // Fallback: try inserting manually (trigger may have failed)
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
        const msg = insertError.message.toLowerCase();
        if (msg.includes('username')) {
          return { error: 'Username already exists.', fieldErrors: { username: 'Username already exists.' } };
        }
        if (msg.includes('email')) {
          return { error: 'Email is already registered.', fieldErrors: { email: 'Email is already registered.' } };
        }
        if (msg.includes('phone')) {
          return { error: 'Mobile number already registered.', fieldErrors: { phone: 'Mobile number already registered.' } };
        }
        return { error: 'Account created but profile setup failed. Please log in.' };
      }

      await fetchProfile(data.user.id);
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
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
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
