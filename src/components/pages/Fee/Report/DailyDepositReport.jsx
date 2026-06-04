/**
 * DailyDepositReport.jsx
 * Daily Settlement Deposit Report — React + Tailwind
 * Converted from legacy ASPX page
 *
 * Features:
 *  - Session, Platform, Pay Mode (multi), Class (multi), Admission No, Date Range filters
 *  - Desktop: ERP-style dense table with sticky header
 *  - Mobile: Card-based layout with tabs, expandable rows, drawer filters
 *  - Excel export placeholder
 *  - Loading / empty / error states
 *  - Toast notifications
 *  - Summary stat cards
 */

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import {
  Filter, RefreshCw, Eye, AlertCircle, X, Check, Loader2,
  ChevronDown, ChevronRight, ChevronUp, SlidersHorizontal,
  Search, FileSpreadsheet, Calendar, CreditCard, School2,
  TrendingUp, Banknote, Users, Hash, LayoutList, BarChart3,
  ArrowUpDown, Info, CheckSquare, Square, Building2, MapPin,
  Receipt, Wallet, BookOpen, GraduationCap, UserCheck,
  IndianRupee, Clock, CheckCircle2, XCircle, AlertTriangle
} from 'lucide-react'

// ─── STATIC DATA ──────────────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const PLATFORMS = [
  { label: '-- Select Platform --', value: '0' },
  { label: 'Regular (ERP)', value: 'Erp' },
  { label: 'Student Registration', value: 'Admission' },
  { label: 'Faculty Registration', value: 'job' },
]

const PAY_MODES = ['Cash', 'Cheque', 'Online', 'NEFT', 'RTGS', 'DD', 'Card']

const CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII',
  'Class IX', 'Class X', 'Class XI', 'Class XII',
]

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Sr. Sec. School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

// Dummy deposit records
const DUMMY_RECORDS = [
  { id: 1, admNo: 'ADM001', studentName: 'Aarav Sharma',    class: 'Class X',    section: 'A', feeHead: 'Tuition Fee',      amount: 4500,  payMode: 'Cash',   receiptNo: 'RCP2024001', settledDate: '01 Jun 2024', platform: 'Erp',      status: 'Settled' },
  { id: 2, admNo: 'ADM002', studentName: 'Priya Singh',     class: 'Class IX',   section: 'B', feeHead: 'Annual Charge',    amount: 2200,  payMode: 'Online', receiptNo: 'RCP2024002', settledDate: '01 Jun 2024', platform: 'Erp',      status: 'Settled' },
  { id: 3, admNo: 'ADM003', studentName: 'Rohan Verma',     class: 'Class XII',  section: 'A', feeHead: 'Lab Fee',          amount: 800,   payMode: 'NEFT',   receiptNo: 'RCP2024003', settledDate: '01 Jun 2024', platform: 'Erp',      status: 'Pending' },
  { id: 4, admNo: 'ADM004', studentName: 'Sneha Patel',     class: 'Class VIII', section: 'A', feeHead: 'Tuition Fee',      amount: 3800,  payMode: 'Cheque', receiptNo: 'RCP2024004', settledDate: '02 Jun 2024', platform: 'Erp',      status: 'Settled' },
  { id: 5, admNo: 'ADM005', studentName: 'Kunal Joshi',     class: 'Class VI',   section: 'A', feeHead: 'Transport Fee',    amount: 1500,  payMode: 'Cash',   receiptNo: 'RCP2024005', settledDate: '02 Jun 2024', platform: 'Erp',      status: 'Settled' },
  { id: 6, admNo: 'ADM006', studentName: 'Anita Rawat',     class: 'Class VII',  section: 'A', feeHead: 'Tuition Fee',      amount: 4200,  payMode: 'Card',   receiptNo: 'RCP2024006', settledDate: '02 Jun 2024', platform: 'Erp',      status: 'Settled' },
  { id: 7, admNo: 'REG007', studentName: 'Vivek Kumar',     class: 'Nursery',    section: 'A', feeHead: 'Registration Fee', amount: 1000,  payMode: 'Online', receiptNo: 'RCP2024007', settledDate: '03 Jun 2024', platform: 'Admission',status: 'Settled' },
  { id: 8, admNo: 'ADM008', studentName: 'Meera Gupta',     class: 'Class XI',   section: 'B', feeHead: 'Annual Charge',    amount: 2500,  payMode: 'RTGS',   receiptNo: 'RCP2024008', settledDate: '03 Jun 2024', platform: 'Erp',      status: 'Settled' },
  { id: 9, admNo: 'ADM009', studentName: 'Arjun Nair',      class: 'Class IV',   section: 'A', feeHead: 'Exam Fee',         amount: 600,   payMode: 'Cash',   receiptNo: 'RCP2024009', settledDate: '03 Jun 2024', platform: 'Erp',      status: 'Failed'  },
  { id: 10,admNo: 'ADM010', studentName: 'Pooja Mishra',    class: 'Class III',  section: 'A', feeHead: 'Tuition Fee',      amount: 3500,  payMode: 'Online', receiptNo: 'RCP2024010', settledDate: '04 Jun 2024', platform: 'Erp',      status: 'Settled' },
  { id: 11,admNo: 'ADM011', studentName: 'Rahul Tiwari',    class: 'Class V',    section: 'A', feeHead: 'Library Fee',      amount: 400,   payMode: 'Cash',   receiptNo: 'RCP2024011', settledDate: '04 Jun 2024', platform: 'Erp',      status: 'Settled' },
  { id: 12,admNo: 'ADM012', studentName: 'Kavya Reddy',     class: 'Class II',   section: 'A', feeHead: 'Tuition Fee',      amount: 3200,  payMode: 'Cheque', receiptNo: 'RCP2024012', settledDate: '04 Jun 2024', platform: 'Erp',      status: 'Pending' },
  { id: 13,admNo: 'FAC013', studentName: 'Mr. D. Sharma',   class: '—',          section: '—', feeHead: 'Joining Fee',      amount: 500,   payMode: 'Online', receiptNo: 'RCP2024013', settledDate: '05 Jun 2024', platform: 'job',      status: 'Settled' },
  { id: 14,admNo: 'ADM014', studentName: 'Neha Agarwal',    class: 'Class I',    section: 'B', feeHead: 'Tuition Fee',      amount: 3000,  payMode: 'DD',     receiptNo: 'RCP2024014', settledDate: '05 Jun 2024', platform: 'Erp',      status: 'Settled' },
  { id: 15,admNo: 'ADM015', studentName: 'Shiv Prasad',     class: 'Class IX',   section: 'A', feeHead: 'Annual Charge',    amount: 2200,  payMode: 'NEFT',   receiptNo: 'RCP2024015', settledDate: '05 Jun 2024', platform: 'Erp',      status: 'Settled' },
  { id: 16,admNo: 'ADM016', studentName: 'Riya Kapoor',     class: 'Class XI',   section: 'A', feeHead: 'Tuition Fee',      amount: 5500,  payMode: 'Online', receiptNo: 'RCP2024016', settledDate: '06 Jun 2024', platform: 'Erp',      status: 'Settled' },
  { id: 17,admNo: 'REG017', studentName: 'Aarav Bose',      class: 'LKG',        section: 'A', feeHead: 'Registration Fee', amount: 1000,  payMode: 'Cash',   receiptNo: 'RCP2024017', settledDate: '06 Jun 2024', platform: 'Admission',status: 'Settled' },
  { id: 18,admNo: 'ADM018', studentName: 'Tanvi Chouhan',   class: 'Class X',    section: 'A', feeHead: 'Exam Fee',         amount: 700,   payMode: 'Card',   receiptNo: 'RCP2024018', settledDate: '06 Jun 2024', platform: 'Erp',      status: 'Settled' },
  { id: 19,admNo: 'ADM019', studentName: 'Manish Dubey',    class: 'Class XII',  section: 'B', feeHead: 'Lab Fee',          amount: 900,   payMode: 'Online', receiptNo: 'RCP2024019', settledDate: '07 Jun 2024', platform: 'Erp',      status: 'Failed'  },
  { id: 20,admNo: 'ADM020', studentName: 'Deepika Yadav',   class: 'Class VI',   section: 'B', feeHead: 'Tuition Fee',      amount: 4000,  payMode: 'Cash',   receiptNo: 'RCP2024020', settledDate: '07 Jun 2024', platform: 'Erp',      status: 'Settled' },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`

const STATUS_CONFIG = {
  Settled: { icon: CheckCircle2, cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400', dot: 'bg-emerald-500' },
  Pending: { icon: Clock,        cls: 'bg-amber-50  text-amber-700  dark:bg-amber-500/10  dark:text-amber-400',  dot: 'bg-amber-500'  },
  Failed:  { icon: XCircle,      cls: 'bg-rose-50   text-rose-700   dark:bg-rose-500/10   dark:text-rose-400',   dot: 'bg-rose-500'   },
}

const PAY_MODE_COLOR = {
  Cash:   'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400',
  Cheque: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  Online: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400',
  NEFT:   'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400',
  RTGS:   'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400',
  DD:     'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
  Card:   'bg-pink-50 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400',
}

// ─── PRIMITIVE UI ─────────────────────────────────────────────────────────────

function NativeSelect({ value, onChange, children, placeholder, error, disabled }) {
  return (
    <div className="relative">
      <select
        value={value} onChange={onChange} disabled={disabled}
        className={`w-full appearance-none pl-3 pr-8 py-2 text-[13px] rounded-lg border outline-none transition-all cursor-pointer
          bg-white text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100
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

function Field({ label, error, required, children, hint }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1">
        {label}{required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[10px] text-slate-400 dark:text-slate-500">{hint}</p>}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-rose-500">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
        </p>
      )}
    </div>
  )
}

function Toast({ message, type = 'success', onClose }) {
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3.5
      rounded-2xl shadow-2xl text-[13px] font-semibold min-w-[260px] max-w-[90vw]
      ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}
      style={{ animation: 'slideUp .25s ease' }}>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
      {type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="opacity-75 hover:opacity-100"><X className="w-4 h-4" /></button>
    </div>
  )
}

// ─── MULTI-SELECT DROPDOWN ────────────────────────────────────────────────────

function MultiSelect({ options, selected, onChange, placeholder, error }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggle = (val) => {
    onChange(selected.includes(val)
      ? selected.filter(v => v !== val)
      : [...selected, val])
  }
  const selectAll = () => onChange([...options])
  const clearAll  = () => onChange([])
  const label = selected.length === 0 ? placeholder
    : selected.length === options.length ? 'All selected'
    : selected.length === 1 ? selected[0]
    : `${selected.length} selected`

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between pl-3 pr-2.5 py-2 text-[13px] rounded-lg border outline-none transition-all
          bg-white text-left dark:bg-[#1e2238]
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          ${error ? 'border-rose-400' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}
          ${selected.length > 0 ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'}`}
      >
        <span className="truncate pr-2">{label}</span>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {selected.length > 0 && (
            <span className="bg-blue-100 text-blue-700 dark:bg-indigo-500/20 dark:text-indigo-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {selected.length}
            </span>
          )}
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-[#1e2238] border border-slate-200 dark:border-[rgba(99,102,241,0.25)] rounded-xl shadow-xl overflow-hidden"
          style={{ maxHeight: 260 }}>
          {/* Controls */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50 dark:bg-white/[0.02]">
            <button type="button" onClick={selectAll}
              className="text-[11px] font-semibold text-blue-600 dark:text-indigo-400 hover:underline">All</button>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <button type="button" onClick={clearAll}
              className="text-[11px] font-semibold text-slate-500 hover:text-rose-500 hover:underline">None</button>
          </div>

          {/* Options */}
          <div className="overflow-y-auto" style={{ maxHeight: 210 }}>
            {options.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => toggle(opt)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-slate-700 dark:text-slate-300
                  hover:bg-blue-50 dark:hover:bg-white/[0.03] transition-colors text-left"
              >
                <span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors
                  ${selected.includes(opt)
                    ? 'border-blue-500 bg-blue-500 dark:border-indigo-400 dark:bg-indigo-400'
                    : 'border-slate-300 dark:border-slate-600'}`}>
                  {selected.includes(opt) && <Check className="w-2.5 h-2.5 text-white" />}
                </span>
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── SUMMARY CARD ──────────────────────────────────────────────────────────────

function SummaryCard({ icon: Icon, label, value, subLabel, color }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    rose:    'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)]
      bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[18px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight truncate">{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
        {subLabel && <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{subLabel}</p>}
      </div>
    </div>
  )
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Pending
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-semibold ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  )
}

// ─── PAYMODE BADGE ────────────────────────────────────────────────────────────

function PayModeBadge({ mode }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-semibold ${PAY_MODE_COLOR[mode] || 'bg-slate-100 text-slate-600'}`}>
      {mode}
    </span>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────

function DesktopRow({ row, idx }) {
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors group">
      <td className="px-3 py-2.5 text-center text-[11px] text-slate-400 tabular-nums w-10">{idx}</td>
      <td className="px-3 py-2.5">
        <span className="text-[12px] font-bold text-blue-700 dark:text-blue-400 font-mono">{row.admNo}</span>
      </td>
      <td className="px-3 py-2.5">
        <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 leading-tight whitespace-nowrap">{row.studentName}</p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500">{row.class} {row.section !== '—' ? `· Sec ${row.section}` : ''}</p>
      </td>
      <td className="px-3 py-2.5">
        <span className="text-[12px] font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.feeHead}</span>
      </td>
      <td className="px-3 py-2.5 text-right">
        <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100 tabular-nums">{fmt(row.amount)}</span>
      </td>
      <td className="px-3 py-2.5 text-center"><PayModeBadge mode={row.payMode} /></td>
      <td className="px-3 py-2.5">
        <span className="text-[12px] font-mono text-slate-500 dark:text-slate-400">{row.receiptNo}</span>
      </td>
      <td className="px-3 py-2.5">
        <span className="text-[12px] text-slate-500 dark:text-slate-400 whitespace-nowrap">{row.settledDate}</span>
      </td>
      <td className="px-3 py-2.5 text-center"><StatusBadge status={row.status} /></td>
    </tr>
  )
}

// ─── MOBILE DEPOSIT CARD ──────────────────────────────────────────────────────

function MobileCard({ row }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Main row — always visible */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-start gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Left: status indicator */}
        <div className={`w-1 self-stretch rounded-full flex-shrink-0 mt-0.5 ${
          row.status === 'Settled' ? 'bg-emerald-400' : row.status === 'Pending' ? 'bg-amber-400' : 'bg-rose-400'
        }`} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 truncate">{row.studentName}</p>
            <span className="text-[16px] font-bold text-slate-800 dark:text-slate-100 tabular-nums flex-shrink-0">{fmt(row.amount)}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-bold">{row.admNo}</span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">{row.class}</span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <PayModeBadge mode={row.payMode} />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[11px] text-slate-400">{row.feeHead}</span>
            <StatusBadge status={row.status} />
          </div>
        </div>

        <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 mt-1 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 py-3 space-y-2 bg-slate-50/40 dark:bg-white/[0.01]">
          {[
            ['Receipt No.',    row.receiptNo,    'font-mono text-violet-600 dark:text-violet-400'],
            ['Settlement Date',row.settledDate,  'text-slate-700 dark:text-slate-200'],
            ['Platform',       row.platform,     'text-slate-700 dark:text-slate-200'],
            ['Section',        row.section,      'text-slate-700 dark:text-slate-200'],
          ].map(([k, v, cls]) => (
            <div key={k} className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 dark:text-slate-500">{k}</span>
              <span className={`text-[12px] font-semibold ${cls}`}>{v}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── FILTER DRAWER (mobile) ───────────────────────────────────────────────────

function FilterDrawer({ open, onClose, filters, setFilter, onSubmit, onReset, loading, errors }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35]
        border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl max-h-[92vh] overflow-y-auto"
        style={{ animation: 'drawerUp .25s ease' }}>
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-white dark:bg-[#1a1f35] z-10">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] sticky top-5 bg-white dark:bg-[#1a1f35] z-10">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span className="text-[15px] font-bold text-slate-800 dark:text-slate-100">Search Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Fields */}
        <div className="px-5 py-4 space-y-4">
          <Field label="Session" error={errors.session} required>
            <NativeSelect value={filters.session} onChange={e => setFilter('session', e.target.value)}
              placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Platform" error={errors.platform} required>
            <NativeSelect value={filters.platform} onChange={e => setFilter('platform', e.target.value)} error={errors.platform}>
              {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Pay Mode" hint="Select one or more">
            <MultiSelect options={PAY_MODES} selected={filters.payModes}
              onChange={v => setFilter('payModes', v)} placeholder="-- All Pay Modes --" />
          </Field>

          <Field label="Class" hint="Select one or more">
            <MultiSelect options={CLASSES} selected={filters.classes}
              onChange={v => setFilter('classes', v)} placeholder="-- All Classes --" />
          </Field>

          <Field label="Admission No.">
            <div className="relative">
              <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input value={filters.admNo} onChange={e => setFilter('admNo', e.target.value)}
                placeholder="e.g. ADM001"
                className="w-full pl-8 pr-3 py-2 text-[13px] rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.25)]
                  bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200 placeholder-slate-300 dark:placeholder-slate-600
                  outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400" />
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="From Date" error={errors.fromDate} required>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input type="date" value={filters.fromDate} onChange={e => setFilter('fromDate', e.target.value)}
                  className={`w-full pl-8 pr-2 py-2 text-[12px] rounded-lg border outline-none transition-all
                    bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400
                    ${errors.fromDate ? 'border-rose-400' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`} />
              </div>
            </Field>
            <Field label="To Date" error={errors.toDate} required>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input type="date" value={filters.toDate} onChange={e => setFilter('toDate', e.target.value)}
                  className={`w-full pl-8 pr-2 py-2 text-[12px] rounded-lg border outline-none transition-all
                    bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400
                    ${errors.toDate ? 'border-rose-400' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`} />
              </div>
            </Field>
          </div>
        </div>

        {/* Action buttons */}
        <div className="sticky bottom-0 px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]
          bg-white dark:bg-[#1a1f35] flex gap-3">
          <button type="button" onClick={() => { onReset(); onClose() }}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold
              bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Reset
          </button>
          <button type="button" onClick={() => { onSubmit(); onClose() }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 shadow-md shadow-blue-500/20
              disabled:opacity-70 transition-all active:scale-[0.98]">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            {loading ? 'Loading…' : 'Show Report'}
          </button>
        </div>
      </div>
    </>
  )
}

// ─── SCHOOL HEADER ────────────────────────────────────────────────────────────

function SchoolHeader({ fromDate, toDate, platform }) {
  const platformLabel = PLATFORMS.find(p => p.value === platform)?.label || platform
  return (
    <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)]
      bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35]
      px-5 py-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <h2 className="text-[15px] sm:text-[17px] font-extrabold text-slate-800 dark:text-slate-100 leading-tight">
              {SCHOOL_INFO.name}
            </h2>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 ml-6">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            {SCHOOL_INFO.address}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 ml-6 sm:ml-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25 text-[11px] font-bold text-amber-700 dark:text-amber-400">
            <Calendar className="w-3 h-3" />
            {fromDate} → {toDate}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/25 text-[11px] font-bold text-blue-700 dark:text-blue-400">
            <CreditCard className="w-3 h-3" />
            {platformLabel}
          </span>
        </div>
      </div>
      <p className="text-center text-[12px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400 mt-3">
        Daily Settlement Deposit Report
      </p>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

const INIT_FILTERS = {
  session: '', platform: '0', payModes: [], classes: [],
  admNo: '', fromDate: '', toDate: '',
}

export default function DailyDepositReport() {
  const [filters, setFiltersState] = useState(INIT_FILTERS)
  const [records, setRecords]     = useState([])
  const [loading, setLoading]     = useState(false)
  const [exporting, setExporting] = useState(false)
  const [shown, setShown]         = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [search, setSearch]       = useState('')
  const [sortKey, setSortKey]     = useState(null)
  const [sortDir, setSortDir]     = useState('asc')
  const [errors, setErrors]       = useState({})
  const [toast, setToast]         = useState(null)
  const [shownMeta, setShownMeta] = useState({})
  const [activeTab, setActiveTab] = useState('all')

  const setFilter = useCallback((key, val) => {
    setFiltersState(p => ({ ...p, [key]: val }))
    setErrors(p => ({ ...p, [key]: undefined }))
  }, [])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const err = {}
    if (!filters.session)  err.session  = 'Required'
    if (filters.platform === '0') err.platform = 'Required'
    if (!filters.fromDate) err.fromDate = 'Required'
    if (!filters.toDate)   err.toDate   = 'Required'
    if (filters.fromDate && filters.toDate && filters.fromDate > filters.toDate)
      err.toDate = 'Must be after From Date'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    if (!validate()) return
    setLoading(true)
    setSearch('')

    // Simulate API call — filter DUMMY_RECORDS by platform
    setTimeout(() => {
      let data = DUMMY_RECORDS.filter(r =>
        filters.platform === 'Erp' ? r.platform === 'Erp'
        : filters.platform === 'Admission' ? r.platform === 'Admission'
        : filters.platform === 'job' ? r.platform === 'job'
        : true
      )
      if (filters.classes.length > 0)   data = data.filter(r => filters.classes.includes(r.class))
      if (filters.payModes.length > 0)  data = data.filter(r => filters.payModes.includes(r.payMode))
      if (filters.admNo.trim())         data = data.filter(r => r.admNo.toLowerCase().includes(filters.admNo.toLowerCase()))

      setRecords(data)
      setShownMeta({ ...filters })
      setShown(true)
      setLoading(false)
      setActiveTab('all')
      showToast(`Loaded ${data.length} deposit records.`)
    }, 750)
  }, [filters])

  // ── Reset ───────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setFiltersState(INIT_FILTERS)
    setRecords([]); setShown(false); setSearch('')
    setErrors({}); setSortKey(null); setShownMeta({})
  }

  // ── Excel Export ────────────────────────────────────────────────────────────
  const handleExcel = () => {
    if (!records.length) { showToast('No data to export.', 'error'); return }
    setExporting(true)
    setTimeout(() => { setExporting(false); showToast('Excel export ready! (API integration pending)') }, 1200)
  }

  // ── Search + Tab filter ─────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let d = records
    if (activeTab !== 'all') d = d.filter(r => r.status === activeTab)
    if (search) {
      const q = search.toLowerCase()
      d = d.filter(r =>
        r.studentName.toLowerCase().includes(q) ||
        r.admNo.toLowerCase().includes(q) ||
        r.receiptNo.toLowerCase().includes(q) ||
        r.feeHead.toLowerCase().includes(q) ||
        r.class.toLowerCase().includes(q)
      )
    }
    if (sortKey) {
      d = [...d].sort((a, b) => {
        let av = a[sortKey], bv = b[sortKey]
        if (typeof av === 'number') return sortDir === 'asc' ? av - bv : bv - av
        return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
      })
    }
    return d
  }, [records, search, sortKey, sortDir, activeTab])

  // ── Totals ──────────────────────────────────────────────────────────────────
  const totals = useMemo(() => ({
    total:    records.length,
    settled:  records.filter(r => r.status === 'Settled').length,
    pending:  records.filter(r => r.status === 'Pending').length,
    failed:   records.filter(r => r.status === 'Failed').length,
    amount:   records.filter(r => r.status === 'Settled').reduce((s, r) => s + r.amount, 0),
    allAmount: records.reduce((s, r) => s + r.amount, 0),
  }), [records])

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const SortIcon = ({ k }) => sortKey !== k ? (
    <ArrowUpDown className="w-3 h-3 opacity-30 ml-1 inline" />
  ) : sortDir === 'asc' ? (
    <ChevronUp className="w-3 h-3 text-blue-600 dark:text-indigo-400 ml-1 inline" />
  ) : (
    <ChevronDown className="w-3 h-3 text-blue-600 dark:text-indigo-400 ml-1 inline" />
  )

  const activeFilterCount = [
    filters.session, filters.platform !== '0' && filters.platform,
    filters.payModes.length, filters.classes.length,
    filters.admNo, filters.fromDate, filters.toDate
  ].filter(Boolean).length

  const TABS = [
    { key: 'all',     label: 'All',     count: totals.total,   color: 'blue'    },
    { key: 'Settled', label: 'Settled', count: totals.settled, color: 'emerald' },
    { key: 'Pending', label: 'Pending', count: totals.pending, color: 'amber'   },
    { key: 'Failed',  label: 'Failed',  count: totals.failed,  color: 'rose'    },
  ]

  const TAB_COLORS = {
    blue:    'border-blue-500 text-blue-700 dark:text-blue-400',
    emerald: 'border-emerald-500 text-emerald-700 dark:text-emerald-400',
    amber:   'border-amber-500 text-amber-700 dark:text-amber-400',
    rose:    'border-rose-500 text-rose-700 dark:text-rose-400',
  }

  return (
    <div className="space-y-4 pb-12">

      {/* ── Page Title ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Daily Deposit Report
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Settlement-date wise fee deposit — by platform, class &amp; pay mode.
          </p>
        </div>

        {/* Desktop: export button */}
        {shown && (
          <button type="button" onClick={handleExcel} disabled={exporting}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20
              transition-all active:scale-95 disabled:opacity-70 flex-shrink-0">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            Export Excel
          </button>
        )}
      </div>

      {/* ── DESKTOP FILTER CARD ── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)]
        bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)]
          bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
          {activeFilterCount > 0 && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
              {activeFilterCount} active
            </span>
          )}
        </div>

        <div className="p-5 space-y-4">
          {/* Row 1 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="Session" error={errors.session} required>
              <NativeSelect value={filters.session} onChange={e => setFilter('session', e.target.value)}
                placeholder="-- Select Session --" error={errors.session}>
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Platform" error={errors.platform} required>
              <NativeSelect value={filters.platform} onChange={e => setFilter('platform', e.target.value)} error={errors.platform}>
                {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Pay Mode" hint="Multi-select">
              <MultiSelect options={PAY_MODES} selected={filters.payModes}
                onChange={v => setFilter('payModes', v)} placeholder="-- All Modes --" />
            </Field>

            <Field label="Class" hint="Multi-select">
              <MultiSelect options={CLASSES} selected={filters.classes}
                onChange={v => setFilter('classes', v)} placeholder="-- All Classes --" />
            </Field>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <Field label="Admission No.">
              <div className="relative">
                <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input value={filters.admNo} onChange={e => setFilter('admNo', e.target.value)}
                  placeholder="e.g. ADM001"
                  className="w-full pl-8 pr-3 py-2 text-[13px] rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.25)]
                    bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200 placeholder-slate-300 dark:placeholder-slate-600
                    outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400" />
              </div>
            </Field>

            <Field label="From Date" error={errors.fromDate} required>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input type="date" value={filters.fromDate} onChange={e => setFilter('fromDate', e.target.value)}
                  className={`w-full pl-8 pr-2 py-2 text-[13px] rounded-lg border outline-none transition-all
                    bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400
                    ${errors.fromDate ? 'border-rose-400' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`} />
              </div>
            </Field>

            <Field label="To Date" error={errors.toDate} required>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input type="date" value={filters.toDate} onChange={e => setFilter('toDate', e.target.value)}
                  className={`w-full pl-8 pr-2 py-2 text-[13px] rounded-lg border outline-none transition-all
                    bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400
                    ${errors.toDate ? 'border-rose-400' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`} />
              </div>
            </Field>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button type="button" onClick={handleSubmit} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold text-white
                  bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
                  transition-all active:scale-95 disabled:opacity-70">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                {loading ? 'Loading…' : 'Show'}
              </button>
              <button type="button" onClick={handleReset} title="Reset all filters"
                className="flex items-center justify-center px-3 py-2 rounded-xl text-[13px] font-semibold
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE FILTER BAR ── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20 active:scale-[0.98]">
          <SlidersHorizontal className="w-4 h-4" />
          {activeFilterCount > 0 ? `Filters (${activeFilterCount})` : 'Set Filters & Show'}
          {activeFilterCount > 0 && (
            <span className="bg-white/25 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilterCount}</span>
          )}
        </button>
        {shown && (
          <>
            <button type="button" onClick={handleExcel} disabled={exporting}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold
                bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm disabled:opacity-70 active:scale-95">
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            </button>
            <button type="button" onClick={handleReset}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 active:scale-95">
              <RefreshCw className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Mobile Filter Drawer */}
      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        setFilter={setFilter}
        onSubmit={handleSubmit}
        onReset={handleReset}
        loading={loading}
        errors={errors}
      />

      {/* ── LOADING SKELETON ── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-5 space-y-3">
          <div className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      )}

      {/* ── RESULTS ── */}
      {shown && !loading && (
        <>
          {/* School Header */}
          <SchoolHeader
            fromDate={shownMeta.fromDate || '—'}
            toDate={shownMeta.toDate || '—'}
            platform={shownMeta.platform}
          />

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={Receipt}      label="Total Records"     value={totals.total}            color="blue"    />
            <SummaryCard icon={IndianRupee}  label="Settled Amount"    value={fmt(totals.amount)}      color="emerald" />
            <SummaryCard icon={Clock}        label="Pending"           value={totals.pending}          color="amber"   />
            <SummaryCard icon={XCircle}      label="Failed"            value={totals.failed}           color="rose"    />
          </div>

          {/* Result Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card header with tabs + search */}
            <div className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)]">
              {/* Tabs */}
              <div className="flex items-center gap-0 px-4 pt-3 overflow-x-auto scrollbar-hide">
                {TABS.map(tab => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-[12px] font-bold border-b-2 transition-all whitespace-nowrap mr-1
                      ${activeTab === tab.key
                        ? `${TAB_COLORS[tab.color]} bg-transparent`
                        : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400'}`}
                  >
                    {tab.label}
                    {tab.count > 0 && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full
                        ${activeTab === tab.key ? `bg-${tab.color}-100 text-${tab.color}-700 dark:bg-${tab.color}-500/20 dark:text-${tab.color}-400` : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Search row */}
              <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50/60 dark:bg-white/[0.01]">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search student, adm no, receipt, fee head…"
                    className="w-full pl-8 pr-7 py-1.5 text-[12px] rounded-lg border outline-none transition-all
                      bg-white dark:bg-[#1e2238] text-slate-700 dark:text-slate-200
                      border-slate-200 dark:border-[rgba(99,102,241,0.25)] placeholder-slate-300 dark:placeholder-slate-600
                      focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400"
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 flex-shrink-0 whitespace-nowrap">
                  {filtered.length} record{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block overflow-x-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-28 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No records match your search.</span>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                      {[
                        { label: 'S.No.', key: null },
                        { label: 'Adm No.', key: 'admNo' },
                        { label: 'Student Name', key: 'studentName' },
                        { label: 'Fee Head', key: 'feeHead' },
                        { label: 'Amount', key: 'amount' },
                        { label: 'Pay Mode', key: 'payMode' },
                        { label: 'Receipt No.', key: 'receiptNo' },
                        { label: 'Settled Date', key: 'settledDate' },
                        { label: 'Status', key: 'status' },
                      ].map(({ label, key }) => (
                        <th
                          key={label}
                          onClick={() => key && handleSort(key)}
                          className={`px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400
                            whitespace-nowrap text-left first:text-center
                            ${key ? 'cursor-pointer hover:text-blue-600 dark:hover:text-indigo-400 select-none' : ''}`}
                        >
                          {label}{key && <SortIcon k={key} />}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => <DesktopRow key={row.id} row={row} idx={i + 1} />)}
                  </tbody>
                  {/* Grand total row */}
                  <tfoot>
                    <tr className="border-t-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50/60 dark:bg-indigo-500/[0.06]">
                      <td className="px-3 py-2.5 text-[11px] text-blue-500 text-center">—</td>
                      <td colSpan={3} className="px-3 py-2.5">
                        <span className="flex items-center gap-2 text-[12px] font-bold text-blue-700 dark:text-blue-300">
                          <TrendingUp className="w-3.5 h-3.5" />
                          Grand Total — {filtered.length} transactions
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span className="text-[14px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">
                          {fmt(filtered.reduce((s, r) => s + r.amount, 0))}
                        </span>
                      </td>
                      <td colSpan={4} />
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>

            {/* ── MOBILE CARDS ── */}
            <div className="md:hidden p-4 space-y-3">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-28 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No records match.</span>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap a card to see full receipt details.
                  </p>

                  {filtered.map(row => <MobileCard key={row.id} row={row} />)}

                  {/* Mobile Total */}
                  <div className="rounded-xl border-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07] p-4">
                    <p className="text-[12px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Summary — {filtered.length} Records
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[18px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">
                          {fmt(filtered.reduce((s, r) => s + r.amount, 0))}
                        </p>
                        <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Total Amount</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[18px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">
                          {fmt(filtered.filter(r => r.status === 'Settled').reduce((s, r) => s + r.amount, 0))}
                        </p>
                        <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Settled</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Table footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]
              bg-slate-50/50 dark:bg-white/[0.01]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{records.length}</span> records
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

      {/* ── EMPTY STATE ── */}
      {!shown && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Wallet className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select session, platform &amp; date range, then click <strong>Show</strong>.
            </p>
          </div>
          {/* Mobile hint */}
          <div className="sm:hidden">
            <button type="button" onClick={() => setFilterOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold
                bg-blue-600 text-white shadow-md shadow-blue-500/20 active:scale-95">
              <SlidersHorizontal className="w-4 h-4" />
              Open Filters
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
