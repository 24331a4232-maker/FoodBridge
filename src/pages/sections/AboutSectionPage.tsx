import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Target, Eye, Calendar, Lightbulb, UtensilsCrossed, Globe2,
  TrendingDown, Award, ArrowRight, Info,
} from 'lucide-react';
import { SectionHeading, AnimatedCounter, fadeInUp, staggerContainer } from '@/lib/animations';
import { RippleButton } from '@/components/ui/RippleButton';
import { SectionPageHeader } from '@/components/SectionPageHeader';
import { SectionTabs } from '@/components/SectionTabs';

const timeline = [
  { year: '2023', title: 'The Idea', desc: 'A group of engineering students witnessed massive food waste at a college fest and decided to act.', icon: Lightbulb },
  { year: '2023', title: 'First Pilot', desc: 'Connected 5 hotels with 2 orphanages in Bangalore. Saved 1,200 meals in the first month.', icon: UtensilsCrossed },
  { year: '2024', title: 'Going Digital', desc: 'Launched the FoodBridge web platform with real-time matching and volunteer tracking.', icon: Globe2 },
  { year: '2024', title: 'Scaling Up', desc: 'Expanded to 28 cities, 340+ partner hotels, and 1,500+ active volunteers.', icon: TrendingDown },
  { year: '2025', title: 'FoodBridge', desc: 'Officially launched FoodBridge with certification programs for volunteers.', icon: Award },
];

const team = [
  { name: 'Arjun Sharma', role: 'Founder & CEO', bio: 'Final year Computer Science student passionate about using technology for social good.' },
  { name: 'Priya Nair', role: 'Co-Founder & CTO', bio: 'Full-stack developer leading the platform engineering and data systems.' },
  { name: 'Karthik Reddy', role: 'Operations Lead', bio: 'Manages partner relationships with hotels and NGOs across 28 cities.' },
  { name: 'Sneha Patel', role: 'Volunteer Coordinator', bio: 'Builds and trains the volunteer network, ensuring safe deliveries.' },
];

const founderQuote =
  '"We started FoodBridge because we could not ignore the contradiction around us - mountains of food being thrown away while people went to bed hungry. Technology gave us the tool, but it is the community that makes it work. Every volunteer, every donor, every recipient is a bridge. Together, we are making sure no plate stays empty."';

const impactStats = [
  { label: 'Meals Delivered', value: 128450, suffix: '+' },
  { label: 'CO2 Saved (kg)', value: 154000, suffix: '+' },
  { label: 'Families Helped', value: 9200, suffix: '+' },
  { label: 'Volunteer Hours', value: 24500, suffix: '+' },
];

function MissionVisionTab() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="card p-8 hover:shadow-premium transition-shadow">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-500 text-white flex items-center justify-center mb-5 shadow-lg shadow-primary-600/30">
            <Target className="h-7 w-7" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-3">Our Mission</h2>
          <p className="text-ink-soft dark:text-cream/60 leading-relaxed">
            To eliminate edible food waste by building a trusted, technology-driven network that redistributes surplus food from hotels, restaurants, and events to orphanages, shelters, and people in need - one meal at a time.
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="card p-8 hover:shadow-premium transition-shadow">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-400 text-white flex items-center justify-center mb-5 shadow-lg shadow-accent-500/30">
            <Eye className="h-7 w-7" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-3">Our Vision</h2>
          <p className="text-ink-soft dark:text-cream/60 leading-relaxed">
            A world where no edible food goes to waste while people go hungry. We envision a future where every city has a real-time food redistribution network powered by community and compassion.
          </p>
        </motion.div>
      </div>

      <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="max-w-3xl mx-auto card p-8 sm:p-12 relative">
        <p className="text-lg sm:text-xl text-ink-soft dark:text-cream/70 leading-relaxed font-display italic mb-8">{founderQuote}</p>
        <motion.div variants={fadeInUp} className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 flex items-center justify-center font-display text-xl font-semibold">A</div>
          <div>
            <p className="font-display font-semibold text-ink dark:text-cream">Arjun Sharma</p>
            <p className="text-sm text-ink-soft dark:text-cream/50">Founder & CEO, FoodBridge</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function OurStoryTab() {
  return (
    <div className="relative max-w-3xl mx-auto">
      <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-500 to-accent-500 sm:-translate-x-1/2" />
      {timeline.map((item, i) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={`relative flex items-start gap-4 mb-8 sm:w-1/2 ${i % 2 === 0 ? 'sm:pr-8 sm:text-right' : 'sm:ml-auto sm:pl-8'}`}
          >
            <div className={`absolute top-0 ${i % 2 === 0 ? 'left-0 sm:left-auto sm:-right-4' : 'left-0 sm:-left-4'} h-8 w-8 rounded-full bg-gradient-to-br from-primary-600 to-primary-500 text-white flex items-center justify-center shadow-lg z-10`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className={`pl-12 sm:pl-0 ${i % 2 === 0 ? 'sm:pr-12' : 'sm:pl-12'}`}>
              <span className="badge bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 mb-2">
                <Calendar className="h-3 w-3" /> {item.year}
              </span>
              <h3 className="font-display font-semibold text-lg mb-1 text-ink dark:text-cream">{item.title}</h3>
              <p className="text-sm text-ink-soft dark:text-cream/60">{item.desc}</p>
            </div>
          </motion.div>
        );
      })}

      <div className="mt-12 rounded-3xl bg-gradient-to-br from-primary-600 to-primary-500 text-white p-8 sm:p-10 mx-4">
        <div className="text-center">
          <h3 className="font-display text-2xl sm:text-3xl font-bold mb-4">Our Impact So Far</h3>
          <p className="text-white/80 max-w-xl mx-auto mb-10">Numbers that represent real meals, real people, and real change.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {impactStats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-stat text-3xl sm:text-4xl font-bold"><AnimatedCounter value={s.value} suffix={s.suffix} /></p>
                <p className="text-sm text-white/80 mt-2">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TeamTab() {
  return (
    <div>
      <SectionHeading badge="Meet The Team" title="The people behind FoodBridge" subtitle="A passionate team of students, engineers, and changemakers." />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-14">
        {team.map((member, i) => (
          <motion.div
            key={member.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -8 }}
            className="card p-6 text-center group"
          >
            <div className="relative w-24 h-24 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 blur-md opacity-50 group-hover:opacity-80 transition-opacity" />
              <div className="relative rounded-full w-24 h-24 flex items-center justify-center bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 font-display text-2xl font-semibold">{member.name[0]}</div>
            </div>
            <h3 className="font-display font-semibold text-lg text-ink dark:text-cream">{member.name}</h3>
            <p className="text-sm text-primary-600 dark:text-primary-400 font-medium mb-2">{member.role}</p>
            <p className="text-xs text-ink-soft dark:text-cream/50 leading-relaxed">{member.bio}</p>
          </motion.div>
        ))}
      </div>

      <div className="text-center max-w-2xl mx-auto mt-16">
        <h2 className="font-display text-3xl font-bold mb-4 text-ink dark:text-cream">Be part of the change</h2>
        <p className="text-ink-soft dark:text-cream/60 mb-8">Join FoodBridge today. Donate surplus food or become a volunteer. Every action counts.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/register"><RippleButton variant="primary">Join Us <ArrowRight className="h-4 w-4" /></RippleButton></Link>
          <Link to="/services/donate-food"><RippleButton variant="accent">Donate Food</RippleButton></Link>
        </div>
      </div>
    </div>
  );
}

export function AboutSectionPage() {
  return (
    <div className="pt-20 min-h-screen gradient-bg-soft">
      <SectionPageHeader
        crumbs={[{ label: 'About', icon: Info }]}
        eyebrow="About FoodBridge"
        title="We are on a mission to end food waste"
        subtitle="FoodBridge is a smart surplus food redistribution platform. We connect those who have surplus food with those who need it - using technology, trust, and a passionate community."
        icon={Info}
      />
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-16">
        <SectionTabs
          tabs={[
            { id: 'mission', label: 'Mission & Vision', icon: Target, content: <MissionVisionTab /> },
            { id: 'story', label: 'Our Story', icon: Lightbulb, content: <OurStoryTab /> },
            { id: 'team', label: 'Team', icon: Globe2, content: <TeamTab /> },
          ]}
        />
      </section>
    </div>
  );
}
