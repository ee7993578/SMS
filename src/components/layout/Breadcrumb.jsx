import { Home, ChevronRight } from 'lucide-react'
import { cn } from '../../lib/utils'

export default function Breadcrumb({ moduleLabel, groupLabel, pageLabel, onHome }) {
  return (
    <div className="flex items-center gap-1.5 px-5 py-2.5 bg-white dark:bg-[#13172a] border-b border-slate-200 dark:border-[rgba(99,102,241,0.1)] text-[12px] text-slate-400 flex-shrink-0 overflow-x-auto whitespace-nowrap transition-colors duration-300"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
    >
      <button
        onClick={onHome}
        className="flex items-center gap-1 text-primary-600 dark:text-indigo-400 hover:text-primary-900 dark:hover:text-indigo-300 transition-colors font-medium"
      >
        <Home size={13} />
        <span>Home</span>
      </button>

      {moduleLabel && (
        <>
          <ChevronRight size={13} className="text-slate-300 dark:text-slate-600 flex-shrink-0" />
          <span className={cn('text-slate-500 dark:text-slate-400', !groupLabel && 'text-primary-900 dark:text-indigo-300 font-semibold')}>
            {moduleLabel}
          </span>
        </>
      )}

      {groupLabel && (
        <>
          <ChevronRight size={13} className="text-slate-300 dark:text-slate-600 flex-shrink-0" />
          <span className={cn('text-slate-500 dark:text-slate-400', !pageLabel && 'text-primary-900 dark:text-indigo-300 font-semibold')}>
            {groupLabel}
          </span>
        </>
      )}

      {pageLabel && (
        <>
          <ChevronRight size={13} className="text-slate-300 dark:text-slate-600 flex-shrink-0" />
          <span className="text-primary-900 dark:text-indigo-300 font-semibold">{pageLabel}</span>
        </>
      )}
    </div>
  )
}
