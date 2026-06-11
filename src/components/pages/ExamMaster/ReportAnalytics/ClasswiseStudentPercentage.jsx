/**
 * ClasswiseStudentPercentage.jsx
 * Folder: src/pages/Student/Reports/ClasswiseStudentPercentage.jsx
 *
 * Converts legacy ASPX "Classwise Students Percentage" to fully-responsive React + Tailwind.
 *
 * Columns: S.No, Admission No, Name, Class, Percentage, Grade, House
 * Features:
 *  - Session dropdown (required)
 *  - Class dropdown (filters by selected session)
 *  - From Percentage / To Percentage numeric filters
 *  - Show report button + Excel export
 *  - Desktop: dense ERP-style table
 *  - Mobile: collapsible cards with expandable details
 *  - Grand summary stats (total, avg %, grade distribution)
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye,
  AlertCircle, X, Check, Loader2, ChevronDown,
  Users, SlidersHorizontal, Search,
  BarChart3, FileSpreadsheet, BookOpen,
  School2, TrendingUp, ChevronRight,
  Award, Hash, Percent, GraduationCap,
  MapPin, Building2, Info
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

const CLASSES_BY_SESSION = {
  '2022-23': ['All Classes', 'Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'],
  '2023-24': ['All Classes', 'Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'],
  '2024-25': ['All Classes', 'Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'],
  '2025-26': ['All Classes', 'Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'],
}

const HOUSES = ['Red House', 'Blue House', 'Green House', 'Yellow House']
const NAMES = [
  'Aarav Sharma', 'Priya Singh', 'Rahul Verma', 'Ananya Gupta', 'Karan Mehta',
  'Sneha Patel', 'Rohan Joshi', 'Diya Agarwal', 'Arjun Nair', 'Pooja Reddy',
  'Varun Kumar', 'Ishita Chaudhary', 'Nikhil Saxena', 'Tanvi Mishra', 'Aditya Rao',
  'Shreya Pandey', 'Siddharth Bose', 'Nisha Jain', 'Yash Malhotra', 'Kritika Dubey',
  'Amit Tiwari', 'Meera Iyer', 'Sumit Kapoor', 'Riya Srivastava', 'Vikas Bhatt',
  'Pallavi Tripathi', 'Deepak Sharma', 'Kavya Rao', 'Manish Gupta', 'Sonam Kaur',
]

const getGrade = (per) => {
  if (per >= 90) return 'A+'
  if (per >= 80) return 'A'
  if (per >= 70) return 'B+'
  if (per >= 60) return 'B'
  if (per >= 50) return 'C'
  if (per >= 40) return 'D'
  return 'F'
}

// Generate deterministic dummy data per session
const generateStudents = (session) => {
  const seed = SESSIONS.indexOf(session) + 1
  const classNames = ['Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
    'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII']
  const students = []
  let admBase = 1001 + seed * 200

  classNames.forEach((cls, ci) => {
    const count = 8 + (ci % 5)
    for (let i = 0; i < count; i++) {
      const nameIdx = (ci * 7 + i * 3 + seed) % NAMES.length
      const per = Math.min(99, Math.max(35, 45 + (ci * 4 + i * 7 + seed * 3) % 55))
      students.push({
        registration_no: `ADM${admBase + i}`,
        name: NAMES[nameIdx],
        class: cls,
        per: per.toFixed(1),
        grade: getGrade(per),
        house: HOUSES[(ci + i + seed) % HOUSES.length],
      })
    }
    admBase += 20
  })
  return students
}

const STUDENT_DATA = {
  '2022-23': generateStudents('2022-23'),
  '2023-24': generateStudents('2023-24'),
  '2024-25': generateStudents('2024-25'),
  '2025-26': generateStudents('2025-26'),
}

// ─── GRADE CONFIG ─────────────────────────────────────────────────────────────
const GRADE_CONFIG = {
  'A+': { bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' },
  'A':  { bg: 'bg-green-100 dark:bg-green-500/20',   text: 'text-green-700 dark:text-green-300',   dot: 'bg-green-500'   },
  'B+': { bg: 'bg-blue-100 dark:bg-blue-500/20',     text: 'text-blue-700 dark:text-blue-300',     dot: 'bg-blue-500'    },
  'B':  { bg: 'bg-cyan-100 dark:bg-cyan-500/20',     text: 'text-cyan-700 dark:text-cyan-300',     dot: 'bg-cyan-500'    },
  'C':  { bg: 'bg-amber-100 dark:bg-amber-500/20',   text: 'text-amber-700 dark:text-amber-300',   dot: 'bg-amber-500'   },
  'D':  { bg: 'bg-orange-100 dark:bg-orange-500/20', text: 'text-orange-700 dark:text-orange-300', dot: 'bg-orange-500'  },
  'F':  { bg: 'bg-rose-100 dark:bg-rose-500/20',     text: 'text-rose-700 dark:text-rose-300',     dot: 'bg-rose-500'    },
}

const HOUSE_COLORS = {
  'Red House':    { bg: 'bg-rose-100 dark:bg-rose-500/15',   text: 'text-rose-700 dark:text-rose-400'   },
  'Blue House':   { bg: 'bg-blue-100 dark:bg-blue-500/15',   text: 'text-blue-700 dark:text-blue-400'   },
  'Green House':  { bg: 'bg-emerald-100 dark:bg-emerald-500/15', text: 'text-emerald-700 dark:text-emerald-400' },
  'Yellow House': { bg: 'bg-amber-100 dark:bg-amber-500/15', text: 'text-amber-700 dark:text-amber-400' },
}

const CLASS_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' }, { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#0891b2', bg: '#cffafe' }, { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' }, { fg: '#dc2626', bg: '#fee2e2' },
  { fg: '#0369a1', bg: '#e0f2fe' },
]
const classColor = (name = '') => CLASS_COLORS[(name.charCodeAt(0) ?? 0) % CLASS_COLORS.length]
const formatAbbr = (name = '') => name.replace('Class ', '').slice(0, 3).toUpperCase()

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

// ─── SCHOOL HEADER BANNER ─────────────────────────────────────────────────────
function SchoolHeader({ session, selectedClass, fromPer, toPer }) {
  const rangeLabel = (fromPer || toPer)
    ? `Percentage: ${fromPer || '0'}% – ${toPer || '100'}%`
    : 'All Percentages'
  return (
    <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-6 py-5 text-center shadow-sm">
      <div className="flex items-center justify-center gap-2 mb-1">
        <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <h2 className="text-[16px] sm:text-[18px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
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
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/25 text-[12px] font-bold text-blue-700 dark:text-blue-400">
          {selectedClass || 'All Classes'}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-500/15 border border-violet-200 dark:border-violet-500/25 text-[12px] font-bold text-violet-700 dark:text-violet-400">
          <Percent className="w-3 h-3" />{rangeLabel}
        </span>
      </div>
      <p className="mt-3 text-[13px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400">
        Classwise Students Percentage Report
      </p>
    </div>
  )
}

// ─── SUMMARY CARDS ────────────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, color, suffix = '' }) {
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
        <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">
          {typeof value === 'number' ? value.toLocaleString() : value}{suffix}
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── GRADE BADGE ──────────────────────────────────────────────────────────────
function GradeBadge({ grade }) {
  const cfg = GRADE_CONFIG[grade] || GRADE_CONFIG['F']
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-bold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {grade}
    </span>
  )
}

// ─── HOUSE BADGE ──────────────────────────────────────────────────────────────
function HouseBadge({ house }) {
  const cfg = HOUSE_COLORS[house] || { bg: 'bg-slate-100', text: 'text-slate-600' }
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold ${cfg.bg} ${cfg.text} whitespace-nowrap`}>
      {house}
    </span>
  )
}

// ─── PERCENTAGE BAR ───────────────────────────────────────────────────────────
function PerBar({ value }) {
  const num = parseFloat(value)
  const color = num >= 80 ? 'bg-emerald-500' : num >= 60 ? 'bg-blue-500' : num >= 40 ? 'bg-amber-500' : 'bg-rose-500'
  return (
    <div className="flex items-center gap-2">
      <span className="text-[13px] font-bold tabular-nums text-slate-700 dark:text-slate-200 w-12 text-right">{value}%</span>
      <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden max-w-[60px]">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${Math.min(num, 100)}%` }} />
      </div>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx }) {
  const { fg, bg } = classColor(row.class)
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">{idx}</td>

      {/* Admission No */}
      <td className="px-4 py-3">
        <span className="text-[12px] font-mono font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
          {row.registration_no}
        </span>
      </td>

      {/* Name */}
      <td className="px-4 py-3">
        <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{row.name}</span>
      </td>

      {/* Class */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[9px] font-bold"
            style={{ background: bg, color: fg }}
          >
            {formatAbbr(row.class)}
          </span>
          <span className="text-[12px] font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.class}</span>
        </div>
      </td>

      {/* Percentage */}
      <td className="px-4 py-3">
        <PerBar value={row.per} />
      </td>

      {/* Grade */}
      <td className="px-4 py-3 text-center">
        <GradeBadge grade={row.grade} />
      </td>

      {/* House */}
      <td className="px-4 py-3">
        <HouseBadge house={row.house} />
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row, idx }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = classColor(row.class)
  const per = parseFloat(row.per)
  const barColor = per >= 80 ? 'bg-emerald-500' : per >= 60 ? 'bg-blue-500' : per >= 40 ? 'bg-amber-500' : 'bg-rose-500'

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Always-visible header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Rank number */}
        <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[11px] font-bold text-slate-500 dark:text-slate-400 flex-shrink-0">
          {idx}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{row.name}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">{row.registration_no}</span>
            <span className="text-slate-300 dark:text-slate-600 text-[10px]">·</span>
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded"
              style={{ background: bg, color: fg }}
            >
              {row.class}
            </span>
          </div>
        </div>

        {/* Percentage + grade */}
        <div className="flex flex-col items-end flex-shrink-0 mr-1">
          <span className="text-[20px] font-bold tabular-nums leading-tight text-slate-800 dark:text-slate-100">{row.per}%</span>
          <GradeBadge grade={row.grade} />
        </div>

        <span className={`w-4 h-4 flex items-center justify-center text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* % progress bar */}
      <div className="px-4 pb-3">
        <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${Math.min(per, 100)}%` }} />
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-4 pb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1">Admission No</p>
              <p className="text-[13px] font-mono font-bold text-slate-700 dark:text-slate-200">{row.registration_no}</p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1">Class</p>
              <p className="text-[13px] font-bold text-slate-700 dark:text-slate-200">{row.class}</p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex flex-col items-center gap-1 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Grade</p>
              <GradeBadge grade={row.grade} />
            </div>
            <div className="flex flex-col items-center gap-1 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">House</p>
              <HouseBadge house={row.house} />
            </div>
            <div className="flex flex-col items-center gap-1 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Percentage</p>
              <span className="text-[18px] font-extrabold tabular-nums text-blue-600 dark:text-blue-400">{row.per}%</span>
            </div>
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
  selectedClass, setSelectedClass,
  fromPer, setFromPer,
  toPer, setToPer,
  availableClasses, onShow, loading, errors
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
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
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
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              disabled={!session}
            >
              {availableClasses.map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="From %">
              <input
                type="number" min="0" max="100"
                value={fromPer}
                onChange={e => setFromPer(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="e.g. 60"
                className="w-full px-3 py-2 text-[13px] rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.25)] outline-none bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400"
              />
            </Field>
            <Field label="To %">
              <input
                type="number" min="0" max="100"
                value={toPer}
                onChange={e => setToPer(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="e.g. 90"
                className="w-full px-3 py-2 text-[13px] rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.25)] outline-none bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400"
              />
            </Field>
          </div>
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

// ─── GRADE DISTRIBUTION MINI CHART ───────────────────────────────────────────
function GradeDistribution({ rows }) {
  const dist = useMemo(() => {
    const map = {}
    rows.forEach(r => { map[r.grade] = (map[r.grade] || 0) + 1 })
    return Object.entries(map).sort((a, b) => {
      const order = ['A+', 'A', 'B+', 'B', 'C', 'D', 'F']
      return order.indexOf(a[0]) - order.indexOf(b[0])
    })
  }, [rows])

  const max = Math.max(...dist.map(d => d[1]), 1)

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
        <span className="w-1 h-5 rounded-full bg-violet-500 flex-shrink-0" />
        <Award className="w-4 h-4 text-violet-600 dark:text-violet-400 flex-shrink-0" />
        <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Grade Distribution</span>
      </div>
      <div className="p-4 flex items-end justify-around gap-2 h-28">
        {dist.map(([grade, count]) => {
          const cfg = GRADE_CONFIG[grade] || GRADE_CONFIG['F']
          const heightPct = Math.round((count / max) * 100)
          return (
            <div key={grade} className="flex flex-col items-center gap-1 flex-1">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tabular-nums">{count}</span>
              <div className="w-full flex flex-col justify-end" style={{ height: 60 }}>
                <div
                  className={`rounded-t-md w-full transition-all duration-700 ${cfg.dot.replace('bg-', 'bg-')}`}
                  style={{ height: `${Math.max(heightPct, 8)}%` }}
                />
              </div>
              <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.text}`}>{grade}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ClasswiseStudentPercentage() {
  const [session,       setSession]       = useState('')
  const [selectedClass, setSelectedClass] = useState('All Classes')
  const [fromPer,       setFromPer]       = useState('')
  const [toPer,         setToPer]         = useState('')
  const [rows,          setRows]          = useState([])
  const [loading,       setLoading]       = useState(false)
  const [exporting,     setExporting]     = useState(false)
  const [filterOpen,    setFilterOpen]    = useState(false)
  const [search,        setSearch]        = useState('')
  const [errors,        setErrors]        = useState({})
  const [toast,         setToast]         = useState(null)
  const [shown,         setShown]         = useState(false)
  const [shownMeta,     setShownMeta]     = useState({})

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Available classes based on session
  const availableClasses = useMemo(() =>
    session ? (CLASSES_BY_SESSION[session] || ['All Classes']) : ['All Classes'],
    [session]
  )

  // When session changes, reset class
  const handleSessionChange = (val) => {
    setSession(val)
    setSelectedClass('All Classes')
    setErrors(p => ({ ...p, session: undefined }))
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
      let data = STUDENT_DATA[session] || []

      // Filter by class
      if (selectedClass && selectedClass !== 'All Classes') {
        data = data.filter(r => r.class === selectedClass)
      }

      // Filter by percentage range
      const from = parseFloat(fromPer)
      const to   = parseFloat(toPer)
      if (!isNaN(from)) data = data.filter(r => parseFloat(r.per) >= from)
      if (!isNaN(to))   data = data.filter(r => parseFloat(r.per) <= to)

      setRows(data)
      setShownMeta({ session, selectedClass, fromPer, toPer })
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} student record${data.length !== 1 ? 's' : ''}.`)
    }, 700)
  }, [session, selectedClass, fromPer, toPer])

  const handleReset = () => {
    setSession(''); setSelectedClass('All Classes')
    setFromPer(''); setToPer('')
    setRows([]); setSearch('')
    setErrors({}); setShown(false); setShownMeta({})
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
      r.registration_no.toLowerCase().includes(q) ||
      r.class.toLowerCase().includes(q) ||
      r.grade.toLowerCase().includes(q) ||
      r.house.toLowerCase().includes(q)
    )
  }, [rows, search])

  // ── Summary Stats ─────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    if (!filtered.length) return { total: 0, avgPer: '0.0', topGrade: 0, houses: 0 }
    const avg = filtered.reduce((s, r) => s + parseFloat(r.per), 0) / filtered.length
    const topGrade = filtered.filter(r => r.grade === 'A+').length
    const houses = new Set(filtered.map(r => r.house)).size
    return { total: filtered.length, avgPer: avg.toFixed(1), topGrade, houses }
  }, [filtered])

  const hasResults   = shown && rows.length > 0
  const activeFilters = [session, selectedClass !== 'All Classes' ? selectedClass : '', fromPer, toPer].filter(Boolean).length

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Classwise Students Percentage
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            View percentage, grade &amp; house-wise breakdown per class and session.
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
                onChange={e => handleSessionChange(e.target.value)}
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
                disabled={!session}
              >
                {availableClasses.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            {/* From Percentage */}
            <Field label="From Percentage">
              <input
                type="number" min="0" max="100"
                value={fromPer}
                onChange={e => setFromPer(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="e.g. 60"
                className="w-full px-3 py-2 text-[13px] rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.25)] outline-none bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400 placeholder-slate-300 dark:placeholder-slate-600"
              />
            </Field>

            {/* To Percentage */}
            <Field label="To Percentage">
              <input
                type="number" min="0" max="100"
                value={toPer}
                onChange={e => setToPer(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="e.g. 90"
                className="w-full px-3 py-2 text-[13px] rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.25)] outline-none bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400 placeholder-slate-300 dark:placeholder-slate-600"
              />
            </Field>

            {/* Action buttons */}
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
          {session ? `${session}${selectedClass !== 'All Classes' ? ` · ${selectedClass}` : ''}` : 'Set Filters'}
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
        setSession={handleSessionChange}
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
        fromPer={fromPer}
        setFromPer={setFromPer}
        toPer={toPer}
        setToPer={setToPer}
        availableClasses={availableClasses}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ─────────────────────────────────────────────── */}
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
          <SchoolHeader
            session={shownMeta.session}
            selectedClass={shownMeta.selectedClass}
            fromPer={shownMeta.fromPer}
            toPer={shownMeta.toPer}
          />

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={Users}       label="Total Students"    value={stats.total}    color="blue"    />
            <SummaryCard icon={Percent}     label="Average Percentage" value={stats.avgPer}  color="emerald" suffix="%" />
            <SummaryCard icon={Award}       label="A+ Grade Students" value={stats.topGrade} color="violet"  />
            <SummaryCard icon={School2}     label="Houses Represented" value={stats.houses}  color="amber"   />
          </div>

          {/* Grade Distribution (desktop only) */}
          <div className="hidden sm:block">
            <GradeDistribution rows={filtered} />
          </div>

          {/* Results card */}
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
              <div className="relative w-full sm:w-56 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search name, class, grade…"
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
                Grades: A+ ≥90% · A ≥80% · B+ ≥70% · B ≥60% · C ≥50% · D ≥40% · F below 40%.
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
                      {['S.No.', 'Admission No', 'Name', 'Class', 'Percentage', 'Grade', 'House'].map((h, i) => (
                        <th key={i} className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap ${i === 0 ? 'text-center w-12' : 'text-left'}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <DesktopRow key={row.registration_no} row={row} idx={i + 1} />
                    ))}
                  </tbody>
                  {/* Summary footer */}
                  <tfoot>
                    <tr className="bg-blue-50 dark:bg-indigo-500/[0.07] border-t-2 border-blue-200 dark:border-indigo-500/30">
                      <td className="px-4 py-3 text-center text-[12px] text-blue-500 dark:text-blue-400">—</td>
                      <td className="px-4 py-3" colSpan={2}>
                        <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" /> Summary — {filtered.length} Students
                        </span>
                      </td>
                      <td className="px-4 py-3 text-left">
                        <span className="text-[12px] text-slate-500 dark:text-slate-400">
                          {shownMeta.selectedClass !== 'All Classes' ? shownMeta.selectedClass : 'All Classes'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-[13px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 tabular-nums">
                          Avg: {stats.avgPer}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-[13px] font-bold bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-300 tabular-nums">
                          A+: {stats.topGrade}
                        </span>
                      </td>
                      <td className="px-4 py-3" />
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
                    Tap a card to see full details.
                  </p>

                  {filtered.map((row, i) => (
                    <MobileCard key={row.registration_no} row={row} idx={i + 1} />
                  ))}

                  {/* Mobile Grade Distribution */}
                  <div className="mt-2">
                    <GradeDistribution rows={filtered} />
                  </div>

                  {/* Mobile Summary Footer */}
                  <div className="rounded-xl border-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07] p-4">
                    <p className="text-[12px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Summary — {filtered.length} Students
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{stats.total}</p>
                        <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Total Students</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">{stats.avgPer}%</p>
                        <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Avg Percentage</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-violet-700 dark:text-violet-300 tabular-nums">{stats.topGrade}</p>
                        <p className="text-[10px] font-semibold text-violet-600 dark:text-violet-400">A+ Grade</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-amber-700 dark:text-amber-300 tabular-nums">{stats.houses}</p>
                        <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">Houses</p>
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
              Select a session (and optionally a class / percentage range), then click <strong>Show</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
