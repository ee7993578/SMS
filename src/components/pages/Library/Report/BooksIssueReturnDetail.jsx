/**
 * BooksIssueReturnDetail.jsx
 * Folder: src/pages/Reports/Library/BooksIssueReturnDetail.jsx
 *
 * Converts legacy ASPX "Books Issue Return Detail" to fully-responsive React + Tailwind.
 *
 * Columns: S.No, Accession No, Book Name, Admission No/Member ID, Name, Class, Type, Issue Date, Due Date, Return Date
 * Features:
 *  - Session dropdown (required)
 *  - Member dropdown filter
 *  - Report type filter (Issue / Return / All)
 *  - Show + Export buttons with validation
 *  - Mobile: collapsible cards with expandable details
 *  - Desktop: dense ERP-style sticky-header table
 *  - Status badges (Returned / Overdue / Issued)
 *  - Summary stat cards
 *  - Search within results
 *  - Toast notifications
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye,
  AlertCircle, X, Check, Loader2, ChevronDown,
  SlidersHorizontal, Search, FileSpreadsheet,
  BookOpen, BookMarked, BookCheck, RotateCcw,
  CalendarDays, User, Hash, School, Layers,
  ChevronRight, Info, TrendingUp, Building2,
  MapPin, Clock, CheckCircle2, AlertTriangle,
  UserCircle2, BadgeCheck
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────
const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const MEMBERS = [
  { id: '0', label: '<- All Members ->' },
  { id: 'STU001', label: 'Aarav Sharma (STU001)' },
  { id: 'STU002', label: 'Priya Verma (STU002)' },
  { id: 'STU003', label: 'Rohit Singh (STU003)' },
  { id: 'STU004', label: 'Sneha Gupta (STU004)' },
  { id: 'STU005', label: 'Amit Tiwari (STU005)' },
  { id: 'TCH001', label: 'Mr. Ramesh Kumar (TCH001)' },
  { id: 'TCH002', label: 'Mrs. Sunita Patel (TCH002)' },
]

const REPORT_TYPES = [
  { value: 'All', label: 'All Records' },
  { value: 'Issue', label: 'Issue' },
  { value: 'Return', label: 'Return' },
]

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

// Dummy issue/return records
const DUMMY_DATA = {
  '2024-25': [
    { Accession_No: 'ACC-1001', Book_Name: 'Mathematics Part-I', Admission_No: 'STU001', Name: 'Aarav Sharma',    Class: 'Class X-A',   member_type: 'Student', issue_date: '2024-07-10', due_date: '2024-07-24', return_date: '2024-07-22', status: 'Returned' },
    { Accession_No: 'ACC-1042', Book_Name: 'Physics Concepts',   Admission_No: 'STU002', Name: 'Priya Verma',     Class: 'Class XI-A',  member_type: 'Student', issue_date: '2024-07-15', due_date: '2024-07-29', return_date: '',           status: 'Issued' },
    { Accession_No: 'ACC-0983', Book_Name: 'English Grammar',    Admission_No: 'STU003', Name: 'Rohit Singh',     Class: 'Class IX-B',  member_type: 'Student', issue_date: '2024-06-20', due_date: '2024-07-04', return_date: '',           status: 'Overdue' },
    { Accession_No: 'ACC-2011', Book_Name: 'History of India',   Admission_No: 'STU004', Name: 'Sneha Gupta',     Class: 'Class XII-A', member_type: 'Student', issue_date: '2024-07-01', due_date: '2024-07-15', return_date: '2024-07-14', status: 'Returned' },
    { Accession_No: 'ACC-3050', Book_Name: 'Chemistry Lab Manual', Admission_No: 'STU005', Name: 'Amit Tiwari',  Class: 'Class XI-B',  member_type: 'Student', issue_date: '2024-07-18', due_date: '2024-08-01', return_date: '',           status: 'Issued' },
    { Accession_No: 'ACC-0770', Book_Name: 'World Geography',    Admission_No: 'TCH001', Name: 'Mr. Ramesh Kumar', Class: 'Staff',      member_type: 'Teacher', issue_date: '2024-07-05', due_date: '2024-08-05', return_date: '2024-08-03', status: 'Returned' },
    { Accession_No: 'ACC-1199', Book_Name: 'Computer Science',   Admission_No: 'TCH002', Name: 'Mrs. Sunita Patel', Class: 'Staff',    member_type: 'Teacher', issue_date: '2024-07-20', due_date: '2024-08-20', return_date: '',           status: 'Issued' },
    { Accession_No: 'ACC-0445', Book_Name: 'Biology Class XII',  Admission_No: 'STU001', Name: 'Aarav Sharma',    Class: 'Class X-A',   member_type: 'Student', issue_date: '2024-08-01', due_date: '2024-08-15', return_date: '2024-08-13', status: 'Returned' },
    { Accession_No: 'ACC-0600', Book_Name: 'Economics Basics',   Admission_No: 'STU004', Name: 'Sneha Gupta',     Class: 'Class XII-A', member_type: 'Student', issue_date: '2024-06-25', due_date: '2024-07-09', return_date: '',           status: 'Overdue' },
    { Accession_No: 'ACC-0312', Book_Name: 'Hindi Sahitya',      Admission_No: 'STU002', Name: 'Priya Verma',     Class: 'Class XI-A',  member_type: 'Student', issue_date: '2024-08-05', due_date: '2024-08-19', return_date: '2024-08-18', status: 'Returned' },
    { Accession_No: 'ACC-1502', Book_Name: 'Political Science',  Admission_No: 'STU003', Name: 'Rohit Singh',     Class: 'Class IX-B',  member_type: 'Student', issue_date: '2024-07-30', due_date: '2024-08-13', return_date: '',           status: 'Issued' },
    { Accession_No: 'ACC-2200', Book_Name: 'Sanskrit Grammar',   Admission_No: 'STU005', Name: 'Amit Tiwari',     Class: 'Class XI-B',  member_type: 'Student', issue_date: '2024-08-10', due_date: '2024-08-24', return_date: '',           status: 'Issued' },
  ],
  '2025-26': [
    { Accession_No: 'ACC-1010', Book_Name: 'Advanced Mathematics', Admission_No: 'STU001', Name: 'Aarav Sharma',  Class: 'Class XI-A',  member_type: 'Student', issue_date: '2025-04-10', due_date: '2025-04-24', return_date: '2025-04-23', status: 'Returned' },
    { Accession_No: 'ACC-1055', Book_Name: 'Organic Chemistry',    Admission_No: 'STU002', Name: 'Priya Verma',   Class: 'Class XII-A', member_type: 'Student', issue_date: '2025-04-15', due_date: '2025-04-29', return_date: '',           status: 'Issued' },
    { Accession_No: 'ACC-0990', Book_Name: 'English Literature',   Admission_No: 'STU003', Name: 'Rohit Singh',   Class: 'Class X-A',   member_type: 'Student', issue_date: '2025-04-01', due_date: '2025-04-15', return_date: '',           status: 'Overdue' },
    { Accession_No: 'ACC-2020', Book_Name: 'Civics & Democracy',   Admission_No: 'STU004', Name: 'Sneha Gupta',   Class: 'Class XII-B', member_type: 'Student', issue_date: '2025-04-18', due_date: '2025-05-02', return_date: '2025-04-30', status: 'Returned' },
    { Accession_No: 'ACC-3100', Book_Name: 'Physics Practicals',   Admission_No: 'TCH001', Name: 'Mr. Ramesh Kumar', Class: 'Staff',    member_type: 'Teacher', issue_date: '2025-04-20', due_date: '2025-05-20', return_date: '',           status: 'Issued' },
    { Accession_No: 'ACC-0790', Book_Name: 'World Atlas 2025',     Admission_No: 'TCH002', Name: 'Mrs. Sunita Patel', Class: 'Staff',  member_type: 'Teacher', issue_date: '2025-04-12', due_date: '2025-05-12', return_date: '2025-05-10', status: 'Returned' },
    { Accession_No: 'ACC-1210', Book_Name: 'Data Structures',      Admission_No: 'STU005', Name: 'Amit Tiwari',   Class: 'Class XII-A', member_type: 'Student', issue_date: '2025-05-01', due_date: '2025-05-15', return_date: '',           status: 'Issued' },
    { Accession_No: 'ACC-0450', Book_Name: 'Biology Concepts',     Admission_No: 'STU001', Name: 'Aarav Sharma',  Class: 'Class XI-A',  member_type: 'Student', issue_date: '2025-05-05', due_date: '2025-05-19', return_date: '',           status: 'Overdue' },
  ],
  '2023-24': [
    { Accession_No: 'ACC-0800', Book_Name: 'Mathematics Class IX', Admission_No: 'STU001', Name: 'Aarav Sharma',  Class: 'Class IX-A',  member_type: 'Student', issue_date: '2023-07-12', due_date: '2023-07-26', return_date: '2023-07-25', status: 'Returned' },
    { Accession_No: 'ACC-0901', Book_Name: 'Science NCERT',        Admission_No: 'STU003', Name: 'Rohit Singh',   Class: 'Class VIII-A',member_type: 'Student', issue_date: '2023-07-20', due_date: '2023-08-03', return_date: '2023-08-01', status: 'Returned' },
    { Accession_No: 'ACC-1100', Book_Name: 'Social Studies',       Admission_No: 'STU004', Name: 'Sneha Gupta',   Class: 'Class XI-A',  member_type: 'Student', issue_date: '2023-08-01', due_date: '2023-08-15', return_date: '',           status: 'Overdue' },
    { Accession_No: 'ACC-1300', Book_Name: 'Accountancy Part I',   Admission_No: 'TCH001', Name: 'Mr. Ramesh Kumar', Class: 'Staff',    member_type: 'Teacher', issue_date: '2023-09-01', due_date: '2023-10-01', return_date: '2023-09-28', status: 'Returned' },
  ],
  '2022-23': [
    { Accession_No: 'ACC-0200', Book_Name: 'History Class X',      Admission_No: 'STU002', Name: 'Priya Verma',   Class: 'Class X-B',   member_type: 'Student', issue_date: '2022-07-10', due_date: '2022-07-24', return_date: '2022-07-23', status: 'Returned' },
    { Accession_No: 'ACC-0300', Book_Name: 'Geography Atlas',      Admission_No: 'STU005', Name: 'Amit Tiwari',   Class: 'Class IX-A',  member_type: 'Student', issue_date: '2022-08-05', due_date: '2022-08-19', return_date: '',           status: 'Overdue' },
  ],
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const formatDate = (str) => {
  if (!str) return '—'
  const d = new Date(str)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const STATUS_CONFIG = {
  Returned: {
    label: 'Returned',
    icon: CheckCircle2,
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    dot: 'bg-emerald-500',
  },
  Issued: {
    label: 'Issued',
    icon: BookMarked,
    classes: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
    dot: 'bg-blue-500',
  },
  Overdue: {
    label: 'Overdue',
    icon: AlertTriangle,
    classes: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
    dot: 'bg-rose-500',
  },
}

const MEMBER_TYPE_CONFIG = {
  Student: { classes: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400' },
  Teacher: { classes: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' },
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
          bg-white text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100
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

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Issued
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${cfg.classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

// ─── SUMMARY STAT CARDS ───────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    rose:    'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
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
function SchoolHeader({ session, reportType }) {
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
          <span className="text-[12px] font-bold text-blue-700 dark:text-blue-400">Report: {reportType}</span>
        </div>
      </div>
      <p className="mt-2 text-[13px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400">
        Book Issue / Return Details
      </p>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx }) {
  const memberTypeCfg = MEMBER_TYPE_CONFIG[row.member_type] || MEMBER_TYPE_CONFIG.Student
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      {/* S.No */}
      <td className="px-3 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-10">{idx}</td>

      {/* Accession No */}
      <td className="px-3 py-3">
        <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-600 dark:text-slate-300 font-mono">
          <Hash className="w-3 h-3 text-slate-400 flex-shrink-0" />
          {row.Accession_No}
        </span>
      </td>

      {/* Book Name */}
      <td className="px-3 py-3 max-w-[180px]">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 leading-tight line-clamp-2">{row.Book_Name}</span>
        </div>
      </td>

      {/* Admission No */}
      <td className="px-3 py-3 text-center">
        <span className="text-[12px] font-mono font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
          {row.Admission_No}
        </span>
      </td>

      {/* Name */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <UserCircle2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.Name}</span>
        </div>
      </td>

      {/* Class */}
      <td className="px-3 py-3 text-center">
        <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg whitespace-nowrap">
          {row.Class}
        </span>
      </td>

      {/* Type */}
      <td className="px-3 py-3 text-center">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold ${memberTypeCfg.classes}`}>
          {row.member_type}
        </span>
      </td>

      {/* Issue Date */}
      <td className="px-3 py-3 text-center">
        <span className="text-[12px] text-slate-600 dark:text-slate-300 tabular-nums whitespace-nowrap">{formatDate(row.issue_date)}</span>
      </td>

      {/* Due Date */}
      <td className="px-3 py-3 text-center">
        <span className={`text-[12px] tabular-nums whitespace-nowrap font-semibold
          ${row.status === 'Overdue' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-300'}`}>
          {formatDate(row.due_date)}
        </span>
      </td>

      {/* Return Date */}
      <td className="px-3 py-3 text-center">
        <span className={`text-[12px] tabular-nums whitespace-nowrap
          ${row.return_date ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400 dark:text-slate-600'}`}>
          {formatDate(row.return_date)}
        </span>
      </td>

      {/* Status */}
      <td className="px-3 py-3 text-center">
        <StatusBadge status={row.status} />
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row, idx }) {
  const [expanded, setExpanded] = useState(false)
  const cfg = STATUS_CONFIG[row.status] || STATUS_CONFIG.Issued
  const memberTypeCfg = MEMBER_TYPE_CONFIG[row.member_type] || MEMBER_TYPE_CONFIG.Student

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-start gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Book icon */}
        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <BookOpen className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight line-clamp-1">{row.Book_Name}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 font-mono">{row.Accession_No}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <StatusBadge status={row.status} />
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg ${memberTypeCfg.classes}`}>
              {row.member_type}
            </span>
          </div>
        </div>

        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 mt-0.5 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Member & Date preview row */}
      <div className="px-4 pb-3 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400">
          <User className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="font-semibold text-slate-700 dark:text-slate-200">{row.Name}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[12px] text-slate-400 dark:text-slate-500">
          <School className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{row.Class}</span>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4 space-y-3">

          {/* Member Info */}
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 p-3 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">Member Details</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Admission / ID</p>
                <p className="text-[13px] font-bold text-slate-700 dark:text-slate-200 font-mono mt-0.5">{row.Admission_No}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Name</p>
                <p className="text-[13px] font-bold text-slate-700 dark:text-slate-200 mt-0.5">{row.Name}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Class</p>
                <p className="text-[13px] font-semibold text-slate-600 dark:text-slate-300 mt-0.5">{row.Class}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Member Type</p>
                <span className={`inline-flex mt-1 text-[11px] font-bold px-2 py-0.5 rounded-lg ${memberTypeCfg.classes}`}>
                  {row.member_type}
                </span>
              </div>
            </div>
          </div>

          {/* Date Info */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-3 text-center">
              <CalendarDays className="w-4 h-4 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
              <p className="text-[11px] font-bold text-blue-700 dark:text-blue-300 leading-tight">{formatDate(row.issue_date)}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-blue-500 dark:text-blue-400 mt-1">Issued</p>
            </div>
            <div className={`rounded-xl border p-3 text-center
              ${row.status === 'Overdue'
                ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20'
                : 'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20'}`}>
              <Clock className={`w-4 h-4 mx-auto mb-1 ${row.status === 'Overdue' ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`} />
              <p className={`text-[11px] font-bold leading-tight ${row.status === 'Overdue' ? 'text-rose-700 dark:text-rose-300' : 'text-amber-700 dark:text-amber-300'}`}>
                {formatDate(row.due_date)}
              </p>
              <p className={`text-[10px] font-bold uppercase tracking-wide mt-1 ${row.status === 'Overdue' ? 'text-rose-500 dark:text-rose-400' : 'text-amber-500 dark:text-amber-400'}`}>Due</p>
            </div>
            <div className={`rounded-xl border p-3 text-center
              ${row.return_date
                ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20'
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-700/40'}`}>
              <RotateCcw className={`w-4 h-4 mx-auto mb-1 ${row.return_date ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
              <p className={`text-[11px] font-bold leading-tight ${row.return_date ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-400 dark:text-slate-600'}`}>
                {row.return_date ? formatDate(row.return_date) : 'Pending'}
              </p>
              <p className={`text-[10px] font-bold uppercase tracking-wide mt-1 ${row.return_date ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-400'}`}>Returned</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, filters, setFilters, onShow, loading, errors }) {
  if (!open) return null

  const { session, member, reportType } = filters

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

        <div className="px-5 py-4 space-y-4">
          <Field label="Session" error={errors.session} required>
            <NativeSelect
              value={session}
              onChange={e => setFilters(p => ({ ...p, session: e.target.value }))}
              placeholder="-- Select Session --"
              error={errors.session}
            >
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Member">
            <NativeSelect
              value={member}
              onChange={e => setFilters(p => ({ ...p, member: e.target.value }))}
            >
              {MEMBERS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Report Type">
            <NativeSelect
              value={reportType}
              onChange={e => setFilters(p => ({ ...p, reportType: e.target.value }))}
            >
              {REPORT_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
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

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
function EmptyState({ searching }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <BookMarked className="w-7 h-7 opacity-50" />
      </div>
      <div className="text-center">
        {searching ? (
          <>
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No matching records</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">Try adjusting your search query.</p>
          </>
        ) : (
          <>
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a session and click <strong>Show</strong> to load issue/return records.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function BooksIssueReturnDetail() {
  // Filter state
  const [filters, setFilters] = useState({ session: '', member: '0', reportType: 'All' })

  // Data & UI state
  const [rows,         setRows]         = useState([])
  const [loading,      setLoading]      = useState(false)
  const [exporting,    setExporting]    = useState(false)
  const [filterOpen,   setFilterOpen]   = useState(false)
  const [search,       setSearch]       = useState('')
  const [errors,       setErrors]       = useState({})
  const [toast,        setToast]        = useState(null)
  const [shown,        setShown]        = useState(false)
  const [shownFilters, setShownFilters] = useState({})

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Show Report ────────────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!filters.session) err.session = 'Please select a session'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      let data = DUMMY_DATA[filters.session] || []

      // Filter by member
      if (filters.member && filters.member !== '0') {
        data = data.filter(r => r.Admission_No === filters.member)
      }

      // Filter by report type
      if (filters.reportType === 'Issue') {
        data = data.filter(r => r.status !== 'Returned')
      } else if (filters.reportType === 'Return') {
        data = data.filter(r => r.status === 'Returned')
      }

      setRows(data)
      setShownFilters({ ...filters })
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} record${data.length !== 1 ? 's' : ''} for session ${filters.session}.`)
    }, 700)
  }, [filters])

  const handleReset = () => {
    setFilters({ session: '', member: '0', reportType: 'All' })
    setRows([]); setSearch(''); setErrors({}); setShown(false); setShownFilters({})
  }

  // ── Export ─────────────────────────────────────────────────────────────────
  const handleExport = () => {
    if (rows.length === 0) { showToast('No data to export. Show report first.', 'error'); return }
    setExporting(true)
    setTimeout(() => {
      setExporting(false)
      showToast('Excel export ready! (API integration pending)')
    }, 1200)
  }

  // ── Search filter ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search.trim()) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      r.Book_Name.toLowerCase().includes(q) ||
      r.Accession_No.toLowerCase().includes(q) ||
      r.Name.toLowerCase().includes(q) ||
      r.Admission_No.toLowerCase().includes(q) ||
      r.Class.toLowerCase().includes(q) ||
      r.member_type.toLowerCase().includes(q) ||
      r.status.toLowerCase().includes(q)
    )
  }, [rows, search])

  // ── Summary counts ─────────────────────────────────────────────────────────
  const summary = useMemo(() => ({
    total:    filtered.length,
    issued:   filtered.filter(r => r.status === 'Issued').length,
    returned: filtered.filter(r => r.status === 'Returned').length,
    overdue:  filtered.filter(r => r.status === 'Overdue').length,
  }), [filtered])

  const hasResults  = shown && rows.length > 0
  const activeCount = [filters.session, filters.member !== '0' && filters.member, filters.reportType !== 'All' && filters.reportType].filter(Boolean).length

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BookCheck className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Book Issue / Return Details
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Track all book issue and return transactions — session-wise, member-wise.
          </p>
        </div>
        {hasResults && (
          <button
            type="button"
            onClick={handleExport}
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

      {/* ── DESKTOP Filter Card ────────────────────────────────────────── */}
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
                value={filters.session}
                onChange={e => { setFilters(p => ({ ...p, session: e.target.value })); setErrors(p => ({ ...p, session: undefined })) }}
                placeholder="-- Select Session --"
                error={errors.session}
              >
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            {/* Member */}
            <Field label="Member">
              <NativeSelect
                value={filters.member}
                onChange={e => setFilters(p => ({ ...p, member: e.target.value }))}
              >
                {MEMBERS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
              </NativeSelect>
            </Field>

            {/* Report Type */}
            <Field label="Report Type">
              <NativeSelect
                value={filters.reportType}
                onChange={e => setFilters(p => ({ ...p, reportType: e.target.value }))}
              >
                {REPORT_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </NativeSelect>
            </Field>

            {/* Actions */}
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
                title="Reset filters"
                className="flex items-center justify-center px-3 py-2 rounded-xl text-[13px] font-semibold
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ──────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {filters.session ? `${filters.session} · ${filters.reportType}` : 'Set Filters'}
          {activeCount > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeCount}</span>
          )}
        </button>
        {hasResults && (
          <button type="button" onClick={handleExport} disabled={exporting}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm disabled:opacity-70">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
          </button>
        )}
        {shown && (
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
        setFilters={setFilters}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      )}

      {/* ── Results ─────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* School Header */}
          <SchoolHeader session={shownFilters.session} reportType={shownFilters.reportType} />

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={Layers}      label="Total Records"   value={summary.total}    color="blue"    />
            <SummaryCard icon={BookMarked}  label="Issued"          value={summary.issued}   color="amber"   />
            <SummaryCard icon={BookCheck}   label="Returned"        value={summary.returned} color="emerald" />
            <SummaryCard icon={AlertTriangle} label="Overdue"       value={summary.overdue}  color="rose"    />
          </div>

          {/* Results Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <BookCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Issue / Return Records</span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">· {shownFilters.session}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                  {filtered.length} record{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-64 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search book, member, status…"
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
                Overdue records have no return date past due date. Red due dates indicate overdue books.
              </p>
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block overflow-x-auto">
              {filtered.length === 0 ? (
                <EmptyState searching={!!search} />
              ) : (
                <table className="w-full">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/80 dark:bg-[#1a1f35]/90 backdrop-blur-sm">
                      {['S.No', 'Accession No', 'Book Name', 'Admission No', 'Name', 'Class', 'Type', 'Issue Date', 'Due Date', 'Return Date', 'Status'].map((h, i) => (
                        <th key={i} className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-10">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <DesktopRow key={`${row.Accession_No}-${i}`} row={row} idx={i + 1} />
                    ))}
                  </tbody>
                  {/* Footer summary */}
                  <tfoot>
                    <tr className="bg-blue-50 dark:bg-indigo-500/[0.07] border-t-2 border-blue-200 dark:border-indigo-500/30">
                      <td className="px-3 py-3 text-center text-[12px] text-blue-500 dark:text-blue-400">—</td>
                      <td colSpan={4} className="px-3 py-3">
                        <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Total: {filtered.length} record{filtered.length !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td colSpan={3} className="px-3 py-3 text-center">
                        <span className="text-[12px] text-slate-500 dark:text-slate-400">
                          Issued: <strong className="text-blue-700 dark:text-blue-300">{summary.issued}</strong>
                          &nbsp;·&nbsp; Returned: <strong className="text-emerald-700 dark:text-emerald-300">{summary.returned}</strong>
                          &nbsp;·&nbsp; Overdue: <strong className="text-rose-700 dark:text-rose-300">{summary.overdue}</strong>
                        </span>
                      </td>
                      <td colSpan={3} />
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>

            {/* ── MOBILE CARDS ── */}
            <div className="md:hidden p-4 space-y-3">
              {filtered.length === 0 ? (
                <EmptyState searching={!!search} />
              ) : (
                <>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap a card to see full details including dates.
                  </p>

                  {filtered.map((row, i) => (
                    <MobileCard key={`${row.Accession_No}-${i}`} row={row} idx={i + 1} />
                  ))}

                  {/* Mobile Grand Summary */}
                  <div className="rounded-xl border-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07] p-4">
                    <p className="text-[12px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Summary — {filtered.length} Records
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{summary.issued}</p>
                        <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Issued</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">{summary.returned}</p>
                        <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Returned</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-rose-700 dark:text-rose-300 tabular-nums">{summary.overdue}</p>
                        <p className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">Overdue</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span>
                {' '}of{' '}
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

      {/* ── Empty State (no report yet) ──────────────────────────────────── */}
      {!hasResults && !loading && <EmptyState searching={false} />}

      {/* ── Toast ────────────────────────────────────────────────────────── */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
