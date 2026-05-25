import { cn } from '../../lib/utils'

const variants = {
  primary: 'bg-gradient-to-br from-primary-700 to-primary-900 dark:from-indigo-600 dark:to-indigo-800 text-white hover:from-primary-600 hover:to-primary-800 dark:hover:from-indigo-500 dark:hover:to-indigo-700 shadow-blue',
  outline: 'bg-transparent text-primary-900 dark:text-indigo-300 border border-primary-900 dark:border-indigo-500 hover:bg-primary-50 dark:hover:bg-indigo-500/10',
  danger:  'bg-transparent text-red-600 dark:text-red-400 border border-red-300 dark:border-red-500/50 hover:bg-red-50 dark:hover:bg-red-500/10',
  ghost:   'bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06]',
}

const sizes = {
  sm:  'px-3 py-1.5 text-[12px] gap-1.5',
  md:  'px-4 py-2 text-[13px] gap-2',
  lg:  'px-5 py-2.5 text-[14px] gap-2',
}

export default function Button({ children, variant = 'primary', size = 'md', className, ...props }) {
  return (
    <button
      className={cn(
        'btn-3d inline-flex items-center font-medium rounded-md transition-all duration-200 cursor-pointer border border-transparent select-none font-sans',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
