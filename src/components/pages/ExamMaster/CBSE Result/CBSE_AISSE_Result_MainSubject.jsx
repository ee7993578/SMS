/**
 * CBSE_AISSE_Result_MainSubject.jsx
 * Folder: src/pages/Reports/Exam/CBSE_AISSE_Result_MainSubject.jsx
 *
 * Converts legacy ASPX "CBSE AISSE Result (Main Subjects)" page to fully-responsive
 * React + Tailwind. Mirrors all original functionality:
 *  - Session dropdown
 *  - Class selector (Class 12)
 *  - Report Type (Subject Aggregate)
 *  - Stream selector (Science / Commerce / Humanities)
 *  - Show report button + Export Excel
 *  - School name / session header in report
 *  - GridView style subject aggregate table
 *  - Mobile: cards with expandable subject details
 *  - Desktop: dense ERP-style table
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye, AlertCircle, X, Check, Loader2,
  ChevronDown, ChevronRight, FileSpreadsheet, Search,
  BarChart3, BookOpen, TrendingUp, Info,
  School2, SlidersHorizontal, Award, Users,
  GraduationCap, MapPin, Building2, Star, Trophy
} from 'lucide-react'

// ─── STATIC SCHOOL INFO ───────────────────────────────────────────────────────
const SCHOOL_INFO = {
  name: 'Delhi Public School Bulandshahr',
  tagline: 'Result Analysis',
}

// ─── STATIC DATA ──────────────────────────────────────────────────────────────
const SESSIONS = ['2021-22', '2022-23', '2023-24', '2024-25', '2025-26']

const CLASSES = [
  { value: '12', label: 'Class 12th' },
]

const REPORT_TYPES = [
  { value: '4', label: 'Subject Aggregate' },
]

const STREAMS = [
  { value: 'Science', label: 'Science' },
  { value: 'Commerce', label: 'Commerce' },
  { value: 'Humanities', label: 'Humanities' },
]

// Subject aggregate dummy data keyed by session+stream
const SUBJECT_DATA = {
  'Science': {
    '2024-25': [
      { subject: 'Physics',          appeared: 112, passed: 108, distinction: 42, firstDiv: 38, secondDiv: 20, thirdDiv: 6,  failed: 4,  passPercent: 96.43 },
      { subject: 'Chemistry',        appeared: 112, passed: 105, distinction: 38, firstDiv: 40, secondDiv: 18, thirdDiv: 7,  failed: 7,  passPercent: 93.75 },
      { subject: 'Mathematics',      appeared: 68,  passed: 64,  distinction: 30, firstDiv: 22, secondDiv: 8,  thirdDiv: 4,  failed: 4,  passPercent: 94.12 },
      { subject: 'Biology',          appeared: 44,  passed: 43,  distinction: 20, firstDiv: 15, secondDiv: 6,  thirdDiv: 2,  failed: 1,  passPercent: 97.73 },
      { subject: 'English',          appeared: 112, passed: 111, distinction: 50, firstDiv: 36, secondDiv: 20, thirdDiv: 5,  failed: 1,  passPercent: 99.11 },
      { subject: 'Computer Science', appeared: 40,  passed: 40,  distinction: 22, firstDiv: 12, secondDiv: 6,  thirdDiv: 0,  failed: 0,  passPercent: 100   },
    ],
    '2023-24': [
      { subject: 'Physics',          appeared: 104, passed: 98,  distinction: 35, firstDiv: 36, secondDiv: 20, thirdDiv: 5,  failed: 6,  passPercent: 94.23 },
      { subject: 'Chemistry',        appeared: 104, passed: 96,  distinction: 30, firstDiv: 38, secondDiv: 20, thirdDiv: 6,  failed: 8,  passPercent: 92.31 },
      { subject: 'Mathematics',      appeared: 60,  passed: 56,  distinction: 24, firstDiv: 20, secondDiv: 8,  thirdDiv: 4,  failed: 4,  passPercent: 93.33 },
      { subject: 'Biology',          appeared: 44,  passed: 42,  distinction: 18, firstDiv: 16, secondDiv: 6,  thirdDiv: 2,  failed: 2,  passPercent: 95.45 },
      { subject: 'English',          appeared: 104, passed: 103, distinction: 44, firstDiv: 34, secondDiv: 18, thirdDiv: 7,  failed: 1,  passPercent: 99.04 },
      { subject: 'Computer Science', appeared: 36,  passed: 36,  distinction: 18, firstDiv: 12, secondDiv: 6,  thirdDiv: 0,  failed: 0,  passPercent: 100   },
    ],
    '2022-23': [
      { subject: 'Physics',          appeared: 96,  passed: 88,  distinction: 28, firstDiv: 32, secondDiv: 20, thirdDiv: 8,  failed: 8,  passPercent: 91.67 },
      { subject: 'Chemistry',        appeared: 96,  passed: 86,  distinction: 25, firstDiv: 34, secondDiv: 20, thirdDiv: 7,  failed: 10, passPercent: 89.58 },
      { subject: 'Mathematics',      appeared: 54,  passed: 50,  distinction: 20, firstDiv: 18, secondDiv: 8,  thirdDiv: 4,  failed: 4,  passPercent: 92.59 },
      { subject: 'Biology',          appeared: 42,  passed: 40,  distinction: 16, firstDiv: 14, secondDiv: 8,  thirdDiv: 2,  failed: 2,  passPercent: 95.24 },
      { subject: 'English',          appeared: 96,  passed: 94,  distinction: 38, firstDiv: 32, secondDiv: 18, thirdDiv: 6,  failed: 2,  passPercent: 97.92 },
      { subject: 'Computer Science', appeared: 30,  passed: 30,  distinction: 14, firstDiv: 10, secondDiv: 6,  thirdDiv: 0,  failed: 0,  passPercent: 100   },
    ],
  },
  'Commerce': {
    '2024-25': [
      { subject: 'Accountancy',       appeared: 88, passed: 84, distinction: 32, firstDiv: 30, secondDiv: 16, thirdDiv: 6, failed: 4,  passPercent: 95.45 },
      { subject: 'Business Studies',  appeared: 88, passed: 86, distinction: 35, firstDiv: 28, secondDiv: 18, thirdDiv: 5, failed: 2,  passPercent: 97.73 },
      { subject: 'Economics',         appeared: 88, passed: 80, distinction: 28, firstDiv: 26, secondDiv: 18, thirdDiv: 8, failed: 8,  passPercent: 90.91 },
      { subject: 'Mathematics',       appeared: 44, passed: 40, distinction: 16, firstDiv: 14, secondDiv: 8,  thirdDiv: 2, failed: 4,  passPercent: 90.91 },
      { subject: 'English',           appeared: 88, passed: 87, distinction: 40, firstDiv: 28, secondDiv: 16, thirdDiv: 3, failed: 1,  passPercent: 98.86 },
      { subject: 'Informatics',       appeared: 20, passed: 20, distinction: 8,  firstDiv: 8,  secondDiv: 4,  thirdDiv: 0, failed: 0,  passPercent: 100   },
    ],
    '2023-24': [
      { subject: 'Accountancy',       appeared: 80, passed: 74, distinction: 28, firstDiv: 26, secondDiv: 14, thirdDiv: 6, failed: 6,  passPercent: 92.50 },
      { subject: 'Business Studies',  appeared: 80, passed: 78, distinction: 30, firstDiv: 24, secondDiv: 18, thirdDiv: 6, failed: 2,  passPercent: 97.50 },
      { subject: 'Economics',         appeared: 80, passed: 72, distinction: 24, firstDiv: 24, secondDiv: 16, thirdDiv: 8, failed: 8,  passPercent: 90.00 },
      { subject: 'Mathematics',       appeared: 40, passed: 36, distinction: 14, firstDiv: 12, secondDiv: 8,  thirdDiv: 2, failed: 4,  passPercent: 90.00 },
      { subject: 'English',           appeared: 80, passed: 79, distinction: 36, firstDiv: 24, secondDiv: 16, thirdDiv: 3, failed: 1,  passPercent: 98.75 },
      { subject: 'Informatics',       appeared: 16, passed: 16, distinction: 6,  firstDiv: 6,  secondDiv: 4,  thirdDiv: 0, failed: 0,  passPercent: 100   },
    ],
  },
  'Humanities': {
    '2024-25': [
      { subject: 'History',           appeared: 72, passed: 70, distinction: 24, firstDiv: 26, secondDiv: 16, thirdDiv: 4, failed: 2,  passPercent: 97.22 },
      { subject: 'Political Science', appeared: 72, passed: 69, distinction: 22, firstDiv: 24, secondDiv: 18, thirdDiv: 5, failed: 3,  passPercent: 95.83 },
      { subject: 'Geography',         appeared: 60, passed: 56, distinction: 18, firstDiv: 20, secondDiv: 14, thirdDiv: 4, failed: 4,  passPercent: 93.33 },
      { subject: 'Economics',         appeared: 48, passed: 45, distinction: 16, firstDiv: 16, secondDiv: 10, thirdDiv: 3, failed: 3,  passPercent: 93.75 },
      { subject: 'English',           appeared: 72, passed: 71, distinction: 32, firstDiv: 22, secondDiv: 14, thirdDiv: 3, failed: 1,  passPercent: 98.61 },
      { subject: 'Sociology',         appeared: 30, passed: 30, distinction: 10, firstDiv: 12, secondDiv: 8,  thirdDiv: 0, failed: 0,  passPercent: 100   },
    ],
    '2023-24': [
      { subject: 'History',           appeared: 64, passed: 62, distinction: 20, firstDiv: 22, secondDiv: 16, thirdDiv: 4, failed: 2,  passPercent: 96.88 },
      { subject: 'Political Science', appeared: 64, passed: 60, distinction: 18, firstDiv: 22, secondDiv: 16, thirdDiv: 4, failed: 4,  passPercent: 93.75 },
      { subject: 'Geography',         appeared: 54, passed: 50, distinction: 14, firstDiv: 18, secondDiv: 14, thirdDiv: 4, failed: 4,  passPercent: 92.59 },
      { subject: 'Economics',         appeared: 42, passed: 40, distinction: 14, firstDiv: 14, secondDiv: 10, thirdDiv: 2, failed: 2,  passPercent: 95.24 },
      { subject: 'English',           appeared: 64, passed: 63, distinction: 28, firstDiv: 20, secondDiv: 12, thirdDiv: 3, failed: 1,  passPercent: 98.44 },
      { subject: 'Sociology',         appeared: 26, passed: 26, distinction: 8,  firstDiv: 10, secondDiv: 8,  thirdDiv: 0, failed: 0,  passPercent: 100   },
    ],
  },
}

// Helper: get data for a given session + stream
const getReportData = (session, stream) => {
  const streamData = SUBJECT_DATA[stream]
  if (!streamData) return []
  return streamData[session] || streamData[Object.keys(streamData)[0]] || []
}

// Pass % badge color
const getPassColor = (pct) => {
  if (pct === 100) return { bg: 'bg-emerald-100 dark:bg-emerald-500/15', text: 'text-emerald-800 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-500/30' }
  if (pct >= 95)  return { bg: 'bg-blue-100 dark:bg-blue-500/15',    text: 'text-blue-800 dark:text-blue-300',    border: 'border-blue-200 dark:border-blue-500/30' }
  if (pct >= 90)  return { bg: 'bg-amber-100 dark:bg-amber-500/15',  text: 'text-amber-800 dark:text-amber-300',  border: 'border-amber-200 dark:border-amber-500/30' }
  return             { bg: 'bg-rose-100 dark:bg-rose-500/15',    text: 'text-rose-800 dark:text-rose-300',    border: 'border-rose-200 dark:border-rose-500/30' }
}

// Subject icon color
const SUBJECT_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' },
  { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#0891b2', bg: '#cffafe' },
  { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' },
  { fg: '#dc2626', bg: '#fee2e2' },
]
const subjectColor = (name = '') => SUBJECT_COLORS[(name.charCodeAt(0) ?? 0) % SUBJECT_COLORS.length]
const subjectAbbr  = (name = '') => name.slice(0, 3).toUpperCase()

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

/** Native select with chevron */
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

/** Form field with label + error */
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

/** Toast notification */
function Toast({ message, type = 'success', onClose }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3
        rounded-2xl shadow-xl text-[13px] font-semibold min-w-[260px] max-w-[90vw]
        ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}
      style={{ animation: 'slideUp .25s ease' }}
    >
      {type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// ─── SUMMARY STAT CARD ────────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, color }) {
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
        <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── SCHOOL HEADER BANNER ─────────────────────────────────────────────────────
function SchoolHeader({ session, stream, className }) {
  const streamColors = {
    Science:    { badge: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 border-blue-200 dark:border-blue-500/25', dot: 'bg-blue-500' },
    Commerce:   { badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/25', dot: 'bg-emerald-500' },
    Humanities: { badge: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400 border-violet-200 dark:border-violet-500/25', dot: 'bg-violet-500' },
  }
  const sc = streamColors[stream] || streamColors.Science

  return (
    <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-6 py-5 text-center shadow-sm">
      <div className="flex items-center justify-center gap-2 mb-1">
        <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <h2 className="text-[16px] sm:text-[18px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
          {SCHOOL_INFO.name}
        </h2>
      </div>
      <p className="text-[13px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400 mb-3">
        {SCHOOL_INFO.tagline}
      </p>
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {/* Stream badge */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[12px] font-bold ${sc.badge}`}>
          <span className={`w-2 h-2 rounded-full ${sc.dot}`} />
          {stream}
        </div>
        {/* Class badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[12px] font-bold text-slate-700 dark:text-slate-300">
          <GraduationCap className="w-3.5 h-3.5" />
          {className}
        </div>
        {/* Session badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25 text-[12px] font-bold text-amber-700 dark:text-amber-400">
          Session: {session}
        </div>
      </div>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx, isTotal }) {
  const { fg, bg } = subjectColor(row.subject)
  const passColor  = getPassColor(row.passPercent)

  if (isTotal) {
    return (
      <tr className="bg-blue-50 dark:bg-indigo-500/[0.07] border-t-2 border-blue-200 dark:border-indigo-500/30">
        <td className="px-3 py-3 text-center text-[12px] text-blue-500 dark:text-blue-400">—</td>
        <td className="px-3 py-3" colSpan={2}>
          <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Grand Total
          </span>
        </td>
        {[row.appeared, row.passed, row.distinction, row.firstDiv, row.secondDiv, row.thirdDiv, row.failed].map((val, i) => (
          <td key={i} className="px-3 py-3 text-center">
            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[13px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 tabular-nums">{val}</span>
          </td>
        ))}
        <td className="px-3 py-3 text-center">
          <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">—</span>
        </td>
      </tr>
    )
  }

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      {/* S.No */}
      <td className="px-3 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-10">{idx}</td>

      {/* Subject abbr */}
      <td className="px-3 py-3 w-10">
        <span
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0"
          style={{ background: bg, color: fg }}
        >
          {subjectAbbr(row.subject)}
        </span>
      </td>

      {/* Subject name */}
      <td className="px-3 py-3">
        <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.subject}</span>
      </td>

      {/* Appeared */}
      <td className="px-3 py-3 text-center">
        <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 tabular-nums">{row.appeared}</span>
      </td>

      {/* Passed */}
      <td className="px-3 py-3 text-center">
        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 tabular-nums">{row.passed}</span>
      </td>

      {/* Distinction */}
      <td className="px-3 py-3 text-center">
        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400 tabular-nums">{row.distinction}</span>
      </td>

      {/* 1st Div */}
      <td className="px-3 py-3 text-center">
        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 tabular-nums">{row.firstDiv}</span>
      </td>

      {/* 2nd Div */}
      <td className="px-3 py-3 text-center">
        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 tabular-nums">{row.secondDiv}</span>
      </td>

      {/* 3rd Div */}
      <td className="px-3 py-3 text-center">
        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 tabular-nums">{row.thirdDiv}</span>
      </td>

      {/* Failed */}
      <td className="px-3 py-3 text-center">
        <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[12px] font-semibold tabular-nums ${row.failed === 0 ? 'bg-slate-50 text-slate-400 dark:bg-slate-800 dark:text-slate-500' : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'}`}>
          {row.failed}
        </span>
      </td>

      {/* Pass % */}
      <td className="px-3 py-3 text-center">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-bold border tabular-nums ${passColor.bg} ${passColor.text} ${passColor.border}`}>
          {row.passPercent === 100 && <Star className="w-3 h-3 fill-current" />}
          {row.passPercent.toFixed(2)}%
        </span>
      </td>
    </tr>
  )
}

// ─── MOBILE SUBJECT CARD ──────────────────────────────────────────────────────
function MobileCard({ row, idx }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = subjectColor(row.subject)
  const passColor   = getPassColor(row.passPercent)
  const passPct     = row.passPercent

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">

      {/* Tap header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        <span
          className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
          style={{ background: bg, color: fg }}
        >
          {subjectAbbr(row.subject)}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{row.subject}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Appeared: <span className="text-slate-600 dark:text-slate-300 font-semibold">{row.appeared}</span>
            &nbsp;·&nbsp;
            Passed: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{row.passed}</span>
            &nbsp;·&nbsp;
            Failed: <span className={`font-semibold ${row.failed === 0 ? 'text-slate-400' : 'text-rose-600 dark:text-rose-400'}`}>{row.failed}</span>
          </p>
        </div>

        {/* Pass % */}
        <div className="flex flex-col items-end flex-shrink-0">
          <span className={`text-[15px] font-bold tabular-nums ${passColor.text}`}>{passPct.toFixed(1)}%</span>
          <span className="text-[10px] text-slate-400">pass rate</span>
        </div>

        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Pass % bar */}
      <div className="px-4 pb-3">
        <div className="h-1.5 rounded-full bg-rose-100 dark:bg-rose-500/15 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${passPct === 100 ? 'bg-emerald-500' : passPct >= 95 ? 'bg-blue-500' : passPct >= 90 ? 'bg-amber-500' : 'bg-rose-500'}`}
            style={{ width: `${passPct}%` }}
          />
        </div>
      </div>

      {/* Expanded breakdown */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4">
          <div className="grid grid-cols-3 gap-2 mb-3">

            {/* Distinction */}
            <div className="rounded-xl bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 p-2.5 text-center">
              <Trophy className="w-4 h-4 text-violet-600 dark:text-violet-400 mx-auto mb-1" />
              <p className="text-[20px] font-bold text-violet-700 dark:text-violet-300 tabular-nums leading-tight">{row.distinction}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-violet-600 dark:text-violet-400 mt-0.5">Distinction</p>
            </div>

            {/* 1st Div */}
            <div className="rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-2.5 text-center">
              <Award className="w-4 h-4 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
              <p className="text-[20px] font-bold text-blue-700 dark:text-blue-300 tabular-nums leading-tight">{row.firstDiv}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400 mt-0.5">1st Div</p>
            </div>

            {/* 2nd Div */}
            <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 p-2.5 text-center">
              <Star className="w-4 h-4 text-amber-600 dark:text-amber-400 mx-auto mb-1" />
              <p className="text-[20px] font-bold text-amber-700 dark:text-amber-300 tabular-nums leading-tight">{row.secondDiv}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400 mt-0.5">2nd Div</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* 3rd Div */}
            <div className="rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 p-2.5 text-center">
              <p className="text-[20px] font-bold text-orange-700 dark:text-orange-300 tabular-nums leading-tight">{row.thirdDiv}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-orange-600 dark:text-orange-400 mt-0.5">3rd Div</p>
            </div>

            {/* Failed */}
            <div className={`rounded-xl p-2.5 text-center border ${row.failed === 0 ? 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700' : 'bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20'}`}>
              <p className={`text-[20px] font-bold tabular-nums leading-tight ${row.failed === 0 ? 'text-slate-400 dark:text-slate-500' : 'text-rose-700 dark:text-rose-300'}`}>{row.failed}</p>
              <p className={`text-[10px] font-bold uppercase tracking-wide mt-0.5 ${row.failed === 0 ? 'text-slate-400 dark:text-slate-500' : 'text-rose-600 dark:text-rose-400'}`}>Failed</p>
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
  stream, setStream,
  reportType, setReportType,
  classVal, setClassVal,
  onShow, loading, errors,
  showStreamDiv,
}) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl"
        style={{ animation: 'drawerUp .25s ease', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        {/* Drawer header */}
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
            <NativeSelect value={session} onChange={e => setSession(e.target.value)} placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Class">
            <NativeSelect value={classVal} onChange={e => setClassVal(e.target.value)}>
              {CLASSES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Report Type">
            <NativeSelect value={reportType} onChange={e => setReportType(e.target.value)}>
              {REPORT_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </NativeSelect>
          </Field>

          {showStreamDiv && (
            <Field label="Stream">
              <NativeSelect value={stream} onChange={e => setStream(e.target.value)}>
                {STREAMS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </NativeSelect>
            </Field>
          )}
        </div>

        {/* Drawer footer */}
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

// ─── LEGEND ROW ───────────────────────────────────────────────────────────────
function Legend() {
  const items = [
    { label: 'Distinction', color: 'bg-violet-200 dark:bg-violet-500/30' },
    { label: '1st Division', color: 'bg-blue-200 dark:bg-blue-500/30' },
    { label: '2nd Division', color: 'bg-amber-200 dark:bg-amber-500/30' },
    { label: '3rd Division', color: 'bg-orange-200 dark:bg-orange-500/30' },
    { label: 'Failed', color: 'bg-rose-200 dark:bg-rose-500/30' },
  ]
  return (
    <div className="flex flex-wrap gap-3 px-5 py-2.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-slate-50/40 dark:bg-white/[0.02]">
      {items.map(({ label, color }) => (
        <div key={label} className="flex items-center gap-1.5">
          <span className={`w-3 h-3 rounded-sm flex-shrink-0 ${color}`} />
          <span className="text-[11px] text-slate-500 dark:text-slate-400">{label}</span>
        </div>
      ))}
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function CBSEAISSEResultMainSubject() {
  // Filter state
  const [session,    setSession]    = useState('')
  const [classVal,   setClassVal]   = useState('12')
  const [reportType, setReportType] = useState('4')
  const [stream,     setStream]     = useState('Science')

  // UI state
  const [rows,         setRows]         = useState([])
  const [loading,      setLoading]      = useState(false)
  const [exporting,    setExporting]    = useState(false)
  const [filterOpen,   setFilterOpen]   = useState(false)
  const [search,       setSearch]       = useState('')
  const [errors,       setErrors]       = useState({})
  const [toast,        setToast]        = useState(null)
  const [shown,        setShown]        = useState(false)
  const [shownParams,  setShownParams]  = useState({ session: '', stream: '', classVal: '' })

  // Stream selector is visible when report type = Subject Aggregate (value 4)
  // We always show it for type 4 (only type in this version)
  const showStreamDiv = reportType === '4'

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Show report ─────────────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!session) err.session = 'Please select a session'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      const data = getReportData(session, stream)
      setRows(data)
      setShownParams({ session, stream, classVal })
      setShown(true)
      setLoading(false)
      if (data.length === 0) {
        showToast(`No data found for ${stream} — ${session}. Showing closest available session.`, 'error')
      } else {
        showToast(`Loaded ${data.length} subjects for ${stream} · ${session}`)
      }
    }, 700)
  }, [session, stream, classVal])

  // ── Reset ───────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setSession(''); setRows([]); setSearch('')
    setErrors({}); setShown(false)
    setShownParams({ session: '', stream: '', classVal: '' })
  }

  // ── Export ──────────────────────────────────────────────────────────────────
  const handleExcel = () => {
    if (rows.length === 0) { showToast('No data to export. Show report first.', 'error'); return }
    setExporting(true)
    setTimeout(() => {
      setExporting(false)
      showToast('Excel export ready! (API integration pending)')
    }, 1200)
  }

  // ── Search filter ────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter(r => r.subject.toLowerCase().includes(q))
  }, [rows, search])

  // ── Totals ───────────────────────────────────────────────────────────────────
  const totals = useMemo(() => ({
    appeared:    filtered.reduce((s, r) => s + r.appeared, 0),
    passed:      filtered.reduce((s, r) => s + r.passed, 0),
    distinction: filtered.reduce((s, r) => s + r.distinction, 0),
    firstDiv:    filtered.reduce((s, r) => s + r.firstDiv, 0),
    secondDiv:   filtered.reduce((s, r) => s + r.secondDiv, 0),
    thirdDiv:    filtered.reduce((s, r) => s + r.thirdDiv, 0),
    failed:      filtered.reduce((s, r) => s + r.failed, 0),
    passPercent: 0,
  }), [filtered])

  const avgPass = totals.appeared > 0 ? ((totals.passed / totals.appeared) * 100).toFixed(2) : '0.00'

  const hasResults   = shown && rows.length > 0
  const activeFilters = [session].filter(Boolean).length
  const classLabel   = CLASSES.find(c => c.value === classVal)?.label || 'Class 12th'

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 pb-10">

      {/* Breadcrumb */}
      <nav aria-label="breadcrumb">
        <ol className="flex items-center gap-1.5 text-[12px] text-slate-400 dark:text-slate-500">
          <li><span className="hover:text-blue-600 cursor-pointer transition-colors">Home</span></li>
          <li><ChevronRight className="w-3 h-3" /></li>
          <li className="text-slate-600 dark:text-slate-300 font-medium">CBSE AISSE Result: Main Subjects</li>
        </ol>
      </nav>

      {/* ── Page Title ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <School2 className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            CBSE AISSE Result
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Subject-wise aggregate result analysis — Class 12th.
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

      {/* ── DESKTOP Filter Card ─────────────────────────────────────────────── */}
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
              <NativeSelect value={classVal} onChange={e => setClassVal(e.target.value)}>
                {CLASSES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </NativeSelect>
            </Field>

            {/* Report Type */}
            <Field label="Report Type">
              <NativeSelect value={reportType} onChange={e => setReportType(e.target.value)}>
                {REPORT_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </NativeSelect>
            </Field>

            {/* Stream — shown when applicable */}
            {showStreamDiv && (
              <Field label="Stream">
                <NativeSelect value={stream} onChange={e => setStream(e.target.value)}>
                  {STREAMS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </NativeSelect>
              </Field>
            )}

            {/* Actions */}
            <div className={`flex gap-2 ${showStreamDiv ? '' : 'lg:col-start-5'}`}>
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

      {/* ── MOBILE Filter Bar ───────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {session ? `${stream} · ${session}` : 'Select Filters'}
          {activeFilters > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilters}</span>
          )}
        </button>
        {hasResults && (
          <button
            type="button"
            onClick={handleExcel}
            disabled={exporting}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm disabled:opacity-70"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
          </button>
        )}
        {hasResults && (
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Mobile Filter Drawer */}
      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        session={session} setSession={setSession}
        stream={stream}   setStream={setStream}
        reportType={reportType} setReportType={setReportType}
        classVal={classVal}     setClassVal={setClassVal}
        onShow={handleShow}
        loading={loading}
        errors={errors}
        showStreamDiv={showStreamDiv}
      />

      {/* ── Loading Skeleton ────────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      )}

      {/* ── Results ─────────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* School Header */}
          <SchoolHeader
            session={shownParams.session}
            stream={shownParams.stream}
            className={CLASSES.find(c => c.value === shownParams.classVal)?.label || 'Class 12th'}
          />

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={Users}     label="Total Appeared"  value={totals.appeared}    color="blue"    />
            <SummaryCard icon={GraduationCap} label="Total Passed"value={totals.passed}      color="emerald" />
            <SummaryCard icon={Trophy}    label="Distinctions"    value={totals.distinction}  color="violet"  />
            <SummaryCard icon={Award}     label="Overall Pass %"  value={`${avgPass}%`}       color="amber"   />
          </div>

          {/* Results card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Subject Aggregate</span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">· {shownParams.stream} · {shownParams.session}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                  {filtered.length} subject{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-48 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search subject…"
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
                Subject-wise result breakdown. Pass% = (Passed / Appeared) × 100.
              </p>
            </div>

            {/* Legend */}
            <Legend />

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block overflow-x-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No subjects match your search.</span>
                </div>
              ) : (
                <table className="w-full min-w-[820px]">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                      {['S.No.', '', 'Subject', 'Appeared', 'Passed', 'Distinction', '1st Div', '2nd Div', '3rd Div', 'Failed', 'Pass %'].map((h, i) => (
                        <th
                          key={i}
                          className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <DesktopRow key={row.subject} row={row} idx={i + 1} />
                    ))}
                    {/* Grand Total row */}
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
                  <span className="text-[13px]">No subjects match your search.</span>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap a subject card to see detailed breakdown.
                  </p>

                  {filtered.map((row, i) => (
                    <MobileCard key={row.subject} row={row} idx={i + 1} />
                  ))}

                  {/* Mobile Grand Total */}
                  <div className="rounded-xl border-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07] p-4">
                    <p className="text-[12px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Grand Total — {filtered.length} Subjects
                    </p>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-slate-700 dark:text-slate-200 tabular-nums">{totals.appeared}</p>
                        <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Appeared</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">{totals.passed}</p>
                        <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Passed</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-violet-700 dark:text-violet-300 tabular-nums">{totals.distinction}</p>
                        <p className="text-[10px] font-semibold text-violet-600 dark:text-violet-400">Distinctions</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{avgPass}%</p>
                        <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Avg Pass %</p>
                      </div>
                    </div>
                    {/* Overall pass bar */}
                    <div>
                      <div className="flex text-[10px] font-semibold justify-between mb-1">
                        <span className="text-emerald-600 dark:text-emerald-400">Pass {avgPass}%</span>
                        <span className="text-rose-500 dark:text-rose-400">Fail {totals.appeared > 0 ? (100 - parseFloat(avgPass)).toFixed(2) : 0}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-rose-100 dark:bg-rose-500/15 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                          style={{ width: `${avgPass}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Table footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{rows.length}</span> subjects
              </p>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Clear search
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Empty State ──────────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <BarChart3 className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a session and stream, then click <strong>Show</strong> to generate the result report.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
