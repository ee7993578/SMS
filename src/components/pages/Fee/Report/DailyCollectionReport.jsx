/**
 * DailyCollectionReport.jsx
 * Folder: src/pages/Fee/Reports/DailyCollectionReport.jsx
 *
 * Converts legacy ASPX "Daily Deposit Report" to fully-responsive React + Tailwind.
 *
 * Filters: Session, Fee Type, Pay Mode, Deposit By, Class (multi), Admission No, From Date, To Date
 * Features:
 *  - Desktop: ERP-style dense table with sticky header
 *  - Mobile: Card-based layout with expandable details
 *  - Mobile filter drawer
 *  - Search by admission number with student autocomplete
 *  - Summary stat cards
 *  - Export Excel placeholder
 *  - Loading skeleton, empty state, toast notifications
 *  - Tab-based summary breakdown on mobile
 */

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import {
  Filter, RefreshCw, Eye, AlertCircle, X, Check, Loader2,
  ChevronDown, SlidersHorizontal, Search, FileSpreadsheet,
  IndianRupee, CreditCard, Banknote, Receipt, User,
  Calendar, Building2, ChevronRight, TrendingUp, Clock,
  Hash, Phone, GraduationCap, CheckCircle2, LayoutList,
  BarChart3, Wallet, ArrowUpRight, Info, ChevronUp,
  ListFilter, Download, Printer
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const FEE_TYPES = [
  { value: '', label: 'All Fee Types' },
  { value: 'tuition', label: 'Tuition Fee' },
  { value: 'transport', label: 'Transport Fee' },
  { value: 'hostel', label: 'Hostel Fee' },
  { value: 'library', label: 'Library Fee' },
  { value: 'sports', label: 'Sports Fee' },
  { value: 'exam', label: 'Exam Fee' },
  { value: 'misc', label: 'Miscellaneous' },
]

const PAY_MODES = [
  { value: '', label: 'All Modes' },
  { value: 'cash', label: 'Cash' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'online', label: 'Online / UPI' },
  { value: 'dd', label: 'Demand Draft' },
  { value: 'neft', label: 'NEFT / RTGS' },
]

const DEPOSIT_BY_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'parent', label: 'Parent' },
  { value: 'student', label: 'Student' },
  { value: 'guardian', label: 'Guardian' },
  { value: 'staff', label: 'Staff' },
]

const CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII',
  'Class IX', 'Class X', 'Class XI', 'Class XII',
]

// Autocomplete student suggestions
const STUDENT_SUGGESTIONS = [
  { admNo: 'ADM001', name: 'Rahul Sharma',   class: 'Class X-A',    father: 'Rajesh Sharma',   phone: '9876543210' },
  { admNo: 'ADM002', name: 'Priya Singh',    class: 'Class IX-B',   father: 'Suresh Singh',    phone: '9876543211' },
  { admNo: 'ADM003', name: 'Amit Kumar',     class: 'Class VIII-A', father: 'Vijay Kumar',     phone: '9876543212' },
  { admNo: 'ADM004', name: 'Neha Gupta',     class: 'Class XI-A',   father: 'Manoj Gupta',     phone: '9876543213' },
  { admNo: 'ADM005', name: 'Rohan Verma',    class: 'Class VII-A',  father: 'Anil Verma',      phone: '9876543214' },
  { admNo: 'ADM006', name: 'Sneha Joshi',    class: 'Class XII-B',  father: 'Deepak Joshi',    phone: '9876543215' },
  { admNo: 'ADM007', name: 'Karan Patel',    class: 'Class VI-A',   father: 'Ramesh Patel',    phone: '9876543216' },
  { admNo: 'ADM008', name: 'Pooja Mishra',   class: 'Class X-B',    father: 'Sanjay Mishra',   phone: '9876543217' },
]

// Dummy collection records
const COLLECTION_DATA = {
  '2024-25': [
    { sno:1,  admNo:'ADM001', name:'Rahul Sharma',   class:'Class X',    section:'A', feeType:'Tuition Fee',   payMode:'Cash',      depositBy:'Parent',   amount:5500, receiptNo:'RCP2401', date:'01 Apr 2024', status:'Paid'    },
    { sno:2,  admNo:'ADM002', name:'Priya Singh',    class:'Class IX',   section:'B', feeType:'Tuition Fee',   payMode:'Online',    depositBy:'Parent',   amount:5500, receiptNo:'RCP2402', date:'01 Apr 2024', status:'Paid'    },
    { sno:3,  admNo:'ADM003', name:'Amit Kumar',     class:'Class VIII', section:'A', feeType:'Transport Fee', payMode:'Cash',      depositBy:'Student',  amount:1800, receiptNo:'RCP2403', date:'02 Apr 2024', status:'Paid'    },
    { sno:4,  admNo:'ADM004', name:'Neha Gupta',     class:'Class XI',   section:'A', feeType:'Tuition Fee',   payMode:'Cheque',    depositBy:'Guardian', amount:6200, receiptNo:'RCP2404', date:'02 Apr 2024', status:'Paid'    },
    { sno:5,  admNo:'ADM005', name:'Rohan Verma',    class:'Class VII',  section:'A', feeType:'Hostel Fee',    payMode:'NEFT',      depositBy:'Parent',   amount:8000, receiptNo:'RCP2405', date:'03 Apr 2024', status:'Paid'    },
    { sno:6,  admNo:'ADM006', name:'Sneha Joshi',    class:'Class XII',  section:'B', feeType:'Exam Fee',      payMode:'Online',    depositBy:'Parent',   amount:950,  receiptNo:'RCP2406', date:'03 Apr 2024', status:'Paid'    },
    { sno:7,  admNo:'ADM007', name:'Karan Patel',    class:'Class VI',   section:'A', feeType:'Library Fee',   payMode:'Cash',      depositBy:'Parent',   amount:400,  receiptNo:'RCP2407', date:'04 Apr 2024', status:'Paid'    },
    { sno:8,  admNo:'ADM008', name:'Pooja Mishra',   class:'Class X',    section:'B', feeType:'Sports Fee',    payMode:'Cash',      depositBy:'Student',  amount:600,  receiptNo:'RCP2408', date:'04 Apr 2024', status:'Paid'    },
    { sno:9,  admNo:'ADM009', name:'Dev Chauhan',    class:'Class IX',   section:'A', feeType:'Tuition Fee',   payMode:'DD',        depositBy:'Parent',   amount:5500, receiptNo:'RCP2409', date:'05 Apr 2024', status:'Paid'    },
    { sno:10, admNo:'ADM010', name:'Aarti Yadav',    class:'Class VIII', section:'A', feeType:'Tuition Fee',   payMode:'Online',    depositBy:'Parent',   amount:5500, receiptNo:'RCP2410', date:'05 Apr 2024', status:'Paid'    },
    { sno:11, admNo:'ADM011', name:'Vikas Tiwari',   class:'Class XII',  section:'A', feeType:'Tuition Fee',   payMode:'Cash',      depositBy:'Parent',   amount:6200, receiptNo:'RCP2411', date:'06 Apr 2024', status:'Paid'    },
    { sno:12, admNo:'ADM012', name:'Ritu Soni',      class:'Class XI',   section:'B', feeType:'Transport Fee', payMode:'Online',    depositBy:'Guardian', amount:1800, receiptNo:'RCP2412', date:'06 Apr 2024', status:'Paid'    },
    { sno:13, admNo:'ADM013', name:'Mohit Dubey',    class:'Class VII',  section:'A', feeType:'Miscellaneous', payMode:'Cash',      depositBy:'Parent',   amount:250,  receiptNo:'RCP2413', date:'07 Apr 2024', status:'Paid'    },
    { sno:14, admNo:'ADM014', name:'Kavita Pandey',  class:'Class VI',   section:'B', feeType:'Tuition Fee',   payMode:'Online',    depositBy:'Parent',   amount:4800, receiptNo:'RCP2414', date:'07 Apr 2024', status:'Paid'    },
    { sno:15, admNo:'ADM015', name:'Sanjay Rawat',   class:'Class X',    section:'A', feeType:'Hostel Fee',    payMode:'NEFT',      depositBy:'Parent',   amount:8000, receiptNo:'RCP2415', date:'08 Apr 2024', status:'Paid'    },
  ],
}

// ─── PAY MODE COLOR MAP ───────────────────────────────────────────────────────
const PAY_MODE_STYLE = {
  'Cash':     { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  'Online':   { bg: 'bg-blue-50 dark:bg-blue-500/10',      text: 'text-blue-700 dark:text-blue-400',       dot: 'bg-blue-500'    },
  'Cheque':   { bg: 'bg-amber-50 dark:bg-amber-500/10',    text: 'text-amber-700 dark:text-amber-400',     dot: 'bg-amber-500'   },
  'DD':       { bg: 'bg-violet-50 dark:bg-violet-500/10',  text: 'text-violet-700 dark:text-violet-400',   dot: 'bg-violet-500'  },
  'NEFT':     { bg: 'bg-cyan-50 dark:bg-cyan-500/10',      text: 'text-cyan-700 dark:text-cyan-400',       dot: 'bg-cyan-500'    },
}
const payModeStyle = (mode) => PAY_MODE_STYLE[mode] || PAY_MODE_STYLE['Cash']

const FEE_TYPE_COLORS = [
  'text-blue-600 dark:text-blue-400',
  'text-violet-600 dark:text-violet-400',
  'text-emerald-600 dark:text-emerald-400',
  'text-amber-600 dark:text-amber-400',
  'text-cyan-600 dark:text-cyan-400',
  'text-rose-600 dark:text-rose-400',
]
const feeTypeColor = (type) => FEE_TYPE_COLORS[(type?.charCodeAt(0) ?? 0) % FEE_TYPE_COLORS.length]

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const formatAmount = (n) => '₹' + n?.toLocaleString('en-IN')

// ─── PRIMITIVE COMPONENTS ────────────────────────────────────────────────────

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

function Field({ label, error, required, children, className = '' }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
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
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3
        rounded-2xl shadow-2xl text-[13px] font-semibold min-w-[260px] max-w-[90vw]
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

// ─── SUMMARY STAT CARD ────────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, sub, color }) {
  const colorMap = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
    cyan:    'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400',
    rose:    'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3.5 shadow-sm flex-1 min-w-0">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[color]}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[18px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
        {sub && <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{sub}</p>}
      </div>
    </div>
  )
}

// ─── PAY MODE BADGE ───────────────────────────────────────────────────────────
function PayModeBadge({ mode }) {
  const s = payModeStyle(mode)
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {mode}
    </span>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row }) {
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-blue-50/30 dark:hover:bg-white/[0.02] transition-colors group">
      {/* S.No */}
      <td className="px-3 py-2.5 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-10">{row.sno}</td>

      {/* Receipt No */}
      <td className="px-3 py-2.5">
        <span className="text-[12px] font-bold text-blue-600 dark:text-blue-400 tabular-nums">{row.receiptNo}</span>
      </td>

      {/* Adm No */}
      <td className="px-3 py-2.5">
        <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300 tabular-nums">{row.admNo}</span>
      </td>

      {/* Name */}
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
            {row.name.charAt(0)}
          </span>
          <div>
            <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap leading-tight">{row.name}</p>
            <p className="text-[10px] text-slate-400">{row.class} – {row.section}</p>
          </div>
        </div>
      </td>

      {/* Fee Type */}
      <td className="px-3 py-2.5">
        <span className={`text-[12px] font-semibold ${feeTypeColor(row.feeType)} whitespace-nowrap`}>{row.feeType}</span>
      </td>

      {/* Pay Mode */}
      <td className="px-3 py-2.5">
        <PayModeBadge mode={row.payMode} />
      </td>

      {/* Deposit By */}
      <td className="px-3 py-2.5 text-center">
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{row.depositBy}</span>
      </td>

      {/* Date */}
      <td className="px-3 py-2.5">
        <span className="text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">{row.date}</span>
      </td>

      {/* Amount */}
      <td className="px-3 py-2.5 text-right">
        <span className="text-[13px] font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">{formatAmount(row.amount)}</span>
      </td>
    </tr>
  )
}

// ─── DESKTOP TOTAL ROW ────────────────────────────────────────────────────────
function DesktopTotalRow({ total, count }) {
  return (
    <tr className="bg-blue-50 dark:bg-indigo-500/[0.08] border-t-2 border-blue-200 dark:border-indigo-500/30">
      <td className="px-3 py-3 text-center text-[11px] text-blue-400">—</td>
      <td className="px-3 py-3" colSpan={7}>
        <span className="flex items-center gap-2 text-[13px] font-bold text-blue-700 dark:text-blue-300">
          <TrendingUp className="w-4 h-4" /> Grand Total — {count} Records
        </span>
      </td>
      <td className="px-3 py-3 text-right">
        <span className="text-[15px] font-extrabold text-emerald-700 dark:text-emerald-300 tabular-nums">{formatAmount(total)}</span>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ─────────────────────────────────────────────────────────────
function MobileCard({ row }) {
  const [expanded, setExpanded] = useState(false)
  const s = payModeStyle(row.payMode)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header row */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Avatar */}
        <span className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 mt-0.5">
          {row.name.charAt(0)}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 truncate leading-tight">{row.name}</p>
            <span className="text-[15px] font-extrabold text-emerald-700 dark:text-emerald-400 tabular-nums flex-shrink-0">{formatAmount(row.amount)}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[11px] text-slate-400">{row.admNo}</span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className="text-[11px] text-slate-500">{row.class}-{row.section}</span>
          </div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <PayModeBadge mode={row.payMode} />
            <span className={`text-[10px] font-semibold ${feeTypeColor(row.feeType)}`}>{row.feeType}</span>
          </div>
        </div>

        <span className={`w-5 h-5 flex items-center justify-center flex-shrink-0 mt-1 text-slate-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-4 h-4" />
        </span>
      </button>

      {/* Quick info strip */}
      <div className="px-4 pb-3 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <Hash className="w-3 h-3" />
          <span className="font-semibold text-blue-600 dark:text-blue-400">{row.receiptNo}</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <Calendar className="w-3 h-3" />
          <span>{row.date}</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <User className="w-3 h-3" />
          <span>{row.depositBy}</span>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 py-4">
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Receipt No',  value: row.receiptNo,  icon: Receipt  },
              { label: 'Adm. No',     value: row.admNo,      icon: Hash     },
              { label: 'Class',       value: `${row.class}-${row.section}`, icon: GraduationCap },
              { label: 'Fee Type',    value: row.feeType,    icon: Wallet   },
              { label: 'Deposit By',  value: row.depositBy,  icon: User     },
              { label: 'Date',        value: row.date,       icon: Calendar },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 flex items-center gap-1 mb-1">
                  <Icon className="w-3 h-3" />{label}
                </p>
                <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-200">{value}</p>
              </div>
            ))}
          </div>
          {/* Amount highlight */}
          <div className="mt-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[12px] font-bold text-emerald-700 dark:text-emerald-400">Amount Paid</span>
            </div>
            <span className="text-[20px] font-extrabold text-emerald-700 dark:text-emerald-300 tabular-nums">{formatAmount(row.amount)}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── ADMISSION NO AUTOCOMPLETE ────────────────────────────────────────────────
function AdmissionSearch({ value, onChange, onSelect }) {
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleChange = (e) => {
    const val = e.target.value
    onChange(val)
    if (val.length >= 1) {
      const filtered = STUDENT_SUGGESTIONS.filter(s =>
        s.admNo.toLowerCase().includes(val.toLowerCase()) ||
        s.name.toLowerCase().includes(val.toLowerCase())
      )
      setSuggestions(filtered)
      setOpen(filtered.length > 0)
    } else {
      setSuggestions([])
      setOpen(false)
    }
  }

  const handleSelect = (student) => {
    onChange(student.admNo)
    onSelect && onSelect(student)
    setOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Admission No. or Name…"
          className="w-full pl-8 pr-7 py-2 text-[13px] rounded-lg border outline-none transition-all
            bg-white text-slate-800 border-slate-200 placeholder-slate-300
            focus:border-blue-400 focus:ring-2 focus:ring-blue-100
            dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
            dark:placeholder-slate-600 dark:focus:border-indigo-400"
        />
        {value && (
          <button onClick={() => { onChange(''); setSuggestions([]); setOpen(false) }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-[#1e2238] border border-slate-200 dark:border-[rgba(99,102,241,0.2)] rounded-xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto">
          {suggestions.map((s) => (
            <button
              key={s.admNo}
              type="button"
              onClick={() => handleSelect(s)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-500/[0.07] transition-colors text-left border-b border-slate-100 dark:border-[rgba(99,102,241,0.08)] last:border-0"
            >
              <span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
                {s.name.charAt(0)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">{s.name}</p>
                <p className="text-[11px] text-slate-400">{s.admNo} · {s.class}</p>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-[10px] text-slate-400">{s.father}</p>
                <p className="text-[10px] text-slate-400">{s.phone}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── MULTI-SELECT CLASS PICKER ─────────────────────────────────────────────────
function MultiClassSelect({ selected, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggle = (cls) => {
    onChange(selected.includes(cls) ? selected.filter(c => c !== cls) : [...selected, cls])
  }

  const label = selected.length === 0 ? 'All Classes'
    : selected.length === 1 ? selected[0]
    : `${selected.length} Classes`

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between pl-3 pr-2.5 py-2 text-[13px] rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.25)] bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400 transition-all"
      >
        <span className={selected.length ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'}>{label}</span>
        <div className="flex items-center gap-1.5">
          {selected.length > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400">{selected.length}</span>
          )}
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-[#1e2238] border border-slate-200 dark:border-[rgba(99,102,241,0.2)] rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] sticky top-0 bg-white dark:bg-[#1e2238]">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Select Classes</span>
            <button type="button" onClick={() => onChange([])} className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold hover:underline">Clear</button>
          </div>
          {CLASSES.map((cls) => (
            <label key={cls} className="flex items-center gap-3 px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-500/[0.05] cursor-pointer border-b border-slate-50 dark:border-[rgba(99,102,241,0.05)] last:border-0">
              <span className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${selected.includes(cls) ? 'bg-blue-600 border-blue-600 dark:bg-indigo-500 dark:border-indigo-500' : 'border-slate-300 dark:border-slate-600'}`}>
                {selected.includes(cls) && <Check className="w-2.5 h-2.5 text-white" />}
              </span>
              <input type="checkbox" checked={selected.includes(cls)} onChange={() => toggle(cls)} className="sr-only" />
              <span className="text-[13px] text-slate-700 dark:text-slate-300">{cls}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── DATE INPUT ───────────────────────────────────────────────────────────────
function DateInput({ value, onChange, placeholder, label }) {
  return (
    <div className="relative">
      <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
      <input
        type="date"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full pl-8 pr-3 py-2 text-[13px] rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.25)] bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200 outline-none
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400 transition-all"
      />
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({
  open, onClose, filters, setFilters, onSubmit, loading, errors
}) {
  if (!open) return null

  const set = (key) => (val) => setFilters(p => ({ ...p, [key]: val }))

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl max-h-[92vh] overflow-y-auto"
        style={{ animation: 'drawerUp .25s ease' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-white dark:bg-[#1a1f35] z-10">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] sticky top-6 bg-white dark:bg-[#1a1f35] z-10">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span className="text-[15px] font-bold text-slate-800 dark:text-slate-100">Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          <Field label="Session" error={errors.session} required>
            <NativeSelect value={filters.session} onChange={e => setFilters(p => ({ ...p, session: e.target.value }))} placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Fee Type">
              <NativeSelect value={filters.feeType} onChange={e => setFilters(p => ({ ...p, feeType: e.target.value }))}>
                {FEE_TYPES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Pay Mode">
              <NativeSelect value={filters.payMode} onChange={e => setFilters(p => ({ ...p, payMode: e.target.value }))}>
                {PAY_MODES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </NativeSelect>
            </Field>
          </div>

          <Field label="Deposit By">
            <NativeSelect value={filters.depositBy} onChange={e => setFilters(p => ({ ...p, depositBy: e.target.value }))}>
              {DEPOSIT_BY_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Select Class">
            <MultiClassSelect selected={filters.classes} onChange={set('classes')} />
          </Field>

          <Field label="Admission No.">
            <AdmissionSearch value={filters.admNo} onChange={(v) => setFilters(p => ({ ...p, admNo: v }))} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="From Date">
              <DateInput value={filters.fromDate} onChange={(v) => setFilters(p => ({ ...p, fromDate: v }))} />
            </Field>
            <Field label="To Date">
              <DateInput value={filters.toDate} onChange={(v) => setFilters(p => ({ ...p, toDate: v }))} />
            </Field>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3 sticky bottom-0 bg-white dark:bg-[#1a1f35]">
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

// ─── PAY MODE BREAKDOWN (MOBILE TAB) ─────────────────────────────────────────
function PayModeBreakdown({ rows }) {
  const breakdown = useMemo(() => {
    const map = {}
    rows.forEach(r => {
      if (!map[r.payMode]) map[r.payMode] = { count: 0, total: 0 }
      map[r.payMode].count++
      map[r.payMode].total += r.amount
    })
    return Object.entries(map).sort((a, b) => b[1].total - a[1].total)
  }, [rows])

  return (
    <div className="grid grid-cols-2 gap-2">
      {breakdown.map(([mode, { count, total }]) => {
        const s = payModeStyle(mode)
        return (
          <div key={mode} className={`rounded-xl border px-3 py-3 ${s.bg}`}>
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
              <span className={`text-[11px] font-bold ${s.text}`}>{mode}</span>
            </div>
            <p className={`text-[18px] font-extrabold tabular-nums ${s.text}`}>{formatAmount(total)}</p>
            <p className={`text-[10px] ${s.text} opacity-70`}>{count} transaction{count !== 1 ? 's' : ''}</p>
          </div>
        )
      })}
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const INIT_FILTERS = {
  session: '', feeType: '', payMode: '', depositBy: '',
  classes: [], admNo: '', fromDate: '', toDate: '',
}

export default function DailyCollectionReport() {
  const [filters,     setFilters]     = useState(INIT_FILTERS)
  const [rows,        setRows]        = useState([])
  const [loading,     setLoading]     = useState(false)
  const [exporting,   setExporting]   = useState(false)
  const [filterOpen,  setFilterOpen]  = useState(false)
  const [tableSearch, setTableSearch] = useState('')
  const [errors,      setErrors]      = useState({})
  const [toast,       setToast]       = useState(null)
  const [shown,       setShown]       = useState(false)
  const [activeTab,   setActiveTab]   = useState('records') // records | breakdown
  const [shownLabel,  setShownLabel]  = useState('')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Submit / Fetch ────────────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    const err = {}
    if (!filters.session) err.session = 'Please select a session'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setTableSearch('')

    setTimeout(() => {
      let data = COLLECTION_DATA[filters.session] || []

      // Apply filters
      if (filters.feeType)   data = data.filter(r => r.feeType.toLowerCase().includes(filters.feeType))
      if (filters.payMode)   data = data.filter(r => r.payMode.toLowerCase() === filters.payMode)
      if (filters.depositBy) data = data.filter(r => r.depositBy.toLowerCase() === filters.depositBy)
      if (filters.classes.length) data = data.filter(r => filters.classes.some(c => r.class === c))
      if (filters.admNo)     data = data.filter(r => r.admNo.toLowerCase().includes(filters.admNo.toLowerCase()) || r.name.toLowerCase().includes(filters.admNo.toLowerCase()))

      setRows(data)
      setShown(true)
      setLoading(false)

      const parts = []
      if (filters.session) parts.push(filters.session)
      if (filters.fromDate) parts.push(`From ${filters.fromDate}`)
      if (filters.toDate) parts.push(`To ${filters.toDate}`)
      setShownLabel(parts.join(' · '))

      showToast(`${data.length} records loaded.`)
    }, 700)
  }, [filters])

  const handleReset = () => {
    setFilters(INIT_FILTERS)
    setRows([])
    setTableSearch('')
    setErrors({})
    setShown(false)
    setShownLabel('')
  }

  const handleExcel = () => {
    if (!rows.length) { showToast('No data to export. Show report first.', 'error'); return }
    setExporting(true)
    setTimeout(() => {
      setExporting(false)
      showToast('Excel export ready! (API integration pending)')
    }, 1200)
  }

  // ── Table search filter ───────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!tableSearch) return rows
    const q = tableSearch.toLowerCase()
    return rows.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.admNo.toLowerCase().includes(q) ||
      r.receiptNo.toLowerCase().includes(q) ||
      r.class.toLowerCase().includes(q) ||
      r.feeType.toLowerCase().includes(q)
    )
  }, [rows, tableSearch])

  // ── Totals ────────────────────────────────────────────────────────────────
  const grandTotal = useMemo(() => filtered.reduce((s, r) => s + r.amount, 0), [filtered])
  const cashTotal  = useMemo(() => filtered.filter(r => r.payMode === 'Cash').reduce((s, r) => s + r.amount, 0), [filtered])
  const onlineTotal= useMemo(() => filtered.filter(r => r.payMode === 'Online').reduce((s, r) => s + r.amount, 0), [filtered])

  const hasResults   = shown && rows.length > 0
  const activeFiltersCount = [
    filters.session, filters.feeType, filters.payMode,
    filters.depositBy, filters.admNo, filters.fromDate, filters.toDate
  ].filter(Boolean).length + (filters.classes.length > 0 ? 1 : 0)

  return (
    <div className="space-y-4 pb-14">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 dark:bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <IndianRupee className="w-4 h-4 text-white" />
            </div>
            Daily Collection Report
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5 ml-10">
            Fee-wise daily deposit summary — session, class &amp; mode breakdown.
          </p>
        </div>

        {hasResults && (
          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
            <button type="button" onClick={() => {}} title="Print"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-semibold border border-slate-200 dark:border-[rgba(99,102,241,0.2)] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors">
              <Printer className="w-4 h-4" />
            </button>
            <button type="button" onClick={handleExcel} disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
                bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20
                transition-all active:scale-95 disabled:opacity-70">
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
              Export Excel
            </button>
          </div>
        )}
      </div>

      {/* ── DESKTOP Filter Card ──────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <ListFilter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
          {activeFiltersCount > 0 && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400">
              {activeFiltersCount} active
            </span>
          )}
        </div>

        <div className="p-5">
          {/* Row 1 */}
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4 mb-4">
            <Field label="Session" error={errors.session} required>
              <NativeSelect
                value={filters.session}
                onChange={e => { setFilters(p => ({ ...p, session: e.target.value })); setErrors(p => ({ ...p, session: undefined })) }}
                placeholder="-- Select Session --"
                error={errors.session}
              >
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Fee Type">
              <NativeSelect value={filters.feeType} onChange={e => setFilters(p => ({ ...p, feeType: e.target.value }))}>
                {FEE_TYPES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Pay Mode">
              <NativeSelect value={filters.payMode} onChange={e => setFilters(p => ({ ...p, payMode: e.target.value }))}>
                {PAY_MODES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Deposit By">
              <NativeSelect value={filters.depositBy} onChange={e => setFilters(p => ({ ...p, depositBy: e.target.value }))}>
                {DEPOSIT_BY_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Select Class">
              <MultiClassSelect selected={filters.classes} onChange={(v) => setFilters(p => ({ ...p, classes: v }))} />
            </Field>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4 items-end">
            <Field label="Admission No.">
              <AdmissionSearch
                value={filters.admNo}
                onChange={(v) => setFilters(p => ({ ...p, admNo: v }))}
              />
            </Field>

            <Field label="From Date">
              <DateInput value={filters.fromDate} onChange={(v) => setFilters(p => ({ ...p, fromDate: v }))} />
            </Field>

            <Field label="To Date">
              <DateInput value={filters.toDate} onChange={(v) => setFilters(p => ({ ...p, toDate: v }))} />
            </Field>

            {/* Spacer */}
            <div className="hidden xl:block" />

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button type="button" onClick={handleSubmit} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold text-white
                  bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
                  transition-all active:scale-95 disabled:opacity-70">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                Show
              </button>
              <button type="button" onClick={handleReset} title="Reset filters"
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
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {filters.session ? `Session: ${filters.session}` : 'Set Filters'}
          {activeFiltersCount > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFiltersCount}</span>
          )}
        </button>
        {hasResults && (
          <>
            <button type="button" onClick={handleExcel} disabled={exporting} title="Export"
              className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-[13px] font-semibold
                bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm disabled:opacity-70">
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            </button>
            <button type="button" onClick={handleReset} title="Reset"
              className="px-3.5 py-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
              <RefreshCw className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
        onSubmit={handleSubmit}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ─────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-5 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={IndianRupee} label="Total Collection"  value={formatAmount(grandTotal)}    color="blue"    />
            <SummaryCard icon={Receipt}     label="Transactions"       value={filtered.length}              color="violet"  />
            <SummaryCard icon={Banknote}    label="Cash Collection"   value={formatAmount(cashTotal)}      color="emerald" />
            <SummaryCard icon={CreditCard}  label="Online / Digital"  value={formatAmount(onlineTotal)}    color="cyan"    />
          </div>

          {/* Results Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <Receipt className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Collection Records</span>
                {shownLabel && <span className="text-[12px] text-slate-400">· {shownLabel}</span>}
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 flex-shrink-0">
                  {filtered.length} records
                </span>
              </div>

              {/* Table Search */}
              <div className="relative w-full sm:w-52 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={tableSearch}
                  onChange={e => setTableSearch(e.target.value)}
                  placeholder="Search name, adm, receipt…"
                  className="w-full pl-8 pr-7 py-1.5 text-[12px] rounded-lg border outline-none transition-all
                    bg-white text-slate-700 border-slate-200 placeholder-slate-300
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                    dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                    dark:placeholder-slate-600"
                />
                {tableSearch && (
                  <button onClick={() => setTableSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Info Strip (desktop) */}
            <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <p className="text-[12px] text-blue-700 dark:text-blue-400">
                Showing fee-wise daily collection. Total: <strong>{formatAmount(grandTotal)}</strong> across {filtered.length} transactions.
              </p>
            </div>

            {/* ── MOBILE TABS ── */}
            <div className="sm:hidden">
              <div className="flex border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
                {[
                  { id: 'records',   label: 'Records',   icon: LayoutList },
                  { id: 'breakdown', label: 'By Mode',   icon: BarChart3  },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[13px] font-semibold border-b-2 transition-colors
                      ${activeTab === id
                        ? 'border-blue-600 text-blue-600 dark:border-indigo-400 dark:text-indigo-400'
                        : 'border-transparent text-slate-400 dark:text-slate-500'}`}
                  >
                    <Icon className="w-4 h-4" />{label}
                  </button>
                ))}
              </div>

              <div className="p-4">
                {activeTab === 'records' && (
                  <div className="space-y-3">
                    {filtered.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400">
                        <Search className="w-6 h-6 opacity-40" />
                        <span className="text-[13px]">No records match your search.</span>
                      </div>
                    ) : (
                      <>
                        <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5 flex-shrink-0" />
                          Tap any card to see full details.
                        </p>
                        {filtered.map(row => <MobileCard key={row.receiptNo} row={row} />)}

                        {/* Mobile Grand Total */}
                        <div className="rounded-xl border-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07] p-4">
                          <div className="flex items-center justify-between">
                            <p className="text-[12px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 flex items-center gap-2">
                              <TrendingUp className="w-4 h-4" /> Grand Total
                            </p>
                            <p className="text-[22px] font-extrabold text-emerald-700 dark:text-emerald-300 tabular-nums">{formatAmount(grandTotal)}</p>
                          </div>
                          <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-1">{filtered.length} transactions</p>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {activeTab === 'breakdown' && (
                  <div className="space-y-4">
                    <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">Collection by Payment Mode</p>
                    <PayModeBreakdown rows={filtered} />
                    <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-4 flex items-center justify-between">
                      <span className="text-[13px] font-bold text-emerald-700 dark:text-emerald-400">Total Collection</span>
                      <span className="text-[22px] font-extrabold text-emerald-700 dark:text-emerald-300 tabular-nums">{formatAmount(grandTotal)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden sm:block overflow-x-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No records match your search.</span>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/80 dark:bg-white/[0.03]">
                      {[
                        'S.No.', 'Receipt No.', 'Adm. No.', 'Student Name',
                        'Fee Type', 'Pay Mode', 'Deposit By', 'Date', 'Amount'
                      ].map((h, i) => (
                        <th key={i}
                          className={`px-3 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap
                            ${i === 8 ? 'text-right' : 'text-left'} ${i === 6 ? 'text-center' : ''}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(row => <DesktopRow key={row.receiptNo} row={row} />)}
                    <DesktopTotalRow total={grandTotal} count={filtered.length} />
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{rows.length}</span> records
                {filtered.length > 0 && (
                  <span className="ml-2">· Total: <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatAmount(grandTotal)}</span></span>
                )}
              </p>
              {tableSearch && (
                <button onClick={() => setTableSearch('')}
                  className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                  <X className="w-3 h-3" /> Clear search
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Empty State ──────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-500/[0.07] border border-blue-100 dark:border-blue-500/20 flex items-center justify-center">
            <IndianRupee className="w-8 h-8 text-blue-400 dark:text-blue-500" />
          </div>
          <div className="text-center max-w-xs">
            <p className="text-[15px] font-bold text-slate-600 dark:text-slate-400">No report generated yet</p>
            <p className="text-[13px] text-slate-400 dark:text-slate-500 mt-1">
              Select a session, apply filters, and tap <strong>Show</strong> to generate the daily collection report.
            </p>
          </div>

          {/* Quick tips */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-md">
            {[
              { icon: Calendar, text: 'Filter by date range for precise results' },
              { icon: CreditCard, text: 'Breakdown by payment mode available' },
              { icon: FileSpreadsheet, text: 'Export to Excel when done' },
            ].map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-[rgba(99,102,241,0.08)] px-3 py-3">
                <Icon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
