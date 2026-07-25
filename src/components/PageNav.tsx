import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, ChevronRight, type LucideIcon } from 'lucide-react';

export interface Crumb {
  label: string;
  path?: string;
  icon?: LucideIcon;
}

interface PageNavProps {
  crumbs: Crumb[];
}

export function PageNav({ crumbs }: PageNavProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <motion.button
          onClick={handleBack}
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.96 }}
          className="group inline-flex items-center gap-1.5 self-start px-3.5 py-1.5 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 border border-gray-200/70 dark:border-gray-700/70 transition-all duration-200"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Back</span>
        </motion.button>

        <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-1 text-xs sm:text-sm min-w-0">
          <Link
            to="/"
            className="flex items-center gap-1 px-2 py-1 rounded-md text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50/60 dark:hover:bg-primary-900/20 transition-all duration-200"
          >
            <Home className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Home</span>
          </Link>

          {crumbs.map((crumb, i) => {
            const isLast = i === crumbs.length - 1;
            const Icon = crumb.icon;
            return (
              <span key={`${crumb.label}-${i}`} className="flex items-center gap-1 min-w-0">
                <ChevronRight className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600 shrink-0" />
                {isLast || !crumb.path ? (
                  <span className="flex items-center gap-1.5 px-2 py-1 rounded-md font-semibold text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/30 truncate max-w-[180px] sm:max-w-none">
                    {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
                    <span className="truncate">{crumb.label}</span>
                  </span>
                ) : (
                  <Link
                    to={crumb.path}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-md text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50/60 dark:hover:bg-primary-900/20 transition-all duration-200 truncate max-w-[160px] sm:max-w-none"
                  >
                    {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
                    <span className="truncate">{crumb.label}</span>
                  </Link>
                )}
              </span>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
