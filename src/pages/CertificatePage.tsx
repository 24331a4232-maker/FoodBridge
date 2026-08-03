import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download, Printer, Award, ShieldCheck, Calendar, Hash, QrCode, PartyPopper, X,
  Sparkles, Save, Loader2, ArrowLeft, Leaf, Clock, Truck, Heart, TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useNotifications } from '@/context/NotificationContext';
import { supabase } from '@/lib/supabase';
import { RippleButton } from '@/components/ui/RippleButton';
import { createCertificateRecord, generateCertificatePDF, generateQRCode, type CertificateData } from '@/lib/certificate';

import { PageNav } from '@/components/PageNav';

export function CertificatePage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { pushToast, pushNotification } = useNotifications();
  const [certData, setCertData] = useState<CertificateData | null>(null);
  const [qrUrl, setQrUrl] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saved, setSaved] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  const issueDateFormatted = certData
    ? new Date(certData.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    const generate = async () => {
      if (!user || !profile) return;
      setGenerating(true);
      const data = await createCertificateRecord({
        volunteerId: user.id,
        volunteerName: profile.full_name,
        organizationName: profile.organization || 'FoodBridge',
        deliveriesCount: profile.total_deliveries ?? 0,
        hoursServed: profile.total_hours ?? 0,
        totalMeals: profile.total_deliveries ?? 0,
      });
      setGenerating(false);
      if (data) {
        setCertData(data);
        setSaved(true);
        const qr = await generateQRCode(data.verifyUrl);
        setQrUrl(qr);
      } else {
        toast('Could not generate certificate. Please try again.', 'error');
      }
    };
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, profile]);

  const downloadPDF = async () => {
    if (!certData) return;
    const qr = await generateQRCode(certData.verifyUrl);
    await generateCertificatePDF(certData, qr);
    toast('Certificate PDF downloaded!', 'success');
    pushToast('Certificate Generated Successfully', 'success');
    pushNotification({
      type: 'certificate_generated',
      title: 'Certificate Generated',
      description: `Your volunteer impact certificate (${certData.certificateNumber}) is ready to download.`,
      actionUrl: '/services/certificates',
    });
    setShowSuccess(true);
  };

  const printCertificate = () => {
    window.print();
  };

  const saveToMyCertificates = async () => {
    if (!certData || !user) return;
    const { data: existing } = await supabase
      .from('certificates')
      .select('id')
      .eq('certificate_number', certData.certificateNumber)
      .maybeSingle();
    if (existing) {
      toast('Certificate saved to My Certificates!', 'success');
      setSaved(true);
    } else {
      const data = await createCertificateRecord({
        volunteerId: user.id,
        volunteerName: profile?.full_name ?? 'Volunteer',
        organizationName: profile?.organization || 'FoodBridge',
        deliveriesCount: profile?.total_deliveries ?? 0,
        hoursServed: profile?.total_hours ?? 0,
        totalMeals: profile?.total_deliveries ?? 0,
      });
      if (data) {
        setCertData(data);
        setSaved(true);
        toast('Certificate saved to My Certificates!', 'success');
      } else {
        toast('Could not save certificate.', 'error');
      }
    }
  };

  const impactMetrics = certData
    ? [
        { icon: Truck, label: 'Deliveries', value: certData.deliveriesCount, color: '#7AB589' },
        { icon: Clock, label: 'Hours Served', value: Math.round(certData.hoursServed), color: '#C18D5E' },
        { icon: Heart, label: 'Meals Saved', value: certData.totalMeals, color: '#7AB589' },
        { icon: Leaf, label: 'CO₂ Reduced', value: `${(certData.totalMeals * 0.4).toFixed(1)} kg`, color: '#D5AF4F' },
      ]
    : [];

  return (
    <div className="pt-20 min-h-screen gradient-bg-soft">
      <PageNav crumbs={[{ label: 'Certificates' }, { label: 'My Certificate', icon: Award }]} />

      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <span className="badge bg-primary-100/80 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 mb-4 border border-primary-200/50 dark:border-primary-800/50">
            <Sparkles className="h-3.5 w-3.5" /> Impact Passport
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold">Your Impact Passport</h1>
          <p className="text-ink-soft dark:text-cream/60 mt-2">A living, verifiable record of every meal you've helped redirect from waste.</p>
        </motion.div>

        {generating && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary-500 mb-4" />
            <p className="text-ink-soft dark:text-cream/60">Generating your impact passport...</p>
          </div>
        )}

        {/* Certificate — innovative card design */}
        {certData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center"
          >
            <div
              ref={certificateRef}
              className="relative bg-white dark:bg-secondary-900 shadow-2xl mx-auto print:shadow-none overflow-hidden"
              style={{ aspectRatio: '1.414 / 1', width: '100%', maxWidth: '1000px' }}
            >
              {/* Ambient gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-cream to-gold-50 dark:from-secondary-800 dark:via-secondary-900 dark:to-secondary-950" />

              {/* Mesh-like decorative shapes */}
              <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary-200/30 dark:bg-primary-700/20 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-gold-200/30 dark:bg-gold-700/15 blur-3xl" />

              {/* Top accent strip */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-500 via-gold-400 to-accent-500" />

              {/* Content layout */}
              <div className="relative h-full flex flex-col">

                {/* ── Top header band ── */}
                <div className="bg-[#1B4332] flex items-center justify-between px-6 sm:px-10 py-2.5">
                  <span className="text-[10px] sm:text-xs font-bold tracking-[0.18em] text-white/90 uppercase">
                    The Last Plate – FoodBridge Initiative
                  </span>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3 w-3 text-[#C9A66B]" />
                    <span className="text-[9px] text-[#C9A66B] font-semibold tracking-wide uppercase">Verified</span>
                  </div>
                </div>
                {/* Gold accent line */}
                <div className="h-[3px] bg-[#C9A66B]" />

                {/* ── Main body ── */}
                <div className="flex-1 flex gap-4 sm:gap-6 px-5 sm:px-10 pt-4 pb-2">

                  {/* Left: logo + seal */}
                  <div className="flex flex-col items-center gap-3 shrink-0 w-16 sm:w-20 justify-center">
                    <motion.img
                      src="/images/WhatsApp_Image_2026-07-08_at_10.26.18_PM copy.jpeg"
                      alt="The Last Plate"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring', stiffness: 180 }}
                      className="w-14 h-14 sm:w-20 sm:h-20 object-contain"
                    />
                    {/* Decorative seal */}
                    <motion.div
                      initial={{ scale: 0, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.6, type: 'spring', stiffness: 200, damping: 14 }}
                      className="relative h-10 w-10 sm:h-12 sm:w-12"
                    >
                      <div className="absolute inset-0 rounded-full border-2 border-[#C9A66B]" />
                      <div className="absolute inset-[4px] rounded-full border border-[#C9A66B]/60 flex flex-col items-center justify-center">
                        <Award className="h-3 w-3 sm:h-4 sm:w-4 text-[#C9A66B]" />
                        <span className="text-[5px] sm:text-[6px] font-bold text-[#1B4332] dark:text-[#C9A66B] mt-0.5 uppercase tracking-wide">Seal</span>
                      </div>
                    </motion.div>
                  </div>

                  {/* Right: certificate content */}
                  <div className="flex-1 min-w-0 flex flex-col">
                    {/* Title */}
                    <div className="text-center mb-2 sm:mb-3">
                      <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.22em] text-[#8B5E3C] font-semibold">Certificate of Appreciation</p>
                      <div className="flex items-center gap-2 my-1 justify-center">
                        <div className="h-px flex-1 bg-[#C9A66B]/50" />
                        <Leaf className="h-3 w-3 text-[#C9A66B]" />
                        <div className="h-px flex-1 bg-[#C9A66B]/50" />
                      </div>
                      <p className="text-[8px] sm:text-[9px] text-ink-soft/60 dark:text-cream/40 italic">
                        This certificate is proudly presented to
                      </p>
                    </div>

                    {/* Recipient */}
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-center mb-2 sm:mb-3"
                    >
                      <h2 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-[#1B4332] dark:text-primary-300 leading-tight">
                        {certData.volunteerName}
                      </h2>
                      <div className="mx-auto mt-1 h-[2px] w-24 sm:w-32 bg-gradient-to-r from-transparent via-[#C9A66B] to-transparent" />
                      <p className="text-[8px] sm:text-[9px] text-ink-soft/60 dark:text-cream/40 mt-1 italic">
                        {certData.organizationName}
                      </p>
                    </motion.div>

                    {/* Body text */}
                    <p className="text-[7px] sm:text-[8.5px] text-center text-ink-soft/80 dark:text-cream/50 leading-relaxed mb-3 px-2">
                      in recognition of outstanding dedication and selfless service in redistributing surplus food to communities in need,
                      helping reduce food waste and bring hope to those who need it most.
                    </p>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3">
                      {impactMetrics.slice(0, 3).map((m, i) => {
                        const Icon = m.icon;
                        return (
                          <motion.div
                            key={m.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + i * 0.08 }}
                            className="flex flex-col items-center rounded-xl bg-[#1B4332] py-2 px-1"
                          >
                            <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#C9A66B] mb-0.5" />
                            <p className="font-bold text-sm sm:text-base text-white leading-none">{m.value}</p>
                            <p className="text-[6px] sm:text-[7px] text-white/60 uppercase tracking-wide mt-0.5 text-center">{m.label}</p>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Motto */}
                    <p className="text-center text-[7px] sm:text-[8px] italic text-[#8B5E3C] dark:text-[#C9A66B]/80 mb-2 sm:mb-3">
                      "Because the last plate you don't need, might be the only meal they get."
                    </p>

                    {/* Bottom: signature | QR */}
                    <div className="mt-auto flex items-end justify-between gap-3">
                      {/* Signature */}
                      <div>
                        <p className="font-display text-sm sm:text-base italic text-[#1B4332] dark:text-primary-300" style={{ fontFamily: 'Georgia, serif' }}>
                          The Last Plate Team
                        </p>
                        <div className="h-px w-28 bg-ink/30 dark:bg-cream/20 my-1" />
                        <p className="text-[8px] text-ink-soft/60 dark:text-cream/40">Authorized Signatory</p>
                      </div>

                      {/* QR */}
                      <div className="flex flex-col items-center gap-0.5">
                        {qrUrl ? (
                          <img src={qrUrl} alt="QR Code" className="h-12 w-12 sm:h-14 sm:w-14 rounded-md border border-[#C9A66B]/40" />
                        ) : (
                          <div className="h-12 w-12 sm:h-14 sm:w-14 bg-oat dark:bg-secondary-800 rounded-md flex items-center justify-center">
                            <QrCode className="h-6 w-6 text-ink-soft/40" />
                          </div>
                        )}
                        <p className="text-[7px] text-ink-soft/50 dark:text-cream/30">Scan to verify</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gold accent line */}
                <div className="h-[3px] bg-[#C9A66B]" />
                {/* ── Footer band ── */}
                <div className="bg-[#1B4332] flex items-center justify-between px-6 sm:px-10 py-1.5">
                  <p className="text-[7px] sm:text-[8px] text-white/60 font-mono tracking-wider">
                    No: {certData.certificateNumber}
                  </p>
                  <p className="text-[7px] sm:text-[8px] text-white/60 font-mono">
                    Save Food · Share Food · Serve Humanity
                  </p>
                  <p className="text-[7px] sm:text-[8px] text-white/60 font-mono tracking-wider">
                    {issueDateFormatted}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        {certData && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap justify-center gap-3 mt-8 print:hidden">
            <RippleButton onClick={downloadPDF} variant="primary">
              <Download className="h-4 w-4" /> Download PDF
            </RippleButton>
            <RippleButton onClick={printCertificate} variant="secondary">
              <Printer className="h-4 w-4" /> Print
            </RippleButton>
            <RippleButton onClick={saveToMyCertificates} variant="ghost">
              <Save className="h-4 w-4" /> {saved ? 'Saved!' : 'Save to My Certificates'}
            </RippleButton>
            <Link to="/services/certificate-history">
              <RippleButton variant="ghost">
                <Award className="h-4 w-4" /> My Certificates
              </RippleButton>
            </Link>
          </motion.div>
        )}

        {/* Info card */}
        {certData && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 mt-8 max-w-2xl mx-auto print:hidden">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-sm">
              <div>
                <Calendar className="h-5 w-5 text-primary-500 mx-auto mb-1" />
                <p className="text-ink-soft/60 dark:text-cream/40 text-xs">Issue Date</p>
                <p className="font-medium">{issueDateFormatted}</p>
              </div>
              <div>
                <Hash className="h-5 w-5 text-accent-500 mx-auto mb-1" />
                <p className="text-ink-soft/60 dark:text-cream/40 text-xs">Passport ID</p>
                <p className="font-medium text-xs">{certData.certificateNumber}</p>
              </div>
              <div>
                <Award className="h-5 w-5 text-primary-500 mx-auto mb-1" />
                <p className="text-ink-soft/60 dark:text-cream/40 text-xs">Deliveries</p>
                <p className="font-medium">{certData.deliveriesCount}</p>
              </div>
              <div>
                <ShieldCheck className="h-5 w-5 text-accent-500 mx-auto mb-1" />
                <p className="text-ink-soft/60 dark:text-cream/40 text-xs">Unique ID</p>
                <p className="font-medium text-xs">{certData.uniqueId}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Back link */}
        <div className="text-center mt-6 print:hidden">
          <Link to="/dashboard/volunteer">
            <RippleButton variant="ghost"><ArrowLeft className="h-4 w-4" /> Back to Dashboard</RippleButton>
          </Link>
        </div>
      </section>

      {/* Success Popup */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
            onClick={() => setShowSuccess(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="glass-card p-8 sm:p-10 text-center max-w-md relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute h-2 w-2 rounded-full"
                  style={{
                    left: `${10 + i * 7}%`,
                    top: '-10px',
                    background: i % 3 === 0 ? '#1B4332' : i % 3 === 1 ? '#8B5E3C' : '#C9A66B',
                  }}
                  initial={{ y: -20, opacity: 1 }}
                  animate={{ y: [0, 300, 400], opacity: [1, 1, 0], rotate: 360 }}
                  transition={{ duration: 2, delay: i * 0.1, repeat: Infinity, repeatDelay: 1 }}
                />
              ))}
              <button onClick={() => setShowSuccess(false)} className="absolute top-4 right-4 text-ink-soft/60 dark:text-cream/40 hover:text-ink-soft dark:text-cream/70"><X className="h-5 w-5" /></button>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="h-20 w-20 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-5 shadow-xl"
              >
                <PartyPopper className="h-10 w-10 text-white" />
              </motion.div>
              <h2 className="font-display text-2xl font-bold mb-2">Passport Generated!</h2>
              <p className="text-sm text-ink-soft dark:text-cream/60 mb-1">Your impact passport has been downloaded successfully.</p>
              {certData && (
                <div className="flex items-center justify-center gap-2 text-xs text-ink-soft/60 dark:text-cream/40 mb-6">
                  <Sparkles className="h-3 w-3 text-accent-500" />
                  Passport No: {certData.certificateNumber}
                  <Sparkles className="h-3 w-3 text-accent-500" />
                </div>
              )}
              <div className="flex flex-col gap-3">
                <RippleButton onClick={() => setShowSuccess(false)} variant="primary" fullWidth>View Passport</RippleButton>
                <Link to="/services/verify-certificate" onClick={() => setShowSuccess(false)}>
                  <RippleButton variant="ghost" fullWidth>Verify Passport</RippleButton>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
