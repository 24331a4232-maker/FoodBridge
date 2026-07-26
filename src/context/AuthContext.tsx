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
  signIn: (identifier: string, password: string) => Promise<{ error: string | null; role?: UserRole }>;
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

  const fetchProfile = async (uid: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .maybeSingle();
      if (error) {
        console.error('[auth] fetchProfile error:', error.message);
      }
      setProfile(data as Profile | null);
      return data as Profile | null;
    } catch (err) {
      console.error('[auth] fetchProfile threw:', err);
      return null;
    }
  };

  const waitForProfile = async (uid: string, retries = 20): Promise<Profile | null> => {
    for (let i = 0; i < retries; i++) {
      try {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
        if (error) {
          console.error('[auth] waitForProfile query error:', error.message);
        }
        if (data) {
          setProfile(data as Profile);
          return data as Profile;
        }
      } catch (err) {
        console.error('[auth] waitForProfile threw:', err);
      }
      await new Promise((r) => setTimeout(r, 250));
    }
    return null;
  };

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return;
      if (error) {
        console.error('[auth] getSession error:', error.message);
        setLoading(false);
        return;
      }
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => {
          if (mounted) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    }).catch((err) => {
      console.error('[auth] getSession threw:', err);
      if (mounted) setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => {
          if (mounted) setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (identifier: string, password: string) => {
    try {
      const id = identifier.trim();
      if (!id) return { error: 'Please enter your email or username' };

      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(id);
      let emailToUse = id;

      if (!isEmail) {
        const { data: profileRow, error: lookupError } = await supabase
          .from('profiles')
          .select('email')
          .ilike('username', id)
          .maybeSingle();

        if (lookupError) {
          console.error('[auth] username lookup error:', lookupError.message);
          return { error: 'Unable to verify credentials. Please try again.' };
        }
        if (!profileRow) {
          return { error: 'Invalid email/username or password.' };
        }
        emailToUse = profileRow.email;
      }

      const { error } = await supabase.auth.signInWithPassword({ email: emailToUse, password });
      if (error) {
        console.error('[auth] signInWithPassword error:', error.message, error.status);
        if (error.message.toLowerCase().includes('invalid login credentials')) {
          return { error: 'Invalid email/username or password.' };
        }
        return { error: error.message };
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const fetchedProfile = await fetchProfile(session.user.id);
        try {
          await supabase.from('profiles').update({ last_login: new Date().toISOString() }).eq('id', session.user.id);
        } catch (e) {
          console.error('[auth] last_login update error:', e);
        }
        return { error: null, role: fetchedProfile?.role };
      }
      return { error: null };
    } catch (err) {
      console.error('[auth] signIn threw:', err);
      return { error: 'An unexpected error occurred. Please try again.' };
    }
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
    try {
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

      if (usernameCheck.error) console.error('[auth] username check error:', usernameCheck.error.message);
      if (emailCheck.error) console.error('[auth] email check error:', emailCheck.error.message);
      if (phoneCheck.error) console.error('[auth] phone check error:', phoneCheck.error.message);

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
        console.error('[auth] signUp error:', error.message, error.status);
        if (error.message.toLowerCase().includes('already registered')) {
          return { error: 'Email is already registered.', fieldErrors: { email: 'Email is already registered.' } };
        }
        return { error: error.message };
      }

      if (!data.user) {
        return { error: 'Registration failed. Please try again.' };
      }

      // The database trigger auto-creates the profile. Wait for it.
      const newProfile = await waitForProfile(data.user.id, 20);

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
          console.error('[auth] fallback profile insert error:', insertError.message);
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
          // Account was created but profile failed — user can still log in
          return { error: null };
        }

        await fetchProfile(data.user.id);
      }

      return { error: null };
    } catch (err) {
      console.error('[auth] signUp threw:', err);
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred during registration.';
      return { error: msg };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) console.error('[auth] signOut error:', error.message);
    } catch (err) {
      console.error('[auth] signOut threw:', err);
    }
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith('sb-') && k.endsWith('-auth-token'))
        .forEach((k) => localStorage.removeItem(k));
    } catch { /* ignore */ }
    try {
      Object.keys(sessionStorage)
        .filter((k) => k.startsWith('sb-') && k.endsWith('-auth-token'))
        .forEach((k) => sessionStorage.removeItem(k));
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
