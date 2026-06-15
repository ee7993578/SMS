/**
 * TuckshopReport.jsx
 * Folder: src/pages/Tuckshop/TuckshopReport.jsx
 *
 * Converts legacy ASPX "Tuckshop Product Issue Report" to fully-responsive React + Tailwind.
 *
 * Columns: S.No, Account Type, Quantity, Total Price
 * Features:
 *  - Session dropdown (required)
 *  - Account Type filter (Student / Staff / Office / All)
 *  - Show report button with validation
 *  - Summary cards: total qty, total amount per account type
 *  - Grand total footer row
 *  - Mobile: stacked cards with expandable details + bottom filter drawer
 *  - Desktop: dense ERP-style table with sticky header
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye,
  AlertCircle, X, Check, Loader2, ChevronDown,
  SlidersHorizontal, Search, Info,
  ShoppingBag, Users, UserCheck, Briefcase,
  Building2, TrendingUp, BarChart3,
  ChevronRight, Receipt, CreditCard,
  PackageOpen, School2, Coffee
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────
const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const ACCOUNT_TYPES = [
  { value: '0', label: '-- Select All --' },
  { value: '1', label: 'Student' },
  { value: '3', label: 'Staff' },
  { value: '2', label: 'Office' },
]

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

// Tuckshop issue report data keyed by session
const TUCKSHOP_DATA = {
  '2022-23': [
    { User_Type: 'Student', Quantity: 1240, Total: 18600 },
    { User_Type: 'Staff',   Quantity: 320,  Total: 6400  },
    { User_Type: 'Office',  Quantity: 180,  Total: 3600  },
  ],
  '2023-24': [
    { User_Type: 'Student', Quantity: 1380, Total: 20700 },
    { User_Type: 'Staff',   Quantity: 360,  Total: 7200  },
    { User_Type: 'Office',  Quantity: 210,  Total: 4200  },
  ],
  '2024-25': [
    { User_Type: 'Student', Quantity: 1520, Total: 22800 },
    { User_Type: 'Staff',   Quantity: 400,  Total: 8000  },
    { User_Type: 'Office',  Quantity: 240,  Total: 4800  },
  ],
  '2025-26': [
    { User_Type: 'Student', Quantity: 1680, Total: 25200 },
    { User_Type: 'Staff',   Quantity: 440,  Total: 8800  },
    { User_Type: 'Office',  Quantity: 270,  Total: 5400  },
  ],
}

// ─── ACCOUNT TYPE CONFIG ──────────────────────────────────────────────────────
const TYPE_CONFIG = {
  Student: {
    icon: Users,
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-100 dark:border-blue-500/20',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300',
    dot: 'bg-blue-500',
  },
  Staff: {
    icon: UserCheck,
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-100 dark:border-emerald-500/20',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
  Office: {
    icon: Briefcase,
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-100 dark:border-amber-500/20',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
    dot: 'bg-amber-500',
  },
}

const getTypeConfig = (type) =>
  TYPE_CONFIG[type] || {
    icon: Users,
    bg: 'bg-slate-50 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-100 dark:border-slate-700',
    badge: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
    dot: 'bg-slate-400',
  }

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
          ${error
            ? 'border-rose-400 ring-2 ring-rose-100'
            : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'
          }`}
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
      <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
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
      {type === 'success'
        ? <Check className="w-4 h-4 flex-shrink-0" />
        : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// ─── SUMMARY STAT CARD ────────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, color, prefix }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
    rose:    'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">
          {prefix && <span className="text-[14px] mr-0.5">{prefix}</span>}
          {value.toLocaleString()}
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── SCHOOL HEADER BANNER ─────────────────────────────────────────────────────
function SchoolHeader({ session }) {
  return (
    <div className="rounded-2xl border border-orange-100 dark:border-[rgba(251,146,60,0.2)] bg-gradient-to-r from-orange-50 via-white to-amber-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-6 py-5 text-center shadow-sm">
      <div className="flex items-center justify-center gap-2 mb-1">
        <Coffee className="w-5 h-5 text-orange-500 dark:text-orange-400 flex-shrink-0" />
        <h2 className="text-[16px] sm:text-[18px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
          {SCHOOL_INFO.name}
        </h2>
      </div>
      <p className="text-[12px] text-slate-500 dark:text-slate-400 mb-2">{SCHOOL_INFO.address}</p>
      <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25">
        <span className="text-[12px] font-bold text-amber-700 dark:text-amber-400">Session: {session}</span>
      </div>
      <p className="mt-2 text-[13px] font-bold uppercase tracking-widest text-orange-600 dark:text-orange-400">
        Tuckshop Product Issue Report
      </p>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx, isTotal }) {
  const cfg = getTypeConfig(row.User_Type)
  const Icon = cfg.icon

  if (isTotal) {
    return (
      <tr className="bg-orange-50 dark:bg-orange-500/[0.07] border-t-2 border-orange-200 dark:border-orange-500/30">
        <td className="px-4 py-3 text-center text-[12px] text-orange-400 dark:text-orange-500">—</td>
        <td className="px-4 py-3">
          <span className="text-[13px] font-bold text-orange-700 dark:text-orange-300 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Grand Total
          </span>
        </td>
        <td className="px-4 py-3 text-right">
          <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-[13px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 tabular-nums">
            {row.Quantity.toLocaleString()}
          </span>
        </td>
        <td className="px-4 py-3 text-right">
          <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-[13px] font-bold bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300 tabular-nums">
            ₹ {row.Total.toLocaleString()}
          </span>
        </td>
      </tr>
    )
  }

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">{idx}</td>

      {/* Account Type */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${cfg.bg}`}>
            <Icon className={`w-4 h-4 ${cfg.text}`} />
          </span>
          <span className={`text-[12px] font-bold px-2.5 py-1 rounded-lg ${cfg.badge}`}>
            {row.User_Type}
          </span>
        </div>
      </td>

      {/* Quantity */}
      <td className="px-4 py-3 text-right">
        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 tabular-nums">
          {row.Quantity.toLocaleString()}
        </span>
      </td>

      {/* Total Price */}
      <td className="px-4 py-3 text-right">
        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 tabular-nums">
          ₹ {row.Total.toLocaleString()}
        </span>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row, idx }) {
  const [expanded, setExpanded] = useState(false)
  const cfg = getTypeConfig(row.User_Type)
  const Icon = cfg.icon
  const avgPrice = row.Quantity ? (row.Total / row.Quantity).toFixed(1) : 0

  return (
    <div className={`rounded-xl border ${cfg.border} bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm`}>
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Icon badge */}
        <span className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center ${cfg.bg}`}>
          <Icon className={`w-4 h-4 ${cfg.text}`} />
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight">{row.User_Type}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Qty: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{row.Quantity.toLocaleString()}</span>
            &nbsp;·&nbsp;
            Avg: <span className="text-orange-500 dark:text-orange-400 font-semibold">₹{avgPrice}</span>
          </p>
        </div>

        {/* Total badge */}
        <div className="flex flex-col items-end flex-shrink-0">
          <span className="text-[18px] font-bold text-orange-600 dark:text-orange-400 tabular-nums leading-tight">
            ₹{row.Total.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400">total</span>
        </div>

        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Quantity share bar */}
      <div className="px-4 pb-3">
        <div className={`h-1.5 rounded-full overflow-hidden ${cfg.bg}`}>
          <div className={`h-full rounded-full transition-all duration-700 ${cfg.dot}`} style={{ width: '100%' }} />
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className={`border-t ${cfg.border} px-4 pt-3 pb-4 space-y-3`}>
          <div className="grid grid-cols-2 gap-3">
            {/* Quantity */}
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-3 text-center">
              <PackageOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
              <p className="text-[24px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums leading-tight">{row.Quantity.toLocaleString()}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 mt-0.5">Quantity</p>
            </div>
            {/* Total Price */}
            <div className="rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 p-3 text-center">
              <Receipt className="w-4 h-4 text-orange-600 dark:text-orange-400 mx-auto mb-1" />
              <p className="text-[24px] font-bold text-orange-700 dark:text-orange-300 tabular-nums leading-tight">₹{row.Total.toLocaleString()}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-orange-600 dark:text-orange-400 mt-0.5">Total Price</p>
            </div>
          </div>

          {/* Avg price per item */}
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-slate-400" />
              <span className="text-[12px] text-slate-500 dark:text-slate-400 font-medium">Avg price per item</span>
            </div>
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">₹ {avgPrice}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, session, setSession, accountType, setAccountType, onShow, loading, errors }) {
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
            <SlidersHorizontal className="w-4 h-4 text-orange-500 dark:text-orange-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-5 space-y-4">
          <Field label="Session" error={errors.session} required>
            <NativeSelect
              value={session}
              onChange={e => setSession(e.target.value)}
              placeholder="-- Select Session --"
              error={errors.session}
            >
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Account Type">
            <NativeSelect value={accountType} onChange={e => setAccountType(e.target.value)}>
              {ACCOUNT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </NativeSelect>
          </Field>
        </div>
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={() => { onShow(); onClose() }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 disabled:opacity-70 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show Report
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function TuckshopReport() {
  const [session,      setSession]      = useState('')
  const [accountType,  setAccountType]  = useState('0')
  const [rows,         setRows]         = useState([])
  const [loading,      setLoading]      = useState(false)
  const [filterOpen,   setFilterOpen]   = useState(false)
  const [errors,       setErrors]       = useState({})
  const [toast,        setToast]        = useState(null)
  const [shown,        setShown]        = useState(false)
  const [shownSession, setShownSession] = useState('')
  const [shownType,    setShownType]    = useState('0')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Fetch (simulate API) ──────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!session) err.session = 'Please select a session'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)

    setTimeout(() => {
      let data = TUCKSHOP_DATA[session] || []

      // Filter by account type
      if (accountType !== '0') {
        const typeMap = { '1': 'Student', '2': 'Office', '3': 'Staff' }
        const selected = typeMap[accountType]
        data = data.filter(r => r.User_Type === selected)
      }

      setRows(data)
      setShownSession(session)
      setShownType(accountType)
      setShown(true)
      setLoading(false)

      const typeLabel = ACCOUNT_TYPES.find(t => t.value === accountType)?.label || 'All'
      showToast(`Loaded ${data.length} record${data.length !== 1 ? 's' : ''} for session ${session}.`)
    }, 650)
  }, [session, accountType])

  const handleReset = () => {
    setSession(''); setAccountType('0'); setRows([])
    setErrors({}); setShown(false); setShownSession('')
  }

  // ── Grand totals ──────────────────────────────────────────────────────────
  const totals = useMemo(() => ({
    Quantity: rows.reduce((s, r) => s + r.Quantity, 0),
    Total:    rows.reduce((s, r) => s + r.Total, 0),
  }), [rows])

  const hasResults   = shown && rows.length > 0
  const activeFilters = (session ? 1 : 0) + (accountType !== '0' ? 1 : 0)

  const shownTypeLabel = ACCOUNT_TYPES.find(t => t.value === shownType)?.label?.replace('-- ', '').replace(' --', '') || 'All'

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-orange-500 dark:text-orange-400" />
            Tuckshop Report
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Account-wise product issue report — quantity issued &amp; total amount.
          </p>
        </div>
      </div>

      {/* ── DESKTOP Filter Card ──────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-orange-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-orange-500 dark:text-orange-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {/* Session */}
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

            {/* Account Type */}
            <Field label="Account Type">
              <NativeSelect value={accountType} onChange={e => setAccountType(e.target.value)}>
                {ACCOUNT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </NativeSelect>
            </Field>

            {/* Spacer */}
            <div />

            {/* Buttons */}
            <div className="flex gap-2">
              <button type="button" onClick={handleShow} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold text-white
                  bg-orange-500 hover:bg-orange-600 shadow-md shadow-orange-500/20
                  transition-all active:scale-95 disabled:opacity-70">
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
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-orange-500 text-white shadow-md shadow-orange-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {session ? `${session}` : 'Select Filters'}
          {activeFilters > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilters}</span>
          )}
        </button>
        {hasResults && (
          <button type="button" onClick={handleReset}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        session={session}
        setSession={setSession}
        accountType={accountType}
        setAccountType={setAccountType}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ──────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* School Header */}
          <SchoolHeader session={shownSession} />

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={PackageOpen} label="Total Qty Issued"   value={totals.Quantity} color="emerald" />
            <SummaryCard icon={Receipt}     label="Total Amount"       value={totals.Total}    color="amber"   prefix="₹" />
            <SummaryCard icon={Users}       label="Account Types"      value={rows.length}     color="blue"    />
            <SummaryCard icon={CreditCard}  label="Avg Price / Item"
              value={totals.Quantity ? parseFloat((totals.Total / totals.Quantity).toFixed(1)) : 0}
              color="violet"
              prefix="₹"
            />
          </div>

          {/* Results card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-orange-500 flex-shrink-0" />
                <Coffee className="w-4 h-4 text-orange-500 dark:text-orange-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Product Issue Summary</span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">· {shownSession}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400 flex-shrink-0">
                  {shownTypeLabel}
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                  {rows.length} record{rows.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Info hint */}
            <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-orange-50/20 dark:bg-orange-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
              <p className="text-[12px] text-orange-700 dark:text-orange-400">
                Showing tuckshop product issue report — total quantity issued and total price per account type.
              </p>
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block overflow-x-auto">
              {rows.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No records found.</span>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                      {['S.No.', 'Account Type', 'Quantity', 'Total Price'].map((h, i) => (
                        <th
                          key={i}
                          className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap
                            ${i === 0 ? 'text-center w-12' : i >= 2 ? 'text-right' : 'text-left'}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <DesktopRow key={row.User_Type} row={row} idx={i + 1} />
                    ))}
                    {/* Grand Total */}
                    <DesktopRow row={{ User_Type: '', ...totals }} idx={0} isTotal />
                  </tbody>
                </table>
              )}
            </div>

            {/* ── MOBILE CARDS ── */}
            <div className="md:hidden p-4 space-y-3">
              {rows.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No records found.</span>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-orange-600 dark:text-orange-400 font-medium flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap a card to see detailed breakdown.
                  </p>

                  {rows.map((row) => (
                    <MobileCard key={row.User_Type} row={row} />
                  ))}

                  {/* Mobile Grand Total */}
                  <div className="rounded-xl border-2 border-orange-200 dark:border-orange-500/30 bg-orange-50 dark:bg-orange-500/[0.07] p-4">
                    <p className="text-[12px] font-bold uppercase tracking-wide text-orange-700 dark:text-orange-400 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Grand Total — {rows.length} Account Type{rows.length !== 1 ? 's' : ''}
                    </p>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-3 text-center">
                        <p className="text-[24px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">{totals.Quantity.toLocaleString()}</p>
                        <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">Total Quantity</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-3 text-center">
                        <p className="text-[24px] font-bold text-orange-700 dark:text-orange-300 tabular-nums">₹{totals.Total.toLocaleString()}</p>
                        <p className="text-[10px] font-semibold text-orange-600 dark:text-orange-400 mt-0.5">Total Amount</p>
                      </div>
                    </div>
                    {/* Distribution bar — visual share of each type */}
                    {rows.length > 1 && (
                      <div>
                        <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Quantity Distribution</p>
                        <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
                          {rows.map((r, i) => {
                            const pct = totals.Quantity ? (r.Quantity / totals.Quantity) * 100 : 0
                            const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500']
                            return (
                              <div
                                key={r.User_Type}
                                className={`h-full rounded-full ${colors[i % colors.length]} transition-all duration-700`}
                                style={{ width: `${pct}%` }}
                                title={`${r.User_Type}: ${pct.toFixed(1)}%`}
                              />
                            )
                          })}
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
                          {rows.map((r, i) => {
                            const pct = totals.Quantity ? Math.round((r.Quantity / totals.Quantity) * 100) : 0
                            const colors = ['text-blue-500', 'text-emerald-500', 'text-amber-500']
                            return (
                              <span key={r.User_Type} className={`text-[10px] font-semibold ${colors[i % colors.length]}`}>
                                {r.User_Type} {pct}%
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Table Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{rows.length}</span> record{rows.length !== 1 ? 's' : ''}
              </p>
              <p className="text-[12px] font-semibold text-orange-600 dark:text-orange-400 tabular-nums">
                Grand Total: ₹{totals.Total.toLocaleString()}
              </p>
            </div>
          </div>
        </>
      )}

      {/* ── Empty State ───────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
            <ShoppingBag className="w-7 h-7 text-orange-400 dark:text-orange-500 opacity-60" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a session and click <strong>Show</strong> to generate the tuckshop report.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
