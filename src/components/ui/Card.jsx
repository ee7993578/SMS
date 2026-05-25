import { cn } from '../../lib/utils'

export function Card({ children, className }) {
  return (
    <div className={cn(
      'card-3d bg-white dark:bg-[#1a1d2e] rounded-[10px] border border-slate-200 dark:border-[rgba(99,102,241,0.1)] overflow-hidden transition-colors duration-300',
      className
    )}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className }) {
  return (
    <div className={cn(
      'px-4 py-3 border-b border-slate-200 dark:border-[rgba(99,102,241,0.08)] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02] transition-colors duration-300',
      className
    )}>
      {children}
    </div>
  )
}

export function CardTitle({ children }) {
  return <h3 className="text-[14px] font-semibold text-slate-800 dark:text-slate-100">{children}</h3>
}

export function CardBody({ children, className }) {
  return <div className={cn('p-4', className)}>{children}</div>
}
