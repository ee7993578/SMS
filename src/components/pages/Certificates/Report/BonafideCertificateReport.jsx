/**
 * BonafideCertificateReport.jsx
 * Folder: src/pages/Student/Reports/BonafideCertificateReport.jsx
 *
 * Converts legacy ASPX "Bonafide Certificate Report" to fully-responsive React + Tailwind.
 *
 * Columns: S.No, Registration No, Student Name, Class, Father Name, Mother Name, Address, DOB, Issued Date
 * Features:
 *  - Session + Class filter
 *  - Show report + Excel export
 *  - School name/session header
 *  - Mobile: collapsible cards with expandable details
 *  - Desktop: dense ERP-style table
 *  - Search by name / registration
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye,
  AlertCircle, X, Check, Loader2, ChevronDown,
  SlidersHorizontal, Search, FileSpreadsheet,
  BookOpen, Building2, MapPin, User,
  CalendarDays, GraduationCap, ChevronRight,
  ScrollText, Users, BadgeCheck, Phone,
  TrendingUp, Info, BarChart3
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ────────────────────────────────────────────────────────
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

const BONAFIDE_DATA = [
  {
    id: 1, registration_no: 'SVM2024001', student_name: 'Aarav Sharma',
    class_name: 'Class X', father_name: 'Ramesh Sharma', mother_name: 'Sunita Sharma',
    address: '12, Rajpur Road, Dehradun', dob: '2009-03-15', issue_date: '2024-04-01',
  },
  {
    id: 2, registration_no: 'SVM2024002', student_name: 'Priya Verma',
    class_name: 'Class IX', father_name: 'Suresh Verma', mother_name: 'Rekha Verma',
    address: '45, Saharanpur Road, Dehradun', dob: '2010-07-22', issue_date: '2024-04-03',
  },
  {
    id: 3, registration_no: 'SVM2024003', student_name: 'Rohit Gupta',
    class_name: 'Class XI', father_name: 'Mahesh Gupta', mother_name: 'Kavita Gupta',
    address: '8, Haridwar Road, Rishikesh', dob: '2008-11-10', issue_date: '2024-04-05',
  },
  {
    id: 4, registration_no: 'SVM2024004', student_name: 'Sneha Patel',
    class_name: 'Class VIII', father_name: 'Dinesh Patel', mother_name: 'Meena Patel',
    address: '23, Clock Tower, Dehradun', dob: '2011-01-30', issue_date: '2024-04-07',
  },
  {
    id: 5, registration_no: 'SVM2024005', student_name: 'Arjun Singh',
    class_name: 'Class XII', father_name: 'Harpal Singh', mother_name: 'Gurpreet Kaur',
    address: '56, GMS Road, Dehradun', dob: '2007-06-18', issue_date: '2024-04-10',
  },
  {
    id: 6, registration_no: 'SVM2024006', student_name: 'Kavya Joshi',
    class_name: 'Class X', father_name: 'Naresh Joshi', mother_name: 'Pushpa Joshi',
    address: '77, Ballupur, Dehradun', dob: '2009-09-05', issue_date: '2024-04-12',
  },
  {
    id: 7, registration_no: 'SVM2024007', student_name: 'Vikram Rawat',
    class_name: 'Class VII', father_name: 'Mohan Rawat', mother_name: 'Geeta Rawat',
    address: '34, Rispana Bridge, Dehradun', dob: '2012-02-14', issue_date: '2024-04-15',
  },
  {
    id: 8, registration_no: 'SVM2024008', student_name: 'Ananya Bisht',
    class_name: 'Class IX', father_name: 'Lalit Bisht', mother_name: 'Seema Bisht',
    address: '19, Dalanwala, Dehradun', dob: '2010-12-25', issue_date: '2024-04-18',
  },
  {
    id: 9, registration_no: 'SVM2024009', student_name: 'Devansh Tiwari',
    class_name: 'Class VI', father_name: 'Anil Tiwari', mother_name: 'Nisha Tiwari',
    address: '62, Patel Nagar, Dehradun', dob: '2012-08-08', issue_date: '2024-04-20',
  },
  {
    id: 10, registration_no: 'SVM2024010', student_name: 'Riya Chauhan',
    class_name: 'Class XI', father_name: 'Deepak Chauhan', mother_name: 'Anjali Chauhan',
    address: '3, Turner Road, Dehradun', dob: '2008-04-19', issue_date: '2024-04-22',
  },
  {
    id: 11, registration_no: 'SVM2024011', student_name: 'Aditya Negi',
    class_name: 'Class XII', father_name: 'Bhagwan Negi', mother_name: 'Kamla Negi',
    address: '88, Vasant Vihar, Dehradun', dob: '2007-10-03', issue_date: '2024-04-25',
  },
  {
    id: 12, registration_no: 'SVM2024012', student_name: 'Pooja Rana',
    class_name: 'Class VIII', father_name: 'Vijay Rana', mother_name: 'Sarita Rana',
    address: '15, Race Course, Dehradun', dob: '2011-05-27', issue_date: '2024-04-28',
  },
  {
    id: 13, registration_no: 'SVM2024013', student_name: 'Shubham Dobhal',
    class_name: 'Class X', father_name: 'Ramesh Dobhal', mother_name: 'Usha Dobhal',
    address: '41, Survey Chowk, Dehradun', dob: '2009-07-11', issue_date: '2024-05-01',
  },
  {
    id: 14, registration_no: 'SVM2024014', student_name: 'Tanvi Arora',
    class_name: 'Class VII', father_name: 'Sanjay Arora', mother_name: 'Renu Arora',
    address: '29, Chukkuwala, Dehradun', dob: '2012-03-02', issue_date: '2024-05-03',
  },
  {
    id: 15, registration_no: 'SVM2024015', student_name: 'Harsh Bhatt',
    class_name: 'Class VI', father_name: 'Girish Bhatt', mother_name: 'Rekha Bhatt',
    address: '7, Karanpur, Dehradun', dob: '2013-01-16', issue_date: '2024-05-05',
  },
]

// ─── HELPERS ───────────────────────────────────────────────────────────────────
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

const formatDate = (d) => {
  if (!d) return '—'
  const dt = new Date(d)
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatAbbr = (name = '') =>
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
function SchoolHeader({ session, classFilter }) {
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
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25">
          <span className="text-[12px] font-bold text-amber-700 dark:text-amber-400">Session: {session}</span>
        </div>
        {classFilter && classFilter !== 'All Classes' && (
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-blue-100 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/25">
            <span className="text-[12px] font-bold text-blue-700 dark:text-blue-400">{classFilter}</span>
          </div>
        )}
      </div>
      <p className="mt-2 text-[13px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400">
        Bonafide Certificate Report
      </p>
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
        <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 rounded-lg whitespace-nowrap">
          <BadgeCheck className="w-3.5 h-3.5 flex-shrink-0" />
          {row.registration_no}
        </span>
      </td>

      {/* Student Name */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-2.5 min-w-[140px]">
          <div
            className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold"
            style={{ background: bg, color: fg }}
          >
            {row.student_name.charAt(0)}
          </div>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{row.student_name}</span>
        </div>
      </td>

      {/* Class */}
      <td className="px-3 py-3 text-center">
        <span
          className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap"
          style={{ background: bg, color: fg }}
        >
          {formatAbbr(row.class_name)}
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
      <td className="px-3 py-3 max-w-[180px]">
        <span className="text-[12px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{row.address}</span>
      </td>

      {/* DOB */}
      <td className="px-3 py-3 text-center whitespace-nowrap">
        <span className="inline-flex items-center gap-1 text-[12px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg">
          <CalendarDays className="w-3 h-3 flex-shrink-0 text-slate-400" />
          {formatDate(row.dob)}
        </span>
      </td>

      {/* Issued Date */}
      <td className="px-3 py-3 text-center whitespace-nowrap">
        <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg">
          <Check className="w-3 h-3 flex-shrink-0" />
          {formatDate(row.issue_date)}
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
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-[13px] font-bold"
          style={{ background: bg, color: fg }}
        >
          {row.student_name.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">
            {row.student_name}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
            <span className="font-semibold text-blue-600 dark:text-blue-400">{row.registration_no}</span>
            &nbsp;·&nbsp;{row.class_name}
          </p>
        </div>

        {/* Issued badge */}
        <div className="flex flex-col items-end flex-shrink-0 mr-1">
          <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">Issued</span>
          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">{formatDate(row.issue_date)}</span>
        </div>

        <ChevronRight className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4">
          {/* Detail grid */}
          <div className="grid grid-cols-1 gap-2.5">

            {/* Father & Mother in one row */}
            <div className="grid grid-cols-2 gap-2">
              <DetailChip icon={User} label="Father" value={row.father_name} color="blue" />
              <DetailChip icon={User} label="Mother" value={row.mother_name} color="violet" />
            </div>

            {/* DOB & Class */}
            <div className="grid grid-cols-2 gap-2">
              <DetailChip icon={CalendarDays} label="Date of Birth" value={formatDate(row.dob)} color="amber" />
              <DetailChip icon={GraduationCap} label="Class" value={row.class_name} color="emerald" />
            </div>

            {/* Address — full width */}
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Address
              </p>
              <p className="text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed">{row.address}</p>
            </div>

            {/* Issue date — highlighted */}
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-3 flex items-center gap-3">
              <BadgeCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">Certificate Issued On</p>
                <p className="text-[14px] font-bold text-emerald-700 dark:text-emerald-300">{formatDate(row.issue_date)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DetailChip({ icon: Icon, label, value, color }) {
  const colors = {
    blue:    'bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400',
    violet:  'bg-violet-50 dark:bg-violet-500/10 border-violet-100 dark:border-violet-500/20 text-violet-600 dark:text-violet-400',
    amber:   'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20 text-amber-600 dark:text-amber-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
  }
  return (
    <div className={`rounded-xl border p-2.5 ${colors[color]}`}>
      <p className="text-[10px] font-bold uppercase tracking-wide opacity-70 mb-0.5 flex items-center gap-1">
        <Icon className="w-3 h-3 flex-shrink-0" />{label}
      </p>
      <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 leading-tight truncate">{value}</p>
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
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
            Cancel
          </button>
          <button type="button" onClick={() => { onShow(); onClose() }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-70">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show Report
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function BonafideCertificateReport() {
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
  const [shownClass,   setShownClass]   = useState('')

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
      let data = [...BONAFIDE_DATA]
      if (classFilter && classFilter !== 'All Classes') {
        data = data.filter(r => r.class_name === classFilter)
      }
      setRows(data)
      setShownSession(session)
      setShownClass(classFilter)
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} records for session ${session}.`)
    }, 650)
  }, [session, classFilter])

  const handleReset = () => {
    setSession(''); setClassFilter('All Classes')
    setRows([]); setSearch('')
    setErrors({}); setShown(false)
    setShownSession(''); setShownClass('')
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
      r.student_name.toLowerCase().includes(q) ||
      r.registration_no.toLowerCase().includes(q) ||
      r.class_name.toLowerCase().includes(q) ||
      r.father_name.toLowerCase().includes(q)
    )
  }, [rows, search])

  const hasResults   = shown && rows.length > 0
  const activeFilters = [session, classFilter !== 'All Classes' ? classFilter : ''].filter(Boolean).length

  // ── Unique classes for summary ────────────────────────────────────────────
  const uniqueClasses = useMemo(() => [...new Set(filtered.map(r => r.class_name))].length, [filtered])

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Bonafide Certificate Report
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            View and export issued bonafide certificates — session-wise &amp; class-wise.
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

      {/* ── DESKTOP Filter Card ───────────────────────────────────────────── */}
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

      {/* ── MOBILE Filter Bar ────────────────────────────────────────────── */}
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

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* School Header */}
          <SchoolHeader session={shownSession} classFilter={shownClass} />

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={Users}       label="Total Certificates" value={filtered.length}  color="blue"    />
            <SummaryCard icon={GraduationCap} label="Classes Covered"  value={uniqueClasses}    color="violet"  />
            <SummaryCard icon={BadgeCheck}  label="Session"            value={shownSession}     color="emerald" />
            <SummaryCard icon={ScrollText}  label="Records Shown"      value={rows.length}      color="amber"   />
          </div>

          {/* Results Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Certificate Records</span>
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

            {/* Info hint */}
            <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <p className="text-[12px] text-blue-700 dark:text-blue-400">
                Showing bonafide certificates issued for session {shownSession}. Use search to filter by name, registration no, or class.
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
                      {[
                        'S.No.', 'Reg. No.', 'Student Name', 'Class',
                        'Father Name', 'Mother Name', 'Address', 'DOB', 'Issued Date'
                      ].map((h, i) => (
                        <th key={i} className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-10">
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
                    Tap any card to see full certificate details.
                  </p>
                  {filtered.map((row, i) => (
                    <MobileCard key={row.id} row={row} idx={i + 1} />
                  ))}

                  {/* Mobile Summary Footer */}
                  <div className="rounded-xl border-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07] p-4">
                    <p className="text-[12px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Summary — {filtered.length} Certificates
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{filtered.length}</p>
                        <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Total Issued</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-violet-700 dark:text-violet-300 tabular-nums">{uniqueClasses}</p>
                        <p className="text-[10px] font-semibold text-violet-600 dark:text-violet-400">Classes</p>
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
            <BarChart3 className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a session and click <strong>Show</strong> to view bonafide certificate records.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
