/**
 * AdminDashboardFees.jsx
 * Folder: src/pages/Dashboard/AdminDashboardFees.jsx
 *
 * Converts legacy ASPX "AdminDashBoardNewFees.aspx" to fully-responsive React + Tailwind.
 *
 * Sections:
 *  1. Student Strength Head
 *  2. Fee Revenue Summary
 *  3. Today's Paymode Summary
 *  4. Transaction History (Last 30 Days) — AreaChart
 *  5. Estimate Collection — ColumnChart (Transport / Regular toggle)
 *  6. Recent Transactions (Student-wise)
 *  7. Collection Summary (Last 7/15/30 days) — BarChart + mode-wise table
 *  8. Fee Defaulter Statistics (Standard-wise / Installment-wise) — BarChart + fee-type toggle
 *
 * Features:
 *  - Dark / Light theme via ThemeCtx + makeTokens(dark)
 *  - Mobile: cards, tabs, bottom drawers, stacked layout
 *  - Desktop: data-dense ERP dashboard
 *  - Recharts for all charts
 *  - Static dummy data structured for future API binding
 */

import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  TrendingUp, TrendingDown, Users, IndianRupee, CreditCard,
  AlertTriangle, BarChart3, ArrowUpRight, ArrowDownRight,
  RefreshCw, ChevronDown, Clock, CheckCircle2, XCircle,
  Banknote, Smartphone, Building, MoreHorizontal, Eye,
  UserCheck, BookOpen, Bus, GraduationCap, Activity,
  Calendar, Filter, ChevronRight, Info, Loader2,
  Wallet, PiggyBank, Receipt, BadgePercent, Bell,
  LayoutDashboard, Menu, X as IconX
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, LineChart, Line, Cell
} from 'recharts'

// ─── DUMMY DATA ───────────────────────────────────────────────────────────────

const STUDENT_HEAD = {
  total: 1248,
  boys: 692,
  girls: 556,
  new_admission: 184,
  rte: 62,
  withdrawn: 14,
}

const FEE_REVENUE = {
  estimated:  { amount: 48_50_000, label: 'Estimated' },
  collected:  { amount: 34_20_500, label: 'Collected' },
  due:        { amount: 14_29_500, label: 'Due' },
  today:      { amount: 1_04_200,  label: "Today's Collection" },
  this_month: { amount: 8_92_000,  label: 'This Month' },
  last_month: { amount: 9_14_300,  label: 'Last Month' },
}

const PAYMODE_SUMMARY = [
  { mode: 'Cash',         icon: Banknote,    amount: 42_800,  color: '#10b981', bg: '#d1fae5', darkBg: '#10b98118' },
  { mode: 'Online / UPI', icon: Smartphone,  amount: 38_900,  color: '#6366f1', bg: '#ede9fe', darkBg: '#6366f118' },
  { mode: 'Cheque',       icon: Building,    amount: 12_500,  color: '#f59e0b', bg: '#fef3c7', darkBg: '#f59e0b18' },
  { mode: 'DD / NEFT',   icon: CreditCard,  amount: 10_000,  color: '#0ea5e9', bg: '#e0f2fe', darkBg: '#0ea5e918' },
]

// Last-30-days transaction history
const TX_HISTORY_30 = (() => {
  const months = ['May 6','May 8','May 10','May 12','May 14','May 16','May 18','May 20',
                  'May 22','May 24','May 26','May 28','May 30','Jun 1','Jun 3']
  return months.map((d, i) => ({
    date: d,
    amount: 60_000 + Math.round(Math.sin(i * 0.7) * 30_000) + i * 2000,
    count:  20 + Math.round(Math.random() * 30),
  }))
})()

// Estimate Collection (by installment month)
const ESTIMATE_DATA = {
  transport: [
    { month: 'Apr', estimated: 180000, received: 162000, due: 18000 },
    { month: 'May', estimated: 180000, received: 145000, due: 35000 },
    { month: 'Jun', estimated: 180000, received: 110000, due: 70000 },
    { month: 'Jul', estimated: 180000, received: 88000,  due: 92000 },
    { month: 'Aug', estimated: 180000, received: 0,      due: 180000 },
  ],
  regular: [
    { month: 'Apr', estimated: 520000, received: 490000, due: 30000 },
    { month: 'May', estimated: 520000, received: 420000, due: 100000 },
    { month: 'Jun', estimated: 520000, received: 310000, due: 210000 },
    { month: 'Jul', estimated: 520000, received: 210000, due: 310000 },
    { month: 'Aug', estimated: 520000, received: 0,      due: 520000 },
  ],
}

// Recent Transactions
const RECENT_TX = [
  { id: 'TXN8821', name: 'Arjun Sharma',    class: 'IX-A',   amount: 4200,  mode: 'Online', time: '11:42 AM', status: 'success' },
  { id: 'TXN8820', name: 'Priya Gupta',     class: 'VI-B',   amount: 3800,  mode: 'Cash',   time: '11:30 AM', status: 'success' },
  { id: 'TXN8819', name: 'Mohit Yadav',     class: 'XI-A',   amount: 7500,  mode: 'UPI',    time: '11:14 AM', status: 'success' },
  { id: 'TXN8818', name: 'Sanya Mishra',    class: 'IV-A',   amount: 2900,  mode: 'Cash',   time: '10:58 AM', status: 'success' },
  { id: 'TXN8817', name: 'Rahul Tiwari',    class: 'XII-B',  amount: 8100,  mode: 'Cheque', time: '10:40 AM', status: 'pending' },
  { id: 'TXN8816', name: 'Neha Verma',      class: 'VIII-A', amount: 5200,  mode: 'Online', time: '10:22 AM', status: 'success' },
  { id: 'TXN8815', name: 'Karan Singh',     class: 'X-A',    amount: 6300,  mode: 'UPI',    time: '10:05 AM', status: 'failed'  },
]

// Collection Summary (last 7/15/30 days)
const COLLECTION_SUMMARY = {
  7:  [
    { day: 'Mon', amount: 28000 }, { day: 'Tue', amount: 42000 },
    { day: 'Wed', amount: 31000 }, { day: 'Thu', amount: 55000 },
    { day: 'Fri', amount: 48000 }, { day: 'Sat', amount: 22000 },
    { day: 'Sun', amount: 8000  },
  ],
  15: [
    { day: 'Jun 1', amount: 28000 }, { day: 'Jun 2', amount: 42000 },
    { day: 'Jun 3', amount: 31000 }, { day: 'Jun 4', amount: 55000 },
    { day: 'Jun 5', amount: 48000 }, { day: 'Jun 6', amount: 22000 },
    { day: 'Jun 7', amount: 8000  }, { day: 'Jun 8', amount: 36000 },
    { day: 'Jun 9', amount: 52000 }, { day: 'Jun 10',amount: 44000 },
    { day: 'Jun 11',amount: 29000 }, { day: 'Jun 12',amount: 38000 },
    { day: 'Jun 13',amount: 61000 }, { day: 'Jun 14',amount: 19000 },
    { day: 'Jun 15',amount: 47000 },
  ],
  30: TX_HISTORY_30.map(d => ({ day: d.date, amount: d.amount })),
}

const MODE_WISE_COLLECTION = {
  7:  [{ mode: 'Cash', amount: 82000 }, { mode: 'Online/UPI', amount: 94000 }, { mode: 'Cheque', amount: 38000 }, { mode: 'DD/NEFT', amount: 20000 }],
  15: [{ mode: 'Cash', amount: 1_62_000 }, { mode: 'Online/UPI', amount: 1_84_000 }, { mode: 'Cheque', amount: 72000 }, { mode: 'DD/NEFT', amount: 44000 }],
  30: [{ mode: 'Cash', amount: 3_10_000 }, { mode: 'Online/UPI', amount: 3_62_000 }, { mode: 'Cheque', amount: 1_48_000 }, { mode: 'DD/NEFT', amount: 90000 }],
}

// Fee Defaulter Statistics
const DEFAULTER_STANDARD = [
  { name: 'Nursery', defaulters: 4  },
  { name: 'LKG',     defaulters: 6  },
  { name: 'UKG',     defaulters: 5  },
  { name: 'Class I', defaulters: 9  },
  { name: 'Class II',defaulters: 12 },
  { name: 'Cls III', defaulters: 8  },
  { name: 'Cls IV',  defaulters: 7  },
  { name: 'Cls V',   defaulters: 10 },
  { name: 'Cls VI',  defaulters: 18 },
  { name: 'Cls VII', defaulters: 15 },
  { name: 'Cls VIII',defaulters: 11 },
  { name: 'Cls IX',  defaulters: 22 },
  { name: 'Cls X',   defaulters: 19 },
  { name: 'Cls XI',  defaulters: 28 },
  { name: 'Cls XII', defaulters: 24 },
]

const DEFAULTER_INSTALLMENT = [
  { name: 'Apr', transport: 12, regular: 38 },
  { name: 'May', transport: 18, regular: 54 },
  { name: 'Jun', transport: 24, regular: 72 },
  { name: 'Jul', transport: 30, regular: 89 },
  { name: 'Aug', transport: 40, regular: 104 },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n)
const fmtAmt = (n) => '₹' + fmt(n)
const fmtAmtK = (n) => n >= 100000 ? '₹' + (n / 100000).toFixed(1) + 'L' : n >= 1000 ? '₹' + (n / 1000).toFixed(1) + 'K' : '₹' + n
const pct = (a, b) => (b > 0 ? ((a / b) * 100).toFixed(1) : '0.0')

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

function SectionCard({ title, icon: Icon, accent = 'blue', action, children, className = '' }) {
  const accents = {
    blue:   'bg-blue-500',
    emerald:'bg-emerald-500',
    amber:  'bg-amber-500',
    violet: 'bg-violet-500',
    rose:   'bg-rose-500',
    cyan:   'bg-cyan-500',
    indigo: 'bg-indigo-500',
  }
  return (
    <div className={`rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden ${className}`}>
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <span className={`w-1 h-5 rounded-full flex-shrink-0 ${accents[accent]}`} />
          {Icon && <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />}
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">{title}</span>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function StatPill({ label, value, sub, color = 'blue', trend }) {
  const map = {
    blue:   'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 border-blue-100 dark:border-blue-500/20',
    emerald:'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 border-emerald-100 dark:border-emerald-500/20',
    amber:  'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300 border-amber-100 dark:border-amber-500/20',
    violet: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300 border-violet-100 dark:border-violet-500/20',
    rose:   'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300 border-rose-100 dark:border-rose-500/20',
    cyan:   'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300 border-cyan-100 dark:border-cyan-500/20',
    slate:  'bg-slate-50 text-slate-700 dark:bg-slate-500/10 dark:text-slate-300 border-slate-100 dark:border-slate-500/20',
  }
  return (
    <div className={`flex flex-col gap-1 rounded-xl border p-3.5 ${map[color]}`}>
      <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">{label}</p>
      <p className="text-[22px] font-bold tabular-nums leading-tight">{value}</p>
      {sub && <p className="text-[11px] opacity-60 font-medium">{sub}</p>}
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-[11px] font-semibold mt-0.5 ${trend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
          {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
  )
}

function SegBtn({ options, value, onChange, size = 'sm' }) {
  return (
    <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-[rgba(99,102,241,0.25)] bg-slate-50 dark:bg-[#1e2238] p-0.5 gap-0.5">
      {options.map(o => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all
            ${value === o.value
              ? 'bg-blue-600 text-white dark:bg-indigo-600 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

// ─── CUSTOM TOOLTIP ───────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-[#1a1f35] border border-slate-200 dark:border-[rgba(99,102,241,0.25)] rounded-xl shadow-xl px-4 py-3 min-w-[140px]">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-[12px] text-slate-600 dark:text-slate-300">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="text-[12px] font-bold text-slate-800 dark:text-slate-100 tabular-nums">
            {typeof p.value === 'number' && p.value > 999 ? fmtAmtK(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── 1. STUDENT HEAD PANEL ────────────────────────────────────────────────────
function StudentHeadPanel() {
  const items = [
    { label: 'Total Students', value: fmt(STUDENT_HEAD.total), icon: Users,         color: 'blue'   },
    { label: 'Boys',           value: fmt(STUDENT_HEAD.boys),  icon: UserCheck,      color: 'cyan'   },
    { label: 'Girls',          value: fmt(STUDENT_HEAD.girls), icon: GraduationCap,  color: 'violet' },
    { label: 'New Admission',  value: fmt(STUDENT_HEAD.new_admission), icon: BookOpen, color: 'emerald' },
    { label: 'RTE Students',   value: fmt(STUDENT_HEAD.rte),   icon: BadgePercent,   color: 'amber'  },
    { label: 'Withdrawn',      value: fmt(STUDENT_HEAD.withdrawn), icon: XCircle,    color: 'rose'   },
  ]
  const colorMap = {
    blue:   { icon: 'bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400', border: 'border-blue-100 dark:border-blue-500/20' },
    cyan:   { icon: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-400', border: 'border-cyan-100 dark:border-cyan-500/20' },
    violet: { icon: 'bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400', border: 'border-violet-100 dark:border-violet-500/20' },
    emerald:{ icon: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-500/20' },
    amber:  { icon: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400', border: 'border-amber-100 dark:border-amber-500/20' },
    rose:   { icon: 'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400', border: 'border-rose-100 dark:border-rose-500/20' },
  }
  return (
    <SectionCard title="Student Strength" icon={Users} accent="blue">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map(({ label, value, icon: Icon, color }) => (
          <div key={label}
            className={`flex items-center gap-3 rounded-xl border p-3 ${colorMap[color].border}`}
          >
            <span className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[color].icon}`}>
              <Icon className="w-4.5 h-4.5" />
            </span>
            <div className="min-w-0">
              <p className="text-[20px] font-bold tabular-nums text-slate-800 dark:text-slate-100 leading-tight">{value}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 truncate">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

// ─── 2. FEE REVENUE SUMMARY ───────────────────────────────────────────────────
function FeeRevenueSummary() {
  const collectedPct = parseFloat(pct(FEE_REVENUE.collected.amount, FEE_REVENUE.estimated.amount))
  const duePct = 100 - collectedPct

  return (
    <SectionCard title="Fee Revenue Summary" icon={IndianRupee} accent="emerald">
      {/* Top 3 big stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <StatPill label="Estimated" value={fmtAmtK(FEE_REVENUE.estimated.amount)} color="blue" />
        <StatPill label="Collected" value={fmtAmtK(FEE_REVENUE.collected.amount)}
          sub={`${collectedPct}% of estimated`} color="emerald" trend={3.2} />
        <StatPill label="Due / Pending" value={fmtAmtK(FEE_REVENUE.due.amount)}
          sub={`${duePct.toFixed(1)}% pending`} color="rose" trend={-1.8} />
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex text-[11px] font-semibold justify-between mb-1.5">
          <span className="text-emerald-600 dark:text-emerald-400">Collected {collectedPct}%</span>
          <span className="text-rose-600 dark:text-rose-400">Due {duePct.toFixed(1)}%</span>
        </div>
        <div className="h-3 rounded-full bg-rose-100 dark:bg-rose-500/20 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700"
            style={{ width: `${collectedPct}%` }}
          />
        </div>
      </div>

      {/* Bottom 3 smaller stats */}
      <div className="grid grid-cols-3 gap-2">
        <StatPill label="Today" value={fmtAmtK(FEE_REVENUE.today.amount)} color="cyan" />
        <StatPill label="This Month" value={fmtAmtK(FEE_REVENUE.this_month.amount)} color="violet" />
        <StatPill label="Last Month" value={fmtAmtK(FEE_REVENUE.last_month.amount)} color="amber" />
      </div>
    </SectionCard>
  )
}

// ─── 3. PAYMODE SUMMARY ───────────────────────────────────────────────────────
function PaymodeSummary() {
  const total = PAYMODE_SUMMARY.reduce((s, p) => s + p.amount, 0)
  return (
    <SectionCard title="Today's Paymode Summary" icon={CreditCard} accent="cyan">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {PAYMODE_SUMMARY.map(({ mode, icon: Icon, amount, color, bg, darkBg }) => (
          <div key={mode}
            className="rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.15)] p-4 flex flex-col gap-2"
            style={{ background: `color-mix(in srgb, ${color} 5%, transparent)` }}
          >
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: color + '20', color }}>
                <Icon className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: color + '20', color }}>
                {pct(amount, total)}%
              </span>
            </div>
            <div>
              <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{fmtAmtK(amount)}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">{mode}</p>
            </div>
            {/* mini bar */}
            <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct(amount, total)}%`, background: color }} />
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

// ─── 4. TX HISTORY (LAST 30 DAYS) ────────────────────────────────────────────
function TxHistory30() {
  return (
    <SectionCard title="Transaction History — Last 30 Days" icon={Activity} accent="indigo">
      <div className="h-56 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={TX_HISTORY_30} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="grad_amount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f030" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} />
            <YAxis tickFormatter={fmtAmtK} tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={52} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="amount" name="Amount" stroke="#6366f1" strokeWidth={2}
              fill="url(#grad_amount)" dot={false} activeDot={{ r: 4, fill: '#6366f1' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  )
}

// ─── 5. ESTIMATE COLLECTION ───────────────────────────────────────────────────
function EstimateCollection() {
  const [feeType, setFeeType] = useState('regular') // 'regular' | 'transport'
  const data = ESTIMATE_DATA[feeType]
  const total = {
    estimated: data.reduce((s, r) => s + r.estimated, 0),
    received:  data.reduce((s, r) => s + r.received,  0),
    due:       data.reduce((s, r) => s + r.due,       0),
  }

  return (
    <SectionCard
      title="Estimate Collection"
      icon={PiggyBank}
      accent="amber"
      action={
        <SegBtn
          options={[{ value: 'regular', label: 'Regular' }, { value: 'transport', label: 'Transport' }]}
          value={feeType}
          onChange={setFeeType}
        />
      }
    >
      {/* Totals */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <StatPill label="Estimated"  value={fmtAmtK(total.estimated)} color="blue"    />
        <StatPill label="Received"   value={fmtAmtK(total.received)}  color="emerald" />
        <StatPill label="Due"        value={fmtAmtK(total.due)}       color="amber"   />
      </div>

      <div className="h-52 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f030" />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} />
            <YAxis tickFormatter={fmtAmtK} tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={52} />
            <Tooltip content={<ChartTooltip />} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="estimated" name="Estimated" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={28} />
            <Bar dataKey="received"  name="Received"  fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} />
            <Bar dataKey="due"       name="Due"       fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  )
}

// ─── 6. RECENT TRANSACTIONS ───────────────────────────────────────────────────
const STATUS_MAP = {
  success: { label: 'Success', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400', icon: CheckCircle2 },
  pending: { label: 'Pending', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',    icon: Clock         },
  failed:  { label: 'Failed',  cls: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400',        icon: XCircle       },
}

const MODE_COLORS = { Cash: '#10b981', Online: '#6366f1', UPI: '#8b5cf6', Cheque: '#f59e0b', 'DD/NEFT': '#0ea5e9' }

function RecentTransactions() {
  return (
    <SectionCard title="Recent Transactions (Student-wise)" icon={Receipt} accent="violet">
      {/* Desktop table */}
      <div className="hidden sm:block overflow-hidden rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
              {['TXN ID', 'Student', 'Class', 'Amount', 'Mode', 'Time', 'Status'].map(h => (
                <th key={h} className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RECENT_TX.map((tx, i) => {
              const S = STATUS_MAP[tx.status]
              return (
                <tr key={tx.id} className="border-b border-slate-50 dark:border-[rgba(99,102,241,0.05)] hover:bg-slate-50/50 dark:hover:bg-white/[0.015] transition-colors">
                  <td className="px-3 py-3 text-[11px] font-mono font-semibold text-indigo-600 dark:text-indigo-400">{tx.id}</td>
                  <td className="px-3 py-3 text-[13px] font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">{tx.name}</td>
                  <td className="px-3 py-3">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{tx.class}</span>
                  </td>
                  <td className="px-3 py-3 text-[13px] font-bold text-slate-800 dark:text-slate-100 tabular-nums">{fmtAmt(tx.amount)}</td>
                  <td className="px-3 py-3">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: (MODE_COLORS[tx.mode] || '#64748b') + '20', color: MODE_COLORS[tx.mode] || '#64748b' }}>
                      {tx.mode}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-[12px] text-slate-400 dark:text-slate-500 whitespace-nowrap">{tx.time}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${S.cls}`}>
                      <S.icon className="w-3 h-3" />{S.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-2.5">
        {RECENT_TX.map((tx) => {
          const S = STATUS_MAP[tx.status]
          return (
            <div key={tx.id} className="rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] p-3.5 bg-slate-50/50 dark:bg-white/[0.01]">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100">{tx.name}</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">{tx.id} · {tx.class} · {tx.time}</p>
                </div>
                <span className={`flex-shrink-0 inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${S.cls}`}>
                  <S.icon className="w-3 h-3" />{S.label}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[18px] font-bold text-slate-800 dark:text-slate-100 tabular-nums">{fmtAmt(tx.amount)}</span>
                <span className="text-[12px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: (MODE_COLORS[tx.mode] || '#64748b') + '20', color: MODE_COLORS[tx.mode] || '#64748b' }}>
                  {tx.mode}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </SectionCard>
  )
}

// ─── 7. COLLECTION SUMMARY ────────────────────────────────────────────────────
function CollectionSummary() {
  const [days, setDays] = useState(7)
  const chartData = COLLECTION_SUMMARY[days]
  const modeData  = MODE_WISE_COLLECTION[days]
  const totalAmt  = modeData.reduce((s, m) => s + m.amount, 0)

  return (
    <SectionCard
      title="Collection Summary"
      icon={BarChart3}
      accent="emerald"
      action={
        <SegBtn
          options={[{ value: 7, label: '7D' }, { value: 15, label: '15D' }, { value: 30, label: '30D' }]}
          value={days}
          onChange={setDays}
        />
      }
    >
      <div className="flex flex-col lg:flex-row gap-5">
        {/* Chart */}
        <div className="flex-1 h-52 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f030" />
              <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false}
                interval={days === 30 ? 3 : days === 15 ? 1 : 0} />
              <YAxis tickFormatter={fmtAmtK} tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={48} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="amount" name="Collection" radius={[4, 4, 0, 0]} maxBarSize={32}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={`hsl(${220 + i * 8}, 70%, ${55 + (i % 3) * 5}%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Mode-wise table */}
        <div className="lg:w-52 flex-shrink-0">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">Mode-wise Breakup</p>
          <div className="space-y-2">
            {modeData.map(({ mode, amount }) => (
              <div key={mode}>
                <div className="flex justify-between text-[12px] font-semibold mb-1">
                  <span className="text-slate-600 dark:text-slate-300">{mode}</span>
                  <span className="text-slate-800 dark:text-slate-100 tabular-nums">{fmtAmtK(amount)}</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full rounded-full bg-indigo-500 transition-all duration-700"
                    style={{ width: `${pct(amount, totalAmt)}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-[rgba(99,102,241,0.1)] p-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-0.5">Total</p>
            <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums">{fmtAmtK(totalAmt)}</p>
            <p className="text-[10px] text-slate-400">Last {days} days</p>
          </div>
        </div>
      </div>
    </SectionCard>
  )
}

// ─── 8. FEE DEFAULTER STATISTICS ─────────────────────────────────────────────
function FeeDefaulterStats() {
  const [viewType, setViewType]   = useState('strength')     // 'strength' | 'installment'
  const [feeType,  setFeeType]    = useState('regular')      // 'regular' | 'transport'

  const totalDefaulters = useMemo(() =>
    DEFAULTER_STANDARD.reduce((s, r) => s + r.defaulters, 0),
  [])

  return (
    <SectionCard
      title="Fee Defaulter Statistics"
      icon={AlertTriangle}
      accent="rose"
      action={
        <div className="flex flex-wrap gap-2">
          <SegBtn
            options={[{ value: 'strength', label: 'Standard' }, { value: 'installment', label: 'Installment' }]}
            value={viewType}
            onChange={setViewType}
          />
          {viewType === 'installment' && (
            <SegBtn
              options={[{ value: 'regular', label: 'Regular' }, { value: 'transport', label: 'Transport' }]}
              value={feeType}
              onChange={setFeeType}
            />
          )}
        </div>
      }
    >
      {/* Total badge */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          <span className="text-[13px] text-slate-600 dark:text-slate-400">
            Total Defaulters:
            <span className="ml-2 text-[18px] font-bold text-rose-600 dark:text-rose-400">{totalDefaulters}</span>
          </span>
        </div>
        <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20">
          {viewType === 'strength' ? 'Standard-wise View' : `Installment-wise · ${feeType === 'regular' ? 'Regular Fee' : 'Transport Fee'}`}
        </span>
      </div>

      {viewType === 'strength' ? (
        /* Standard-wise bar chart */
        <div className="h-60 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={DEFAULTER_STANDARD} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f030" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} interval={0} angle={-30} dy={8} height={44} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={28} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="defaulters" name="Defaulters" radius={[4, 4, 0, 0]} maxBarSize={28}>
                {DEFAULTER_STANDARD.map((_, i) => (
                  <Cell key={i} fill={`hsl(${0 + i * 10}, 70%, 55%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        /* Installment-wise grouped bar */
        <div className="h-56 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={DEFAULTER_INSTALLMENT} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f030" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={28} />
              <Tooltip content={<ChartTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              {(feeType === 'transport' || feeType === 'all') && (
                <Bar dataKey="transport" name="Transport" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={32} />
              )}
              {(feeType === 'regular' || feeType === 'all') && (
                <Bar dataKey="regular" name="Regular" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={32} />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </SectionCard>
  )
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function AdminDashboardFees() {
  const [loading, setLoading] = useState(true)

  // Simulate initial data load
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700)
    return () => clearTimeout(t)
  }, [])

  if (loading) {
    return (
      <div className="space-y-4 pb-10">
        {/* Skeleton */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          <div className="h-6 w-64 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] overflow-hidden">
              <div className="h-12 bg-slate-50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                <div className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse opacity-60" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Fee Dashboard
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Fee revenue, collection trends, defaulters &amp; transaction overview.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Session badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25">
            <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="text-[12px] font-bold text-amber-700 dark:text-amber-400">Session 2025-26</span>
          </div>
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold
              bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* ── Row 1: Student Head + Fee Revenue (side by side on large screens) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StudentHeadPanel />
        <FeeRevenueSummary />
      </div>

      {/* ── Row 2: Paymode Summary (full width) ──────────────────────────── */}
      <PaymodeSummary />

      {/* ── Row 3: TX History 30 days (full width) ───────────────────────── */}
      <TxHistory30 />

      {/* ── Row 4: Estimate Collection + Recent Transactions ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4">
        <EstimateCollection />
        <RecentTransactions />
      </div>

      {/* ── Row 5: Collection Summary (full width) ────────────────────────── */}
      <CollectionSummary />

      {/* ── Row 6: Fee Defaulter Statistics (full width) ──────────────────── */}
      <FeeDefaulterStats />

    </div>
  )
}
