/**
 * CharacterCertificateReport.jsx
 * Folder: src/pages/Student/Reports/CharacterCertificateReport.jsx
 *
 * Converts legacy ASPX "Character Certificate Report" to fully-responsive React + Tailwind.
 *
 * Columns: S.No, Registration No, Student Name, Class, Father Name, Mother Name, Address, DOB, Issued Date, Session
 * Features:
 *  - Session + Class dropdown filters
 *  - Search by name / reg no
 *  - Show report button + Excel export
 *  - School name / address header
 *  - Mobile: card-based layout with expandable details
 *  - Desktop: dense ERP-style data table
 *  - Toast notifications, loading skeleton, empty state
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye,
  AlertCircle, X, Check, Loader2, ChevronDown,
  SlidersHorizontal, Search, FileSpreadsheet,
  School2, MapPin, Building2, ChevronRight,
  User, Users, BookOpen, Calendar, Home,
  BadgeCheck, ClipboardList, Info, TrendingUp, Award
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────
const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CLASS_OPTIONS = [
  'All Classes', 'Nursery', 'LKG', 'UKG',
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X',
  'Class XI', 'Class XII',
]

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

const CERTIFICATE_DATA = [
  {
    id: 1,
    registration_no: 'SVN/2024/0001',
    student_name: 'Aarav Sharma',
    class_name: 'Class X',
    father_name: 'Ramesh Sharma',
    mother_name: 'Sunita Sharma',
    address: 'H.No. 42, Rajpur Road, Dehradun',
    dob: '12-Mar-2010',
    issue_date: '15-Jan-2025',
    session: '2024-25',
  },
  {
    id: 2,
    registration_no: 'SVN/2024/0002',
    student_name: 'Priya Negi',
    class_name: 'Class XII',
    father_name: 'Mohan Negi',
    mother_name: 'Kamla Negi',
    address: '7, Saharanpur Road, Dehradun',
    dob: '05-Jul-2008',
    issue_date: '20-Jan-2025',
    session: '2024-25',
  },
  {
    id: 3,
    registration_no: 'SVN/2024/0003',
    student_name: 'Rohit Thakur',
    class_name: 'Class IX',
    father_name: 'Suresh Thakur',
    mother_name: 'Geeta Thakur',
    address: '15, Karanpur, Dehradun',
    dob: '22-Nov-2010',
    issue_date: '22-Jan-2025',
    session: '2024-25',
  },
  {
    id: 4,
    registration_no: 'SVN/2024/0004',
    student_name: 'Anjali Singh',
    class_name: 'Class XI',
    father_name: 'Ajay Singh',
    mother_name: 'Meena Singh',
    address: 'Vasant Vihar, Dehradun',
    dob: '08-Feb-2009',
    issue_date: '25-Jan-2025',
    session: '2024-25',
  },
  {
    id: 5,
    registration_no: 'SVN/2024/0005',
    student_name: 'Vikram Rawat',
    class_name: 'Class VIII',
    father_name: 'Girish Rawat',
    mother_name: 'Anita Rawat',
    address: 'Indira Nagar, Dehradun',
    dob: '30-Sep-2011',
    issue_date: '28-Jan-2025',
    session: '2024-25',
  },
  {
    id: 6,
    registration_no: 'SVN/2024/0006',
    student_name: 'Sneha Bisht',
    class_name: 'Class X',
    father_name: 'Dinesh Bisht',
    mother_name: 'Rekha Bisht',
    address: 'Ballupur, Dehradun',
    dob: '17-Jun-2010',
    issue_date: '01-Feb-2025',
    session: '2024-25',
  },
  {
    id: 7,
    registration_no: 'SVN/2023/0041',
    student_name: 'Kartik Joshi',
    class_name: 'Class XII',
    father_name: 'Naresh Joshi',
    mother_name: 'Savita Joshi',
    address: 'Race Course, Dehradun',
    dob: '03-Apr-2007',
    issue_date: '10-Mar-2024',
    session: '2023-24',
  },
  {
    id: 8,
    registration_no: 'SVN/2023/0042',
    student_name: 'Pooja Chauhan',
    class_name: 'Class X',
    father_name: 'Vijay Chauhan',
    mother_name: 'Usha Chauhan',
    address: 'Clement Town, Dehradun',
    dob: '19-Aug-2008',
    issue_date: '12-Mar-2024',
    session: '2023-24',
  },
  {
    id: 9,
    registration_no: 'SVN/2023/0043',
    student_name: 'Arjun Mehta',
    class_name: 'Class IX',
    father_name: 'Sanjay Mehta',
    mother_name: 'Priti Mehta',
    address: 'Prem Nagar, Dehradun',
    dob: '25-Jan-2009',
    issue_date: '15-Mar-2024',
    session: '2023-24',
  },
  {
    id: 10,
    registration_no: 'SVN/2022/0018',
    student_name: 'Riya Gupta',
    class_name: 'Class XII',
    father_name: 'Anil Gupta',
    mother_name: 'Nisha Gupta',
    address: 'Dalanwala, Dehradun',
    dob: '11-Oct-2006',
    issue_date: '20-Apr-2023',
    session: '2022-23',
  },
  {
    id: 11,
    registration_no: 'SVN/2022/0019',
    student_name: 'Siddharth Verma',
    class_name: 'Class XI',
    father_name: 'Rakesh Verma',
    mother_name: 'Seema Verma',
    address: 'GMS Road, Dehradun',
    dob: '29-May-2007',
    issue_date: '22-Apr-2023',
    session: '2022-23',
  },
  {
    id: 12,
    registration_no: 'SVN/2025/0007',
    student_name: 'Meera Pant',
    class_name: 'Class VII',
    father_name: 'Harish Pant',
    mother_name: 'Lalita Pant',
    address: 'Sewla Khurd, Dehradun',
    dob: '14-Dec-2012',
    issue_date: '05-Feb-2025',
    session: '2024-25',
  },
]

// ─── CLASS COLOR HELPERS ───────────────────────────────────────────────────────
const CLASS_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' },
  { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#0891b2', bg: '#cffafe' },
  { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' },
  { fg: '#dc2626', bg: '#fee2e2' },
  { fg: '#0369a1', bg: '#e0f2fe' },
]
const classColor = (name = '') =>
  CLASS_COLORS[(name.charCodeAt(0) ?? 0) % CLASS_COLORS.length]

const classAbbr = (name = '') =>
  name.replace('Class ', '').slice(0, 3).toUpperCase()

// ─── PRIMITIVE COMPONENTS ──────────────────────────────────────────────────────

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
      {type === 'success'
        ? <Check className="w-4 h-4 flex-shrink-0" />
        : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// ─── SUMMARY STAT CARD ─────────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
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

// ─── SCHOOL HEADER BANNER ──────────────────────────────────────────────────────
function SchoolHeader({ session }) {
  return (
    <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-6 py-5 text-center shadow-sm">
      <div className="flex items-center justify-center gap-2 mb-1">
        <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <h2 className="text-[15px] sm:text-[17px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
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
        Character Certificate Report
      </p>
    </div>
  )
}

// ─── DETAIL BADGE (used in desktop table tooltips & mobile cards) ─────────────
function InfoPair({ icon: Icon, label, value, color = 'slate' }) {
  const iconColors = {
    slate:  'text-slate-400 dark:text-slate-500',
    blue:   'text-blue-500 dark:text-blue-400',
    emerald:'text-emerald-500 dark:text-emerald-400',
    amber:  'text-amber-500 dark:text-amber-400',
    violet: 'text-violet-500 dark:text-violet-400',
  }
  return (
    <div className="flex items-start gap-2">
      <Icon className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${iconColors[color]}`} />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</p>
        <p className="text-[12px] font-medium text-slate-700 dark:text-slate-200 break-words">{value}</p>
      </div>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ─────────────────────────────────────────────────────────
function DesktopRow({ row, idx }) {
  const { fg, bg } = classColor(row.class_name)
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      {/* S.No */}
      <td className="px-3 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-10">
        {idx}
      </td>

      {/* Reg No */}
      <td className="px-3 py-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-[11px] font-bold text-blue-700 dark:text-blue-300 font-mono tracking-wide">
          <BadgeCheck className="w-3 h-3 flex-shrink-0" />
          {row.registration_no}
        </span>
      </td>

      {/* Student Name */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-2.5">
          <span
            className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[11px] font-bold"
            style={{ background: bg, color: fg }}
          >
            {row.student_name.charAt(0)}
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
            {row.student_name}
          </span>
        </div>
      </td>

      {/* Class */}
      <td className="px-3 py-3 text-center">
        <span
          className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap"
          style={{ background: bg, color: fg }}
        >
          {classAbbr(row.class_name)}
        </span>
      </td>

      {/* Father Name */}
      <td className="px-3 py-3">
        <span className="text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.father_name}</span>
      </td>

      {/* Mother Name */}
      <td className="px-3 py-3">
        <span className="text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.mother_name}</span>
      </td>

      {/* Address */}
      <td className="px-3 py-3 max-w-[160px]">
        <span className="text-[12px] text-slate-500 dark:text-slate-400 line-clamp-2">{row.address}</span>
      </td>

      {/* DOB */}
      <td className="px-3 py-3 text-center">
        <span className="text-[12px] tabular-nums text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.dob}</span>
      </td>

      {/* Issued Date */}
      <td className="px-3 py-3 text-center">
        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 whitespace-nowrap tabular-nums">
          <Check className="w-3 h-3 flex-shrink-0" />
          {row.issue_date}
        </span>
      </td>

      {/* Session */}
      <td className="px-3 py-3 text-center">
        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 text-[11px] font-bold text-amber-700 dark:text-amber-400 whitespace-nowrap">
          {row.session}
        </span>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ───────────────────────────────────────────────────────────────
function MobileCard({ row, idx }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = classColor(row.class_name)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Card Header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Avatar */}
        <span
          className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-[14px] font-bold"
          style={{ background: bg, color: fg }}
        >
          {row.student_name.charAt(0)}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">
            {row.student_name}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
            <span className="font-mono">{row.registration_no}</span>
            <span className="opacity-40">·</span>
            <span
              className="px-1.5 py-0.5 rounded-md text-[10px] font-bold"
              style={{ background: bg, color: fg }}
            >
              {row.class_name}
            </span>
          </p>
        </div>

        {/* Issued badge */}
        <div className="flex flex-col items-end flex-shrink-0 gap-1">
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full whitespace-nowrap">
            {row.issue_date}
          </span>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full whitespace-nowrap">
            {row.session}
          </span>
        </div>

        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Expanded Detail */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4 space-y-3">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <InfoPair icon={User}      label="Father Name" value={row.father_name}    color="blue"    />
            <InfoPair icon={User}      label="Mother Name" value={row.mother_name}    color="violet"  />
            <InfoPair icon={Calendar}  label="Date of Birth" value={row.dob}          color="amber"   />
            <InfoPair icon={BadgeCheck}label="Issued Date" value={row.issue_date}     color="emerald" />
          </div>
          <div className="rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-[rgba(99,102,241,0.1)] p-3">
            <InfoPair icon={Home} label="Address" value={row.address} color="slate" />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ──────────────────────────────────────────────────────
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
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* Fields */}
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
          <Field label="Class">
            <NativeSelect
              value={classFilter}
              onChange={e => setClassFilter(e.target.value)}
            >
              {CLASS_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>
        </div>
        {/* Actions */}
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

// ─── LOADING SKELETON ──────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
      <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
      ))}
    </div>
  )
}

// ─── EMPTY STATE ───────────────────────────────────────────────────────────────
function EmptyState({ search, onClear }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-3 text-slate-400 dark:text-slate-600">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <Search className="w-7 h-7 opacity-40" />
      </div>
      <div className="text-center">
        <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">
          {search ? 'No records match your search.' : 'No certificates found.'}
        </p>
        {search && (
          <button onClick={onClear} className="mt-2 text-[12px] text-blue-600 dark:text-blue-400 hover:underline">
            Clear search
          </button>
        )}
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function CharacterCertificateReport() {
  const [session,     setSession]     = useState('')
  const [classFilter, setClassFilter] = useState('All Classes')
  const [rows,        setRows]        = useState([])
  const [loading,     setLoading]     = useState(false)
  const [exporting,   setExporting]   = useState(false)
  const [filterOpen,  setFilterOpen]  = useState(false)
  const [search,      setSearch]      = useState('')
  const [errors,      setErrors]      = useState({})
  const [toast,       setToast]       = useState(null)
  const [shown,       setShown]       = useState(false)
  const [shownSession, setShownSession] = useState('')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Fetch (simulate API) ───────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!session) err.session = 'Please select a session'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      // Filter by session + class
      let data = CERTIFICATE_DATA.filter(r => r.session === session)
      if (classFilter && classFilter !== 'All Classes') {
        data = data.filter(r => r.class_name === classFilter)
      }
      setRows(data)
      setShownSession(session)
      setShown(true)
      setLoading(false)
      if (data.length > 0) {
        showToast(`Loaded ${data.length} certificate record${data.length !== 1 ? 's' : ''} for ${session}.`)
      } else {
        showToast('No records found for the selected filters.', 'error')
      }
    }, 650)
  }, [session, classFilter])

  const handleReset = () => {
    setSession(''); setClassFilter('All Classes')
    setRows([]); setSearch('')
    setErrors({}); setShown(false); setShownSession('')
  }

  // ── Excel Export placeholder ───────────────────────────────────────────────
  const handleExport = () => {
    if (rows.length === 0) { showToast('No data to export. Show report first.', 'error'); return }
    setExporting(true)
    setTimeout(() => {
      setExporting(false)
      showToast('Excel export ready! (API integration pending)')
    }, 1200)
  }

  // ── Client-side search ─────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      r.student_name.toLowerCase().includes(q) ||
      r.registration_no.toLowerCase().includes(q) ||
      r.class_name.toLowerCase().includes(q) ||
      r.father_name.toLowerCase().includes(q)
    )
  }, [rows, search])

  const hasResults  = shown && rows.length > 0
  const activeCount = (session ? 1 : 0) + (classFilter !== 'All Classes' ? 1 : 0)

  // ── Distinct classes for summary ───────────────────────────────────────────
  const distinctClasses = useMemo(() =>
    [...new Set(filtered.map(r => r.class_name))].length,
  [filtered])

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Character Certificate Report
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            View and export character certificates issued to students by session.
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

      {/* ── DESKTOP Filter Card ────────────────────────────────────────────── */}
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

            {/* Class */}
            <Field label="Class">
              <NativeSelect value={classFilter} onChange={e => setClassFilter(e.target.value)}>
                {CLASS_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            {/* Spacer */}
            <div />

            {/* Action Buttons */}
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
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                title="Reset filters"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ──────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {session ? `${session}${classFilter !== 'All Classes' ? ` · ${classFilter}` : ''}` : 'Select Filters'}
          {activeCount > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeCount}</span>
          )}
        </button>
        {hasResults && (
          <button type="button" onClick={handleExport} disabled={exporting}
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
        classFilter={classFilter} setClassFilter={setClassFilter}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ────────────────────────────────────────────────── */}
      {loading && <LoadingSkeleton />}

      {/* ── Results Section ─────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* School Header Banner */}
          <SchoolHeader session={shownSession} />

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={ClipboardList} label="Total Certificates" value={filtered.length}   color="blue"    />
            <SummaryCard icon={Users}         label="Total Records"      value={rows.length}        color="emerald" />
            <SummaryCard icon={BookOpen}      label="Classes Covered"    value={distinctClasses}    color="violet"  />
            <SummaryCard icon={Award}         label="Session"            value={shownSession}        color="amber"   />
          </div>

          {/* Main Data Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header with Search */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <Award className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Certificate Records</span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">· {shownSession}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                  {filtered.length} record{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-60 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search name, reg no, class…"
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

            {/* Info hint bar */}
            <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <p className="text-[12px] text-blue-700 dark:text-blue-400">
                Character certificates issued to students for the selected session. Click Export Excel to download.
              </p>
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block overflow-x-auto">
              {filtered.length === 0 ? (
                <EmptyState search={search} onClear={() => setSearch('')} />
              ) : (
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                      {[
                        'S.No.', 'Reg No', 'Student Name', 'Class',
                        'Father Name', 'Mother Name', 'Address',
                        'DOB', 'Issued Date', 'Session'
                      ].map((h, i) => (
                        <th key={i}
                          className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-10">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <DesktopRow key={row.id} row={row} idx={i + 1} />
                    ))}
                  </tbody>
                  {/* Table Footer / Grand Count */}
                  <tfoot>
                    <tr className="border-t-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07]">
                      <td className="px-3 py-2.5 text-center text-[12px] text-blue-500 dark:text-blue-400">—</td>
                      <td className="px-3 py-2.5" colSpan={9}>
                        <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Total: {filtered.length} certificate{filtered.length !== 1 ? 's' : ''} issued
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>

            {/* ── MOBILE CARDS ── */}
            <div className="md:hidden p-4 space-y-3">
              {filtered.length === 0 ? (
                <EmptyState search={search} onClear={() => setSearch('')} />
              ) : (
                <>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap a card to see full details.
                  </p>

                  {filtered.map((row, i) => (
                    <MobileCard key={row.id} row={row} idx={i + 1} />
                  ))}

                  {/* Mobile Grand Total */}
                  <div className="rounded-xl border-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07] px-4 py-3">
                    <p className="text-[12px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Total: {filtered.length} certificate{filtered.length !== 1 ? 's' : ''} — {shownSession}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Table Footer Bar */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span>
                {' '}of{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{rows.length}</span>
                {' '}records
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

      {/* ── Initial Empty / No-Report State ─────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Award className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a session{' '}
              <span className="hidden sm:inline">and click <strong>Show</strong></span>
              <span className="sm:hidden">and tap <strong>Select Filters → Show Report</strong></span>
              {' '}to view character certificates.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
