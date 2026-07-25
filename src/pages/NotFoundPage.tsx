import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Compass } from 'lucide-react';
import { RippleButton } from '@/components/ui/RippleButton';

export function NotFoundPage() {
  return (
    <div className="pt-20 min-h-screen flex items-center justify-center px-4 gradient-bg relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 h-72 w-72 rounded-full bg-primary-300/20 blur-3xl animate-blob" />
        <div className="absolute bottom-20 right-20 h-72 w-72 rounded-full bg-accent-300/20 blur-3xl animate-blob" style={{ animationDelay: '2s' }} />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="inline-flex h-20 w-20 rounded-3xl bg-gradient-to-br from-primary-500 to-accent-500 items-center justify-center mb-6 shadow-xl"
        >
          <Compass className="h-10 w-10 text-white animate-spin-slow" />
        </motion.div>
        <h1 className="font-display text-7xl sm:text-9xl font-bold gradient-text">404</h1>
        <h2 className="font-display text-2xl font-bold mt-2 mb-2">Page Not Found</h2>
        <p className="text-gray-500 max-w-md mx-auto mb-8">The page you are looking for might have been moved, deleted, or never existed.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/"><RippleButton variant="primary"><Home className="h-4 w-4" /> Back Home</RippleButton></Link>
          <button onClick={() => window.history.back()}><RippleButton variant="secondary"><ArrowLeft className="h-4 w-4" /> Go Back</RippleButton></button>
        </div>
      </motion.div>
    </div>
  );
}
