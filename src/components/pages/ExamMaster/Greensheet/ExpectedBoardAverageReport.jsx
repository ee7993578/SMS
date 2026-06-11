/**
 * ExpectedBoardAverageReport.jsx
 * Folder: src/pages/Reports/Exam/ExpectedBoardAverageReport.jsx
 *
 * Converts legacy ASPX "Expected Board Average Report" (Green Sheet) to
 * fully-responsive React + Tailwind.
 *
 * Filters: Session → Class → Term → Exam → Subject (multi-select)
 * Features:
 *  - Cascading dropdowns (each unlocks after previous is selected)
 *  - Multi-select subject listbox → tag pills on mobile
 *  - Show report button
 *  - Desktop: dense ERP-style result table with subject-wise avg columns
 *  - Mobile: card-per-class accordion layout
 *  - Summary stat cards (overall avg, top subject, lowest subject, total students)
 *  - School header banner
 *  - Toast notifications
 *  - Loading skeleton
 *  - Empty / no-data states
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  Filter, RefreshCw, Eye, AlertCircle, X, Check, Loader2,
  ChevronDown, ChevronRight, SlidersHorizontal, Info, Search,
  FileSpreadsheet, BookOpen, Building2, MapPin, TrendingUp,
  GraduationCap, BarChart3, Target, Award, Minus
} from 'lucide-react'

// ─── STATIC DATA ──────────────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CLASSES_BY_SESSION = {
  '2022-23': ['Class IX', 'Class X', 'Class XI', 'Class XII'],
  '2023-24': ['Class IX', 'Class X', 'Class XI', 'Class XII'],
  '2024-25': ['Class IX', 'Class X', 'Class XI', 'Class XII'],
  '2025-26': ['Class IX', 'Class X', 'Class XI', 'Class XII'],
}

const TERMS = ['Term 1', 'Term 2', 'Annual']

const EXAMS_BY_TERM = {
  'Term 1':  ['Unit Test 1', 'Half Yearly'],
  'Term 2':  ['Unit Test 2', 'Pre-Board'],
  'Annual':  ['Board Exam', 'Annual Exam'],
}

const SUBJECTS_BY_CLASS = {
  'Class IX':  ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Sanskrit'],
  'Class X':   ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Sanskrit'],
  'Class XI':  ['English', 'Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science', 'Accountancy', 'Economics', 'Business Studies'],
  'Class XII': ['English', 'Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science', 'Accountancy', 'Economics', 'Business Studies'],
}

const SCHOOL_INFO = {
  name:    'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

// Dummy report data generator
const generateReportData = (cls, term, exam, subjects) => {
  const sections = cls === 'Class XI' || cls === 'Class XII' ? ['A', 'B'] : ['A', 'B']
  const base = {
    'Class IX':  72, 'Class X': 75, 'Class XI': 68, 'Class XII': 71,
  }[cls] ?? 70

  return sections.map((sec, si) => {
    const row = { class: cls, section: sec, totalStudents: 42 + si * 3 }
    let sum = 0
    subjects.forEach((sub, i) => {
      const val = Math.min(99, Math.max(45, base + (i % 3 === 0 ? 4 : -2) + (si * 2) + Math.floor(Math.random() * 6 - 3)))
      row[sub] = val
      sum += val
    })
    row.average = subjects.length ? +(sum / subjects.length).toFixed(1) : 0
    row.expectedBoard = +(row.average * 0.97 + 1.2).toFixed(1)
    return row
  })
}

// ─── COLOR HELPERS ────────────────────────────────────────────────────────────

const avgColor = (val) => {
  if (val >= 80) return { text: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' }
  if (val >= 65) return { text: 'text-blue-700 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-500/10' }
  if (val >= 50) return { text: 'text-amber-700 dark:text-amber-400',  bg: 'bg-amber-50 dark:bg-amber-500/10' }
  return           { text: 'text-rose-700 dark:text-rose-400',    bg: 'bg-rose-50 dark:bg-rose-500/10' }
}

const avgGradeDot = (val) => {
  if (val >= 80) return 'bg-emerald-500'
  if (val >= 65) return 'bg-blue-500'
  if (val >= 50) return 'bg-amber-500'
  return           'bg-rose-500'
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
          disabled:opacity-40 disabled:cursor-not-allowed
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

function Field({ label, error, required, children, hint }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1">
        {label}
        {required && <span className="text-rose-500">*</span>}
        {hint && (
          <span className="text-[10px] font-normal normal-case text-slate-400 ml-1">({hint})</span>
        )}
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

// ─── MULTI-SELECT SUBJECT BOX ─────────────────────────────────────────────────

function SubjectMultiSelect({ subjects, selected, onChange, disabled }) {
  // Toggle a subject
  const toggle = (sub) => {
    if (selected.includes(sub)) onChange(selected.filter(s => s !== sub))
    else onChange([...selected, sub])
  }
  const allSelected = subjects.length > 0 && selected.length === subjects.length
  const toggleAll = () => allSelected ? onChange([]) : onChange([...subjects])

  return (
    <div className={`rounded-lg border transition-all ${disabled ? 'opacity-40 pointer-events-none' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}>
      {/* Select All row */}
      <button
        type="button"
        onClick={toggleAll}
        className="w-full flex items-center gap-2 px-3 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)]
          bg-slate-50 dark:bg-white/[0.03] rounded-t-lg hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors"
      >
        <span className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border text-white transition-colors
          ${allSelected ? 'bg-blue-600 border-blue-600' : 'bg-white dark:bg-[#1e2238] border-slate-300 dark:border-slate-600'}`}>
          {allSelected && <Check className="w-2.5 h-2.5" />}
        </span>
        <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">Select All Subjects</span>
      </button>

      {/* Subject list */}
      <div className="max-h-40 overflow-y-auto divide-y divide-slate-50 dark:divide-[rgba(99,102,241,0.07)]">
        {subjects.length === 0 ? (
          <p className="px-3 py-3 text-[12px] text-slate-400 italic">Select a class first</p>
        ) : subjects.map(sub => {
          const checked = selected.includes(sub)
          return (
            <button
              key={sub}
              type="button"
              onClick={() => toggle(sub)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-left
                hover:bg-blue-50/60 dark:hover:bg-blue-500/[0.05] transition-colors"
            >
              <span className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border text-white transition-colors
                ${checked ? 'bg-blue-600 border-blue-600' : 'bg-white dark:bg-[#1e2238] border-slate-300 dark:border-slate-600'}`}>
                {checked && <Check className="w-2.5 h-2.5" />}
              </span>
              <span className="text-[12px] text-slate-700 dark:text-slate-300">{sub}</span>
            </button>
          )
        })}
      </div>

      {/* Selected pill strip */}
      {selected.length > 0 && (
        <div className="px-3 py-2 border-t border-slate-100 dark:border-[rgba(99,102,241,0.12)]
          flex flex-wrap gap-1.5 bg-slate-50/60 dark:bg-white/[0.02] rounded-b-lg">
          {selected.map(s => (
            <span key={s}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold
                bg-blue-100 text-blue-700 dark:bg-indigo-500/20 dark:text-indigo-300">
              {s}
              <button type="button" onClick={() => toggle(s)} className="hover:text-rose-500 transition-colors">
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── SCHOOL HEADER ────────────────────────────────────────────────────────────

function SchoolHeader({ session, cls, term, exam }) {
  return (
    <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)]
      bg-gradient-to-r from-blue-50 via-white to-indigo-50
      dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35]
      px-6 py-5 text-center shadow-sm">
      <div className="flex items-center justify-center gap-2 mb-1">
        <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <h2 className="text-[16px] sm:text-[18px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
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
          { label: 'Class',   val: cls },
          { label: 'Term',    val: term },
          { label: 'Exam',    val: exam },
        ].map(({ label, val }) => (
          <span key={label}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold
              bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25
              text-amber-700 dark:text-amber-400">
            {label}: {val}
          </span>
        ))}
      </div>
      <p className="mt-3 text-[13px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400">
        Expected Board Average Report (Green Sheet)
      </p>
    </div>
  )
}

// ─── SUMMARY STAT CARD ────────────────────────────────────────────────────────

function SummaryCard({ icon: Icon, label, value, sub, color }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)]
      bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
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

// ─── DESKTOP TABLE ────────────────────────────────────────────────────────────

function DesktopTable({ rows, subjects }) {
  if (!rows.length) return (
    <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
      <Search className="w-6 h-6 opacity-40" />
      <span className="text-[13px]">No data available.</span>
    </div>
  )

  // Grand totals
  const totals = useMemo(() => {
    const t = { totalStudents: 0, average: 0, expectedBoard: 0 }
    subjects.forEach(s => { t[s] = 0 })
    rows.forEach(r => {
      t.totalStudents += r.totalStudents
      t.average       += r.average
      t.expectedBoard += r.expectedBoard
      subjects.forEach(s => { t[s] += r[s] ?? 0 })
    })
    t.average       = +(t.average / rows.length).toFixed(1)
    t.expectedBoard = +(t.expectedBoard / rows.length).toFixed(1)
    subjects.forEach(s => { t[s] = +(t[s] / rows.length).toFixed(1) })
    return t
  }, [rows, subjects])

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-max">
        <thead>
          <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
            {['S.No.', 'Class', 'Sec.', 'Students', ...subjects, 'Class Avg', 'Expected Board'].map((h, i) => (
              <th key={i}
                className={`px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap
                  ${i <= 3 ? 'text-left' : 'text-center'}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={`${row.class}-${row.section}`}
              className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
              <td className="px-3 py-3 text-[12px] text-slate-400 dark:text-slate-500 tabular-nums">{i + 1}</td>
              <td className="px-3 py-3">
                <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.class}</span>
              </td>
              <td className="px-3 py-3">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-[12px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {row.section}
                </span>
              </td>
              <td className="px-3 py-3">
                <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-300 tabular-nums">{row.totalStudents}</span>
              </td>
              {subjects.map(sub => {
                const v = row[sub] ?? 0
                const { text, bg } = avgColor(v)
                return (
                  <td key={sub} className="px-3 py-3 text-center">
                    <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[12px] font-semibold tabular-nums ${bg} ${text}`}>
                      {v}
                    </span>
                  </td>
                )
              })}
              {/* Class Avg */}
              <td className="px-3 py-3 text-center">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[13px] font-bold tabular-nums
                  ${avgColor(row.average).bg} ${avgColor(row.average).text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${avgGradeDot(row.average)}`} />
                  {row.average}
                </span>
              </td>
              {/* Expected Board */}
              <td className="px-3 py-3 text-center">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[13px] font-bold tabular-nums
                  bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                  <Target className="w-3 h-3 flex-shrink-0" />
                  {row.expectedBoard}
                </span>
              </td>
            </tr>
          ))}

          {/* Grand Average Footer */}
          <tr className="bg-blue-50 dark:bg-indigo-500/[0.07] border-t-2 border-blue-200 dark:border-indigo-500/30">
            <td className="px-3 py-3 text-[12px] text-blue-400 dark:text-blue-500">—</td>
            <td className="px-3 py-3" colSpan={2}>
              <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" /> Grand Average
              </span>
            </td>
            <td className="px-3 py-3">
              <span className="text-[12px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{totals.totalStudents}</span>
            </td>
            {subjects.map(sub => {
              const { text, bg } = avgColor(totals[sub])
              return (
                <td key={sub} className="px-3 py-3 text-center">
                  <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[12px] font-bold tabular-nums ${bg} ${text}`}>
                    {totals[sub]}
                  </span>
                </td>
              )
            })}
            <td className="px-3 py-3 text-center">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[13px] font-bold tabular-nums
                ${avgColor(totals.average).bg} ${avgColor(totals.average).text}`}>
                {totals.average}
              </span>
            </td>
            <td className="px-3 py-3 text-center">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[13px] font-bold tabular-nums
                bg-indigo-100 text-indigo-800 dark:bg-indigo-500/25 dark:text-indigo-300">
                <Target className="w-3 h-3" />{totals.expectedBoard}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// ─── MOBILE RESULT CARD ───────────────────────────────────────────────────────

function MobileResultCard({ row, subjects, idx }) {
  const [expanded, setExpanded] = useState(false)
  const { text: avgText, bg: avgBg } = avgColor(row.average)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)]
      bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left
          hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
        {/* Badge */}
        <span className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[12px] font-bold
          bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
          {idx}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100">
            {row.class}
            <span className="ml-2 text-[12px] font-semibold text-slate-400 dark:text-slate-500">Sec {row.section}</span>
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            {row.totalStudents} students · {subjects.length} subject{subjects.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex flex-col items-end flex-shrink-0 mr-1">
          <span className={`text-[18px] font-bold tabular-nums leading-tight ${avgText}`}>{row.average}</span>
          <span className="text-[10px] text-slate-400">class avg</span>
        </div>

        <span className={`w-5 h-5 flex items-center justify-center text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Quick strip: expected board + avg bar */}
      <div className="px-4 pb-3 flex items-center gap-3">
        <div className="flex-1">
          <div className="flex justify-between text-[10px] font-semibold mb-1">
            <span className="text-slate-400">Class Avg</span>
            <span className={avgText}>{row.average}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${avgGradeDot(row.average)}`}
              style={{ width: `${row.average}%` }} />
          </div>
        </div>
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold
          bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300 flex-shrink-0">
          <Target className="w-3 h-3" /> Exp: {row.expectedBoard}
        </span>
      </div>

      {/* Expanded: subject-wise scores */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-2.5">Subject-wise Average</p>
          <div className="space-y-2">
            {subjects.map(sub => {
              const v = row[sub] ?? 0
              const { text, bg } = avgColor(v)
              return (
                <div key={sub} className="flex items-center gap-2">
                  <span className="text-[12px] text-slate-600 dark:text-slate-300 w-36 flex-shrink-0 truncate">{sub}</span>
                  <div className="flex-1 h-5 rounded-md bg-slate-100 dark:bg-slate-700/60 overflow-hidden relative">
                    <div className={`h-full rounded-md transition-all duration-500 ${avgGradeDot(v)} opacity-80`}
                      style={{ width: `${v}%` }} />
                    <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold tabular-nums ${text}`}>{v}</span>
                  </div>
                </div>
              )
            })}
          </div>
          {/* Summary row */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className={`rounded-xl ${avgBg} px-3 py-2 text-center`}>
              <p className={`text-[20px] font-bold tabular-nums ${avgText}`}>{row.average}</p>
              <p className={`text-[10px] font-semibold ${avgText}`}>Class Average</p>
            </div>
            <div className="rounded-xl bg-indigo-50 dark:bg-indigo-500/10 px-3 py-2 text-center">
              <p className="text-[20px] font-bold tabular-nums text-indigo-700 dark:text-indigo-400">{row.expectedBoard}</p>
              <p className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">Expected Board</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────

function FilterDrawer({ open, onClose, filters, setters, subjects, availableSubjects, onShow, loading, errors }) {
  if (!open) return null
  const { session, cls, term, exam, selectedSubjects } = filters
  const { setSession, setCls, setTerm, setExam, setSelectedSubjects } = setters

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35]
          border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl
          max-h-[90vh] overflow-y-auto"
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
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* Body */}
        <div className="px-5 py-5 space-y-4">
          <Field label="Session" error={errors.session} required>
            <NativeSelect value={session} onChange={e => { setSession(e.target.value); setCls(''); setTerm(''); setExam(''); setSelectedSubjects([]) }} placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Class" error={errors.cls} required>
            <NativeSelect value={cls} onChange={e => { setCls(e.target.value); setSelectedSubjects([]) }} placeholder="-- Select Class --" disabled={!session} error={errors.cls}>
              {(CLASSES_BY_SESSION[session] || []).map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Term" error={errors.term} required>
            <NativeSelect value={term} onChange={e => { setTerm(e.target.value); setExam('') }} placeholder="-- Select Term --" disabled={!cls} error={errors.term}>
              {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Exam" error={errors.exam} required>
            <NativeSelect value={exam} onChange={e => setExam(e.target.value)} placeholder="-- Select Exam --" disabled={!term} error={errors.exam}>
              {(EXAMS_BY_TERM[term] || []).map(e => <option key={e} value={e}>{e}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Subjects" hint="optional — all if none selected">
            <SubjectMultiSelect
              subjects={availableSubjects}
              selected={selectedSubjects}
              onChange={setSelectedSubjects}
              disabled={!cls}
            />
          </Field>
        </div>
        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700
              hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={() => { onShow(); onClose() }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
              disabled:opacity-70 transition-all shadow-md shadow-blue-500/20">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show Report
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MAIN PAGE COMPONENT ──────────────────────────────────────────────────────

export default function ExpectedBoardAverageReport() {
  // Filter state
  const [session,          setSession]          = useState('')
  const [cls,              setCls]              = useState('')
  const [term,             setTerm]             = useState('')
  const [exam,             setExam]             = useState('')
  const [selectedSubjects, setSelectedSubjects] = useState([])

  // UI state
  const [rows,         setRows]         = useState([])
  const [shownSubjects,setShownSubjects]= useState([])
  const [loading,      setLoading]      = useState(false)
  const [filterOpen,   setFilterOpen]   = useState(false)
  const [errors,       setErrors]       = useState({})
  const [toast,        setToast]        = useState(null)
  const [shown,        setShown]        = useState(false)
  const [shownMeta,    setShownMeta]    = useState({})

  const availableSubjects = SUBJECTS_BY_CLASS[cls] || []

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Validation & Fetch ────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!session) err.session = 'Required'
    if (!cls)     err.cls     = 'Required'
    if (!term)    err.term    = 'Required'
    if (!exam)    err.exam    = 'Required'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)

    const subjectsToLoad = selectedSubjects.length
      ? selectedSubjects
      : availableSubjects   // default: all if none chosen

    setTimeout(() => {
      const data = generateReportData(cls, term, exam, subjectsToLoad)
      setRows(data)
      setShownSubjects(subjectsToLoad)
      setShownMeta({ session, cls, term, exam })
      setShown(true)
      setLoading(false)
      showToast(`Report loaded for ${cls} — ${exam} (${term}).`)
    }, 700)
  }, [session, cls, term, exam, selectedSubjects, availableSubjects])

  const handleReset = () => {
    setSession(''); setCls(''); setTerm(''); setExam('')
    setSelectedSubjects([]); setRows([]); setErrors({})
    setShown(false); setShownMeta({}); setShownSubjects([])
  }

  // ── Derived summary ───────────────────────────────────────────────────────
  const summary = useMemo(() => {
    if (!rows.length || !shownSubjects.length) return null
    const overallAvg = +(rows.reduce((s, r) => s + r.average, 0) / rows.length).toFixed(1)
    const overallBoard = +(rows.reduce((s, r) => s + r.expectedBoard, 0) / rows.length).toFixed(1)
    const totalStudents = rows.reduce((s, r) => s + r.totalStudents, 0)

    // Subject-wise avg across all sections
    const subAvgs = shownSubjects.map(sub => ({
      sub,
      avg: +(rows.reduce((s, r) => s + (r[sub] ?? 0), 0) / rows.length).toFixed(1)
    }))
    const top    = subAvgs.reduce((a, b) => b.avg > a.avg ? b : a, subAvgs[0])
    const bottom = subAvgs.reduce((a, b) => b.avg < a.avg ? b : a, subAvgs[0])

    return { overallAvg, overallBoard, totalStudents, top, bottom }
  }, [rows, shownSubjects])

  const hasResults = shown && rows.length > 0

  // Active filter count for mobile badge
  const activeCount = [session, cls, term, exam].filter(Boolean).length

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Expected Board Average
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Green Sheet — subject-wise class average vs projected board score.
          </p>
        </div>
        {hasResults && (
          <button
            type="button"
            onClick={() => showToast('Excel export ready! (API integration pending)')}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20
              transition-all active:scale-95 flex-shrink-0">
            <FileSpreadsheet className="w-4 h-4" />
            Export Excel
          </button>
        )}
      </div>

      {/* ── DESKTOP Filter Card ──────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)]
        bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)]
          bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
        </div>

        <div className="p-5 space-y-4">
          {/* Row 1: session, class, term, exam */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="Session" error={errors.session} required>
              <NativeSelect value={session}
                onChange={e => { setSession(e.target.value); setCls(''); setTerm(''); setExam(''); setSelectedSubjects([]) }}
                placeholder="-- Select Session --" error={errors.session}>
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Class" error={errors.cls} required>
              <NativeSelect value={cls}
                onChange={e => { setCls(e.target.value); setSelectedSubjects([]) }}
                placeholder="-- Select Class --" disabled={!session} error={errors.cls}>
                {(CLASSES_BY_SESSION[session] || []).map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Term" error={errors.term} required>
              <NativeSelect value={term}
                onChange={e => { setTerm(e.target.value); setExam('') }}
                placeholder="-- Select Term --" disabled={!cls} error={errors.term}>
                {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Exam" error={errors.exam} required>
              <NativeSelect value={exam}
                onChange={e => setExam(e.target.value)}
                placeholder="-- Select Exam --" disabled={!term} error={errors.exam}>
                {(EXAMS_BY_TERM[term] || []).map(e => <option key={e} value={e}>{e}</option>)}
              </NativeSelect>
            </Field>
          </div>

          {/* Row 2: subjects + action */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-start">
            <div className="lg:col-span-3">
              <Field label="Subjects" hint="optional — all subjects loaded if none selected">
                <SubjectMultiSelect
                  subjects={availableSubjects}
                  selected={selectedSubjects}
                  onChange={setSelectedSubjects}
                  disabled={!cls}
                />
              </Field>
            </div>

            <div className="flex flex-col gap-2 pt-5">
              <button type="button" onClick={handleShow} disabled={loading}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
                  bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20
                  dark:bg-indigo-600 dark:hover:bg-indigo-700
                  transition-all active:scale-95 disabled:opacity-70 w-full">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                Show Report
              </button>
              <button type="button" onClick={handleReset}
                className="flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold
                  bg-slate-100 text-slate-700 hover:bg-slate-200
                  dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700
                  transition-colors w-full">
                <RefreshCw className="w-3.5 h-3.5" /> Reset
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
          {activeCount > 0 ? `${activeCount} filter${activeCount > 1 ? 's' : ''} applied` : 'Set Filters'}
          {activeCount > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeCount}</span>
          )}
        </button>
        {hasResults && (
          <button type="button" onClick={() => showToast('Excel export ready! (API integration pending)')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm">
            <FileSpreadsheet className="w-4 h-4" />
          </button>
        )}
        {hasResults && (
          <button type="button" onClick={handleReset}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200
              dark:bg-slate-800 dark:text-slate-300">
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Mobile Filter Drawer */}
      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={{ session, cls, term, exam, selectedSubjects }}
        setters={{ setSession, setCls, setTerm, setExam, setSelectedSubjects }}
        subjects={selectedSubjects}
        availableSubjects={availableSubjects}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ─────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)]
          bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-11 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse"
              style={{ opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
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
          {summary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <SummaryCard
                icon={BarChart3}
                label="Overall Class Avg"
                value={summary.overallAvg}
                color="blue"
              />
              <SummaryCard
                icon={Target}
                label="Expected Board Avg"
                value={summary.overallBoard}
                color="violet"
              />
              <SummaryCard
                icon={Award}
                label="Top Subject"
                value={summary.top?.avg ?? '—'}
                sub={summary.top?.sub}
                color="emerald"
              />
              <SummaryCard
                icon={Minus}
                label="Needs Attention"
                value={summary.bottom?.avg ?? '—'}
                sub={summary.bottom?.sub}
                color="amber"
              />
            </div>
          )}

          {/* Result Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)]
            bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5
              border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)]
              bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Report Data</span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">· {shownMeta.exam}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full
                  bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                  {rows.length} section{rows.length !== 1 ? 's' : ''}
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full
                  bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 flex-shrink-0">
                  {shownSubjects.length} subject{shownSubjects.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Info hint */}
            <div className="hidden sm:flex items-center gap-2 px-5 py-2
              border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)]
              bg-blue-50/20 dark:bg-blue-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <p className="text-[12px] text-blue-700 dark:text-blue-400">
                Expected Board Average = Class Average × 0.97 + 1.2 (school adjustment factor). Color: <span className="text-emerald-600 font-semibold">≥80 Excellent</span> · <span className="text-blue-600 font-semibold">≥65 Good</span> · <span className="text-amber-600 font-semibold">≥50 Average</span> · <span className="text-rose-600 font-semibold">&lt;50 Needs Attention</span>.
              </p>
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden md:block">
              <DesktopTable rows={rows} subjects={shownSubjects} />
            </div>

            {/* MOBILE CARDS */}
            <div className="md:hidden p-4 space-y-3">
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                Tap a card to see subject-wise breakdown.
              </p>
              {rows.map((row, i) => (
                <MobileResultCard
                  key={`${row.class}-${row.section}`}
                  row={row}
                  subjects={shownSubjects}
                  idx={i + 1}
                />
              ))}

              {/* Mobile Grand Total */}
              {summary && (
                <div className="rounded-xl border-2 border-blue-200 dark:border-indigo-500/30
                  bg-blue-50 dark:bg-indigo-500/[0.07] p-4">
                  <p className="text-[12px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Grand Average — {rows.length} Section{rows.length !== 1 ? 's' : ''}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                      <p className="text-[22px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{summary.overallAvg}</p>
                      <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Class Average</p>
                    </div>
                    <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                      <p className="text-[22px] font-bold text-indigo-700 dark:text-indigo-300 tabular-nums">{summary.overallBoard}</p>
                      <p className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">Expected Board</p>
                    </div>
                    <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                      <p className="text-[22px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">{summary.top?.avg}</p>
                      <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 truncate">{summary.top?.sub}</p>
                    </div>
                    <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                      <p className="text-[22px] font-bold text-amber-700 dark:text-amber-300 tabular-nums">{summary.bottom?.avg}</p>
                      <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 truncate">{summary.bottom?.sub}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 px-5 py-3.5
              border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)]
              bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500 flex-1">
                {rows.length} section{rows.length !== 1 ? 's' : ''} ·{' '}
                {shownSubjects.length} subject{shownSubjects.length !== 1 ? 's' : ''} ·{' '}
                {summary?.totalStudents ?? 0} students
              </p>
              {/* Color legend */}
              <div className="hidden sm:flex items-center gap-3">
                {[
                  { label: '≥80', cls: 'bg-emerald-500' },
                  { label: '≥65', cls: 'bg-blue-500' },
                  { label: '≥50', cls: 'bg-amber-500' },
                  { label: '<50', cls: 'bg-rose-500' },
                ].map(({ label, cls: c }) => (
                  <span key={label} className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className={`w-2 h-2 rounded-full ${c}`} />{label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Empty / Initial State ─────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <GraduationCap className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1 max-w-xs">
              Select Session → Class → Term → Exam (and optionally subjects), then click <strong>Show Report</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
