/**
 * NewStudentReport.jsx
 * Folder: src/pages/Student/Reports/NewStudentReport.jsx
 *
 * Converts legacy ASPX "New Student Report" to fully-responsive React + Tailwind.
 *
 * Columns: S.No, Adm No., Name, Father Name, DOB, Address, Class, Section,
 *          Date of Reg., Date of Adm., Mobile, Gender, Reg. Fee
 * Features:
 *  - Session + Class dropdown filters
 *  - From Date / To Date pickers
 *  - Show Report button
 *  - Excel export placeholder
 *  - Summary stats (total students, male, female, total reg fee)
 *  - Desktop: dense ERP-style scrollable table
 *  - Mobile: expandable cards with full details
 *  - Mobile filter drawer
 *  - Search bar (name / adm no / class)
 *  - Loading skeleton + empty state
 *  - Toast notifications
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye,
  AlertCircle, X, Check, Loader2, ChevronDown,
  Users, UserCheck, UserX,
  SlidersHorizontal, Info, Search,
  FileSpreadsheet, BookOpen,
  School2, TrendingUp, Wallet,
  MapPin, Building2, ChevronRight,
  Calendar, Phone, GraduationCap,
  User, Home, IdCard, Layers
} from 'lucide-react'

// ─── SESSIONS & CLASSES ───────────────────────────────────────────────────────
const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']
const CLASSES  = [
  'All', 'Nursery', 'LKG', 'UKG',
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII',
  'Class IX', 'Class X', 'Class XI', 'Class XII',
]

const SCHOOL_INFO = {
  name:    'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

// ─── DUMMY DATA ───────────────────────────────────────────────────────────────
const generateStudents = (session) => {
  const classData = [
    { class: 'Nursery',    section: 'A', base: 1001 },
    { class: 'Nursery',    section: 'B', base: 1031 },
    { class: 'LKG',        section: 'A', base: 1061 },
    { class: 'LKG',        section: 'B', base: 1081 },
    { class: 'UKG',        section: 'A', base: 1101 },
    { class: 'Class I',    section: 'A', base: 1201 },
    { class: 'Class I',    section: 'B', base: 1221 },
    { class: 'Class II',   section: 'A', base: 1301 },
    { class: 'Class III',  section: 'A', base: 1401 },
    { class: 'Class IV',   section: 'A', base: 1501 },
    { class: 'Class V',    section: 'A', base: 1601 },
    { class: 'Class VI',   section: 'A', base: 1701 },
    { class: 'Class VI',   section: 'B', base: 1721 },
    { class: 'Class VII',  section: 'A', base: 1801 },
    { class: 'Class VIII', section: 'A', base: 1901 },
    { class: 'Class IX',   section: 'A', base: 2001 },
    { class: 'Class X',    section: 'A', base: 2101 },
    { class: 'Class XI',   section: 'A', base: 2201 },
    { class: 'Class XII',  section: 'A', base: 2301 },
  ]

  const firstNames = [
    'Aarav','Ananya','Rohan','Priya','Arjun','Sneha','Rahul','Pooja',
    'Vivek','Divya','Amit','Neha','Raj','Sanya','Kiran','Meera',
    'Suresh','Kavya','Nikhil','Tanvi','Deepak','Riya','Vikram','Shruti',
    'Aditya','Simran','Harshit','Ishita','Mohit','Preeti',
  ]
  const fatherNames = [
    'Ramesh Kumar','Sunil Sharma','Ajay Verma','Manoj Singh','Pankaj Gupta',
    'Rajesh Tiwari','Ashok Yadav','Vijay Mishra','Sanjay Pandey','Anil Joshi',
    'Rakesh Chauhan','Dinesh Rawat','Pramod Negi','Subhash Bisht','Hemant Bora',
  ]
  const addresses = [
    'Rajpur Road, Dehradun','Saharanpur Road, Dehradun','Haridwar Road, Rishikesh',
    'Clock Tower, Dehradun','Premnagar, Dehradun','Balliwala, Dehradun',
    'Clement Town, Dehradun','Raipur Road, Dehradun','Vasant Vihar, Dehradun',
    'Dharampur, Dehradun',
  ]
  const genders = ['Male', 'Female']

  const yearShort = session.slice(0, 4).slice(2)
  let students    = []
  let sno         = 1

  classData.forEach(({ class: cls, section, base }) => {
    const count = Math.floor(Math.random() * 6) + 4
    for (let i = 0; i < count; i++) {
      const isMale   = Math.random() > 0.45
      const fn       = firstNames[Math.floor(Math.random() * firstNames.length)]
      const dob_year = 2005 + Math.floor(Math.random() * 12)
      const dob_mon  = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')
      const dob_day  = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')
      const reg_mon  = String(Math.floor(Math.random() * 4) + 1).padStart(2, '0')
      const reg_day  = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')
      const adm_mon  = String(parseInt(reg_mon) + 1).padStart(2, '0')
      const regYear  = `20${yearShort}`
      const regFee   = [500, 600, 750, 800, 1000][Math.floor(Math.random() * 5)]

      students.push({
        sno:               sno++,
        registration_no:   `${base + i}/${yearShort}`,
        name:              fn + ' ' + (isMale ? 'Kumar' : 'Kumari'),
        father_name:       fatherNames[Math.floor(Math.random() * fatherNames.length)],
        DOB:               `${dob_day}/${dob_mon}/${dob_year}`,
        R_Address:         addresses[Math.floor(Math.random() * addresses.length)],
        class:             cls,
        section:           section,
        registration_date: `${reg_day}/${reg_mon}/${regYear}`,
        doa:               `${reg_day}/${adm_mon}/${regYear}`,
        mobile:            `9${String(Math.floor(Math.random() * 900000000) + 100000000)}`,
        gender:            isMale ? 'Male' : 'Female',
        reg_fee:           regFee,
      })
    }
  })

  return students
}

const STUDENT_DATA = {
  '2022-23': generateStudents('2022-23'),
  '2023-24': generateStudents('2023-24'),
  '2024-25': generateStudents('2024-25'),
  '2025-26': generateStudents('2025-26'),
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
const classColor = (name = '') =>
  CLASS_COLORS[(name.charCodeAt(0) ?? 0) % CLASS_COLORS.length]

const formatAbbr = (name = '') =>
  name.replace('Class ', '').slice(0, 3).toUpperCase()

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

function DateInput({ value, onChange, error, disabled, placeholder }) {
  return (
    <input
      type="date"
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      className={`w-full pl-3 pr-3 py-2 text-[13px] rounded-lg border outline-none transition-all
        bg-white text-slate-800
        focus:border-blue-400 focus:ring-2 focus:ring-blue-100
        dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
        disabled:opacity-50 disabled:cursor-not-allowed
        ${error
          ? 'border-rose-400 ring-2 ring-rose-100'
          : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'
        }`}
    />
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
    cyan:    'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400',
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
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── SCHOOL HEADER BANNER ─────────────────────────────────────────────────────
function SchoolHeader({ session, fromDate, toDate }) {
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
        {(fromDate || toDate) && (
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-blue-100 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/25">
            <Calendar className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            <span className="text-[12px] font-bold text-blue-700 dark:text-blue-400">
              {fromDate || '—'} to {toDate || '—'}
            </span>
          </div>
        )}
      </div>
      <p className="mt-2 text-[13px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400">
        New Student Registration Report
      </p>
    </div>
  )
}

// ─── GENDER BADGE ─────────────────────────────────────────────────────────────
function GenderBadge({ gender }) {
  return gender === 'Male'
    ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">♂ Male</span>
    : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">♀ Female</span>
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, isTotal }) {
  if (isTotal) {
    return (
      <tr className="bg-blue-50 dark:bg-indigo-500/[0.07] border-t-2 border-blue-200 dark:border-indigo-500/30">
        <td className="px-3 py-3 text-center text-[12px] text-blue-500 dark:text-blue-400">—</td>
        <td className="px-3 py-3 text-center text-[12px] text-blue-500 dark:text-blue-400">—</td>
        <td className="px-3 py-3" colSpan={9}>
          <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Grand Total — {row.count} Students
          </span>
        </td>
        <td className="px-3 py-3 text-center">
          <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-[13px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 tabular-nums">
            ₹{row.reg_fee.toLocaleString()}
          </span>
        </td>
      </tr>
    )
  }

  const { fg, bg } = classColor(row.class)

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      {/* S.No */}
      <td className="px-3 py-2.5 text-center text-[12px] text-slate-400 tabular-nums w-10">{row.sno}</td>

      {/* Adm No */}
      <td className="px-3 py-2.5">
        <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-blue-700 dark:text-blue-400 font-mono whitespace-nowrap">
          <IdCard className="w-3 h-3 flex-shrink-0" />
          {row.registration_no}
        </span>
      </td>

      {/* Name */}
      <td className="px-3 py-2.5">
        <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap">{row.name}</span>
      </td>

      {/* Father Name */}
      <td className="px-3 py-2.5">
        <span className="text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.father_name}</span>
      </td>

      {/* DOB */}
      <td className="px-3 py-2.5 text-center">
        <span className="text-[12px] text-slate-500 dark:text-slate-400 whitespace-nowrap tabular-nums">{row.DOB}</span>
      </td>

      {/* Address */}
      <td className="px-3 py-2.5 max-w-[160px]">
        <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{row.R_Address}</span>
      </td>

      {/* Class */}
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span
            className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[9px] font-bold"
            style={{ background: bg, color: fg }}
          >
            {formatAbbr(row.class)}
          </span>
          <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.class}</span>
        </div>
      </td>

      {/* Section */}
      <td className="px-3 py-2.5 text-center">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-[12px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          {row.section}
        </span>
      </td>

      {/* Date of Reg */}
      <td className="px-3 py-2.5 text-center">
        <span className="text-[12px] text-slate-500 dark:text-slate-400 whitespace-nowrap tabular-nums">{row.registration_date}</span>
      </td>

      {/* Date of Adm */}
      <td className="px-3 py-2.5 text-center">
        <span className="text-[12px] text-slate-500 dark:text-slate-400 whitespace-nowrap tabular-nums">{row.doa}</span>
      </td>

      {/* Mobile */}
      <td className="px-3 py-2.5">
        <span className="text-[12px] font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.mobile}</span>
      </td>

      {/* Gender */}
      <td className="px-3 py-2.5 text-center">
        <GenderBadge gender={row.gender} />
      </td>

      {/* Reg Fee */}
      <td className="px-3 py-2.5 text-center">
        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 tabular-nums whitespace-nowrap">
          ₹{row.reg_fee}
        </span>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = classColor(row.class)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Class avatar */}
        <span
          className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
          style={{ background: bg, color: fg }}
        >
          {formatAbbr(row.class)}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">
            {row.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">{row.registration_no}</span>
            <span className="text-[10px] text-slate-300 dark:text-slate-600">·</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">{row.class} – {row.section}</span>
          </div>
        </div>

        {/* Right: Fee + gender */}
        <div className="flex flex-col items-end flex-shrink-0 gap-1">
          <span className="text-[14px] font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">₹{row.reg_fee}</span>
          <GenderBadge gender={row.gender} />
        </div>

        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4 space-y-3">
          {/* Detail grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
            {[
              { icon: User,          label: 'Father Name',   value: row.father_name },
              { icon: Phone,         label: 'Mobile',        value: row.mobile,         mono: true },
              { icon: Calendar,      label: 'Date of Birth', value: row.DOB },
              { icon: Calendar,      label: 'Reg. Date',     value: row.registration_date },
              { icon: Calendar,      label: 'Adm. Date',     value: row.doa },
              { icon: GraduationCap, label: 'Class/Section', value: `${row.class} – ${row.section}` },
            ].map(({ icon: Icon, label, value, mono }) => (
              <div key={label} className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 flex items-center gap-1 mb-0.5">
                  <Icon className="w-3 h-3 flex-shrink-0" />{label}
                </p>
                <p className={`text-[13px] font-semibold text-slate-700 dark:text-slate-200 truncate ${mono ? 'font-mono' : ''}`}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Address — full width */}
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 flex items-center gap-1 mb-0.5">
              <Home className="w-3 h-3 flex-shrink-0" />Address
            </p>
            <p className="text-[12px] text-slate-600 dark:text-slate-300">{row.R_Address}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, values, setters, onShow, loading, errors }) {
  if (!open) return null
  const { session, selectedClass, fromDate, toDate } = values
  const { setSession, setSelectedClass, setFromDate, setToDate } = setters

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl"
        style={{ animation: 'drawerUp .25s ease', maxHeight: '88vh', overflowY: 'auto' }}
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
        <div className="px-5 py-5 space-y-4">
          <Field label="Session" error={errors.session} required>
            <NativeSelect value={session} onChange={e => setSession(e.target.value)} placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Class">
            <NativeSelect value={selectedClass} onChange={e => setSelectedClass(e.target.value)} placeholder="-- All Classes --">
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>
          <Field label="From Date">
            <DateInput value={fromDate} onChange={e => setFromDate(e.target.value)} />
          </Field>
          <Field label="To Date">
            <DateInput value={toDate} onChange={e => setToDate(e.target.value)} />
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
export default function NewStudentReport() {
  // Filter state
  const [session,       setSession]       = useState('')
  const [selectedClass, setSelectedClass] = useState('All')
  const [fromDate,      setFromDate]      = useState('')
  const [toDate,        setToDate]        = useState('')

  // Data & UI state
  const [rows,        setRows]        = useState([])
  const [loading,     setLoading]     = useState(false)
  const [exporting,   setExporting]   = useState(false)
  const [filterOpen,  setFilterOpen]  = useState(false)
  const [search,      setSearch]      = useState('')
  const [errors,      setErrors]      = useState({})
  const [toast,       setToast]       = useState(null)
  const [shown,       setShown]       = useState(false)
  const [shownMeta,   setShownMeta]   = useState({ session: '', fromDate: '', toDate: '' })

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Validate & fetch ──────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!session) err.session = 'Please select a session'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      let data = STUDENT_DATA[session] || []

      // Filter by class
      if (selectedClass && selectedClass !== 'All') {
        data = data.filter(r => r.class === selectedClass)
      }

      // Filter by date range (registration_date as dd/mm/yyyy)
      if (fromDate || toDate) {
        const parseDate = (dmy) => {
          const [d, m, y] = dmy.split('/')
          return new Date(`${y}-${m}-${d}`)
        }
        const from = fromDate ? new Date(fromDate) : null
        const to   = toDate   ? new Date(toDate)   : null
        data = data.filter(r => {
          const rd = parseDate(r.registration_date)
          if (from && rd < from) return false
          if (to   && rd > to)   return false
          return true
        })
      }

      // Re-number sno
      data = data.map((r, i) => ({ ...r, sno: i + 1 }))

      setRows(data)
      setShownMeta({ session, fromDate, toDate })
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} records for session ${session}.`)
    }, 700)
  }, [session, selectedClass, fromDate, toDate])

  const handleReset = () => {
    setSession(''); setSelectedClass('All')
    setFromDate(''); setToDate('')
    setRows([]); setSearch('')
    setErrors({}); setShown(false)
    setShownMeta({ session: '', fromDate: '', toDate: '' })
  }

  // ── Excel export placeholder ──────────────────────────────────────────────
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
      r.registration_no.toLowerCase().includes(q) ||
      r.class.toLowerCase().includes(q) ||
      r.father_name.toLowerCase().includes(q) ||
      r.mobile.includes(q)
    )
  }, [rows, search])

  // ── Totals ────────────────────────────────────────────────────────────────
  const totals = useMemo(() => ({
    count:   filtered.length,
    male:    filtered.filter(r => r.gender === 'Male').length,
    female:  filtered.filter(r => r.gender === 'Female').length,
    reg_fee: filtered.reduce((s, r) => s + r.reg_fee, 0),
  }), [filtered])

  const hasResults    = shown && rows.length > 0
  const activeFilters = [session, selectedClass !== 'All' && selectedClass, fromDate, toDate].filter(Boolean).length

  // ── Filter labels for mobile button ──────────────────────────────────────
  const filterLabel = session
    ? `${session}${selectedClass !== 'All' ? ` · ${selectedClass}` : ''}`
    : 'Select Filters'

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <School2 className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            New Student Report
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            View newly registered students by session, class and date range.
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
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 items-end">

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
              <NativeSelect
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                placeholder="-- All Classes --"
              >
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            {/* From Date */}
            <Field label="From Date">
              <DateInput value={fromDate} onChange={e => setFromDate(e.target.value)} />
            </Field>

            {/* To Date */}
            <Field label="To Date">
              <DateInput value={toDate} onChange={e => setToDate(e.target.value)} />
            </Field>

            {/* Buttons */}
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

      {/* ── MOBILE Filter Bar ─────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          <span className="truncate max-w-[180px]">{filterLabel}</span>
          {activeFilters > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">{activeFilters}</span>
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

      {/* Mobile filter drawer */}
      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        values={{ session, selectedClass, fromDate, toDate }}
        setters={{ setSession, setSelectedClass, setFromDate, setToDate }}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ──────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-11 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.1 }} />
          ))}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* School Header */}
          <SchoolHeader
            session={shownMeta.session}
            fromDate={shownMeta.fromDate}
            toDate={shownMeta.toDate}
          />

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={Users}     label="Total Students" value={totals.count}   color="blue"    />
            <SummaryCard icon={UserCheck} label="Male Students"  value={totals.male}    color="cyan"    />
            <SummaryCard icon={UserX}     label="Female Students"value={totals.female}  color="rose"    />
            <SummaryCard icon={Wallet}    label="Total Reg. Fee" value={totals.reg_fee} color="emerald" prefix="₹" />
          </div>

          {/* Results Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Student Records</span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">· {shownMeta.session}</span>
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
                  placeholder="Search name, adm no, class…"
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
                Showing newly registered students. Scroll table horizontally to see all columns.
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
                <table className="w-full min-w-[1100px]">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                      {[
                        'S.No.', 'Adm No.', 'Name', 'Father Name', 'DOB',
                        'Address', 'Class', 'Section', 'Date of Reg.',
                        'Date of Adm.', 'Mobile', 'Gender', 'Reg. Fee'
                      ].map((h, i) => (
                        <th key={i}
                          className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-10">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row) => (
                      <DesktopRow key={row.registration_no} row={row} />
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
                    Tap a card to view full student details.
                  </p>

                  {filtered.map((row) => (
                    <MobileCard key={row.registration_no} row={row} />
                  ))}

                  {/* Mobile Grand Total */}
                  <div className="rounded-xl border-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07] p-4">
                    <p className="text-[12px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Summary — {filtered.length} Students
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{totals.count}</p>
                        <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Total Students</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">₹{totals.reg_fee.toLocaleString()}</p>
                        <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Total Reg. Fee</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-cyan-700 dark:text-cyan-300 tabular-nums">{totals.male}</p>
                        <p className="text-[10px] font-semibold text-cyan-600 dark:text-cyan-400">Male</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-rose-700 dark:text-rose-300 tabular-nums">{totals.female}</p>
                        <p className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">Female</p>
                      </div>
                    </div>

                    {/* Gender bar */}
                    <div className="mt-3">
                      <div className="flex text-[10px] font-semibold justify-between mb-1">
                        <span className="text-cyan-600 dark:text-cyan-400">
                          Male {totals.count ? Math.round((totals.male / totals.count) * 100) : 0}%
                        </span>
                        <span className="text-rose-600 dark:text-rose-400">
                          Female {totals.count ? Math.round((totals.female / totals.count) * 100) : 0}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-rose-200 dark:bg-rose-500/20 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-cyan-500 transition-all duration-500"
                          style={{ width: `${totals.count ? Math.round((totals.male / totals.count) * 100) : 0}%` }}
                        />
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
            <Layers className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a session and click <strong>Show</strong> to generate the new student report.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
