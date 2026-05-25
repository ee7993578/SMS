import { cn } from '../../lib/utils'

export function FormGrid({ children, cols = 2, className }) {
  return (
    <div className={cn(
      'grid gap-3.5',
      cols === 2 && 'grid-cols-1 sm:grid-cols-2',
      cols === 3 && 'grid-cols-1 sm:grid-cols-3',
      cols === 1 && 'grid-cols-1',
      className
    )}>
      {children}
    </div>
  )
}

export function FormField({ label, children, fullWidth }) {
  return (
    <div className={cn('flex flex-col gap-1.5', fullWidth && 'sm:col-span-2')}>
      {label && <label className="text-[12.5px] font-semibold text-slate-500 dark:text-slate-400">{label}</label>}
      {children}
    </div>
  )
}

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'w-full px-3 py-2 border border-slate-200 dark:border-[rgba(99,102,241,0.2)] rounded-md text-[13px] text-slate-800 dark:text-slate-200 font-sans bg-white dark:bg-[#1e2238] outline-none transition-all focus:border-blue-400 dark:focus:border-indigo-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-indigo-500/20 placeholder:text-slate-400 dark:placeholder:text-slate-600',
        className
      )}
      {...props}
    />
  )
}

export function Select({ children, className, ...props }) {
  return (
    <select
      className={cn(
        'w-full px-3 py-2 border border-slate-200 dark:border-[rgba(99,102,241,0.2)] rounded-md text-[13px] text-slate-800 dark:text-slate-200 font-sans bg-white dark:bg-[#1e2238] outline-none transition-all focus:border-blue-400 dark:focus:border-indigo-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-indigo-500/20 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
}

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        'w-full px-3 py-2 border border-slate-200 dark:border-[rgba(99,102,241,0.2)] rounded-md text-[13px] text-slate-800 dark:text-slate-200 font-sans bg-white dark:bg-[#1e2238] outline-none transition-all focus:border-blue-400 dark:focus:border-indigo-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-indigo-500/20 resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600',
        className
      )}
      {...props}
    />
  )
}
