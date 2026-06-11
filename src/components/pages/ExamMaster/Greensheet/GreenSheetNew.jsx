/**
 * GreenSheetNew.jsx
 * Folder: src/pages/Reports/Exam/GreenSheetNew.jsx
 *
 * Converts legacy ASPX "Green Sheet Report" to fully-responsive React + Tailwind.
 *
 * Filters: Session → Class → Term (cascading dropdowns)
 * Features:
 *  - Cascading dropdown filters (Session → Class → Term)
 *  - Show report button with validation
 *  - School name / session / class / term header in report
 *  - Subject-wise marks table per student
 *  - Grand summary footer
 *  - Mobile: collapsible student cards
 *  - Desktop: dense ERP-style table
 *  - Excel export placeholder
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye,
  AlertCircle, X, Check, Loader2, ChevronDown,
  ChevronRight, SlidersHorizontal, Search, Info,
  FileSpreadsheet, BookOpen, School2, Building2,
  MapPin, TrendingUp, Users, Award, ClipboardList,
  GraduationCap, BarChart3, FileText, CheckCircle2,
  XCircle, MinusCircle
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CLASSES = {
  '2022-23': ['Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'],
  '2023-24': ['Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'],
  '2024-25': ['Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'],
  '2025-26': ['Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'],
}

const TERMS = ['Term 1 (April - September)', 'Term 2 (October - March)', 'Annual Exam']

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

// Subjects per class group
const SUBJECTS = {
  primary: ['Hindi', 'English', 'Maths', 'EVS', 'Drawing', 'G.K.'],
  middle:  ['Hindi', 'English', 'Maths', 'Science', 'S.St.', 'Sanskrit', 'Computer'],
  high:    ['Hindi', 'English', 'Maths', 'Science', 'S.St.', 'Sanskrit', 'Computer'],
  senior:  ['English', 'Physics', 'Chemistry', 'Maths', 'Biology', 'Computer', 'P.Ed.'],
}

function getSubjects(cls) {
  const n = parseInt(cls.replace('Class ', ''))
  if (n <= 5)  return SUBJECTS.primary
  if (n <= 8)  return SUBJECTS.middle
  if (n <= 10) return SUBJECTS.high
  return SUBJECTS.senior
}

// Generate dummy green sheet data for a class/term
function generateData(cls, term) {
  const subjects = getSubjects(cls)
  const maxMarks = 100
  const sections = ['A', 'B']
  const names = [
    'Aarav Sharma','Bhumi Patel','Chirag Verma','Divya Singh','Ekta Yadav',
    'Farhan Khan','Garima Joshi','Harshit Gupta','Isha Rawat','Jay Mehta',
    'Kavya Negi','Lalit Bisht','Manya Tomar','Nitesh Saini','Ojasvi Rao',
    'Priya Chauhan','Qasim Ali','Riya Agarwal','Sanjay Thakur','Tanvi Mishra',
  ]
  const rows = []
  let sno = 1
  for (const sec of sections) {
    for (let i = 0; i < 10; i++) {
      const student = {
        sno,
        rollNo: `${cls.replace('Class ', '')}${sec}${String(i + 1).padStart(2, '0')}`,
        name: names[(sno - 1) % names.length],
        section: sec,
        marks: {},
        total: 0,
        maxTotal: 0,
        percentage: 0,
        grade: '',
        result: '',
      }
      let total = 0
      let maxTotal = 0
      for (const sub of subjects) {
        const seed = (sno * 17 + sub.charCodeAt(0) * 7) % 35
        const m = Math.min(maxMarks, 50 + seed + Math.floor(Math.random() * 20))
        student.marks[sub] = m
        total += m
        maxTotal += maxMarks
      }
      student.total = total
      student.maxTotal = maxTotal
      student.percentage = Math.round((total / maxTotal) * 100)
      student.grade = getGrade(student.percentage)
      student.result = student.percentage >= 33 ? 'Pass' : 'Fail'
      rows.push(student)
      sno++
    }
  }
  return { rows, subjects, maxMarks }
}

function getGrade(pct) {
  if (pct >= 91) return 'A+'
  if (pct >= 81) return 'A'
  if (pct >= 71) return 'B+'
  if (pct >= 61) return 'B'
  if (pct >= 51) return 'C'
  if (pct >= 41) return 'D'
  if (pct >= 33) return 'E'
  return 'F'
}

// Grade color helpers
const GRADE_COLORS = {
  'A+': { bg: 'bg-emerald-100 dark:bg-emerald-500/15', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-500/25' },
  'A':  { bg: 'bg-green-100 dark:bg-green-500/15',     text: 'text-green-700 dark:text-green-400',     border: 'border-green-200 dark:border-green-500/25' },
  'B+': { bg: 'bg-cyan-100 dark:bg-cyan-500/15',       text: 'text-cyan-700 dark:text-cyan-400',       border: 'border-cyan-200 dark:border-cyan-500/25' },
  'B':  { bg: 'bg-blue-100 dark:bg-blue-500/15',       text: 'text-blue-700 dark:text-blue-400',       border: 'border-blue-200 dark:border-blue-500/25' },
  'C':  { bg: 'bg-indigo-100 dark:bg-indigo-500/15',   text: 'text-indigo-700 dark:text-indigo-400',   border: 'border-indigo-200 dark:border-indigo-500/25' },
  'D':  { bg: 'bg-amber-100 dark:bg-amber-500/15',     text: 'text-amber-700 dark:text-amber-400',     border: 'border-amber-200 dark:border-amber-500/25' },
  'E':  { bg: 'bg-orange-100 dark:bg-orange-500/15',   text: 'text-orange-700 dark:text-orange-400',   border: 'border-orange-200 dark:border-orange-500/25' },
  'F':  { bg: 'bg-rose-100 dark:bg-rose-500/15',       text: 'text-rose-700 dark:text-rose-400',       border: 'border-rose-200 dark:border-rose-500/25' },
}
const gradeColor = (g) => GRADE_COLORS[g] || GRADE_COLORS['F']

// Percentage bar color
function pctColor(pct) {
  if (pct >= 75) return 'bg-emerald-500'
  if (pct >= 60) return 'bg-cyan-500'
  if (pct >= 45) return 'bg-amber-500'
  return 'bg-rose-500'
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
function SummaryCard({ icon: Icon, label, value, color, sub }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
    rose:    'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    cyan:    'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
        {sub && <p className="text-[10px] text-slate-400 dark:text-slate-500">{sub}</p>}
      </div>
    </div>
  )
}

// ─── SCHOOL HEADER BANNER ─────────────────────────────────────────────────────
function SchoolHeader({ session, cls, term }) {
  return (
    <div className="rounded-2xl border border-green-100 dark:border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-green-50 via-white to-emerald-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-6 py-5 text-center shadow-sm">
      <div className="flex items-center justify-center gap-2 mb-1">
        <Building2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
        <h2 className="text-[16px] sm:text-[18px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
          {SCHOOL_INFO.name}
        </h2>
      </div>
      <div className="flex items-center justify-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400 mb-3">
        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
        <span>{SCHOOL_INFO.address}</span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25">
          <span className="text-[12px] font-bold text-amber-700 dark:text-amber-400">Session: {session}</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/25">
          <span className="text-[12px] font-bold text-blue-700 dark:text-blue-400">{cls}</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-500/15 border border-violet-200 dark:border-violet-500/25">
          <span className="text-[12px] font-bold text-violet-700 dark:text-violet-400">{term}</span>
        </div>
      </div>
      <p className="mt-2 text-[13px] font-bold uppercase tracking-widest text-green-700 dark:text-green-400">
        Green Sheet Report
      </p>
    </div>
  )
}

// ─── BREADCRUMB ───────────────────────────────────────────────────────────────
function Breadcrumb() {
  const crumbs = ['Home', 'Report', 'Exam Report', 'Green Sheet']
  return (
    <nav className="flex items-center gap-1.5 text-[12px] text-slate-400 dark:text-slate-500 flex-wrap">
      {crumbs.map((c, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="w-3 h-3 flex-shrink-0" />}
          <span className={i === crumbs.length - 1
            ? 'text-slate-700 dark:text-slate-200 font-semibold'
            : 'hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors'}>
            {c}
          </span>
        </span>
      ))}
    </nav>
  )
}

// ─── RESULT BADGE ─────────────────────────────────────────────────────────────
function ResultBadge({ result }) {
  if (result === 'Pass') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
      <CheckCircle2 className="w-3 h-3" /> Pass
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400">
      <XCircle className="w-3 h-3" /> Fail
    </span>
  )
}

// ─── GRADE BADGE ─────────────────────────────────────────────────────────────
function GradeBadge({ grade, size = 'sm' }) {
  const c = gradeColor(grade)
  return (
    <span className={`inline-flex items-center justify-center rounded-lg font-bold border
      ${c.bg} ${c.text} ${c.border}
      ${size === 'lg' ? 'w-10 h-10 text-[16px]' : 'w-7 h-7 text-[12px]'}`}>
      {grade}
    </span>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ student, subjects, isTotal }) {
  if (isTotal) {
    return (
      <tr className="bg-blue-50 dark:bg-indigo-500/[0.07] border-t-2 border-blue-200 dark:border-indigo-500/30 sticky bottom-0">
        <td className="px-3 py-3 text-center text-[12px] text-blue-400">—</td>
        <td className="px-3 py-3 text-[12px] font-bold text-blue-700 dark:text-blue-300">—</td>
        <td className="px-3 py-3">
          <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4" /> Class Average
          </span>
        </td>
        <td className="px-3 py-3 text-center text-[11px] text-blue-400">—</td>
        {subjects.map((sub) => (
          <td key={sub} className="px-3 py-3 text-center">
            <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">
              {student.marks[sub]}
            </span>
          </td>
        ))}
        <td className="px-3 py-3 text-center">
          <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{student.total}</span>
        </td>
        <td className="px-3 py-3 text-center">
          <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{student.percentage}%</span>
        </td>
        <td className="px-3 py-3 text-center">
          <GradeBadge grade={student.grade} />
        </td>
        <td className="px-3 py-3 text-center">
          <MinusCircle className="w-4 h-4 text-blue-400 mx-auto" />
        </td>
      </tr>
    )
  }

  const pct = student.percentage
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors group">
      <td className="px-3 py-2.5 text-center text-[11px] text-slate-400 tabular-nums w-10">{student.sno}</td>
      <td className="px-3 py-2.5 text-[12px] font-mono text-slate-500 dark:text-slate-400">{student.rollNo}</td>
      <td className="px-3 py-2.5">
        <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{student.name}</p>
        <p className="text-[11px] text-slate-400">Sec {student.section}</p>
      </td>
      <td className="px-3 py-2.5 text-center">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{student.section}</span>
      </td>
      {subjects.map((sub) => {
        const m = student.marks[sub]
        const low = m < 35
        return (
          <td key={sub} className="px-3 py-2.5 text-center">
            <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[12px] font-semibold tabular-nums
              ${low
                ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                : 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}>
              {m}
            </span>
          </td>
        )
      })}
      <td className="px-3 py-2.5 text-center">
        <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 tabular-nums">{student.total}</span>
      </td>
      <td className="px-3 py-2.5 text-center min-w-[80px]">
        <div className="flex flex-col items-center gap-1">
          <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200 tabular-nums">{pct}%</span>
          <div className="w-14 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div className={`h-full rounded-full transition-all ${pctColor(pct)}`} style={{ width: `${pct}%` }} />
          </div>
        </div>
      </td>
      <td className="px-3 py-2.5 text-center">
        <GradeBadge grade={student.grade} />
      </td>
      <td className="px-3 py-2.5 text-center">
        <ResultBadge result={student.result} />
      </td>
    </tr>
  )
}

// ─── MOBILE STUDENT CARD ──────────────────────────────────────────────────────
function MobileCard({ student, subjects }) {
  const [expanded, setExpanded] = useState(false)
  const { bg, text } = gradeColor(student.grade)
  const pct = student.percentage

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Grade badge */}
        <span className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-[16px] font-bold border ${bg} ${text} border-current/10`}>
          {student.grade}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{student.name}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Roll: <span className="font-semibold text-slate-600 dark:text-slate-300">{student.rollNo}</span>
            &nbsp;·&nbsp;Sec {student.section}
          </p>
        </div>

        <div className="flex flex-col items-end flex-shrink-0 gap-1">
          <span className="text-[18px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{pct}%</span>
          <ResultBadge result={student.result} />
        </div>

        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Progress bar */}
      <div className="px-4 pb-3">
        <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${pctColor(pct)}`} style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
          <span>Total: <span className="font-semibold">{student.total}/{student.maxTotal}</span></span>
          <span>{pct}%</span>
        </div>
      </div>

      {/* Expanded subject marks */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
            Subject-wise Marks (Max: 100)
          </p>
          <div className="grid grid-cols-2 gap-2">
            {subjects.map((sub) => {
              const m = student.marks[sub]
              const low = m < 35
              return (
                <div key={sub}
                  className={`rounded-xl border p-2.5 flex items-center justify-between gap-2
                    ${low
                      ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-[rgba(99,102,241,0.1)]'
                    }`}
                >
                  <div className="min-w-0">
                    <p className={`text-[12px] font-bold truncate ${low ? 'text-rose-700 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>{sub}</p>
                    <div className="h-1 rounded-full bg-slate-200 dark:bg-slate-700 mt-1 overflow-hidden">
                      <div className={`h-full rounded-full ${low ? 'bg-rose-400' : 'bg-blue-400'}`} style={{ width: `${m}%` }} />
                    </div>
                  </div>
                  <span className={`text-[16px] font-extrabold tabular-nums flex-shrink-0 ${low ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-100'}`}>{m}</span>
                </div>
              )
            })}
          </div>
          {/* Grade summary */}
          <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 py-2.5">
            <div>
              <p className="text-[11px] text-slate-400">Grand Total</p>
              <p className="text-[18px] font-bold text-slate-800 dark:text-slate-100 tabular-nums">{student.total} <span className="text-[13px] text-slate-400">/ {student.maxTotal}</span></p>
            </div>
            <div className="text-center">
              <p className="text-[11px] text-slate-400">Percentage</p>
              <p className="text-[18px] font-bold tabular-nums text-slate-800 dark:text-slate-100">{pct}%</p>
            </div>
            <div className="text-center">
              <p className="text-[11px] text-slate-400 mb-1">Grade</p>
              <GradeBadge grade={student.grade} size="lg" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, session, setSession, cls, setCls, term, setTerm, onShow, loading, errors, setErrors }) {
  const availableClasses = session ? CLASSES[session] || [] : []

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
            <SlidersHorizontal className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-4 space-y-4">
          <Field label="Session" error={errors.session} required>
            <NativeSelect value={session} onChange={e => { setSession(e.target.value); setCls(''); setTerm(''); setErrors(p => ({ ...p, session: undefined })) }} placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Class" error={errors.cls} required>
            <NativeSelect value={cls} onChange={e => { setCls(e.target.value); setErrors(p => ({ ...p, cls: undefined })) }} placeholder="-- Select Class --" error={errors.cls} disabled={!session}>
              {availableClasses.map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Term" error={errors.term} required>
            <NativeSelect value={term} onChange={e => { setTerm(e.target.value); setErrors(p => ({ ...p, term: undefined })) }} placeholder="-- Select Term --" error={errors.term} disabled={!cls}>
              {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
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
              bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 disabled:opacity-70 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show Report
          </button>
        </div>
      </div>
    </>
  )
}

// ─── GRADE DISTRIBUTION PILLS ─────────────────────────────────────────────────
function GradeDistribution({ rows }) {
  const grades = ['A+', 'A', 'B+', 'B', 'C', 'D', 'E', 'F']
  const dist = grades.map(g => ({ grade: g, count: rows.filter(r => r.grade === g).length })).filter(d => d.count > 0)

  return (
    <div className="flex flex-wrap gap-2">
      {dist.map(({ grade, count }) => {
        const c = gradeColor(grade)
        return (
          <span key={grade} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[12px] font-bold ${c.bg} ${c.text} ${c.border}`}>
            {grade} <span className="opacity-70">·</span> {count}
          </span>
        )
      })}
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function GreenSheetNew() {
  const [session,   setSession]   = useState('')
  const [cls,       setCls]       = useState('')
  const [term,      setTerm]      = useState('')
  const [data,      setData]      = useState(null)   // { rows, subjects }
  const [loading,   setLoading]   = useState(false)
  const [exporting, setExporting] = useState(false)
  const [filterOpen,setFilterOpen]= useState(false)
  const [search,    setSearch]    = useState('')
  const [errors,    setErrors]    = useState({})
  const [toast,     setToast]     = useState(null)
  const [shown,     setShown]     = useState(false)
  const [shownMeta, setShownMeta] = useState({})

  const availableClasses = session ? CLASSES[session] || [] : []

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Validation & Fetch ────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!session) err.session = 'Select a session'
    if (!cls)     err.cls     = 'Select a class'
    if (!term)    err.term    = 'Select a term'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      const result = generateData(cls, term)
      setData(result)
      setShownMeta({ session, cls, term })
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${result.rows.length} students for ${cls} — ${term}`)
    }, 700)
  }, [session, cls, term])

  const handleReset = () => {
    setSession(''); setCls(''); setTerm('')
    setData(null); setSearch(''); setErrors({})
    setShown(false); setShownMeta({})
  }

  const handleExcel = () => {
    if (!data?.rows?.length) { showToast('No data to export. Show report first.', 'error'); return }
    setExporting(true)
    setTimeout(() => { setExporting(false); showToast('Excel export ready! (API integration pending)') }, 1200)
  }

  // ── Search filter ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!data?.rows) return []
    if (!search) return data.rows
    const q = search.toLowerCase()
    return data.rows.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.rollNo.toLowerCase().includes(q) ||
      r.section.toLowerCase().includes(q)
    )
  }, [data, search])

  // ── Class average row ─────────────────────────────────────────────────────
  const avgRow = useMemo(() => {
    if (!filtered.length || !data?.subjects) return null
    const subjects = data.subjects
    const avg = {
      marks: {},
      total: Math.round(filtered.reduce((s, r) => s + r.total, 0) / filtered.length),
      maxTotal: filtered[0]?.maxTotal || 0,
      percentage: 0,
      grade: '',
    }
    for (const sub of subjects) {
      avg.marks[sub] = Math.round(filtered.reduce((s, r) => s + (r.marks[sub] || 0), 0) / filtered.length)
    }
    avg.percentage = Math.round((avg.total / avg.maxTotal) * 100)
    avg.grade = getGrade(avg.percentage)
    return avg
  }, [filtered, data])

  // ── Summary stats ─────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    if (!filtered.length) return {}
    const passed = filtered.filter(r => r.result === 'Pass').length
    const avgPct = Math.round(filtered.reduce((s, r) => s + r.percentage, 0) / filtered.length)
    const top = filtered.reduce((a, b) => a.percentage > b.percentage ? a : b)
    return { total: filtered.length, passed, failed: filtered.length - passed, avgPct, top }
  }, [filtered])

  const hasResults = shown && data?.rows?.length > 0
  const activeFilterCount = [session, cls, term].filter(Boolean).length

  return (
    <div className="space-y-4 pb-10">

      {/* ── Breadcrumb ───────────────────────────────────────────────────── */}
      <Breadcrumb />

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
            Green Sheet Report
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Subject-wise marks sheet — Exam result overview per class &amp; term.
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
          <span className="w-1 h-5 rounded-full bg-green-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {/* Session */}
            <Field label="Session" error={errors.session} required>
              <NativeSelect value={session} onChange={e => { setSession(e.target.value); setCls(''); setTerm(''); setErrors(p => ({ ...p, session: undefined })) }}
                placeholder="-- Select Session --" error={errors.session}>
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            {/* Class */}
            <Field label="Class" error={errors.cls} required>
              <NativeSelect value={cls} onChange={e => { setCls(e.target.value); setTerm(''); setErrors(p => ({ ...p, cls: undefined })) }}
                placeholder="-- Select Class --" error={errors.cls} disabled={!session}>
                {availableClasses.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            {/* Term */}
            <Field label="Term" error={errors.term} required>
              <NativeSelect value={term} onChange={e => { setTerm(e.target.value); setErrors(p => ({ ...p, term: undefined })) }}
                placeholder="-- Select Term --" error={errors.term} disabled={!cls}>
                {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
              </NativeSelect>
            </Field>

            {/* Actions */}
            <div className="flex gap-2">
              <button type="button" onClick={handleShow} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold text-white
                  bg-green-600 hover:bg-green-700 shadow-md shadow-green-500/20
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
            bg-green-600 text-white shadow-md shadow-green-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {activeFilterCount === 3
            ? `${shownMeta.cls || cls} · ${(shownMeta.term || term).split(' ')[0]} ${(shownMeta.term || term).split(' ')[1]}`
            : 'Select Filters'}
          {activeFilterCount > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilterCount}/3</span>
          )}
        </button>
        {hasResults && (
          <>
            <button type="button" onClick={handleExcel} disabled={exporting}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold bg-emerald-600 text-white shadow-sm disabled:opacity-70">
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            </button>
            <button type="button" onClick={handleReset}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
              <RefreshCw className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      <FilterDrawer
        open={filterOpen} onClose={() => setFilterOpen(false)}
        session={session} setSession={setSession}
        cls={cls} setCls={setCls}
        term={term} setTerm={setTerm}
        onShow={handleShow} loading={loading}
        errors={errors} setErrors={setErrors}
      />

      {/* ── Loading Skeleton ──────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
          </div>
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.1 }} />
          ))}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* School Header */}
          <SchoolHeader session={shownMeta.session} cls={shownMeta.cls} term={shownMeta.term} />

          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={Users}       label="Total Students" value={stats.total}    color="blue"    />
            <SummaryCard icon={CheckCircle2} label="Passed"        value={stats.passed}   color="emerald" sub={`${Math.round((stats.passed/stats.total)*100)}% pass rate`} />
            <SummaryCard icon={XCircle}     label="Failed"         value={stats.failed}   color="rose"    />
            <SummaryCard icon={Award}       label="Class Avg"      value={`${stats.avgPct}%`} color="amber" />
          </div>

          {/* Grade distribution */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] px-5 py-3.5 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2.5 flex items-center gap-2">
              <BarChart3 className="w-3.5 h-3.5" /> Grade Distribution
            </p>
            <GradeDistribution rows={filtered} />
          </div>

          {/* Results Table Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-green-500 flex-shrink-0" />
                <ClipboardList className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Student Marks Sheet</span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">· {shownMeta.cls}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400 flex-shrink-0">
                  {filtered.length} student{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>
              {/* Search */}
              <div className="relative w-full sm:w-52 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Name, Roll No, Section…"
                  className="w-full pl-8 pr-7 py-1.5 text-[12px] rounded-lg border outline-none transition-all
                    bg-white text-slate-700 border-slate-200 placeholder-slate-300
                    focus:border-green-400 focus:ring-2 focus:ring-green-100
                    dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                    dark:placeholder-slate-600 dark:focus:border-green-400"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Info hint */}
            <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-green-50/20 dark:bg-green-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
              <p className="text-[12px] text-green-700 dark:text-green-400">
                Marks highlighted in red indicate below-passing score (&lt;35). Scroll right to see all subjects.
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
                      {['S.No.', 'Roll No', 'Student Name', 'Sec', ...data.subjects, 'Total', '%', 'Grade', 'Result'].map((h, i) => (
                        <th key={i} className="px-3 py-2.5 text-center text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((student) => (
                      <DesktopRow key={student.rollNo} student={student} subjects={data.subjects} />
                    ))}
                    {avgRow && <DesktopRow student={avgRow} subjects={data.subjects} isTotal />}
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
                  <p className="text-[11px] text-green-600 dark:text-green-400 font-medium flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap a student card to see subject-wise marks.
                  </p>
                  {filtered.map((student) => (
                    <MobileCard key={student.rollNo} student={student} subjects={data.subjects} />
                  ))}

                  {/* Mobile class average */}
                  {avgRow && (
                    <div className="rounded-xl border-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07] p-4">
                      <p className="text-[12px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> Class Average
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                          <p className="text-[20px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{avgRow.total}</p>
                          <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Avg Total</p>
                        </div>
                        <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                          <p className="text-[20px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{avgRow.percentage}%</p>
                          <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Avg %</p>
                        </div>
                        <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center flex flex-col items-center">
                          <GradeBadge grade={avgRow.grade} size="lg" />
                          <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 mt-1">Avg Grade</p>
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
                <span className="font-semibold text-slate-700 dark:text-slate-300">{data.rows.length}</span> students
              </p>
              {search && (
                <button onClick={() => setSearch('')}
                  className="text-[12px] text-green-600 dark:text-green-400 hover:underline flex items-center gap-1">
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
            <GraduationCap className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select <strong>Session → Class → Term</strong> and click <strong>Show</strong> to generate the Green Sheet.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
