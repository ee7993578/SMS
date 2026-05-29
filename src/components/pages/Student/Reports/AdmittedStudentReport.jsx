/**
 * AdmittedStudentReport.jsx
 * Folder: src/pages/Reports/Registration/AdmittedStudentReport.jsx
 *
 * Converts legacy ASPX "Admitted Student Report" to fully-responsive React + Tailwind.
 *
 * Columns: S.No, Form No, Class, Student Name, Status, Registration Date,
 *          Registration No, Father Name, Mother Name, DOB, Address, Contact1,
 *          Contact2, Email
 *
 * Features:
 *  - Session dropdown filter with validation
 *  - Show report + Excel export buttons
 *  - Desktop: dense ERP-style horizontal-scroll table (all 14 cols)
 *  - Mobile: expandable cards — key info visible, rest in accordion
 *  - Per-column search (DataTables-style) as a single global search bar
 *  - Status badges (Admitted / Pending / Withdrawn)
 *  - Loading skeleton + empty state
 *  - Toast notifications
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye, AlertCircle, X, Check,
  Loader2, ChevronDown, ChevronRight, Users,
  SlidersHorizontal, Info, Search, FileSpreadsheet,
  BookOpen, School2, MapPin, Building2, UserCheck,
  Phone, Mail, Calendar, Hash, ClipboardList,
  GraduationCap, UserCircle, Home, BadgeCheck,
  TrendingUp, ChevronUp
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ─────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

const STATUSES = ['Admitted', 'Pending', 'Withdrawn']

const FIRST_NAMES = [
  'Aarav', 'Ananya', 'Arjun', 'Diya', 'Ishaan', 'Kavya', 'Rohan',
  'Priya', 'Vivaan', 'Sneha', 'Karan', 'Pooja', 'Riya', 'Aditya',
  'Neha', 'Sahil', 'Shreya', 'Mohit', 'Tanvi', 'Amit',
]
const LAST_NAMES = [
  'Sharma', 'Verma', 'Singh', 'Gupta', 'Joshi', 'Patel', 'Yadav',
  'Kumar', 'Mishra', 'Tiwari', 'Chauhan', 'Rana', 'Negi', 'Rawat',
]
const FATHER_NAMES = [
  'Rajesh Sharma', 'Suresh Verma', 'Mahesh Singh', 'Dinesh Gupta',
  'Rakesh Joshi', 'Naresh Patel', 'Vijay Yadav', 'Ajay Kumar',
  'Ramesh Mishra', 'Sunil Tiwari', 'Mukesh Chauhan', 'Deepak Rana',
  'Harish Negi', 'Girish Rawat', 'Lokesh Pandey',
]
const MOTHER_NAMES = [
  'Sunita Devi', 'Anita Sharma', 'Rekha Verma', 'Geeta Singh',
  'Meena Gupta', 'Seema Joshi', 'Kavita Patel', 'Usha Yadav',
  'Pushpa Kumar', 'Lata Mishra',
]
const CLASSES_LIST = [
  'Nursery', 'LKG', 'UKG', 'Class I', 'Class II', 'Class III',
  'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII',
  'Class IX', 'Class X', 'Class XI', 'Class XII',
]
const ADDRESSES = [
  'House No. 12, Rajpur Road, Dehradun',
  'Flat 4B, Indira Nagar, Lucknow',
  'Near Clock Tower, Mussoorie',
  'Sector 7, Vasundhara, Ghaziabad',
  '22, Civil Lines, Haridwar',
  'Plot 9, Saharanpur Road, Dehradun',
  'MIG Colony, Haldwani, Uttarakhand',
]

// Seeded pseudo-random helper
const sr = (seed) => {
  let s = seed
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff }
}

const generateStudents = (session) => {
  const rand = sr(session.charCodeAt(0) * 31 + session.charCodeAt(5))
  const count = 40 + Math.floor(rand() * 20)
  const yearStart = parseInt(session.split('-')[0])

  return Array.from({ length: count }, (_, i) => {
    const fn = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)]
    const ln = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)]
    const cls = CLASSES_LIST[Math.floor(rand() * CLASSES_LIST.length)]
    const status = STATUSES[Math.floor(rand() * STATUSES.length)]
    const day   = 1 + Math.floor(rand() * 27)
    const month = 1 + Math.floor(rand() * 11)
    const regDay   = 1 + Math.floor(rand() * 27)
    const regMonth = 1 + Math.floor(rand() * 11)
    const birthYear = yearStart - 4 - Math.floor(rand() * 12)
    const pad = (n) => String(n).padStart(2, '0')

    return {
      id:               i + 1,
      form_no:          `FRM${yearStart}${String(1000 + i).slice(1)}`,
      class_name:       cls,
      name:             `${fn} ${ln}`,
      status,
      registration_date: `${pad(regDay)}-${pad(regMonth)}-${yearStart}`,
      registration_no:  `REG${yearStart}${String(500 + i).slice(1)}`,
      f_name:           FATHER_NAMES[Math.floor(rand() * FATHER_NAMES.length)],
      m_name:           MOTHER_NAMES[Math.floor(rand() * MOTHER_NAMES.length)],
      dob:              `${pad(day)}-${pad(month)}-${birthYear}`,
      address:          ADDRESSES[Math.floor(rand() * ADDRESSES.length)],
      contact1:         `9${String(Math.floor(rand() * 1e9)).padStart(9, '0')}`,
      contact2:         `8${String(Math.floor(rand() * 1e9)).padStart(9, '0')}`,
      email:            `${fn.toLowerCase()}.${ln.toLowerCase()}@gmail.com`,
    }
  })
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const STATUS_STYLE = {
  Admitted:  'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/25',
  Pending:   'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/25',
  Withdrawn: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/25',
}

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
      style={{ animation: 'slideUpT .25s ease' }}
    >
      <style>{`@keyframes slideUpT{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
      {type === 'success'
        ? <Check className="w-4 h-4 flex-shrink-0" />
        : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
    </div>
  )
}

// ─── SUMMARY CARDS ────────────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    rose:    'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── SCHOOL HEADER ────────────────────────────────────────────────────────────
function SchoolHeader({ session }) {
  return (
    <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-6 py-5 text-center shadow-sm">
      <div className="flex items-center justify-center gap-2 mb-1">
        <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <h2 className="text-[16px] sm:text-[18px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
          {SCHOOL_INFO.name}
        </h2>
      </div>
      <div className="flex items-center justify-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400 mb-2">
        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
        <span>{SCHOOL_INFO.address}</span>
      </div>
      <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25">
        <span className="text-[12px] font-bold text-amber-700 dark:text-amber-400">Session: {session}</span>
      </span>
      <p className="mt-2 text-[13px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400">
        Admitted Student Report
      </p>
    </div>
  )
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${STATUS_STYLE[status] || STATUS_STYLE['Pending']}`}>
      {status}
    </span>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx }) {
  const { fg, bg } = classColor(row.class_name)
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors group">
      {/* S.No */}
      <td className="px-3 py-2.5 text-center text-[12px] text-slate-400 tabular-nums w-10 sticky left-0 bg-white dark:bg-[#1a1f35] group-hover:bg-slate-50/60 dark:group-hover:bg-[#1e2238] z-10">
        {idx}
      </td>
      {/* Form No */}
      <td className="px-3 py-2.5 whitespace-nowrap">
        <span className="text-[12px] font-semibold text-blue-600 dark:text-blue-400 font-mono">{row.form_no}</span>
      </td>
      {/* Class */}
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="w-6 h-6 rounded flex-shrink-0 flex items-center justify-center text-[9px] font-bold"
            style={{ background: bg, color: fg }}>
            {formatAbbr(row.class_name)}
          </span>
          <span className="text-[12px] font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.class_name}</span>
        </div>
      </td>
      {/* Student Name */}
      <td className="px-3 py-2.5">
        <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap">{row.name}</span>
      </td>
      {/* Status */}
      <td className="px-3 py-2.5 text-center">
        <StatusBadge status={row.status} />
      </td>
      {/* Reg Date */}
      <td className="px-3 py-2.5 text-center">
        <span className="text-[12px] text-slate-500 dark:text-slate-400 whitespace-nowrap tabular-nums">{row.registration_date}</span>
      </td>
      {/* Reg No */}
      <td className="px-3 py-2.5">
        <span className="text-[12px] font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.registration_no}</span>
      </td>
      {/* Father Name */}
      <td className="px-3 py-2.5">
        <span className="text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.f_name}</span>
      </td>
      {/* Mother Name */}
      <td className="px-3 py-2.5">
        <span className="text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.m_name}</span>
      </td>
      {/* DOB */}
      <td className="px-3 py-2.5 text-center">
        <span className="text-[12px] text-slate-500 dark:text-slate-400 whitespace-nowrap tabular-nums">{row.dob}</span>
      </td>
      {/* Address */}
      <td className="px-3 py-2.5 max-w-[180px]">
        <span className="text-[12px] text-slate-500 dark:text-slate-400 line-clamp-1" title={row.address}>{row.address}</span>
      </td>
      {/* Contact1 */}
      <td className="px-3 py-2.5">
        <span className="text-[12px] font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.contact1}</span>
      </td>
      {/* Contact2 */}
      <td className="px-3 py-2.5">
        <span className="text-[12px] font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">{row.contact2}</span>
      </td>
      {/* Email */}
      <td className="px-3 py-2.5">
        <span className="text-[12px] text-blue-500 dark:text-blue-400 whitespace-nowrap">{row.email}</span>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row, idx }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = classColor(row.class_name)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header row */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Avatar / class badge */}
        <span
          className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-[11px] font-bold"
          style={{ background: bg, color: fg }}
        >
          {formatAbbr(row.class_name)}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{row.name}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
            <span className="font-mono font-semibold text-blue-500 dark:text-blue-400">{row.form_no}</span>
            <span>·</span>
            <span>{row.class_name}</span>
          </p>
        </div>

        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <StatusBadge status={row.status} />
          <span className={`w-5 h-5 flex items-center justify-center text-slate-400 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}>
            <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </button>

      {/* Quick info strip */}
      <div className="flex items-center gap-3 px-4 pb-3 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
        <span className="flex items-center gap-1">
          <Hash className="w-3 h-3" />{row.registration_no}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />{row.registration_date}
        </span>
        <span className="flex items-center gap-1">
          <Phone className="w-3 h-3" />{row.contact1}
        </span>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4 space-y-3">

          {/* Parents */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-3">
              <p className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1">
                <UserCircle className="w-3 h-3" />Father
              </p>
              <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{row.f_name}</p>
            </div>
            <div className="rounded-xl bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 p-3">
              <p className="text-[10px] font-bold uppercase text-violet-600 dark:text-violet-400 mb-1 flex items-center gap-1">
                <UserCircle className="w-3 h-3" />Mother
              </p>
              <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{row.m_name}</p>
            </div>
          </div>

          {/* DOB + Address */}
          <div className="space-y-2">
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-semibold uppercase text-slate-400 mb-0.5">Date of Birth</p>
                <p className="text-[13px] text-slate-700 dark:text-slate-200 font-medium">{row.dob}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <Home className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-semibold uppercase text-slate-400 mb-0.5">Address</p>
                <p className="text-[13px] text-slate-700 dark:text-slate-200">{row.address}</p>
              </div>
            </div>
          </div>

          {/* Contact + Email */}
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <Phone className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold uppercase text-slate-400 mb-0.5">Contacts</p>
                <p className="text-[13px] text-slate-700 dark:text-slate-200 font-mono">
                  {row.contact1}
                  {row.contact2 && <span className="text-slate-400 dark:text-slate-500"> · {row.contact2}</span>}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <Mail className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold uppercase text-slate-400 mb-0.5">Email</p>
                <p className="text-[13px] text-blue-600 dark:text-blue-400 truncate">{row.email}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, session, setSession, onShow, onExcel, loading, exporting, error }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl"
        style={{ animation: 'drawerUpA .25s ease' }}
      >
        <style>{`@keyframes drawerUpA{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Select Session</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-5">
          <Field label="Session" error={error} required>
            <NativeSelect value={session} onChange={e => setSession(e.target.value)}
              placeholder="-- Select Session --" error={error}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
        </div>
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button type="button"
            onClick={() => { onExcel(); onClose() }}
            disabled={exporting}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 transition-all">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            Excel
          </button>
          <button type="button"
            onClick={() => { onShow(); onClose() }}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-70 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show
          </button>
        </div>
      </div>
    </>
  )
}

// ─── LOADING SKELETON ─────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
      <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        ))}
      </div>
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse"
          style={{ opacity: 1 - i * 0.13 }} />
      ))}
    </div>
  )
}

// ─── PAGINATION ───────────────────────────────────────────────────────────────
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

function Pagination({ total, pageSize, page, onPage, onPageSize }) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1 && total <= PAGE_SIZE_OPTIONS[0]) return null

  const pages = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) pages.push(i)
    else if (pages[pages.length - 1] !== '...') pages.push('...')
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
      <div className="flex items-center gap-2 text-[12px] text-slate-500 dark:text-slate-400">
        <span>Rows per page:</span>
        <select
          value={pageSize}
          onChange={e => { onPageSize(Number(e.target.value)); onPage(1) }}
          className="border border-slate-200 dark:border-[rgba(99,102,241,0.25)] rounded-lg px-2 py-1 text-[12px] bg-white dark:bg-[#1e2238] text-slate-700 dark:text-slate-200 outline-none focus:border-blue-400">
          {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <span>· <strong className="text-slate-700 dark:text-slate-300">{total}</strong> records</span>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => onPage(page - 1)} disabled={page === 1}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors">
          <ChevronDown className="w-3.5 h-3.5 rotate-90" />
        </button>
        {pages.map((p, i) =>
          p === '...'
            ? <span key={`d${i}`} className="w-7 h-7 flex items-center justify-center text-[12px] text-slate-400">…</span>
            : <button key={p} onClick={() => onPage(p)}
                className={`w-7 h-7 rounded-lg text-[12px] font-semibold transition-colors
                  ${page === p
                    ? 'bg-blue-600 text-white dark:bg-indigo-600'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                {p}
              </button>
        )}
        <button onClick={() => onPage(page + 1)} disabled={page === totalPages}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors">
          <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
        </button>
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AdmittedStudentReport() {
  const [session,     setSession]     = useState('')
  const [rows,        setRows]        = useState([])
  const [loading,     setLoading]     = useState(false)
  const [exporting,   setExporting]   = useState(false)
  const [filterOpen,  setFilterOpen]  = useState(false)
  const [search,      setSearch]      = useState('')
  const [statusFilter,setStatusFilter]= useState('All')
  const [error,       setError]       = useState('')
  const [toast,       setToast]       = useState(null)
  const [shown,       setShown]       = useState(false)
  const [shownSession,setShownSession]= useState('')
  const [page,        setPage]        = useState(1)
  const [pageSize,    setPageSize]    = useState(20)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    if (!session) { setError('Please select a session'); return }
    setError('')
    setLoading(true)
    setSearch('')
    setStatusFilter('All')
    setPage(1)

    setTimeout(() => {
      const data = generateStudents(session)
      setRows(data)
      setShownSession(session)
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} admitted students for session ${session}.`)
    }, 700)
  }, [session])

  const handleReset = () => {
    setSession(''); setRows([]); setSearch('')
    setError(''); setShown(false); setShownSession('')
    setStatusFilter('All'); setPage(1)
  }

  const handleExcel = useCallback(() => {
    if (rows.length === 0) { showToast('No data to export. Show report first.', 'error'); return }
    setExporting(true)
    setTimeout(() => { setExporting(false); showToast('Excel export ready! (API integration pending)') }, 1200)
  }, [rows])

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let data = rows
    if (statusFilter !== 'All') data = data.filter(r => r.status === statusFilter)
    if (search) {
      const q = search.toLowerCase()
      data = data.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.form_no.toLowerCase().includes(q) ||
        r.registration_no.toLowerCase().includes(q) ||
        r.class_name.toLowerCase().includes(q) ||
        r.f_name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.contact1.includes(q)
      )
    }
    return data
  }, [rows, search, statusFilter])

  // ── Paginated slice ───────────────────────────────────────────────────────
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page, pageSize])

  // ── Status counts ─────────────────────────────────────────────────────────
  const counts = useMemo(() => ({
    total:     rows.length,
    admitted:  rows.filter(r => r.status === 'Admitted').length,
    pending:   rows.filter(r => r.status === 'Pending').length,
    withdrawn: rows.filter(r => r.status === 'Withdrawn').length,
  }), [rows])

  const hasResults = shown && rows.length > 0
  const hasSession = !!session

  return (
    <div className="space-y-4 pb-10">

      {/* ── Breadcrumbs ──────────────────────────────────────────────────── */}
      <nav className="flex items-center gap-1.5 text-[12px] text-slate-400 dark:text-slate-500 flex-wrap">
        {['Home', 'Admitted Student Report'].map((crumb, i, arr) => (
          <span key={crumb} className="flex items-center gap-1.5">
            <span className={i === arr.length - 1 ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'hover:text-slate-600 cursor-pointer'}>
              {crumb}
            </span>
            {i < arr.length - 1 && <ChevronRight className="w-3 h-3 flex-shrink-0" />}
          </span>
        ))}
      </nav>

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Admitted Student Report
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Session-wise list of registered & admitted students with full details.
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
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <Field label="Session" error={error} required>
              <NativeSelect value={session}
                onChange={e => { setSession(e.target.value); setError('') }}
                placeholder="-- Select Session --" error={error}>
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            {/* Spacers */}
            <div /><div />

            <div className="flex gap-2">
              <button type="button" onClick={handleShow} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold text-white
                  bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
                  transition-all active:scale-95 disabled:opacity-70">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                Show
              </button>
              <button type="button" onClick={handleExcel} disabled={exporting || !hasResults}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-semibold
                  bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-all active:scale-95">
                {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                Excel
              </button>
              <button type="button" onClick={handleReset}
                className="flex items-center justify-center px-3 py-2 rounded-xl
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
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
          {session ? `Session: ${session}` : 'Select Session'}
          {hasSession && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">1</span>
          )}
        </button>
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
        session={session}
        setSession={setSession}
        onShow={handleShow}
        onExcel={handleExcel}
        loading={loading}
        exporting={exporting}
        error={error}
      />

      {/* ── Loading ──────────────────────────────────────────────────────── */}
      {loading && <LoadingSkeleton />}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* School Header */}
          <SchoolHeader session={shownSession} />

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={Users}     label="Total Students" value={counts.total}     color="blue"    />
            <SummaryCard icon={BadgeCheck}label="Admitted"        value={counts.admitted}  color="emerald" />
            <SummaryCard icon={ClipboardList} label="Pending"     value={counts.pending}   color="amber"   />
            <SummaryCard icon={UserCheck} label="Withdrawn"       value={counts.withdrawn} color="rose"    />
          </div>

          {/* Results Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Student List</span>
                <span className="text-[13px] text-slate-400">· {shownSession}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
                  {filtered.length} records
                </span>
              </div>
              {/* Search */}
              <div className="relative w-full sm:w-56 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1) }}
                  placeholder="Name, form no, class…"
                  className="w-full pl-8 pr-7 py-1.5 text-[12px] rounded-lg border outline-none transition-all
                    bg-white text-slate-700 border-slate-200 placeholder-slate-300
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                    dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                    dark:placeholder-slate-600"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-2 px-5 py-2.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] overflow-x-auto no-scrollbar">
              {['All', 'Admitted', 'Pending', 'Withdrawn'].map(s => (
                <button key={s} type="button"
                  onClick={() => { setStatusFilter(s); setPage(1) }}
                  className={`flex-shrink-0 px-3 py-1 rounded-full text-[12px] font-semibold transition-all
                    ${statusFilter === s
                      ? 'bg-blue-600 text-white dark:bg-indigo-600 shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'}`}>
                  {s}
                  {s !== 'All' && (
                    <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold
                      ${statusFilter === s ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                      {s === 'Admitted' ? counts.admitted : s === 'Pending' ? counts.pending : counts.withdrawn}
                    </span>
                  )}
                </button>
              ))}
              <style>{`.no-scrollbar::-webkit-scrollbar{display:none}`}</style>
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block overflow-x-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-28 gap-2 text-slate-400">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No records match your search.</span>
                </div>
              ) : (
                <table className="w-full min-w-[1100px]">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                      {[
                        'S.No.', 'Form No', 'Class', 'Student Name', 'Status',
                        'Reg. Date', 'Reg. No', 'Father Name', 'Mother Name',
                        'DOB', 'Address', 'Contact 1', 'Contact 2', 'Email'
                      ].map((h, i) => (
                        <th key={i} className={`px-3 py-2.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap
                          ${i === 0 ? 'text-center sticky left-0 bg-slate-50/50 dark:bg-[#1e2238] z-10' : 'text-left'}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((row, i) => (
                      <DesktopRow key={row.id} row={row} idx={(page - 1) * pageSize + i + 1} />
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* ── MOBILE CARDS ── */}
            <div className="md:hidden p-4 space-y-3">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No records found.</span>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap a card to see full student details.
                  </p>
                  {paginated.map((row, i) => (
                    <MobileCard key={row.id} row={row} idx={(page - 1) * pageSize + i + 1} />
                  ))}
                </>
              )}
            </div>

            {/* Pagination */}
            <Pagination
              total={filtered.length}
              pageSize={pageSize}
              page={page}
              onPage={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              onPageSize={(s) => { setPageSize(s); setPage(1) }}
            />
          </div>
        </>
      )}

      {/* ── Empty State ───────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <UserCheck className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a session and click <strong>Show</strong> to load the admitted student list.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
