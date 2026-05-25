import { cn } from '../../lib/utils'

export function TableWrap({ children }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[13px]">{children}</table>
    </div>
  )
}

export function Th({ children, className }) {
  return (
    <th className={cn(
      'text-left px-3.5 py-2.5 text-[11.5px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide border-b-2 border-slate-200 dark:border-[rgba(99,102,241,0.12)] bg-slate-50 dark:bg-[rgba(99,102,241,0.05)] whitespace-nowrap transition-colors duration-300',
      className
    )}>
      {children}
    </th>
  )
}

export function Td({ children, className }) {
  return (
    <td className={cn(
      'px-3.5 py-2.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.06)] text-slate-800 dark:text-slate-200 whitespace-nowrap transition-colors duration-300',
      className
    )}>
      {children}
    </td>
  )
}

export function Tr({ children, className }) {
  return (
    <tr className={cn('hover:bg-blue-50/40 dark:hover:bg-indigo-500/[0.06] transition-colors', className)}>
      {children}
    </tr>
  )
}
