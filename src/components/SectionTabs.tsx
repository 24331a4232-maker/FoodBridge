import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';

export interface SectionTab {
  id: string;
  label: string;
  icon: LucideIcon;
  content: ReactNode;
}

interface SectionTabsProps {
  tabs: SectionTab[];
  activeId?: string;
  onChange?: (id: string) => void;
}

export function SectionTabs({ tabs, activeId: controlledId, onChange }: SectionTabsProps) {
  const [internalId, setInternalId] = useState(tabs[0]?.id ?? '');
  const activeId = controlledId ?? internalId;

  const setActive = (id: string) => {
    if (controlledId === undefined) setInternalId(id);
    onChange?.(id);
  };

  const active = tabs.find((t) => t.id === activeId) ?? tabs[0];

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 mb-6 -mx-1 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === active?.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`relative inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'text-primary-700 dark:text-primary-300'
                  : 'text-ink-soft dark:text-cream/60 hover:text-ink dark:hover:text-cream hover:bg-oat dark:hover:bg-secondary-800/60'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              {tab.label}
              {isActive && (
                <motion.span
                  layoutId="sectionTabPill"
                  className="absolute inset-0 rounded-full bg-primary-50 dark:bg-primary-900/30 ring-1 ring-primary-200 dark:ring-primary-800 -z-0"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              {isActive && (
                <motion.span
                  layoutId="sectionTabDot"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-primary-500"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active?.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
        >
          {active?.content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
