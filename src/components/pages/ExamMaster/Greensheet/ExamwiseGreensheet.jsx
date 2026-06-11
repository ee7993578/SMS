/**
 * ExamwiseGreensheet.jsx
 * Folder: src/pages/Reports/ExamwiseGreensheet.jsx
 *
 * Converts legacy ASPX "Exam-wise Green Sheet" to fully-responsive React + Tailwind.
 *
 * Dropdowns: Session → Class → Term → Exam → Subject (multi-select)
 * Features:
 *  - Cascading dropdowns (Session → Class → Term → Exam → Subject)
 *  - Multi-select subjects (chips on desktop, drawer on mobile)
 *  - Show button with validation (all fields required except subject)
 *  - Export Excel placeholder
 *  - Green Sheet report table: Student | Subject marks | Total | Percentage | Grade
 *  - Mobile: card layout per student with subject breakdown accordion
 *  - Loading skeleton, empty state, toast notifications
 *  - Same theme/component patterns as StrengthReport.jsx
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye,
  AlertCircle, X, Check, Loader2, ChevronDown,
  ChevronRight, SlidersHorizontal, Info, Search,
  FileSpreadsheet, BookOpen, TrendingUp,
  Building2, MapPin, GraduationCap, Award,
  BarChart3, ClipboardList, Users, Star,
  CheckCircle2, XCircle, Minus
} from 'lucide-react'

// ─── STATIC DATA ──────────────────────────────────────────────────────────────

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CLASSES = {
  '2022-23': ['Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'],
  '2023-24': ['Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'],
  '2024-25': ['Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'],
  '2025-26': ['Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'],
}

const TERMS = ['Term I', 'Term II', 'Annual']

const EXAMS = {
  'Term I':  ['Unit Test 1', 'Mid Term', 'Unit Test 2'],
  'Term II': ['Unit Test 3', 'Pre-Board', 'Unit Test 4'],
  'Annual':  ['Annual Exam', 'Supplementary'],
}

// Subject list per class group
const SUBJECTS = {
  'Class I':   ['Hindi', 'English', 'Mathematics', 'EVS', 'Drawing'],
  'Class II':  ['Hindi', 'English', 'Mathematics', 'EVS', 'Drawing'],
  'Class III': ['Hindi', 'English', 'Mathematics', 'EVS', 'Drawing'],
  'Class IV':  ['Hindi', 'English', 'Mathematics', 'Science', 'Social Studies', 'Drawing'],
  'Class V':   ['Hindi', 'English', 'Mathematics', 'Science', 'Social Studies', 'Drawing'],
  'Class VI':  ['Hindi', 'English', 'Mathematics', 'Science', 'Social Studies', 'Sanskrit'],
  'Class VII': ['Hindi', 'English', 'Mathematics', 'Science', 'Social Studies', 'Sanskrit'],
  'Class VIII':['Hindi', 'English', 'Mathematics', 'Science', 'Social Studies', 'Sanskrit'],
  'Class IX':  ['Hindi', 'English', 'Mathematics', 'Science', 'Social Studies'],
  'Class X':   ['Hindi', 'English', 'Mathematics', 'Science', 'Social Studies'],
  'Class XI':  ['Physics', 'Chemistry', 'Mathematics', 'English', 'Computer Science'],
  'Class XII': ['Physics', 'Chemistry', 'Mathematics', 'English', 'Computer Science'],
}

// Dummy student green sheet data generator
const GRADES = [
  { min: 91, label: 'A+', color: 'emerald' },
  { min: 81, label: 'A',  color: 'green'   },
  { min: 71, label: 'B+', color: 'blue'    },
  { min: 61, label: 'B',  color: 'cyan'    },
  { min: 51, label: 'C',  color: 'amber'   },
  { min: 41, label: 'D',  color: 'orange'  },
  { min: 0,  label: 'F',  color: 'rose'    },
]

const getGrade = (pct) => GRADES.find(g => pct >= g.min) || GRADES[GRADES.length - 1]

function seededRand(seed) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

function generateGreenSheet(cls, term, exam, subjects) {
  const names = [
    'Aarav Sharma','Priya Singh','Rohan Gupta','Sneha Patel','Vikram Joshi',
    'Ananya Rao','Karan Mehta','Divya Nair','Arjun Verma','Pooja Mishra',
    'Ravi Kumar','Meera Agarwal','Siddharth Bose','Kavya Reddy','Amit Tiwari',
    'Nisha Yadav','Deepak Pandey','Rekha Chauhan','Suresh Bajaj','Lalita Dubey',
    'Harsh Srivastava','Swati Jain','Manish Tripathi','Sunita Shukla','Varun Khanna',
    'Geeta Malhotra','Nikhil Saxena','Preeti Rawat','Sandeep Gill','Pooja Bansal',
    'Ajay Kapoor','Ritu Sahu','Dinesh Thakur','Madhuri Pillai','Sumit Biswas',
    'Alka Chandra','Rahul Vyas','Sunita Lal','Vijay Deshpande','Kavita Bhat',
  ]

  const rand = seededRand(
    (cls.charCodeAt(0) || 0) * 100 +
    (term.charCodeAt(0) || 0) * 10 +
    (exam.charCodeAt(0) || 0)
  )

  const count = 20 + Math.floor(rand() * 15)
  const maxMark = 100

  return Array.from({ length: count }, (_, i) => {
    const subMarks = {}
    subjects.forEach(sub => {
      const base = 45 + Math.floor(rand() * 52)
      subMarks[sub] = Math.min(base, maxMark)
    })
    const total = Object.values(subMarks).reduce((a, b) => a + b, 0)
    const maxTotal = subjects.length * maxMark
    const pct = maxTotal ? Math.round((total / maxTotal) * 100) : 0
    const grade = getGrade(pct)

    return {
      sno: i + 1,
      rollNo: `${cls.replace('Class ', '')}${String(i + 1).padStart(3, '0')}`,
      name: names[i % names.length],
      subMarks,
      total,
      maxTotal,
      percentage: pct,
      grade: grade.label,
      gradeColor: grade.color,
      pass: pct >= 41,
    }
  })
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const GRADE_COLORS = {
  emerald: { bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' },
  green:   { bg: 'bg-green-100 dark:bg-green-500/20',   text: 'text-green-700 dark:text-green-300',   dot: 'bg-green-500'   },
  blue:    { bg: 'bg-blue-100 dark:bg-blue-500/20',     text: 'text-blue-700 dark:text-blue-300',     dot: 'bg-blue-500'    },
  cyan:    { bg: 'bg-cyan-100 dark:bg-cyan-500/20',     text: 'text-cyan-700 dark:text-cyan-300',     dot: 'bg-cyan-500'    },
  amber:   { bg: 'bg-amber-100 dark:bg-amber-500/20',   text: 'text-amber-700 dark:text-amber-300',   dot: 'bg-amber-500'   },
  orange:  { bg: 'bg-orange-100 dark:bg-orange-500/20', text: 'text-orange-700 dark:text-orange-300', dot: 'bg-orange-500'  },
  rose:    { bg: 'bg-rose-100 dark:bg-rose-500/20',     text: 'text-rose-700 dark:text-rose-300',     dot: 'bg-rose-500'    },
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
          focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-emerald-400 dark:focus:ring-emerald-500/20
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error
            ? 'border-rose-400 ring-2 ring-rose-100'
            : 'border-slate-200 dark:border-[rgba(52,211,153,0.2)]'
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

// ─── SUMMARY CARDS ────────────────────────────────────────────────────────────

function SummaryCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    rose:    'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(52,211,153,0.1)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
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

// ─── SCHOOL HEADER ────────────────────────────────────────────────────────────

function SchoolHeader({ session, cls, term, exam }) {
  return (
    <div className="rounded-2xl border border-emerald-100 dark:border-[rgba(52,211,153,0.2)] bg-gradient-to-r from-emerald-50 via-white to-green-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-6 py-5 text-center shadow-sm">
      <div className="flex items-center justify-center gap-2 mb-1">
        <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
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
          { label: 'Session', val: session },
          { label: 'Class',   val: cls     },
          { label: 'Term',    val: term    },
          { label: 'Exam',    val: exam    },
        ].map(({ label, val }) => (
          <div key={label} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/25">
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase">{label}:</span>
            <span className="text-[12px] font-bold text-emerald-800 dark:text-emerald-300">{val}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[13px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
        Green Sheet — Exam Result Report
      </p>
    </div>
  )
}

// ─── GRADE BADGE ─────────────────────────────────────────────────────────────

function GradeBadge({ grade, color, size = 'md' }) {
  const c = GRADE_COLORS[color] || GRADE_COLORS.blue
  const sz = size === 'lg'
    ? 'px-3 py-1.5 text-[14px] font-black'
    : 'px-2.5 py-1 text-[12px] font-bold'
  return (
    <span className={`inline-flex items-center justify-center rounded-lg ${sz} ${c.bg} ${c.text}`}>
      {grade}
    </span>
  )
}

// ─── PASS / FAIL BADGE ───────────────────────────────────────────────────────

function PassBadge({ pass }) {
  return pass ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
      <CheckCircle2 className="w-3 h-3" /> Pass
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300">
      <XCircle className="w-3 h-3" /> Fail
    </span>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────

function DesktopRow({ row, subjects }) {
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(52,211,153,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      {/* S.No */}
      <td className="px-3 py-2.5 text-center text-[12px] text-slate-400 tabular-nums w-10 sticky left-0 bg-white dark:bg-[#1a1f35]">{row.sno}</td>
      {/* Roll No */}
      <td className="px-3 py-2.5 text-center">
        <span className="text-[12px] font-bold text-slate-500 dark:text-slate-400 font-mono">{row.rollNo}</span>
      </td>
      {/* Name */}
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-[10px] font-black text-emerald-700 dark:text-emerald-300 flex-shrink-0">
            {row.name.split(' ').map(w => w[0]).join('').slice(0,2)}
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.name}</span>
        </div>
      </td>
      {/* Subject marks */}
      {subjects.map(sub => (
        <td key={sub} className="px-3 py-2.5 text-center">
          <span className={`inline-flex items-center justify-center w-9 h-7 rounded-lg text-[12px] font-semibold tabular-nums
            ${row.subMarks[sub] >= 41
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              : 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300'
            }`}>
            {row.subMarks[sub]}
          </span>
        </td>
      ))}
      {/* Total */}
      <td className="px-3 py-2.5 text-center">
        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[12px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 tabular-nums whitespace-nowrap">
          {row.total}/{row.maxTotal}
        </span>
      </td>
      {/* Percentage */}
      <td className="px-3 py-2.5 text-center">
        <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 tabular-nums">{row.percentage}%</span>
      </td>
      {/* Grade */}
      <td className="px-3 py-2.5 text-center">
        <GradeBadge grade={row.grade} color={row.gradeColor} />
      </td>
      {/* Pass/Fail */}
      <td className="px-3 py-2.5 text-center">
        <PassBadge pass={row.pass} />
      </td>
    </tr>
  )
}

// ─── MOBILE STUDENT CARD ──────────────────────────────────────────────────────

function MobileStudentCard({ row, subjects }) {
  const [expanded, setExpanded] = useState(false)
  const c = GRADE_COLORS[row.gradeColor] || GRADE_COLORS.blue

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(52,211,153,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Card Header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Avatar */}
        <span className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-[12px] font-black text-emerald-700 dark:text-emerald-300 flex-shrink-0">
          {row.name.split(' ').map(w => w[0]).join('').slice(0,2)}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{row.name}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 font-mono">Roll: {row.rollNo}</p>
        </div>

        {/* Right: grade + pct */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <GradeBadge grade={row.grade} color={row.gradeColor} size="lg" />
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tabular-nums">{row.percentage}%</span>
        </div>

        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Progress bar */}
      <div className="px-4 pb-3">
        <div className="flex text-[10px] font-semibold justify-between mb-1">
          <span className="text-slate-400">Marks: {row.total}/{row.maxTotal}</span>
          <PassBadge pass={row.pass} />
        </div>
        <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${c.dot}`}
            style={{ width: `${row.percentage}%` }}
          />
        </div>
      </div>

      {/* Expanded subject breakdown */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(52,211,153,0.1)] px-4 pt-3 pb-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">Subject-wise Marks</p>
          <div className="space-y-2">
            {subjects.map(sub => {
              const mark = row.subMarks[sub]
              const subPct = Math.round((mark / 100) * 100)
              const fail = mark < 41
              return (
                <div key={sub} className="flex items-center gap-3">
                  <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300 w-32 flex-shrink-0 truncate">{sub}</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${fail ? 'bg-rose-400' : 'bg-emerald-400'}`}
                      style={{ width: `${subPct}%` }}
                    />
                  </div>
                  <span className={`text-[12px] font-bold tabular-nums w-8 text-right ${fail ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-200'}`}>
                    {mark}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MULTI-SELECT SUBJECT CHIPS ───────────────────────────────────────────────

function SubjectMultiSelect({ subjects, selected, onChange, error }) {
  const toggleSubject = (sub) => {
    onChange(
      selected.includes(sub)
        ? selected.filter(s => s !== sub)
        : [...selected, sub]
    )
  }
  const toggleAll = () => {
    onChange(selected.length === subjects.length ? [] : [...subjects])
  }

  return (
    <div className={`rounded-lg border p-2 bg-white dark:bg-[#1e2238] transition-all
      ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(52,211,153,0.2)]'}`}>
      <div className="flex flex-wrap gap-1.5">
        {/* All button */}
        <button
          type="button"
          onClick={toggleAll}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border
            ${selected.length === subjects.length
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
            }`}
        >
          All
        </button>
        {subjects.map(sub => (
          <button
            key={sub}
            type="button"
            onClick={() => toggleSubject(sub)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border
              ${selected.includes(sub)
                ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40'
                : 'bg-white dark:bg-[#1e2238] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
          >
            {sub}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────

function FilterDrawer({
  open, onClose,
  session, setSession,
  cls, setCls,
  term, setTerm,
  exam, setExam,
  subjects, selectedSubjects, setSelectedSubjects,
  onShow, loading, errors,
  availableClasses, availableTerms, availableExams, availableSubjects,
}) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(52,211,153,0.2)] shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ animation: 'drawerUp .25s ease' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(52,211,153,0.1)]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <Field label="Session" error={errors.session} required>
            <NativeSelect value={session} onChange={e => setSession(e.target.value)} placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Class" error={errors.cls} required>
            <NativeSelect value={cls} onChange={e => setCls(e.target.value)} placeholder="-- Select Class --" error={errors.cls} disabled={!session}>
              {availableClasses.map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Term" error={errors.term} required>
            <NativeSelect value={term} onChange={e => setTerm(e.target.value)} placeholder="-- Select Term --" error={errors.term} disabled={!cls}>
              {availableTerms.map(t => <option key={t} value={t}>{t}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Exam" error={errors.exam} required>
            <NativeSelect value={exam} onChange={e => setExam(e.target.value)} placeholder="-- Select Exam --" error={errors.exam} disabled={!term}>
              {availableExams.map(e => <option key={e} value={e}>{e}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Subjects (optional)">
            {availableSubjects.length > 0
              ? <SubjectMultiSelect subjects={availableSubjects} selected={selectedSubjects} onChange={setSelectedSubjects} />
              : <p className="text-[12px] text-slate-400 dark:text-slate-500 italic">Select Class first</p>
            }
          </Field>
        </div>

        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(52,211,153,0.1)] flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={() => { onShow(); onClose() }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show Report
          </button>
        </div>
      </div>
    </>
  )
}

// ─── LOADING SKELETON ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(52,211,153,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
      <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
      {[...Array(7)].map((_, i) => (
        <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.1 }} />
      ))}
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function ExamwiseGreensheet() {
  // Filter state
  const [session,          setSessionRaw]    = useState('')
  const [cls,              setClsRaw]        = useState('')
  const [term,             setTermRaw]       = useState('')
  const [exam,             setExamRaw]       = useState('')
  const [selectedSubjects, setSelectedSubjects] = useState([])

  // Result state
  const [rows,        setRows]        = useState([])
  const [shownMeta,   setShownMeta]   = useState(null)   // { session, cls, term, exam, subjects }
  const [loading,     setLoading]     = useState(false)
  const [exporting,   setExporting]   = useState(false)
  const [filterOpen,  setFilterOpen]  = useState(false)
  const [search,      setSearch]      = useState('')
  const [errors,      setErrors]      = useState({})
  const [toast,       setToast]       = useState(null)

  // Cascading options
  const availableClasses  = session ? (CLASSES[session]   || []) : []
  const availableTerms    = cls     ? TERMS                      : []
  const availableExams    = term    ? (EXAMS[term]         || []) : []
  const availableSubjects = cls     ? (SUBJECTS[cls]       || []) : []

  // Cascading setters — reset downstream on change
  const setSession = (v) => { setSessionRaw(v); setClsRaw(''); setTermRaw(''); setExamRaw(''); setSelectedSubjects([]) }
  const setCls     = (v) => { setClsRaw(v);     setTermRaw(''); setExamRaw(''); setSelectedSubjects([]) }
  const setTerm    = (v) => { setTermRaw(v);    setExamRaw('') }
  const setExam    = (v) => { setExamRaw(v) }

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Validation + fetch
  const handleShow = useCallback(() => {
    const err = {}
    if (!session) err.session = 'Required'
    if (!cls)     err.cls     = 'Required'
    if (!term)    err.term    = 'Required'
    if (!exam)    err.exam    = 'Required'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      // Use selected subjects or all subjects for that class
      const subs = selectedSubjects.length > 0 ? selectedSubjects : availableSubjects
      const data = generateGreenSheet(cls, term, exam, subs)
      setRows(data)
      setShownMeta({ session, cls, term, exam, subjects: subs })
      setLoading(false)
      showToast(`Green sheet loaded — ${data.length} students, ${subs.length} subjects.`)
    }, 750)
  }, [session, cls, term, exam, selectedSubjects, availableSubjects])

  const handleReset = () => {
    setSessionRaw(''); setClsRaw(''); setTermRaw(''); setExamRaw('')
    setSelectedSubjects([]); setRows([]); setSearch('')
    setErrors({}); setShownMeta(null)
  }

  const handleExcel = () => {
    if (!rows.length) { showToast('No data to export.', 'error'); return }
    setExporting(true)
    setTimeout(() => { setExporting(false); showToast('Excel export ready! (API integration pending)') }, 1200)
  }

  // Search filter
  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.rollNo.toLowerCase().includes(q) ||
      r.grade.toLowerCase().includes(q)
    )
  }, [rows, search])

  // Stats
  const stats = useMemo(() => {
    if (!filtered.length) return null
    const passCount = filtered.filter(r => r.pass).length
    const avgPct    = Math.round(filtered.reduce((s, r) => s + r.percentage, 0) / filtered.length)
    const topScore  = Math.max(...filtered.map(r => r.percentage))
    return { total: filtered.length, pass: passCount, fail: filtered.length - passCount, avgPct, topScore }
  }, [filtered])

  const hasResults = !!shownMeta && rows.length > 0
  const activeFilters = [session, cls, term, exam].filter(Boolean).length

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Green Sheet
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Exam-wise subject marks, grade &amp; result report.
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

      {/* ── DESKTOP FILTER CARD ─────────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(52,211,153,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(52,211,153,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-emerald-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
        </div>
        <div className="p-5 space-y-4">
          {/* Row 1: Session, Class, Term, Exam */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="Session" error={errors.session} required>
              <NativeSelect value={session} onChange={e => { setSession(e.target.value); setErrors(p => ({ ...p, session: undefined })) }}
                placeholder="-- Select Session --" error={errors.session}>
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Class" error={errors.cls} required>
              <NativeSelect value={cls} onChange={e => { setCls(e.target.value); setErrors(p => ({ ...p, cls: undefined })) }}
                placeholder="-- Select Class --" error={errors.cls} disabled={!session}>
                {availableClasses.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Term" error={errors.term} required>
              <NativeSelect value={term} onChange={e => { setTerm(e.target.value); setErrors(p => ({ ...p, term: undefined })) }}
                placeholder="-- Select Term --" error={errors.term} disabled={!cls}>
                {availableTerms.map(t => <option key={t} value={t}>{t}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Exam" error={errors.exam} required>
              <NativeSelect value={exam} onChange={e => { setExam(e.target.value); setErrors(p => ({ ...p, exam: undefined })) }}
                placeholder="-- Select Exam --" error={errors.exam} disabled={!term}>
                {availableExams.map(e => <option key={e} value={e}>{e}</option>)}
              </NativeSelect>
            </Field>
          </div>

          {/* Row 2: Subjects multiselect + actions */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
            <div className="lg:col-span-3">
              <Field label="Select Subjects (optional — leave blank for all)">
                {availableSubjects.length > 0
                  ? <SubjectMultiSelect subjects={availableSubjects} selected={selectedSubjects} onChange={setSelectedSubjects} />
                  : <p className="text-[12px] text-slate-400 dark:text-slate-500 italic py-2">Select a class to see subjects</p>
                }
              </Field>
            </div>

            <div className="flex gap-2">
              <button type="button" onClick={handleShow} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold text-white
                  bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20
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

      {/* ── MOBILE FILTER BAR ───────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {activeFilters > 0 ? `${activeFilters} filter${activeFilters > 1 ? 's' : ''} set` : 'Set Filters'}
          {activeFilters > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilters}</span>
          )}
        </button>
        {hasResults && (
          <button type="button" onClick={handleExcel} disabled={exporting}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold bg-emerald-600 text-white disabled:opacity-70">
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
        open={filterOpen} onClose={() => setFilterOpen(false)}
        session={session} setSession={setSession}
        cls={cls} setCls={setCls}
        term={term} setTerm={setTerm}
        exam={exam} setExam={setExam}
        subjects={availableSubjects}
        selectedSubjects={selectedSubjects} setSelectedSubjects={setSelectedSubjects}
        onShow={handleShow} loading={loading} errors={errors}
        availableClasses={availableClasses}
        availableTerms={availableTerms}
        availableExams={availableExams}
        availableSubjects={availableSubjects}
      />

      {/* ── LOADING ─────────────────────────────────────────────────────────── */}
      {loading && <LoadingSkeleton />}

      {/* ── RESULTS ─────────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* School Header */}
          <SchoolHeader
            session={shownMeta.session}
            cls={shownMeta.cls}
            term={shownMeta.term}
            exam={shownMeta.exam}
          />

          {/* Summary Cards */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <SummaryCard icon={Users}       label="Total Students"  value={stats.total}   color="blue"    />
              <SummaryCard icon={CheckCircle2}label="Pass"            value={stats.pass}    color="emerald" />
              <SummaryCard icon={XCircle}     label="Fail"            value={stats.fail}    color="rose"    />
              <SummaryCard icon={TrendingUp}  label="Class Average"   value={`${stats.avgPct}%`} color="violet" />
            </div>
          )}

          {/* Report Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(52,211,153,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(52,211,153,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-emerald-500 flex-shrink-0" />
                <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Green Sheet</span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">· {shownMeta.cls} · {shownMeta.exam}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 flex-shrink-0">
                  {filtered.length} student{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>
              {/* Search */}
              <div className="relative w-full sm:w-56 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search name / roll / grade…"
                  className="w-full pl-8 pr-7 py-1.5 text-[12px] rounded-lg border outline-none transition-all
                    bg-white text-slate-700 border-slate-200 placeholder-slate-300
                    focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100
                    dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(52,211,153,0.2)]
                    dark:placeholder-slate-600 dark:focus:border-emerald-400"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Info hint */}
            <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(52,211,153,0.07)] bg-emerald-50/20 dark:bg-emerald-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              <p className="text-[12px] text-emerald-700 dark:text-emerald-400">
                Marks out of 100 per subject. Red marks = below passing (41). Grade based on overall percentage.
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
                <table className="w-full min-w-max">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[rgba(52,211,153,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                      {['S.No.', 'Roll No', 'Student Name', ...shownMeta.subjects, 'Total', '%', 'Grade', 'Result'].map((h, i) => (
                        <th key={i} className={`px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap
                          ${i <= 2 ? 'text-left' : 'text-center'}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(row => (
                      <DesktopRow key={row.rollNo} row={row} subjects={shownMeta.subjects} />
                    ))}
                    {/* Grand Total / Average row */}
                    {stats && (
                      <tr className="bg-emerald-50 dark:bg-emerald-500/[0.07] border-t-2 border-emerald-200 dark:border-emerald-500/30">
                        <td className="px-3 py-3 text-center text-[12px] text-emerald-500 dark:text-emerald-400">—</td>
                        <td className="px-3 py-3" colSpan={2}>
                          <span className="text-[13px] font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" /> Class Summary
                          </span>
                        </td>
                        {shownMeta.subjects.map(sub => {
                          const avg = Math.round(filtered.reduce((s, r) => s + (r.subMarks[sub] || 0), 0) / filtered.length)
                          return (
                            <td key={sub} className="px-3 py-3 text-center">
                              <span className="text-[12px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">{avg}</span>
                            </td>
                          )
                        })}
                        <td className="px-3 py-3 text-center">
                          <span className="text-[12px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">
                            {Math.round(filtered.reduce((s, r) => s + r.total, 0) / filtered.length)}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">{stats.avgPct}%</span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <Minus className="w-4 h-4 text-slate-400 mx-auto" />
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="text-[12px] font-bold text-emerald-700 dark:text-emerald-300">
                            {stats.pass}P / {stats.fail}F
                          </span>
                        </td>
                      </tr>
                    )}
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
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap a card to see subject-wise marks.
                  </p>
                  {filtered.map(row => (
                    <MobileStudentCard key={row.rollNo} row={row} subjects={shownMeta.subjects} />
                  ))}

                  {/* Mobile Summary */}
                  {stats && (
                    <div className="rounded-xl border-2 border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/[0.07] p-4 mt-2">
                      <p className="text-[12px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> Class Summary
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                          <p className="text-[22px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{stats.total}</p>
                          <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Total Students</p>
                        </div>
                        <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                          <p className="text-[22px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">{stats.pass}</p>
                          <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Passed</p>
                        </div>
                        <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                          <p className="text-[22px] font-bold text-rose-700 dark:text-rose-300 tabular-nums">{stats.fail}</p>
                          <p className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">Failed</p>
                        </div>
                        <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                          <p className="text-[22px] font-bold text-violet-700 dark:text-violet-300 tabular-nums">{stats.avgPct}%</p>
                          <p className="text-[10px] font-semibold text-violet-600 dark:text-violet-400">Class Avg</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Table Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(52,211,153,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{rows.length}</span> students
              </p>
              {search && (
                <button onClick={() => setSearch('')}
                  className="text-[12px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
                  <X className="w-3 h-3" /> Clear search
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── EMPTY STATE ──────────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <ClipboardList className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No green sheet generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select Session → Class → Term → Exam, then click <strong>Show</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
