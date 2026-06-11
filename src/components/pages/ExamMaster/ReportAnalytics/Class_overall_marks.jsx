/**
 * Class_overall_marks.jsx
 * Folder: src/pages/Reports/Exam/Class_overall_marks.jsx
 *
 * Converts legacy ASPX "Overall Performance Report" to fully-responsive React + Tailwind.
 *
 * Columns: S.No, Student Name, Total Marks, Percentage, Rank, Grade
 * Features:
 *  - Session + Class dropdown filters
 *  - Show report button + Excel export
 *  - School name / class / session header in report
 *  - Mobile: expandable cards with rank/grade badges
 *  - Desktop: dense ERP-style table
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye,
  AlertCircle, X, Check, Loader2, ChevronDown,
  Users, Medal, Percent, Star,
  SlidersHorizontal, Info, Search,
  BarChart3, FileSpreadsheet, BookOpen,
  School2, TrendingUp, ChevronRight,
  Award, GraduationCap, Trophy, Hash
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────
const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII',
  'Class IX', 'Class X', 'Class XI', 'Class XII',
]

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

// Grade helper
const getGrade = (pct) => {
  if (pct >= 91) return { grade: 'A+', color: 'emerald' }
  if (pct >= 75) return { grade: 'A',  color: 'blue'    }
  if (pct >= 60) return { grade: 'B+', color: 'cyan'    }
  if (pct >= 45) return { grade: 'B',  color: 'amber'   }
  if (pct >= 33) return { grade: 'C',  color: 'orange'  }
  return              { grade: 'D',  color: 'rose'    }
}

// Generate realistic dummy performance data
const generateStudents = (session, cls) => {
  const seed = (session + cls).split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const pseudo = (n) => ((seed * 9301 + 49297 * (n + 1)) % 233280) / 233280

  const firstNames = ['Aarav','Ananya','Vivaan','Ishaan','Arjun','Diya','Kavya','Riya','Rohan','Priya',
    'Siddharth','Neha','Karan','Pooja','Rahul','Sneha','Aditya','Meera','Vikram','Shruti',
    'Tanmay','Nisha','Arnav','Sakshi','Dhruv']
  const lastNames  = ['Sharma','Gupta','Singh','Verma','Joshi','Patel','Mishra','Yadav','Tiwari','Chauhan']

  const count = 20 + Math.floor(pseudo(0) * 15)
  const students = Array.from({ length: count }, (_, i) => {
    const fIdx = Math.floor(pseudo(i * 3) * firstNames.length)
    const lIdx = Math.floor(pseudo(i * 3 + 1) * lastNames.length)
    const maxMarks = 500
    const totalMarks = Math.round(150 + pseudo(i * 3 + 2) * 350)
    const per = parseFloat(((totalMarks / maxMarks) * 100).toFixed(2))
    const { grade } = getGrade(per)
    return {
      id: i + 1,
      name: `${firstNames[fIdx]} ${lastNames[lIdx]}`,
      total_marks: totalMarks,
      max_marks: maxMarks,
      per,
      Grade: grade,
    }
  })

  // Sort by marks desc and assign ranks
  students.sort((a, b) => b.total_marks - a.total_marks)
  students.forEach((s, i) => { s.Rank = i + 1 })

  return students
}

// ─── COLOR HELPERS ────────────────────────────────────────────────────────────
const GRADE_STYLES = {
  'A+': { badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30' },
  'A':  { badge: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 border-blue-200 dark:border-blue-500/30' },
  'B+': { badge: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300 border-cyan-200 dark:border-cyan-500/30' },
  'B':  { badge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border-amber-200 dark:border-amber-500/30' },
  'C':  { badge: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300 border-orange-200 dark:border-orange-500/30' },
  'D':  { badge: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 border-rose-200 dark:border-rose-500/30' },
}

const RANK_MEDAL = {
  1: { icon: '🥇', color: 'text-amber-500' },
  2: { icon: '🥈', color: 'text-slate-400' },
  3: { icon: '🥉', color: 'text-amber-700' },
}

const pctBarColor = (pct) => {
  if (pct >= 91) return 'bg-emerald-500'
  if (pct >= 75) return 'bg-blue-500'
  if (pct >= 60) return 'bg-cyan-500'
  if (pct >= 45) return 'bg-amber-500'
  if (pct >= 33) return 'bg-orange-500'
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
function SummaryCard({ icon: Icon, label, value, sub, color }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
    cyan:    'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400',
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
        {sub && <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{sub}</p>}
      </div>
    </div>
  )
}

// ─── SCHOOL HEADER BANNER ─────────────────────────────────────────────────────
function SchoolHeader({ session, cls }) {
  return (
    <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-6 py-5 text-center shadow-sm">
      <div className="flex items-center justify-center gap-2 mb-1">
        <School2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <h2 className="text-[15px] sm:text-[18px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
          {SCHOOL_INFO.name}
        </h2>
      </div>
      <p className="text-[12px] text-slate-500 dark:text-slate-400 mb-3">{SCHOOL_INFO.address}</p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25 text-[12px] font-bold text-amber-700 dark:text-amber-400">
          Session: {session}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/25 text-[12px] font-bold text-blue-700 dark:text-blue-400">
          <GraduationCap className="w-3.5 h-3.5" /> {cls}
        </span>
      </div>
      <p className="mt-2 text-[13px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400">
        Overall Performance Report
      </p>
    </div>
  )
}

// ─── PERCENTAGE BAR ───────────────────────────────────────────────────────────
function PctBar({ pct }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${pctBarColor(pct)}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <span className="text-[12px] font-semibold tabular-nums text-slate-700 dark:text-slate-200 w-12 text-right flex-shrink-0">
        {pct}%
      </span>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ student, idx }) {
  const gradeMeta = GRADE_STYLES[student.Grade] || GRADE_STYLES['D']
  const medal = RANK_MEDAL[student.Rank]

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">{idx}</td>

      {/* Student Name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex-shrink-0 flex items-center justify-center text-white text-[11px] font-bold select-none">
            {student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{student.name}</span>
        </div>
      </td>

      {/* Total Marks */}
      <td className="px-4 py-3 text-center">
        <span className="text-[13px] font-bold tabular-nums text-slate-800 dark:text-slate-100">{student.total_marks}</span>
        <span className="text-[11px] text-slate-400 dark:text-slate-500">/{student.max_marks}</span>
      </td>

      {/* Percentage */}
      <td className="px-4 py-3 min-w-[140px]">
        <PctBar pct={student.per} />
      </td>

      {/* Rank */}
      <td className="px-4 py-3 text-center">
        {medal
          ? <span className="text-[18px]" title={`Rank ${student.Rank}`}>{medal.icon}</span>
          : <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[12px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 tabular-nums">
              {student.Rank}
            </span>
        }
      </td>

      {/* Grade */}
      <td className="px-4 py-3 text-center">
        <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[12px] font-bold border ${gradeMeta.badge}`}>
          {student.Grade}
        </span>
      </td>
    </tr>
  )
}

// ─── MOBILE STUDENT CARD ──────────────────────────────────────────────────────
function MobileCard({ student, idx }) {
  const [expanded, setExpanded] = useState(false)
  const gradeMeta = GRADE_STYLES[student.Grade] || GRADE_STYLES['D']
  const medal = RANK_MEDAL[student.Rank]

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex-shrink-0 flex items-center justify-center text-white text-[12px] font-bold select-none">
          {student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight">{student.name}</p>
            {medal && <span className="text-[14px]">{medal.icon}</span>}
          </div>
          {/* Mini pct bar */}
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div className={`h-full rounded-full ${pctBarColor(student.per)}`} style={{ width: `${Math.min(student.per, 100)}%` }} />
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums flex-shrink-0">{student.per}%</span>
          </div>
        </div>

        {/* Grade badge */}
        <div className="flex flex-col items-end flex-shrink-0 gap-1">
          <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-lg text-[12px] font-bold border ${gradeMeta.badge}`}>
            {student.Grade}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 tabular-nums">Rank #{student.Rank}</span>
        </div>

        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4">
          <div className="grid grid-cols-3 gap-2">
            {/* Total Marks */}
            <div className="rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-3 text-center">
              <Hash className="w-4 h-4 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
              <p className="text-[20px] font-bold text-blue-700 dark:text-blue-300 tabular-nums leading-tight">{student.total_marks}</p>
              <p className="text-[9px] font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400 mt-0.5">of {student.max_marks}</p>
              <p className="text-[10px] text-blue-500/70 dark:text-blue-400/60 mt-0.5">Total Marks</p>
            </div>
            {/* Percentage */}
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-3 text-center">
              <Percent className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
              <p className="text-[20px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums leading-tight">{student.per}%</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 mt-0.5">Percentage</p>
            </div>
            {/* Rank */}
            <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 p-3 text-center">
              <Trophy className="w-4 h-4 text-amber-600 dark:text-amber-400 mx-auto mb-1" />
              <p className="text-[20px] font-bold text-amber-700 dark:text-amber-300 tabular-nums leading-tight">
                {medal ? medal.icon : `#${student.Rank}`}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400 mt-0.5">Rank</p>
            </div>
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
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Filters</span>
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

// ─── GRADE DISTRIBUTION MINI CHART ───────────────────────────────────────────
function GradeDist({ students }) {
  const grades = ['A+', 'A', 'B+', 'B', 'C', 'D']
  const counts = grades.reduce((acc, g) => {
    acc[g] = students.filter(s => s.Grade === g).length
    return acc
  }, {})
  const max = Math.max(...Object.values(counts), 1)

  const barColors = {
    'A+': 'bg-emerald-500', 'A': 'bg-blue-500', 'B+': 'bg-cyan-500',
    'B': 'bg-amber-500', 'C': 'bg-orange-500', 'D': 'bg-rose-500',
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">Grade Distribution</span>
      </div>
      <div className="flex items-end gap-3 h-20">
        {grades.map(g => (
          <div key={g} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 tabular-nums">{counts[g]}</span>
            <div className="w-full rounded-t-md overflow-hidden bg-slate-100 dark:bg-slate-800" style={{ height: '48px' }}>
              <div
                className={`w-full rounded-t-md ${barColors[g]} transition-all duration-700`}
                style={{ height: `${(counts[g] / max) * 100}%`, marginTop: 'auto' }}
              />
            </div>
            <span className={`text-[10px] font-bold ${GRADE_STYLES[g]?.badge.split(' ')[1] ?? 'text-slate-600'}`}>{g}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ClassOverallMarks() {
  const [session,      setSession]      = useState('')
  const [cls,          setCls]          = useState('')
  const [students,     setStudents]     = useState([])
  const [loading,      setLoading]      = useState(false)
  const [exporting,    setExporting]    = useState(false)
  const [filterOpen,   setFilterOpen]   = useState(false)
  const [search,       setSearch]       = useState('')
  const [sortField,    setSortField]    = useState('Rank')
  const [sortAsc,      setSortAsc]      = useState(true)
  const [errors,       setErrors]       = useState({})
  const [toast,        setToast]        = useState(null)
  const [shown,        setShown]        = useState(false)
  const [shownMeta,    setShownMeta]    = useState({ session: '', cls: '' })
  const [activeTab,    setActiveTab]    = useState('table') // 'table' | 'chart'

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Fetch (simulate API) ──────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!session) err.session = 'Please select a session'
    if (!cls)     err.cls     = 'Please select a class'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')
    setSortField('Rank')
    setSortAsc(true)

    setTimeout(() => {
      const data = generateStudents(session, cls)
      setStudents(data)
      setShownMeta({ session, cls })
      setShown(true)
      setLoading(false)
      setActiveTab('table')
      showToast(`Loaded ${data.length} students for ${cls} — ${session}.`)
    }, 700)
  }, [session, cls])

  const handleReset = () => {
    setSession(''); setCls(''); setStudents([]); setSearch('')
    setErrors({}); setShown(false); setShownMeta({ session: '', cls: '' })
    setSortField('Rank'); setSortAsc(true)
  }

  // ── Excel Export placeholder ──────────────────────────────────────────────
  const handleExcel = () => {
    if (students.length === 0) { showToast('No data to export.', 'error'); return }
    setExporting(true)
    setTimeout(() => {
      setExporting(false)
      showToast('Excel export ready! (API integration pending)')
    }, 1200)
  }

  // ── Sort toggle ───────────────────────────────────────────────────────────
  const toggleSort = (field) => {
    if (sortField === field) setSortAsc(p => !p)
    else { setSortField(field); setSortAsc(true) }
  }

  // ── Filtered + sorted data ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let data = students
    if (search) {
      const q = search.toLowerCase()
      data = data.filter(s => s.name.toLowerCase().includes(q) || String(s.Rank).includes(q) || s.Grade.toLowerCase().includes(q))
    }
    return [...data].sort((a, b) => {
      let av = a[sortField], bv = b[sortField]
      if (typeof av === 'string') av = av.toLowerCase()
      if (typeof bv === 'string') bv = bv.toLowerCase()
      if (av < bv) return sortAsc ? -1 : 1
      if (av > bv) return sortAsc ? 1 : -1
      return 0
    })
  }, [students, search, sortField, sortAsc])

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    if (!students.length) return {}
    const pcts = students.map(s => s.per)
    const avg = (pcts.reduce((a, b) => a + b, 0) / pcts.length).toFixed(1)
    const highest = Math.max(...pcts)
    const passed = students.filter(s => s.per >= 33).length
    const top3 = students.filter(s => s.Rank <= 3)
    return { avg, highest, passed, total: students.length, top3 }
  }, [students])

  const hasResults   = shown && students.length > 0
  const activeFilters = [session, cls].filter(Boolean).length

  // ── Sortable header ───────────────────────────────────────────────────────
  const SortTh = ({ label, field, center }) => {
    const active = sortField === field
    return (
      <th
        className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap cursor-pointer select-none
          hover:text-blue-600 dark:hover:text-blue-400 transition-colors
          ${center ? 'text-center' : 'text-left'}`}
        onClick={() => toggleSort(field)}
      >
        <span className="inline-flex items-center gap-1">
          {label}
          {active && (
            <span className="text-blue-500">{sortAsc ? '↑' : '↓'}</span>
          )}
        </span>
      </th>
    )
  }

  return (
    <div className="space-y-4 pb-10">

      {/* ── Breadcrumb ───────────────────────────────────────────────────── */}
      <nav className="flex items-center gap-1.5 text-[12px] text-slate-400 dark:text-slate-500 flex-wrap">
        {['Home', 'Reports', 'Exam', 'Overall Performance'].map((crumb, i, arr) => (
          <span key={crumb} className="flex items-center gap-1.5">
            <span className={i === arr.length - 1
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
              : 'hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors'}>
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
            <BarChart3 className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Overall Performance Report
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Class-wise student performance — marks, percentage, rank &amp; grade.
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
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                title="Reset">
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
          {activeFilters > 0 ? `${session}${cls ? ' · ' + cls : ''}` : 'Select Filters'}
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
        session={session} setSession={setSession}
        cls={cls} setCls={setCls}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ────────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* School Header */}
          <SchoolHeader session={shownMeta.session} cls={shownMeta.cls} />

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={Users}   label="Total Students"  value={stats.total}             color="blue"    />
            <SummaryCard icon={Medal}   label="Pass Count"      value={`${stats.passed}/${stats.total}`} sub={`${((stats.passed/stats.total)*100).toFixed(0)}% pass rate`} color="emerald" />
            <SummaryCard icon={Percent} label="Class Average"   value={`${stats.avg}%`}          color="cyan"    />
            <SummaryCard icon={Star}    label="Highest Score"   value={`${stats.highest}%`}      color="amber"   />
          </div>

          {/* Top 3 Topper Strip */}
          {stats.top3?.length > 0 && (
            <div className="rounded-2xl border border-amber-100 dark:border-amber-500/20 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-500/5 dark:to-yellow-500/5 px-5 py-4">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-[13px] font-bold text-amber-700 dark:text-amber-400">Top Performers</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {stats.top3.map(s => (
                  <div key={s.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-[#1a1f35] border border-amber-200 dark:border-amber-500/25 shadow-sm">
                    <span className="text-[16px]">{RANK_MEDAL[s.Rank]?.icon}</span>
                    <div>
                      <p className="text-[12px] font-bold text-slate-800 dark:text-slate-100 leading-tight">{s.name}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{s.total_marks} marks · {s.per}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab switcher (mobile: Table | Chart) */}
          <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 sm:hidden">
            {['table', 'chart'].map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-lg text-[13px] font-semibold capitalize transition-all
                  ${activeTab === tab
                    ? 'bg-white dark:bg-[#1a1f35] text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
              >
                {tab === 'table' ? '📋 Results' : '📊 Grades'}
              </button>
            ))}
          </div>

          {/* Grade distribution (always on desktop, tab-controlled on mobile) */}
          <div className={activeTab === 'chart' ? 'block sm:block' : 'hidden sm:block'}>
            <GradeDist students={students} />
          </div>

          {/* Results card */}
          <div className={`rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden
            ${activeTab === 'table' ? 'block' : 'hidden sm:block'}`}>

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Student Results</span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">· {shownMeta.cls} · {shownMeta.session}</span>
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
                  placeholder="Search name, grade, rank…"
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

            {/* Sort hint */}
            <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <p className="text-[12px] text-blue-700 dark:text-blue-400">
                Click any column header to sort. Grades: A+ (≥91%) → A (≥75%) → B+ (≥60%) → B (≥45%) → C (≥33%) → D
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
                      <th className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 w-12">S.No.</th>
                      <SortTh label="Student Name"  field="name"        center={false} />
                      <SortTh label="Total Marks"   field="total_marks" center={true}  />
                      <SortTh label="Percentage"    field="per"         center={true}  />
                      <SortTh label="Rank"          field="Rank"        center={true}  />
                      <SortTh label="Grade"         field="Grade"       center={true}  />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((student, i) => (
                      <DesktopRow key={student.id} student={student} idx={i + 1} />
                    ))}
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
                    Tap a card to see detailed breakdown.
                  </p>
                  {filtered.map((student, i) => (
                    <MobileCard key={student.id} student={student} idx={i + 1} />
                  ))}
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

      {/* ── Empty State ───────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <GraduationCap className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a <strong>Session</strong> and <strong>Class</strong>, then click <strong>Show</strong> to generate the report.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
