import { motion } from 'framer-motion';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white dark:bg-gray-950">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary-400/20 blur-3xl animate-blob" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-accent-400/20 blur-3xl animate-blob" style={{ animationDelay: '2s' }} />
      </div>
      <div className="relative flex flex-col items-center gap-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="absolute inset-0 rounded-full bg-primary-500/30 blur-xl animate-pulse" />
          <img src="/logo.png" alt="FoodBridge" className="relative h-24 w-24 object-contain" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <h1 className="font-display text-2xl font-bold gradient-text">FoodBridge</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">The Last Plate Initiative</p>
        </motion.div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-2.5 w-2.5 rounded-full bg-primary-500"
              animate={{ y: [0, -10, 0], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
