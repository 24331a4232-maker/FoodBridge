import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const COLORS = ['#1B4332', '#74A57F', '#8B5E3C', '#4F8060', '#3A6249', '#A8C5B0'];

interface Particle {
  id: number;
  x: number;
  rotate: number;
  color: string;
  delay: number;
  duration: number;
  size: number;
}

export function Confetti({ trigger }: { trigger: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!trigger) return;
    const next: Particle[] = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 600,
      rotate: Math.random() * 720 - 360,
      color: COLORS[i % COLORS.length],
      delay: Math.random() * 0.3,
      duration: 1.5 + Math.random() * 1.2,
      size: 6 + Math.random() * 8,
    }));
    setParticles(next);
    const t = setTimeout(() => setParticles([]), 3000);
    return () => clearTimeout(t);
  }, [trigger]);

  if (particles.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[200] flex items-center justify-center overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -40, x: 0, opacity: 1, rotate: 0 }}
          animate={{ y: '70vh', x: p.x, opacity: 0, rotate: p.rotate }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeOut' }}
          style={{ background: p.color, width: p.size, height: p.size * 0.6, borderRadius: 2 }}
          className="absolute"
        />
      ))}
    </div>
  );
}
