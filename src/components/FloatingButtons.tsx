import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, HelpCircle, MessageCircle, X, Send } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export function FloatingButtons() {
  const [showTop, setShowTop] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<{ from: 'bot' | 'user'; text: string }[]>([
    { from: 'bot', text: 'Hi! I am FoodBridge Assistant. How can I help you today?' },
  ]);
  const [input, setInput] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const send = () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages((m) => [...m, { from: 'user', text: userMsg }]);
    setInput('');
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          from: 'bot',
          text: 'Thanks for your message! Our team will get back to you soon. For urgent help, email hello@foodbridge.org.',
        },
      ]);
    }, 800);
  };

  return (
    <>
      {/* Help button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: 'spring' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => toast('Need help? Email hello@foodbridge.org', 'info')}
        className="fixed bottom-6 left-6 mb-safe ml-safe z-40 h-12 w-12 rounded-full glass flex items-center justify-center text-accent-600 shadow-lg"
        aria-label="Help"
      >
        <HelpCircle className="h-5 w-5" />
      </motion.button>

      {/* Chat */}
      <div className="fixed bottom-6 right-6 mb-safe mr-safe z-40">
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="absolute bottom-16 right-0 w-80 sm:w-96 glass-card overflow-hidden flex flex-col"
              style={{ maxHeight: '450px' }}
            >
              <div className="bg-gradient-to-r from-primary-600 to-primary-500 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">FoodBridge Assistant</p>
                    <p className="text-xs text-white/80">Online now</p>
                  </div>
                </div>
                <button onClick={() => setChatOpen(false)} className="text-white/80 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50 dark:bg-gray-900/50">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                      m.from === 'user'
                        ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-br-sm'
                        : 'glass text-gray-800 dark:text-gray-100 rounded-bl-sm'
                    }`}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && send()}
                  placeholder="Type a message..."
                  className="input-field text-sm py-2"
                />
                <button onClick={send} className="btn-primary px-3 py-2 shrink-0" aria-label="Send">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setChatOpen(!chatOpen)}
          className="h-14 w-14 rounded-full bg-gradient-to-br from-primary-600 to-primary-500 text-white flex items-center justify-center shadow-xl shadow-primary-600/40"
          aria-label="Chat"
        >
          {chatOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        </motion.button>
      </div>

      {/* Scroll to top */}
      <AnimatePresence>
        {showTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-24 right-6 mb-safe mr-safe z-40 h-11 w-11 rounded-full glass flex items-center justify-center text-primary-600 shadow-lg"
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
