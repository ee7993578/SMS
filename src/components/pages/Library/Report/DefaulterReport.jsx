/**
 * DefaulterReport.jsx
 * Folder: src/pages/Reports/Library/DefaulterReport.jsx
 *
 * Converts legacy ASPX "Library Defaulter Details" to fully-responsive React + Tailwind.
 *
 * Columns: S.No, Member ID, Item Acc No, Name, Class, Book Name, Issue Date, Return Date, Due Date
 * Features:
 *  - Category toggle (Student / Faculty)
 *  - Show report button + Excel export
 *  - Overdue days badge
 *  - Mobile: expandable cards
 *  - Desktop: dense ERP-style table
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye,
  AlertCircle, X, Check, Loader2, ChevronDown,
  BookOpen, UserCheck, GraduationCap, Briefcase,
  SlidersHorizontal, Search, FileSpreadsheet,
  Calendar, Clock, AlertTriangle, TrendingUp,
  ChevronRight, Building2, Info, Hash, BookMarked,
  Users, ShieldAlert
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

const STUDENT_DEFAULTERS = [
  { member_id: 'STU-1021', item_acc_no: 'ACC-3041', name: 'Aarav Sharma',      classname: 'Class IX-A',   book_name: 'Mathematics NCERT',       issue_date: '2025-03-01', return_date: '',           due_date: '2025-03-15' },
  { member_id: 'STU-1034', item_acc_no: 'ACC-2215', name: 'Priya Gupta',       classname: 'Class X-B',    book_name: 'Science Explorer Vol. 2',  issue_date: '2025-02-20', return_date: '',           due_date: '2025-03-06' },
  { member_id: 'STU-1078', item_acc_no: 'ACC-1187', name: 'Rohit Verma',       classname: 'Class VIII-A', book_name: 'English Literature',       issue_date: '2025-03-05', return_date: '',           due_date: '2025-03-19' },
  { member_id: 'STU-1102', item_acc_no: 'ACC-4422', name: 'Sneha Patel',       classname: 'Class VII-B',  book_name: 'History of India',         issue_date: '2025-02-28', return_date: '',           due_date: '2025-03-14' },
  { member_id: 'STU-1155', item_acc_no: 'ACC-3310', name: 'Karan Mehta',       classname: 'Class XI-A',   book_name: 'Physics Pradeep',          issue_date: '2025-01-15', return_date: '',           due_date: '2025-01-29' },
  { member_id: 'STU-1198', item_acc_no: 'ACC-5501', name: 'Anjali Singh',      classname: 'Class XII-B',  book_name: 'Chemistry HC Verma',       issue_date: '2025-01-22', return_date: '',           due_date: '2025-02-05' },
  { member_id: 'STU-1203', item_acc_no: 'ACC-2309', name: 'Vikas Yadav',       classname: 'Class VI-A',   book_name: 'Social Science NCERT',     issue_date: '2025-03-10', return_date: '',           due_date: '2025-03-24' },
  { member_id: 'STU-1247', item_acc_no: 'ACC-1045', name: 'Neha Joshi',        classname: 'Class X-A',    book_name: 'Hindi Vyakaran',           issue_date: '2025-02-14', return_date: '',           due_date: '2025-02-28' },
  { member_id: 'STU-1289', item_acc_no: 'ACC-6601', name: 'Amit Kumar',        classname: 'Class IX-B',   book_name: 'Biology NCERT',            issue_date: '2025-03-08', return_date: '',           due_date: '2025-03-22' },
  { member_id: 'STU-1312', item_acc_no: 'ACC-3872', name: 'Pooja Mishra',      classname: 'Class XII-A',  book_name: 'English Core NCERT',       issue_date: '2025-02-01', return_date: '',           due_date: '2025-02-15' },
  { member_id: 'STU-1345', item_acc_no: 'ACC-4450', name: 'Deepak Tiwari',     classname: 'Class XI-B',   book_name: 'Accountancy NCERT',        issue_date: '2025-01-10', return_date: '',           due_date: '2025-01-24' },
  { member_id: 'STU-1377', item_acc_no: 'ACC-2780', name: 'Riya Agarwal',      classname: 'Class VIII-B', book_name: 'Computer Science',         issue_date: '2025-03-03', return_date: '',           due_date: '2025-03-17' },
]

const FACULTY_DEFAULTERS = [
  { member_id: 'FAC-2001', item_acc_no: 'ACC-7711', name: 'Dr. Rakesh Sharma',   classname: 'Science Dept.',  book_name: 'Advanced Physics',          issue_date: '2025-01-05', return_date: '', due_date: '2025-02-05' },
  { member_id: 'FAC-2008', item_acc_no: 'ACC-8830', name: 'Mrs. Sunita Verma',   classname: 'English Dept.',  book_name: 'Oxford Grammar Guide',      issue_date: '2025-02-10', return_date: '', due_date: '2025-03-10' },
  { member_id: 'FAC-2015', item_acc_no: 'ACC-9920', name: 'Mr. Anil Kumar',      classname: 'Maths Dept.',    book_name: 'Number Theory & Algebra',   issue_date: '2024-12-20', return_date: '', due_date: '2025-01-20' },
  { member_id: 'FAC-2022', item_acc_no: 'ACC-6645', name: 'Mrs. Priya Singh',    classname: 'History Dept.',  book_name: 'Modern Indian History',     issue_date: '2025-02-25', return_date: '', due_date: '2025-03-25' },
  { member_id: 'FAC-2030', item_acc_no: 'ACC-5567', name: 'Mr. Suresh Gupta',   classname: 'Commerce Dept.', book_name: 'Financial Accounting',      issue_date: '2025-01-18', return_date: '', due_date: '2025-02-18' },
  { member_id: 'FAC-2041', item_acc_no: 'ACC-4489', name: 'Ms. Kavita Mishra',   classname: 'Geography Dept.','book_name': 'World Geography Atlas',   issue_date: '2025-03-01', return_date: '', due_date: '2025-04-01' },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/** Calculate overdue days from due_date to today */
const getOverdueDays = (dueDate) => {
  if (!dueDate) return 0
  const due = new Date(dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.floor((today - due) / (1000 * 60 * 60 * 24))
  return diff > 0 ? diff : 0
}

/** Format date string to dd-MMM-YYYY */
const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const SEVERITY_COLORS = {
  critical: { fg: '#dc2626', bg: '#fee2e2', label: 'Critical' },   // > 60 days
  high:     { fg: '#ea580c', bg: '#ffedd5', label: 'High' },       // 30-60 days
  medium:   { fg: '#d97706', bg: '#fef3c7', label: 'Medium' },     // 15-30 days
  low:      { fg: '#16a34a', bg: '#dcfce7', label: 'Low' },        // < 15 days
}

const getSeverity = (days) => {
  if (days > 60) return 'critical'
  if (days > 30) return 'high'
  if (days > 15) return 'medium'
  return 'low'
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

// ─── OVERDUE BADGE ────────────────────────────────────────────────────────────
function OverdueBadge({ dueDate, size = 'sm' }) {
  const days = getOverdueDays(dueDate)
  const sev = getSeverity(days)
  const { fg, bg } = SEVERITY_COLORS[sev]

  if (size === 'lg') {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[12px] font-bold"
        style={{ color: fg, background: bg }}
      >
        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
        {days}d overdue
      </span>
    )
  }

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold tabular-nums"
      style={{ color: fg, background: bg }}
    >
      <Clock className="w-3 h-3 flex-shrink-0" />
      {days}d
    </span>
  )
}

// ─── SUMMARY STAT CARD ────────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    rose:    'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
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
function SchoolHeader({ category }) {
  return (
    <div className="rounded-2xl border border-red-100 dark:border-[rgba(239,68,68,0.2)] bg-gradient-to-r from-red-50 via-white to-orange-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-6 py-5 text-center shadow-sm">
      <div className="flex items-center justify-center gap-2 mb-1">
        <Building2 className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
        <h2 className="text-[16px] sm:text-[18px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
          {SCHOOL_INFO.name}
        </h2>
      </div>
      <p className="text-[12px] text-slate-500 dark:text-slate-400 mb-2">{SCHOOL_INFO.address}</p>
      <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-rose-100 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/25">
        {category === 'Student'
          ? <GraduationCap className="w-4 h-4 text-rose-700 dark:text-rose-400" />
          : <Briefcase className="w-4 h-4 text-rose-700 dark:text-rose-400" />}
        <span className="text-[12px] font-bold text-rose-700 dark:text-rose-400">{category} Defaulters</span>
      </div>
      <p className="mt-2 text-[13px] font-bold uppercase tracking-widest text-rose-700 dark:text-rose-400">
        Library Defaulter Details
      </p>
    </div>
  )
}

// ─── CATEGORY TOGGLE ─────────────────────────────────────────────────────────
function CategoryToggle({ value, onChange }) {
  return (
    <div className="flex rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-slate-100 dark:bg-[#12162a] p-1 gap-1">
      {['Student', 'Faculty'].map((cat) => {
        const active = value === cat
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onChange(cat)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-[13px] font-semibold transition-all duration-200
              ${active
                ? 'bg-white dark:bg-[#1a1f35] text-rose-600 dark:text-rose-400 shadow-sm border border-slate-200 dark:border-[rgba(99,102,241,0.2)]'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
          >
            {cat === 'Student'
              ? <GraduationCap className={`w-4 h-4 ${active ? 'text-rose-500' : ''}`} />
              : <Briefcase className={`w-4 h-4 ${active ? 'text-rose-500' : ''}`} />}
            {cat}
          </button>
        )
      })}
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx }) {
  const overdueDays = getOverdueDays(row.due_date)
  const sev = getSeverity(overdueDays)
  const { fg, bg } = SEVERITY_COLORS[sev]

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      {/* S.No */}
      <td className="px-3 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-10">{idx}</td>

      {/* Member ID */}
      <td className="px-3 py-3">
        <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded-lg">
          <Hash className="w-3 h-3" />{row.member_id}
        </span>
      </td>

      {/* Acc No */}
      <td className="px-3 py-3">
        <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300 font-mono">{row.item_acc_no}</span>
      </td>

      {/* Name */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-gradient-to-br from-rose-400 to-orange-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
            {row.name.charAt(0)}
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.name}</span>
        </div>
      </td>

      {/* Class */}
      <td className="px-3 py-3">
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400 whitespace-nowrap">
          {row.classname}
        </span>
      </td>

      {/* Book Name */}
      <td className="px-3 py-3 max-w-[180px]">
        <div className="flex items-start gap-1.5">
          <BookMarked className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
          <span className="text-[12px] text-slate-600 dark:text-slate-300 leading-snug line-clamp-2">{row.book_name}</span>
        </div>
      </td>

      {/* Issue Date */}
      <td className="px-3 py-3 text-center">
        <span className="text-[12px] text-slate-500 dark:text-slate-400 whitespace-nowrap tabular-nums">{formatDate(row.issue_date)}</span>
      </td>

      {/* Return Date */}
      <td className="px-3 py-3 text-center">
        <span className="text-[12px] text-slate-400 dark:text-slate-500">{row.return_date ? formatDate(row.return_date) : '—'}</span>
      </td>

      {/* Due Date + Overdue */}
      <td className="px-3 py-3 text-center">
        <div className="flex flex-col items-center gap-1">
          <span className="text-[12px] font-semibold whitespace-nowrap tabular-nums" style={{ color: fg }}>{formatDate(row.due_date)}</span>
          <OverdueBadge dueDate={row.due_date} size="sm" />
        </div>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row, idx }) {
  const [expanded, setExpanded] = useState(false)
  const overdueDays = getOverdueDays(row.due_date)
  const sev = getSeverity(overdueDays)
  const { fg, bg } = SEVERITY_COLORS[sev]

  return (
    <div
      className="rounded-xl border bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm"
      style={{ borderColor: `${fg}30` }}
    >
      {/* Severity stripe */}
      <div className="h-1 w-full" style={{ background: fg }} />

      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Avatar */}
        <span className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-orange-500 flex items-center justify-center text-white text-[14px] font-bold flex-shrink-0">
          {row.name.charAt(0)}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{row.name}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
            <span className="font-semibold text-blue-600 dark:text-blue-400">{row.member_id}</span>
            &nbsp;·&nbsp;{row.classname}
          </p>
        </div>

        {/* Overdue badge */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span
            className="text-[16px] font-extrabold tabular-nums leading-tight"
            style={{ color: fg }}
          >
            {overdueDays}d
          </span>
          <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: fg }}>overdue</span>
        </div>

        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Book name preview */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <BookMarked className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="text-[12px] text-slate-600 dark:text-slate-300 line-clamp-1">{row.book_name}</span>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4 space-y-3">
          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-2">
            <InfoTile label="Accession No." value={row.item_acc_no} icon={<Hash className="w-3.5 h-3.5" />} />
            <InfoTile label="Class / Dept." value={row.classname} icon={<GraduationCap className="w-3.5 h-3.5" />} />
            <InfoTile label="Issue Date" value={formatDate(row.issue_date)} icon={<Calendar className="w-3.5 h-3.5" />} />
            <InfoTile
              label="Due Date"
              value={formatDate(row.due_date)}
              icon={<Clock className="w-3.5 h-3.5" />}
              valueStyle={{ color: fg, fontWeight: 700 }}
            />
          </div>

          {/* Overdue severity */}
          <div
            className="flex items-center justify-between px-3 py-2.5 rounded-xl"
            style={{ background: bg }}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: fg }} />
              <span className="text-[12px] font-bold" style={{ color: fg }}>
                {SEVERITY_COLORS[sev].label} overdue
              </span>
            </div>
            <span className="text-[20px] font-extrabold tabular-nums" style={{ color: fg }}>{overdueDays} days</span>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoTile({ label, value, icon, valueStyle }) {
  return (
    <div className="rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-[rgba(99,102,241,0.1)] p-2.5">
      <div className="flex items-center gap-1 text-slate-400 mb-1">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 leading-snug" style={valueStyle}>{value}</p>
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, category, setCategory, onShow, loading }) {
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
            <SlidersHorizontal className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Select Category</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-5">
          <Field label="Category" required>
            <CategoryToggle value={category} onChange={setCategory} />
          </Field>
        </div>
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={() => { onShow(); onClose() }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-rose-600 hover:bg-rose-700 disabled:opacity-70 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show Report
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function DefaulterReport() {
  const [category,     setCategory]     = useState('Student')
  const [rows,         setRows]         = useState([])
  const [loading,      setLoading]      = useState(false)
  const [exporting,    setExporting]    = useState(false)
  const [filterOpen,   setFilterOpen]   = useState(false)
  const [search,       setSearch]       = useState('')
  const [errors,       setErrors]       = useState({})
  const [toast,        setToast]        = useState(null)
  const [shown,        setShown]        = useState(false)
  const [shownCategory, setShownCategory] = useState('')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Fetch (simulate API) ──────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    if (!category) { setErrors({ category: 'Please select a category' }); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      const data = category === 'Student' ? STUDENT_DEFAULTERS : FACULTY_DEFAULTERS
      setRows(data)
      setShownCategory(category)
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} defaulter records for ${category}.`)
    }, 650)
  }, [category])

  const handleReset = () => {
    setRows([]); setSearch('')
    setErrors({}); setShown(false); setShownCategory('')
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
      r.name.toLowerCase().includes(q) ||
      r.member_id.toLowerCase().includes(q) ||
      r.book_name.toLowerCase().includes(q) ||
      r.classname.toLowerCase().includes(q) ||
      r.item_acc_no.toLowerCase().includes(q)
    )
  }, [rows, search])

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = filtered.length
    const critical = filtered.filter(r => getOverdueDays(r.due_date) > 60).length
    const maxOverdue = filtered.reduce((max, r) => {
      const d = getOverdueDays(r.due_date); return d > max ? d : max
    }, 0)
    const avgOverdue = total
      ? Math.round(filtered.reduce((s, r) => s + getOverdueDays(r.due_date), 0) / total)
      : 0
    return { total, critical, maxOverdue, avgOverdue }
  }, [filtered])

  const hasResults = shown && rows.length > 0

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            Defaulter Details
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Library books not returned by due date — Students &amp; Faculty.
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
          <span className="w-1 h-5 rounded-full bg-rose-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="col-span-2 lg:col-span-2">
              <Field label="Select Category" required>
                <CategoryToggle value={category} onChange={setCategory} />
              </Field>
            </div>

            <div />

            <div className="flex gap-2">
              <button type="button" onClick={handleShow} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold text-white
                  bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-500/20
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
            bg-rose-600 text-white shadow-md shadow-rose-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {category ? `${category} Defaulters` : 'Select Category'}
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
        category={category}
        setCategory={setCategory}
        onShow={handleShow}
        loading={loading}
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
          <SchoolHeader category={shownCategory} />

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={Users}        label="Total Defaulters"    value={stats.total}      color="blue"   />
            <SummaryCard icon={ShieldAlert}  label="Critical (60+ days)" value={stats.critical}   color="rose"   />
            <SummaryCard icon={AlertTriangle}label="Max Overdue Days"    value={`${stats.maxOverdue}d`} color="amber" />
            <SummaryCard icon={TrendingUp}   label="Avg Overdue Days"    value={`${stats.avgOverdue}d`} color="violet" />
          </div>

          {/* Results card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-rose-500 flex-shrink-0" />
                <BookOpen className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">
                  {shownCategory} Defaulters
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400 flex-shrink-0">
                  {filtered.length} record{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-56 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search name, ID, book…"
                  className="w-full pl-8 pr-7 py-1.5 text-[12px] rounded-lg border outline-none transition-all
                    bg-white text-slate-700 border-slate-200 placeholder-slate-300
                    focus:border-rose-400 focus:ring-2 focus:ring-rose-100
                    dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                    dark:placeholder-slate-600 dark:focus:border-rose-400"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Severity legend */}
            <div className="hidden sm:flex items-center gap-4 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-rose-50/20 dark:bg-rose-500/[0.03] flex-wrap">
              <div className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Overdue severity:</span>
              </div>
              {Object.entries(SEVERITY_COLORS).map(([key, { fg, bg, label }]) => (
                <span key={key} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold" style={{ color: fg, background: bg }}>
                  <Clock className="w-3 h-3" />
                  {label} {key === 'low' ? '(< 15d)' : key === 'medium' ? '(15–30d)' : key === 'high' ? '(30–60d)' : '(60d+)'}
                </span>
              ))}
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
                      {['S.No.', 'Member ID', 'Acc No.', 'Name', 'Class/Dept', 'Book Name', 'Issue Date', 'Return Date', 'Due Date'].map((h, i) => (
                        <th key={i} className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-10">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <DesktopRow key={`${row.member_id}-${row.item_acc_no}`} row={row} idx={i + 1} />
                    ))}
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
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap a card to see full details.
                  </p>
                  {filtered.map((row, i) => (
                    <MobileCard key={`${row.member_id}-${row.item_acc_no}`} row={row} idx={i + 1} />
                  ))}
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
                  className="text-[12px] text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1">
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
            <BookOpen className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select <strong>Student</strong> or <strong>Faculty</strong> and click <strong>Show</strong> to load defaulters.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
