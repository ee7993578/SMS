import { cn } from '../../lib/utils'

const colorMap = {
  blue:   { grad: 'from-blue-600 to-blue-800',       glow: 'rgba(59,130,246,0.5)',  cls: 'stat-card-blue' },
  green:  { grad: 'from-emerald-500 to-emerald-700', glow: 'rgba(16,185,129,0.5)',  cls: 'stat-card-green' },
  orange: { grad: 'from-amber-500 to-amber-600',     glow: 'rgba(245,158,11,0.5)',  cls: 'stat-card-orange' },
  purple: { grad: 'from-violet-500 to-violet-700',   glow: 'rgba(139,92,246,0.5)',  cls: 'stat-card-purple' },
  red:    { grad: 'from-red-500 to-red-700',         glow: 'rgba(239,68,68,0.5)',   cls: '' },
}

export default function StatCard({ icon: Icon, value, label, color = 'blue' }) {
  const c = colorMap[color] || colorMap.blue
  return (
    <div className={cn(
      'card-3d bg-white dark:bg-[#1a1d2e] rounded-[10px] p-4 border border-slate-200 dark:border-[rgba(99,102,241,0.1)] flex items-center gap-3.5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200',
      c.cls
    )}>
      <div className={cn(
        'w-11 h-11 rounded-[10px] flex items-center justify-center flex-shrink-0 bg-gradient-to-br',
        c.grad
      )}
        style={{ boxShadow: `0 4px 12px ${c.glow}` }}
      >
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <div className="font-display text-[22px] font-bold text-slate-800 dark:text-white leading-tight">{value}</div>
        <div className="text-[12px] text-slate-500 dark:text-slate-400 leading-tight">{label}</div>
      </div>
    </div>
  )
}
