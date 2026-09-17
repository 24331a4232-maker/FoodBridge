import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PageNav } from '@/components/PageNav';
import { RippleButton } from '@/components/ui/RippleButton';

type Status = 'idle' | 'checking' | 'creating' | 'elevating' | 'done' | 'error';

export function AdminSetupPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  const ADMIN_EMAIL = 'foodbridge.admin@foodbridge.in';
  const ADMIN_PASSWORD = 'Food@786';
  const ADMIN_USERNAME = 'Foodbridge29';

  const runSetup = async () => {
    setStatus('checking');
    setMessage('Checking for existing admin account…');

    try {
      // Check if admin already exists by username
      const { data: existing } = await supabase
        .from('profiles')
        .select('id, email, role, username')
        .ilike('username', ADMIN_USERNAME)
        .maybeSingle();

      if (existing) {
        if (existing.role === 'admin') {
          // Admin already exists — try to sign in to verify password works
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: existing.email,
            password: ADMIN_PASSWORD,
          });
          if (signInError) {
            // Password doesn't match — but we can't change it from the client
            // without the edge function. Inform the user.
            setStatus('error');
            setMessage(`Admin account already exists for username "${ADMIN_USERNAME}" but the password may be different. Use the admin password reset or the update-user-password edge function.`);
            return;
          }
          setStatus('done');
          setMessage('Admin account is already set up and working. You can now log in.');
          return;
        }
        // Profile exists but not admin — try signing in and elevating
        setStatus('elevating');
        setMessage('Account exists, signing in to elevate to admin…');
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: existing.email,
          password: ADMIN_PASSWORD,
        });
        if (signInError) {
          setStatus('error');
          setMessage('Account exists but password does not match. Cannot elevate.');
          return;
        }
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setStatus('error');
          setMessage('Sign-in succeeded but no session. Cannot elevate.');
          return;
        }
        const { error: updateErr } = await supabase
          .from('profiles')
          .update({ role: 'admin', username: ADMIN_USERNAME })
          .eq('id', session.user.id);
        if (updateErr) {
          setStatus('error');
          setMessage('Failed to elevate role: ' + updateErr.message);
          return;
        }
        await supabase.auth.signOut();
        setStatus('done');
        setMessage('Admin account is ready. You can now log in with username "Foodbridge29" and password "Food@786".');
        return;
      }

      // No existing account — create one
      setStatus('creating');
      setMessage('Creating admin auth user…');

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        options: {
          data: {
            full_name: 'FoodBridge Admin',
            username: ADMIN_USERNAME,
            phone: '9999999999',
            role: 'volunteer',
            organization: 'FoodBridge',
            address: 'Admin Office',
            city: 'Mumbai',
            state: 'MH',
            pincode: '400001',
            email: ADMIN_EMAIL,
          },
        },
      });

      if (signUpError) {
        // If email already registered, try signing in instead
        if (signUpError.message.toLowerCase().includes('already')) {
          setMessage('Email already registered, signing in to elevate…');
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
          });
          if (signInError) {
            setStatus('error');
            setMessage('Email already registered but password does not match. Cannot complete setup.');
            return;
          }
        } else {
          setStatus('error');
          setMessage('Sign-up failed: ' + signUpError.message);
          return;
        }
      }

      // Wait for the profile to be created by the trigger
      setStatus('elevating');
      setMessage('Waiting for profile creation…');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setStatus('error');
        setMessage('Sign-up succeeded but no session. Please try logging in manually.');
        return;
      }

      const userId = session.user.id;
      let profileReady = false;
      for (let i = 0; i < 20; i++) {
        const { data: p } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .maybeSingle();
        if (p) { profileReady = true; break; }
        await new Promise((r) => setTimeout(r, 300));
      }

      if (!profileReady) {
        // Try manual insert
        const { error: insErr } = await supabase.from('profiles').insert({
          id: userId,
          full_name: 'FoodBridge Admin',
          email: ADMIN_EMAIL,
          username: ADMIN_USERNAME,
          phone: '9999999999',
          role: 'volunteer',
          organization: 'FoodBridge',
          address: 'Admin Office',
          city: 'Mumbai',
          state: 'MH',
          pincode: '400001',
        });
        if (insErr) {
          setStatus('error');
          setMessage('Profile was not created automatically and manual insert failed: ' + insErr.message);
          return;
        }
      }

      // Elevate role to admin (self-update allowed by RLS)
      setMessage('Elevating to admin role…');
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ role: 'admin', username: ADMIN_USERNAME, full_name: 'FoodBridge Admin' })
        .eq('id', userId);

      if (updateErr) {
        setStatus('error');
        setMessage('Failed to set admin role: ' + updateErr.message);
        return;
      }

      await supabase.auth.signOut();
      setStatus('done');
      setMessage('Admin account created successfully. You can now log in with username "Foodbridge29" and password "Food@786".');
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'An unexpected error occurred.');
    }
  };

  return (
    <div className="pt-20 min-h-screen gradient-bg">
      <PageNav crumbs={[{ label: 'Admin Setup' }]} />
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-lg mx-auto">
        <div className="card p-8 text-center">
          <div className="h-16 w-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="font-display text-2xl font-bold mb-2">Admin Account Setup</h1>
          <p className="text-ink-soft dark:text-cream/60 text-sm mb-6">
            This one-time tool creates or updates the FoodBridge admin account with
            username <span className="font-semibold">Foodbridge29</span> and the
            specified password. Visit this page, click the button, and the admin
            login will be ready.
          </p>

          {status === 'idle' && (
            <RippleButton onClick={runSetup} variant="primary" className="w-full">
              <ShieldCheck className="h-4 w-4" /> Set Up Admin Account
            </RippleButton>
          )}

          {(status === 'checking' || status === 'creating' || status === 'elevating') && (
            <div className="flex flex-col items-center gap-3 py-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
              <p className="text-sm text-ink-soft dark:text-cream/60">{message}</p>
            </div>
          )}

          {status === 'done' && (
            <div className="flex flex-col items-center gap-3 py-4">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
              <p className="text-sm text-ink-soft dark:text-cream/60">{message}</p>
              <RippleButton onClick={() => navigate('/login')} variant="primary" className="mt-2">
                Go to Login
              </RippleButton>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center gap-3 py-4">
              <XCircle className="h-10 w-10 text-red-500" />
              <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
              <RippleButton onClick={() => { setStatus('idle'); setMessage(''); }} variant="ghost" className="mt-2">
                Try Again
              </RippleButton>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
