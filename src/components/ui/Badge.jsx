import { cn } from '../../lib/utils'

const variants = {
  green:  'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 dark:border dark:border-emerald-500/20',
  blue:   'bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 dark:border dark:border-blue-500/20',
  orange: 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 dark:border dark:border-amber-500/20',
  red:    'bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-300 dark:border dark:border-red-500/20',
  slate:  'bg-slate-100 dark:bg-slate-700/40 text-slate-600 dark:text-slate-300',
}

export default function Badge({ children, variant = 'blue' }) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold', variants[variant])}>
      {children}
    </span>
  )
}
