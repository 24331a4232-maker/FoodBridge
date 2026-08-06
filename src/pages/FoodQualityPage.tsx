import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import {
  ShieldCheck, Sparkles, UtensilsCrossed, CheckCircle2, ChefHat, Heart,
  Package, Thermometer, Eye, ClipboardCheck, Truck,
  Leaf, Lock, BadgeCheck, Award, Download, QrCode, Hash, Calendar, X,
  CheckCircle, AlertTriangle, XCircle, Clock, HandHeart, Users, Building2, Utensils,
  ZoomIn, ZoomOut, Maximize, Printer, ScanLine,
} from 'lucide-react';
import { RippleButton } from '@/components/ui/RippleButton';
import { Illustration } from '@/components/Illustration';
import { fadeInUp, scaleIn, slideInRight, staggerContainer } from '@/lib/animations';

const IVORY = '#FFFFFF';

const inspectionSteps = [
  { icon: Package, title: 'Food Collected', desc: 'Surplus food is picked up from hotels, events and restaurants in sealed containers.', color: 'from-primary-500 to-primary-400' },
  { icon: Eye, title: 'Visual Inspection', desc: 'Trained volunteers check appearance, aroma and signs of spoilage.', color: 'from-primary-400 to-primary-300' },
  { icon: Thermometer, title: 'Temperature Check', desc: 'Food temperature is measured to confirm safe storage conditions.', color: 'from-primary-300 to-primary-200' },
  { icon: ClipboardCheck, title: 'Packaging Verification', desc: 'Containers are inspected for cleanliness, sealing and food-grade material.', color: 'from-secondary-400 to-secondary-300' },
  { icon: ShieldCheck, title: 'Volunteer Approval', desc: 'A certified volunteer signs off the donation as safe for redistribution.', color: 'from-secondary-500 to-secondary-400' },
  { icon: Truck, title: 'Delivered Safely', desc: 'Verified food is transported and handed to partner shelters and kitchens.', color: 'from-accent-500 to-accent-400' },
];

const safetyChecklist = [
  { label: 'Freshly Prepared', icon: UtensilsCrossed },
  { label: 'Proper Packaging', icon: Package },
  { label: 'No Spoilage', icon: CheckCircle2 },
  { label: 'Safe Temperature', icon: Thermometer },
  { label: 'Vegetarian / Non-Veg Label', icon: Leaf },
  { label: 'Expiry Checked', icon: Clock },
  { label: 'Clean Containers', icon: ShieldCheck },
];

const qualityBadges = [
  { label: 'Fresh Certified', icon: Leaf, color: 'from-primary-500 to-primary-400' },
  { label: 'Hygienically Packed', icon: Lock, color: 'from-primary-400 to-primary-300' },
  { label: 'Temperature Verified', icon: Thermometer, color: 'from-accent-500 to-accent-400' },
  { label: 'NGO Approved', icon: BadgeCheck, color: 'from-primary-600 to-primary-500' },
  { label: 'Safe To Donate', icon: ShieldCheck, color: 'from-accent-600 to-accent-500' },
];

const galleryItems = [
  { title: 'Donation Handover', illustration: 'donation' as const },
  { title: 'Volunteer Inspection', illustration: 'quality' as const },
  { title: 'Delivery Run', illustration: 'delivery' as const },
  { title: 'Community Sharing', illustration: 'community' as const },
  { title: 'Shelter Arrival', illustration: 'shelter' as const },
];

const approvalStatuses = [
  { label: 'Accepted', icon: CheckCircle, color: 'from-primary-500 to-primary-400', bg: 'bg-primary-50 dark:bg-primary-900/20', text: 'text-primary-700 dark:text-primary-300', desc: 'Passed all quality checks and approved for delivery.' },
  { label: 'Needs Repacking', icon: AlertTriangle, color: 'from-accent-500 to-accent-400', bg: 'bg-accent-50 dark:bg-accent-900/20', text: 'text-accent-700 dark:text-accent-300', desc: 'Food is safe but requires repackaging before delivery.' },
  { label: 'Rejected', icon: XCircle, color: 'from-red-500 to-red-500', bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-300', desc: 'Did not meet safety standards and cannot be donated.' },
  { label: 'Pending Inspection', icon: Clock, color: 'from-secondary-500 to-secondary-400', bg: 'bg-secondary-50 dark:bg-secondary-900/20', text: 'text-secondary-700 dark:text-secondary-300', desc: 'Awaiting volunteer inspection before approval.' },
];

interface LiveStats {
  mealsVerified: number;
  qualityScore: number;
  partnerHotels: number;
  qualityVolunteers: number;
}

interface ScoreCategory {
  label: string;
  percent: number;
}

interface CertificateInfo {
  id: string;
  uniqueId: string;
  issuedTo: string;
  inspectionDate: string;
  expiryDate: string;
  foodCategory: string;
  grade: string;
  inspector: string;
  signature: string;
  verifyUrl: string;
}

const defaultStats: LiveStats = { mealsVerified: 0, qualityScore: 0, partnerHotels: 0, qualityVolunteers: 0 };
const defaultScoreCategories: ScoreCategory[] = [
  { label: 'Freshness', percent: 0 },
  { label: 'Packaging', percent: 0 },
  { label: 'Temperature', percent: 0 },
  { label: 'Hygiene', percent: 0 },
];

function Counter({ value, suffix = '', className = '' }: { value: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 60, damping: 20 });
  useEffect(() => { if (inView) mv.set(value); }, [inView, value, mv]);
  useEffect(() => {
    return spring.on('change', (latest) => {
      if (ref.current) ref.current.textContent = `${Math.round(latest).toLocaleString()}${suffix}`;
    });
  }, [spring, suffix]);
  return <span ref={ref} className={className}>0{suffix}</span>;
}

function ScoreCircle({ score }: { score: number }) {
  const ref = useRef<SVGCircleElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 50, damping: 18 });
  useEffect(() => { if (inView) mv.set(score / 100); }, [inView, score, mv]);
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    return spring.on('change', (latest) => {
      setDisplay(Math.round(latest * 100));
      if (ref.current) ref.current.style.strokeDashoffset = `${circumference * (1 - latest)}`;
    });
  }, [spring, circumference]);
  return (
    <div className="relative h-56 w-56">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="14" className="dark:stroke-secondary-700" />
        <motion.circle
          ref={ref}
          cx="100" cy="100" r={radius} fill="none" stroke="url(#scoreGrad)" strokeWidth="14" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
        />
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1B4332" />
            <stop offset="100%" stopColor="#8B5E3C" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-5xl font-bold gradient-text">{display}%</span>
        <span className="text-xs text-ink-soft/60 dark:text-cream/40 uppercase tracking-wider mt-1">Overall Score</span>
      </div>
    </div>
  );
}

function CertificateDocument({ scale = 1 }: { scale?: number }) {
  return (
    <div
      className="relative bg-white shadow-2xl mx-auto origin-center"
      style={{ aspectRatio: '1.414 / 1', width: '100%', maxWidth: '1000px', transform: `scale(${scale})` }}
    >
      {/* Ivory paper texture */}
      <div className="absolute inset-0" style={{ backgroundColor: IVORY }} />
      {/* Teal & copper border */}
      <div className="absolute inset-3 border-[5px] border-primary-700 rounded-2xl" />
      <div className="absolute inset-5 border-2 border-gold-500/80 rounded-xl" />
      <div className="absolute inset-6 border border-primary-500/40 rounded-lg" />
      {/* Corner ornaments */}
      {[
        'top-8 left-8', 'top-8 right-8 rotate-90', 'bottom-8 left-8 -rotate-90', 'bottom-8 right-8 rotate-180',
      ].map((pos, i) => (
        <div key={i} className={`absolute ${pos} h-10 w-10`}>
          <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-primary-700 to-gold-500 rounded-full" />
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-700 to-gold-500 rounded-full" />
        </div>
      ))}
      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <img src="/logo.png" alt="" className="opacity-[0.04] h-64 w-64 object-contain" />
      </div>
      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-10 sm:px-16 py-10">
        {/* Top row */}
        <div className="absolute top-8 left-10 right-10 flex justify-between text-[10px] text-ink-soft/60 dark:text-cream/40">
          <p className="flex items-center gap-1"><Hash className="h-2.5 w-2.5" /> {certificateInfo.id}</p>
          <p className="flex items-center gap-1"><ShieldCheck className="h-2.5 w-2.5" /> {certificateInfo.uniqueId}</p>
        </div>
        {/* Logo */}
        <motion.img src="/logo.png" alt="FoodBridge" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ type: 'spring' }} className="h-16 w-16 object-contain mb-2 relative z-10" />
        <p className="text-[10px] font-semibold text-primary-700 uppercase tracking-[0.25em] mb-1">FoodBridge</p>
        {/* Title */}
        <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-ink dark:text-cream mb-1">Food Quality Certificate</h2>
        <p className="text-xs sm:text-sm text-ink-soft dark:text-cream/60 mb-2">Certified Safe for Redistribution</p>
        <div className="h-1 w-28 bg-gradient-to-r from-primary-700 to-gold-500 rounded-full my-3" />
        {/* Issued to */}
        <p className="text-sm text-ink-soft dark:text-cream/60 mb-1">Issued To</p>
        <p className="font-display text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary-700 to-accent-600 bg-clip-text text-transparent mb-2">{certificateInfo.issuedTo}</p>
        <div className="h-px w-48 bg-gradient-to-r from-primary-400 to-gold-400 my-2" />
        {/* Details grid */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs sm:text-sm mt-3 max-w-2xl">
          <div className="text-left"><p className="text-ink-soft/60 dark:text-cream/40 text-[10px] uppercase tracking-wide">Inspection Date</p><p className="font-medium text-ink-soft dark:text-cream/70">{certificateInfo.inspectionDate}</p></div>
          <div className="text-left"><p className="text-ink-soft/60 dark:text-cream/40 text-[10px] uppercase tracking-wide">Expiry Date</p><p className="font-medium text-ink-soft dark:text-cream/70">{certificateInfo.expiryDate}</p></div>
          <div className="text-left"><p className="text-ink-soft/60 dark:text-cream/40 text-[10px] uppercase tracking-wide">Food Category</p><p className="font-medium text-ink-soft dark:text-cream/70">{certificateInfo.foodCategory}</p></div>
          <div className="text-left"><p className="text-ink-soft/60 dark:text-cream/40 text-[10px] uppercase tracking-wide">Quality Grade</p><p className="font-display font-bold text-primary-700 text-lg">{certificateInfo.grade}</p></div>
        </div>
        {/* Bottom row: signature, seal, QR */}
        <div className="absolute bottom-9 left-12 right-12 flex items-end justify-between">
          <div className="text-left">
            <p className="font-display italic text-ink dark:text-cream text-sm" style={{ fontFamily: 'Georgia, serif' }}>{certificateInfo.signature}</p>
            <div className="h-px w-24 bg-linen dark:bg-secondary-600 my-1" />
            <p className="text-[10px] text-ink-soft dark:text-cream/60">{certificateInfo.inspector}, Certified Inspector</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="h-14 w-14 rounded-full border-2 border-gold-500 flex items-center justify-center text-gold-600 font-bold text-[8px] relative bg-gold-50">
              <div className="absolute inset-1 rounded-full border border-gold-400" />
              <div className="text-center leading-tight"><div>OFFICIAL</div><div>SEAL</div><div className="text-[6px] mt-0.5">FOODBRIDGE</div></div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="h-14 w-14 rounded-lg bg-white border border-linen dark:border-secondary-700 flex items-center justify-center">
              <QrCode className="h-8 w-8 text-primary-700" />
            </div>
            <p className="text-[9px] text-ink-soft/60 dark:text-cream/40 flex items-center gap-1"><QrCode className="h-2.5 w-2.5" /> Scan to verify</p>
          </div>
        </div>
        {/* Verified stamp */}
        <div className="absolute bottom-24 right-12 rotate-[-12deg]">
          <div className="border-[3px] border-primary-600 rounded-full px-4 py-1.5 text-primary-700 font-display font-bold text-sm tracking-wider opacity-80">
            VERIFIED
          </div>
        </div>
        {/* Bottom dates */}
        <div className="absolute bottom-3 left-12 right-12 flex justify-between text-[9px] text-ink-soft/60 dark:text-cream/40">
          <p>Organization: FoodBridge</p>
          <p>Grade: {certificateInfo.grade} — Status: Verified</p>
        </div>
      </div>
    </div>
  );
}

import { PageNav } from '@/components/PageNav';
export function FoodQualityPage() {
  const [checked, setChecked] = useState<Record<number, boolean>>({ 0: true, 1: true, 2: true, 3: true, 4: true, 5: true, 6: true });
  const [certModal, setCertModal] = useState(false);
  const [certScale, setCertScale] = useState(1);
  const [stats, setStats] = useState<LiveStats>(defaultStats);
  const [scoreCategories, setScoreCategories] = useState<ScoreCategory[]>(defaultScoreCategories);
  const [certificateInfo, setCertificateInfo] = useState<CertificateInfo | null>(null);

  const toggle = (i: number) => setChecked((c) => ({ ...c, [i]: !c[i] }));

  useEffect(() => {
    (async () => {
      const [mealsRes, hotelsRes, volsRes, inspectionsRes, certRes] = await Promise.all([
        supabase.from('food_donations').select('estimated_meals', { count: 'exact' }).not('quality_result', 'is', null),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'restaurant'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'volunteer'),
        supabase.from('food_quality_inspections').select('freshness, packaging, expiry_check, approval_status'),
        supabase.from('certificates').select('id, certificate_number, unique_id, organization_name, volunteer_name, issue_date, completion_date, total_meals').eq('is_valid', true).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      ]);

      const meals = mealsRes.data?.reduce((s, d) => s + (d.estimated_meals ?? 0), 0) ?? 0;
      const hotels = hotelsRes.count ?? 0;
      const vols = volsRes.count ?? 0;
      const inspections = inspectionsRes.data ?? [];

      const approved = inspections.filter((i) => i.approval_status === 'approved');
      const score = inspections.length > 0 ? Math.round((approved.length / inspections.length) * 100) : 0;

      setStats({ mealsVerified: meals, qualityScore: score, partnerHotels: hotels, qualityVolunteers: vols });

      if (inspections.length > 0) {
        const freshScore = Math.round((inspections.filter((i) => i.freshness === 'fresh').length / inspections.length) * 100);
        const pkgScore = Math.round((inspections.filter((i) => i.packaging === 'excellent' || i.packaging === 'good').length / inspections.length) * 100);
        const expScore = Math.round((inspections.filter((i) => i.expiry_check === 'pass').length / inspections.length) * 100);
        const hygScore = Math.round((approved.length / inspections.length) * 100);
        setScoreCategories([
          { label: 'Freshness', percent: freshScore },
          { label: 'Packaging', percent: pkgScore },
          { label: 'Temperature', percent: Math.round((expScore + freshScore) / 2) },
          { label: 'Hygiene', percent: hygScore },
        ]);
      }

      if (certRes.data) {
        const c = certRes.data;
        setCertificateInfo({
          id: c.certificate_number,
          uniqueId: c.unique_id ?? 'N/A',
          issuedTo: c.organization_name ?? c.volunteer_name ?? 'FoodBridge Partner',
          inspectionDate: c.issue_date ? new Date(c.issue_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A',
          expiryDate: c.completion_date ? new Date(c.completion_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A',
          foodCategory: 'Cooked Meals',
          grade: score >= 90 ? 'A+' : score >= 75 ? 'A' : score >= 60 ? 'B' : 'C',
          inspector: c.volunteer_name ?? 'FoodBridge Inspector',
          signature: c.volunteer_name ?? 'FoodBridge Team',
          verifyUrl: `${window.location.origin}/services/verify-certificate/${c.certificate_number}`,
        });
      }
    })();
  }, []);

  return (
    <div className="pt-20 min-h-screen" style={{ backgroundColor: IVORY }}>
      <PageNav crumbs={[{ label: 'Features' }, { label: 'Food Quality', icon: ShieldCheck }]} />

      {/* HERO */}
      <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 pt-12 pb-20 max-w-7xl mx-auto">
        {/* Gradient mesh background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 h-72 w-72 rounded-full bg-primary-300/20 dark:bg-primary-700/20 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-accent-300/20 dark:bg-accent-700/20 blur-3xl" />
          <div className="absolute top-1/3 right-1/3 h-40 w-40 rounded-full bg-gold-300/15 dark:bg-gold-700/15 blur-2xl" />
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div variants={staggerContainer} initial="hidden" animate="visible">
            <motion.span variants={fadeInUp} className="badge bg-primary-100 text-primary-700 mb-4">
              <ShieldCheck className="h-3.5 w-3.5" /> Trusted & Verified
            </motion.span>
            <motion.h1 variants={fadeInUp} className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Food Quality <span className="gradient-text">Verification</span>
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-ink-soft dark:text-cream/70 mt-4 text-lg max-w-xl leading-relaxed">
              Every meal donated through FoodBridge is inspected to ensure it is fresh, hygienic and safe before reaching people in need.
            </motion.p>
            {/* Trust pillars */}
            <motion.div variants={fadeInUp} className="flex flex-wrap gap-x-6 gap-y-2 mt-6">
              {['6-Step Inspection', 'Real-time Scoring', 'Verified Certificates'].map((p) => (
                <div key={p} className="flex items-center gap-1.5 text-sm text-ink-soft dark:text-cream/60">
                  <CheckCircle2 className="h-4 w-4 text-primary-500" /> {p}
                </div>
              ))}
            </motion.div>
            <motion.div variants={fadeInUp} className="flex flex-wrap gap-3 mt-8">
              <a href="#process"><RippleButton variant="primary"><ClipboardCheck className="h-4 w-4" /> Learn Inspection Process</RippleButton></a>
              <Link to="/register"><RippleButton variant="secondary"><ChefHat className="h-4 w-4" /> Become a Certified Donor</RippleButton></Link>
            </motion.div>
          </motion.div>

          {/* Animated illustration with floating indicators */}
          <motion.div variants={scaleIn} initial="hidden" animate="visible" className="relative flex items-center justify-center h-96">
            <div className="absolute h-72 w-72 rounded-full bg-gradient-to-br from-primary-200/40 to-accent-200/40 blur-3xl" />
            <motion.div animate={{ y: [0, -14, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="relative glass-card p-10 rounded-[2.5rem] shadow-2xl">
              <div className="relative h-40 w-40 flex items-center justify-center">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }} className="absolute inset-0 rounded-full border-2 border-dashed border-primary-300/60" />
                <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} className="h-28 w-28 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-xl">
                  <UtensilsCrossed className="h-12 w-12 text-white" />
                </motion.div>
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }} className="absolute -top-2 -right-2 h-12 w-12 rounded-full bg-white shadow-lg flex items-center justify-center">
                  <ShieldCheck className="h-7 w-7 text-primary-600" />
                </motion.div>
                <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} className="absolute -bottom-2 -left-2 h-12 w-12 rounded-full bg-white shadow-lg flex items-center justify-center">
                  <CheckCircle2 className="h-7 w-7 text-accent-500" />
                </motion.div>
              </div>
            </motion.div>
            {/* Floating quality score chips */}
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-4 left-0 glass-card px-3 py-2 rounded-xl shadow-lg flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-accent-500" />
              <div><p className="text-[10px] text-ink-soft/60 dark:text-cream/40 leading-none">Temperature</p><p className="text-sm font-bold text-ink-soft dark:text-cream/70">4°C Safe</p></div>
            </motion.div>
            <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="absolute bottom-6 right-0 glass-card px-3 py-2 rounded-xl shadow-lg flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary-500" />
              <div><p className="text-[10px] text-ink-soft/60 dark:text-cream/40 leading-none">Quality Score</p><p className="text-sm font-bold text-primary-600">98% A+</p></div>
            </motion.div>
            <motion.div animate={{ y: [0, -7, 0] }} transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-1/2 right-2 glass-card px-3 py-2 rounded-xl shadow-lg flex items-center gap-2">
              <Leaf className="h-4 w-4 text-green-500" />
              <div><p className="text-[10px] text-ink-soft/60 dark:text-cream/40 leading-none">Freshness</p><p className="text-sm font-bold text-green-600">Fresh</p></div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* QUALITY SCORE CARD */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 max-w-7xl mx-auto">
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} className="glass-card p-8 sm:p-12">
          <motion.div variants={fadeInUp} className="text-center mb-10">
            <span className="badge bg-accent-100 text-accent-700 mb-3"><Sparkles className="h-3.5 w-3.5" /> Live Assessment</span>
            <h2 className="section-title">Overall Quality Score</h2>
            <p className="section-subtitle">A composite score from our six-step inspection process.</p>
          </motion.div>
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <motion.div variants={scaleIn} className="flex justify-center"><ScoreCircle score={stats.qualityScore} /></motion.div>
            <motion.div variants={slideInRight} className="space-y-4">
              {scoreCategories.map((c) => (
                <div key={c.label} className="p-4 rounded-2xl bg-white/60 dark:bg-secondary-800/50 border border-linen dark:border-secondary-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-ink-soft dark:text-cream/70">{c.label}</span>
                    <span className="text-sm font-bold text-primary-600">{c.percent}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-linen dark:bg-secondary-700 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${c.percent}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                      className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500"
                    />
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* INSPECTION PROCESS TIMELINE */}
      <section id="process" className="px-4 sm:px-6 lg:px-8 py-16 max-w-7xl mx-auto">
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
          <span className="badge bg-primary-100 text-primary-700 mb-3"><ClipboardCheck className="h-3.5 w-3.5" /> Step by Step</span>
          <h2 className="section-title">Quality Inspection Process</h2>
          <p className="section-subtitle">Every donation passes through six rigorous verification stages.</p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {inspectionSteps.map((step, i) => (
            <motion.div key={step.title} variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} whileHover={{ y: -6 }} className="glass-card p-6 relative overflow-hidden">
              <div className={`absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br ${step.color} opacity-10`} />
              <div className="flex items-center gap-3 mb-3">
                <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${step.color} text-white flex items-center justify-center shadow-lg`}>
                  <step.icon className="h-6 w-6" />
                </div>
                <span className="font-display text-2xl font-bold text-linen dark:text-secondary-700">0{i + 1}</span>
              </div>
              <h3 className="font-display text-lg font-bold mb-1">{step.title}</h3>
              <p className="text-sm text-ink-soft dark:text-cream/60 leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FOOD SAFETY CHECKLIST */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 max-w-5xl mx-auto">
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-10">
          <span className="badge bg-accent-100 text-accent-700 mb-3"><CheckCircle2 className="h-3.5 w-3.5" /> Interactive</span>
          <h2 className="section-title">Food Safety Checklist</h2>
          <p className="section-subtitle">Tap each item to confirm it has been verified.</p>
        </motion.div>
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="max-w-md mx-auto mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-ink-soft dark:text-cream/70">Completion</span>
            <span className="text-sm font-bold text-primary-600">{Math.round((Object.values(checked).filter(Boolean).length / safetyChecklist.length) * 100)}%</span>
          </div>
          <div className="h-3 rounded-full bg-linen dark:bg-secondary-700 overflow-hidden">
            <motion.div
              animate={{ width: `${Math.round((Object.values(checked).filter(Boolean).length / safetyChecklist.length) * 100)}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-end pr-2"
            >
              {Object.values(checked).filter(Boolean).length === safetyChecklist.length && (
                <CheckCircle2 className="h-4 w-4 text-white" />
              )}
            </motion.div>
          </div>
        </motion.div>
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid sm:grid-cols-2 gap-4">
          {safetyChecklist.map((item, i) => (
            <motion.button key={item.label} variants={fadeInUp} onClick={() => toggle(i)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${checked[i] ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800' : 'bg-white/60 dark:bg-secondary-800/50 border-linen dark:border-secondary-700'}`}>
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${checked[i] ? 'bg-gradient-to-br from-primary-500 to-primary-500 text-white' : 'bg-oat dark:bg-secondary-700 text-ink-soft/60 dark:text-cream/40'}`}>
                <AnimatePresence mode="wait">
                  {checked[i] ? (
                    <motion.span key="check" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}><CheckCircle2 className="h-5 w-5" /></motion.span>
                  ) : (
                    <motion.span key="icon" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><item.icon className="h-5 w-5" /></motion.span>
                  )}
                </AnimatePresence>
              </div>
              <span className={`font-medium ${checked[i] ? 'text-primary-700 dark:text-primary-300' : 'text-ink-soft dark:text-cream/70'}`}>{item.label}</span>
            </motion.button>
          ))}
        </motion.div>
      </section>

      {/* QUALITY BADGES */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 max-w-7xl mx-auto">
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-10">
          <span className="badge bg-primary-100 text-primary-700 mb-3"><BadgeCheck className="h-3.5 w-3.5" /> Certified</span>
          <h2 className="section-title">Food Quality Badges</h2>
          <p className="section-subtitle">Each verified donation earns these trust badges.</p>
        </motion.div>
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex flex-wrap justify-center gap-5">
          {qualityBadges.map((b) => (
            <motion.div key={b.label} variants={scaleIn} whileHover={{ y: -8, scale: 1.05 }} className="glass-card px-6 py-5 flex items-center gap-3 cursor-default group">
              <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }} className={`h-12 w-12 rounded-full bg-gradient-to-br ${b.color} text-white flex items-center justify-center shadow-lg`}>
                <b.icon className="h-6 w-6" />
              </motion.div>
              <span className="font-display font-bold text-ink dark:text-cream">{b.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* GALLERY — mission illustrations */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 max-w-7xl mx-auto">
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-10">
          <span className="badge bg-accent-100 text-accent-700 mb-3"><Eye className="h-3.5 w-3.5" /> Gallery</span>
          <h2 className="section-title">The Journey of a Donation</h2>
          <p className="section-subtitle">From a kitchen with extra to a family in need — illustrated.</p>
        </motion.div>
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {galleryItems.map((g) => (
            <motion.div key={g.title} variants={scaleIn} whileHover={{ y: -6 }} className="relative aspect-square rounded-2xl overflow-hidden shadow-soft group bg-cream dark:bg-secondary-900 border border-linen/60 dark:border-secondary-800/60">
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <Illustration variant={g.illustration} className="w-full h-full transition-transform duration-500 group-hover:scale-105" />
              </div>
              <p className="absolute bottom-3 left-3 right-3 text-center font-display font-semibold text-sm text-ink dark:text-cream">{g.title}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* APPROVAL STATUS */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 max-w-7xl mx-auto">
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-10">
          <span className="badge bg-primary-100 text-primary-700 mb-3"><ClipboardCheck className="h-3.5 w-3.5" /> Status</span>
          <h2 className="section-title">Donation Approval Status</h2>
          <p className="section-subtitle">Every donation receives one of these outcomes after inspection.</p>
        </motion.div>
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {approvalStatuses.map((s) => (
            <motion.div key={s.label} variants={fadeInUp} whileHover={{ y: -6 }} className={`glass-card p-6 ${s.bg}`}>
              <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center shadow-lg mb-4`}>
                <s.icon className="h-7 w-7" />
              </div>
              <h3 className={`font-display text-lg font-bold mb-1 ${s.text}`}>{s.label}</h3>
              <p className="text-sm text-ink-soft dark:text-cream/60 leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* LIVE STATISTICS */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 max-w-7xl mx-auto">
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="glass-card p-8 sm:p-12">
          <motion.div variants={fadeInUp} className="text-center mb-10">
            <span className="badge bg-accent-100 text-accent-700 mb-3"><Sparkles className="h-3.5 w-3.5" /> Live</span>
            <h2 className="section-title">Live Quality Statistics</h2>
          </motion.div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: stats.mealsVerified, suffix: '+', label: 'Meals Verified', icon: Utensils, color: 'text-primary-600' },
              { value: stats.qualityScore, suffix: '%', label: 'Quality Score', icon: Sparkles, color: 'text-accent-500' },
              { value: stats.partnerHotels, suffix: '+', label: 'Partner Hotels', icon: Building2, color: 'text-primary-600' },
              { value: stats.qualityVolunteers, suffix: '+', label: 'Quality Volunteers', icon: Users, color: 'text-accent-500' },
            ].map((s) => (
              <motion.div key={s.label} variants={scaleIn} whileHover={{ y: -6 }} className="glass-card p-6 text-center">
                <div className={`h-14 w-14 rounded-2xl bg-white dark:bg-secondary-800 shadow-lg flex items-center justify-center mx-auto mb-3 ${s.color}`}>
                  <s.icon className="h-7 w-7" />
                </div>
                <p className={`font-display text-3xl sm:text-4xl font-bold ${s.color}`}><Counter value={s.value} suffix={s.suffix} /></p>
                <p className="text-sm text-ink-soft dark:text-cream/60 mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* QUALITY CERTIFICATE */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 max-w-6xl mx-auto">
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-10">
          <span className="badge bg-primary-100 text-primary-700 mb-3"><Award className="h-3.5 w-3.5" /> Verified</span>
          <h2 className="section-title">Quality Certificate</h2>
          <p className="section-subtitle">Each verified donation is backed by a FoodBridge quality certificate.</p>
        </motion.div>

        {certificateInfo ? (
        <motion.div
          variants={scaleIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          whileHover={{ y: -6 }}
          className="glass-card p-6 sm:p-8 relative group transition-all duration-500 hover:shadow-2xl hover:shadow-primary-500/10"
        >
          <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-primary-500/20 via-gold-500/20 to-accent-500/20 blur-md -z-10" />
          <div className="overflow-x-auto pb-4">
            <CertificateDocument scale={0.85} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-sm mt-6 mb-6">
            <div><Calendar className="h-5 w-5 text-primary-500 mx-auto mb-1" /><p className="text-ink-soft/60 dark:text-cream/40 text-xs">Inspection Date</p><p className="font-medium text-xs">{certificateInfo.inspectionDate}</p></div>
            <div><Hash className="h-5 w-5 text-accent-500 mx-auto mb-1" /><p className="text-ink-soft/60 dark:text-cream/40 text-xs">Certificate ID</p><p className="font-medium text-xs">{certificateInfo.id}</p></div>
            <div><ShieldCheck className="h-5 w-5 text-primary-500 mx-auto mb-1" /><p className="text-ink-soft/60 dark:text-cream/40 text-xs">Unique ID</p><p className="font-medium text-xs">{certificateInfo.uniqueId}</p></div>
            <div><Award className="h-5 w-5 text-accent-500 mx-auto mb-1" /><p className="text-ink-soft/60 dark:text-cream/40 text-xs">Quality Grade</p><p className="font-medium text-xs text-primary-600">{certificateInfo.grade}</p></div>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <RippleButton onClick={() => setCertModal(true)} variant="primary"><Eye className="h-4 w-4" /> View Certificate</RippleButton>
            <RippleButton variant="secondary"><Download className="h-4 w-4" /> Download PDF</RippleButton>
            <Link to={`/services/verify-certificate/${certificateInfo.id}`}><RippleButton variant="ghost"><ScanLine className="h-4 w-4" /> Verify QR</RippleButton></Link>
          </div>
        </motion.div>
        ) : (
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="glass-card p-12 text-center">
          <Award className="h-12 w-12 text-ink-soft/40 dark:text-cream/30 mx-auto mb-4" />
          <h3 className="font-display text-xl font-bold mb-2">No Certificates Yet</h3>
          <p className="text-ink-soft dark:text-cream/60 text-sm max-w-md mx-auto">Certificates are generated automatically after a successful delivery. Complete a delivery to see your first quality certificate here.</p>
          <Link to="/register" className="inline-block mt-6"><RippleButton variant="primary">Get Started</RippleButton></Link>
        </motion.div>
        )}
      </section>

      {/* CERTIFICATE MODAL */}
      <AnimatePresence>
        {certModal && certificateInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCertModal(false)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 200, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-6 w-full max-w-7xl my-8"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Award className="h-6 w-6 text-primary-600" />
                  <h3 className="font-display text-xl font-bold">Food Quality Certificate</h3>
                </div>
                <button onClick={() => setCertModal(false)} className="text-ink-soft/60 dark:text-cream/40 hover:text-ink-soft dark:hover:text-cream/70 transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-linen dark:border-secondary-700">
                <RippleButton onClick={() => setCertScale((s) => Math.min(2, s + 0.15))} variant="ghost" className="text-sm px-3 py-2"><ZoomIn className="h-4 w-4" /> Zoom In</RippleButton>
                <RippleButton onClick={() => setCertScale((s) => Math.max(0.5, s - 0.15))} variant="ghost" className="text-sm px-3 py-2"><ZoomOut className="h-4 w-4" /> Zoom Out</RippleButton>
                <RippleButton onClick={() => setCertScale(1)} variant="ghost" className="text-sm px-3 py-2"><Maximize className="h-4 w-4" /> Reset</RippleButton>
                <RippleButton onClick={() => window.print()} variant="ghost" className="text-sm px-3 py-2"><Printer className="h-4 w-4" /> Print</RippleButton>
                <RippleButton variant="ghost" className="text-sm px-3 py-2"><Download className="h-4 w-4" /> Download PDF</RippleButton>
                <Link to={`/services/verify-certificate/${certificateInfo.id}`}><RippleButton variant="ghost" className="text-sm px-3 py-2"><ShieldCheck className="h-4 w-4" /> Verify Certificate</RippleButton></Link>
              </div>
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 overflow-auto max-h-[70vh] rounded-2xl bg-oat dark:bg-secondary-900/50 p-4 flex justify-center">
                  <CertificateDocument scale={certScale} />
                </div>
                <div className="space-y-4">
                  <div className="glass-card p-5">
                    <h4 className="font-display font-bold mb-3 flex items-center gap-2"><Hash className="h-4 w-4 text-primary-500" /> Certificate ID</h4>
                    <p className="text-sm font-mono text-ink-soft dark:text-cream/70">{certificateInfo.id}</p>
                  </div>
                  <div className="glass-card p-5">
                    <h4 className="font-display font-bold mb-3 flex items-center gap-2"><Building2 className="h-4 w-4 text-accent-500" /> Hotel Name</h4>
                    <p className="text-sm text-ink-soft dark:text-cream/70">{certificateInfo.issuedTo}</p>
                  </div>
                  <div className="glass-card p-5">
                    <h4 className="font-display font-bold mb-3 flex items-center gap-2"><Calendar className="h-4 w-4 text-primary-500" /> Inspection Date</h4>
                    <p className="text-sm text-ink-soft dark:text-cream/70">{certificateInfo.inspectionDate}</p>
                  </div>
                  <div className="glass-card p-5">
                    <h4 className="font-display font-bold mb-3 flex items-center gap-2"><Sparkles className="h-4 w-4 text-accent-500" /> Food Quality Grade</h4>
                    <p className="font-display text-3xl font-bold text-primary-600">{certificateInfo.grade}</p>
                  </div>
                  <div className="glass-card p-5">
                    <h4 className="font-display font-bold mb-3 flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary-500" /> Inspector</h4>
                    <p className="text-sm text-ink-soft dark:text-cream/70">{certificateInfo.inspector}</p>
                  </div>
                  <div className="glass-card p-5">
                    <h4 className="font-display font-bold mb-3 flex items-center gap-2"><QrCode className="h-4 w-4 text-accent-500" /> QR Verification Status</h4>
                    <p className="text-sm text-ink-soft dark:text-cream/70 flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary-500" /> QR Verified & Active</p>
                  </div>
                  <div className="glass-card p-5 bg-primary-50 dark:bg-primary-900/20">
                    <h4 className="font-display font-bold mb-2 flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-primary-500" /> Status</h4>
                    <p className="text-sm font-semibold text-primary-700 dark:text-primary-300 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" /> Verified
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTTOM CTA */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 max-w-7xl mx-auto">
        <motion.div variants={scaleIn} initial="hidden" whileInView="visible" viewport={{ once: true }} className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary-600 via-primary-500 to-primary-600 p-10 sm:p-16 text-center shadow-2xl">
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-accent-400/30 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="relative">
            <HandHeart className="h-12 w-12 text-white mx-auto mb-4" />
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">Safe Food Saves Lives</h2>
            <p className="text-white/90 mt-3 max-w-xl mx-auto">Every verified meal brings hope to someone in need.</p>
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <Link to="/services/donate-food"><RippleButton variant="secondary"><UtensilsCrossed className="h-4 w-4" /> Donate Food</RippleButton></Link>
              <Link to="/register"><RippleButton className="bg-white text-primary-700 hover:bg-white/90 shadow-lg"><Heart className="h-4 w-4" /> Join FoodBridge</RippleButton></Link>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
