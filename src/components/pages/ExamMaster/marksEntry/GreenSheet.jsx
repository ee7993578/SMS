/**
 * GreenSheet.jsx
 * Folder: src/pages/Reports/Exam/GreenSheet.jsx
 *
 * Converts legacy ASPX "Green Sheet" (MarkListSubSubject) to fully-responsive
 * React + Tailwind. Matches the design language of StrengthReport.jsx.
 *
 * Dropdowns: Session → Class → Term → Exam → Subject → Other Exam
 * Features:
 *  - Cascading dropdowns (each unlocks next on valid selection)
 *  - Show button with validation + loading state
 *  - Desktop: ERP-style table with sticky header
 *  - Mobile: accordion cards, bottom-sheet filter drawer
 *  - Excel export placeholder
 *  - Toast notifications
 *  - Grand total footer row
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye,
  AlertCircle, X, Check, Loader2, ChevronDown,
  SlidersHorizontal, Info, Search,
  FileSpreadsheet, BookOpen,
  School2, TrendingUp, ShieldCheck,
  MapPin, Building2, ChevronRight,
  ClipboardList, Award, BarChart3,
  Hash, GraduationCap, Layers, Star,
  Users
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CLASSES = ['Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X',
  'Class XI', 'Class XII']

const TERMS = ['Term 1', 'Term 2', 'Term 3']

const EXAMS_BY_TERM = {
  'Term 1': ['Unit Test 1', 'Half Yearly', 'Periodic Test 1'],
  'Term 2': ['Unit Test 2', 'Annual Exam', 'Periodic Test 2'],
  'Term 3': ['Unit Test 3', 'Pre-Board', 'Final Exam'],
}

const SUBJECTS_BY_CLASS = {
  'Class I':   ['English', 'Hindi', 'Mathematics', 'EVS'],
  'Class II':  ['English', 'Hindi', 'Mathematics', 'EVS'],
  'Class III': ['English', 'Hindi', 'Mathematics', 'EVS', 'Computer'],
  'Class IV':  ['English', 'Hindi', 'Mathematics', 'EVS', 'Computer'],
  'Class V':   ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Computer'],
  'Class VI':  ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Sanskrit', 'Computer'],
  'Class VII': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Sanskrit', 'Computer'],
  'Class VIII':['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Sanskrit', 'Computer'],
  'Class IX':  ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Sanskrit'],
  'Class X':   ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Sanskrit'],
  'Class XI':  ['English', 'Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science'],
  'Class XII': ['English', 'Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science'],
}

const OTHER_EXAMS = ['None', 'Olympiad', 'NTSE', 'KVPY', 'JEE Mock', 'NEET Mock']

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

// ─── MARK LIST DATA GENERATOR ────────────────────────────────────────────────
// Generates realistic mark list data based on selections
function generateMarkData(cls, subject) {
  const sections = cls && (cls.includes('VI') || cls.includes('IX') || cls.includes('XI')) ? ['A', 'B'] : ['A']
  const rows = []
  let roll = 1
  sections.forEach(sec => {
    const count = sec === 'A' ? 12 : 10
    for (let i = 0; i < count; i++) {
      const written = Math.floor(Math.random() * 30) + 50
      const oral    = Math.floor(Math.random() * 10) + 8
      const project = Math.floor(Math.random() * 10) + 6
      const total   = written + oral + project
      const maxMark = 100
      const pct     = Math.round((total / maxMark) * 100)
      const grade   = pct >= 91 ? 'A1' : pct >= 81 ? 'A2' : pct >= 71 ? 'B1' : pct >= 61 ? 'B2' : pct >= 51 ? 'C1' : pct >= 41 ? 'C2' : 'D'
      const names   = ['Aarav Sharma','Priya Singh','Rohan Gupta','Ananya Verma','Karan Patel',
                       'Sneha Joshi','Arjun Kumar','Pooja Yadav','Vivek Tiwari','Riya Mishra',
                       'Sahil Agarwal','Neha Dubey','Mohit Chauhan','Divya Srivastava','Amit Rawat',
                       'Kavya Pandey','Rahul Negi','Anjali Bisht','Vikas Bhatt','Preeti Lal']
      rows.push({
        rollNo: `${sec}${String(roll).padStart(2, '0')}`,
        name:   names[i % names.length],
        section: sec,
        written,
        oral,
        project,
        total,
        maxMark,
        pct,
        grade,
        remarks: pct >= 75 ? 'Pass' : pct >= 33 ? 'Pass' : 'Fail',
      })
      roll++
    }
    roll = 1
  })
  return rows
}

// ─── GRADE COLOR MAP ─────────────────────────────────────────────────────────
const gradeColors = {
  A1: { bg: 'bg-emerald-100 dark:bg-emerald-500/15', text: 'text-emerald-800 dark:text-emerald-300' },
  A2: { bg: 'bg-green-100 dark:bg-green-500/15',    text: 'text-green-800 dark:text-green-300' },
  B1: { bg: 'bg-blue-100 dark:bg-blue-500/15',      text: 'text-blue-800 dark:text-blue-300' },
  B2: { bg: 'bg-cyan-100 dark:bg-cyan-500/15',      text: 'text-cyan-800 dark:text-cyan-300' },
  C1: { bg: 'bg-amber-100 dark:bg-amber-500/15',    text: 'text-amber-800 dark:text-amber-300' },
  C2: { bg: 'bg-orange-100 dark:bg-orange-500/15',  text: 'text-orange-800 dark:text-orange-300' },
  D:  { bg: 'bg-rose-100 dark:bg-rose-500/15',      text: 'text-rose-800 dark:text-rose-300' },
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
        <p className="text-[18px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── SCHOOL HEADER BANNER ─────────────────────────────────────────────────────
function SchoolHeader({ filters }) {
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
        {[
          { label: 'Session', value: filters.session },
          { label: 'Class',   value: filters.cls },
          { label: 'Term',    value: filters.term },
          { label: 'Exam',    value: filters.exam },
          { label: 'Subject', value: filters.subject },
        ].filter(f => f.value).map(f => (
          <span key={f.label} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-[rgba(99,102,241,0.2)] text-[11px] font-semibold text-slate-600 dark:text-slate-300">
            <span className="text-slate-400 dark:text-slate-500">{f.label}:</span> {f.value}
          </span>
        ))}
      </div>
      <p className="mt-3 text-[13px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400">
        Green Sheet — Subject-wise Mark List
      </p>
    </div>
  )
}

// ─── PERCENTAGE BAR ───────────────────────────────────────────────────────────
function PctBar({ pct }) {
  const color = pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 tabular-nums w-8 text-right">{pct}%</span>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx, isTotal }) {
  if (isTotal) {
    return (
      <tr className="bg-blue-50 dark:bg-indigo-500/[0.07] border-t-2 border-blue-200 dark:border-indigo-500/30">
        <td className="px-3 py-3 text-center text-[12px] text-blue-400">—</td>
        <td className="px-3 py-3 text-[12px] text-blue-400">—</td>
        <td className="px-3 py-3">
          <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Class Average / Total
          </span>
        </td>
        <td className="px-3 py-3 text-center">
          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[13px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300 tabular-nums">{row.written}</span>
        </td>
        <td className="px-3 py-3 text-center">
          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[13px] font-bold bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-300 tabular-nums">{row.oral}</span>
        </td>
        <td className="px-3 py-3 text-center">
          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[13px] font-bold bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-300 tabular-nums">{row.project}</span>
        </td>
        <td className="px-3 py-3 text-center">
          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[13px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 tabular-nums">{row.total}</span>
        </td>
        <td className="px-3 py-3 text-center" colSpan={3}>
          <span className="text-[12px] text-slate-400">—</span>
        </td>
      </tr>
    )
  }

  const gc = gradeColors[row.grade] || gradeColors['D']
  const passColor = row.remarks === 'Pass'
    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
    : 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      {/* S.No */}
      <td className="px-3 py-3 text-center text-[12px] text-slate-400 tabular-nums w-10">{idx}</td>
      {/* Roll No */}
      <td className="px-3 py-3 text-center">
        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[12px] font-bold text-slate-600 dark:text-slate-300 tabular-nums">{row.rollNo}</span>
      </td>
      {/* Name */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
            {row.name.charAt(0)}
          </span>
          <div>
            <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.name}</p>
            <p className="text-[11px] text-slate-400">Sec {row.section}</p>
          </div>
        </div>
      </td>
      {/* Written */}
      <td className="px-3 py-3 text-center">
        <span className="text-[13px] font-semibold text-indigo-700 dark:text-indigo-400 tabular-nums">{row.written}</span>
      </td>
      {/* Oral */}
      <td className="px-3 py-3 text-center">
        <span className="text-[13px] font-semibold text-cyan-700 dark:text-cyan-400 tabular-nums">{row.oral}</span>
      </td>
      {/* Project */}
      <td className="px-3 py-3 text-center">
        <span className="text-[13px] font-semibold text-violet-700 dark:text-violet-400 tabular-nums">{row.project}</span>
      </td>
      {/* Total */}
      <td className="px-3 py-3 text-center">
        <span className="text-[14px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{row.total}</span>
      </td>
      {/* % */}
      <td className="px-3 py-3 min-w-[100px]">
        <PctBar pct={row.pct} />
      </td>
      {/* Grade */}
      <td className="px-3 py-3 text-center">
        <span className={`inline-flex items-center justify-center w-9 h-7 rounded-lg text-[12px] font-bold ${gc.bg} ${gc.text}`}>
          {row.grade}
        </span>
      </td>
      {/* Remarks */}
      <td className="px-3 py-3 text-center">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${passColor}`}>
          {row.remarks}
        </span>
      </td>
    </tr>
  )
}

// ─── MOBILE STUDENT CARD ──────────────────────────────────────────────────────
function MobileCard({ row, idx }) {
  const [expanded, setExpanded] = useState(false)
  const gc = gradeColors[row.grade] || gradeColors['D']
  const passColor = row.remarks === 'Pass'
    ? 'text-emerald-600 dark:text-emerald-400'
    : 'text-rose-600 dark:text-rose-400'

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Card Header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Avatar */}
        <span className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-[13px] font-bold text-white flex-shrink-0">
          {row.name.charAt(0)}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{row.name}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Roll: <span className="font-semibold text-slate-600 dark:text-slate-300">{row.rollNo}</span>
            &nbsp;·&nbsp;Sec&nbsp;<span className="font-semibold">{row.section}</span>
          </p>
        </div>
        {/* Right: grade + total + pass/fail */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className={`text-[20px] font-extrabold tabular-nums text-blue-700 dark:text-blue-300`}>{row.total}</span>
            <span className={`inline-flex items-center justify-center w-9 h-7 rounded-lg text-[12px] font-bold ${gc.bg} ${gc.text}`}>{row.grade}</span>
          </div>
          <span className={`text-[11px] font-bold ${passColor}`}>{row.remarks} · {row.pct}%</span>
        </div>
        <span className={`w-5 h-5 flex items-center justify-center ml-0.5 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Progress bar */}
      <div className="px-4 pb-3">
        <PctBar pct={row.pct} />
      </div>

      {/* Expanded breakdown */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 p-3 text-center">
              <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mx-auto mb-1" />
              <p className="text-[22px] font-bold text-indigo-700 dark:text-indigo-300 tabular-nums leading-tight">{row.written}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-indigo-500 dark:text-indigo-400 mt-0.5">Written</p>
            </div>
            <div className="rounded-xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-100 dark:border-cyan-500/20 p-3 text-center">
              <GraduationCap className="w-4 h-4 text-cyan-600 dark:text-cyan-400 mx-auto mb-1" />
              <p className="text-[22px] font-bold text-cyan-700 dark:text-cyan-300 tabular-nums leading-tight">{row.oral}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-cyan-500 dark:text-cyan-400 mt-0.5">Oral</p>
            </div>
            <div className="rounded-xl bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 p-3 text-center">
              <Layers className="w-4 h-4 text-violet-600 dark:text-violet-400 mx-auto mb-1" />
              <p className="text-[22px] font-bold text-violet-700 dark:text-violet-300 tabular-nums leading-tight">{row.project}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-violet-500 dark:text-violet-400 mt-0.5">Project</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, form, setForm, onShow, loading, errors }) {
  if (!open) return null

  const exams    = EXAMS_BY_TERM[form.term]    || []
  const subjects = SUBJECTS_BY_CLASS[form.cls] || []

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl max-h-[90vh] overflow-y-auto"
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
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Search Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* Fields */}
        <div className="px-5 py-5 space-y-4">
          <Field label="Session" error={errors.session} required>
            <NativeSelect value={form.session} onChange={e => setForm(p => ({ ...p, session: e.target.value, cls: '', term: '', exam: '', subject: '', otherExam: '' }))} placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Class" error={errors.cls} required>
            <NativeSelect value={form.cls} onChange={e => setForm(p => ({ ...p, cls: e.target.value, subject: '' }))} placeholder="-- Select Class --" error={errors.cls} disabled={!form.session}>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Term" error={errors.term} required>
            <NativeSelect value={form.term} onChange={e => setForm(p => ({ ...p, term: e.target.value, exam: '' }))} placeholder="-- Select Term --" error={errors.term} disabled={!form.cls}>
              {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Exam" error={errors.exam} required>
            <NativeSelect value={form.exam} onChange={e => setForm(p => ({ ...p, exam: e.target.value }))} placeholder="-- Select Exam --" error={errors.exam} disabled={!form.term}>
              {exams.map(e => <option key={e} value={e}>{e}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Subject">
            <NativeSelect value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="-- Select Subject --" disabled={!form.cls}>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Other Exam">
            <NativeSelect value={form.otherExam} onChange={e => setForm(p => ({ ...p, otherExam: e.target.value }))} placeholder="-- Select Other Exam --">
              {OTHER_EXAMS.map(o => <option key={o} value={o}>{o}</option>)}
            </NativeSelect>
          </Field>
        </div>
        {/* Footer */}
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
export default function GreenSheet() {
  const initialForm = { session: '', cls: '', term: '', exam: '', subject: '', otherExam: '' }

  const [form,        setForm]        = useState(initialForm)
  const [rows,        setRows]        = useState([])
  const [loading,     setLoading]     = useState(false)
  const [exporting,   setExporting]   = useState(false)
  const [filterOpen,  setFilterOpen]  = useState(false)
  const [search,      setSearch]      = useState('')
  const [errors,      setErrors]      = useState({})
  const [toast,       setToast]       = useState(null)
  const [shown,       setShown]       = useState(false)
  const [shownForm,   setShownForm]   = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Cascading: exams and subjects based on selections ─────────────────────
  const availableExams    = EXAMS_BY_TERM[form.term]    || []
  const availableSubjects = SUBJECTS_BY_CLASS[form.cls] || []

  // ── Fetch (simulate API) ──────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!form.session) err.session = 'Required'
    if (!form.cls)     err.cls     = 'Required'
    if (!form.term)    err.term    = 'Required'
    if (!form.exam)    err.exam    = 'Required'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      const data = generateMarkData(form.cls, form.subject)
      setRows(data)
      setShownForm({ ...form })
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} student records.`)
    }, 700)
  }, [form])

  const handleReset = () => {
    setForm(initialForm)
    setRows([])
    setSearch('')
    setErrors({})
    setShown(false)
    setShownForm(null)
  }

  const handleExcel = () => {
    if (!rows.length) { showToast('No data to export. Show report first.', 'error'); return }
    setExporting(true)
    setTimeout(() => {
      setExporting(false)
      showToast('Excel export ready! (API integration pending)')
    }, 1200)
  }

  // ── Search ─────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.rollNo.toLowerCase().includes(q) ||
      r.section.toLowerCase().includes(q) ||
      r.grade.toLowerCase().includes(q)
    )
  }, [rows, search])

  // ── Averages for footer ────────────────────────────────────────────────────
  const avgRow = useMemo(() => {
    if (!filtered.length) return null
    const avg = k => Math.round(filtered.reduce((s, r) => s + r[k], 0) / filtered.length)
    return {
      written: avg('written'),
      oral:    avg('oral'),
      project: avg('project'),
      total:   avg('total'),
    }
  }, [filtered])

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    if (!filtered.length) return null
    const passCount = filtered.filter(r => r.remarks === 'Pass').length
    const avgPct    = Math.round(filtered.reduce((s, r) => s + r.pct, 0) / filtered.length)
    const topGrade  = filtered.filter(r => r.grade === 'A1').length
    return { total: filtered.length, passCount, avgPct, topGrade }
  }, [filtered])

  const hasResults   = shown && rows.length > 0
  const activeFilters = Object.values(form).filter(Boolean).length

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Green Sheet
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Subject-wise student mark list — written, oral &amp; project scores.
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

      {/* ── DESKTOP Filter Card ─────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">* Required fields</span>
        </div>
        <div className="p-5">
          {/* Row 1: Session, Class, Term, Exam */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <Field label="Session" error={errors.session} required>
              <NativeSelect value={form.session}
                onChange={e => { setForm(p => ({ ...p, session: e.target.value, cls: '', term: '', exam: '', subject: '', otherExam: '' })); setErrors(p => ({ ...p, session: undefined })) }}
                placeholder="-- Select Session --" error={errors.session}>
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Class" error={errors.cls} required>
              <NativeSelect value={form.cls}
                onChange={e => { setForm(p => ({ ...p, cls: e.target.value, subject: '' })); setErrors(p => ({ ...p, cls: undefined })) }}
                placeholder="-- Select Class --" error={errors.cls} disabled={!form.session}>
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Term" error={errors.term} required>
              <NativeSelect value={form.term}
                onChange={e => { setForm(p => ({ ...p, term: e.target.value, exam: '' })); setErrors(p => ({ ...p, term: undefined })) }}
                placeholder="-- Select Term --" error={errors.term} disabled={!form.cls}>
                {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Exam" error={errors.exam} required>
              <NativeSelect value={form.exam}
                onChange={e => { setForm(p => ({ ...p, exam: e.target.value })); setErrors(p => ({ ...p, exam: undefined })) }}
                placeholder="-- Select Exam --" error={errors.exam} disabled={!form.term || !availableExams.length}>
                {availableExams.map(e => <option key={e} value={e}>{e}</option>)}
              </NativeSelect>
            </Field>
          </div>

          {/* Row 2: Subject, Other Exam, spacers, actions */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <Field label="Subject">
              <NativeSelect value={form.subject}
                onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                placeholder="-- Select Subject --" disabled={!form.cls}>
                {availableSubjects.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Other Exam">
              <NativeSelect value={form.otherExam}
                onChange={e => setForm(p => ({ ...p, otherExam: e.target.value }))}
                placeholder="-- Select Other Exam --">
                {OTHER_EXAMS.map(o => <option key={o} value={o}>{o}</option>)}
              </NativeSelect>
            </Field>

            <div /> {/* spacer */}

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
                title="Reset filters">
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
          {form.exam ? `${form.exam}` : form.cls ? `${form.cls}` : 'Select Filters'}
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
        form={form}
        setForm={setForm}
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

      {/* ── Results ─────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* School Header */}
          <SchoolHeader filters={shownForm} />

          {/* Summary Cards */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <SummaryCard icon={Users}      label="Total Students"  value={stats.total}      color="blue"    />
              <SummaryCard icon={Check}      label="Students Passed" value={stats.passCount}  color="emerald" />
              <SummaryCard icon={BarChart3}  label="Class Average %"  value={`${stats.avgPct}%`} color="amber" />
              <SummaryCard icon={Star}       label="A1 Grade Count"  value={stats.topGrade}   color="violet"  />
            </div>
          )}

          {/* Results Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <ClipboardList className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Student Mark List</span>
                {shownForm?.subject && (
                  <span className="text-[13px] text-slate-400 dark:text-slate-500">· {shownForm.subject}</span>
                )}
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                  {filtered.length} student{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>
              {/* Search */}
              <div className="relative w-full sm:w-52 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search name, roll, grade…"
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

            {/* Column legend hint */}
            <div className="hidden sm:flex items-center gap-4 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03] flex-wrap">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <span className="text-[11px] text-blue-700 dark:text-blue-400">Max: Written 80 · Oral 10 · Project 10 · Total 100</span>
              <div className="flex items-center gap-2 ml-auto flex-wrap">
                {Object.entries(gradeColors).map(([g, c]) => (
                  <span key={g} className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold ${c.bg} ${c.text}`}>{g}</span>
                ))}
              </div>
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
                      {['S.No.', 'Roll No.', 'Student Name', 'Written', 'Oral', 'Project', 'Total', '% Score', 'Grade', 'Remarks'].map((h, i) => (
                        <th key={i} className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-10">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <DesktopRow key={row.rollNo} row={row} idx={i + 1} />
                    ))}
                    {/* Average row */}
                    {avgRow && <DesktopRow row={avgRow} idx={0} isTotal />}
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
                  {/* Mobile grade legend */}
                  <div className="flex items-center gap-1.5 flex-wrap pb-1">
                    <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                    {Object.entries(gradeColors).map(([g, c]) => (
                      <span key={g} className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold ${c.bg} ${c.text}`}>{g}</span>
                    ))}
                  </div>

                  {filtered.map((row, i) => (
                    <MobileCard key={row.rollNo} row={row} idx={i + 1} />
                  ))}

                  {/* Mobile Average row */}
                  {avgRow && (
                    <div className="rounded-xl border-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07] p-4">
                      <p className="text-[12px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> Class Average — {filtered.length} Students
                      </p>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                          <p className="text-[22px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{avgRow.total}</p>
                          <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Avg Total</p>
                        </div>
                        <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                          <p className="text-[22px] font-bold text-indigo-700 dark:text-indigo-300 tabular-nums">{avgRow.written}</p>
                          <p className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">Avg Written</p>
                        </div>
                        <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                          <p className="text-[22px] font-bold text-cyan-700 dark:text-cyan-300 tabular-nums">{avgRow.oral}</p>
                          <p className="text-[10px] font-semibold text-cyan-600 dark:text-cyan-400">Avg Oral</p>
                        </div>
                        <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                          <p className="text-[22px] font-bold text-violet-700 dark:text-violet-300 tabular-nums">{avgRow.project}</p>
                          <p className="text-[10px] font-semibold text-violet-600 dark:text-violet-400">Avg Project</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Table Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{rows.length}</span> students
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
            <ClipboardList className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select Session, Class, Term &amp; Exam then click <strong>Show</strong> to view the green sheet.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
