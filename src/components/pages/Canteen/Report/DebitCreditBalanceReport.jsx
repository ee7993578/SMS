/**
 * DebitCreditBalanceReport.jsx
 * Folder: src/pages/Reports/Tuckshop/DebitCreditBalanceReport.jsx
 *
 * Converts legacy ASPX "Debit Credit Balance Report" to fully-responsive React + Tailwind.
 *
 * Filters: Session → Class → Section → Student
 * Columns: S.No, Student Name, Admission No, Class-Section, Debit, Credit, Balance
 * Features:
 *  - Cascading dropdowns (Session → Class → Section → Student)
 *  - Show report button + Excel export
 *  - School name / session header in report
 *  - Balance summary cards
 *  - Mobile: collapsible cards with expandable details
 *  - Desktop: dense ERP-style table with color-coded balance
 *  - Mobile filter drawer
 *  - Search / empty / loading states
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye,
  AlertCircle, X, Check, Loader2, ChevronDown,
  SlidersHorizontal, Search, Info,
  FileSpreadsheet, ChevronRight,
  TrendingUp, TrendingDown, Wallet,
  ArrowUpCircle, ArrowDownCircle, MinusCircle,
  Building2, MapPin, BookOpen, BarChart3, Users
} from 'lucide-react'

// ─── STATIC DATA ──────────────────────────────────────────────────────────────
const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

const CLASSES_BY_SESSION = {
  '2022-23': ['Nursery', 'LKG', 'UKG', 'Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'],
  '2023-24': ['Nursery', 'LKG', 'UKG', 'Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'],
  '2024-25': ['Nursery', 'LKG', 'UKG', 'Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'],
  '2025-26': ['Nursery', 'LKG', 'UKG', 'Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'],
}

const SECTIONS_BY_CLASS = {
  'Nursery': ['A', 'B'], 'LKG': ['A', 'B'], 'UKG': ['A', 'B'],
  'Class I': ['A', 'B'], 'Class II': ['A', 'B'],
  'Class III': ['A'], 'Class IV': ['A'], 'Class V': ['A'],
  'Class VI': ['A', 'B'], 'Class VII': ['A'],
  'Class VIII': ['A'], 'Class IX': ['A', 'B'],
  'Class X': ['A'], 'Class XI': ['A', 'B'], 'Class XII': ['A', 'B'],
}

// Dummy students per class-section
const generateStudents = (cls, section) => {
  const names = [
    'Aarav Sharma', 'Priya Singh', 'Rohan Gupta', 'Sneha Verma', 'Karan Mehta',
    'Ananya Joshi', 'Vikram Yadav', 'Pooja Negi', 'Rahul Tiwari', 'Divya Rawat',
    'Arjun Chauhan', 'Nisha Bisht', 'Siddharth Pant', 'Kavya Joshi', 'Mohit Bhatt',
  ]
  return names.map((name, i) => ({
    id: `${cls.replace(' ', '')}-${section}-${i + 1}`,
    name,
    admNo: `ADM${2022 + i}${String(i + 1).padStart(3, '0')}`,
    class: cls,
    section,
  }))
}

// Dummy debit/credit data
const generateReportData = (session, cls, section, studentId) => {
  const seed = (session.charCodeAt(0) + (cls?.charCodeAt(0) || 0) + (section?.charCodeAt(0) || 0))

  const makeRow = (student, idx) => {
    const debit  = Math.round((seed * (idx + 1) * 17.3) % 5000) + 500
    const credit = Math.round((seed * (idx + 1) * 13.7) % 4000) + 200
    return {
      ...student,
      debit,
      credit,
      balance: credit - debit,
    }
  }

  if (studentId && studentId !== 'all') {
    // Find which class/section this student belongs to – already known from filters
    const students = generateStudents(cls || 'Class I', section || 'A')
    const student  = students.find(s => s.id === studentId) || students[0]
    return [makeRow(student, 0)]
  }

  const students = generateStudents(cls || 'Class I', section || 'A')
  return students.map(makeRow)
}

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
const classColor = (name = '') => CLASS_COLORS[(name.charCodeAt(0) ?? 0) % CLASS_COLORS.length]
const formatAbbr = (name = '') => name.replace('Class ', '').slice(0, 3).toUpperCase()
const formatCurrency = (n) => `₹${Math.abs(n).toLocaleString('en-IN')}`

const balanceStyle = (balance) => {
  if (balance > 0)  return { text: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20', icon: TrendingUp,   label: 'Surplus' }
  if (balance < 0)  return { text: 'text-rose-700 dark:text-rose-400',     bg: 'bg-rose-50 dark:bg-rose-500/10',       border: 'border-rose-200 dark:border-rose-500/20',     icon: TrendingDown, label: 'Due' }
  return { text: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-700/30', border: 'border-slate-200 dark:border-slate-600/30', icon: MinusCircle, label: 'Settled' }
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
            ? 'border-rose-400 ring-2 ring-rose-100 dark:ring-rose-500/20'
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

// ─── SUMMARY CARD ─────────────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, color, prefix = '₹' }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    rose:    'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
  }
  const textColors = {
    blue:    'text-blue-700 dark:text-blue-300',
    emerald: 'text-emerald-700 dark:text-emerald-300',
    rose:    'text-rose-700 dark:text-rose-300',
    amber:   'text-amber-700 dark:text-amber-300',
    violet:  'text-violet-700 dark:text-violet-300',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className={`text-[18px] font-bold tabular-nums leading-tight ${textColors[color]}`}>
          {prefix}{Math.abs(value).toLocaleString('en-IN')}
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── SCHOOL HEADER ────────────────────────────────────────────────────────────
function SchoolHeader({ session, cls, section }) {
  return (
    <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-6 py-5 text-center shadow-sm">
      <div className="flex items-center justify-center gap-2 mb-1">
        <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <h2 className="text-[15px] sm:text-[18px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
          {SCHOOL_INFO.name}
        </h2>
      </div>
      <div className="flex items-center justify-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400 mb-3">
        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
        <span>{SCHOOL_INFO.address}</span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25 text-[12px] font-bold text-amber-700 dark:text-amber-400">
          Session: {session}
        </span>
        {cls && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/25 text-[12px] font-bold text-blue-700 dark:text-blue-400">
            {cls} {section ? `– Sec ${section}` : ''}
          </span>
        )}
      </div>
      <p className="mt-2 text-[13px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400">
        Debit Credit Balance Report
      </p>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx, isTotal }) {
  const { fg, bg } = classColor(row.class)
  const bs = balanceStyle(row.balance)
  const BalIcon = bs.icon

  if (isTotal) {
    return (
      <tr className="bg-blue-50 dark:bg-indigo-500/[0.07] border-t-2 border-blue-200 dark:border-indigo-500/30">
        <td className="px-4 py-3 text-center text-[12px] text-blue-400">—</td>
        <td className="px-4 py-3" colSpan={3}>
          <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <Users className="w-4 h-4" /> Grand Total ({row._count} students)
          </span>
        </td>
        <td className="px-4 py-3 text-center">
          <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-[13px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 tabular-nums">
            ₹{row.debit.toLocaleString('en-IN')}
          </span>
        </td>
        <td className="px-4 py-3 text-center">
          <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-[13px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 tabular-nums">
            ₹{row.credit.toLocaleString('en-IN')}
          </span>
        </td>
        <td className="px-4 py-3 text-center">
          <span className={`inline-flex items-center gap-1 justify-center px-3 py-1 rounded-lg text-[13px] font-bold tabular-nums ${bs.bg} ${bs.text}`}>
            {row.balance >= 0 ? '+' : '-'}₹{Math.abs(row.balance).toLocaleString('en-IN')}
          </span>
        </td>
      </tr>
    )
  }

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">{idx}</td>

      {/* Student Name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span
            className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
            style={{ background: bg, color: fg }}
          >
            {row.name.slice(0, 2).toUpperCase()}
          </span>
          <div>
            <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.name}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">{row.admNo}</p>
          </div>
        </div>
      </td>

      {/* Admission No */}
      <td className="px-4 py-3 text-center">
        <span className="text-[12px] font-mono text-slate-500 dark:text-slate-400">{row.admNo}</span>
      </td>

      {/* Class-Section */}
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold"
          style={{ background: bg, color: fg }}>
          {formatAbbr(row.class)} – {row.section}
        </span>
      </td>

      {/* Debit */}
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center gap-1 justify-center px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 tabular-nums">
          <ArrowDownCircle className="w-3 h-3 flex-shrink-0" />
          ₹{row.debit.toLocaleString('en-IN')}
        </span>
      </td>

      {/* Credit */}
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center gap-1 justify-center px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 tabular-nums">
          <ArrowUpCircle className="w-3 h-3 flex-shrink-0" />
          ₹{row.credit.toLocaleString('en-IN')}
        </span>
      </td>

      {/* Balance */}
      <td className="px-4 py-3 text-center">
        <span className={`inline-flex items-center gap-1 justify-center px-2.5 py-1 rounded-lg text-[12px] font-bold tabular-nums border ${bs.bg} ${bs.text} ${bs.border}`}>
          <BalIcon className="w-3 h-3 flex-shrink-0" />
          {row.balance >= 0 ? '+' : '-'}₹{Math.abs(row.balance).toLocaleString('en-IN')}
        </span>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = classColor(row.class)
  const bs = balanceStyle(row.balance)
  const BalIcon = bs.icon

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        <span
          className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[11px] font-bold"
          style={{ background: bg, color: fg }}
        >
          {row.name.slice(0, 2).toUpperCase()}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{row.name}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 font-mono">{row.admNo}</p>
        </div>

        {/* Balance badge */}
        <div className={`flex flex-col items-end flex-shrink-0 px-2.5 py-1.5 rounded-xl border ${bs.bg} ${bs.border}`}>
          <span className={`text-[14px] font-bold tabular-nums leading-tight ${bs.text}`}>
            {row.balance >= 0 ? '+' : '-'}₹{Math.abs(row.balance).toLocaleString('en-IN')}
          </span>
          <span className={`text-[9px] font-bold uppercase ${bs.text} opacity-70`}>{bs.label}</span>
        </div>

        <span className={`w-5 h-5 flex items-center justify-center ml-0.5 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Expanded Detail */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4">
          {/* Class & Section */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Class:</span>
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold"
              style={{ background: bg, color: fg }}
            >
              {row.class} – Sec {row.section}
            </span>
          </div>

          {/* Debit / Credit / Balance grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 p-3 text-center">
              <ArrowDownCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 mx-auto mb-1" />
              <p className="text-[16px] font-bold text-rose-700 dark:text-rose-300 tabular-nums leading-tight">
                ₹{row.debit.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-rose-500 dark:text-rose-400 mt-0.5">Debit</p>
            </div>

            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-3 text-center">
              <ArrowUpCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400 mx-auto mb-1" />
              <p className="text-[16px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums leading-tight">
                ₹{row.credit.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-500 dark:text-emerald-400 mt-0.5">Credit</p>
            </div>

            <div className={`rounded-xl border p-3 text-center ${bs.bg} ${bs.border}`}>
              <BalIcon className={`w-4 h-4 mx-auto mb-1 ${bs.text}`} />
              <p className={`text-[16px] font-bold tabular-nums leading-tight ${bs.text}`}>
                {row.balance >= 0 ? '+' : '-'}₹{Math.abs(row.balance).toLocaleString('en-IN')}
              </p>
              <p className={`text-[10px] font-bold uppercase tracking-wide mt-0.5 ${bs.text} opacity-75`}>{bs.label}</p>
            </div>
          </div>

          {/* Balance bar */}
          {(row.debit + row.credit) > 0 && (
            <div className="mt-3">
              <div className="flex text-[10px] font-semibold justify-between mb-1">
                <span className="text-rose-600 dark:text-rose-400">
                  Debit {Math.round((row.debit / (row.debit + row.credit)) * 100)}%
                </span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  Credit {Math.round((row.credit / (row.debit + row.credit)) * 100)}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-rose-200 dark:bg-rose-500/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${Math.round((row.credit / (row.debit + row.credit)) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, filters, setFilters, onShow, loading, errors, classOptions, sectionOptions, studentOptions }) {
  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl max-h-[85vh] overflow-y-auto"
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
            <NativeSelect value={filters.session} onChange={e => setFilters(p => ({ ...p, session: e.target.value, class: '', section: '', student: '' }))} placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Class">
            <NativeSelect value={filters.class} onChange={e => setFilters(p => ({ ...p, class: e.target.value, section: '', student: '' }))} placeholder="-- All Classes --" disabled={!filters.session}>
              {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Section">
            <NativeSelect value={filters.section} onChange={e => setFilters(p => ({ ...p, section: e.target.value, student: '' }))} placeholder="-- All Sections --" disabled={!filters.class}>
              {sectionOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Student">
            <NativeSelect value={filters.student} onChange={e => setFilters(p => ({ ...p, student: e.target.value }))} placeholder="-- All Students --" disabled={!filters.section}>
              {studentOptions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
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
export default function DebitCreditBalanceReport() {
  const [filters, setFilters] = useState({ session: '', class: '', section: '', student: '' })
  const [rows,       setRows]       = useState([])
  const [loading,    setLoading]    = useState(false)
  const [exporting,  setExporting]  = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [search,     setSearch]     = useState('')
  const [errors,     setErrors]     = useState({})
  const [toast,      setToast]      = useState(null)
  const [shown,      setShown]      = useState(false)
  const [shownMeta,  setShownMeta]  = useState({})

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Cascading options ────────────────────────────────────────────────────
  const classOptions   = filters.session ? (CLASSES_BY_SESSION[filters.session] || []) : []
  const sectionOptions = filters.class   ? (SECTIONS_BY_CLASS[filters.class] || []) : []
  const studentOptions = (filters.class && filters.section)
    ? generateStudents(filters.class, filters.section)
    : []

  // ── Handle filter changes ensuring cascade reset ─────────────────────────
  const handleSetFilters = useCallback((updater) => {
    setFilters(updater)
  }, [])

  // ── Show Report ──────────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!filters.session) err.session = 'Please select a session'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      const data = generateReportData(filters.session, filters.class, filters.section, filters.student)
      setRows(data)
      setShownMeta({ session: filters.session, class: filters.class, section: filters.section })
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} record${data.length !== 1 ? 's' : ''} successfully.`)
    }, 700)
  }, [filters])

  const handleReset = () => {
    setFilters({ session: '', class: '', section: '', student: '' })
    setRows([]); setSearch(''); setErrors({}); setShown(false); setShownMeta({})
  }

  // ── Excel Export ────────────────────────────────────────────────────────
  const handleExcel = () => {
    if (rows.length === 0) { showToast('No data to export. Show report first.', 'error'); return }
    setExporting(true)
    setTimeout(() => { setExporting(false); showToast('Excel export ready! (API integration pending)') }, 1200)
  }

  // ── Search filter ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.admNo.toLowerCase().includes(q) ||
      r.class.toLowerCase().includes(q)
    )
  }, [rows, search])

  // ── Grand Totals ─────────────────────────────────────────────────────────
  const totals = useMemo(() => ({
    debit:   filtered.reduce((s, r) => s + r.debit,  0),
    credit:  filtered.reduce((s, r) => s + r.credit, 0),
    balance: filtered.reduce((s, r) => s + r.balance, 0),
    _count:  filtered.length,
  }), [filtered])

  const hasResults  = shown && rows.length > 0
  const activeCount = [filters.session, filters.class, filters.section, filters.student].filter(Boolean).length

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Debit Credit Balance Report
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Student-wise tuck-shop debit, credit &amp; net balance ledger.
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

      {/* ── DESKTOP Filter Card ──────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
          {activeCount > 0 && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
              {activeCount} active
            </span>
          )}
        </div>

        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 items-end">

            {/* Session */}
            <Field label="Session" error={errors.session} required>
              <NativeSelect
                value={filters.session}
                onChange={e => {
                  setFilters({ session: e.target.value, class: '', section: '', student: '' })
                  setErrors(p => ({ ...p, session: undefined }))
                }}
                placeholder="-- Select Session --"
                error={errors.session}
              >
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            {/* Class */}
            <Field label="Class">
              <NativeSelect
                value={filters.class}
                onChange={e => setFilters(p => ({ ...p, class: e.target.value, section: '', student: '' }))}
                placeholder="-- All Classes --"
                disabled={!filters.session}
              >
                {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            {/* Section */}
            <Field label="Section">
              <NativeSelect
                value={filters.section}
                onChange={e => setFilters(p => ({ ...p, section: e.target.value, student: '' }))}
                placeholder="-- All Sections --"
                disabled={!filters.class}
              >
                {sectionOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            {/* Student */}
            <Field label="Student">
              <NativeSelect
                value={filters.student}
                onChange={e => setFilters(p => ({ ...p, student: e.target.value }))}
                placeholder="-- All Students --"
                disabled={!filters.section}
              >
                {studentOptions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </NativeSelect>
            </Field>

            {/* Actions */}
            <div className="flex gap-2">
              <button type="button" onClick={handleShow} disabled={loading}
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
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {filters.session ? `${filters.session}${filters.class ? ` · ${filters.class}` : ''}` : 'Select Filters'}
          {activeCount > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeCount}</span>
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
        filters={filters}
        setFilters={handleSetFilters}
        onShow={handleShow}
        loading={loading}
        errors={errors}
        classOptions={classOptions}
        sectionOptions={sectionOptions}
        studentOptions={studentOptions}
      />

      {/* ── Loading Skeleton ─────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* School Header */}
          <SchoolHeader session={shownMeta.session} cls={shownMeta.class} section={shownMeta.section} />

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={Users}          label="Total Students" value={totals._count} color="blue"    prefix="" />
            <SummaryCard icon={ArrowDownCircle} label="Total Debit"    value={totals.debit}  color="rose"    />
            <SummaryCard icon={ArrowUpCircle}   label="Total Credit"   value={totals.credit} color="emerald" />
            <SummaryCard
              icon={totals.balance >= 0 ? TrendingUp : TrendingDown}
              label={totals.balance >= 0 ? 'Net Surplus' : 'Net Due'}
              value={totals.balance}
              color={totals.balance >= 0 ? 'emerald' : 'rose'}
            />
          </div>

          {/* Results Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Balance Ledger</span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">· {shownMeta.session}</span>
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
                  placeholder="Search name, Adm No…"
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
                Green balance = credit surplus. Red balance = amount due from student.
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
                      {['S.No.', 'Student Name', 'Adm No.', 'Class–Sec', 'Debit', 'Credit', 'Balance'].map((h, i) => (
                        <th key={i} className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-12">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <DesktopRow key={row.id} row={row} idx={i + 1} />
                    ))}
                    {/* Grand Total */}
                    <DesktopRow row={totals} idx={0} isTotal />
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
                    Tap a card to see full debit/credit breakdown.
                  </p>

                  {filtered.map(row => (
                    <MobileCard key={row.id} row={row} />
                  ))}

                  {/* Mobile Grand Total */}
                  <div className="rounded-xl border-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07] p-4">
                    <p className="text-[12px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Grand Total — {filtered.length} Students
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 p-2.5 text-center">
                        <p className="text-[15px] font-bold text-rose-700 dark:text-rose-300 tabular-nums">₹{totals.debit.toLocaleString('en-IN')}</p>
                        <p className="text-[10px] font-semibold text-rose-500 dark:text-rose-400">Debit</p>
                      </div>
                      <div className="rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-2.5 text-center">
                        <p className="text-[15px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">₹{totals.credit.toLocaleString('en-IN')}</p>
                        <p className="text-[10px] font-semibold text-emerald-500 dark:text-emerald-400">Credit</p>
                      </div>
                      <div className={`rounded-lg border p-2.5 text-center ${balanceStyle(totals.balance).bg} ${balanceStyle(totals.balance).border}`}>
                        <p className={`text-[15px] font-bold tabular-nums ${balanceStyle(totals.balance).text}`}>
                          {totals.balance >= 0 ? '+' : '-'}₹{Math.abs(totals.balance).toLocaleString('en-IN')}
                        </p>
                        <p className={`text-[10px] font-semibold ${balanceStyle(totals.balance).text} opacity-75`}>Balance</p>
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

      {/* ── Empty State ───────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <BarChart3 className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a session and click <strong>Show</strong> to generate the balance report.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
