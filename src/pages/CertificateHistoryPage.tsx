import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, Download, Eye, Calendar, Hash, Package, Clock, ShieldCheck, ArrowLeft, Plus, Sparkles, MapPin, Printer, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import type { Certificate } from '@/types';
import { RippleButton } from '@/components/ui/RippleButton';
import { fadeInUp, staggerContainer, AnimatedCounter } from '@/lib/animations';
import { generateCertificatePDF, generateQRCode, type CertificateData } from '@/lib/certificate';

import { PageNav } from '@/components/PageNav';
export function CertificateHistoryPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      // Fetch certificates where the user is either the donor or the volunteer
      const { data: donorCerts } = await supabase
        .from('certificates')
        .select('*')
        .eq('donor_id', user.id)
        .order('created_at', { ascending: false });
      const { data: volCerts } = await supabase
        .from('certificates')
        .select('*')
        .eq('volunteer_id', user.id)
        .order('created_at', { ascending: false });
      const all = [...(donorCerts as Certificate[] ?? []), ...(volCerts as Certificate[] ?? [])];
      // Deduplicate by id and sort by created_at desc
      const unique = all.filter((c, idx, arr) => arr.findIndex((x) => x.id === c.id) === idx);
      unique.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setCerts(unique);
      setLoading(false);
    };
    load();
  }, [user]);

  const downloadCert = async (cert: Certificate) => {
    setDownloading(cert.id);
    const verifyUrl = `${window.location.origin}/services/verify-certificate/${cert.certificate_number}`;
    const qr = await generateQRCode(verifyUrl);
    const data: CertificateData = {
      certificateNumber: cert.certificate_number,
      uniqueId: cert.unique_id ?? 'UID-XXXX',
      volunteerName: cert.volunteer_name ?? profile?.full_name ?? 'Volunteer',
      organizationName: cert.organization_name ?? 'FoodBridge',
      issueDate: cert.issue_date,
      deliveriesCount: cert.deliveries_count,
      hoursServed: cert.hours_served,
      totalMeals: cert.total_meals,
      qrCodeUrl: verifyUrl,
      verifyUrl,
    };
    await generateCertificatePDF(data, qr);
    toast('Certificate PDF downloaded!', 'success');
    setDownloading(null);
  };

  const totalDeliveries = certs.reduce((sum, c) => sum + c.deliveries_count, 0);
  const totalHours = certs.reduce((sum, c) => sum + c.hours_served, 0);
  const totalMeals = certs.reduce((sum, c) => sum + c.total_meals, 0);

  return (
    <div className="pt-20 min-h-screen gradient-bg">
      <PageNav crumbs={[{ label: 'Certificates' }, { label: 'My Certificates', icon: Award }]} />

      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold">My Certificates</h1>
            <p className="text-ink-soft dark:text-cream/60 mt-1">All your donor and volunteer appreciation certificates in one place.</p>
          </div>
          <Link to="/services/certificates">
            <RippleButton variant="primary"><Plus className="h-4 w-4" /> Generate New</RippleButton>
          </Link>
        </motion.div>

        {/* Summary stats */}
        {certs.length > 0 && (
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Certificates', value: certs.length, icon: Award, color: 'from-primary-500 to-primary-600' },
              { label: 'Total Deliveries', value: totalDeliveries, icon: Package, color: 'from-accent-500 to-red-500' },
              { label: 'Hours Served', value: Math.round(totalHours), icon: Clock, color: 'from-secondary-500 to-primary-500' },
              { label: 'Meals Saved', value: totalMeals, icon: Sparkles, color: 'from-yellow-500 to-accent-500' },
            ].map((s) => (
              <motion.div key={s.label} variants={fadeInUp} className="card p-5">
                <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center mb-3 shadow-lg`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <p className="font-display text-2xl font-bold"><AnimatedCounter value={s.value} /></p>
                <p className="text-xs text-ink-soft/60 dark:text-cream/40">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-oat dark:bg-secondary-800 rounded-2xl animate-pulse" />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && certs.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-12 text-center">
            <div className="h-20 w-20 rounded-full bg-oat dark:bg-secondary-800 flex items-center justify-center mx-auto mb-5">
              <Award className="h-10 w-10 text-ink-soft/40 dark:text-cream/30" />
            </div>
            <h2 className="font-display text-xl font-bold mb-2">No certificates yet</h2>
            <p className="text-ink-soft dark:text-cream/60 mb-6">Volunteers earn certificates automatically after completing deliveries. Donors can generate certificates for completed donations.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/dashboard/volunteer"><RippleButton variant="primary">Go to Dashboard</RippleButton></Link>
              <Link to="/services/certificates"><RippleButton variant="secondary">Generate Certificate</RippleButton></Link>
            </div>
          </motion.div>
        )}

        {/* Certificate cards */}
        {!loading && certs.length > 0 && (
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {certs.map((cert) => (
              <motion.div
                key={cert.id}
                variants={fadeInUp}
                whileHover={{ y: -4 }}
                className="card p-6 relative overflow-hidden group"
              >
                {/* Accent bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-500 to-accent-500" />

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white shadow-lg">
                      <Award className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-display font-bold">{cert.donor_name ?? cert.volunteer_name ?? 'Unknown'}</p>
                      <p className="text-xs text-ink-soft/60 dark:text-cream/40 flex items-center gap-1">
                        <Hash className="h-3 w-3" /> {cert.certificate_number}
                      </p>
                      {cert.donation_id && <span className="badge bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 text-[9px]">Donor</span>}
                      {cert.volunteer_id && !cert.donation_id && <span className="badge bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[9px]">Volunteer</span>}
                    </div>
                  </div>
                  {cert.is_valid ? (
                    <span className="badge bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                      <ShieldCheck className="h-3 w-3" /> Valid
                    </span>
                  ) : (
                    <span className="badge bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">Revoked</span>
                  )}
                </div>

                {/* Donation details (for donor certs) */}
                {cert.donation_id && cert.food_name && (
                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="h-3.5 w-3.5 text-accent-500" />
                      <span className="text-ink-soft/60 dark:text-cream/40">Food:</span>
                      <span className="font-medium">{cert.food_name}</span>
                    </div>
                    {cert.food_quantity && (
                      <div className="flex items-center gap-2 text-sm">
                        <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
                        <span className="text-ink-soft/60 dark:text-cream/40">Quantity:</span>
                        <span className="font-medium">{cert.food_quantity}</span>
                      </div>
                    )}
                    {cert.delivery_location && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-3.5 w-3.5 text-primary-500" />
                        <span className="text-ink-soft/60 dark:text-cream/40">Location:</span>
        <span className="font-medium">{cert.delivery_location}</span>
                      </div>
                    )}
                    {cert.volunteer_name && (
                      <div className="flex items-center gap-2 text-sm">
                        <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
                        <span className="text-ink-soft/60 dark:text-cream/40">Volunteer:</span>
                        <span className="font-medium">{cert.volunteer_name}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Stats grid (for volunteer certs) */}
                {cert.volunteer_id && !cert.donation_id && (
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center p-2 rounded-xl bg-oat dark:bg-secondary-800/50">
                      <Package className="h-4 w-4 text-accent-500 mx-auto mb-1" />
                      <p className="font-bold text-sm">{cert.deliveries_count}</p>
                      <p className="text-[10px] text-ink-soft/60 dark:text-cream/40">Deliveries</p>
                    </div>
                    <div className="text-center p-2 rounded-xl bg-oat dark:bg-secondary-800/50">
                      <Clock className="h-4 w-4 text-primary-500 mx-auto mb-1" />
                      <p className="font-bold text-sm">{Math.round(cert.hours_served)}</p>
                      <p className="text-[10px] text-ink-soft/60 dark:text-cream/40">Hours</p>
                    </div>
                    <div className="text-center p-2 rounded-xl bg-oat dark:bg-secondary-800/50">
                      <Sparkles className="h-4 w-4 text-yellow-500 mx-auto mb-1" />
                      <p className="font-bold text-sm">{cert.total_meals}</p>
                      <p className="text-[10px] text-ink-soft/60 dark:text-cream/40">Meals</p>
                    </div>
                  </div>
                )}

                {/* Meals for donor certs */}
                {cert.donation_id && (
                  <div className="grid grid-cols-1 gap-2 mb-4">
                    <div className="text-center p-2 rounded-xl bg-oat dark:bg-secondary-800/50">
                      <Sparkles className="h-4 w-4 text-yellow-500 mx-auto mb-1" />
                      <p className="font-bold text-sm">{cert.total_meals}</p>
                      <p className="text-[10px] text-ink-soft/60 dark:text-cream/40">Meals Provided</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-ink-soft/60 dark:text-cream/40 mb-4">
                  <Calendar className="h-3.5 w-3.5" />
                  Issued on {new Date(cert.issue_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>

                <div className="flex gap-2">
                  <RippleButton onClick={() => downloadCert(cert)} variant="primary" fullWidth disabled={downloading === cert.id}>
                    {downloading === cert.id ? <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <Download className="h-4 w-4" />}
                    Download
                  </RippleButton>
                  <Link to={`/services/verify-certificate/${cert.certificate_number}`}>
                    <RippleButton variant="ghost"><Eye className="h-4 w-4" /></RippleButton>
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Back */}
        <div className="text-center mt-8">
          <Link to="/dashboard/volunteer">
            <RippleButton variant="ghost"><ArrowLeft className="h-4 w-4" /> Back to Dashboard</RippleButton>
          </Link>
        </div>
      </section>
    </div>
  );
}
