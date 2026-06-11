/**
 * OverallExaminationReport.jsx
 * Folder: src/pages/Reports/OverallExaminationReport.jsx
 *
 * Converts legacy ASPX "Overall Examination Report" to fully-responsive React + Tailwind.
 *
 * Columns: S.No, Student Name, Roll No, Subjects (marks), Total, Percentage, Grade, Result
 * Features:
 *  - Session & Class dropdown filters
 *  - Show report button + Excel export
 *  - School name / address / session / class header
 *  - Grand summary footer
 *  - Mobile: collapsible student cards with marks breakdown
 *  - Desktop: dense ERP-style table
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye,
  AlertCircle, X, Check, Loader2, ChevronDown,
  SlidersHorizontal, Info, Search,
  BarChart3, FileSpreadsheet, BookOpen,
  Building2, MapPin, ChevronRight,
  Award, TrendingUp, GraduationCap,
  Users, CheckCircle2, XCircle, Medal
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ─────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CLASSES = [
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X',
  'Class XI', 'Class XII',
]

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

// Subjects per class group
const SUBJECTS_MAP = {
  primary: ['Hindi', 'English', 'Maths', 'EVS', 'Drawing'],
  middle:  ['Hindi', 'English', 'Maths', 'Science', 'Social', 'Sanskrit'],
  high:    ['Hindi', 'English', 'Maths', 'Science', 'Social Science'],
  senior:  ['English', 'Physics', 'Chemistry', 'Maths', 'Biology/CS'],
}

const getSubjects = (cls) => {
  const n = parseInt(cls.replace('Class ', '')) || 0
  if (n <= 5)  return SUBJECTS_MAP.primary
  if (n <= 8)  return SUBJECTS_MAP.middle
  if (n <= 10) return SUBJECTS_MAP.high
  return SUBJECTS_MAP.senior
}

const GRADE_LABELS = { 'A+': '#16a34a', A: '#059669', B: '#2563eb', C: '#d97706', D: '#dc2626', F: '#9f1239' }

const getGrade = (pct) => {
  if (pct >= 90) return 'A+'
  if (pct >= 75) return 'A'
  if (pct >= 60) return 'B'
  if (pct >= 45) return 'C'
  if (pct >= 33) return 'D'
  return 'F'
}

// Generate deterministic pseudo-random student data
const seed = (s) => { let x = Math.sin(s + 1) * 10000; return x - Math.floor(x) }

const generateStudents = (cls, session) => {
  const subjects = getSubjects(cls)
  const maxMarks = 100
  const sessionIdx = SESSIONS.indexOf(session) + 1
  const classIdx = CLASSES.indexOf(cls) + 1
  const count = 18 + (classIdx % 5) * 3

  return Array.from({ length: count }, (_, i) => {
    const base = sessionIdx * 100 + classIdx * 10 + i
    const marks = subjects.map((_, si) => {
      const raw = Math.floor(seed(base + si * 31) * 55) + 35
      return Math.min(raw, maxMarks)
    })
    const total = marks.reduce((a, b) => a + b, 0)
    const maxTotal = maxMarks * subjects.length
    const pct = Math.round((total / maxTotal) * 100)
    const grade = getGrade(pct)
    const failed = marks.some(m => m < 33)

    const firstNames = ['Aarav','Priya','Rohit','Sneha','Vikram','Pooja','Arjun','Nisha','Karan','Ananya','Raj','Divya','Amit','Sunita','Dev','Meera','Anil','Kavita','Saurabh','Ritu']
    const lastNames  = ['Sharma','Verma','Singh','Gupta','Yadav','Joshi','Kumar','Patel','Mehta','Tiwari']

    return {
      id: i + 1,
      name: `${firstNames[(base * 3) % firstNames.length]} ${lastNames[(base * 7) % lastNames.length]}`,
      rollNo: `${sessionIdx}${classIdx.toString().padStart(2,'0')}${(i + 1).toString().padStart(3,'0')}`,
      marks,
      total,
      maxTotal,
      percentage: pct,
      grade,
      result: failed ? 'FAIL' : 'PASS',
    }
  })
}

// ─── PRIMITIVE COMPONENTS ────────────────────────────────────────────────────

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

// ─── GRADE BADGE ─────────────────────────────────────────────────────────────
function GradeBadge({ grade, size = 'sm' }) {
  const colors = {
    'A+': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300',
    'A':  'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300',
    'B':  'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300',
    'C':  'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
    'D':  'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300',
    'F':  'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300',
  }
  const sz = size === 'lg' ? 'px-3 py-1.5 text-[13px]' : 'px-2.5 py-0.5 text-[11px]'
  return (
    <span className={`inline-flex items-center justify-center rounded-lg font-bold tabular-nums ${sz} ${colors[grade] || colors['F']}`}>
      {grade}
    </span>
  )
}

// ─── RESULT BADGE ────────────────────────────────────────────────────────────
function ResultBadge({ result }) {
  const pass = result === 'PASS'
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold
      ${pass
        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
        : 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300'
      }`}>
      {pass ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {result}
    </span>
  )
}

// ─── SUMMARY STAT CARD ────────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, color, sub }) {
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
        {sub && <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{sub}</p>}
      </div>
    </div>
  )
}

// ─── SCHOOL HEADER BANNER ─────────────────────────────────────────────────────
function SchoolHeader({ session, className }) {
  return (
    <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-6 py-5 text-center shadow-sm">
      <div className="flex items-center justify-center gap-2 mb-1">
        <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <h2 className="text-[15px] sm:text-[17px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
          {SCHOOL_INFO.name}
        </h2>
      </div>
      <div className="flex items-center justify-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400 mb-3">
        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
        <span>{SCHOOL_INFO.address}</span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25">
          <span className="text-[12px] font-bold text-amber-700 dark:text-amber-400">Session: {session}</span>
        </span>
        <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-blue-100 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/25">
          <span className="text-[12px] font-bold text-blue-700 dark:text-blue-400">{className}</span>
        </span>
      </div>
      <p className="mt-2.5 text-[13px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400">
        Overall Examination Report
      </p>
    </div>
  )
}

// ─── PERCENTAGE BAR ───────────────────────────────────────────────────────────
function PctBar({ pct }) {
  const color =
    pct >= 75 ? 'bg-emerald-500' :
    pct >= 60 ? 'bg-blue-500' :
    pct >= 45 ? 'bg-amber-400' :
    pct >= 33 ? 'bg-orange-400' : 'bg-rose-500'
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden min-w-[40px]">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[12px] font-bold tabular-nums text-slate-700 dark:text-slate-200 w-9 text-right flex-shrink-0">{pct}%</span>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ student, subjects, isTotal }) {
  if (isTotal) {
    return (
      <tr className="bg-blue-50 dark:bg-indigo-500/[0.07] border-t-2 border-blue-200 dark:border-indigo-500/30">
        <td className="px-3 py-3 text-center text-[12px] text-blue-400">—</td>
        <td className="px-3 py-3" colSpan={2}>
          <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Class Summary
          </span>
        </td>
        {subjects.map((_, si) => (
          <td key={si} className="px-3 py-3 text-center">
            <span className="text-[13px] font-bold text-slate-600 dark:text-slate-300 tabular-nums">
              {student.subjectTotals?.[si] ?? '—'}
            </span>
          </td>
        ))}
        <td className="px-3 py-3 text-center">
          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[12px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 tabular-nums">{student.total}</span>
        </td>
        <td className="px-3 py-3 text-center">
          <PctBar pct={student.percentage} />
        </td>
        <td className="px-3 py-3 text-center"><GradeBadge grade={student.grade} /></td>
        <td className="px-3 py-3 text-center"><ResultBadge result={student.result} /></td>
      </tr>
    )
  }

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.015] transition-colors">
      <td className="px-3 py-3 text-center text-[12px] text-slate-400 tabular-nums w-10">{student.id}</td>
      <td className="px-3 py-3">
        <div>
          <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap">{student.name}</p>
          <p className="text-[11px] text-slate-400 tabular-nums">Roll: {student.rollNo}</p>
        </div>
      </td>
      <td className="px-3 py-3 text-center">
        <span className="text-[12px] font-mono text-slate-500 dark:text-slate-400">{student.rollNo}</span>
      </td>
      {student.marks.map((m, si) => {
        const fail = m < 33
        return (
          <td key={si} className="px-3 py-3 text-center">
            <span className={`inline-flex items-center justify-center w-9 h-8 rounded-lg text-[12px] font-bold tabular-nums
              ${fail
                ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                : 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
              }`}>
              {m}
            </span>
          </td>
        )
      })}
      <td className="px-3 py-3 text-center">
        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[12px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 tabular-nums">
          {student.total}/{student.maxTotal}
        </span>
      </td>
      <td className="px-3 py-3 min-w-[110px]">
        <PctBar pct={student.percentage} />
      </td>
      <td className="px-3 py-3 text-center"><GradeBadge grade={student.grade} /></td>
      <td className="px-3 py-3 text-center"><ResultBadge result={student.result} /></td>
    </tr>
  )
}

// ─── MOBILE STUDENT CARD ──────────────────────────────────────────────────────
function MobileCard({ student, subjects }) {
  const [expanded, setExpanded] = useState(false)
  const pass = student.result === 'PASS'

  return (
    <div className={`rounded-xl border bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm
      ${pass
        ? 'border-slate-200 dark:border-[rgba(99,102,241,0.15)]'
        : 'border-rose-200 dark:border-rose-500/20'
      }`}>

      {/* Header row */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Rank circle */}
        <span className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          #{student.id}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{student.name}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Roll No: <span className="font-mono">{student.rollNo}</span></p>
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <GradeBadge grade={student.grade} />
          <ResultBadge result={student.result} />
        </div>

        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Percentage bar always visible */}
      <div className="px-4 pb-3">
        <div className="flex items-center justify-between text-[11px] mb-1.5">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Score: <span className="font-bold text-slate-700 dark:text-slate-200 tabular-nums">{student.total}/{student.maxTotal}</span></span>
          <span className="font-bold tabular-nums text-slate-700 dark:text-slate-200">{student.percentage}%</span>
        </div>
        <PctBar pct={student.percentage} />
      </div>

      {/* Expanded: subject-wise marks */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2.5">Subject-wise Marks (Max: 100)</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {subjects.map((sub, si) => {
              const m = student.marks[si]
              const fail = m < 33
              return (
                <div key={si}
                  className={`rounded-xl p-2.5 border text-center
                    ${fail
                      ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700/50'
                    }`}>
                  <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 truncate">{sub}</p>
                  <p className={`text-[20px] font-bold tabular-nums leading-tight
                    ${fail ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-100'}`}>
                    {m}
                  </p>
                  {fail && <p className="text-[10px] font-bold text-rose-500 mt-0.5">FAIL</p>}
                </div>
              )
            })}
          </div>

          {/* Mini summary strip */}
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Grade:</span>
            <GradeBadge grade={student.grade} size="lg" />
            <span className="mx-1 text-slate-300 dark:text-slate-700">·</span>
            <ResultBadge result={student.result} />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, session, setSession, cls, setCls, onShow, loading, errors }) {
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
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Search Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
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
          <Field label="Class" error={errors.cls} required>
            <NativeSelect
              value={cls}
              onChange={e => setCls(e.target.value)}
              placeholder="-- Select Class --"
              error={errors.cls}
            >
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
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

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function OverallExaminationReport() {
  const [session,      setSession]      = useState('')
  const [cls,          setCls]          = useState('')
  const [students,     setStudents]     = useState([])
  const [subjects,     setSubjects]     = useState([])
  const [loading,      setLoading]      = useState(false)
  const [exporting,    setExporting]    = useState(false)
  const [filterOpen,   setFilterOpen]   = useState(false)
  const [search,       setSearch]       = useState('')
  const [errors,       setErrors]       = useState({})
  const [toast,        setToast]        = useState(null)
  const [shown,        setShown]        = useState(false)
  const [shownSession, setShownSession] = useState('')
  const [shownCls,     setShownCls]     = useState('')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Fetch (simulate API) ─────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!session) err.session = 'Please select a session'
    if (!cls)     err.cls     = 'Please select a class'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      const subs = getSubjects(cls)
      const data = generateStudents(cls, session)
      setSubjects(subs)
      setStudents(data)
      setShownSession(session)
      setShownCls(cls)
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} students for ${cls} — Session ${session}.`)
    }, 700)
  }, [session, cls])

  const handleReset = () => {
    setSession(''); setCls(''); setStudents([]); setSubjects([])
    setSearch(''); setErrors({}); setShown(false)
    setShownSession(''); setShownCls('')
  }

  const handleExcel = () => {
    if (!students.length) { showToast('No data to export. Show report first.', 'error'); return }
    setExporting(true)
    setTimeout(() => {
      setExporting(false)
      showToast('Excel export ready! (API integration pending)')
    }, 1200)
  }

  // ── Search filter ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return students
    const q = search.toLowerCase()
    return students.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.rollNo.toLowerCase().includes(q)
    )
  }, [students, search])

  // ── Summary stats ────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    if (!filtered.length) return null
    const passed  = filtered.filter(s => s.result === 'PASS').length
    const avgPct  = Math.round(filtered.reduce((a, s) => a + s.percentage, 0) / filtered.length)
    const toppers = [...filtered].sort((a, b) => b.percentage - a.percentage).slice(0, 1)
    const subjectTotals = subjects.map((_, si) => filtered.reduce((a, s) => a + s.marks[si], 0))
    const grandTotal    = filtered.reduce((a, s) => a + s.total, 0)
    const grandMax      = filtered.reduce((a, s) => a + s.maxTotal, 0)
    const topGrade = getGrade(avgPct)

    // For summary row
    const summaryRow = {
      total: grandTotal, maxTotal: grandMax,
      percentage: Math.round((grandTotal / grandMax) * 100),
      grade: topGrade, result: passed === filtered.length ? 'PASS' : `${passed}/${filtered.length}`,
      subjectTotals,
    }
    return { passed, failed: filtered.length - passed, avgPct, toppers, summaryRow }
  }, [filtered, subjects])

  const hasResults   = shown && students.length > 0
  const activeFilters = [session, cls].filter(Boolean).length

  return (
    <div className="space-y-4 pb-10">
      <style>{`
        @keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        @keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
      `}</style>

      {/* ── Page Title ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-blue-600 dark:text-indigo-400" />
            Overall Examination Report
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Class-wise student performance — marks, grade &amp; result overview.
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

      {/* ── DESKTOP Filter Card ─────────────────────────────────────────── */}
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

            <Field label="Class" error={errors.cls} required>
              <NativeSelect
                value={cls}
                onChange={e => { setCls(e.target.value); setErrors(p => ({ ...p, cls: undefined })) }}
                placeholder="-- Select Class --"
                error={errors.cls}
              >
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

      {/* ── MOBILE Filter Bar ──────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {activeFilters > 0
            ? `${shownCls || cls || 'Class'} · ${shownSession || session || 'Session'}`
            : 'Select Filters'}
          {activeFilters > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilters}</span>
          )}
        </button>
        {hasResults && (
          <button type="button" onClick={handleExcel} disabled={exporting}
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
        session={session} setSession={setSession}
        cls={cls} setCls={setCls}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ───────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
          </div>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      )}

      {/* ── Results ────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* School Header */}
          <SchoolHeader session={shownSession} className={shownCls} />

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={Users}      label="Total Students"  value={filtered.length}    color="blue"    />
            <SummaryCard icon={CheckCircle2} label="Passed"        value={stats?.passed ?? 0} color="emerald" />
            <SummaryCard icon={XCircle}    label="Failed"          value={stats?.failed ?? 0} color="rose"    />
            <SummaryCard icon={Medal}      label="Class Average"   value={`${stats?.avgPct ?? 0}%`} color="amber" sub={`Grade: ${getGrade(stats?.avgPct ?? 0)}`} />
          </div>

          {/* Results card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">{shownCls} — Exam Results</span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">· {shownSession}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                  {filtered.length} student{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>
              {/* Search */}
              <div className="relative w-full sm:w-56 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search name or roll no…"
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

            {/* Info bar */}
            <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <p className="text-[12px] text-blue-700 dark:text-blue-400">
                Red marks indicate below 33 (fail in that subject). Total is sum of all subjects. Grade based on percentage.
              </p>
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block overflow-x-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No students match your search.</span>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                      <th className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 w-10">S.No.</th>
                      <th className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Student</th>
                      <th className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Roll No.</th>
                      {subjects.map(sub => (
                        <th key={sub} className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">{sub}</th>
                      ))}
                      <th className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Total</th>
                      <th className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 min-w-[110px]">Percentage</th>
                      <th className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Grade</th>
                      <th className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(stu => (
                      <DesktopRow key={stu.id} student={stu} subjects={subjects} />
                    ))}
                    {/* Summary row */}
                    {stats && <DesktopRow student={stats.summaryRow} subjects={subjects} isTotal />}
                  </tbody>
                </table>
              )}
            </div>

            {/* ── MOBILE CARDS ── */}
            <div className="md:hidden p-4 space-y-3">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No students match your search.</span>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap a card to see subject-wise marks breakdown.
                  </p>

                  {filtered.map(stu => (
                    <MobileCard key={stu.id} student={stu} subjects={subjects} />
                  ))}

                  {/* Mobile Grand Summary */}
                  {stats && (
                    <div className="rounded-xl border-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07] p-4 mt-2">
                      <p className="text-[12px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                        <Award className="w-4 h-4" /> Class Summary — {filtered.length} Students
                      </p>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                          <p className="text-[22px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">{stats.passed}</p>
                          <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Passed</p>
                        </div>
                        <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                          <p className="text-[22px] font-bold text-rose-700 dark:text-rose-300 tabular-nums">{stats.failed}</p>
                          <p className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">Failed</p>
                        </div>
                        <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                          <p className="text-[22px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{stats.avgPct}%</p>
                          <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Avg. Score</p>
                        </div>
                        <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                          <div className="flex items-center justify-center mb-1">
                            <GradeBadge grade={getGrade(stats.avgPct)} size="lg" />
                          </div>
                          <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">Class Grade</p>
                        </div>
                      </div>
                      {/* Pass rate bar */}
                      <div>
                        <div className="flex text-[10px] font-semibold justify-between mb-1">
                          <span className="text-emerald-600 dark:text-emerald-400">
                            Pass {filtered.length ? Math.round((stats.passed / filtered.length) * 100) : 0}%
                          </span>
                          <span className="text-rose-600 dark:text-rose-400">
                            Fail {filtered.length ? Math.round((stats.failed / filtered.length) * 100) : 0}%
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-rose-200 dark:bg-rose-500/20 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                            style={{ width: `${filtered.length ? Math.round((stats.passed / filtered.length) * 100) : 0}%` }}
                          />
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
                <span className="font-semibold text-slate-700 dark:text-slate-300">{students.length}</span> students
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

      {/* ── Empty State ─────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <BarChart3 className="w-8 h-8 opacity-50" />
          </div>
          <div className="text-center max-w-xs">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a session and class, then click <strong>Show</strong> to generate the examination report.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
