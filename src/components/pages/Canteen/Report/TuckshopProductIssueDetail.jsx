/**
 * TuckshopProductIssueDetail.jsx
 * Folder: src/pages/Tuckshop/TuckshopProductIssueDetail.jsx
 *
 * Converts legacy ASPX "Tuckshop Account Details" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Session dropdown filter
 *  - User Type filter (Student / Staff / Office / All)
 *  - Admission No autocomplete search
 *  - Show + Export to Excel buttons
 *  - Desktop: dense ERP-style data table with sticky header
 *  - Mobile: collapsible cards with expandable details
 *  - Loading skeleton, empty states, toast notifications
 *  - Mobile filter drawer
 */

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import {
  Filter, RefreshCw, Eye, AlertCircle, X, Check, Loader2,
  ChevronDown, ChevronRight, FileSpreadsheet, Search,
  ShoppingCart, SlidersHorizontal, Info, User, Users,
  Receipt, CreditCard, Package, Calendar, Hash,
  BookOpen, TrendingUp, BarChart3, Building2, MapPin
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const USER_TYPES = [
  { value: '0',  label: '--Select All--' },
  { value: 'S',  label: 'Student' },
  { value: 'ST', label: 'Staff' },
  { value: 'F',  label: 'Office' },
]

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

// Admission number autocomplete suggestions
const ADM_SUGGESTIONS = {
  S: [
    'S001 - Rahul Sharma',
    'S002 - Priya Singh',
    'S003 - Amit Kumar',
    'S004 - Neha Gupta',
    'S005 - Rohit Verma',
    'S006 - Anjali Mishra',
    'S007 - Vikram Yadav',
    'S008 - Pooja Patel',
    'S009 - Suresh Negi',
    'S010 - Kavita Joshi',
  ],
  ST: [
    'ST001 - Ramesh Tiwari',
    'ST002 - Suman Devi',
    'ST003 - Prakash Rawat',
    'ST004 - Geeta Bisht',
    'ST005 - Mohan Chauhan',
  ],
  F: [
    'F001 - Dinesh Thakur',
    'F002 - Rekha Pandey',
    'F003 - Ajay Dobhal',
    'F004 - Meera Nautiyal',
  ],
  '0': [
    'S001 - Rahul Sharma',
    'S002 - Priya Singh',
    'ST001 - Ramesh Tiwari',
    'F001 - Dinesh Thakur',
    'S003 - Amit Kumar',
    'ST002 - Suman Devi',
    'F002 - Rekha Pandey',
  ],
}

// Tuckshop transaction data per user
const TUCKSHOP_DATA = {
  'S001 - Rahul Sharma': [
    { sno: 1, date: '01-Apr-2025', product: 'Sandwich',       qty: 2, rate: 25,  amount: 50,  balance: 200 },
    { sno: 2, date: '03-Apr-2025', product: 'Cold Drink',     qty: 1, rate: 30,  amount: 30,  balance: 170 },
    { sno: 3, date: '05-Apr-2025', product: 'Samosa',         qty: 3, rate: 10,  amount: 30,  balance: 140 },
    { sno: 4, date: '08-Apr-2025', product: 'Juice',          qty: 1, rate: 20,  amount: 20,  balance: 120 },
    { sno: 5, date: '10-Apr-2025', product: 'Burger',         qty: 1, rate: 50,  amount: 50,  balance: 70  },
    { sno: 6, date: '12-Apr-2025', product: 'Chips',          qty: 2, rate: 15,  amount: 30,  balance: 40  },
    { sno: 7, date: '15-Apr-2025', product: 'Biscuit Pack',   qty: 1, rate: 10,  amount: 10,  balance: 30  },
    { sno: 8, date: '18-Apr-2025', product: 'Noodles',        qty: 1, rate: 30,  amount: 30,  balance: 0   },
  ],
  'S002 - Priya Singh': [
    { sno: 1, date: '02-Apr-2025', product: 'Juice',          qty: 2, rate: 20,  amount: 40,  balance: 160 },
    { sno: 2, date: '05-Apr-2025', product: 'Sandwich',       qty: 1, rate: 25,  amount: 25,  balance: 135 },
    { sno: 3, date: '09-Apr-2025', product: 'Cold Drink',     qty: 2, rate: 30,  amount: 60,  balance: 75  },
    { sno: 4, date: '14-Apr-2025', product: 'Samosa',         qty: 5, rate: 10,  amount: 50,  balance: 25  },
    { sno: 5, date: '17-Apr-2025', product: 'Biscuit Pack',   qty: 2, rate: 10,  amount: 20,  balance: 5   },
  ],
  'ST001 - Ramesh Tiwari': [
    { sno: 1, date: '01-Apr-2025', product: 'Tea',            qty: 10, rate: 5,  amount: 50,  balance: 450 },
    { sno: 2, date: '07-Apr-2025', product: 'Snacks',         qty: 5,  rate: 20, amount: 100, balance: 350 },
    { sno: 3, date: '14-Apr-2025', product: 'Cold Drink',     qty: 3,  rate: 30, amount: 90,  balance: 260 },
    { sno: 4, date: '20-Apr-2025', product: 'Sandwich',       qty: 4,  rate: 25, amount: 100, balance: 160 },
  ],
  'F001 - Dinesh Thakur': [
    { sno: 1, date: '02-Apr-2025', product: 'Tea',            qty: 15, rate: 5,  amount: 75,  balance: 425 },
    { sno: 2, date: '10-Apr-2025', product: 'Lunch Plate',    qty: 5,  rate: 60, amount: 300, balance: 125 },
    { sno: 3, date: '18-Apr-2025', product: 'Cold Drink',     qty: 4,  rate: 30, amount: 120, balance: 5   },
  ],
}

// Fallback for unknown users
const DEFAULT_DATA = [
  { sno: 1, date: '01-Apr-2025', product: 'Sandwich',  qty: 1, rate: 25, amount: 25,  balance: 75 },
  { sno: 2, date: '05-Apr-2025', product: 'Cold Drink', qty: 1, rate: 30, amount: 30, balance: 45 },
  { sno: 3, date: '10-Apr-2025', product: 'Samosa',    qty: 3, rate: 10, amount: 30,  balance: 15 },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const PRODUCT_ICONS = {
  'Sandwich': '🥪', 'Cold Drink': '🥤', 'Samosa': '🫓', 'Juice': '🧃',
  'Burger': '🍔', 'Chips': '🍟', 'Biscuit Pack': '🍪', 'Noodles': '🍜',
  'Tea': '☕', 'Snacks': '🍿', 'Lunch Plate': '🍱',
}
const getProductIcon = (name) => PRODUCT_ICONS[name] || '🛒'

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

// ─── AUTOCOMPLETE INPUT ───────────────────────────────────────────────────────

function AutoCompleteInput({ value, onChange, suggestions, placeholder, error, disabled }) {
  const [open, setOpen] = useState(false)
  const [filtered, setFiltered] = useState([])
  const wrapRef = useRef(null)

  useEffect(() => {
    if (value.length >= 1) {
      const q = value.toLowerCase()
      setFiltered(suggestions.filter(s => s.toLowerCase().includes(q)).slice(0, 8))
      setOpen(true)
    } else {
      setFiltered([])
      setOpen(false)
    }
  }, [value, suggestions])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full pl-8 pr-7 py-2 text-[13px] rounded-lg border outline-none transition-all
            bg-white text-slate-800 placeholder-slate-300
            focus:border-blue-400 focus:ring-2 focus:ring-blue-100
            dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600
            dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
        />
        {value && (
          <button
            type="button"
            onClick={() => { onChange(''); setOpen(false) }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown suggestions */}
      {open && filtered.length > 0 && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white dark:bg-[#1e2238] border border-slate-200 dark:border-[rgba(99,102,241,0.25)] rounded-xl shadow-xl overflow-hidden max-h-52 overflow-y-auto">
          {filtered.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { onChange(s); setOpen(false) }}
              className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-left hover:bg-blue-50 dark:hover:bg-indigo-500/10 transition-colors border-b last:border-b-0 border-slate-50 dark:border-[rgba(99,102,241,0.07)]"
            >
              <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="text-slate-700 dark:text-slate-200">{s}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── SUMMARY STAT CARD ────────────────────────────────────────────────────────

function SummaryCard({ icon: Icon, label, value, color, prefix = '' }) {
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
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── SCHOOL HEADER ────────────────────────────────────────────────────────────

function SchoolHeader({ session, admNo, userType }) {
  const userLabel = USER_TYPES.find(u => u.value === userType)?.label || 'All'
  return (
    <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-6 py-5 text-center shadow-sm">
      <div className="flex items-center justify-center gap-2 mb-1">
        <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <h2 className="text-[16px] sm:text-[18px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
          {SCHOOL_INFO.name}
        </h2>
      </div>
      <div className="flex items-center justify-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400 mb-2">
        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
        <span>{SCHOOL_INFO.address}</span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25">
          <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span className="text-[12px] font-bold text-amber-700 dark:text-amber-400">Session: {session}</span>
        </div>
        {admNo && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/25">
            <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="text-[12px] font-bold text-blue-700 dark:text-blue-400">{admNo}</span>
          </div>
        )}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-500/15 border border-violet-200 dark:border-violet-500/25">
          <Users className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
          <span className="text-[12px] font-bold text-violet-700 dark:text-violet-400">{userLabel}</span>
        </div>
      </div>
      <p className="mt-2 text-[13px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400">
        Tuckshop Account Details
      </p>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────

function DesktopRow({ row, isTotal }) {
  if (isTotal) {
    return (
      <tr className="bg-blue-50 dark:bg-indigo-500/[0.07] border-t-2 border-blue-200 dark:border-indigo-500/30">
        <td className="px-4 py-3 text-center text-[12px] text-blue-500">—</td>
        <td className="px-4 py-3" colSpan={2}>
          <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Grand Total
          </span>
        </td>
        <td className="px-4 py-3 text-center">
          <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-[13px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 tabular-nums">{row.qty}</span>
        </td>
        <td className="px-4 py-3 text-center">—</td>
        <td className="px-4 py-3 text-center">
          <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-[13px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 tabular-nums">₹{row.amount}</span>
        </td>
        <td className="px-4 py-3 text-center">—</td>
      </tr>
    )
  }

  const balColor = row.balance === 0
    ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
    : row.balance < 50
    ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 tabular-nums w-12">{row.sno}</td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="flex items-center gap-1.5 text-[13px] text-slate-600 dark:text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          {row.date}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-[18px]">{getProductIcon(row.product)}</span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{row.product}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[13px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 tabular-nums">{row.qty}</span>
      </td>
      <td className="px-4 py-3 text-center">
        <span className="text-[13px] font-semibold text-slate-600 dark:text-slate-300 tabular-nums">₹{row.rate}</span>
      </td>
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[13px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 tabular-nums">₹{row.amount}</span>
      </td>
      <td className="px-4 py-3 text-center">
        <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[12px] font-bold tabular-nums ${balColor}`}>₹{row.balance}</span>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────

function MobileCard({ row }) {
  const [expanded, setExpanded] = useState(false)
  const balColor = row.balance === 0
    ? 'text-rose-600 dark:text-rose-400'
    : row.balance < 50
    ? 'text-amber-600 dark:text-amber-400'
    : 'text-emerald-600 dark:text-emerald-400'

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        <span className="text-[26px] flex-shrink-0">{getProductIcon(row.product)}</span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight">{row.product}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
            <Calendar className="w-3 h-3" />{row.date}
          </p>
        </div>
        <div className="flex flex-col items-end flex-shrink-0">
          <span className="text-[16px] font-bold text-blue-700 dark:text-blue-400 tabular-nums">₹{row.amount}</span>
          <span className={`text-[11px] font-semibold tabular-nums ${balColor}`}>Bal: ₹{row.balance}</span>
        </div>
        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 p-3 text-center">
              <Package className="w-4 h-4 text-amber-600 dark:text-amber-400 mx-auto mb-1" />
              <p className="text-[22px] font-bold text-amber-700 dark:text-amber-300 tabular-nums leading-tight">{row.qty}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400 mt-0.5">Qty</p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 p-3 text-center">
              <Hash className="w-4 h-4 text-slate-500 dark:text-slate-400 mx-auto mb-1" />
              <p className="text-[22px] font-bold text-slate-700 dark:text-slate-200 tabular-nums leading-tight">₹{row.rate}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mt-0.5">Rate</p>
            </div>
            <div className="rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-3 text-center">
              <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
              <p className="text-[22px] font-bold text-blue-700 dark:text-blue-300 tabular-nums leading-tight">₹{row.amount}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400 mt-0.5">Amount</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
            <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">Remaining Balance</span>
            <span className={`text-[15px] font-bold tabular-nums ${balColor}`}>₹{row.balance}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────

function FilterDrawer({
  open, onClose,
  session, setSession,
  userType, setUserType,
  admNo, setAdmNo,
  onShow, loading, errors,
  suggestions,
}) {
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
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Search Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          <Field label="Session" error={errors.session} required>
            <NativeSelect value={session} onChange={e => setSession(e.target.value)} placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>

          <Field label="User Type">
            <NativeSelect value={userType} onChange={e => setUserType(e.target.value)}>
              {USER_TYPES.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Admission / Employee No">
            <AutoCompleteInput
              value={admNo}
              onChange={setAdmNo}
              suggestions={suggestions}
              placeholder="Type to search…"
              error={errors.admNo}
            />
          </Field>
        </div>

        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={() => { onShow(); onClose() }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-70 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show Report
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function TuckshopProductIssueDetail() {
  const [session,       setSession]       = useState('')
  const [userType,      setUserType]      = useState('0')
  const [admNo,         setAdmNo]         = useState('')
  const [rows,          setRows]          = useState([])
  const [loading,       setLoading]       = useState(false)
  const [exporting,     setExporting]     = useState(false)
  const [filterOpen,    setFilterOpen]    = useState(false)
  const [search,        setSearch]        = useState('')
  const [errors,        setErrors]        = useState({})
  const [toast,         setToast]         = useState(null)
  const [shown,         setShown]         = useState(false)
  const [shownMeta,     setShownMeta]     = useState({ session: '', admNo: '', userType: '0' })

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Autocomplete suggestions based on selected user type
  const suggestions = useMemo(() => ADM_SUGGESTIONS[userType] || ADM_SUGGESTIONS['0'], [userType])

  // ── Validate ───────────────────────────────────────────────────────────────
  const validate = () => {
    const err = {}
    if (!session) err.session = 'Please select a session'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  // ── Show report ────────────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    if (!validate()) return
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      // Find data by admNo or return default set
      let data = []
      if (admNo) {
        data = TUCKSHOP_DATA[admNo] || DEFAULT_DATA
      } else {
        // No specific user: flatten all data for selected user type
        const keys = Object.keys(TUCKSHOP_DATA)
        const filteredKeys = userType === '0'
          ? keys
          : keys.filter(k => k.startsWith(userType === 'S' ? 'S0' : userType === 'ST' ? 'ST' : 'F'))
        let sno = 1
        data = filteredKeys.flatMap(k =>
          (TUCKSHOP_DATA[k] || []).map(r => ({ ...r, sno: sno++, user: k }))
        )
      }

      setRows(data)
      setShownMeta({ session, admNo, userType })
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} transaction${data.length !== 1 ? 's' : ''}.`)
    }, 700)
  }, [session, userType, admNo])

  const handleReset = () => {
    setSession(''); setUserType('0'); setAdmNo('')
    setRows([]); setSearch(''); setErrors({})
    setShown(false); setShownMeta({ session: '', admNo: '', userType: '0' })
  }

  // ── Excel export placeholder ───────────────────────────────────────────────
  const handleExcel = () => {
    if (rows.length === 0) { showToast('No data to export. Show report first.', 'error'); return }
    setExporting(true)
    setTimeout(() => {
      setExporting(false)
      showToast('Excel export ready! (API integration pending)')
    }, 1200)
  }

  // ── Search filter ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      r.product?.toLowerCase().includes(q) ||
      r.date?.toLowerCase().includes(q) ||
      r.user?.toLowerCase().includes(q)
    )
  }, [rows, search])

  // ── Totals ─────────────────────────────────────────────────────────────────
  const totals = useMemo(() => ({
    qty:    filtered.reduce((s, r) => s + r.qty, 0),
    amount: filtered.reduce((s, r) => s + r.amount, 0),
    txns:   filtered.length,
    avgTxn: filtered.length ? Math.round(filtered.reduce((s, r) => s + r.amount, 0) / filtered.length) : 0,
  }), [filtered])

  const hasResults   = shown && rows.length > 0
  const activeFilters = [session, admNo !== ''].filter(Boolean).length

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Tuckshop Account Details
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            View product-wise issue detail and account balance for students &amp; staff.
          </p>
        </div>

        {/* Desktop Excel export */}
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

      {/* ── DESKTOP Filter Card ─────────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
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

            {/* User Type */}
            <Field label="User Type">
              <NativeSelect value={userType} onChange={e => { setUserType(e.target.value); setAdmNo('') }}>
                {USER_TYPES.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
              </NativeSelect>
            </Field>

            {/* Adm No */}
            <Field label="Adm / Employee No">
              <AutoCompleteInput
                value={admNo}
                onChange={setAdmNo}
                suggestions={suggestions}
                placeholder="Type to search…"
                error={errors.admNo}
              />
            </Field>

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleShow}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold text-white
                  bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
                  transition-all active:scale-95 disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                Show
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center justify-center px-3 py-2 rounded-xl text-[13px] font-semibold
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ──────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {session ? `Session: ${session}` : 'Set Filters'}
          {activeFilters > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilters}</span>
          )}
        </button>
        {hasResults && (
          <button type="button" onClick={handleExcel} disabled={exporting}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm disabled:opacity-70">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
          </button>
        )}
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
        session={session} setSession={setSession}
        userType={userType} setUserType={setUserType}
        admNo={admNo} setAdmNo={setAdmNo}
        onShow={handleShow}
        loading={loading}
        errors={errors}
        suggestions={suggestions}
      />

      {/* ── Loading Skeleton ───────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      )}

      {/* ── Results ────────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* School Header */}
          <SchoolHeader session={shownMeta.session} admNo={shownMeta.admNo} userType={shownMeta.userType} />

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={Receipt}       label="Total Transactions"  value={totals.txns}   color="blue"    />
            <SummaryCard icon={CreditCard}    label="Total Amount"        value={totals.amount} color="emerald" prefix="₹" />
            <SummaryCard icon={Package}       label="Total Qty Issued"    value={totals.qty}    color="amber"   />
            <SummaryCard icon={TrendingUp}    label="Avg per Transaction" value={totals.avgTxn} color="violet"  prefix="₹" />
          </div>

          {/* Results Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Transaction Detail</span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">· {shownMeta.session}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                  {filtered.length} record{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-52 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search product or date…"
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
            <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <p className="text-[12px] text-blue-700 dark:text-blue-400">
                Balance shows remaining tuckshop credit. Low balance shown in amber, zero balance in red.
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
                      {['S.No.', 'Date', 'Product', 'Qty', 'Rate', 'Amount', 'Balance'].map((h, i) => (
                        <th key={i} className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-12">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <DesktopRow key={i} row={row} />
                    ))}
                    {/* Grand Total */}
                    <DesktopRow row={totals} isTotal />
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
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap a card to see rate &amp; balance detail.
                  </p>

                  {filtered.map((row, i) => (
                    <MobileCard key={i} row={row} />
                  ))}

                  {/* Mobile Grand Total */}
                  <div className="rounded-xl border-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07] p-4">
                    <p className="text-[12px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Summary — {filtered.length} Transactions
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">₹{totals.amount}</p>
                        <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Total Amount</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-amber-700 dark:text-amber-300 tabular-nums">{totals.qty}</p>
                        <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">Total Qty</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-violet-700 dark:text-violet-300 tabular-nums">₹{totals.avgTxn}</p>
                        <p className="text-[10px] font-semibold text-violet-600 dark:text-violet-400">Avg / Txn</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">{totals.txns}</p>
                        <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Transactions</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Table Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
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

      {/* ── Empty State ──────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <ShoppingCart className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No data yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a session and click <strong>Show</strong> to view tuckshop account details.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
