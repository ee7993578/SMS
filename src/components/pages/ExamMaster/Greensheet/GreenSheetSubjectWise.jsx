/**
 * GreenSheetSubjectWise.jsx
 * Folder: src/pages/Reports/Exam/GreenSheetSubjectWise.jsx
 *
 * Converts legacy ASPX "Subject Wise Green Sheet" to fully-responsive React + Tailwind.
 *
 * Workflow: Select Session → Select Class (auto-loads subjects) → Select Subject → Show
 * Features:
 *  - Session & Class dropdowns, Subject auto-populated on class change
 *  - Show button triggers green sheet table
 *  - Per-student subject marks, grade, pass/fail status
 *  - Summary stats: appeared, passed, failed, absent, pass%
 *  - Desktop: dense ERP table | Mobile: card-based layout with accordions
 *  - Search by student name/roll
 *  - Excel export placeholder
 *  - Toast notifications, loading skeletons, empty states
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye, AlertCircle, X, Check, Loader2,
  ChevronDown, ChevronRight, Search, FileSpreadsheet,
  BookOpen, School2, MapPin, Building2, SlidersHorizontal,
  Users, TrendingUp, TrendingDown, UserX, Info, BarChart3,
  Award, ClipboardList
} from 'lucide-react'

// ─── STATIC DATA ──────────────────────────────────────────────────────────────
const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

const CLASSES = [
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X',
  'Class XI', 'Class XII',
]

const SUBJECTS_BY_CLASS = {
  'Class I':    ['English', 'Hindi', 'Mathematics', 'EVS'],
  'Class II':   ['English', 'Hindi', 'Mathematics', 'EVS'],
  'Class III':  ['English', 'Hindi', 'Mathematics', 'EVS'],
  'Class IV':   ['English', 'Hindi', 'Mathematics', 'EVS', 'GK'],
  'Class V':    ['English', 'Hindi', 'Mathematics', 'EVS', 'GK'],
  'Class VI':   ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Sanskrit'],
  'Class VII':  ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Sanskrit'],
  'Class VIII': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Sanskrit'],
  'Class IX':   ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Sanskrit'],
  'Class X':    ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Sanskrit'],
  'Class XI':   ['English', 'Physics', 'Chemistry', 'Mathematics', 'Computer Science'],
  'Class XII':  ['English', 'Physics', 'Chemistry', 'Mathematics', 'Computer Science'],
}

// Helper to generate deterministic dummy marks
const genMarks = (seed, max = 100) => {
  const val = ((seed * 37 + 19) % 45) + 38 // 38–82 range
  return Math.min(val, max)
}

const GRADES = [
  { min: 90, grade: 'A+', color: 'emerald' },
  { min: 75, grade: 'A',  color: 'green'   },
  { min: 60, grade: 'B+', color: 'blue'    },
  { min: 50, grade: 'B',  color: 'cyan'    },
  { min: 33, grade: 'C',  color: 'amber'   },
  { min: 0,  grade: 'F',  color: 'rose'    },
]
const getGrade = (marks, max = 100) => {
  const pct = (marks / max) * 100
  return GRADES.find(g => pct >= g.min) || GRADES[GRADES.length - 1]
}

// Generate student list for a class+subject combo
const generateStudents = (cls, subject, session) => {
  const counts = { 'Class I': 45, 'Class II': 44, 'Class III': 40, 'Class IV': 37, 'Class V': 40, 'Class VI': 49, 'Class VII': 46, 'Class VIII': 39, 'Class IX': 41, 'Class X': 42, 'Class XI': 50, 'Class XII': 48 }
  const count  = counts[cls] || 40
  const names  = ['Aarav', 'Priya', 'Rohit', 'Sneha', 'Arjun', 'Kavya', 'Vikram', 'Ananya', 'Raj', 'Deepa', 'Amit', 'Pooja', 'Suresh', 'Meena', 'Nikhil', 'Riya', 'Sanjay', 'Tanya', 'Ajay', 'Nisha', 'Karan', 'Simran', 'Varun', 'Divya', 'Harsh', 'Ankita', 'Pankaj', 'Isha', 'Gaurav', 'Pallavi', 'Saurabh', 'Shweta', 'Tushar', 'Radhika', 'Mayank', 'Preeti', 'Abhishek', 'Monika', 'Rahul', 'Kajal', 'Dev', 'Swati', 'Alok', 'Sunita', 'Vivek', 'Geeta', 'Ravi', 'Sapna', 'Anil', 'Rekha']
  const surns  = ['Sharma', 'Gupta', 'Singh', 'Verma', 'Kumar', 'Yadav', 'Mishra', 'Tiwari', 'Pandey', 'Joshi', 'Agarwal', 'Saxena', 'Srivastava', 'Chauhan', 'Rawat']
  const sessionOffset = SESSIONS.indexOf(session) * 100

  return Array.from({ length: count }, (_, i) => {
    const seed    = i + cls.charCodeAt(cls.length - 1) + subject.charCodeAt(0) + sessionOffset
    const absent  = (seed % 11 === 0) // ~9% absent
    const mm      = 100
    const marks   = absent ? null : genMarks(seed, mm)
    const grade   = absent ? null : getGrade(marks, mm)
    const passing = 33
    return {
      sno:    i + 1,
      roll:   String(i + 1).padStart(3, '0'),
      name:   `${names[i % names.length]} ${surns[i % surns.length]}`,
      maxMarks: mm,
      marks,
      absent,
      pass:   !absent && marks >= passing,
      grade,
    }
  })
}

// ─── COLOUR HELPERS ──────────────────────────────────────────────────────────
const GRADE_CLASSES = {
  emerald: { badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300', dot: 'bg-emerald-500' },
  green:   { badge: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300',         dot: 'bg-green-500'   },
  blue:    { badge: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300',             dot: 'bg-blue-500'    },
  cyan:    { badge: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-300',             dot: 'bg-cyan-500'    },
  amber:   { badge: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',         dot: 'bg-amber-500'   },
  rose:    { badge: 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300',             dot: 'bg-rose-500'    },
}

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────

function NativeSelect({ value, onChange, children, placeholder, error, disabled }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full appearance-none pl-3 pr-8 py-2 text-[13px] rounded-lg border outline-none transition-all cursor-pointer
          bg-white text-slate-800 focus:border-green-400 focus:ring-2 focus:ring-green-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-green-500 dark:focus:ring-green-500/20
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
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
      {type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// ─── SUMMARY STAT CARD ────────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, sub, color }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    rose:    'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
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
        {sub && <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{sub}</p>}
      </div>
    </div>
  )
}

// ─── SCHOOL HEADER ────────────────────────────────────────────────────────────
function SchoolHeader({ session, cls, subject }) {
  return (
    <div className="rounded-2xl border border-green-100 dark:border-[rgba(34,197,94,0.2)] bg-gradient-to-r from-green-50 via-white to-emerald-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-6 py-5 text-center shadow-sm">
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
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25 text-[12px] font-bold text-amber-700 dark:text-amber-400">
          Session: {session}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/25 text-[12px] font-bold text-blue-700 dark:text-blue-400">
          {cls}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 dark:bg-green-500/15 border border-green-200 dark:border-green-500/25 text-[12px] font-bold text-green-700 dark:text-green-400">
          {subject}
        </span>
      </div>
      <p className="mt-2 text-[13px] font-bold uppercase tracking-widest text-green-700 dark:text-green-400">
        Subject Wise Green Sheet
      </p>
    </div>
  )
}

// ─── MARKS PILL ───────────────────────────────────────────────────────────────
function MarksPill({ marks, max, absent }) {
  if (absent) return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">AB</span>
  )
  const pct   = Math.round((marks / max) * 100)
  const grade = getGrade(marks, max)
  const cls   = GRADE_CLASSES[grade.color]
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[12px] font-bold tabular-nums ${cls.badge}`}>
      {marks}<span className="text-[10px] opacity-60">/{max}</span>
    </span>
  )
}

function GradeBadge({ grade, absent }) {
  if (absent || !grade) return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">—</span>
  )
  const cls = GRADE_CLASSES[grade.color]
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[12px] font-bold ${cls.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cls.dot}`} />
      {grade.grade}
    </span>
  )
}

function StatusBadge({ pass, absent }) {
  if (absent) return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
      Absent
    </span>
  )
  return pass
    ? <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">Pass</span>
    : <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300">Fail</span>
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, isTotal }) {
  if (isTotal) {
    return (
      <tr className="bg-green-50 dark:bg-green-500/[0.07] border-t-2 border-green-200 dark:border-green-500/30">
        <td className="px-4 py-3 text-center text-[12px] text-slate-400">—</td>
        <td className="px-4 py-3 text-[12px] text-slate-400">—</td>
        <td className="px-4 py-3">
          <span className="text-[13px] font-bold text-green-700 dark:text-green-300 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Class Summary
          </span>
        </td>
        <td className="px-4 py-3 text-center">
          <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-[13px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 tabular-nums">{row.appeared}</span>
        </td>
        <td className="px-4 py-3 text-center">
          <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-[13px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 tabular-nums">{row.passed}</span>
        </td>
        <td className="px-4 py-3 text-center">
          <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-[13px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 tabular-nums">{row.failed}</span>
        </td>
        <td className="px-4 py-3 text-center">
          <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-[13px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 tabular-nums">{row.absent}</span>
        </td>
        <td className="px-4 py-3 text-center">
          <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-[13px] font-bold bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-300 tabular-nums">{row.passPct}%</span>
        </td>
      </tr>
    )
  }

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">{row.sno}</td>
      <td className="px-4 py-3 text-center text-[12px] font-mono font-semibold text-slate-600 dark:text-slate-300">{row.roll}</td>
      <td className="px-4 py-3">
        <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{row.name}</span>
      </td>
      <td className="px-4 py-3 text-center"><MarksPill marks={row.marks} max={row.maxMarks} absent={row.absent} /></td>
      <td className="px-4 py-3 text-center"><GradeBadge grade={row.grade} absent={row.absent} /></td>
      <td className="px-4 py-3 text-center"><StatusBadge pass={row.pass} absent={row.absent} /></td>
      <td className="px-4 py-3 text-center">
        {!row.absent && (
          <div className="flex items-center gap-1.5 justify-center">
            <div className="h-1.5 w-16 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${row.pass ? 'bg-emerald-500' : 'bg-rose-400'}`}
                style={{ width: `${Math.round((row.marks / row.maxMarks) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 tabular-nums">{Math.round((row.marks / row.maxMarks) * 100)}%</span>
          </div>
        )}
        {row.absent && <span className="text-[11px] text-slate-400">—</span>}
      </td>
    </tr>
  )
}

// ─── MOBILE STUDENT CARD ──────────────────────────────────────────────────────
function MobileCard({ row }) {
  const [expanded, setExpanded] = useState(false)
  const pct = row.absent ? 0 : Math.round((row.marks / row.maxMarks) * 100)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Roll number circle */}
        <span className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[11px] font-bold bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400">
          {row.roll}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{row.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <StatusBadge pass={row.pass} absent={row.absent} />
            {!row.absent && <GradeBadge grade={row.grade} />}
          </div>
        </div>

        <div className="flex flex-col items-end flex-shrink-0">
          {row.absent
            ? <span className="text-[13px] font-bold text-slate-400">Absent</span>
            : <span className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{row.marks}</span>
          }
          {!row.absent && <span className="text-[10px] text-slate-400">/{row.maxMarks}</span>}
        </div>

        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Progress bar */}
      {!row.absent && (
        <div className="px-4 pb-3">
          <div className="flex text-[10px] font-semibold justify-between mb-1">
            <span className={row.pass ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}>
              {pct}% Marks
            </span>
            <span className="text-slate-400">Pass: 33%</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${row.pass ? 'bg-emerald-500' : 'bg-rose-400'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-3 text-center">
              <p className="text-[22px] font-bold text-blue-700 dark:text-blue-300 tabular-nums leading-tight">
                {row.absent ? 'AB' : row.marks}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400 mt-0.5">Marks</p>
            </div>
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-3 text-center">
              <p className="text-[22px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums leading-tight">
                {row.absent ? '—' : row.grade?.grade}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 mt-0.5">Grade</p>
            </div>
            <div className={`rounded-xl border p-3 text-center ${row.absent ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700' : row.pass ? 'bg-green-50 dark:bg-green-500/10 border-green-100 dark:border-green-500/20' : 'bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20'}`}>
              <p className={`text-[16px] font-bold leading-tight mt-1 ${row.absent ? 'text-slate-500' : row.pass ? 'text-green-700 dark:text-green-300' : 'text-rose-700 dark:text-rose-300'}`}>
                {row.absent ? 'AB' : row.pass ? 'Pass' : 'Fail'}
              </p>
              <p className={`text-[10px] font-bold uppercase tracking-wide mt-0.5 ${row.absent ? 'text-slate-500' : row.pass ? 'text-green-600 dark:text-green-400' : 'text-rose-600 dark:text-rose-400'}`}>Status</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, session, setSession, cls, setCls, subject, setSubject, subjects, onShow, loading, errors }) {
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
        <div className="px-5 py-5 space-y-4">
          <Field label="Session" error={errors.session} required>
            <NativeSelect value={session} onChange={e => setSession(e.target.value)} placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Class" error={errors.cls} required>
            <NativeSelect value={cls} onChange={e => { setCls(e.target.value); setSubject('') }} placeholder="-- Select Class --" error={errors.cls}>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Subject" error={errors.subject} required>
            <NativeSelect value={subject} onChange={e => setSubject(e.target.value)} placeholder="-- Select Subject --" error={errors.subject} disabled={!cls}>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
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
              bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 disabled:opacity-70 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function GreenSheetSubjectWise() {
  const [session,      setSession]      = useState('')
  const [cls,          setCls]          = useState('')
  const [subject,      setSubject]      = useState('')
  const [rows,         setRows]         = useState([])
  const [loading,      setLoading]      = useState(false)
  const [exporting,    setExporting]    = useState(false)
  const [filterOpen,   setFilterOpen]   = useState(false)
  const [search,       setSearch]       = useState('')
  const [errors,       setErrors]       = useState({})
  const [toast,        setToast]        = useState(null)
  const [shown,        setShown]        = useState(false)
  const [shownMeta,    setShownMeta]    = useState({ session: '', cls: '', subject: '' })
  const [activeTab,    setActiveTab]    = useState('all') // 'all' | 'pass' | 'fail' | 'absent'

  // Subjects list driven by selected class
  const subjects = useMemo(() => (cls ? SUBJECTS_BY_CLASS[cls] || [] : []), [cls])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Validation & Fetch ────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!session) err.session = 'Select a session'
    if (!cls)     err.cls     = 'Select a class'
    if (!subject) err.subject = 'Select a subject'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')
    setActiveTab('all')

    setTimeout(() => {
      const data = generateStudents(cls, subject, session)
      setRows(data)
      setShownMeta({ session, cls, subject })
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} student records.`)
    }, 700)
  }, [session, cls, subject])

  const handleReset = () => {
    setSession(''); setCls(''); setSubject(''); setRows([])
    setSearch(''); setErrors({}); setShown(false)
    setShownMeta({ session: '', cls: '', subject: '' })
    setActiveTab('all')
  }

  const handleClassChange = (val) => { setCls(val); setSubject(''); setErrors(p => ({ ...p, cls: undefined, subject: undefined })) }

  // ── Excel Export placeholder ──────────────────────────────────────────────
  const handleExcel = () => {
    if (rows.length === 0) { showToast('No data to export.', 'error'); return }
    setExporting(true)
    setTimeout(() => { setExporting(false); showToast('Excel export ready! (API integration pending)') }, 1200)
  }

  // ── Filters ───────────────────────────────────────────────────────────────
  const tabFiltered = useMemo(() => {
    switch (activeTab) {
      case 'pass':   return rows.filter(r => !r.absent && r.pass)
      case 'fail':   return rows.filter(r => !r.absent && !r.pass)
      case 'absent': return rows.filter(r => r.absent)
      default:       return rows
    }
  }, [rows, activeTab])

  const filtered = useMemo(() => {
    if (!search) return tabFiltered
    const q = search.toLowerCase()
    return tabFiltered.filter(r => r.name.toLowerCase().includes(q) || r.roll.includes(q))
  }, [tabFiltered, search])

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const appeared = rows.filter(r => !r.absent).length
    const passed   = rows.filter(r => r.pass).length
    const failed   = rows.filter(r => !r.absent && !r.pass).length
    const absent   = rows.filter(r => r.absent).length
    const passPct  = appeared ? Math.round((passed / appeared) * 100) : 0
    return { appeared, passed, failed, absent, passPct, total: rows.length }
  }, [rows])

  const totalRow = { ...stats }

  const hasResults   = shown && rows.length > 0
  const activeFilters = [session, cls, subject].filter(Boolean).length

  const TABS = [
    { id: 'all',    label: 'All',    count: rows.length },
    { id: 'pass',   label: 'Pass',   count: stats.passed },
    { id: 'fail',   label: 'Fail',   count: stats.failed },
    { id: 'absent', label: 'Absent', count: stats.absent },
  ]

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-green-600 dark:text-green-400" />
            Green Sheet
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Subject-wise marks, grade &amp; pass/fail status per student.
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
          <span className="w-1 h-5 rounded-full bg-green-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
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
            <Field label="Class" error={errors.cls} required>
              <NativeSelect
                value={cls}
                onChange={e => handleClassChange(e.target.value)}
                placeholder="-- Select Class --"
                error={errors.cls}
              >
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            {/* Subject — auto-populated based on class */}
            <Field label="Subject" error={errors.subject} required>
              <NativeSelect
                value={subject}
                onChange={e => { setSubject(e.target.value); setErrors(p => ({ ...p, subject: undefined })) }}
                placeholder={cls ? '-- Select Subject --' : '← Select class first'}
                error={errors.subject}
                disabled={!cls}
              >
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
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
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold bg-green-600 text-white shadow-md shadow-green-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {activeFilters > 0 ? `${activeFilters} filter${activeFilters > 1 ? 's' : ''} applied` : 'Select Filters'}
          {activeFilters > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilters}</span>
          )}
        </button>
        {hasResults && (
          <button type="button" onClick={handleExcel} disabled={exporting}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold bg-emerald-600 text-white shadow-sm disabled:opacity-70">
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
        cls={cls} setCls={handleClassChange}
        subject={subject} setSubject={setSubject}
        subjects={subjects}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ─────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
            {[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
          </div>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* School Banner */}
          <SchoolHeader session={shownMeta.session} cls={shownMeta.cls} subject={shownMeta.subject} />

          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <SummaryCard icon={Users}        label="Total Students"  value={stats.total}     color="blue"    />
            <SummaryCard icon={BookOpen}     label="Appeared"        value={stats.appeared}  color="violet"  />
            <SummaryCard icon={TrendingUp}   label="Passed"          value={stats.passed}    color="emerald" />
            <SummaryCard icon={TrendingDown} label="Failed"          value={stats.failed}    color="rose"    />
            <SummaryCard icon={UserX}        label="Absent"          value={stats.absent}    color="amber"   />
          </div>

          {/* Pass % Hero Strip */}
          <div className="rounded-2xl border border-green-100 dark:border-green-500/20 bg-white dark:bg-[#1a1f35] px-5 py-4 shadow-sm">
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">Pass Percentage</span>
              </div>
              <span className={`text-[22px] font-extrabold tabular-nums ${stats.passPct >= 75 ? 'text-emerald-600 dark:text-emerald-400' : stats.passPct >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {stats.passPct}%
              </span>
            </div>
            <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${stats.passPct >= 75 ? 'bg-emerald-500' : stats.passPct >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                style={{ width: `${stats.passPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 mt-1.5">
              <span>0%</span>
              <span className="text-slate-500 dark:text-slate-400">{stats.passed} of {stats.appeared} appeared</span>
              <span>100%</span>
            </div>
          </div>

          {/* Results Table Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-green-500 flex-shrink-0" />
                <ClipboardList className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Student Records</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400 flex-shrink-0">
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
                    focus:border-green-400 focus:ring-2 focus:ring-green-100
                    dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                    dark:placeholder-slate-600 dark:focus:border-green-500"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Tabs — filter by status */}
            <div className="flex gap-1 px-4 pt-3 pb-2 overflow-x-auto scrollbar-hide">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setSearch('') }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold whitespace-nowrap transition-all flex-shrink-0
                    ${activeTab === tab.id
                      ? 'bg-green-600 text-white shadow-sm shadow-green-500/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                    }`}
                >
                  {tab.label}
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Info hint */}
            <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-green-50/20 dark:bg-green-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
              <p className="text-[12px] text-green-700 dark:text-green-400">
                Passing marks: 33 out of 100. Grades: A+(90+), A(75+), B+(60+), B(50+), C(33+), F(below 33).
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
                      {['S.No.', 'Roll No.', 'Student Name', 'Marks', 'Grade', 'Status', 'Performance'].map((h, i) => (
                        <th key={i} className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-12">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(row => <DesktopRow key={row.roll} row={row} />)}
                    {/* Summary row only on 'all' tab without search */}
                    {activeTab === 'all' && !search && <DesktopRow row={totalRow} isTotal />}
                  </tbody>
                </table>
              )}
            </div>

            {/* ── MOBILE CARDS ── */}
            <div className="md:hidden p-4 space-y-3">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No records found.</span>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-green-600 dark:text-green-400 font-medium flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap a card to see detailed breakdown.
                  </p>
                  {filtered.map(row => <MobileCard key={row.roll} row={row} />)}

                  {/* Mobile Summary Footer */}
                  {activeTab === 'all' && !search && (
                    <div className="rounded-xl border-2 border-green-200 dark:border-green-500/30 bg-green-50 dark:bg-green-500/[0.07] p-4 mt-2">
                      <p className="text-[12px] font-bold uppercase tracking-wide text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> Class Summary
                      </p>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                          <p className="text-[22px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{stats.appeared}</p>
                          <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Appeared</p>
                        </div>
                        <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                          <p className="text-[22px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">{stats.passed}</p>
                          <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Passed</p>
                        </div>
                        <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                          <p className="text-[22px] font-bold text-rose-700 dark:text-rose-300 tabular-nums">{stats.failed}</p>
                          <p className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">Failed</p>
                        </div>
                        <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                          <p className="text-[22px] font-bold text-amber-700 dark:text-amber-300 tabular-nums">{stats.absent}</p>
                          <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">Absent</p>
                        </div>
                      </div>
                      <div>
                        <div className="flex text-[10px] font-semibold justify-between mb-1">
                          <span className="text-emerald-600 dark:text-emerald-400">Pass {stats.passPct}%</span>
                          <span className="text-rose-500 dark:text-rose-400">Fail {100 - stats.passPct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-rose-200 dark:bg-rose-500/20 overflow-hidden">
                          <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${stats.passPct}%` }} />
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
                <button onClick={() => setSearch('')} className="text-[12px] text-green-600 dark:text-green-400 hover:underline flex items-center gap-1">
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
              Select session, class &amp; subject, then click <strong>Show</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
