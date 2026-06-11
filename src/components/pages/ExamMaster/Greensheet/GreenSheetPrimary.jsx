/**
 * GreenSheetPrimary.jsx
 * Folder: src/pages/Reports/Exam/GreenSheetPrimary.jsx
 *
 * Converts legacy ASPX "Green Sheet Primary" exam report to fully-responsive React + Tailwind.
 *
 * Dropdowns: Session → Class → Header → Term → Exam
 * Features:
 *  - Cascading dependent dropdowns (each unlocks after previous is selected)
 *  - Show report button + Excel export
 *  - School header banner in report
 *  - Desktop: dense ERP-style marks table (students as rows, subjects as columns)
 *  - Mobile: student cards with subject-wise mark chips, expandable
 *  - Mobile filter drawer
 *  - Loading skeleton, empty state, toast notifications
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye,
  AlertCircle, X, Check, Loader2, ChevronDown,
  SlidersHorizontal, Search, Info,
  FileSpreadsheet, BookOpen, School2,
  MapPin, Building2, ChevronRight,
  GraduationCap, ClipboardList, Award, TrendingUp,
  User, BarChart3, Hash
} from 'lucide-react'

// ─── STATIC DUMMY DATA ─────────────────────────────────────────────────────────

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CLASSES_BY_SESSION = {
  '2022-23': ['Nursery', 'LKG', 'UKG', 'Class I', 'Class II', 'Class III', 'Class IV', 'Class V'],
  '2023-24': ['Nursery', 'LKG', 'UKG', 'Class I', 'Class II', 'Class III', 'Class IV', 'Class V'],
  '2024-25': ['Nursery', 'LKG', 'UKG', 'Class I', 'Class II', 'Class III', 'Class IV', 'Class V'],
  '2025-26': ['Nursery', 'LKG', 'UKG', 'Class I', 'Class II', 'Class III', 'Class IV', 'Class V'],
}

const HEADERS_BY_CLASS = {
  Nursery:     ['Section A', 'Section B'],
  LKG:         ['Section A', 'Section B'],
  UKG:         ['Section A', 'Section B'],
  'Class I':   ['Section A', 'Section B', 'Section C'],
  'Class II':  ['Section A', 'Section B'],
  'Class III': ['Section A'],
  'Class IV':  ['Section A'],
  'Class V':   ['Section A'],
}

const TERMS = ['Term 1', 'Term 2', 'Annual']

const EXAMS_BY_TERM = {
  'Term 1': ['Unit Test 1', 'Half Yearly'],
  'Term 2': ['Unit Test 2', 'Pre-Board'],
  'Annual': ['Annual Exam', 'Supplementary'],
}

// Subjects per class group
const SUBJECTS_BY_CLASS = {
  Nursery: ['English', 'Hindi', 'Rhymes', 'Drawing'],
  LKG:     ['English', 'Hindi', 'Maths', 'Drawing', 'EVS'],
  UKG:     ['English', 'Hindi', 'Maths', 'Drawing', 'EVS'],
  default: ['English', 'Hindi', 'Maths', 'Science', 'Social Studies', 'Drawing'],
}

const getSubjects = (cls) => SUBJECTS_BY_CLASS[cls] || SUBJECTS_BY_CLASS.default

// Generate dummy student rows
const generateStudents = (cls, header, term, exam) => {
  const subjects = getSubjects(cls)
  const maxMark  = 100
  const names = [
    'Aarav Sharma', 'Aditi Singh', 'Ananya Gupta', 'Arjun Verma', 'Bhavya Joshi',
    'Chetan Rawat', 'Deepika Negi', 'Divya Chauhan', 'Gaurav Thakur', 'Ishaan Bisht',
    'Jyoti Pant', 'Karan Mehta', 'Kavya Dobhal', 'Kunal Rana', 'Lavanya Tiwari',
    'Manav Bhatt', 'Neha Arora', 'Nikhil Panwar', 'Pooja Bhandari', 'Rahul Katiyar',
    'Riya Saxena', 'Rohit Upadhyay', 'Sakshi Bhardwaj', 'Sanjay Kunwar', 'Shreya Dimri',
  ]
  const sectionOffset = header.includes('B') ? 13 : header.includes('C') ? 25 : 0
  const count = header.includes('B') ? 20 : header.includes('C') ? 15 : 22

  return names.slice(0, count).map((name, i) => {
    const roll = sectionOffset + i + 1
    const seed = (name.charCodeAt(0) + roll + cls.length + term.length) % 40
    const marks = subjects.reduce((acc, sub, si) => {
      const raw = Math.min(maxMark, 45 + ((seed + si * 7 + roll * 3) % 55))
      acc[sub] = raw
      return acc
    }, {})
    const obtained  = Object.values(marks).reduce((s, m) => s + m, 0)
    const total     = subjects.length * maxMark
    const pct       = Math.round((obtained / total) * 100)
    const grade     = pct >= 90 ? 'A+' : pct >= 75 ? 'A' : pct >= 60 ? 'B' : pct >= 45 ? 'C' : 'D'
    const result    = pct >= 40 ? 'Pass' : 'Fail'
    return { sno: roll, name, roll, subjects: marks, obtained, total, pct, grade, result }
  })
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const GRADE_COLORS = {
  'A+': { bg: 'bg-emerald-100 dark:bg-emerald-500/15', text: 'text-emerald-700 dark:text-emerald-400' },
  'A':  { bg: 'bg-blue-100 dark:bg-blue-500/15',       text: 'text-blue-700 dark:text-blue-400'       },
  'B':  { bg: 'bg-violet-100 dark:bg-violet-500/15',   text: 'text-violet-700 dark:text-violet-400'   },
  'C':  { bg: 'bg-amber-100 dark:bg-amber-500/15',     text: 'text-amber-700 dark:text-amber-400'     },
  'D':  { bg: 'bg-rose-100 dark:bg-rose-500/15',       text: 'text-rose-700 dark:text-rose-400'       },
}

const gradeBadge = (grade) => {
  const c = GRADE_COLORS[grade] || GRADE_COLORS['D']
  return `${c.bg} ${c.text}`
}

const resultBadge = (result) =>
  result === 'Pass'
    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
    : 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400'

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

// ─── SUMMARY CARD ─────────────────────────────────────────────────────────────

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
        <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── SCHOOL HEADER BANNER ─────────────────────────────────────────────────────

function SchoolHeader({ filters }) {
  return (
    <div className="rounded-2xl border border-green-100 dark:border-[rgba(34,197,94,0.2)] bg-gradient-to-r from-green-50 via-white to-emerald-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-6 py-5 text-center shadow-sm">
      <div className="flex items-center justify-center gap-2 mb-1">
        <Building2 className="w-5 h-5 text-green-700 dark:text-green-400 flex-shrink-0" />
        <h2 className="text-[16px] sm:text-[18px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
          {SCHOOL_INFO.name}
        </h2>
      </div>
      <div className="flex items-center justify-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400 mb-3">
        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
        <span>{SCHOOL_INFO.address}</span>
      </div>
      {/* Tag strip */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {[
          { label: 'Session', value: filters.session },
          { label: 'Class',   value: filters.cls     },
          { label: 'Section', value: filters.header  },
          { label: 'Term',    value: filters.term    },
          { label: 'Exam',    value: filters.exam    },
        ].map(({ label, value }) => (
          <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 dark:bg-green-500/15 border border-green-200 dark:border-green-500/25">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-green-600 dark:text-green-500">{label}:</span>
            <span className="text-[12px] font-bold text-green-800 dark:text-green-300">{value}</span>
          </span>
        ))}
      </div>
      <p className="mt-3 text-[13px] font-bold uppercase tracking-widest text-green-700 dark:text-green-400">
        Green Sheet — Primary Section
      </p>
    </div>
  )
}

// ─── DESKTOP TABLE ────────────────────────────────────────────────────────────

function DesktopTable({ students, subjects }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[12px]" style={{ minWidth: `${400 + subjects.length * 90}px` }}>
        <thead>
          <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/70 dark:bg-white/[0.02]">
            {/* Fixed cols */}
            <th className="px-3 py-2.5 text-center font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 w-10 sticky left-0 bg-slate-50 dark:bg-[#1e2238] z-10">S.No</th>
            <th className="px-3 py-2.5 text-left   font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 sticky left-10 bg-slate-50 dark:bg-[#1e2238] z-10 min-w-[150px]">Student Name</th>
            <th className="px-3 py-2.5 text-center font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 w-14">Roll</th>
            {/* Subject cols */}
            {subjects.map(sub => (
              <th key={sub} className="px-3 py-2.5 text-center font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {sub}
                <span className="block text-[10px] font-normal text-slate-400 normal-case tracking-normal">/100</span>
              </th>
            ))}
            {/* Summary cols */}
            <th className="px-3 py-2.5 text-center font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">Total</th>
            <th className="px-3 py-2.5 text-center font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">%</th>
            <th className="px-3 py-2.5 text-center font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Grade</th>
            <th className="px-3 py-2.5 text-center font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Result</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s, i) => (
            <tr
              key={s.roll}
              className={`border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors
                ${i % 2 === 0 ? '' : 'bg-slate-50/30 dark:bg-white/[0.01]'}`}
            >
              {/* S.No */}
              <td className="px-3 py-2.5 text-center text-slate-400 dark:text-slate-500 tabular-nums sticky left-0 bg-white dark:bg-[#1a1f35] z-10 text-[11px]">{i + 1}</td>
              {/* Name */}
              <td className="px-3 py-2.5 sticky left-10 bg-white dark:bg-[#1a1f35] z-10">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                    <User className="w-3.5 h-3.5" />
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{s.name}</span>
                </div>
              </td>
              {/* Roll */}
              <td className="px-3 py-2.5 text-center tabular-nums text-slate-500 dark:text-slate-400">{s.roll}</td>
              {/* Marks */}
              {subjects.map(sub => {
                const m   = s.subjects[sub]
                const pct = m
                const cls = pct >= 75 ? 'text-emerald-700 dark:text-emerald-400'
                          : pct >= 45 ? 'text-slate-700 dark:text-slate-200'
                          : 'text-rose-600 dark:text-rose-400'
                return (
                  <td key={sub} className="px-3 py-2.5 text-center tabular-nums">
                    <span className={`font-semibold ${cls}`}>{m}</span>
                  </td>
                )
              })}
              {/* Total */}
              <td className="px-3 py-2.5 text-center tabular-nums">
                <span className="font-bold text-slate-800 dark:text-slate-100">{s.obtained}<span className="text-[10px] font-normal text-slate-400">/{s.total}</span></span>
              </td>
              {/* % */}
              <td className="px-3 py-2.5 text-center tabular-nums">
                <span className={`font-bold ${s.pct >= 75 ? 'text-emerald-600 dark:text-emerald-400' : s.pct >= 45 ? 'text-slate-700 dark:text-slate-200' : 'text-rose-600 dark:text-rose-400'}`}>
                  {s.pct}%
                </span>
              </td>
              {/* Grade */}
              <td className="px-3 py-2.5 text-center">
                <span className={`inline-flex items-center justify-center w-9 h-7 rounded-lg text-[11px] font-bold ${gradeBadge(s.grade)}`}>
                  {s.grade}
                </span>
              </td>
              {/* Result */}
              <td className="px-3 py-2.5 text-center">
                <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[11px] font-bold ${resultBadge(s.result)}`}>
                  {s.result}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
        {/* Footer totals */}
        <tfoot>
          <tr className="border-t-2 border-green-200 dark:border-green-500/30 bg-green-50/60 dark:bg-green-500/[0.06]">
            <td className="px-3 py-2.5 text-center text-green-500 dark:text-green-400 sticky left-0 bg-green-50 dark:bg-[#1e2438] z-10">—</td>
            <td className="px-3 py-2.5 sticky left-10 bg-green-50 dark:bg-[#1e2438] z-10">
              <span className="font-bold text-green-700 dark:text-green-300 flex items-center gap-1.5 text-[12px]">
                <TrendingUp className="w-3.5 h-3.5" /> Class Average
              </span>
            </td>
            <td className="px-3 py-2.5 text-center text-green-500 dark:text-green-400">—</td>
            {subjects.map(sub => {
              const avg = Math.round(students.reduce((s, r) => s + r.subjects[sub], 0) / students.length)
              return (
                <td key={sub} className="px-3 py-2.5 text-center">
                  <span className="font-bold text-green-700 dark:text-green-300 tabular-nums">{avg}</span>
                </td>
              )
            })}
            <td className="px-3 py-2.5 text-center">
              <span className="font-bold text-green-700 dark:text-green-300 tabular-nums">
                {Math.round(students.reduce((s, r) => s + r.obtained, 0) / students.length)}/
                {students[0]?.total}
              </span>
            </td>
            <td className="px-3 py-2.5 text-center">
              <span className="font-bold text-green-700 dark:text-green-300 tabular-nums">
                {Math.round(students.reduce((s, r) => s + r.pct, 0) / students.length)}%
              </span>
            </td>
            <td className="px-3 py-2.5 text-center text-green-500 dark:text-green-400">—</td>
            <td className="px-3 py-2.5 text-center">
              <span className="font-bold text-green-700 dark:text-green-300 tabular-nums">
                {students.filter(s => s.result === 'Pass').length}/{students.length} Pass
              </span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

// ─── MOBILE STUDENT CARD ──────────────────────────────────────────────────────

function MobileCard({ student, subjects, idx }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Avatar */}
        <span className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 text-[11px] font-bold">
          {idx}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{student.name}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Roll No: {student.roll}</p>
        </div>

        {/* Grade + % */}
        <div className="flex flex-col items-end flex-shrink-0 gap-1">
          <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-lg text-[11px] font-bold ${gradeBadge(student.grade)}`}>
            {student.grade}
          </span>
          <span className={`text-[12px] font-bold tabular-nums ${student.pct >= 75 ? 'text-emerald-600 dark:text-emerald-400' : student.pct >= 45 ? 'text-slate-600 dark:text-slate-300' : 'text-rose-600 dark:text-rose-400'}`}>
            {student.pct}%
          </span>
        </div>

        {/* Result badge */}
        <span className={`flex-shrink-0 inline-flex items-center justify-center px-2 py-1 rounded-lg text-[10px] font-bold ${resultBadge(student.result)}`}>
          {student.result}
        </span>

        <ChevronRight className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {/* % progress bar */}
      <div className="px-4 pb-3">
        <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${student.pct >= 75 ? 'bg-emerald-500' : student.pct >= 45 ? 'bg-blue-500' : 'bg-rose-500'}`}
            style={{ width: `${student.pct}%` }}
          />
        </div>
        <div className="flex justify-between mt-0.5 text-[10px] text-slate-400">
          <span>{student.obtained}/{student.total} marks</span>
          <span>{student.pct}%</span>
        </div>
      </div>

      {/* Expanded: subject-wise marks */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2.5">Subject-wise Marks</p>
          <div className="grid grid-cols-2 gap-2">
            {subjects.map(sub => {
              const m   = student.subjects[sub]
              const pct = m
              return (
                <div key={sub} className="rounded-xl bg-slate-50 dark:bg-[#1e2238] border border-slate-100 dark:border-[rgba(99,102,241,0.1)] p-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1 truncate">{sub}</p>
                  <div className="flex items-end justify-between">
                    <span className={`text-[20px] font-bold tabular-nums leading-tight
                      ${pct >= 75 ? 'text-emerald-700 dark:text-emerald-400' : pct >= 45 ? 'text-slate-800 dark:text-slate-100' : 'text-rose-600 dark:text-rose-400'}`}>
                      {m}
                    </span>
                    <span className="text-[10px] text-slate-400 mb-0.5">/100</span>
                  </div>
                  <div className="mt-1.5 h-1 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${pct >= 75 ? 'bg-emerald-500' : pct >= 45 ? 'bg-blue-500' : 'bg-rose-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────

function FilterDrawer({ open, onClose, filters, setters, options, errors, onShow, loading }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl"
        style={{ animation: 'drawerUp .25s ease', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-white dark:bg-[#1a1f35] z-10">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        {/* Title */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] sticky top-5 bg-white dark:bg-[#1a1f35] z-10">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Report Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* Fields */}
        <div className="px-5 py-4 space-y-4">
          <Field label="Session" error={errors.session} required>
            <NativeSelect value={filters.session} onChange={e => setters.session(e.target.value)} placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Class" error={errors.cls} required>
            <NativeSelect value={filters.cls} onChange={e => setters.cls(e.target.value)} placeholder="-- Select Class --" error={errors.cls} disabled={!filters.session}>
              {(options.classes).map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Header / Section" error={errors.header} required>
            <NativeSelect value={filters.header} onChange={e => setters.header(e.target.value)} placeholder="-- Select Header --" error={errors.header} disabled={!filters.cls}>
              {(options.headers).map(h => <option key={h} value={h}>{h}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Term" error={errors.term} required>
            <NativeSelect value={filters.term} onChange={e => setters.term(e.target.value)} placeholder="-- Select Term --" error={errors.term} disabled={!filters.header}>
              {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Exam" error={errors.exam} required>
            <NativeSelect value={filters.exam} onChange={e => setters.exam(e.target.value)} placeholder="-- Select Exam --" error={errors.exam} disabled={!filters.term}>
              {(options.exams).map(e => <option key={e} value={e}>{e}</option>)}
            </NativeSelect>
          </Field>
        </div>
        {/* Actions */}
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3 sticky bottom-0 bg-white dark:bg-[#1a1f35]">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={() => { onShow(); onClose() }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-green-600 hover:bg-green-700 disabled:opacity-70 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show Report
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function GreenSheetPrimary() {
  // Filter state
  const [session, setSession] = useState('')
  const [cls,     setCls]     = useState('')
  const [header,  setHeader]  = useState('')
  const [term,    setTerm]    = useState('')
  const [exam,    setExam]    = useState('')

  // UI state
  const [students,   setStudents]   = useState([])
  const [subjects,   setSubjects]   = useState([])
  const [loading,    setLoading]    = useState(false)
  const [exporting,  setExporting]  = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [search,     setSearch]     = useState('')
  const [errors,     setErrors]     = useState({})
  const [toast,      setToast]      = useState(null)
  const [shown,      setShown]      = useState(false)
  const [shownFilters, setShownFilters] = useState({})

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Cascading: reset downstream when upstream changes ──────────────────────
  const handleSessionChange = (val) => {
    setSession(val); setCls(''); setHeader(''); setTerm(''); setExam('')
    setErrors(p => ({ ...p, session: undefined }))
  }
  const handleClsChange = (val) => {
    setCls(val); setHeader(''); setTerm(''); setExam('')
    setErrors(p => ({ ...p, cls: undefined }))
  }
  const handleHeaderChange = (val) => {
    setHeader(val); setTerm(''); setExam('')
    setErrors(p => ({ ...p, header: undefined }))
  }
  const handleTermChange = (val) => {
    setTerm(val); setExam('')
    setErrors(p => ({ ...p, term: undefined }))
  }
  const handleExamChange = (val) => {
    setExam(val)
    setErrors(p => ({ ...p, exam: undefined }))
  }

  // Derived options
  const classOptions  = session ? (CLASSES_BY_SESSION[session]  || []) : []
  const headerOptions = cls     ? (HEADERS_BY_CLASS[cls]        || []) : []
  const examOptions   = term    ? (EXAMS_BY_TERM[term]          || []) : []

  // ── Validate + Show ────────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!session) err.session = 'Select session'
    if (!cls)     err.cls     = 'Select class'
    if (!header)  err.header  = 'Select header'
    if (!term)    err.term    = 'Select term'
    if (!exam)    err.exam    = 'Select exam'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    // Simulate API delay
    setTimeout(() => {
      const subs = getSubjects(cls)
      const data = generateStudents(cls, header, term, exam)
      setSubjects(subs)
      setStudents(data)
      setShownFilters({ session, cls, header, term, exam })
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} students — ${exam}, ${cls} (${header}).`)
    }, 700)
  }, [session, cls, header, term, exam])

  const handleReset = () => {
    setSession(''); setCls(''); setHeader(''); setTerm(''); setExam('')
    setStudents([]); setSubjects([])
    setSearch(''); setErrors({}); setShown(false); setShownFilters({})
  }

  // ── Excel export placeholder ───────────────────────────────────────────────
  const handleExcel = () => {
    if (!students.length) { showToast('Show report first.', 'error'); return }
    setExporting(true)
    setTimeout(() => {
      setExporting(false)
      showToast('Excel export ready! (API integration pending)')
    }, 1200)
  }

  // ── Search ─────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search.trim()) return students
    const q = search.toLowerCase()
    return students.filter(s =>
      s.name.toLowerCase().includes(q) ||
      String(s.roll).includes(q)
    )
  }, [students, search])

  // ── Summary stats ──────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    if (!filtered.length) return { total: 0, pass: 0, fail: 0, avg: 0 }
    return {
      total: filtered.length,
      pass:  filtered.filter(s => s.result === 'Pass').length,
      fail:  filtered.filter(s => s.result === 'Fail').length,
      avg:   Math.round(filtered.reduce((s, r) => s + r.pct, 0) / filtered.length),
    }
  }, [filtered])

  const hasResults    = shown && students.length > 0
  const filledFilters = [session, cls, header, term, exam].filter(Boolean).length

  // Drawer setters object
  const drawerSetters = {
    session: handleSessionChange,
    cls:     handleClsChange,
    header:  handleHeaderChange,
    term:    handleTermChange,
    exam:    handleExamChange,
  }
  const drawerFilters  = { session, cls, header, term, exam }
  const drawerOptions  = { classes: classOptions, headers: headerOptions, exams: examOptions }

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-green-600 dark:text-green-400" />
            Green Sheet — Primary
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Exam marks report for primary section — subject-wise student performance.
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
          {filledFilters > 0 && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400">
              {filledFilters}/5 filled
            </span>
          )}
        </div>

        <div className="p-5">
          {/* Row 1: 5 dropdowns */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <Field label="Session" error={errors.session} required>
              <NativeSelect value={session} onChange={e => handleSessionChange(e.target.value)} placeholder="-- Session --" error={errors.session}>
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Class" error={errors.cls} required>
              <NativeSelect value={cls} onChange={e => handleClsChange(e.target.value)} placeholder="-- Class --" error={errors.cls} disabled={!session}>
                {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Header / Section" error={errors.header} required>
              <NativeSelect value={header} onChange={e => handleHeaderChange(e.target.value)} placeholder="-- Header --" error={errors.header} disabled={!cls}>
                {headerOptions.map(h => <option key={h} value={h}>{h}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Term" error={errors.term} required>
              <NativeSelect value={term} onChange={e => handleTermChange(e.target.value)} placeholder="-- Term --" error={errors.term} disabled={!header}>
                {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Exam" error={errors.exam} required>
              <NativeSelect value={exam} onChange={e => handleExamChange(e.target.value)} placeholder="-- Exam --" error={errors.exam} disabled={!term}>
                {examOptions.map(e => <option key={e} value={e}>{e}</option>)}
              </NativeSelect>
            </Field>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </button>
            <button type="button" onClick={handleShow} disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-semibold text-white
                bg-green-600 hover:bg-green-700 shadow-md shadow-green-500/20
                transition-all active:scale-95 disabled:opacity-70">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
              Show Report
            </button>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ─────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-green-600 text-white shadow-md shadow-green-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {filledFilters > 0 ? `${filledFilters}/5 filters set` : 'Select Filters'}
          {filledFilters > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{filledFilters}</span>
          )}
        </button>
        {hasResults && (
          <button type="button" onClick={handleExcel} disabled={exporting}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white disabled:opacity-70">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
          </button>
        )}
        {hasResults && (
          <button type="button" onClick={handleReset}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Mobile: show report button (visible after filters set) */}
      {filledFilters === 5 && !shown && !loading && (
        <button type="button" onClick={handleShow}
          className="sm:hidden w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-bold text-white
            bg-green-600 hover:bg-green-700 shadow-md shadow-green-500/20 transition-all active:scale-95">
          <Eye className="w-4 h-4" />
          Show Report
        </button>
      )}

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={drawerFilters}
        setters={drawerSetters}
        options={drawerOptions}
        errors={errors}
        onShow={handleShow}
        loading={loading}
      />

      {/* ── Loading Skeleton ────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.1 }} />
          ))}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* School header */}
          <SchoolHeader filters={shownFilters} />

          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={GraduationCap} label="Total Students" value={stats.total} color="blue"    />
            <SummaryCard icon={Check}         label="Passed"          value={stats.pass}  color="emerald" />
            <SummaryCard icon={X}             label="Failed"          value={stats.fail}  color="rose"    />
            <SummaryCard icon={Award}         label="Class Avg %"     value={`${stats.avg}%`} color="amber" />
          </div>

          {/* Report card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-green-500 flex-shrink-0" />
                <BookOpen className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Student Marks</span>
                <span className="text-[13px] text-slate-400">· {shownFilters.exam}</span>
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
                  placeholder="Search name or roll…"
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

            {/* Info hint (desktop) */}
            <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-green-50/20 dark:bg-green-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
              <p className="text-[12px] text-green-700 dark:text-green-400">
                Scroll right to see all subjects. Green = ≥75, Red = &lt;40. Class average shown in footer row.
              </p>
            </div>

            {/* ── DESKTOP TABLE ── */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                <Search className="w-6 h-6 opacity-40" />
                <span className="text-[13px]">No students match your search.</span>
              </div>
            ) : (
              <>
                <div className="hidden md:block">
                  <DesktopTable students={filtered} subjects={subjects} />
                </div>

                {/* ── MOBILE CARDS ── */}
                <div className="md:hidden p-4 space-y-3">
                  <div className="flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <p className="text-[11px] text-green-700 dark:text-green-400 font-medium">Tap a card to see subject-wise marks.</p>
                  </div>
                  {filtered.map((s, i) => (
                    <MobileCard key={s.roll} student={s} subjects={subjects} idx={i + 1} />
                  ))}

                  {/* Mobile class summary */}
                  <div className="rounded-xl border-2 border-green-200 dark:border-green-500/30 bg-green-50 dark:bg-green-500/[0.07] p-4 mt-2">
                    <p className="text-[12px] font-bold uppercase tracking-wide text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Class Summary
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{stats.total}</p>
                        <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Total Students</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-amber-700 dark:text-amber-300 tabular-nums">{stats.avg}%</p>
                        <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">Class Average</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">{stats.pass}</p>
                        <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Passed</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-rose-700 dark:text-rose-300 tabular-nums">{stats.fail}</p>
                        <p className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">Failed</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Table footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{students.length}</span> students
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

      {/* ── Empty state ───────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center">
            <ClipboardList className="w-7 h-7 text-green-400 dark:text-green-600" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select Session → Class → Header → Term → Exam, then click <strong>Show Report</strong>.
            </p>
          </div>
          {/* Step indicators */}
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {['Session', 'Class', 'Header', 'Term', 'Exam'].map((step, i) => (
              <div key={step} className="flex items-center gap-1.5">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0
                  ${[session, cls, header, term, exam][i]
                    ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                    : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600'}`}>
                  {[session, cls, header, term, exam][i] ? <Check className="w-3 h-3" /> : i + 1}
                </span>
                <span className="text-[12px] text-slate-500 dark:text-slate-400">{step}</span>
                {i < 4 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700 flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
