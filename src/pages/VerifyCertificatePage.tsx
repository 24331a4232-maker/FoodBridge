import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Search, CheckCircle2, XCircle, QrCode, ArrowLeft, Award, Calendar, Hash, User, Building2, Package, Clock, Sparkles, Frown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Certificate } from '@/types';
import { RippleButton } from '@/components/ui/RippleButton';
import { fadeInUp, staggerContainer } from '@/lib/animations';

const PROJECT_NAME = 'FoodBridge';

import { PageNav } from '@/components/PageNav';
export function VerifyCertificatePage() {
  const { certificateId } = useParams<{ certificateId?: string }>();
  const [params] = useSearchParams();
  const [certNumber, setCertNumber] = useState(certificateId ?? params.get('cert') ?? '');
  const [result, setResult] = useState<'idle' | 'valid' | 'invalid' | 'searching'>('idle');
  const [cert, setCert] = useState<Certificate | null>(null);

  const verify = async (num: string) => {
    if (!num.trim()) return;
    setResult('searching');
    const { data } = await supabase
      .from('certificates')
      .select('*, volunteer:profiles(*)')
      .eq('certificate_number', num.trim())
      .maybeSingle();
    if (data && (data as Certificate).is_valid) {
      const certData = data as Certificate;
      setCert(certData);
      setResult('valid');
      // Mark the QR verification record as verified
      await supabase
        .from('qr_verifications')
        .update({ is_verified: true, verified_at: new Date().toISOString() })
        .eq('certificate_id', certData.id)
        .eq('is_verified', false);
      // Log a qr_verified event
      await supabase.from('donation_events').insert({
        donation_id: null,
        event_type: 'qr_verified',
        actor_name: certData.volunteer_name ?? 'Verifier',
        actor_role: 'system',
        notes: `Certificate ${certData.certificate_number} verified`,
      });
    } else {
      setCert(null);
      setResult('invalid');
    }
  };

  useEffect(() => {
    const initial = certificateId ?? params.get('cert');
    if (initial) {
      setCertNumber(initial);
      verify(initial);
    }
  }, [certificateId, params]);

  return (
    <div className="pt-20 min-h-screen gradient-bg">
      <PageNav crumbs={[{ label: 'Certificates' }, { label: 'Verify Certificate', icon: ShieldCheck }]} />

      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex h-16 w-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 items-center justify-center mb-4 shadow-lg shadow-primary-500/30">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold">Verify Certificate</h1>
          <p className="text-gray-500 mt-2">Enter a certificate ID to verify its authenticity.</p>
        </motion.div>

        {/* Search */}
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="glass-card p-6 mb-6">
          <motion.div variants={fadeInUp} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                value={certNumber}
                onChange={(e) => setCertNumber(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && verify(certNumber)}
                placeholder="Enter certificate ID (e.g. FB-2026-0001)"
                className="input-field pl-12"
              />
            </div>
            <RippleButton onClick={() => verify(certNumber)} variant="primary">
              <ShieldCheck className="h-4 w-4" /> Verify
            </RippleButton>
          </motion.div>
        </motion.div>

        {/* Searching */}
        {result === 'searching' && (
          <div className="text-center py-12">
            <div className="h-12 w-12 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin mx-auto" />
            <p className="text-gray-500 mt-4">Verifying certificate...</p>
          </div>
        )}

        {/* Valid */}
        <AnimatePresence>
          {result === 'valid' && cert && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* VERIFIED badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="flex justify-center"
              >
                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold shadow-lg shadow-primary-500/40">
                  <CheckCircle2 className="h-6 w-6" />
                  <span className="text-lg">VERIFIED</span>
                  <Sparkles className="h-5 w-5" />
                </div>
              </motion.div>

              {/* Status banner */}
              <div className="glass-card p-6 text-center">
                <div className="h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-8 w-8 text-primary-600" />
                </div>
                <h2 className="font-display text-2xl font-bold text-primary-600 mb-1">Certificate Status: VALID</h2>
                <p className="text-sm text-gray-500">This is an authentic FoodBridge volunteer certificate.</p>
              </div>

              {/* Details grid */}
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="glass-card p-6"
              >
                <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary-500" /> Certificate Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <motion.div variants={fadeInUp} className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
                    <User className="h-5 w-5 text-primary-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400">Volunteer Name</p>
                      <p className="font-semibold">{cert.volunteer?.full_name ?? cert.volunteer_name ?? 'Unknown'}</p>
                    </div>
                  </motion.div>
                  <motion.div variants={fadeInUp} className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
                    <Hash className="h-5 w-5 text-accent-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400">Certificate ID</p>
                      <p className="font-semibold">{cert.certificate_number}</p>
                    </div>
                  </motion.div>
                  <motion.div variants={fadeInUp} className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
                    <Calendar className="h-5 w-5 text-primary-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400">Issue Date</p>
                      <p className="font-semibold">{new Date(cert.issue_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </motion.div>
                  <motion.div variants={fadeInUp} className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
                    <Package className="h-5 w-5 text-accent-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400">Completed Deliveries</p>
                      <p className="font-semibold">{cert.deliveries_count}</p>
                    </div>
                  </motion.div>
                  <motion.div variants={fadeInUp} className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
                    <Clock className="h-5 w-5 text-primary-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400">Hours Served</p>
                      <p className="font-semibold">{Math.round(cert.hours_served)}</p>
                    </div>
                  </motion.div>
                  <motion.div variants={fadeInUp} className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
                    <Building2 className="h-5 w-5 text-accent-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400">Organization</p>
                      <p className="font-semibold">{cert.organization_name ?? 'FoodBridge'}</p>
                    </div>
                  </motion.div>
                </div>

                {/* Project line */}
                <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20">
                  <p className="text-xs text-gray-400 mb-1">Project</p>
                  <p className="font-semibold text-sm">{PROJECT_NAME}</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Invalid */}
        <AnimatePresence>
          {result === 'invalid' && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-5"
              >
                <Frown className="h-10 w-10 text-red-500" />
              </motion.div>
              <h2 className="font-display text-2xl font-bold text-red-500 mb-2">Invalid Certificate</h2>
              <p className="text-gray-500 mb-2">No valid certificate found with this ID.</p>
              <p className="text-sm text-gray-400 mb-6">The certificate number may be incorrect, expired, or revoked. Please double-check and try again.</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 text-sm font-medium">
                <XCircle className="h-4 w-4" /> Verification Failed
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Idle */}
        {result === 'idle' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-10 text-center">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex"
            >
              <QrCode className="h-16 w-16 text-gray-300" />
            </motion.div>
            <p className="text-gray-500 mt-4 mb-1">Enter a certificate number above to verify its authenticity.</p>
            <p className="text-xs text-gray-400">You can also scan the QR code on a certificate to open this page.</p>
          </motion.div>
        )}

        {/* Back */}
        <div className="text-center mt-8">
          <Link to="/">
            <RippleButton variant="ghost"><ArrowLeft className="h-4 w-4" /> Back to Home</RippleButton>
          </Link>
        </div>
      </section>
    </div>
  );
}
