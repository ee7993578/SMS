/**
 * MonthwiseTransportReport.jsx
 * Folder: src/pages/Transport/Reports/MonthwiseTransportReport.jsx
 *
 * Converts legacy ASPX "Month Wise Transport Report" to fully-responsive React + Tailwind.
 *
 * Filters: Session, Class (multi-select), Month, Route, Received Amount, Student Status
 * Columns: S.No, Student Name, Class, Section, Route, Stop, Transport Fee, Month, Status
 * Features:
 *  - Multi-select class dropdown (custom pill-based)
 *  - All filter dropdowns
 *  - Show report button + Excel export
 *  - School name / session / month header in report
 *  - Grand total footer row
 *  - Mobile: collapsible cards with expandable details
 *  - Desktop: dense ERP-style table
 *  - Dark / Light theme via Tailwind dark: variants
 */

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import {
  Filter, RefreshCw, Eye,
  AlertCircle, X, Check, Loader2, ChevronDown,
  Bus, MapPin, Building2, TrendingUp,
  SlidersHorizontal, Info, Search,
  FileSpreadsheet, BookOpen, ChevronRight,
  User, Route, Calendar, BadgeCheck, CircleDot,
  Banknote, Clock, CheckCircle2, XCircle,
} from 'lucide-react'

// ─── STATIC DATA ──────────────────────────────────────────────────────────────
const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII',
  'Class IX', 'Class X', 'Class XI', 'Class XII',
]

const MONTHS = [
  { value: '1',  label: 'January' },
  { value: '2',  label: 'February' },
  { value: '3',  label: 'March' },
  { value: '4',  label: 'April' },
  { value: '5',  label: 'May' },
  { value: '6',  label: 'June' },
  { value: '7',  label: 'July' },
  { value: '8',  label: 'August' },
  { value: '9',  label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
]

const ROUTES = [
  { value: '',  label: 'All Routes' },
  { value: '1', label: 'Route A – Civil Lines' },
  { value: '2', label: 'Route B – Rajpur Road' },
  { value: '3', label: 'Route C – Ballupur' },
  { value: '4', label: 'Route D – Saharanpur Road' },
  { value: '5', label: 'Route E – Haridwar Road' },
]

const RECEIVE_OPTIONS = [
  { value: '0', label: 'Without Received Amount' },
  { value: '1', label: 'With Received Amount' },
]

const STUDENT_STATUS_OPTIONS = [
  { value: '0',          label: 'All' },
  { value: 'Registered', label: 'Registered' },
  { value: 'Withdrawn',  label: 'Withdrawn' },
]

const SCHOOL_INFO = {
  name:    'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

// ─── DUMMY TRANSPORT DATA ─────────────────────────────────────────────────────
const generateRows = () => {
  const routes = [
    { route: 'Route A – Civil Lines',      stops: ['Stop 1 – Parade Ground', 'Stop 2 – Clock Tower'] },
    { route: 'Route B – Rajpur Road',      stops: ['Stop 1 – Rajpur Chowk', 'Stop 2 – GMS Road'] },
    { route: 'Route C – Ballupur',         stops: ['Stop 1 – Ballupur Chowk', 'Stop 2 – EC Road'] },
    { route: 'Route D – Saharanpur Road',  stops: ['Stop 1 – Nehru Colony', 'Stop 2 – Lakhi Bagh'] },
    { route: 'Route E – Haridwar Road',    stops: ['Stop 1 – Niranjanpur', 'Stop 2 – Majra'] },
  ]
  const names = [
    'Aarav Sharma','Priya Singh','Rahul Verma','Sneha Gupta','Amit Patel',
    'Kavya Joshi','Rohit Kumar','Ananya Mishra','Vikram Rao','Pooja Nair',
    'Arjun Tiwari','Riya Kapoor','Suresh Pandey','Meera Dubey','Karan Malhotra',
    'Nisha Reddy','Deepak Srivastava','Tanvi Yadav','Manish Bajaj','Simran Kaur',
    'Aditya Chauhan','Divya Saxena','Nikhil Aggarwal','Kritika Bose','Sameer Qureshi',
    'Anjali Choudhary','Vivek Mehta','Swati Tripathi','Piyush Shukla','Lalit Misra',
  ]
  const classes = [
    { class: 'Class VI',   section: 'A', fee: 850 },
    { class: 'Class VI',   section: 'B', fee: 850 },
    { class: 'Class VII',  section: 'A', fee: 900 },
    { class: 'Class VIII', section: 'A', fee: 900 },
    { class: 'Class IX',   section: 'A', fee: 950 },
    { class: 'Class IX',   section: 'B', fee: 950 },
    { class: 'Class X',    section: 'A', fee: 950 },
    { class: 'Class XI',   section: 'A', fee: 1000 },
    { class: 'Class XI',   section: 'B', fee: 1000 },
    { class: 'Class XII',  section: 'A', fee: 1000 },
  ]
  const statuses = ['Registered', 'Registered', 'Registered', 'Registered', 'Withdrawn']
  const received = [true, true, true, false, false, true, true, false]

  return names.map((name, i) => {
    const cls   = classes[i % classes.length]
    const rt    = routes[i % routes.length]
    const stop  = rt.stops[i % rt.stops.length]
    const rcvd  = received[i % received.length]
    const stat  = statuses[i % statuses.length]
    return {
      id:             i + 1,
      name,
      class:          cls.class,
      section:        cls.section,
      route:          rt.route,
      stop,
      fee:            cls.fee,
      received:       rcvd ? cls.fee : 0,
      pending:        rcvd ? 0 : cls.fee,
      isReceived:     rcvd,
      studentStatus:  stat,
      routeId:        String((i % 5) + 1),
    }
  })
}

const ALL_ROWS = generateRows()

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const CLASS_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' },
  { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#0891b2', bg: '#cffafe' },
  { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' },
  { fg: '#dc2626', bg: '#fee2e2' },
  { fg: '#0369a1', bg: '#e0f2fe' },
]
const classColor  = (name) => CLASS_COLORS[(name?.charCodeAt(0) ?? 0) % CLASS_COLORS.length]
const formatAbbr  = (name = '') => name.replace('Class ', '').slice(0, 3).toUpperCase()
const formatCurr  = (n) => `₹${n.toLocaleString('en-IN')}`

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

function SummaryCard({ icon: Icon, label, value, color, isCurr }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    rose:    'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[18px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">
          {isCurr ? formatCurr(value) : value.toLocaleString()}
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
    </div>
  )
}

function SchoolHeader({ session, month }) {
  const monthLabel = MONTHS.find(m => m.value === month)?.label ?? month
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
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25">
          <span className="text-[12px] font-bold text-amber-700 dark:text-amber-400">Session: {session}</span>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-blue-100 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/25">
          <span className="text-[12px] font-bold text-blue-700 dark:text-blue-400">Month: {monthLabel}</span>
        </div>
      </div>
      <p className="mt-2 text-[13px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400">
        Month Wise Transport Report
      </p>
    </div>
  )
}

// ─── MULTI-SELECT CLASS PICKER ─────────────────────────────────────────────────
function MultiClassSelect({ selected, onChange, error }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggle = (cls) => {
    if (selected.includes(cls)) onChange(selected.filter(c => c !== cls))
    else onChange([...selected, cls])
  }
  const selectAll   = () => onChange([...CLASSES])
  const clearAll    = () => onChange([])

  const label = selected.length === 0
    ? '-- Select Class --'
    : selected.length === CLASSES.length
      ? 'All Classes'
      : selected.length <= 3
        ? selected.join(', ')
        : `${selected.slice(0, 2).join(', ')} +${selected.length - 2} more`

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between pl-3 pr-2.5 py-2 text-[13px] rounded-lg border outline-none transition-all cursor-pointer text-left
          bg-white text-slate-800 dark:bg-[#1e2238] dark:text-slate-200
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
      >
        <span className={`truncate ${selected.length === 0 ? 'text-slate-400 dark:text-slate-600' : ''}`}>{label}</span>
        <div className="flex items-center gap-1 flex-shrink-0 ml-1">
          {selected.length > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
              {selected.length}
            </span>
          )}
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.25)] bg-white dark:bg-[#1e2238] shadow-xl overflow-hidden">
          {/* Actions */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
            <button type="button" onClick={selectAll}
              className="flex-1 text-[11px] font-semibold py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 transition-colors">
              Select All
            </button>
            <button type="button" onClick={clearAll}
              className="flex-1 text-[11px] font-semibold py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 transition-colors">
              Clear All
            </button>
          </div>
          {/* Options list */}
          <div className="max-h-[200px] overflow-y-auto py-1">
            {CLASSES.map(cls => {
              const isChecked = selected.includes(cls)
              const { fg, bg } = classColor(cls)
              return (
                <button
                  key={cls}
                  type="button"
                  onClick={() => toggle(cls)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-[13px] transition-colors
                    ${isChecked
                      ? 'bg-blue-50 dark:bg-blue-500/10'
                      : 'hover:bg-slate-50 dark:hover:bg-white/[0.03]'}`}
                >
                  <span
                    className="w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                    style={{ background: bg, color: fg }}
                  >
                    {formatAbbr(cls)}
                  </span>
                  <span className={`flex-1 font-medium ${isChecked ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'}`}>
                    {cls}
                  </span>
                  {isChecked && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── STATUS BADGE ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  if (status === 'Registered')
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 whitespace-nowrap">
        <CheckCircle2 className="w-3 h-3" />Registered
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 whitespace-nowrap">
      <XCircle className="w-3 h-3" />Withdrawn
    </span>
  )
}

// ─── PAYMENT BADGE ─────────────────────────────────────────────────────────────
function PaymentBadge({ isReceived, fee, received, pending }) {
  if (isReceived)
    return (
      <span className="inline-flex flex-col items-center justify-center px-2 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 whitespace-nowrap min-w-[72px]">
        <span>{formatCurr(fee)}</span>
        <span className="text-[10px] font-medium opacity-70">Received</span>
      </span>
    )
  return (
    <span className="inline-flex flex-col items-center justify-center px-2 py-1 rounded-lg text-[11px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 whitespace-nowrap min-w-[72px]">
      <span>{formatCurr(fee)}</span>
      <span className="text-[10px] font-medium opacity-70">Pending</span>
    </span>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx, isTotal }) {
  if (isTotal) {
    return (
      <tr className="bg-blue-50 dark:bg-indigo-500/[0.07] border-t-2 border-blue-200 dark:border-indigo-500/30">
        <td className="px-3 py-3 text-center text-[12px] text-blue-500 dark:text-blue-400">—</td>
        <td className="px-3 py-3" colSpan={5}>
          <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Grand Total — {row._count} students
          </span>
        </td>
        <td className="px-3 py-3 text-center">
          <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-[13px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 tabular-nums">
            {formatCurr(row.fee)}
          </span>
        </td>
        <td className="px-3 py-3 text-center">
          <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-[13px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 tabular-nums">
            {formatCurr(row.received)}
          </span>
        </td>
        <td className="px-3 py-3 text-center">
          <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-[13px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 tabular-nums">
            {formatCurr(row.pending)}
          </span>
        </td>
        <td className="px-3 py-3" />
      </tr>
    )
  }

  const { fg, bg } = classColor(row.class)
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      <td className="px-3 py-3 text-center text-[12px] text-slate-400 tabular-nums w-10">{idx}</td>

      {/* Student */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-slate-100 dark:bg-slate-800">
            <User className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          </div>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.name}</span>
        </div>
      </td>

      {/* Class */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-1.5">
          <span className="w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold flex-shrink-0"
            style={{ background: bg, color: fg }}>
            {formatAbbr(row.class)}
          </span>
          <span className="text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.class}</span>
        </div>
      </td>

      {/* Section */}
      <td className="px-3 py-3 text-center">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          {row.section}
        </span>
      </td>

      {/* Route */}
      <td className="px-3 py-3">
        <span className="text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.route.split('–')[0].trim()}</span>
      </td>

      {/* Stop */}
      <td className="px-3 py-3">
        <span className="text-[12px] text-slate-500 dark:text-slate-400 whitespace-nowrap">{row.stop.split('–')[0].trim()}</span>
      </td>

      {/* Fee */}
      <td className="px-3 py-3 text-center">
        <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 tabular-nums">{formatCurr(row.fee)}</span>
      </td>

      {/* Received */}
      <td className="px-3 py-3 text-center">
        <span className={`text-[12px] font-semibold tabular-nums ${row.isReceived ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-600'}`}>
          {formatCurr(row.received)}
        </span>
      </td>

      {/* Pending */}
      <td className="px-3 py-3 text-center">
        <span className={`text-[12px] font-semibold tabular-nums ${row.pending > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400 dark:text-slate-600'}`}>
          {formatCurr(row.pending)}
        </span>
      </td>

      {/* Status */}
      <td className="px-3 py-3 text-center">
        <StatusBadge status={row.studentStatus} />
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row, idx, showReceived }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = classColor(row.class)
  const paidPct = row.fee > 0 ? Math.round((row.received / row.fee) * 100) : 0

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-100 dark:bg-slate-800">
          <User className="w-4.5 h-4.5 text-slate-500 dark:text-slate-400" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 truncate">{row.name}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="w-4 h-4 rounded flex items-center justify-center text-[8px] font-bold"
                style={{ background: bg, color: fg }}>
                {formatAbbr(row.class)}
              </span>
              {row.class} · {row.section}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end flex-shrink-0 gap-1">
          <StatusBadge status={row.studentStatus} />
          <span className={`text-[12px] font-bold tabular-nums ${row.isReceived ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {formatCurr(row.fee)}
          </span>
        </div>

        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Payment progress bar */}
      {showReceived && (
        <div className="px-4 pb-3">
          <div className="flex text-[10px] font-semibold justify-between mb-1">
            <span className="text-emerald-600 dark:text-emerald-400">Paid {paidPct}%</span>
            <span className="text-rose-500 dark:text-rose-400">Pending {100 - paidPct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-rose-200 dark:bg-rose-500/20 overflow-hidden">
            <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${paidPct}%` }} />
          </div>
        </div>
      )}

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4 space-y-3">
          {/* Route + Stop */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Bus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="text-[10px] font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">Route</span>
              </div>
              <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-200">{row.route.split('–')[0].trim()}</p>
            </div>
            <div className="rounded-xl bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <MapPin className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                <span className="text-[10px] font-bold uppercase tracking-wide text-violet-600 dark:text-violet-400">Stop</span>
              </div>
              <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-200">{row.stop.split('–')[0].trim()}</p>
            </div>
          </div>

          {/* Fee details */}
          {showReceived && (
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-2.5 text-center">
                <p className="text-[16px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{formatCurr(row.fee)}</p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400 mt-0.5">Fee</p>
              </div>
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-2.5 text-center">
                <p className="text-[16px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">{formatCurr(row.received)}</p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 mt-0.5">Rcvd</p>
              </div>
              <div className="rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 p-2.5 text-center">
                <p className="text-[16px] font-bold text-rose-700 dark:text-rose-300 tabular-nums">{formatCurr(row.pending)}</p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-rose-600 dark:text-rose-400 mt-0.5">Pending</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ──────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, filters, setFilters, onShow, loading, errors }) {
  if (!open) return null
  const { session, classes, month, route, receive, studentStatus } = filters
  const set = (key) => (val) => setFilters(f => ({ ...f, [key]: val }))

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl max-h-[90vh] flex flex-col"
        style={{ animation: 'drawerUp .25s ease' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex-shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Search Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          <Field label="Session" error={errors.session} required>
            <NativeSelect value={session} onChange={e => set('session')(e.target.value)} placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Class (Multi-select)" error={errors.classes}>
            <MultiClassSelect selected={classes} onChange={set('classes')} error={errors.classes} />
          </Field>

          <Field label="Month" error={errors.month} required>
            <NativeSelect value={month} onChange={e => set('month')(e.target.value)} placeholder="-- Select Month --" error={errors.month}>
              {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Route">
            <NativeSelect value={route} onChange={e => set('route')(e.target.value)}>
              {ROUTES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Amount Type">
            <NativeSelect value={receive} onChange={e => set('receive')(e.target.value)}>
              {RECEIVE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Student Status">
            <NativeSelect value={studentStatus} onChange={e => set('studentStatus')(e.target.value)}>
              {STUDENT_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </NativeSelect>
          </Field>
        </div>

        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3 flex-shrink-0">
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
export default function MonthwiseTransportReport() {
  const [filters, setFilters] = useState({
    session:       '',
    classes:       [],
    month:         '',
    route:         '',
    receive:       '0',
    studentStatus: '0',
  })

  const [rows,         setRows]        = useState([])
  const [loading,      setLoading]     = useState(false)
  const [exporting,    setExporting]   = useState(false)
  const [filterOpen,   setFilterOpen]  = useState(false)
  const [search,       setSearch]      = useState('')
  const [errors,       setErrors]      = useState({})
  const [toast,        setToast]       = useState(null)
  const [shown,        setShown]       = useState(false)
  const [shownMeta,    setShownMeta]   = useState({ session: '', month: '' })

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const showReceived = filters.receive === '1' || shownMeta.receive === '1'

  // ── Fetch (simulate API) ────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!filters.session) err.session = 'Please select a session'
    if (!filters.month)   err.month   = 'Please select a month'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      let data = [...ALL_ROWS]

      // Filter by selected classes
      if (filters.classes.length > 0)
        data = data.filter(r => filters.classes.includes(r.class))

      // Filter by route
      if (filters.route)
        data = data.filter(r => r.routeId === filters.route)

      // Filter by student status
      if (filters.studentStatus !== '0')
        data = data.filter(r => r.studentStatus === filters.studentStatus)

      setRows(data)
      setShownMeta({ session: filters.session, month: filters.month, receive: filters.receive })
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} transport records.`)
    }, 700)
  }, [filters])

  const handleReset = () => {
    setFilters({ session: '', classes: [], month: '', route: '', receive: '0', studentStatus: '0' })
    setRows([]); setSearch(''); setErrors({}); setShown(false); setShownMeta({ session: '', month: '' })
  }

  const handleExcel = () => {
    if (rows.length === 0) { showToast('No data to export.', 'error'); return }
    setExporting(true)
    setTimeout(() => { setExporting(false); showToast('Excel export ready! (API pending)') }, 1200)
  }

  // ── Search filter ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.class.toLowerCase().includes(q) ||
      r.section.toLowerCase().includes(q) ||
      r.route.toLowerCase().includes(q) ||
      r.stop.toLowerCase().includes(q) ||
      r.studentStatus.toLowerCase().includes(q)
    )
  }, [rows, search])

  // ── Grand totals ────────────────────────────────────────────────────────────
  const totals = useMemo(() => ({
    fee:      filtered.reduce((s, r) => s + r.fee,      0),
    received: filtered.reduce((s, r) => s + r.received, 0),
    pending:  filtered.reduce((s, r) => s + r.pending,  0),
    _count:   filtered.length,
  }), [filtered])

  const hasResults    = shown && rows.length > 0
  const activeFilters = [
    filters.session,
    filters.classes.length > 0,
    filters.month,
    filters.route,
  ].filter(Boolean).length

  const showReceivedCols = shownMeta.receive === '1'

  const TABLE_HEADERS = showReceivedCols
    ? ['S.No.', 'Student Name', 'Class', 'Sec', 'Route', 'Stop', 'Fee', 'Received', 'Pending', 'Status']
    : ['S.No.', 'Student Name', 'Class', 'Sec', 'Route', 'Stop', 'Fee', 'Status']

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Bus className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Month Wise Transport Report
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Class &amp; route-wise monthly transport fee collection report.
          </p>
        </div>
        {hasResults && (
          <button type="button" onClick={handleExcel} disabled={exporting}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20
              transition-all active:scale-95 disabled:opacity-70 flex-shrink-0">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            Export Excel
          </button>
        )}
      </div>

      {/* ── DESKTOP Filter Card ──────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-visible">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-end">

            <Field label="Session" error={errors.session} required>
              <NativeSelect value={filters.session}
                onChange={e => setFilters(f => ({ ...f, session: e.target.value }))
                  || setErrors(p => ({ ...p, session: undefined }))}
                placeholder="-- Select Session --" error={errors.session}>
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Class (Multi)">
              <MultiClassSelect selected={filters.classes}
                onChange={v => setFilters(f => ({ ...f, classes: v }))} />
            </Field>

            <Field label="Month" error={errors.month} required>
              <NativeSelect value={filters.month}
                onChange={e => setFilters(f => ({ ...f, month: e.target.value }))
                  || setErrors(p => ({ ...p, month: undefined }))}
                placeholder="-- Select Month --" error={errors.month}>
                {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Route">
              <NativeSelect value={filters.route}
                onChange={e => setFilters(f => ({ ...f, route: e.target.value }))}>
                {ROUTES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Amount Type">
              <NativeSelect value={filters.receive}
                onChange={e => setFilters(f => ({ ...f, receive: e.target.value }))}>
                {RECEIVE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Student Status">
              <NativeSelect value={filters.studentStatus}
                onChange={e => setFilters(f => ({ ...f, studentStatus: e.target.value }))}>
                {STUDENT_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </NativeSelect>
            </Field>
          </div>

          {/* Action buttons row */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
            <button type="button" onClick={handleShow} disabled={loading}
              className="flex items-center gap-2 px-6 py-2 rounded-xl text-[13px] font-semibold text-white
                bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
                transition-all active:scale-95 disabled:opacity-70">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
              Show Report
            </button>
            <button type="button" onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ─────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {activeFilters > 0 ? `Filters (${activeFilters})` : 'Search Filters'}
        </button>
        {hasResults && (
          <button type="button" onClick={handleExcel} disabled={exporting}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold bg-emerald-600 text-white shadow-sm disabled:opacity-70">
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
        filters={filters}
        setFilters={setFilters}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading ──────────────────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      )}

      {/* ── Results ────────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* School Header */}
          <SchoolHeader session={shownMeta.session} month={shownMeta.month} />

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={User}      label="Total Students"    value={totals._count}   color="blue"    />
            <SummaryCard icon={Banknote}  label="Total Fee"         value={totals.fee}       color="violet"  isCurr />
            <SummaryCard icon={CheckCircle2} label="Amount Received" value={totals.received} color="emerald" isCurr />
            <SummaryCard icon={Clock}     label="Pending Amount"    value={totals.pending}   color="rose"    isCurr />
          </div>

          {/* Results card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Transport Records</span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">
                  · {shownMeta.session} · {MONTHS.find(m => m.value === shownMeta.month)?.label}
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                  {filtered.length} record{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-56 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search name, class, route…"
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
                Showing month-wise transport fee details per student. Pending = Fee – Received.
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
                      {['S.No.', 'Student Name', 'Class', 'Sec', 'Route', 'Stop', 'Fee',
                        ...(showReceivedCols ? ['Received', 'Pending'] : []),
                        'Status'
                      ].map((h, i) => (
                        <th key={i} className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-10">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <DesktopRow key={row.id} row={row} idx={i + 1} showReceived={showReceivedCols} />
                    ))}
                    <DesktopRow row={totals} idx={0} isTotal showReceived={showReceivedCols} />
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
                    Tap a card to see route &amp; fee details.
                  </p>

                  {filtered.map((row) => (
                    <MobileCard key={row.id} row={row} showReceived={showReceivedCols} />
                  ))}

                  {/* Mobile Grand Total */}
                  <div className="rounded-xl border-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07] p-4">
                    <p className="text-[12px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Grand Total — {filtered.length} Students
                    </p>
                    <div className={`grid gap-2 ${showReceivedCols ? 'grid-cols-3' : 'grid-cols-2'}`}>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[18px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{filtered.length}</p>
                        <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Students</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[15px] font-bold text-violet-700 dark:text-violet-300 tabular-nums">{formatCurr(totals.fee)}</p>
                        <p className="text-[10px] font-semibold text-violet-600 dark:text-violet-400">Total Fee</p>
                      </div>
                      {showReceivedCols && (
                        <>
                          <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                            <p className="text-[15px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">{formatCurr(totals.received)}</p>
                            <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Received</p>
                          </div>
                          <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center col-span-3">
                            <div className="flex text-[10px] font-semibold justify-between mb-1">
                              <span className="text-emerald-600">Collected {totals.fee ? Math.round((totals.received / totals.fee) * 100) : 0}%</span>
                              <span className="text-rose-500">{formatCurr(totals.pending)} pending</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-rose-200 dark:bg-rose-500/20 overflow-hidden">
                              <div className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                                style={{ width: `${totals.fee ? Math.round((totals.received / totals.fee) * 100) : 0}%` }} />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Table footer */}
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

      {/* ── Empty State ────────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Bus className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select session &amp; month, then click <strong>Show Report</strong> to load transport data.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
