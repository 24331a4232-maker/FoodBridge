import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download, Printer, Award, ShieldCheck, Calendar, Hash, QrCode, PartyPopper, X,
  Sparkles, Save, Loader2, ArrowLeft, Truck, Clock, Users,
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
        organizationName: profile.organization || 'The Last Plate',
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
    pushToast('Certificate Downloaded', 'success');
    pushNotification({
      type: 'certificate_generated',
      title: 'Certificate Downloaded',
      description: `Your certificate (${certData.certificateNumber}) is ready.`,
      actionUrl: '/services/certificates',
    });
    setShowSuccess(true);
  };

  const saveToMyCertificates = async () => {
    if (!certData || !user) return;
    const { data: existing } = await supabase.from('certificates').select('id').eq('certificate_number', certData.certificateNumber).maybeSingle();
    if (existing) {
      toast('Already saved!', 'success');
      setSaved(true);
    } else {
      const data = await createCertificateRecord({
        volunteerId: user.id,
        volunteerName: profile?.full_name ?? 'Volunteer',
        organizationName: profile?.organization || 'The Last Plate',
        deliveriesCount: profile?.total_deliveries ?? 0,
        hoursServed: profile?.total_hours ?? 0,
        totalMeals: profile?.total_deliveries ?? 0,
      });
      if (data) { setCertData(data); setSaved(true); toast('Saved to My Certificates!', 'success'); }
      else toast('Could not save certificate.', 'error');
    }
  };

  return (
    <div className="pt-20 min-h-screen gradient-bg-soft">
      <PageNav crumbs={[{ label: 'Certificates' }, { label: 'My Certificate', icon: Award }]} />

      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        {/* Page header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <span className="badge bg-primary-100/80 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 mb-4 border border-primary-200/50 dark:border-primary-800/50">
            <Award className="h-3.5 w-3.5" /> Volunteer Certificate
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold">Certificate of Appreciation</h1>
          <p className="text-ink-soft dark:text-cream/60 mt-2">Your verifiable record of service with The Last Plate.</p>
        </motion.div>

        {generating && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary-500 mb-4" />
            <p className="text-ink-soft dark:text-cream/60">Generating your certificate…</p>
          </div>
        )}

        {/* ── Certificate card ── */}
        {certData && (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="flex justify-center">
            <div
              ref={certificateRef}
              className="relative shadow-2xl print:shadow-none overflow-visible mx-auto"
              style={{ width: '100%', maxWidth: '900px' }}
            >
              {/* Parchment surface */}
              <div
                className="relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg,#f7f2e7 0%,#f0e9d2 40%,#ede4c8 100%)',
                  aspectRatio: '1.41 / 1',
                }}
              >
                {/* Leaf watermarks */}
                <svg className="absolute left-0 top-0 h-full opacity-[0.07] pointer-events-none" viewBox="0 0 200 600" fill="none">
                  <ellipse cx="80" cy="160" rx="60" ry="110" stroke="#2d5a3d" strokeWidth="2" transform="rotate(-20 80 160)" />
                  <line x1="80" y1="50" x2="80" y2="270" stroke="#2d5a3d" strokeWidth="1.5" transform="rotate(-20 80 160)" />
                  {[30,50,70,90,110,130,150,170,190,210,230,250].map((y,i)=>(
                    <line key={i} x1="80" y1={y} x2={i%2===0?120:40} y2={y+10} stroke="#2d5a3d" strokeWidth="1" transform="rotate(-20 80 160)" />
                  ))}
                  <ellipse cx="60" cy="420" rx="50" ry="90" stroke="#2d5a3d" strokeWidth="2" transform="rotate(15 60 420)" />
                  <line x1="60" y1="330" x2="60" y2="510" stroke="#2d5a3d" strokeWidth="1.5" transform="rotate(15 60 420)" />
                </svg>
                <svg className="absolute right-0 top-0 h-full opacity-[0.07] pointer-events-none" viewBox="0 0 200 600" fill="none">
                  <ellipse cx="120" cy="180" rx="60" ry="110" stroke="#2d5a3d" strokeWidth="2" transform="rotate(20 120 180)" />
                  <line x1="120" y1="70" x2="120" y2="290" stroke="#2d5a3d" strokeWidth="1.5" transform="rotate(20 120 180)" />
                  {[90,110,130,150,170,190,210,230,250,270].map((y,i)=>(
                    <line key={i} x1="120" y1={y} x2={i%2===0?155:85} y2={y+10} stroke="#2d5a3d" strokeWidth="1" transform="rotate(20 120 180)" />
                  ))}
                  <ellipse cx="140" cy="440" rx="50" ry="90" stroke="#2d5a3d" strokeWidth="2" transform="rotate(-15 140 440)" />
                  <line x1="140" y1="350" x2="140" y2="530" stroke="#2d5a3d" strokeWidth="1.5" transform="rotate(-15 140 440)" />
                </svg>

                {/* Outer double-line border */}
                <div className="absolute inset-[5px] border-[2.5px] border-[#1B4332] pointer-events-none" />
                <div className="absolute inset-[9px] border-[0.8px] border-[#1B4332] pointer-events-none" />

                {/* Art Deco corner ornaments */}
                {(['tl','tr','bl','br'] as const).map((pos) => (
                  <svg
                    key={pos}
                    className="absolute w-[7%] h-[14%] text-[#1B4332]"
                    style={{
                      top: pos.startsWith('t') ? 2 : 'auto',
                      bottom: pos.startsWith('b') ? 2 : 'auto',
                      left: pos.endsWith('l') ? 2 : 'auto',
                      right: pos.endsWith('r') ? 2 : 'auto',
                      transform: `scaleX(${pos.endsWith('r') ? -1 : 1}) scaleY(${pos.startsWith('b') ? -1 : 1})`,
                    }}
                    viewBox="0 0 60 60"
                    fill="none"
                  >
                    <rect x="0" y="0" width="60" height="10" fill="#1B4332" />
                    <rect x="0" y="0" width="10" height="60" fill="#1B4332" />
                    <rect x="14" y="14" width="14" height="14" fill="#C9A66B" />
                  </svg>
                ))}

                {/* ── Content ── */}
                <div className="absolute inset-0 flex flex-col px-[6%] pt-[8%] pb-[4%]">

                  {/* Medallion – top centre (absolutely centred, overlapping top border) */}
                  <div className="absolute left-1/2 -translate-x-1/2 -top-[5%] z-10 w-[13%]">
                    <motion.img
                      src="/images/Gemini_Generated_Image_k3ckhuk3ckhuk3ck.png"
                      alt="The Last Plate Seal"
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 160, damping: 14, delay: 0.15 }}
                      className="w-full drop-shadow-xl"
                    />
                  </div>

                  {/* Top-right metadata */}
                  <div className="absolute right-[8%] top-[7%] text-right">
                    {[
                      ['Certificate No:', certData.certificateNumber],
                      ['Unique ID:', certData.uniqueId],
                      ['Issued:', issueDateFormatted],
                    ].map(([label, val]) => (
                      <div key={label} className="flex items-baseline justify-end gap-1.5 leading-snug">
                        <span className="font-semibold text-[clamp(5px,0.85vw,8px)] text-[#3d2010]">{label}</span>
                        <span className="text-[clamp(5px,0.85vw,8px)] text-[#5a3820]">{val}</span>
                      </div>
                    ))}
                  </div>

                  {/* Title block — pushed down to clear medallion */}
                  <div className="mt-[11%] text-center">
                    <h2
                      className="font-bold tracking-[0.1em] text-[#2d1a08]"
                      style={{ fontSize: 'clamp(14px, 3.2vw, 36px)', fontVariant: 'small-caps' }}
                    >
                      Certificate of Appreciation
                    </h2>
                    {/* Gold rule */}
                    <div className="mx-auto mt-1 mb-1.5 h-[1.5px] w-[60%] bg-gradient-to-r from-transparent via-[#C9A66B] to-transparent" />
                    <p className="italic text-[#5a3820]" style={{ fontSize: 'clamp(7px, 1.1vw, 13px)' }}>
                      This certificate is proudly presented to
                    </p>
                  </div>

                  {/* Recipient name */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center my-[1.5%]"
                  >
                    <h3
                      className="font-bold text-[#1a0d03] leading-none"
                      style={{ fontSize: 'clamp(18px, 4.5vw, 52px)', fontFamily: 'Georgia, serif' }}
                    >
                      {certData.volunteerName}
                    </h3>
                    <div className="mx-auto mt-1 h-[1.5px] w-[40%] bg-gradient-to-r from-transparent via-[#C9A66B] to-transparent" />
                  </motion.div>

                  {/* Body recognition text */}
                  <p
                    className="text-center text-[#3d2010] leading-relaxed px-[5%]"
                    style={{ fontSize: 'clamp(6px, 1vw, 11px)' }}
                  >
                    in recognition of outstanding dedication and selfless service in redistributing surplus food
                    from hotels and events to communities in need through The Last Plate – FoodBridge Initiative.
                    Your commitment has helped reduce food waste and bring hope to those who need it most.
                  </p>

                  {/* Stats row */}
                  <div className="flex justify-center gap-[5%] mt-[2.5%] mb-[2%]">
                    {[
                      { Icon: Truck,  label: 'DELIVERIES COMPLETED', value: certData.deliveriesCount },
                      { Icon: Clock,  label: 'HOURS OF SERVICE',      value: Math.round(certData.hoursServed) },
                      { Icon: Users,  label: 'MEALS SAVED',           value: certData.totalMeals },
                    ].map(({ Icon, label, value }, i) => (
                      <motion.div
                        key={label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + i * 0.08 }}
                        className="flex items-center gap-[8%]"
                      >
                        {/* Gold circle icon */}
                        <div
                          className="rounded-full flex items-center justify-center shrink-0 shadow-md"
                          style={{
                            background: 'radial-gradient(circle at 35% 35%, #d4a85a, #9b7230)',
                            width: 'clamp(22px, 3.5vw, 42px)',
                            height: 'clamp(22px, 3.5vw, 42px)',
                          }}
                        >
                          <Icon className="text-white" style={{ width: 'clamp(10px, 1.6vw, 19px)', height: 'clamp(10px, 1.6vw, 19px)' }} />
                        </div>
                        <div>
                          <p
                            className="font-bold text-[#1a0d03] leading-none"
                            style={{ fontSize: 'clamp(12px, 2.4vw, 28px)' }}
                          >
                            {value}
                          </p>
                          <p
                            className="font-semibold text-[#5a3820] tracking-wide"
                            style={{ fontSize: 'clamp(4.5px, 0.7vw, 8px)' }}
                          >
                            {label}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Bottom three-column row */}
                  <div className="mt-auto grid grid-cols-3 items-end gap-4">
                    {/* LEFT — Signatory */}
                    <div>
                      <p className="text-[#3d2010] mb-1" style={{ fontSize: 'clamp(5px, 0.85vw, 9px)' }}>
                        Authorized Signatory:
                      </p>
                      <p
                        className="italic text-[#1a0d03]"
                        style={{ fontSize: 'clamp(9px, 1.6vw, 18px)', fontFamily: 'Georgia, serif' }}
                      >
                        The Last Plate Team
                      </p>
                      <div className="h-[1px] bg-[#8B5E3C]/40 my-1 w-[80%]" />
                      <p className="text-[#3d2010]" style={{ fontSize: 'clamp(4.5px, 0.75vw, 8.5px)' }}>The Last Plate Team</p>
                      <p className="text-[#3d2010]" style={{ fontSize: 'clamp(4.5px, 0.75vw, 8.5px)' }}>Authorized Signatory</p>
                      <p className="text-[#3d2010]" style={{ fontSize: 'clamp(4.5px, 0.75vw, 8.5px)' }}>Date: {issueDateFormatted}</p>
                    </div>

                    {/* CENTRE — Quote + footer motto */}
                    <div className="text-center flex flex-col items-center gap-1">
                      <p
                        className="italic text-[#3d2010] leading-snug"
                        style={{ fontSize: 'clamp(6px, 1vw, 11px)' }}
                      >
                        "Because the last plate you don't need,<br />might be the only meal they get."
                      </p>
                      <p
                        className="mt-1 text-[#1B4332] font-semibold tracking-wide"
                        style={{ fontSize: 'clamp(4.5px, 0.75vw, 8.5px)' }}
                      >
                        Save Food  •  Share Food  •  Serve Humanity
                      </p>
                    </div>

                    {/* RIGHT — QR */}
                    <div className="flex flex-col items-end gap-0.5">
                      <p className="text-[#3d2010] text-right" style={{ fontSize: 'clamp(4.5px, 0.75vw, 8.5px)' }}>
                        Scan to Verify<br />Authentic Certificate →
                      </p>
                      {qrUrl ? (
                        <img
                          src={qrUrl}
                          alt="QR Code"
                          className="border border-[#C9A66B]/50 rounded"
                          style={{ width: 'clamp(36px, 6vw, 68px)', height: 'clamp(36px, 6vw, 68px)' }}
                        />
                      ) : (
                        <div
                          className="bg-white/60 rounded flex items-center justify-center border border-[#C9A66B]/30"
                          style={{ width: 'clamp(36px, 6vw, 68px)', height: 'clamp(36px, 6vw, 68px)' }}
                        >
                          <QrCode className="text-[#5a3820]" style={{ width: 'clamp(18px, 3vw, 34px)', height: 'clamp(18px, 3vw, 34px)' }} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Action buttons */}
        {certData && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap justify-center gap-3 mt-8 print:hidden">
            <RippleButton onClick={downloadPDF} variant="primary">
              <Download className="h-4 w-4" /> Download PDF
            </RippleButton>
            <RippleButton onClick={() => window.print()} variant="secondary">
              <Printer className="h-4 w-4" /> Print
            </RippleButton>
            <RippleButton onClick={saveToMyCertificates} variant="ghost">
              <Save className="h-4 w-4" /> {saved ? 'Saved!' : 'Save to My Certificates'}
            </RippleButton>
            <Link to="/services/certificate-history">
              <RippleButton variant="ghost"><Award className="h-4 w-4" /> My Certificates</RippleButton>
            </Link>
          </motion.div>
        )}

        {/* Info strip */}
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
                <p className="text-ink-soft/60 dark:text-cream/40 text-xs">Certificate No</p>
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

        <div className="text-center mt-6 print:hidden">
          <Link to="/dashboard/volunteer">
            <RippleButton variant="ghost"><ArrowLeft className="h-4 w-4" /> Back to Dashboard</RippleButton>
          </Link>
        </div>
      </section>

      {/* Success popup */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
                  style={{ left: `${10 + i * 7}%`, top: '-10px', background: i % 3 === 0 ? '#1B4332' : i % 3 === 1 ? '#8B5E3C' : '#C9A66B' }}
                  initial={{ y: -20, opacity: 1 }}
                  animate={{ y: [0, 300, 400], opacity: [1, 1, 0], rotate: 360 }}
                  transition={{ duration: 2, delay: i * 0.1, repeat: Infinity, repeatDelay: 1 }}
                />
              ))}
              <button onClick={() => setShowSuccess(false)} className="absolute top-4 right-4 text-ink-soft/60 hover:text-ink dark:text-cream/40"><X className="h-5 w-5" /></button>
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="h-20 w-20 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-5 shadow-xl"
              >
                <PartyPopper className="h-10 w-10 text-white" />
              </motion.div>
              <h2 className="font-display text-2xl font-bold mb-2">Certificate Downloaded!</h2>
              <p className="text-sm text-ink-soft dark:text-cream/60 mb-1">Your certificate has been saved to your device.</p>
              {certData && (
                <div className="flex items-center justify-center gap-2 text-xs text-ink-soft/60 dark:text-cream/40 mb-6">
                  <Sparkles className="h-3 w-3 text-accent-500" />
                  No: {certData.certificateNumber}
                  <Sparkles className="h-3 w-3 text-accent-500" />
                </div>
              )}
              <div className="flex flex-col gap-3">
                <RippleButton onClick={() => setShowSuccess(false)} variant="primary" fullWidth>View Certificate</RippleButton>
                <Link to="/services/certificate-history" onClick={() => setShowSuccess(false)}>
                  <RippleButton variant="ghost" fullWidth>All My Certificates</RippleButton>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
