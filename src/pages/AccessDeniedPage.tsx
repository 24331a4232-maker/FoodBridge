import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldX, ArrowLeft, LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { roleDashboardPath } from '@/context/AuthContext';
import { PageNav } from '@/components/PageNav';

export function AccessDeniedPage() {
  const { profile } = useAuth();
  const redirectPath = profile ? roleDashboardPath[profile.role] : '/login';

  return (
    <div className="pt-20 min-h-screen flex items-center justify-center px-4 gradient-bg-soft">
      <PageNav crumbs={[{ label: 'Access Denied', icon: ShieldX }]} />
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-card max-w-md w-full p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="h-20 w-20 rounded-2xl-premium bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/30"
        >
          <ShieldX className="h-10 w-10" />
        </motion.div>
        <h1 className="font-display text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          You don't have permission to view this page. This area is restricted to a different role.
          {profile && <> You are currently signed in as <span className="font-semibold text-primary-600 capitalize">{profile.role}</span>.</>}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to={redirectPath} className="btn-primary inline-flex items-center justify-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Go to your dashboard
          </Link>
          <Link to="/login" className="btn-ghost inline-flex items-center justify-center gap-2">
            <LogIn className="h-4 w-4" /> Switch account
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
