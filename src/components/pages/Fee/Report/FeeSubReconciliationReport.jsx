/**
 * FeeSubReconciliationReport.jsx
 * Folder: src/pages/Fee/Reports/FeeSubReconciliationReport.jsx
 *
 * Converts legacy ASPX "Fee Refundable/Receivable/Advance Report" to
 * fully-responsive React + Tailwind — mobile-first, production-ready.
 *
 * Features:
 *  - Tab-based report switcher (Refundable / Receivable / Advance)
 *  - Session + Class filters
 *  - Show Report button + Excel export
 *  - School header banner in report
 *  - Grand total footer row
 *  - Mobile: smart card layout with expandable rows
 *  - Desktop: dense ERP-style table with sticky header
 *  - Loading skeleton, empty state, toast notifications
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye, AlertCircle, X, Check, Loader2,
  ChevronDown, ChevronRight, FileSpreadsheet, Search, Info,
  SlidersHorizontal, TrendingUp, TrendingDown, BarChart3,
  Building2, MapPin, IndianRupee, Users, BookOpen,
  ArrowUpCircle, ArrowDownCircle, Wallet, Clock,
  CircleDollarSign, ChevronsUpDown, School2, BadgeIndianRupee,
  ReceiptText, Banknote, HandCoins
} from 'lucide-react'

// ─── STATIC DATA ──────────────────────────────────────────────────────────────
const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']
const CLASSES  = [
  'All Classes', 'Nursery', 'LKG', 'UKG',
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII',
  'Class IX', 'Class X', 'Class XI', 'Class XII',
]

const SCHOOL_INFO = {
  name:    'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

// Report types config
const REPORT_TYPES = [
  {
    key:   'refundable',
    label: 'Fee Refundable',
    icon:  ArrowDownCircle,
    color: 'emerald',
    desc:  'Students with excess fee paid — amount to be refunded',
    amountLabel: 'Refundable Amount',
  },
  {
    key:   'receivable',
    label: 'Fee Receivable',
    icon:  ArrowUpCircle,
    color: 'rose',
    desc:  'Students with pending dues — amount to be collected',
    amountLabel: 'Receivable Amount',
  },
  {
    key:   'advance',
    label: 'Advance',
    icon:  Wallet,
    color: 'amber',
    desc:  'Students who paid fee in advance for upcoming terms',
    amountLabel: 'Advance Amount',
  },
]

// Generate dummy fee data
const generateFeeData = (reportType, session, classFilter) => {
  const studentNames = [
    ['Aarav Sharma','Diya Patel','Rohan Verma','Ananya Singh','Karan Gupta'],
    ['Priya Joshi','Arjun Yadav','Neha Agarwal','Vikram Mehta','Sneha Tiwari'],
    ['Amit Kumar','Pooja Mishra','Rahul Dubey','Sunita Rao','Deepak Nair'],
    ['Kavya Pillai','Sanjay Pandey','Ritika Kapoor','Mohit Saxena','Geeta Singh'],
    ['Harish Thakur','Nisha Bajaj','Pankaj Chawla','Ritu Bhatia','Tarun Malhotra'],
  ]

  const classMap = {
    Nursery: ['A','B'], LKG: ['A','B'], UKG: ['A','B'],
    'Class I':['A','B'], 'Class II':['A','B'], 'Class III':['A'],
    'Class IV':['A'], 'Class V':['A'],
    'Class VI':['A','B'], 'Class VII':['A'], 'Class VIII':['A'],
    'Class IX':['A','B'], 'Class X':['A'], 'Class XI':['A','B'], 'Class XII':['A','B'],
  }

  const selectedClasses = classFilter === 'All Classes'
    ? Object.keys(classMap)
    : [classFilter]

  const sessionSeed = parseInt(session.replace('-','').slice(-4)) || 2025
  const typeSeed = reportType === 'refundable' ? 1 : reportType === 'receivable' ? 2 : 3

  const rows = []
  let sno = 1
  selectedClasses.forEach(cls => {
    const sections = classMap[cls] || ['A']
    sections.forEach(sec => {
      const count = (sessionSeed + typeSeed + cls.length) % 4 + 2
      for (let i = 0; i < count; i++) {
        const namePool = studentNames[i % studentNames.length]
        const name = namePool[(sno + i) % namePool.length]
        const admNo = `${session.slice(0,2)}${String(sno * 7 + i * 13).padStart(4,'0')}`
        const feeAmount = (sno * 317 + i * 487 + typeSeed * 211) % 8000 + 500
        const paidAmount = reportType === 'refundable'
          ? feeAmount + (sno * 123 + i * 89) % 2000 + 200
          : reportType === 'receivable'
          ? feeAmount - (sno * 97 + i * 143) % (feeAmount - 100) - 100
          : feeAmount + (sno * 211 + i * 73) % 3000 + 300
        const balance = Math.abs(paidAmount - feeAmount)
        rows.push({
          sno: sno++,
          admNo,
          studentName: name,
          fatherName: `Mr. ${name.split(' ')[1] || 'Kumar'}`,
          class: cls,
          section: sec,
          totalFee: feeAmount,
          paidAmount: reportType === 'receivable' ? paidAmount : paidAmount,
          balance,
          month: ['April','May','June','July','August','September'][i % 6],
        })
      }
    })
  })
  return rows
}

// ─── COLOR HELPERS ────────────────────────────────────────────────────────────
const TYPE_COLORS = {
  emerald: {
    tab:     'bg-emerald-600 text-white shadow-emerald-500/25',
    tabIdle: 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-400 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400',
    badge:   'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    card:    'bg-emerald-50 dark:bg-emerald-500/10',
    icon:    'text-emerald-600 dark:text-emerald-400',
    amount:  'text-emerald-700 dark:text-emerald-300',
    dot:     'bg-emerald-500',
    btn:     'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25',
    header:  'from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20',
    border:  'border-emerald-200 dark:border-emerald-500/30',
  },
  rose: {
    tab:     'bg-rose-600 text-white shadow-rose-500/25',
    tabIdle: 'text-slate-600 hover:bg-rose-50 hover:text-rose-700 dark:text-slate-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-400',
    badge:   'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
    card:    'bg-rose-50 dark:bg-rose-500/10',
    icon:    'text-rose-600 dark:text-rose-400',
    amount:  'text-rose-700 dark:text-rose-300',
    dot:     'bg-rose-500',
    btn:     'bg-rose-600 hover:bg-rose-700 shadow-rose-500/25',
    header:  'from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20',
    border:  'border-rose-200 dark:border-rose-500/30',
  },
  amber: {
    tab:     'bg-amber-500 text-white shadow-amber-500/25',
    tabIdle: 'text-slate-600 hover:bg-amber-50 hover:text-amber-700 dark:text-slate-400 dark:hover:bg-amber-500/10 dark:hover:text-amber-400',
    badge:   'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    card:    'bg-amber-50 dark:bg-amber-500/10',
    icon:    'text-amber-600 dark:text-amber-400',
    amount:  'text-amber-700 dark:text-amber-300',
    dot:     'bg-amber-500',
    btn:     'bg-amber-500 hover:bg-amber-600 shadow-amber-500/25',
    header:  'from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20',
    border:  'border-amber-200 dark:border-amber-500/30',
  },
}

const formatINR = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

function NativeSelect({ value, onChange, children, placeholder, error, disabled }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full appearance-none pl-3 pr-8 py-2 text-[13px] rounded-lg border outline-none transition-all cursor-pointer
          bg-white text-slate-800
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  )
}

function Field({ label, error, required, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
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
        rounded-2xl shadow-xl text-[13px] font-semibold min-w-[260px] max-w-[90vw]
        ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}
      style={{ animation: 'slideUp .25s ease' }}
    >
      {type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// ─── SUMMARY CARD ─────────────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, subValue, color, isCurrency }) {
  const c = TYPE_COLORS[color] || TYPE_COLORS.emerald
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3.5 shadow-sm flex-1 min-w-0">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${c.card} ${c.icon}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[18px] sm:text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight truncate">
          {isCurrency ? formatINR(value) : value.toLocaleString()}
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
        {subValue !== undefined && (
          <p className="text-[10px] text-slate-400 dark:text-slate-500">{subValue} records</p>
        )}
      </div>
    </div>
  )
}

// ─── SCHOOL HEADER ────────────────────────────────────────────────────────────
function SchoolHeader({ reportType, session, classFilter }) {
  const rt = REPORT_TYPES.find(r => r.key === reportType)
  const c  = TYPE_COLORS[rt.color]
  return (
    <div className={`rounded-2xl border ${c.border} bg-gradient-to-r ${c.header} px-5 py-4 shadow-sm`}>
      <div className="flex items-center justify-center gap-2 mb-1">
        <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <h2 className="text-[15px] sm:text-[17px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight text-center">
          {SCHOOL_INFO.name}
        </h2>
      </div>
      <div className="flex items-center justify-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400 mb-3">
        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
        <span>{SCHOOL_INFO.address}</span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-white/10 border border-slate-200 dark:border-white/20 text-[12px] font-semibold text-slate-700 dark:text-slate-200">
          <Clock className="w-3 h-3" /> Session: {session}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-white/10 border border-slate-200 dark:border-white/20 text-[12px] font-semibold text-slate-700 dark:text-slate-200">
          <BookOpen className="w-3 h-3" /> {classFilter}
        </span>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${c.badge} text-[12px] font-bold`}>
          <rt.icon className="w-3 h-3" /> {rt.label} Report
        </span>
      </div>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, isTotal, reportType }) {
  const rt = REPORT_TYPES.find(r => r.key === reportType)
  const c  = TYPE_COLORS[rt.color]

  if (isTotal) {
    return (
      <tr className="bg-slate-50 dark:bg-white/[0.03] border-t-2 border-slate-200 dark:border-slate-700">
        <td className="px-3 py-3 text-center text-[11px] text-slate-400">—</td>
        <td colSpan={4} className="px-3 py-3">
          <span className="flex items-center gap-2 text-[13px] font-bold text-slate-700 dark:text-slate-200">
            <TrendingUp className="w-4 h-4 text-blue-500" /> Grand Total
          </span>
        </td>
        <td className="px-3 py-3 text-right">
          <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 tabular-nums">{formatINR(row.totalFee)}</span>
        </td>
        <td className="px-3 py-3 text-right">
          <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{formatINR(row.paidAmount)}</span>
        </td>
        <td className="px-3 py-3 text-right">
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[13px] font-bold ${c.badge}`}>
            <IndianRupee className="w-3 h-3" />{formatINR(row.balance).replace('₹','').trim()}
          </span>
        </td>
      </tr>
    )
  }

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors group">
      <td className="px-3 py-2.5 text-center text-[11px] text-slate-400 dark:text-slate-600 tabular-nums w-10">{row.sno}</td>
      <td className="px-3 py-2.5">
        <span className="text-[12px] font-mono text-slate-500 dark:text-slate-400">{row.admNo}</span>
      </td>
      <td className="px-3 py-2.5">
        <div>
          <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">{row.studentName}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">{row.fatherName}</p>
        </div>
      </td>
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">{row.class}</span>
          <span className="inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">{row.section}</span>
        </div>
      </td>
      <td className="px-3 py-2.5 text-center">
        <span className="text-[11px] text-slate-500 dark:text-slate-400">{row.month}</span>
      </td>
      <td className="px-3 py-2.5 text-right">
        <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-300 tabular-nums">{formatINR(row.totalFee)}</span>
      </td>
      <td className="px-3 py-2.5 text-right">
        <span className="text-[12px] font-semibold text-blue-700 dark:text-blue-400 tabular-nums">{formatINR(row.paidAmount)}</span>
      </td>
      <td className="px-3 py-2.5 text-right">
        <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[12px] font-bold ${c.badge}`}>
          {formatINR(row.balance)}
        </span>
      </td>
    </tr>
  )
}

// ─── MOBILE STUDENT CARD ──────────────────────────────────────────────────────
function MobileStudentCard({ row, reportType }) {
  const [expanded, setExpanded] = useState(false)
  const rt = REPORT_TYPES.find(r => r.key === reportType)
  const c  = TYPE_COLORS[rt.color]
  const initials = row.studentName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
      >
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-[12px] font-bold ${c.card} ${c.icon}`}>
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{row.studentName}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            {row.class} · Sec {row.section}
            <span className="ml-2 text-[10px] font-mono">{row.admNo}</span>
          </p>
        </div>

        <div className="flex flex-col items-end flex-shrink-0 mr-1">
          <span className={`text-[16px] font-bold tabular-nums ${c.amount}`}>{formatINR(row.balance)}</span>
          <span className="text-[10px] text-slate-400">{rt.amountLabel.split(' ')[0]}</span>
        </div>

        <ChevronRight className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 py-4 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 p-2.5 text-center">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Total Fee</p>
              <p className="text-[14px] font-bold text-slate-700 dark:text-slate-200 tabular-nums">{formatINR(row.totalFee)}</p>
            </div>
            <div className="rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-2.5 text-center">
              <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-wide mb-1">Paid</p>
              <p className="text-[14px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{formatINR(row.paidAmount)}</p>
            </div>
            <div className={`rounded-lg border p-2.5 text-center ${c.badge}`}>
              <p className="text-[10px] font-semibold uppercase tracking-wide mb-1 opacity-70">{rt.label.split(' ')[1] || rt.label}</p>
              <p className="text-[14px] font-bold tabular-nums">{formatINR(row.balance)}</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-[12px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700 pt-2.5">
            <span>Father: <strong className="text-slate-700 dark:text-slate-300">{row.fatherName}</strong></span>
            <span className="font-medium">{row.month}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, session, setSession, classFilter, setClassFilter, onShow, loading, errors }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl"
        style={{ animation: 'drawerUp .25s ease' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-5 space-y-4">
          <Field label="Session" error={errors.session} required>
            <NativeSelect value={session} onChange={e => setSession(e.target.value)} placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Class">
            <NativeSelect value={classFilter} onChange={e => setClassFilter(e.target.value)}>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>
        </div>
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={() => { onShow(); onClose() }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-70 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show Report
          </button>
        </div>
      </div>
    </>
  )
}

// ─── REPORT TYPE TABS (Desktop) ───────────────────────────────────────────────
function ReportTypeTabs({ activeType, onChange }) {
  return (
    <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#1e2238] border border-slate-200 dark:border-[rgba(99,102,241,0.15)]">
      {REPORT_TYPES.map(rt => {
        const c = TYPE_COLORS[rt.color]
        const isActive = activeType === rt.key
        return (
          <button
            key={rt.key}
            type="button"
            onClick={() => onChange(rt.key)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all
              ${isActive ? `${c.tab} shadow-md` : `${c.tabIdle} bg-transparent`}`}
          >
            <rt.icon className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">{rt.label}</span>
            <span className="sm:hidden">{rt.label.split(' ')[1] || rt.label.split(' ')[0]}</span>
          </button>
        )
      })}
    </div>
  )
}

// ─── MOBILE TYPE SELECTOR ─────────────────────────────────────────────────────
function MobileTypePills({ activeType, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {REPORT_TYPES.map(rt => {
        const c = TYPE_COLORS[rt.color]
        const isActive = activeType === rt.key
        return (
          <button
            key={rt.key}
            type="button"
            onClick={() => onChange(rt.key)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all flex-shrink-0
              ${isActive ? `${c.tab} shadow-md` : 'bg-white border border-slate-200 text-slate-600 dark:bg-[#1a1f35] dark:border-slate-700 dark:text-slate-400'}`}
          >
            <rt.icon className="w-3.5 h-3.5" />
            {rt.label}
          </button>
        )
      })}
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function FeeSubReconciliationReport() {
  const [reportType,    setReportType]    = useState('refundable')
  const [session,       setSession]       = useState('')
  const [classFilter,   setClassFilter]   = useState('All Classes')
  const [rows,          setRows]          = useState([])
  const [loading,       setLoading]       = useState(false)
  const [exporting,     setExporting]     = useState(false)
  const [filterOpen,    setFilterOpen]    = useState(false)
  const [search,        setSearch]        = useState('')
  const [errors,        setErrors]        = useState({})
  const [toast,         setToast]         = useState(null)
  const [shown,         setShown]         = useState(false)
  const [shownMeta,     setShownMeta]     = useState({ session: '', classFilter: '', reportType: '' })

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const rt = REPORT_TYPES.find(r => r.key === reportType)
  const c  = TYPE_COLORS[rt.color]

  // ── Tab switch: reset results ──────────────────────────────────────────────
  const handleTypeChange = useCallback((type) => {
    setReportType(type)
    setRows([])
    setShown(false)
    setSearch('')
    setErrors({})
  }, [])

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!session) err.session = 'Please select a session'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')
    setTimeout(() => {
      const data = generateFeeData(reportType, session, classFilter)
      setRows(data)
      setShownMeta({ session, classFilter, reportType })
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} records for ${rt.label}.`)
    }, 700)
  }, [session, classFilter, reportType, rt.label])

  const handleReset = () => {
    setSession(''); setClassFilter('All Classes'); setRows([])
    setSearch(''); setErrors({}); setShown(false)
    setShownMeta({ session: '', classFilter: '', reportType: '' })
  }

  const handleExcel = () => {
    if (!rows.length) { showToast('No data to export. Show report first.', 'error'); return }
    setExporting(true)
    setTimeout(() => { setExporting(false); showToast('Excel export ready! (API integration pending)') }, 1200)
  }

  // ── Search ─────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      r.studentName.toLowerCase().includes(q) ||
      r.fatherName.toLowerCase().includes(q)  ||
      r.admNo.toLowerCase().includes(q)        ||
      r.class.toLowerCase().includes(q)        ||
      r.section.toLowerCase().includes(q)
    )
  }, [rows, search])

  // ── Grand Totals ───────────────────────────────────────────────────────────
  const totals = useMemo(() => ({
    totalFee:    filtered.reduce((s, r) => s + r.totalFee, 0),
    paidAmount:  filtered.reduce((s, r) => s + r.paidAmount, 0),
    balance:     filtered.reduce((s, r) => s + r.balance, 0),
  }), [filtered])

  const hasResults  = shown && rows.length > 0
  const activeFilters = (session ? 1 : 0) + (classFilter !== 'All Classes' ? 1 : 0)
  const shownRt = REPORT_TYPES.find(r => r.key === shownMeta.reportType)

  return (
    <div className="space-y-4 pb-12">

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ReceiptText className="w-5 h-5 text-blue-600 dark:text-indigo-400 flex-shrink-0" />
            Fee Reconciliation Report
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            View refundable, receivable & advance fee status — class &amp; session wise.
          </p>
        </div>
        {hasResults && (
          <button
            type="button"
            onClick={handleExcel}
            disabled={exporting}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
              text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20
              transition-all active:scale-95 disabled:opacity-70 flex-shrink-0"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            Export Excel
          </button>
        )}
      </div>

      {/* ── Report Type Selector ─────────────────────────────────────────── */}
      {/* Desktop tabs */}
      <div className="hidden sm:block">
        <ReportTypeTabs activeType={reportType} onChange={handleTypeChange} />
      </div>
      {/* Mobile pills */}
      <div className="sm:hidden">
        <MobileTypePills activeType={reportType} onChange={handleTypeChange} />
      </div>

      {/* ── Report Type Description ──────────────────────────────────────── */}
      <div className={`rounded-xl border ${c.border} ${c.card} px-4 py-3 flex items-center gap-3`}>
        <rt.icon className={`w-5 h-5 flex-shrink-0 ${c.icon}`} />
        <div>
          <p className={`text-[13px] font-semibold ${c.amount}`}>{rt.label} Report</p>
          <p className="text-[12px] text-slate-500 dark:text-slate-400">{rt.desc}</p>
        </div>
      </div>

      {/* ── DESKTOP Filter Card ──────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <Field label="Session" error={errors.session} required>
              <NativeSelect
                value={session}
                onChange={e => { setSession(e.target.value); setErrors(p => ({ ...p, session: undefined })) }}
                placeholder="-- Select Session --"
                error={errors.session}
              >
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Class">
              <NativeSelect value={classFilter} onChange={e => setClassFilter(e.target.value)}>
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            {/* Spacer */}
            <div />

            <div className="flex gap-2">
              <button type="button" onClick={handleShow} disabled={loading}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold text-white
                  ${c.btn} shadow-md transition-all active:scale-95 disabled:opacity-70`}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                Show
              </button>
              <button type="button" onClick={handleReset}
                className="flex items-center justify-center px-3 py-2 rounded-xl text-[13px] font-semibold
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ─────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white ${c.btn} shadow-md`}>
          <SlidersHorizontal className="w-4 h-4" />
          {session ? `${session} · ${classFilter === 'All Classes' ? 'All' : classFilter}` : 'Select Filters'}
          {activeFilters > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilters}</span>
          )}
        </button>
        {hasResults && (
          <button type="button" onClick={handleExcel} disabled={exporting}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold bg-emerald-600 text-white disabled:opacity-70">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
          </button>
        )}
        {hasResults && (
          <button type="button" onClick={handleReset}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        session={session}
        setSession={setSession}
        classFilter={classFilter}
        setClassFilter={setClassFilter}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ──────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-5" />
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      )}

      {/* ── Results ───────────────────────────────────────────────────────── */}
      {hasResults && !loading && shownRt && (
        <>
          {/* School Header */}
          <SchoolHeader reportType={shownMeta.reportType} session={shownMeta.session} classFilter={shownMeta.classFilter} />

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <SummaryCard icon={IndianRupee}  label="Total Fee"            value={totals.totalFee}   color="emerald" isCurrency />
            <SummaryCard icon={BadgeIndianRupee} label="Amount Paid"       value={totals.paidAmount} color="amber"   isCurrency />
            <SummaryCard icon={shownRt.icon} label={shownRt.amountLabel}  value={totals.balance}    color={shownRt.color} isCurrency subValue={filtered.length} />
          </div>

          {/* Results Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-2 flex-1 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <shownRt.icon className={`w-4 h-4 flex-shrink-0 ${TYPE_COLORS[shownRt.color].icon}`} />
                <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">{shownRt.label} Report</span>
                <span className="text-[12px] text-slate-400 dark:text-slate-500">· {shownMeta.session}</span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${TYPE_COLORS[shownRt.color].badge}`}>
                  {filtered.length} record{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-56 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Name, Adm No, Class…"
                  className="w-full pl-8 pr-7 py-1.5 text-[12px] rounded-lg border outline-none transition-all
                    bg-white text-slate-700 border-slate-200 placeholder-slate-300
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                    dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                    dark:placeholder-slate-600 dark:focus:border-indigo-400"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Info hint */}
            <div className={`hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] ${TYPE_COLORS[shownRt.color].card}`}>
              <Info className={`w-3.5 h-3.5 flex-shrink-0 ${TYPE_COLORS[shownRt.color].icon}`} />
              <p className={`text-[12px] ${TYPE_COLORS[shownRt.color].amount}`}>
                {shownRt.desc}. Showing {filtered.length} student{filtered.length !== 1 ? 's' : ''} for {shownMeta.classFilter}.
              </p>
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block overflow-x-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No records match your search.</span>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                      {['S.No.', 'Adm No', 'Student Name', 'Class/Sec', 'Month', 'Total Fee', 'Paid Amount', shownRt.amountLabel].map((h, i) => (
                        <th key={i}
                          className={`px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap
                            ${i === 0 ? 'text-center w-10' : i >= 5 ? 'text-right' : 'text-left'}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(row => (
                      <DesktopRow key={row.sno} row={row} reportType={shownMeta.reportType} />
                    ))}
                    <DesktopRow row={totals} isTotal reportType={shownMeta.reportType} />
                  </tbody>
                </table>
              )}
            </div>

            {/* ── MOBILE CARDS ── */}
            <div className="md:hidden p-4 space-y-3">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No records match your search.</span>
                </div>
              ) : (
                <>
                  <p className={`text-[11px] font-medium flex items-center gap-1.5 pb-1 ${TYPE_COLORS[shownRt.color].icon}`}>
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap a student card to see details.
                  </p>

                  {filtered.map(row => (
                    <MobileStudentCard key={row.sno} row={row} reportType={shownMeta.reportType} />
                  ))}

                  {/* Mobile Grand Total */}
                  <div className={`rounded-xl border-2 ${TYPE_COLORS[shownRt.color].border} ${TYPE_COLORS[shownRt.color].card} p-4`}>
                    <p className={`text-[11px] font-bold uppercase tracking-wide mb-3 flex items-center gap-2 ${TYPE_COLORS[shownRt.color].amount}`}>
                      <TrendingUp className="w-4 h-4" /> Grand Total — {filtered.length} Students
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[13px] font-bold text-slate-700 dark:text-slate-300 tabular-nums">{formatINR(totals.totalFee)}</p>
                        <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Total Fee</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[13px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{formatINR(totals.paidAmount)}</p>
                        <p className="text-[10px] font-semibold text-blue-500 dark:text-blue-400 mt-0.5">Paid</p>
                      </div>
                      <div className={`rounded-lg p-2.5 text-center border ${TYPE_COLORS[shownRt.color].badge}`}>
                        <p className="text-[13px] font-bold tabular-nums">{formatINR(totals.balance)}</p>
                        <p className="text-[10px] font-semibold opacity-70 mt-0.5">{shownRt.label.split(' ')[1] || shownRt.label}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Table Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{rows.length}</span> records
              </p>
              {search && (
                <button onClick={() => setSearch('')}
                  className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                  <X className="w-3 h-3" /> Clear search
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Empty State ───────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${c.card}`}>
            <rt.icon className={`w-8 h-8 ${c.icon}`} />
          </div>
          <div className="text-center max-w-xs">
            <p className="text-[15px] font-semibold text-slate-600 dark:text-slate-400">{rt.label} Report</p>
            <p className="text-[13px] text-slate-400 dark:text-slate-500 mt-1">{rt.desc}</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-2">
              Select a <strong>Session</strong> and click <strong>Show</strong> to generate this report.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
