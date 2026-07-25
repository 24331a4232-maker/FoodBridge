import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Printer, Award, ShieldCheck, Calendar, Hash, QrCode, PartyPopper, X, Sparkles, Save, Loader2, ArrowLeft } from 'lucide-react';
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
      description: `Your volunteer appreciation certificate (${certData.certificateNumber}) is ready to download.`,
      actionUrl: '/certificate',
    });
    setShowSuccess(true);
  };

  const printCertificate = () => {
    window.print();
  };

  const saveToMyCertificates = async () => {
    if (!certData || !user) return;
    // Already saved during generation, but allow re-confirmation
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

  return (
    <div className="pt-20 min-h-screen gradient-bg-soft">
      <PageNav crumbs={[{ label: 'Certificates' }, { label: 'My Certificate', icon: Award }]} />

      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <span className="badge bg-primary-100/80 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 mb-4 border border-primary-200/50 dark:border-primary-800/50">
            <Award className="h-3.5 w-3.5" /> Volunteer Appreciation
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold">Your Certificate of Appreciation</h1>
          <p className="text-gray-500 mt-2">Download, print, and share your contribution to FoodBridge.</p>
        </motion.div>

        {generating && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary-500 mb-4" />
            <p className="text-gray-500">Generating your premium certificate...</p>
          </div>
        )}

        {/* Certificate preview — A4 landscape */}
        {certData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center"
          >
            <div
              ref={certificateRef}
              className="relative bg-white shadow-2xl mx-auto print:shadow-none"
              style={{ aspectRatio: '1.414 / 1', width: '100%', maxWidth: '1000px' }}
            >
              {/* Outer forest-green border */}
              <div className="absolute inset-2 border-[6px] border-primary-700 rounded-2xl" />
              {/* Inner golden border */}
              <div className="absolute inset-4 border-2 border-gold-400 rounded-xl" />
              {/* Thin decorative line */}
              <div className="absolute inset-5 border border-primary-300/50 rounded-lg" />

              {/* Corner ornaments */}
              {[
                'top-7 left-7',
                'top-7 right-7 rotate-90',
                'bottom-7 left-7 -rotate-90',
                'bottom-7 right-7 rotate-180',
              ].map((pos, i) => (
                <div key={i} className={`absolute ${pos} h-10 w-10`}>
                  <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-primary-500 to-gold-400 rounded-full" />
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-gold-400 rounded-full" />
                </div>
              ))}

              {/* Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <img src="/logo.png" alt="" className="opacity-[0.04] h-64 w-64 object-contain" />
              </div>

              {/* Content */}
              <div className="relative h-full flex flex-col items-center justify-center text-center px-12 sm:px-20 py-10">
                {/* Top row: cert number + unique id */}
                <div className="absolute top-8 left-8 right-8 flex justify-between text-[10px] text-gray-400">
                  <p className="flex items-center gap-1"><Hash className="h-2.5 w-2.5" /> {certData.certificateNumber}</p>
                  <p className="flex items-center gap-1"><ShieldCheck className="h-2.5 w-2.5" /> {certData.uniqueId}</p>
                </div>

                {/* Logo */}
                <motion.img
                  src="/logo.png"
                  alt="FoodBridge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="h-16 w-16 object-contain mb-2 relative z-10"
                />
                <p className="text-[10px] font-semibold text-primary-700 uppercase tracking-[0.2em] mb-1">FoodBridge</p>

                {/* Title */}
                <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1">
                  Volunteer Appreciation Certificate
                </h2>
                <div className="h-1 w-24 bg-gradient-to-r from-primary-500 to-gold-400 rounded-full my-3" />

                {/* Presented to */}
                <p className="text-sm text-gray-500 mb-2">This certificate is proudly presented to</p>
                <p className="font-display text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-700 to-accent-500 bg-clip-text text-transparent mb-1">
                  {certData.volunteerName}
                </p>
                <div className="h-px w-32 bg-gradient-to-r from-primary-400 to-gold-400 my-2" />

                {/* Body text */}
                <p className="text-xs sm:text-sm text-gray-600 max-w-2xl leading-relaxed mb-1">
                  in recognition of outstanding dedication and valuable service in redistributing surplus food
                  from hotels and events to people in need through the FoodBridge initiative.
                </p>
                <p className="text-xs sm:text-sm text-gray-600 max-w-xl leading-relaxed">
                  Your contribution has helped reduce food waste and support communities.
                </p>
                <p className="text-xs sm:text-sm font-medium text-gray-700 mt-1">Thank you for making a meaningful difference.</p>

                {/* Stats */}
                <div className="flex gap-6 mt-4 text-xs">
                  <div className="text-center">
                    <p className="font-stat text-lg font-bold text-primary-700">{certData.deliveriesCount}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Deliveries</p>
                  </div>
                  <div className="text-center">
                    <p className="font-stat text-lg font-bold text-accent-500">{Math.round(certData.hoursServed)}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Hours</p>
                  </div>
                  <div className="text-center">
                    <p className="font-stat text-lg font-bold text-primary-700">{certData.totalMeals}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Meals Saved</p>
                  </div>
                </div>

                {/* Bottom row: signature, seal, QR */}
                <div className="absolute bottom-8 left-12 right-12 flex items-end justify-between">
                  {/* Signature */}
                  <div className="text-left">
                    <p className="font-display italic text-gray-800 text-sm" style={{ fontFamily: 'Georgia, serif' }}>Arjun Sharma</p>
                    <div className="h-px w-24 bg-gray-300 my-1" />
                    <p className="text-[10px] text-gray-500">Founder, FoodBridge</p>
                  </div>

                  {/* Golden seal */}
                  <div className="flex flex-col items-center">
                    <motion.div
                      initial={{ scale: 0, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.6, type: 'spring', stiffness: 200, damping: 15 }}
                      className="h-16 w-16 rounded-full border-2 border-gold-500 flex items-center justify-center text-gold-700 font-bold text-[8px] relative bg-gold-50 shadow-lg shadow-gold-500/30"
                    >
                      <div className="absolute inset-1 rounded-full border border-gold-400" />
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gold-200/40 to-transparent" />
                      <div className="text-center leading-tight relative">
                        <div>OFFICIAL</div>
                        <div>SEAL</div>
                        <div className="text-[6px] mt-0.5">FOODBRIDGE</div>
                      </div>
                    </motion.div>
                  </div>

                  {/* QR Code */}
                  <div className="flex flex-col items-center gap-1">
                    {qrUrl ? (
                      <img src={qrUrl} alt="QR Code" className="h-16 w-16 rounded-lg" />
                    ) : (
                      <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <QrCode className="h-8 w-8 text-gray-300" />
                      </div>
                    )}
                    <p className="text-[9px] text-gray-400 flex items-center gap-1">
                      <QrCode className="h-2.5 w-2.5" /> Scan to verify
                    </p>
                  </div>
                </div>

                {/* Bottom dates */}
                <div className="absolute bottom-3 left-12 right-12 flex justify-between text-[9px] text-gray-400">
                  <p>Issue Date: {issueDateFormatted}</p>
                  <p>Organization: {certData.organizationName}</p>
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
            <Link to="/my-certificates">
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
                <p className="text-gray-400 text-xs">Issue Date</p>
                <p className="font-medium">{issueDateFormatted}</p>
              </div>
              <div>
                <Hash className="h-5 w-5 text-accent-500 mx-auto mb-1" />
                <p className="text-gray-400 text-xs">Certificate ID</p>
                <p className="font-medium text-xs">{certData.certificateNumber}</p>
              </div>
              <div>
                <Award className="h-5 w-5 text-primary-500 mx-auto mb-1" />
                <p className="text-gray-400 text-xs">Deliveries</p>
                <p className="font-medium">{certData.deliveriesCount}</p>
              </div>
              <div>
                <ShieldCheck className="h-5 w-5 text-accent-500 mx-auto mb-1" />
                <p className="text-gray-400 text-xs">Unique ID</p>
                <p className="font-medium text-xs">{certData.uniqueId}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Back link */}
        <div className="text-center mt-6 print:hidden">
          <Link to="/volunteer">
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
              <button onClick={() => setShowSuccess(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="h-20 w-20 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-5 shadow-xl"
              >
                <PartyPopper className="h-10 w-10 text-white" />
              </motion.div>
              <h2 className="font-display text-2xl font-bold mb-2">Certificate Generated!</h2>
              <p className="text-sm text-gray-500 mb-1">Your certificate has been downloaded successfully.</p>
              {certData && (
                <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mb-6">
                  <Sparkles className="h-3 w-3 text-accent-500" />
                  Certificate No: {certData.certificateNumber}
                  <Sparkles className="h-3 w-3 text-accent-500" />
                </div>
              )}
              <div className="flex flex-col gap-3">
                <RippleButton onClick={() => setShowSuccess(false)} variant="primary" fullWidth>View Certificate</RippleButton>
                <Link to="/verify-certificate" onClick={() => setShowSuccess(false)}>
                  <RippleButton variant="ghost" fullWidth>Verify Certificate</RippleButton>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
