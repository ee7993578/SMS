/**
 * BudgetReport.jsx
 * Folder: src/pages/Reports/Fee/BudgetReport.jsx
 *
 * Converts legacy ASPX "Budget Report" to fully-responsive React + Tailwind.
 *
 * Columns: Installment No, Charges, Concession, Receive, Remaining
 * Features:
 *  - Fee Type tabs (Regular / Transport / Hostel)
 *  - Session dropdown filter
 *  - Submit button + Excel export
 *  - Grand total footer row
 *  - Mobile: summary cards + expandable installment cards
 *  - Desktop: dense ERP-style table with sticky header
 *  - Progress bars showing collection efficiency
 *  - Loading skeleton + toast notifications
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye,
  AlertCircle, X, Check, Loader2, ChevronDown,
  FileSpreadsheet, BarChart3, TrendingUp,
  Building2, MapPin, ChevronRight, Info,
  Wallet, BadgeDollarSign, HandCoins,
  Percent, CreditCard, Bus, Home,
  BookOpen, SlidersHorizontal, Search,
  ChevronUp, ArrowUpRight, CircleDollarSign,
  ReceiptText, Clock, CheckCircle2, XCircle
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ────────────────────────────────────────────────────
const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

const FEE_TYPES = [
  { id: 'regular',   label: 'Regular',   icon: BookOpen,  color: 'blue'   },
  { id: 'transport', label: 'Transport', icon: Bus,        color: 'emerald'},
  { id: 'hostel',    label: 'Hostel',    icon: Home,       color: 'violet' },
]

// installment_no, charges, concession, paid (receive), remaining
const BUDGET_DATA = {
  regular: {
    '2022-23': [
      { installment_no: 1,  charges: 12500, Concession: 800,  paid: 10200, Remaining: 1500 },
      { installment_no: 2,  charges: 12500, Concession: 600,  paid: 10800, Remaining: 1100 },
      { installment_no: 3,  charges: 12500, Concession: 500,  paid: 11000, Remaining: 1000 },
      { installment_no: 4,  charges: 12500, Concession: 400,  paid: 11500, Remaining: 600  },
    ],
    '2023-24': [
      { installment_no: 1,  charges: 13500, Concession: 900,  paid: 11200, Remaining: 1400 },
      { installment_no: 2,  charges: 13500, Concession: 700,  paid: 11800, Remaining: 1000 },
      { installment_no: 3,  charges: 13500, Concession: 600,  paid: 12000, Remaining: 900  },
      { installment_no: 4,  charges: 13500, Concession: 500,  paid: 12400, Remaining: 600  },
    ],
    '2024-25': [
      { installment_no: 1,  charges: 14500, Concession: 1000, paid: 12000, Remaining: 1500 },
      { installment_no: 2,  charges: 14500, Concession: 800,  paid: 12500, Remaining: 1200 },
      { installment_no: 3,  charges: 14500, Concession: 700,  paid: 12800, Remaining: 1000 },
      { installment_no: 4,  charges: 14500, Concession: 600,  paid: 13000, Remaining: 900  },
    ],
    '2025-26': [
      { installment_no: 1,  charges: 15500, Concession: 1100, paid: 13000, Remaining: 1400 },
      { installment_no: 2,  charges: 15500, Concession: 900,  paid: 13500, Remaining: 1100 },
      { installment_no: 3,  charges: 15500, Concession: 800,  paid: 14000, Remaining: 700  },
      { installment_no: 4,  charges: 15500, Concession: 700,  paid: 14200, Remaining: 600  },
    ],
  },
  transport: {
    '2022-23': [
      { installment_no: 1, charges: 4000, Concession: 200, paid: 3400, Remaining: 400 },
      { installment_no: 2, charges: 4000, Concession: 150, paid: 3500, Remaining: 350 },
    ],
    '2023-24': [
      { installment_no: 1, charges: 4500, Concession: 250, paid: 3800, Remaining: 450 },
      { installment_no: 2, charges: 4500, Concession: 200, paid: 4000, Remaining: 300 },
    ],
    '2024-25': [
      { installment_no: 1, charges: 5000, Concession: 300, paid: 4200, Remaining: 500 },
      { installment_no: 2, charges: 5000, Concession: 250, paid: 4400, Remaining: 350 },
    ],
    '2025-26': [
      { installment_no: 1, charges: 5500, Concession: 350, paid: 4600, Remaining: 550 },
      { installment_no: 2, charges: 5500, Concession: 300, paid: 4800, Remaining: 400 },
    ],
  },
  hostel: {
    '2022-23': [
      { installment_no: 1, charges: 18000, Concession: 500,  paid: 16200, Remaining: 1300 },
      { installment_no: 2, charges: 18000, Concession: 400,  paid: 16800, Remaining: 800  },
    ],
    '2023-24': [
      { installment_no: 1, charges: 20000, Concession: 600,  paid: 18000, Remaining: 1400 },
      { installment_no: 2, charges: 20000, Concession: 500,  paid: 18500, Remaining: 1000 },
    ],
    '2024-25': [
      { installment_no: 1, charges: 22000, Concession: 700,  paid: 20000, Remaining: 1300 },
      { installment_no: 2, charges: 22000, Concession: 600,  paid: 20500, Remaining: 900  },
    ],
    '2025-26': [
      { installment_no: 1, charges: 24000, Concession: 800,  paid: 22000, Remaining: 1200 },
      { installment_no: 2, charges: 24000, Concession: 700,  paid: 22500, Remaining: 800  },
    ],
  },
}

// ─── FORMAT HELPERS ──────────────────────────────────────────────────────────
const fmt = (n) => '₹' + (n ?? 0).toLocaleString('en-IN')
const pct = (part, total) => total ? Math.round((part / total) * 100) : 0

// ─── PRIMITIVE COMPONENTS ────────────────────────────────────────────────────
function NativeSelect({ value, onChange, children, placeholder, error, disabled }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full appearance-none pl-3 pr-8 py-2.5 text-[13px] rounded-xl border outline-none transition-all cursor-pointer
          bg-white text-slate-800
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error
            ? 'border-rose-400 ring-2 ring-rose-100'
            : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'
          }`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
    </div>
  )
}

function Field({ label, error, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-rose-500 mt-0.5">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
        </p>
      )}
    </div>
  )
}

function Toast({ message, type = 'success', onClose }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3
        rounded-2xl shadow-2xl text-[13px] font-semibold min-w-[260px] max-w-[90vw]
        ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}
      style={{ animation: 'slideUp .25s ease' }}
    >
      {type === 'success'
        ? <Check className="w-4 h-4 flex-shrink-0" />
        : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// ─── FEE TYPE TAB ────────────────────────────────────────────────────────────
function FeeTypeTabs({ value, onChange }) {
  const colorMap = {
    blue: {
      active: 'bg-blue-600 text-white shadow-md shadow-blue-500/30',
      inactive: 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5',
      icon: 'text-white',
    },
    emerald: {
      active: 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30',
      inactive: 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5',
      icon: 'text-white',
    },
    violet: {
      active: 'bg-violet-600 text-white shadow-md shadow-violet-500/30',
      inactive: 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5',
      icon: 'text-white',
    },
  }
  return (
    <div className="flex gap-2 p-1 bg-slate-100 dark:bg-white/5 rounded-2xl w-full">
      {FEE_TYPES.map(({ id, label, icon: Icon, color }) => {
        const isActive = value === id
        const c = colorMap[color]
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-[13px] font-semibold transition-all duration-200
              ${isActive ? c.active : c.inactive}`}
          >
            <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? c.icon : ''}`} />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden text-[12px]">{label}</span>
          </button>
        )
      })}
    </div>
  )
}

// ─── SUMMARY STAT CARD ───────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, sub, color, trend }) {
  const colorMap = {
    blue:    { wrap: 'bg-blue-50 dark:bg-blue-500/10',    icon: 'text-blue-600 dark:text-blue-400',    val: 'text-blue-700 dark:text-blue-300'    },
    emerald: { wrap: 'bg-emerald-50 dark:bg-emerald-500/10', icon: 'text-emerald-600 dark:text-emerald-400', val: 'text-emerald-700 dark:text-emerald-300' },
    amber:   { wrap: 'bg-amber-50 dark:bg-amber-500/10',  icon: 'text-amber-600 dark:text-amber-400',  val: 'text-amber-700 dark:text-amber-300'  },
    rose:    { wrap: 'bg-rose-50 dark:bg-rose-500/10',    icon: 'text-rose-600 dark:text-rose-400',    val: 'text-rose-700 dark:text-rose-300'    },
    violet:  { wrap: 'bg-violet-50 dark:bg-violet-500/10',icon: 'text-violet-600 dark:text-violet-400',val: 'text-violet-700 dark:text-violet-300' },
  }
  const c = colorMap[color] || colorMap.blue
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3.5 shadow-sm flex-1 min-w-0">
      <span className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${c.wrap}`}>
        <Icon className={`w-5 h-5 ${c.icon}`} />
      </span>
      <div className="min-w-0 flex-1">
        <p className={`text-[18px] sm:text-[20px] font-extrabold tabular-nums leading-tight ${c.val}`}>{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-medium">{label}</p>
        {sub !== undefined && (
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 tabular-nums">{sub}</p>
        )}
      </div>
      {trend !== undefined && (
        <div className={`text-[11px] font-bold flex items-center gap-0.5 flex-shrink-0 ${trend >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
          <ArrowUpRight className="w-3.5 h-3.5" />
          {trend}%
        </div>
      )}
    </div>
  )
}

// ─── COLLECTION EFFICIENCY GAUGE ─────────────────────────────────────────────
function CollectionGauge({ charges, paid, concession, remaining }) {
  const netDue = charges - concession
  const collectedPct = netDue > 0 ? Math.round((paid / netDue) * 100) : 0
  const remainingPct = 100 - collectedPct

  return (
    <div className="rounded-2xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-5 py-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Percent className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">Collection Efficiency</span>
        </div>
        <span className={`text-[22px] font-extrabold tabular-nums ${collectedPct >= 90 ? 'text-emerald-600 dark:text-emerald-400' : collectedPct >= 70 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
          {collectedPct}%
        </span>
      </div>

      {/* Stacked bar */}
      <div className="h-4 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
        <div
          className="h-full bg-emerald-500 transition-all duration-700 ease-out"
          style={{ width: `${collectedPct}%` }}
        />
        <div
          className="h-full bg-rose-400 transition-all duration-700 ease-out"
          style={{ width: `${remainingPct}%` }}
        />
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-2">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
          Collected {fmt(paid)} ({collectedPct}%)
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400 flex-shrink-0" />
          Pending {fmt(remaining)} ({remainingPct}%)
        </div>
      </div>
    </div>
  )
}

// ─── SCHOOL HEADER BANNER ────────────────────────────────────────────────────
function SchoolHeader({ session, feeType }) {
  const ft = FEE_TYPES.find(f => f.id === feeType)
  const colorMap = {
    blue:    'bg-blue-100 dark:bg-blue-500/15 border-blue-200 dark:border-blue-500/25 text-blue-700 dark:text-blue-400',
    emerald: 'bg-emerald-100 dark:bg-emerald-500/15 border-emerald-200 dark:border-emerald-500/25 text-emerald-700 dark:text-emerald-400',
    violet:  'bg-violet-100 dark:bg-violet-500/15 border-violet-200 dark:border-violet-500/25 text-violet-700 dark:text-violet-400',
  }
  return (
    <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-5 py-4 text-center shadow-sm">
      <div className="flex items-center justify-center gap-2 mb-1">
        <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <h2 className="text-[14px] sm:text-[16px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
          {SCHOOL_INFO.name}
        </h2>
      </div>
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mb-2.5">
        <MapPin className="w-3 h-3 flex-shrink-0" />
        <span>{SCHOOL_INFO.address}</span>
      </div>
      <div className="flex items-center justify-center flex-wrap gap-2">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25">
          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400">Session: {session}</span>
        </span>
        {ft && (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${colorMap[ft.color]} text-[11px] font-bold`}>
            <ft.icon className="w-3 h-3" />
            {ft.label} Fee
          </span>
        )}
      </div>
      <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400">
        Budget Report
      </p>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx, isTotal, feeType }) {
  if (!row) return null
  const netDue = (row.charges || 0) - (row.Concession || 0)
  const collectedPct = netDue > 0 ? Math.round(((row.paid || 0) / netDue) * 100) : 0
  const statusColor = collectedPct >= 95
    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
    : collectedPct >= 70
    ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
    : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'

  if (isTotal) {
    return (
      <tr className="bg-slate-50 dark:bg-white/[0.03] border-t-2 border-blue-200 dark:border-indigo-500/30">
        <td className="px-5 py-3.5 text-center text-[12px] text-slate-400">—</td>
        <td className="px-5 py-3.5">
          <span className="text-[13px] font-extrabold text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Grand Total
          </span>
        </td>
        <td className="px-5 py-3.5 text-right">
          <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-xl text-[13px] font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 tabular-nums">{fmt(row.charges)}</span>
        </td>
        <td className="px-5 py-3.5 text-right">
          <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-xl text-[13px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 tabular-nums">{fmt(row.Concession)}</span>
        </td>
        <td className="px-5 py-3.5 text-right">
          <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-xl text-[13px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 tabular-nums">{fmt(row.paid)}</span>
        </td>
        <td className="px-5 py-3.5 text-right">
          <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-xl text-[13px] font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 tabular-nums">{fmt(row.Remaining)}</span>
        </td>
        <td className="px-5 py-3.5 text-center" />
      </tr>
    )
  }

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-blue-50/30 dark:hover:bg-white/[0.02] transition-colors">
      {/* S.No */}
      <td className="px-5 py-3.5 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">{idx}</td>

      {/* Installment */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-xl flex items-center justify-center bg-blue-50 dark:bg-blue-500/10 text-[12px] font-extrabold text-blue-700 dark:text-blue-400 flex-shrink-0 tabular-nums">
            {row.installment_no}
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">
            Installment {row.installment_no}
          </span>
        </div>
      </td>

      {/* Charges */}
      <td className="px-5 py-3.5 text-right">
        <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 tabular-nums">{fmt(row.charges)}</span>
      </td>

      {/* Concession */}
      <td className="px-5 py-3.5 text-right">
        <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[12px] font-semibold tabular-nums
          ${row.Concession > 0
            ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
            : 'text-slate-400 dark:text-slate-600'
          }`}>
          {row.Concession > 0 ? fmt(row.Concession) : '—'}
        </span>
      </td>

      {/* Received */}
      <td className="px-5 py-3.5 text-right">
        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 tabular-nums">
          {fmt(row.paid)}
        </span>
      </td>

      {/* Remaining */}
      <td className="px-5 py-3.5 text-right">
        <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[12px] font-semibold tabular-nums
          ${row.Remaining > 0
            ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
          }`}>
          {row.Remaining > 0 ? fmt(row.Remaining) : '✓ Clear'}
        </span>
      </td>

      {/* Status */}
      <td className="px-5 py-3.5 text-center">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${statusColor}`}>
          {collectedPct >= 95
            ? <><CheckCircle2 className="w-3 h-3" />Clear</>
            : collectedPct >= 70
            ? <><Clock className="w-3 h-3" />Partial</>
            : <><XCircle className="w-3 h-3" />Low</>
          }
        </span>
      </td>
    </tr>
  )
}

// ─── MOBILE INSTALLMENT CARD ─────────────────────────────────────────────────
function MobileInstCard({ row, idx }) {
  const [expanded, setExpanded] = useState(false)
  const netDue = (row.charges || 0) - (row.Concession || 0)
  const collectedPct = netDue > 0 ? Math.round(((row.paid || 0) / netDue) * 100) : 0
  const statusColor = collectedPct >= 95
    ? { bar: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400', label: 'Clear' }
    : collectedPct >= 70
    ? { bar: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400', label: 'Partial' }
    : { bar: 'bg-rose-500', badge: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400', label: 'Low' }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        <span className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 dark:bg-blue-500/10 text-[13px] font-extrabold text-blue-700 dark:text-blue-400 flex-shrink-0">
          #{row.installment_no}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100">
            Installment {row.installment_no}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Charges: <span className="text-slate-600 dark:text-slate-300 font-semibold">{fmt(row.charges)}</span>
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${statusColor.badge}`}>
            {statusColor.label}
          </span>
          <span className="text-[12px] font-bold text-emerald-600 dark:text-emerald-400">{collectedPct}%</span>
        </div>
        <ChevronRight className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {/* Progress bar */}
      <div className="px-4 pb-3">
        <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-700 ${statusColor.bar}`} style={{ width: `${collectedPct}%` }} />
        </div>
        <div className="flex justify-between text-[10px] font-semibold mt-1">
          <span className="text-emerald-600 dark:text-emerald-400">Collected {fmt(row.paid)}</span>
          {row.Remaining > 0 && <span className="text-rose-600 dark:text-rose-400">Pending {fmt(row.Remaining)}</span>}
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-3 text-center">
              <CircleDollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400 mx-auto mb-1.5" />
              <p className="text-[16px] font-extrabold text-blue-700 dark:text-blue-300 tabular-nums">{fmt(row.charges)}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400 mt-0.5">Total Charges</p>
            </div>
            <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 p-3 text-center">
              <HandCoins className="w-4 h-4 text-amber-600 dark:text-amber-400 mx-auto mb-1.5" />
              <p className="text-[16px] font-extrabold text-amber-700 dark:text-amber-300 tabular-nums">{fmt(row.Concession)}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400 mt-0.5">Concession</p>
            </div>
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-3 text-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto mb-1.5" />
              <p className="text-[16px] font-extrabold text-emerald-700 dark:text-emerald-300 tabular-nums">{fmt(row.paid)}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 mt-0.5">Received</p>
            </div>
            <div className={`rounded-xl p-3 text-center border
              ${row.Remaining > 0
                ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20'
                : 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20'
              }`}>
              <XCircle className={`w-4 h-4 mx-auto mb-1.5 ${row.Remaining > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
              <p className={`text-[16px] font-extrabold tabular-nums ${row.Remaining > 0 ? 'text-rose-700 dark:text-rose-300' : 'text-emerald-700 dark:text-emerald-300'}`}>
                {row.Remaining > 0 ? fmt(row.Remaining) : '✓ Clear'}
              </p>
              <p className={`text-[10px] font-bold uppercase tracking-wide mt-0.5 ${row.Remaining > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>Remaining</p>
            </div>
          </div>

          {/* Net due info */}
          <div className="flex items-center justify-between text-[12px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/5 rounded-xl px-3 py-2">
            <span>Net Due (after concession)</span>
            <span className="text-slate-700 dark:text-slate-200 tabular-nums">{fmt(netDue)}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, session, setSession, onSubmit, loading, errors }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl"
        style={{ animation: 'drawerUp .25s ease' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Select Session</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-5">
          <Field label="Academic Session" error={errors.session} required>
            <NativeSelect
              value={session}
              onChange={e => setSession(e.target.value)}
              placeholder="-- Select Session --"
              error={errors.session}
            >
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
        </div>
        <div className="px-5 pb-8 flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-3 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={() => { onSubmit(); onClose() }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-70 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show Report
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function BudgetReport() {
  const [feeType,      setFeeType]      = useState('regular')
  const [session,      setSession]      = useState('')
  const [rows,         setRows]         = useState([])
  const [loading,      setLoading]      = useState(false)
  const [exporting,    setExporting]    = useState(false)
  const [filterOpen,   setFilterOpen]   = useState(false)
  const [errors,       setErrors]       = useState({})
  const [toast,        setToast]        = useState(null)
  const [shown,        setShown]        = useState(false)
  const [shownSession, setShownSession] = useState('')
  const [shownType,    setShownType]    = useState('')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    const err = {}
    if (!session) err.session = 'Please select a session'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)

    setTimeout(() => {
      const data = BUDGET_DATA[feeType]?.[session] || []
      setRows(data)
      setShownSession(session)
      setShownType(feeType)
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} installments · ${FEE_TYPES.find(f=>f.id===feeType)?.label} Fee · ${session}`)
    }, 600)
  }, [session, feeType])

  // When fee type changes, reset results (require re-submit)
  const handleFeeTypeChange = (type) => {
    setFeeType(type)
    if (shown) {
      setShown(false)
      setRows([])
    }
  }

  const handleReset = () => {
    setSession(''); setRows([])
    setErrors({}); setShown(false)
    setShownSession(''); setShownType('')
  }

  const handleExcel = () => {
    if (!rows.length) { showToast('No data to export. Run the report first.', 'error'); return }
    setExporting(true)
    setTimeout(() => {
      setExporting(false)
      showToast('Excel exported successfully! (API integration pending)')
    }, 1200)
  }

  // ── Grand Totals ─────────────────────────────────────────────────────────
  const totals = useMemo(() => ({
    charges:    rows.reduce((s, r) => s + r.charges, 0),
    Concession: rows.reduce((s, r) => s + r.Concession, 0),
    paid:       rows.reduce((s, r) => s + r.paid, 0),
    Remaining:  rows.reduce((s, r) => s + r.Remaining, 0),
  }), [rows])

  const hasResults = shown && rows.length > 0
  const netDueTotal = totals.charges - totals.Concession

  return (
    <div className="space-y-4 pb-12">

      {/* ── Page Title ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ReceiptText className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Budget Report
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Fee installment-wise budget: charges, concessions, received &amp; remaining.
          </p>
        </div>
        {hasResults && (
          <button
            type="button"
            onClick={handleExcel}
            disabled={exporting}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20
              transition-all active:scale-95 disabled:opacity-70 flex-shrink-0"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            Export Excel
          </button>
        )}
      </div>

      {/* ── DESKTOP Filter Card ───────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
        </div>
        <div className="p-5 space-y-4">
          {/* Fee Type Tabs */}
          <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Fee Type</p>
            <FeeTypeTabs value={feeType} onChange={handleFeeTypeChange} />
          </div>

          {/* Session + Buttons row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <Field label="Academic Session" error={errors.session} required>
              <NativeSelect
                value={session}
                onChange={e => { setSession(e.target.value); setErrors(p => ({ ...p, session: undefined })) }}
                placeholder="-- Select Session --"
                error={errors.session}
              >
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            <div /><div />

            <div className="flex gap-2">
              <button type="button" onClick={handleSubmit} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
                  bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
                  transition-all active:scale-95 disabled:opacity-70">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                Show
              </button>
              <button type="button" onClick={handleReset} title="Reset"
                className="flex items-center justify-center px-3 py-2.5 rounded-xl text-[13px] font-semibold
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ─────────────────────────────────────────────── */}
      <div className="sm:hidden space-y-3">
        {/* Fee Type tabs — full width on mobile */}
        <FeeTypeTabs value={feeType} onChange={handleFeeTypeChange} />

        <div className="flex gap-2">
          <button type="button" onClick={() => setFilterOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold
              bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
            <SlidersHorizontal className="w-4 h-4" />
            {session ? `Session: ${session}` : 'Select Session'}
          </button>
          {hasResults && (
            <button type="button" onClick={handleExcel} disabled={exporting}
              className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-[13px] font-semibold
                bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm disabled:opacity-70">
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            </button>
          )}
          {hasResults && (
            <button type="button" onClick={handleReset}
              className="px-3.5 py-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        session={session}
        setSession={setSession}
        onSubmit={handleSubmit}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ──────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      )}

      {/* ── Results ───────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* School Banner */}
          <SchoolHeader session={shownSession} feeType={shownType} />

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard
              icon={CircleDollarSign}
              label="Total Charges"
              value={fmt(totals.charges)}
              color="blue"
            />
            <SummaryCard
              icon={HandCoins}
              label="Concession"
              value={fmt(totals.Concession)}
              sub={`${pct(totals.Concession, totals.charges)}% of charges`}
              color="amber"
            />
            <SummaryCard
              icon={BadgeDollarSign}
              label="Total Received"
              value={fmt(totals.paid)}
              sub={`${pct(totals.paid, netDueTotal)}% collected`}
              color="emerald"
            />
            <SummaryCard
              icon={Wallet}
              label="Remaining"
              value={fmt(totals.Remaining)}
              sub={`${pct(totals.Remaining, netDueTotal)}% pending`}
              color="rose"
            />
          </div>

          {/* Collection Efficiency Gauge */}
          <CollectionGauge
            charges={totals.charges}
            paid={totals.paid}
            concession={totals.Concession}
            remaining={totals.Remaining}
          />

          {/* Main Table / Cards Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
              <ReceiptText className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">
                Installment-wise Breakdown
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                {rows.length} installment{rows.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Info hint */}
            <div className="flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <p className="text-[12px] text-blue-700 dark:text-blue-400">
                Net Due = Charges − Concession. Collection % = Received ÷ Net Due.
              </p>
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                    {['S.No.', 'Installment', 'Charges', 'Concession', 'Received', 'Remaining', 'Status'].map((h, i) => (
                      <th key={i}
                        className={`px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap
                          ${i >= 2 ? 'text-right' : i === 6 ? 'text-center' : 'text-left'}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <DesktopRow
                      key={`inst-${row.installment_no}`}
                      row={row}
                      idx={i + 1}
                      feeType={shownType}
                    />
                  ))}
                  {/* Grand Total */}
                  <DesktopRow row={totals} idx={0} isTotal />
                </tbody>
              </table>
            </div>

            {/* ── MOBILE CARDS ── */}
            <div className="md:hidden p-4 space-y-3">
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                Tap any installment card to see full breakdown.
              </p>
              {rows.map((row, i) => (
                <MobileInstCard key={`m-inst-${row.installment_no}`} row={row} idx={i + 1} />
              ))}

              {/* Mobile Grand Total Card */}
              <div className="rounded-2xl border-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07] p-4 space-y-3">
                <p className="text-[12px] font-extrabold uppercase tracking-wide text-blue-700 dark:text-blue-400 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Grand Total — {rows.length} Installments
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="rounded-xl bg-white/70 dark:bg-white/5 p-3 text-center">
                    <p className="text-[18px] font-extrabold text-blue-700 dark:text-blue-300 tabular-nums">{fmt(totals.charges)}</p>
                    <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide mt-0.5">Total Charges</p>
                  </div>
                  <div className="rounded-xl bg-white/70 dark:bg-white/5 p-3 text-center">
                    <p className="text-[18px] font-extrabold text-amber-700 dark:text-amber-300 tabular-nums">{fmt(totals.Concession)}</p>
                    <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide mt-0.5">Concession</p>
                  </div>
                  <div className="rounded-xl bg-white/70 dark:bg-white/5 p-3 text-center">
                    <p className="text-[18px] font-extrabold text-emerald-700 dark:text-emerald-300 tabular-nums">{fmt(totals.paid)}</p>
                    <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mt-0.5">Received</p>
                  </div>
                  <div className="rounded-xl bg-white/70 dark:bg-white/5 p-3 text-center">
                    <p className="text-[18px] font-extrabold text-rose-700 dark:text-rose-300 tabular-nums">{fmt(totals.Remaining)}</p>
                    <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wide mt-0.5">Remaining</p>
                  </div>
                </div>

                {/* Collection Bar */}
                <div>
                  <div className="flex justify-between text-[11px] font-semibold mb-1.5">
                    <span className="text-emerald-600 dark:text-emerald-400">Collected {pct(totals.paid, netDueTotal)}%</span>
                    <span className="text-rose-600 dark:text-rose-400">Pending {pct(totals.Remaining, netDueTotal)}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-rose-200 dark:bg-rose-500/20 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                      style={{ width: `${pct(totals.paid, netDueTotal)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Table Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                <span className="font-semibold text-slate-700 dark:text-slate-300">{rows.length}</span> installment{rows.length !== 1 ? 's' : ''}
                &nbsp;·&nbsp;
                Net Due: <span className="font-semibold text-slate-700 dark:text-slate-300">{fmt(netDueTotal)}</span>
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Session: <span className="font-semibold text-slate-600 dark:text-slate-300">{shownSession}</span>
              </p>
            </div>
          </div>
        </>
      )}

      {/* ── Empty State ────────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <BarChart3 className="w-8 h-8 opacity-40" />
          </div>
          <div className="text-center max-w-xs">
            <p className="text-[15px] font-bold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1.5 leading-relaxed">
              Choose a <strong>fee type</strong>, select a <strong>session</strong>, then tap <strong>Show</strong> to generate the budget report.
            </p>
          </div>

          {/* Quick session shortcuts on empty state */}
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {SESSIONS.map(s => (
              <button
                key={s}
                onClick={() => { setSession(s) }}
                className="px-3 py-1.5 rounded-xl text-[12px] font-semibold bg-slate-100 hover:bg-blue-50 hover:text-blue-700 dark:bg-slate-800 dark:hover:bg-blue-500/15 dark:hover:text-blue-400 text-slate-600 dark:text-slate-400 transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-500/25"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
