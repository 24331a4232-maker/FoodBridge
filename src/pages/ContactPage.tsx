import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { RippleButton } from '@/components/ui/RippleButton';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { LeafletMap, type MapPoint } from '@/components/LeafletMap';

const contactInfo = [
  { icon: Mail, label: 'Email', value: 'hello@foodbridge.org', href: 'mailto:hello@foodbridge.org' },
  { icon: Phone, label: 'Phone', value: '+91 80 1234 5678', href: 'tel:+918012345678' },
  { icon: MapPin, label: 'Address', value: 'MG Road, Bangalore, Karnataka 560001', href: '#' },
  { icon: Clock, label: 'Hours', value: 'Mon - Sat, 9:00 AM - 8:00 PM', href: '#' },
];

const faqs = [
  { q: 'How can my hotel start donating?', a: 'Register as a donor, fill in your organization details, and start listing surplus food through the Donate Food page. Our volunteers handle the rest.' },
  { q: 'Is there a minimum quantity required?', a: 'No minimum. Even a few servings help. However, larger quantities are prioritized for pickup efficiency.' },
  { q: 'How do you verify recipient organizations?', a: 'We partner with verified orphanages, old-age homes, and shelters. Every recipient is vetted before joining the network.' },
  { q: 'Can I track where my food goes?', a: 'Yes. Once a volunteer accepts your donation, you can track the pickup and delivery status in real time.' },
];

const socials = [Facebook, Twitter, Instagram, Linkedin];

import { PageNav } from '@/components/PageNav';
export function ContactPage() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast('Please fill all fields', 'error');
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('contact_messages').insert(form);
    setLoading(false);
    if (error) { toast('Could not send message. Try again.', 'error'); return; }
    toast('Message sent! We will get back to you soon.', 'success');
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="pt-20 min-h-screen gradient-bg">
      <PageNav crumbs={[{ label: 'Contact', icon: MessageSquare }]} />

      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <span className="badge bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 mb-4">
            <MessageSquare className="h-3.5 w-3.5" /> Get In Touch
          </span>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold">Contact Us</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-3 max-w-xl mx-auto">Have a question, partnership idea, or feedback? We would love to hear from you.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <motion.form variants={staggerContainer} initial="hidden" animate="visible" onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 space-y-5">
            <motion.div variants={fadeInUp}>
              <label className="block text-sm font-medium mb-1.5">Your Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="John Doe" />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" placeholder="you@example.com" />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <label className="block text-sm font-medium mb-1.5">Subject</label>
              <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="input-field" placeholder="How can we help?" />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <label className="block text-sm font-medium mb-1.5">Message</label>
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} className="input-field resize-none" placeholder="Write your message..." />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <RippleButton type="submit" variant="primary" fullWidth disabled={loading}>
                {loading ? <span className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <>Send Message <Send className="h-4 w-4" /></>}
              </RippleButton>
            </motion.div>
          </motion.form>

          {/* Contact info + map */}
          <div className="space-y-6">
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 gap-4">
              {contactInfo.map((c) => (
                <motion.a key={c.label} href={c.href} variants={fadeInUp} whileHover={{ y: -4 }} className="card p-5 block">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center mb-3">
                    <c.icon className="h-5 w-5" />
                  </div>
                  <p className="text-xs text-gray-400">{c.label}</p>
                  <p className="text-sm font-medium mt-0.5">{c.value}</p>
                </motion.a>
              ))}
            </motion.div>

            {/* Map */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
              <LeafletMap
                center={[12.9756, 77.6053]}
                zoom={15}
                height="h-64"
                points={[
                  { lat: 12.9756, lng: 77.6053, type: 'donor', popup: '<strong>FoodBridge HQ</strong><br/>MG Road, Bangalore' },
                ] as MapPoint[]}
              />
              <p className="text-xs text-gray-400 flex items-center gap-1"><MapPin className="h-3 w-3" /> FoodBridge HQ - MG Road, Bangalore</p>
            </motion.div>

            {/* Social */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-5">
              <p className="text-sm font-semibold mb-3">Follow Us</p>
              <div className="flex gap-3">
                {socials.map((Icon, i) => (
                  <motion.a key={i} href="#" whileHover={{ y: -3, scale: 1.1 }} className="h-10 w-10 rounded-full glass flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors">
                    <Icon className="h-4 w-4" />
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="font-display text-2xl sm:text-3xl font-bold text-center mb-8">Frequently Asked Questions</motion.h2>
          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, i) => (
              <motion.details key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="card p-0 overflow-hidden group">
                <summary className="flex items-center justify-between cursor-pointer p-5 font-medium list-none">
                  {faq.q}
                  <ChevronDown className="h-5 w-5 text-primary-500 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-5 pb-5 text-sm text-gray-600 dark:text-gray-400">{faq.a}</div>
              </motion.details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
