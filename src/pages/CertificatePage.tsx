import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Printer, Award, ShieldCheck, Calendar, Hash, QrCode, PartyPopper, X, Sparkles } from 'lucide-react';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import { RippleButton } from '@/components/ui/RippleButton';

export function CertificatePage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [qrUrl, setQrUrl] = useState('');
  const [certNumber, setCertNumber] = useState('');
  const [uniqueId, setUniqueId] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  const issueDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const completionDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    const num = `FB-${Date.now().toString(36).toUpperCase()}`;
    const uid = `UID-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    setCertNumber(num);
    setUniqueId(uid);

    const verifyUrl = `${window.location.origin}/verify-certificate?cert=${num}`;
    QRCode.toDataURL(verifyUrl, { width: 150, margin: 1, color: { dark: '#16a34a', light: '#ffffff' } })
      .then(setQrUrl)
      .catch(() => {});

    if (user && profile) {
      supabase.from('certificates').insert({
        volunteer_id: user.id,
        certificate_number: num,
        completion_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        deliveries_count: profile.total_deliveries,
        hours_served: profile.total_hours,
      }).then();
    }
  }, [user, profile]);

  const downloadPDF = () => {
    if (!certificateRef.current) return;
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const w = pdf.internal.pageSize.getWidth();
    const h = pdf.internal.pageSize.getHeight();

    // Background
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, w, h, 'F');

    // Outer border
    pdf.setDrawColor(22, 163, 74);
    pdf.setLineWidth(2);
    pdf.rect(8, 8, w - 16, h - 16);
    pdf.setLineWidth(0.5);
    pdf.rect(12, 12, w - 24, h - 24);

    // Logo placeholder circle
    pdf.setFillColor(22, 163, 74);
    pdf.circle(w / 2, 35, 10, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('FB', w / 2, 38, { align: 'center' });

    // Title
    pdf.setTextColor(22, 163, 74);
    pdf.setFontSize(28);
    pdf.text('Certificate of Achievement', w / 2, 58, { align: 'center' });

    pdf.setTextColor(120, 120, 120);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text('The Last Plate Initiative', w / 2, 66, { align: 'center' });

    // Volunteer name
    pdf.setTextColor(20, 20, 20);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text(profile?.full_name ?? 'Volunteer', w / 2, 90, { align: 'center' });

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    pdf.setTextColor(100, 100, 100);
    pdf.text('has successfully completed volunteer service with FoodBridge', w / 2, 100, { align: 'center' });
    pdf.text(`delivering ${profile?.total_deliveries ?? 0} meals and serving ${Math.round(profile?.total_hours ?? 0)} volunteer hours`, w / 2, 108, { align: 'center' });

    // Certificate number & UID
    pdf.setFontSize(9);
    pdf.text(`Certificate No: ${certNumber}`, w / 2 - 50, 130);
    pdf.text(`Unique ID: ${uniqueId}`, w / 2 + 50, 130, { align: 'right' });

    // Dates
    pdf.text(`Issue Date: ${issueDate}`, 25, 150);
    pdf.text(`Completion Date: ${completionDate}`, w - 25, 150, { align: 'right' });

    // Signature
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(16);
    pdf.text('Arjun Sharma', 40, 165);
    pdf.setDrawColor(150, 150, 150);
    pdf.line(30, 168, 80, 168);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Founder, FoodBridge', 40, 173, { align: 'center' });

    // Stamp circle
    pdf.setDrawColor(249, 115, 22);
    pdf.setLineWidth(1.5);
    pdf.circle(w - 50, 165, 12);
    pdf.setFontSize(7);
    pdf.setTextColor(249, 115, 22);
    pdf.text('OFFICIAL', w - 50, 163, { align: 'center' });
    pdf.text('SEAL', w - 50, 168, { align: 'center' });

    // QR code
    if (qrUrl) {
      pdf.addImage(qrUrl, 'PNG', w - 35, 130, 20, 20);
    }

    pdf.save(`FoodBridge-Certificate-${profile?.full_name ?? 'volunteer'}.pdf`);
    toast('Certificate downloaded!', 'success');
    setShowSuccess(true);
  };

  return (
    <div className="pt-20 min-h-screen gradient-bg">
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <span className="badge bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 mb-4">
            <Award className="h-3.5 w-3.5" /> Volunteer Certificate
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold">Your Certificate of Achievement</h1>
          <p className="text-gray-500 mt-2">Download, print, and share your contribution to The Last Plate Initiative.</p>
        </motion.div>

        {/* Certificate preview */}
        <motion.div
          ref={certificateRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative bg-white rounded-3xl shadow-2xl overflow-hidden mx-auto"
          style={{ aspectRatio: '1.414 / 1', maxWidth: '900px' }}
        >
          {/* Border */}
          <div className="absolute inset-3 border-4 border-primary-600 rounded-2xl" />
          <div className="absolute inset-5 border border-primary-400 rounded-xl" />

          {/* Decorative corners */}
          {['top-6 left-6', 'top-6 right-6', 'bottom-6 left-6', 'bottom-6 right-6'].map((pos, i) => (
            <div key={i} className={`absolute ${pos} h-12 w-12`}>
              <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-primary-500 to-accent-500 rounded-full" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full" />
            </div>
          ))}

          {/* Content */}
          <div className="relative h-full flex flex-col items-center justify-center text-center px-8 sm:px-16 py-10">
            {/* Logo */}
            <motion.img
              src="/logo.png"
              alt="FoodBridge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="h-16 w-16 object-contain mb-3"
            />
            <p className="text-xs font-semibold text-primary-600 uppercase tracking-widest mb-1">The Last Plate Initiative</p>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-gray-900 mb-1">Certificate of Achievement</h2>
            <div className="h-0.5 w-20 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full my-3" />

            <p className="text-sm text-gray-500 mb-1">This certificate is proudly presented to</p>
            <p className="font-display text-2xl sm:text-3xl font-bold gradient-text mb-2">{profile?.full_name ?? 'Volunteer'}</p>

            <p className="text-xs sm:text-sm text-gray-600 max-w-md leading-relaxed">
              for their dedicated service as a volunteer with FoodBridge, delivering <span className="font-semibold text-primary-600">{profile?.total_deliveries ?? 0} meals</span> and serving <span className="font-semibold text-primary-600">{Math.round(profile?.total_hours ?? 0)} hours</span> to fight food waste and hunger.
            </p>

            {/* Bottom row */}
            <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between text-xs text-gray-500">
              <div className="text-left">
                <p className="font-display italic text-gray-800 text-sm">Arjun Sharma</p>
                <div className="h-px w-24 bg-gray-300 my-1" />
                <p>Founder, FoodBridge</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                {qrUrl && <img src={qrUrl} alt="QR" className="h-16 w-16 rounded-lg" />}
                <p className="text-[10px] flex items-center gap-1"><QrCode className="h-2.5 w-2.5" /> Scan to verify</p>
              </div>
              <div className="text-right">
                <div className="h-12 w-12 rounded-full border-2 border-accent-500 flex items-center justify-center text-accent-600 font-bold text-[10px] ml-auto mb-1">
                  <div className="text-center leading-tight">
                    <div>OFFICIAL</div>
                    <div>SEAL</div>
                  </div>
                </div>
                <p className="text-[10px]">Issue Date: {issueDate}</p>
              </div>
            </div>

            {/* Cert numbers top */}
            <div className="absolute top-8 left-8 right-8 flex justify-between text-[10px] text-gray-400">
              <p className="flex items-center gap-1"><Hash className="h-2.5 w-2.5" /> {certNumber}</p>
              <p className="flex items-center gap-1"><ShieldCheck className="h-2.5 w-2.5" /> {uniqueId}</p>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap justify-center gap-4 mt-8">
          <RippleButton onClick={downloadPDF} variant="primary"><Download className="h-4 w-4" /> Download PDF</RippleButton>
          <RippleButton onClick={() => window.print()} variant="secondary"><Printer className="h-4 w-4" /> Print</RippleButton>
        </motion.div>

        {/* Info */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 mt-8 max-w-2xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-sm">
            <div>
              <Calendar className="h-5 w-5 text-primary-500 mx-auto mb-1" />
              <p className="text-gray-400 text-xs">Issue Date</p>
              <p className="font-medium">{issueDate}</p>
            </div>
            <div>
              <Calendar className="h-5 w-5 text-accent-500 mx-auto mb-1" />
              <p className="text-gray-400 text-xs">Completion Date</p>
              <p className="font-medium">{completionDate}</p>
            </div>
            <div>
              <Award className="h-5 w-5 text-primary-500 mx-auto mb-1" />
              <p className="text-gray-400 text-xs">Deliveries</p>
              <p className="font-medium">{profile?.total_deliveries ?? 0}</p>
            </div>
          </div>
        </motion.div>
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
              {/* Confetti dots */}
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute h-2 w-2 rounded-full"
                  style={{
                    left: `${10 + i * 7}%`,
                    top: '-10px',
                    background: i % 3 === 0 ? '#16a34a' : i % 3 === 1 ? '#f97316' : '#fbbf24',
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
                className="h-20 w-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-primary-500/40"
              >
                <PartyPopper className="h-10 w-10 text-white" />
              </motion.div>
              <h2 className="font-display text-2xl font-bold mb-2">Certificate Generated!</h2>
              <p className="text-sm text-gray-500 mb-1">Your certificate has been downloaded successfully.</p>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mb-6">
                <Sparkles className="h-3 w-3 text-accent-500" />
                Certificate No: {certNumber}
                <Sparkles className="h-3 w-3 text-accent-500" />
              </div>
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
