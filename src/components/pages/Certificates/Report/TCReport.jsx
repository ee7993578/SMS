/**
 * TCReport.jsx
 * Folder: src/pages/Student/Reports/TCReport.jsx
 *
 * Converts legacy ASPX "Transfer Certificate Report" to fully-responsive React + Tailwind.
 *
 * Columns: S.No, TC No., Registration No, Student Name, Class, Issued Date, Withdrawn Date, Withdrawn Reason, Session
 * Features:
 *  - Session + Class filter dropdowns
 *  - Show report button + Excel export
 *  - School name / address / session header in report
 *  - Mobile: collapsible cards with expandable details
 *  - Desktop: dense ERP-style table
 *  - Search by name, TC no, reg no
 *  - Toast notifications
 *  - Loading skeleton
 *  - Empty state
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye,
  AlertCircle, X, Check, Loader2, ChevronDown,
  SlidersHorizontal, Search,
  FileSpreadsheet, BookOpen,
  Building2, MapPin, ChevronRight,
  FileText, CalendarDays, UserCheck,
  ClipboardList, Hash, GraduationCap,
  Info, TrendingUp, ArrowUpRight,
  BadgeCheck
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────
const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CLASSES = [
  'All Classes', 'Nursery', 'LKG', 'UKG',
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X',
  'Class XI', 'Class XII',
]

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

const WITHDRAWN_REASONS = [
  'Family Relocation', 'Fee Default', 'Admission Elsewhere',
  'Personal Reasons', 'Migration', 'Academic Transfer',
]

// Generate rich dummy TC data
const generateTC = (session) => {
  const base = [
    { tc_no: 'TC/001', reg_no: 'REG/2023/001', stu_name: 'Aarav Sharma',      class_name: 'Class X',    issue_date: '2024-03-10', withdrawn_date: '2024-03-08', withdrawn_reason: 'Family Relocation',    session },
    { tc_no: 'TC/002', reg_no: 'REG/2023/042', stu_name: 'Priya Singh',        class_name: 'Class VII',  issue_date: '2024-02-14', withdrawn_date: '2024-02-12', withdrawn_reason: 'Admission Elsewhere',  session },
    { tc_no: 'TC/003', reg_no: 'REG/2023/017', stu_name: 'Rohit Verma',        class_name: 'Class IX',   issue_date: '2024-01-22', withdrawn_date: '2024-01-20', withdrawn_reason: 'Migration',            session },
    { tc_no: 'TC/004', reg_no: 'REG/2022/088', stu_name: 'Sneha Gupta',        class_name: 'Class VI',   issue_date: '2024-03-28', withdrawn_date: '2024-03-25', withdrawn_reason: 'Personal Reasons',     session },
    { tc_no: 'TC/005', reg_no: 'REG/2023/059', stu_name: 'Karan Patel',        class_name: 'Class XII',  issue_date: '2024-04-05', withdrawn_date: '2024-04-03', withdrawn_reason: 'Academic Transfer',    session },
    { tc_no: 'TC/006', reg_no: 'REG/2023/031', stu_name: 'Anjali Yadav',       class_name: 'Class VIII', issue_date: '2024-02-28', withdrawn_date: '2024-02-26', withdrawn_reason: 'Fee Default',          session },
    { tc_no: 'TC/007', reg_no: 'REG/2022/071', stu_name: 'Vivek Tiwari',       class_name: 'Class XI',   issue_date: '2024-01-15', withdrawn_date: '2024-01-12', withdrawn_reason: 'Family Relocation',    session },
    { tc_no: 'TC/008', reg_no: 'REG/2023/005', stu_name: 'Nisha Rawat',        class_name: 'Class V',    issue_date: '2024-03-18', withdrawn_date: '2024-03-16', withdrawn_reason: 'Admission Elsewhere',  session },
    { tc_no: 'TC/009', reg_no: 'REG/2023/092', stu_name: 'Aditya Kumar',       class_name: 'Class IV',   issue_date: '2024-04-12', withdrawn_date: '2024-04-10', withdrawn_reason: 'Migration',            session },
    { tc_no: 'TC/010', reg_no: 'REG/2021/063', stu_name: 'Pooja Mehta',        class_name: 'Class XII',  issue_date: '2024-03-22', withdrawn_date: '2024-03-20', withdrawn_reason: 'Academic Transfer',    session },
    { tc_no: 'TC/011', reg_no: 'REG/2023/028', stu_name: 'Rahul Saxena',       class_name: 'Class III',  issue_date: '2024-02-05', withdrawn_date: '2024-02-03', withdrawn_reason: 'Personal Reasons',     session },
    { tc_no: 'TC/012', reg_no: 'REG/2022/044', stu_name: 'Divya Chauhan',      class_name: 'Class IX',   issue_date: '2024-01-30', withdrawn_date: '2024-01-28', withdrawn_reason: 'Family Relocation',    session },
    { tc_no: 'TC/013', reg_no: 'REG/2023/078', stu_name: 'Manish Joshi',       class_name: 'Class XI',   issue_date: '2024-04-20', withdrawn_date: '2024-04-18', withdrawn_reason: 'Fee Default',          session },
    { tc_no: 'TC/014', reg_no: 'REG/2022/019', stu_name: 'Kavita Pandey',      class_name: 'Class VI',   issue_date: '2024-03-08', withdrawn_date: '2024-03-06', withdrawn_reason: 'Migration',            session },
    { tc_no: 'TC/015', reg_no: 'REG/2023/055', stu_name: 'Suresh Bhatt',       class_name: 'Class X',    issue_date: '2024-02-20', withdrawn_date: '2024-02-18', withdrawn_reason: 'Admission Elsewhere',  session },
  ]
  // Vary data slightly per session
  return base.map((r, i) => ({
    ...r,
    tc_no: `TC/${session.replace('-', '')}/${String(i + 1).padStart(3, '0')}`,
  }))
}

const TC_DATA = Object.fromEntries(SESSIONS.map(s => [s, generateTC(s)]))

// ─── COLOR HELPERS ──────────────────────────────────────────────────────────
const REASON_COLORS = {
  'Family Relocation':   { fg: '#1d4ed8', bg: '#dbeafe', dot: 'bg-blue-500'   },
  'Fee Default':         { fg: '#dc2626', bg: '#fee2e2', dot: 'bg-rose-500'   },
  'Admission Elsewhere': { fg: '#7c3aed', bg: '#ede9fe', dot: 'bg-violet-500' },
  'Personal Reasons':    { fg: '#d97706', bg: '#fef3c7', dot: 'bg-amber-500'  },
  'Migration':           { fg: '#0891b2', bg: '#cffafe', dot: 'bg-cyan-500'   },
  'Academic Transfer':   { fg: '#059669', bg: '#d1fae5', dot: 'bg-emerald-500'},
}
const reasonColor = (r) => REASON_COLORS[r] || { fg: '#64748b', bg: '#f1f5f9', dot: 'bg-slate-400' }

const formatDate = (d) => {
  if (!d) return '—'
  const dt = new Date(d)
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
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

// ─── REASON BADGE ────────────────────────────────────────────────────────────
function ReasonBadge({ reason }) {
  const { fg, bg, dot } = reasonColor(reason)
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap"
      style={{ color: fg, background: bg }}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
      {reason}
    </span>
  )
}

// ─── SUMMARY STAT CARD ────────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, color }) {
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
        <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── SCHOOL HEADER BANNER ─────────────────────────────────────────────────────
function SchoolHeader({ session }) {
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
      <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25">
        <span className="text-[12px] font-bold text-amber-700 dark:text-amber-400">Session: {session}</span>
      </div>
      <p className="mt-2 text-[13px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400">
        Transfer Certificate Report
      </p>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx }) {
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors group">
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-10">{idx}</td>

      {/* TC No. */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <Hash className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
          </span>
          <span className="text-[13px] font-bold text-blue-700 dark:text-blue-400 tabular-nums whitespace-nowrap">{row.tc_no}</span>
        </div>
      </td>

      {/* Reg No */}
      <td className="px-4 py-3">
        <span className="text-[12px] font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md whitespace-nowrap">
          {row.reg_no}
        </span>
      </td>

      {/* Student Name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex-shrink-0 flex items-center justify-center text-white text-[11px] font-bold">
            {row.stu_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.stu_name}</span>
        </div>
      </td>

      {/* Class */}
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-[12px] font-semibold whitespace-nowrap">
          <GraduationCap className="w-3.5 h-3.5" />
          {row.class_name}
        </span>
      </td>

      {/* Issued Date */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap">
          <CalendarDays className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
          {formatDate(row.issue_date)}
        </div>
      </td>

      {/* Withdrawn Date */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap">
          <CalendarDays className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
          {formatDate(row.withdrawn_date)}
        </div>
      </td>

      {/* Withdrawn Reason */}
      <td className="px-4 py-3">
        <ReasonBadge reason={row.withdrawn_reason} />
      </td>

      {/* Session */}
      <td className="px-4 py-3 text-center">
        <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 tabular-nums">{row.session}</span>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row, idx }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Avatar */}
        <span className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex-shrink-0 flex items-center justify-center text-white text-[12px] font-bold">
          {row.stu_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{row.stu_name}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-blue-600 dark:text-blue-400">{row.tc_no}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <GraduationCap className="w-3 h-3" />
              {row.class_name}
            </span>
          </p>
        </div>

        {/* Issued badge */}
        <div className="flex flex-col items-end flex-shrink-0">
          <ReasonBadge reason={row.withdrawn_reason} />
        </div>

        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Collapsed preview bar */}
      <div className="px-4 pb-3 flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <CalendarDays className="w-3 h-3 text-emerald-500" />
          Issued: <span className="font-semibold text-slate-700 dark:text-slate-300 ml-1">{formatDate(row.issue_date)}</span>
        </span>
        <span className="flex items-center gap-1">
          <BadgeCheck className="w-3 h-3 text-slate-400" />
          <span className="font-mono text-[10px] text-slate-400">{row.reg_no}</span>
        </span>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-4 pb-4 space-y-3">
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1">
                <Hash className="w-3 h-3" /> TC Number
              </p>
              <p className="text-[14px] font-bold text-blue-700 dark:text-blue-300">{row.tc_no}</p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                <ClipboardList className="w-3 h-3" /> Reg. No.
              </p>
              <p className="text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-300 break-all">{row.reg_no}</p>
            </div>
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 mb-1 flex items-center gap-1">
                <CalendarDays className="w-3 h-3" /> Issued Date
              </p>
              <p className="text-[13px] font-semibold text-emerald-700 dark:text-emerald-300">{formatDate(row.issue_date)}</p>
            </div>
            <div className="rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-rose-600 dark:text-rose-400 mb-1 flex items-center gap-1">
                <CalendarDays className="w-3 h-3" /> Withdrawn
              </p>
              <p className="text-[13px] font-semibold text-rose-700 dark:text-rose-300">{formatDate(row.withdrawn_date)}</p>
            </div>
          </div>

          {/* Session + Reason */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Session:</span>
            <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300 bg-amber-100 dark:bg-amber-500/15 px-2 py-0.5 rounded-full">{row.session}</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 ml-1">Reason:</span>
            <ReasonBadge reason={row.withdrawn_reason} />
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
export default function TCReport() {
  const [session,      setSession]      = useState('')
  const [classFilter,  setClassFilter]  = useState('All Classes')
  const [rows,         setRows]         = useState([])
  const [loading,      setLoading]      = useState(false)
  const [exporting,    setExporting]    = useState(false)
  const [filterOpen,   setFilterOpen]   = useState(false)
  const [search,       setSearch]       = useState('')
  const [errors,       setErrors]       = useState({})
  const [toast,        setToast]        = useState(null)
  const [shown,        setShown]        = useState(false)
  const [shownSession, setShownSession] = useState('')

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
    setSearch('')

    setTimeout(() => {
      let data = TC_DATA[session] || []
      if (classFilter && classFilter !== 'All Classes') {
        data = data.filter(r => r.class_name === classFilter)
      }
      setRows(data)
      setShownSession(session)
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} TC records for session ${session}.`)
    }, 650)
  }, [session, classFilter])

  const handleReset = () => {
    setSession(''); setClassFilter('All Classes'); setRows([])
    setSearch(''); setErrors({}); setShown(false); setShownSession('')
  }

  // ── Excel Export placeholder ──────────────────────────────────────────────
  const handleExcel = () => {
    if (rows.length === 0) { showToast('No data to export. Show report first.', 'error'); return }
    setExporting(true)
    setTimeout(() => {
      setExporting(false)
      showToast('Excel export ready! (API integration pending)')
    }, 1200)
  }

  // ── Search filter ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      r.stu_name.toLowerCase().includes(q) ||
      r.tc_no.toLowerCase().includes(q) ||
      r.reg_no.toLowerCase().includes(q) ||
      r.class_name.toLowerCase().includes(q) ||
      r.withdrawn_reason.toLowerCase().includes(q)
    )
  }, [rows, search])

  // ── Summary stats ─────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const byReason = {}
    filtered.forEach(r => { byReason[r.withdrawn_reason] = (byReason[r.withdrawn_reason] || 0) + 1 })
    const topReason = Object.entries(byReason).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'
    return { total: filtered.length, topReason }
  }, [filtered])

  const hasResults   = shown && rows.length > 0
  const activeFilters = [session ? 1 : 0, classFilter !== 'All Classes' ? 1 : 0].reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Transfer Certificate Report
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            View, search and export TC records — issued certificates by session &amp; class.
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
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold text-white
                  bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
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
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {session ? `${session}${classFilter !== 'All Classes' ? ` · ${classFilter}` : ''}` : 'Select Filters'}
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
          <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      )}

      {/* ── Results ───────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* School Header */}
          <SchoolHeader session={shownSession} />

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={FileText}     label="Total TCs Issued"   value={stats.total}      color="blue"    />
            <SummaryCard icon={UserCheck}    label="Shown Session"       value={shownSession}     color="violet"  />
            <SummaryCard icon={ArrowUpRight} label="Top Reason"          value={stats.topReason}  color="amber"   />
            <SummaryCard icon={BookOpen}     label="Records Displayed"   value={filtered.length}  color="emerald" />
          </div>

          {/* Results card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">TC Records</span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">· {shownSession}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                  {filtered.length} record{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-60 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Name, TC no, reason…"
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
                Showing all TC records for the selected session. Use search to filter by student name, TC no., or withdrawal reason.
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
                      {['S.No.', 'TC No.', 'Reg. No.', 'Student Name', 'Class', 'Issued Date', 'Withdrawn Date', 'Reason', 'Session'].map((h, i) => (
                        <th key={i} className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:text-center first:w-10">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <DesktopRow key={row.tc_no} row={row} idx={i + 1} />
                    ))}
                  </tbody>
                  {/* Table Footer Summary */}
                  <tfoot>
                    <tr className="bg-blue-50 dark:bg-indigo-500/[0.07] border-t-2 border-blue-200 dark:border-indigo-500/30">
                      <td className="px-4 py-3 text-center text-[12px] text-blue-500 dark:text-blue-400">—</td>
                      <td className="px-4 py-3" colSpan={7}>
                        <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Total: {filtered.length} Transfer Certificate{filtered.length !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td />
                    </tr>
                  </tfoot>
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
                    Tap a card to see full TC details.
                  </p>

                  {filtered.map((row, i) => (
                    <MobileCard key={row.tc_no} row={row} idx={i + 1} />
                  ))}

                  {/* Mobile Grand Total */}
                  <div className="rounded-xl border-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07] p-4">
                    <p className="text-[12px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Summary
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{filtered.length}</p>
                        <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Total TCs</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-amber-700 dark:text-amber-300 tabular-nums">{shownSession}</p>
                        <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">Session</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Table Footer bar */}
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
            <FileText className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a session and click <strong>Show</strong> to load TC records.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
