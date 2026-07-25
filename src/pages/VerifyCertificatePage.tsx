import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Search, CheckCircle2, XCircle, QrCode, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Certificate } from '@/types';
import { RippleButton } from '@/components/ui/RippleButton';
import { fadeInUp, staggerContainer } from '@/lib/animations';

export function VerifyCertificatePage() {
  const [params] = useSearchParams();
  const [certNumber, setCertNumber] = useState(params.get('cert') ?? '');
  const [result, setResult] = useState<'idle' | 'valid' | 'invalid' | 'searching'>('idle');
  const [cert, setCert] = useState<Certificate | null>(null);

  const verify = async (num: string) => {
    if (!num) return;
    setResult('searching');
    const { data } = await supabase
      .from('certificates')
      .select('*, volunteer:profiles(*)')
      .eq('certificate_number', num)
      .maybeSingle();
    if (data && (data as Certificate).is_valid) {
      setCert(data as Certificate);
      setResult('valid');
    } else {
      setCert(null);
      setResult('invalid');
    }
  };

  useEffect(() => {
    if (params.get('cert')) verify(params.get('cert')!);
  }, [params]);

  return (
    <div className="pt-20 min-h-screen gradient-bg">
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 items-center justify-center mb-4 shadow-lg">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold">Verify Certificate</h1>
          <p className="text-gray-500 mt-2">Enter a certificate number to verify its authenticity.</p>
        </motion.div>

        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="glass-card p-6 mb-6">
          <motion.div variants={fadeInUp} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                value={certNumber}
                onChange={(e) => setCertNumber(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && verify(certNumber)}
                placeholder="Enter certificate number (e.g. FB-...)"
                className="input-field pl-12"
              />
            </div>
            <RippleButton onClick={() => verify(certNumber)} variant="primary">Verify</RippleButton>
          </motion.div>
        </motion.div>

        {result === 'searching' && (
          <div className="text-center py-8">
            <div className="h-10 w-10 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin mx-auto" />
            <p className="text-gray-500 mt-3">Verifying...</p>
          </div>
        )}

        {result === 'valid' && cert && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-primary-600" />
            </motion.div>
            <h2 className="font-display text-2xl font-bold text-primary-600 mb-2">Certificate Verified</h2>
            <p className="text-gray-500 mb-6">This is a valid FoodBridge volunteer certificate.</p>
            <div className="grid grid-cols-2 gap-4 text-sm text-left max-w-md mx-auto">
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <p className="text-xs text-gray-400">Volunteer</p>
                <p className="font-semibold">{cert.volunteer?.full_name ?? 'Unknown'}</p>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <p className="text-xs text-gray-400">Deliveries</p>
                <p className="font-semibold">{cert.deliveries_count}</p>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <p className="text-xs text-gray-400">Issue Date</p>
                <p className="font-semibold">{new Date(cert.issue_date).toLocaleDateString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <p className="text-xs text-gray-400">Hours Served</p>
                <p className="font-semibold">{cert.hours_served}</p>
              </div>
            </div>
          </motion.div>
        )}

        {result === 'invalid' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-8 w-8 text-red-500" />
            </motion.div>
            <h2 className="font-display text-2xl font-bold text-red-500 mb-2">Not Found</h2>
            <p className="text-gray-500 mb-6">No valid certificate found with this number. Please check and try again.</p>
          </motion.div>
        )}

        {result === 'idle' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-8 text-center">
            <QrCode className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Enter a certificate number above to verify its authenticity.</p>
          </motion.div>
        )}

        <div className="text-center mt-6">
          <Link to="/"><RippleButton variant="ghost"><ArrowLeft className="h-4 w-4" /> Back to Home</RippleButton></Link>
        </div>
      </section>
    </div>
  );
}
