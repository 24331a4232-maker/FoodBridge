import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Users, Heart, Quote, Star, Award, Package, MapPin, ArrowRight,
  Trophy, Medal, Building2, Sparkles,
} from 'lucide-react';
import { SectionHeading, fadeInUp, staggerContainer } from '@/lib/animations';
import { RippleButton } from '@/components/ui/RippleButton';
import { Illustration } from '@/components/Illustration';
import { SectionPageHeader } from '@/components/SectionPageHeader';
import { SectionTabs } from '@/components/SectionTabs';

const testimonials = [
  { name: 'Rajesh Mehra', role: 'Hotel Manager, Mumbai', rating: 5, text: 'We used to throw away trays of food after every banquet. Now a volunteer is at our door before the last guest leaves. It changed how our whole team thinks about surplus.' },
  { name: 'Ananya Krishnan', role: 'Student Volunteer, Bangalore', rating: 5, text: 'I signed up on a Sunday. By Tuesday I had delivered my first meal. The look on a child\'s face when you hand over warm food — that stays with you.' },
  { name: 'Sister Maria Pinto', role: 'Shelter Coordinator, Goa', rating: 5, text: 'Before FoodBridge we never knew if we would have dinner. Now we plan around it. Reliability is the real gift — the food is secondary.' },
  { name: 'Vikram Reddy', role: 'Restaurant Owner, Hyderabad', rating: 5, text: 'The quality verification process gives everyone confidence. Our staff takes pride in knowing leftovers go to people, not bins.' },
  { name: 'Priya Nair', role: 'NGO Director, Delhi', rating: 5, text: 'FoodBridge has become an essential part of our supply chain. The tracking and certificates make it professional and trustworthy.' },
  { name: 'Karthik Iyer', role: 'Event Caterer, Chennai', rating: 4, text: 'After every wedding or corporate event we list the surplus. Within hours it reaches shelters. It feels good to zero out the waste.' },
];

const successStories = [
  { name: 'The Grand Hotel, Bangalore', illustration: 'donation' as const, quote: 'We used to throw away 40+ meals after every banquet. FoodBridge now redirects all of it to a nearby shelter the same night. Zero waste, full hearts.', meals: 12400, period: '8 months' },
  { name: 'Sunrise Orphanage, Delhi', illustration: 'community' as const, quote: 'Our children get warm, fresh meals every evening from partner hotels. The quality verification gives us complete peace of mind about what they eat.', meals: 8600, period: '6 months' },
  { name: 'Rahul Verma, Volunteer', illustration: 'volunteers' as const, quote: 'I have completed 45 deliveries. The certificate I earned helped me in my college application. FoodBridge gave me purpose and a community.', meals: 45, period: '6 months' },
];

const volunteerStories = [
  { name: 'Rahul Verma', text: 'I started volunteering 6 months ago. The sense of purpose when you deliver food to someone hungry is unmatched. FoodBridge made it so easy to contribute.', hours: 120, deliveries: 45 },
  { name: 'Fatima Khan', text: 'As a college student, I wanted to give back but did not know how. FoodBridge fit perfectly into my schedule. I have completed 60+ deliveries now.', hours: 95, deliveries: 60 },
  { name: 'Vikram Singh', text: 'The app makes everything seamless — from finding nearby donations to tracking the route. I earned a certificate that I added to my resume.', hours: 80, deliveries: 52 },
  { name: 'Sneha Patel', text: 'What I love most is the community. I have met people from all walks of life who share the same mission. We are making a real difference.', hours: 65, deliveries: 41 },
];

const partnerOrgs = [
  { name: 'Sunrise Orphanage', city: 'Delhi', meals: 8600, icon: Heart },
  { name: 'Hope Community Kitchen', city: 'Mumbai', meals: 6200, icon: Building2 },
  { name: 'St. Mary Shelter', city: 'Goa', meals: 4800, icon: Building2 },
  { name: 'Rainbow School', city: 'Bangalore', meals: 3900, icon: Building2 },
  { name: 'Green Valley Home', city: 'Hyderabad', meals: 3100, icon: Building2 },
  { name: 'Anand Foundation', city: 'Chennai', meals: 2400, icon: Building2 },
];

function ReviewsTab() {
  return (
    <div>
      <SectionHeading badge="Reviews" title="What people say about us" subtitle="Real reviews from donors, volunteers, and recipients who use FoodBridge." />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
        {testimonials.map((t, i) => (
          <motion.figure key={t.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ delay: i * 0.1 }} className="card-hover p-7 flex flex-col">
            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, j) => (
                <Star key={j} className={`h-4 w-4 ${j < t.rating ? 'text-gold-500 fill-gold-500' : 'text-linen dark:text-secondary-700'}`} />
              ))}
            </div>
            <Quote className="h-7 w-7 text-primary-300 dark:text-primary-700 mb-4" strokeWidth={1.5} />
            <blockquote className="text-ink-soft dark:text-cream/70 leading-relaxed flex-1">{t.text}</blockquote>
            <figcaption className="flex items-center gap-3 mt-6 pt-5 border-t border-linen dark:border-secondary-800">
              <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 flex items-center justify-center font-display font-semibold">{t.name[0]}</div>
              <div>
                <p className="font-medium text-sm text-ink dark:text-cream">{t.name}</p>
                <p className="text-xs text-ink-soft dark:text-cream/50">{t.role}</p>
              </div>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </div>
  );
}

function SuccessStoriesTab() {
  return (
    <div>
      <SectionHeading badge="Success Stories" title="Real deliveries, real impact" subtitle="Stories of food that found a second home instead of a landfill." />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
        {successStories.map((s, i) => (
          <motion.div key={s.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }} whileHover={{ y: -6 }} className="card p-6 flex flex-col">
            <div className="rounded-2xl bg-cream dark:bg-secondary-900 border border-linen/60 dark:border-secondary-800/60 p-4 mb-5 flex items-center justify-center h-32">
              <Illustration variant={s.illustration} className="w-full h-full" />
            </div>
            <h3 className="font-display font-semibold text-lg text-ink dark:text-cream mb-2">{s.name}</h3>
            <p className="text-sm text-ink-soft dark:text-cream/60 leading-relaxed flex-1">"{s.quote}"</p>
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-linen dark:border-secondary-800">
              <div className="flex gap-4">
                <div><p className="font-stat font-bold text-primary-600">{s.meals.toLocaleString()}</p><p className="text-xs text-ink-soft dark:text-cream/50">meals</p></div>
                <div><p className="font-stat font-bold text-accent-500">{s.period}</p><p className="text-xs text-ink-soft dark:text-cream/50">period</p></div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function VolunteerStoriesTab() {
  return (
    <div>
      <SectionHeading badge="Volunteer Stories" title="Voices from the field" subtitle="Why our volunteers keep coming back." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-14">
        {volunteerStories.map((v, i) => (
          <motion.div key={v.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }} className="card p-6">
            <p className="text-ink-soft dark:text-cream/70 leading-relaxed mb-4">"{v.text}"</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-ink dark:text-cream">{v.name}</p>
                <p className="text-xs text-ink-soft dark:text-cream/50">Volunteer</p>
              </div>
              <div className="flex gap-4 text-right">
                <div><p className="font-stat font-bold text-primary-600">{v.hours}h</p><p className="text-xs text-ink-soft dark:text-cream/50">Hours</p></div>
                <div><p className="font-stat font-bold text-accent-500">{v.deliveries}</p><p className="text-xs text-ink-soft dark:text-cream/50">Deliveries</p></div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function PartnersTab() {
  return (
    <div>
      <SectionHeading badge="Partner Organizations" title="Organizations we serve" subtitle="Shelters, orphanages, schools, and community kitchens that receive food through FoodBridge." />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
        {partnerOrgs.map((p, i) => {
          const Icon = p.icon;
          return (
            <motion.div key={p.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ y: -4 }} className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center shadow-lg">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-ink dark:text-cream">{p.name}</h3>
                  <p className="text-xs text-ink-soft dark:text-cream/50 flex items-center gap-1"><MapPin className="h-3 w-3" /> {p.city}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-linen dark:border-secondary-800">
                <span className="text-sm text-ink-soft dark:text-cream/60">Meals received</span>
                <span className="font-stat font-bold text-primary-600">{p.meals.toLocaleString()}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function TestimonialsTab() {
  return (
    <div>
      <SectionHeading badge="Testimonials" title="Trusted by the community" subtitle="Words from the people who make FoodBridge possible." />
      <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="max-w-3xl mx-auto mt-14 space-y-6">
        {testimonials.slice(0, 3).map((t) => (
          <motion.figure key={t.name} variants={fadeInUp} className="card p-8 flex flex-col sm:flex-row gap-6">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-white flex items-center justify-center font-display text-2xl font-bold shrink-0">{t.name[0]}</div>
            <div className="flex-1">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, j) => <Star key={j} className="h-4 w-4 text-gold-500 fill-gold-500" />)}
              </div>
              <blockquote className="text-lg text-ink-soft dark:text-cream/70 leading-relaxed">"{t.text}"</blockquote>
              <figcaption className="mt-4"><p className="font-semibold text-ink dark:text-cream">{t.name}</p><p className="text-sm text-ink-soft dark:text-cream/50">{t.role}</p></figcaption>
            </div>
          </motion.figure>
        ))}
      </motion.div>
      <div className="text-center mt-12">
        <Link to="/register"><RippleButton variant="primary">Join the community <ArrowRight className="h-4 w-4" /></RippleButton></Link>
      </div>
    </div>
  );
}

export function CommunitySectionPage() {
  return (
    <div className="pt-20 min-h-screen gradient-bg-soft">
      <SectionPageHeader
        crumbs={[{ label: 'Community', icon: Users }]}
        eyebrow="Community"
        title="The people who make it real"
        subtitle="Reviews, stories, and testimonials from the FoodBridge community — donors, volunteers, shelters, and partners."
        icon={Users}
      />
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-16">
        <SectionTabs
          tabs={[
            { id: 'reviews', label: 'Reviews', icon: Star, content: <ReviewsTab /> },
            { id: 'success-stories', label: 'Success Stories', icon: Sparkles, content: <SuccessStoriesTab /> },
            { id: 'volunteer-stories', label: 'Volunteer Stories', icon: Heart, content: <VolunteerStoriesTab /> },
            { id: 'partners', label: 'Partner Organizations', icon: Building2, content: <PartnersTab /> },
            { id: 'testimonials', label: 'Testimonials', icon: Quote, content: <TestimonialsTab /> },
          ]}
        />
      </section>
    </div>
  );
}
