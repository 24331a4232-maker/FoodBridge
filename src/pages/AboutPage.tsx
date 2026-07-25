import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Target,
  Eye,
  Leaf,
  Users,
  UtensilsCrossed,
  Recycle,
  Heart,
  Award,
  Globe2,
  TrendingDown,
  ArrowRight,
  Quote,
  Calendar,
  Lightbulb,
  Info,
} from 'lucide-react';
import { SectionHeading, AnimatedCounter, fadeInUp, staggerContainer } from '@/lib/animations';
import { RippleButton } from '@/components/ui/RippleButton';

const timeline = [
  { year: '2023', title: 'The Idea', desc: 'A group of engineering students witnessed massive food waste at a college fest and decided to act.', icon: Lightbulb },
  { year: '2023', title: 'First Pilot', desc: 'Connected 5 hotels with 2 orphanages in Bangalore. Saved 1,200 meals in the first month.', icon: UtensilsCrossed },
  { year: '2024', title: 'Going Digital', desc: 'Launched the FoodBridge web platform with real-time matching and volunteer tracking.', icon: Globe2 },
  { year: '2024', title: 'Scaling Up', desc: 'Expanded to 28 cities, 340+ partner hotels, and 1,500+ active volunteers.', icon: TrendingDown },
  { year: '2025', title: 'FoodBridge', desc: 'Officially launched FoodBridge with certification programs for volunteers.', icon: Award },
];

const sdgs = [
  { num: '2', title: 'Zero Hunger', desc: 'End hunger, achieve food security and improved nutrition.', color: 'from-amber-500 to-yellow-500' },
  { num: '12', title: 'Responsible Consumption', desc: 'Ensure sustainable consumption and production patterns.', color: 'from-yellow-500 to-amber-600' },
  { num: '3', title: 'Good Health', desc: 'Ensure healthy lives and promote well-being for all.', color: 'from-green-500 to-emerald-500' },
  { num: '11', title: 'Sustainable Cities', desc: 'Make cities inclusive, safe, resilient and sustainable.', color: 'from-orange-500 to-amber-500' },
  { num: '13', title: 'Climate Action', desc: 'Take urgent action to combat climate change and impacts.', color: 'from-teal-500 to-green-500' },
  { num: '17', title: 'Partnerships', desc: 'Strengthen the means of implementation and revitalize partnerships.', color: 'from-blue-500 to-primary-500' },
];

const foodWasteStats = [
  { value: '1.3 billion', label: 'tonnes of food wasted globally each year', icon: Recycle },
  { value: '40%', label: 'of food produced in India is wasted', icon: TrendingDown },
  { value: '189 million', label: 'Indians are undernourished', icon: Users },
  { value: '870 million', label: 'people globally go hungry every day', icon: Heart },
];

const team = [
  { name: 'Arjun Sharma', role: 'Founder & CEO', bio: 'Final year Computer Science student passionate about using technology for social good.', img: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg' },
  { name: 'Priya Nair', role: 'Co-Founder & CTO', bio: 'Full-stack developer leading the platform engineering and data systems.', img: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg' },
  { name: 'Karthik Reddy', role: 'Operations Lead', bio: 'Manages partner relationships with hotels and NGOs across 28 cities.', img: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg' },
  { name: 'Sneha Patel', role: 'Volunteer Coordinator', bio: 'Builds and trains the volunteer network, ensuring safe deliveries.', img: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg' },
];

const volunteerStories = [
  { name: 'Rahul Verma', text: 'I started volunteering 6 months ago. The sense of purpose when you deliver food to someone hungry is unmatched. FoodBridge made it so easy to contribute.', hours: 120, deliveries: 45 },
  { name: 'Fatima Khan', text: 'As a college student, I wanted to give back but did not know how. FoodBridge fit perfectly into my schedule. I have completed 60+ deliveries now.', hours: 95, deliveries: 60 },
];

const impactStats = [
  { label: 'Meals Delivered', value: 128450, suffix: '+' },
  { label: 'CO2 Saved (kg)', value: 154000, suffix: '+' },
  { label: 'Families Helped', value: 9200, suffix: '+' },
  { label: 'Volunteer Hours', value: 24500, suffix: '+' },
];

import { PageNav } from '@/components/PageNav';
export function AboutPage() {
  return (
    <div className="pt-20">
      <PageNav crumbs={[{ label: 'About', icon: Info }]} />

      {/* Hero */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 gradient-bg-soft overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 h-72 w-72 rounded-full bg-primary-300/20 blur-3xl animate-blob" />
          <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-accent-300/20 blur-3xl animate-blob" style={{ animationDelay: '2s' }} />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative max-w-4xl mx-auto text-center"
        >
          <span className="badge bg-white/60 dark:bg-gray-800/60 text-primary-700 dark:text-primary-300 mb-6 backdrop-blur-md">
            <Leaf className="h-3.5 w-3.5" /> About FoodBridge
          </span>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-balance">
            We are on a mission to <span className="gradient-text">end food waste</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mt-6 max-w-2xl mx-auto">
            FoodBridge is a smart surplus food redistribution platform. We connect those who have surplus food with those who need it - using technology, trust, and a passionate community.
          </p>
        </motion.div>
      </section>

      {/* Mission & Vision */}
      <section className="section">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="card p-8 hover:shadow-2xl transition-shadow"
          >
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-500 text-white flex items-center justify-center mb-5 shadow-lg shadow-primary-600/30">
              <Target className="h-7 w-7" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-3">Our Mission</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              To eliminate edible food waste by building a trusted, technology-driven network that redistributes surplus food from hotels, restaurants, and events to orphanages, shelters, and people in need - one meal at a time.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="card p-8 hover:shadow-2xl transition-shadow"
          >
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-400 text-white flex items-center justify-center mb-5 shadow-lg shadow-accent-500/30">
              <Eye className="h-7 w-7" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-3">Our Vision</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              A world where no edible food goes to waste while people go hungry. We envision a future where every city has a real-time food redistribution network powered by community and compassion.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section bg-gradient-to-b from-primary-50/30 to-white dark:from-primary-950/10 dark:to-gray-950">
        <SectionHeading badge="Our Journey" title="From an idea to a movement" subtitle="The milestones that shaped FoodBridge into what it is today." />
        <div className="relative max-w-3xl mx-auto mt-14">
          <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-500 to-accent-500 sm:-translate-x-1/2" />
          {timeline.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative flex items-start gap-4 mb-8 sm:w-1/2 ${i % 2 === 0 ? 'sm:pr-8 sm:text-right' : 'sm:ml-auto sm:pl-8'}`}
            >
              <div className={`absolute top-0 ${i % 2 === 0 ? 'left-0 sm:left-auto sm:-right-4' : 'left-0 sm:-left-4'} h-8 w-8 rounded-full bg-gradient-to-br from-primary-600 to-primary-500 text-white flex items-center justify-center shadow-lg z-10`}>
                <item.icon className="h-4 w-4" />
              </div>
              <div className={`pl-12 sm:pl-0 ${i % 2 === 0 ? 'sm:pr-12' : 'sm:pl-12'}`}>
                <span className="badge bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 mb-2">
                  <Calendar className="h-3 w-3" /> {item.year}
                </span>
                <h3 className="font-display font-semibold text-lg mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* UN SDGs */}
      <section className="section">
        <SectionHeading badge="UN SDGs" title="Aligned with global goals" subtitle="FoodBridge directly contributes to 6 United Nations Sustainable Development Goals." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
          {sdgs.map((sdg, i) => (
            <motion.div
              key={sdg.num}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="card p-6 group"
            >
              <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${sdg.color} text-white flex items-center justify-center font-display text-xl font-bold mb-4 shadow-lg`}>
                {sdg.num}
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{sdg.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{sdg.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Food Waste Statistics */}
      <section className="section bg-gradient-to-b from-accent-50/40 to-white dark:from-accent-950/10 dark:to-gray-950">
        <SectionHeading badge="The Problem" title="Food waste is a global crisis" subtitle="The numbers are staggering - and unacceptable. Together we can change them." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-14">
          {foodWasteStats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card p-6 text-center"
            >
              <s.icon className="h-10 w-10 text-accent-500 mx-auto mb-3" />
              <p className="font-stat text-2xl sm:text-3xl font-bold gradient-text">{s.value}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="section">
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
                <img src={member.img} alt={member.name} className="relative rounded-full w-24 h-24 object-cover" loading="lazy" />
              </div>
              <h3 className="font-display font-semibold text-lg">{member.name}</h3>
              <p className="text-sm text-primary-600 dark:text-primary-400 font-medium mb-2">{member.role}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{member.bio}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Founder Message */}
      <section className="section bg-gradient-to-b from-primary-50/30 to-white dark:from-primary-950/10 dark:to-gray-950">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-3xl mx-auto card p-8 sm:p-12 relative"
        >
          <Quote className="h-12 w-12 text-primary-200 dark:text-primary-900/40 mb-6" />
          <motion.p variants={fadeInUp} className="text-lg sm:text-xl text-gray-700 dark:text-gray-200 leading-relaxed font-display italic mb-8">
            "We started FoodBridge because we could not ignore the contradiction around us - mountains of food being thrown away while people went to bed hungry. Technology gave us the tool, but it is the community that makes it work. Every volunteer, every donor, every recipient is a bridge. Together, we are making sure no plate stays empty."
          </motion.p>
          <motion.div variants={fadeInUp} className="flex items-center gap-4">
            <img src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg" alt="Founder" className="h-14 w-14 rounded-full object-cover" />
            <div>
              <p className="font-display font-semibold">Arjun Sharma</p>
              <p className="text-sm text-gray-500">Founder & CEO, FoodBridge</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Volunteer Stories */}
      <section className="section">
        <SectionHeading badge="Volunteer Stories" title="Voices from the field" subtitle="Why our volunteers keep coming back." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-14">
          {volunteerStories.map((v, i) => (
            <motion.div
              key={v.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="card p-6"
            >
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">"{v.text}"</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{v.name}</p>
                  <p className="text-xs text-gray-500">Volunteer</p>
                </div>
                <div className="flex gap-4 text-right">
                  <div>
                    <p className="font-stat font-bold text-primary-600">{v.hours}h</p>
                    <p className="text-xs text-gray-400">Hours</p>
                  </div>
                  <div>
                    <p className="font-stat font-bold text-accent-500">{v.deliveries}</p>
                    <p className="text-xs text-gray-400">Deliveries</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Impact */}
      <section className="section bg-gradient-to-br from-primary-600 to-primary-500 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8">
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center">
          <motion.h2 variants={fadeInUp} className="font-display text-3xl sm:text-4xl font-bold mb-4">Our Impact So Far</motion.h2>
          <motion.p variants={fadeInUp} className="text-white/80 max-w-xl mx-auto mb-12">Numbers that represent real meals, real people, and real change.</motion.p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {impactStats.map((s) => (
              <motion.div key={s.label} variants={fadeInUp} className="text-center">
                <p className="font-stat text-3xl sm:text-4xl lg:text-5xl font-bold">
                  <AnimatedCounter value={s.value} suffix={s.suffix} />
                </p>
                <p className="text-sm text-white/80 mt-2">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Gallery */}
      <section className="section">
        <SectionHeading badge="Gallery" title="Moments of change" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-12">
          {[
            'https://images.pexels.com/photos/6646917/pexels-photo-6646917.jpeg',
            'https://images.pexels.com/photos/699953/pexels-photo-699953.jpeg',
            'https://images.pexels.com/photos/262896/pexels-photo-262896.jpeg',
            'https://images.pexels.com/photos/4488647/pexels-photo-4488647.jpeg',
          ].map((url, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl overflow-hidden aspect-square group cursor-pointer"
            >
              <img src={url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto"
        >
          <motion.h2 variants={fadeInUp} className="font-display text-3xl sm:text-4xl font-bold mb-4">Be part of the change</motion.h2>
          <motion.p variants={fadeInUp} className="text-gray-600 dark:text-gray-400 mb-8">Join FoodBridge today. Donate surplus food or become a volunteer. Every action counts.</motion.p>
          <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4">
            <Link to="/register"><RippleButton variant="primary">Join Us <ArrowRight className="h-4 w-4" /></RippleButton></Link>
            <Link to="/donate-food"><RippleButton variant="accent">Donate Food</RippleButton></Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
