/**
 * ToppersReport.jsx
 * Folder: src/pages/Reports/Exam/ToppersReport.jsx
 *
 * Converts legacy ASPX "Toppers Report" to fully-responsive React + Tailwind.
 *
 * Filters: Session, Class, Section (multi), Term, Type (ClassWise/SectionWise),
 *          Percentage Criteria, Top-N Students, Date
 * Features:
 *  - Validation on all required fields
 *  - Class-wise & Section-wise rank tables
 *  - Mobile: collapsible rank cards
 *  - Desktop: dense ERP-style table
 *  - Summary stat cards
 *  - School header banner
 *  - Toast feedback
 *  - Filter drawer on mobile
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye, AlertCircle, X, Check, Loader2,
  ChevronDown, ChevronRight, SlidersHorizontal, Search,
  Medal, Trophy, Award, Star, Crown,
  Users, BookOpen, BarChart3, FileSpreadsheet,
  Building2, MapPin, TrendingUp, Calendar,
  GraduationCap, Target, Info, Hash
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII',
  'Class IX', 'Class X', 'Class XI', 'Class XII',
]

const SECTIONS_BY_CLASS = {
  Nursery: ['A', 'B'],
  LKG: ['A', 'B'],
  UKG: ['A', 'B'],
  'Class I': ['A', 'B'],
  'Class II': ['A', 'B'],
  'Class III': ['A'],
  'Class IV': ['A'],
  'Class V': ['A'],
  'Class VI': ['A', 'B'],
  'Class VII': ['A'],
  'Class VIII': ['A'],
  'Class IX': ['A', 'B'],
  'Class X': ['A'],
  'Class XI': ['A', 'B'],
  'Class XII': ['A', 'B'],
}

const TERMS = ['Term 1', 'Term 2', 'Annual', 'Pre-Board']

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

// Dummy toppers data generator
const FIRST_NAMES = ['Aarav', 'Ananya', 'Rohan', 'Priya', 'Arjun', 'Sneha', 'Vikram', 'Kavya', 'Rahul', 'Pooja',
  'Amit', 'Divya', 'Kartik', 'Meera', 'Shivam', 'Riya', 'Nikhil', 'Anjali', 'Dev', 'Sakshi']
const LAST_NAMES = ['Sharma', 'Gupta', 'Singh', 'Verma', 'Mehta', 'Joshi', 'Yadav', 'Patel', 'Mishra', 'Tiwari']

const seed = (str) => {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  return Math.abs(h)
}

const randName = (s) => {
  const n = seed(s)
  return `${FIRST_NAMES[n % FIRST_NAMES.length]} ${LAST_NAMES[(n >> 3) % LAST_NAMES.length]}`
}

const randAdm = (s) => {
  const n = seed(s)
  return `SVM${2020 + (n % 5)}${String(1000 + (n % 9000)).padStart(4, '0')}`
}

const generateToppers = (cls, section, term, session, count = 10) => {
  return Array.from({ length: count }, (_, i) => {
    const key = `${cls}-${section}-${term}-${session}-${i}`
    const baseMarks = 500
    const obtained = Math.round(baseMarks * (0.98 - i * 0.015) * (0.95 + seed(key) % 10 * 0.005))
    const percentage = ((obtained / baseMarks) * 100).toFixed(2)
    return {
      rank: i + 1,
      rollNo: String(1001 + seed(key) % 50).padStart(4, '0'),
      admNo: randAdm(key),
      name: randName(key),
      class: cls,
      section,
      obtained,
      maxMarks: baseMarks,
      percentage: parseFloat(percentage),
      grade: percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B+' : 'B',
    }
  })
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const RANK_COLORS = [
  { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-500/30', icon: Crown },
  { bg: 'bg-slate-100 dark:bg-slate-700/40', text: 'text-slate-600 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-600/40', icon: Medal },
  { bg: 'bg-orange-50 dark:bg-orange-500/10', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-500/30', icon: Award },
]

const getRankStyle = (rank) => RANK_COLORS[rank - 1] || { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-100 dark:border-blue-500/20', icon: Star }

const GRADE_COLORS = {
  'A+': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  A:   'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  'B+': 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300',
  B:   'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
}

const formatAbbr = (name = '') => name.replace('Class ', '').slice(0, 3).toUpperCase()

const CLASS_BADGE_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' }, { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#0891b2', bg: '#cffafe' }, { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' }, { fg: '#dc2626', bg: '#fee2e2' },
  { fg: '#0369a1', bg: '#e0f2fe' },
]
const classColor = (name) => CLASS_BADGE_COLORS[(name?.charCodeAt(0) ?? 0) % CLASS_BADGE_COLORS.length]

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

// ─── SCHOOL HEADER ────────────────────────────────────────────────────────────

function SchoolHeader({ session, term, date }) {
  return (
    <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-6 py-5 text-center shadow-sm">
      <div className="flex items-center justify-center gap-2 mb-1">
        <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <h2 className="text-[16px] sm:text-[18px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
          {SCHOOL_INFO.name}
        </h2>
      </div>
      <div className="flex items-center justify-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400 mb-2">
        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
        <span>{SCHOOL_INFO.address}</span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25 text-[12px] font-bold text-amber-700 dark:text-amber-400">
          Session: {session}
        </span>
        {term && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/25 text-[12px] font-bold text-blue-700 dark:text-blue-400">
            {term}
          </span>
        )}
        {date && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/25 text-[12px] font-bold text-emerald-700 dark:text-emerald-400">
            <Calendar className="w-3 h-3" />{date}
          </span>
        )}
      </div>
      <p className="mt-2 text-[13px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400">
        Toppers Report
      </p>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────

function DesktopRow({ row, showSection }) {
  const rankStyle = getRankStyle(row.rank)
  const RankIcon = rankStyle.icon
  const { fg, bg } = classColor(row.class)

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      {/* Rank */}
      <td className="px-4 py-3 text-center">
        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-[12px] font-bold border ${rankStyle.bg} ${rankStyle.text} ${rankStyle.border}`}>
          {row.rank <= 3 ? <RankIcon className="w-4 h-4" /> : row.rank}
        </span>
      </td>

      {/* Roll No */}
      <td className="px-4 py-3 text-center">
        <span className="text-[12px] font-mono text-slate-500 dark:text-slate-400">{row.rollNo}</span>
      </td>

      {/* Adm No */}
      <td className="px-4 py-3 text-center">
        <span className="text-[12px] font-mono text-slate-600 dark:text-slate-300">{row.admNo}</span>
      </td>

      {/* Name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold"
            style={{ background: bg, color: fg }}>
            {row.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.name}</span>
        </div>
      </td>

      {/* Class */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
            style={{ background: bg, color: fg }}>
            {formatAbbr(row.class)}
          </span>
          <span className="text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.class}</span>
        </div>
      </td>

      {/* Section (optional) */}
      {showSection && (
        <td className="px-4 py-3 text-center">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-[12px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {row.section}
          </span>
        </td>
      )}

      {/* Obtained */}
      <td className="px-4 py-3 text-center">
        <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 tabular-nums">{row.obtained}</span>
        <span className="text-[11px] text-slate-400">/{row.maxMarks}</span>
      </td>

      {/* Percentage */}
      <td className="px-4 py-3 text-center">
        <div className="flex flex-col items-center gap-1">
          <span className="text-[13px] font-bold text-blue-700 dark:text-blue-400 tabular-nums">{row.percentage}%</span>
          <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${row.percentage}%` }} />
          </div>
        </div>
      </td>

      {/* Grade */}
      <td className="px-4 py-3 text-center">
        <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[12px] font-bold ${GRADE_COLORS[row.grade] || GRADE_COLORS.B}`}>
          {row.grade}
        </span>
      </td>
    </tr>
  )
}

// ─── MOBILE TOPPER CARD ───────────────────────────────────────────────────────

function MobileTopperCard({ row, showSection }) {
  const [expanded, setExpanded] = useState(false)
  const rankStyle = getRankStyle(row.rank)
  const RankIcon = rankStyle.icon
  const { fg, bg } = classColor(row.class)

  return (
    <div className={`rounded-xl border ${rankStyle.border} bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm`}>
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Rank Badge */}
        <span className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-[13px] font-bold border ${rankStyle.bg} ${rankStyle.text} ${rankStyle.border}`}>
          {row.rank <= 3 ? <RankIcon className="w-5 h-5" /> : `#${row.rank}`}
        </span>

        {/* Name + meta */}
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{row.name}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            {row.class}{showSection ? ` · Sec ${row.section}` : ''} · {row.admNo}
          </p>
        </div>

        {/* Percentage */}
        <div className="flex flex-col items-end flex-shrink-0">
          <span className="text-[18px] font-bold text-blue-700 dark:text-blue-400 tabular-nums leading-tight">{row.percentage}%</span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md mt-0.5 ${GRADE_COLORS[row.grade]}`}>{row.grade}</span>
        </div>

        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Progress bar */}
      <div className="px-4 pb-3">
        <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <div className="h-full rounded-full bg-blue-500 transition-all duration-500" style={{ width: `${row.percentage}%` }} />
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-[12px]">
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-2.5">
              <p className="text-slate-400 dark:text-slate-500 text-[10px] font-semibold uppercase tracking-wide">Roll No.</p>
              <p className="font-bold text-slate-700 dark:text-slate-200 mt-0.5 tabular-nums">{row.rollNo}</p>
            </div>
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-2.5">
              <p className="text-slate-400 dark:text-slate-500 text-[10px] font-semibold uppercase tracking-wide">Adm. No.</p>
              <p className="font-bold text-slate-700 dark:text-slate-200 mt-0.5 font-mono text-[11px]">{row.admNo}</p>
            </div>
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-500/10 p-2.5">
              <p className="text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold uppercase tracking-wide">Marks Obtained</p>
              <p className="font-bold text-emerald-700 dark:text-emerald-300 mt-0.5 tabular-nums">{row.obtained} / {row.maxMarks}</p>
            </div>
            <div className="rounded-lg bg-blue-50 dark:bg-blue-500/10 p-2.5">
              <p className="text-blue-600 dark:text-blue-400 text-[10px] font-semibold uppercase tracking-wide">Percentage</p>
              <p className="font-bold text-blue-700 dark:text-blue-300 mt-0.5 tabular-nums">{row.percentage}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── SECTION GROUP (groups toppers by class or section) ───────────────────────

function TopperGroup({ title, subtitle, rows, type }) {
  const [collapsed, setCollapsed] = useState(false)
  const showSection = type === 'SectionWise'

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      {/* Group Header */}
      <button
        type="button"
        onClick={() => setCollapsed(p => !p)}
        className="w-full flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02] hover:bg-slate-100/60 dark:hover:bg-white/[0.04] transition-colors text-left"
      >
        <span className="w-1 h-5 rounded-full bg-amber-500 flex-shrink-0" />
        <Trophy className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">{title}</span>
          {subtitle && <span className="ml-2 text-[12px] text-slate-400 dark:text-slate-500">{subtitle}</span>}
        </div>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 flex-shrink-0">
          {rows.length} student{rows.length !== 1 ? 's' : ''}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${collapsed ? '-rotate-90' : ''}`} />
      </button>

      {!collapsed && (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/40 dark:bg-white/[0.015]">
                  {['Rank', 'Roll No.', 'Adm. No.', 'Student Name', 'Class',
                    ...(showSection ? ['Section'] : []),
                    'Marks', 'Percentage', 'Grade'
                  ].map((h, i) => (
                    <th key={i} className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <DesktopRow key={`${row.admNo}-${row.rank}`} row={row} showSection={showSection} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden p-4 space-y-3">
            <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
              <Info className="w-3.5 h-3.5 flex-shrink-0" />
              Tap a card to see detailed breakdown.
            </p>
            {rows.map((row) => (
              <MobileTopperCard key={`${row.admNo}-${row.rank}`} row={row} showSection={showSection} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ─── MULTI-SELECT SECTION LISTBOX ─────────────────────────────────────────────

function SectionMultiSelect({ sections, selected, onChange, error }) {
  const toggle = (sec) => {
    if (selected.includes(sec)) onChange(selected.filter(s => s !== sec))
    else onChange([...selected, sec])
  }
  const toggleAll = () => {
    if (selected.length === sections.length) onChange([])
    else onChange([...sections])
  }

  return (
    <div className={`rounded-lg border overflow-hidden ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}>
      {/* All */}
      <button type="button" onClick={toggleAll}
        className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] font-semibold border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50 dark:bg-[#1e2238] hover:bg-slate-100 dark:hover:bg-[#252a42] transition-colors text-slate-600 dark:text-slate-300">
        <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${selected.length === sections.length ? 'bg-blue-500 border-blue-500' : 'border-slate-300 dark:border-slate-600'}`}>
          {selected.length === sections.length && <Check className="w-2.5 h-2.5 text-white" />}
        </span>
        All Sections
      </button>
      <div className="flex flex-wrap gap-1.5 p-2 bg-white dark:bg-[#1e2238]">
        {sections.map(sec => (
          <button key={sec} type="button" onClick={() => toggle(sec)}
            className={`px-3 py-1 rounded-lg text-[12px] font-bold border transition-all ${
              selected.includes(sec)
                ? 'bg-blue-500 text-white border-blue-500 dark:bg-indigo-600 dark:border-indigo-600'
                : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 hover:border-blue-400 hover:text-blue-600'
            }`}>
            {sec}
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
  sections, setSections,
  term, setTerm,
  type, setType,
  percentage, setPercentage,
  topN, setTopN,
  date, setDate,
  onShow, loading, errors, availableSections
}) {
  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl overflow-y-auto max-h-[90vh]"
        style={{ animation: 'drawerUp .25s ease' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-white dark:bg-[#1a1f35] z-10">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] sticky top-5 bg-white dark:bg-[#1a1f35] z-10">
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
            <NativeSelect value={session} onChange={e => setSession(e.target.value)} placeholder="-- Select --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Class" error={errors.cls} required>
            <NativeSelect value={cls} onChange={e => { setCls(e.target.value); setSections([]) }} placeholder="-- Select --" error={errors.cls}>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>
          {availableSections.length > 0 && (
            <Field label="Section (Multi-select)">
              <SectionMultiSelect sections={availableSections} selected={sections} onChange={setSections} />
            </Field>
          )}
          <Field label="Term" error={errors.term} required>
            <NativeSelect value={term} onChange={e => setTerm(e.target.value)} placeholder="-- Select --" error={errors.term}>
              {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Report Type">
            <NativeSelect value={type} onChange={e => setType(e.target.value)}>
              <option value="ClassWise">Class Wise</option>
              <option value="SectionWise">Section Wise</option>
            </NativeSelect>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="% Criteria">
              <input value={percentage} onChange={e => setPercentage(e.target.value)} type="number" min="0" max="100" placeholder="e.g. 60"
                className="w-full px-3 py-2 text-[13px] rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.25)] bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400" />
            </Field>
            <Field label="Top N Students">
              <input value={topN} onChange={e => setTopN(e.target.value)} type="number" min="1" max="50" placeholder="e.g. 10"
                className="w-full px-3 py-2 text-[13px] rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.25)] bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400" />
            </Field>
          </div>
          <Field label="Date">
            <input value={date} onChange={e => setDate(e.target.value)} type="date"
              className="w-full px-3 py-2 text-[13px] rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.25)] bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400" />
          </Field>
        </div>

        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3 sticky bottom-0 bg-white dark:bg-[#1a1f35]">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={() => { onShow(); onClose() }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-70 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show Report
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function ToppersReport() {
  // Filters
  const [session,    setSession]    = useState('')
  const [cls,        setCls]        = useState('')
  const [sections,   setSections]   = useState([])
  const [term,       setTerm]       = useState('')
  const [type,       setType]       = useState('ClassWise')
  const [percentage, setPercentage] = useState('')
  const [topN,       setTopN]       = useState('10')
  const [date,       setDate]       = useState('')

  // UI state
  const [groups,      setGroups]      = useState([])
  const [loading,     setLoading]     = useState(false)
  const [exporting,   setExporting]   = useState(false)
  const [filterOpen,  setFilterOpen]  = useState(false)
  const [search,      setSearch]      = useState('')
  const [errors,      setErrors]      = useState({})
  const [toast,       setToast]       = useState(null)
  const [shown,       setShown]       = useState(false)
  const [shownMeta,   setShownMeta]   = useState({})

  const showToast = (msg, t = 'success') => {
    setToast({ msg, type: t })
    setTimeout(() => setToast(null), 3500)
  }

  const availableSections = useMemo(() => (cls ? SECTIONS_BY_CLASS[cls] || [] : []), [cls])

  // ── Validation ──────────────────────────────────────────────────────────
  const validate = () => {
    const err = {}
    if (!session) err.session = 'Required'
    if (!cls)     err.cls     = 'Required'
    if (!term)    err.term    = 'Required'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  // ── Show Report ─────────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    if (!validate()) return
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      const n = Math.min(Math.max(parseInt(topN) || 10, 1), 50)
      const pctMin = parseFloat(percentage) || 0

      const secs = sections.length > 0 ? sections : availableSections

      let built = []

      if (type === 'SectionWise') {
        // One group per section
        secs.forEach(sec => {
          let rows = generateToppers(cls, sec, term, session, n)
          if (pctMin > 0) rows = rows.filter(r => r.percentage >= pctMin)
          if (rows.length > 0) {
            built.push({ key: `${cls}-${sec}`, title: `${cls}`, subtitle: `Section ${sec}`, rows })
          }
        })
      } else {
        // One group for class (merge sections, re-rank)
        let allRows = []
        secs.forEach(sec => {
          allRows = allRows.concat(generateToppers(cls, sec, term, session, n))
        })
        allRows.sort((a, b) => b.percentage - a.percentage)
        if (pctMin > 0) allRows = allRows.filter(r => r.percentage >= pctMin)
        allRows = allRows.slice(0, n).map((r, i) => ({ ...r, rank: i + 1 }))
        if (allRows.length > 0) {
          built.push({ key: cls, title: cls, subtitle: `Class Wise · All Sections`, rows: allRows })
        }
      }

      setGroups(built)
      setShownMeta({ session, cls, term, type, date, topN: n })
      setShown(true)
      setLoading(false)
      showToast(`Report generated — ${built.reduce((s, g) => s + g.rows.length, 0)} toppers found.`)
    }, 700)
  }, [session, cls, sections, term, type, percentage, topN, date, availableSections])

  const handleReset = () => {
    setSession(''); setCls(''); setSections([]); setTerm('')
    setType('ClassWise'); setPercentage(''); setTopN('10'); setDate('')
    setGroups([]); setErrors({}); setShown(false); setShownMeta({}); setSearch('')
  }

  const handleExcel = () => {
    if (!shown || groups.length === 0) { showToast('No data to export. Show report first.', 'error'); return }
    setExporting(true)
    setTimeout(() => { setExporting(false); showToast('Excel export ready! (API integration pending)') }, 1200)
  }

  // ── Search filter ─────────────────────────────────────────────────────
  const filteredGroups = useMemo(() => {
    if (!search) return groups
    const q = search.toLowerCase()
    return groups.map(g => ({
      ...g,
      rows: g.rows.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.admNo.toLowerCase().includes(q) ||
        r.rollNo.includes(q)
      )
    })).filter(g => g.rows.length > 0)
  }, [groups, search])

  const totalToppers = useMemo(() => filteredGroups.reduce((s, g) => s + g.rows.length, 0), [filteredGroups])
  const avgPct = useMemo(() => {
    const all = filteredGroups.flatMap(g => g.rows)
    return all.length ? (all.reduce((s, r) => s + r.percentage, 0) / all.length).toFixed(1) : '0.0'
  }, [filteredGroups])
  const topScore = useMemo(() => {
    const all = filteredGroups.flatMap(g => g.rows)
    return all.length ? Math.max(...all.map(r => r.percentage)).toFixed(2) : '0.00'
  }, [filteredGroups])

  const hasResults = shown && groups.length > 0
  const activeFiltersCount = [session, cls, term].filter(Boolean).length

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Toppers Report
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Class & section-wise top-performing students ranked by percentage.
          </p>
        </div>
        {hasResults && (
          <button type="button" onClick={handleExcel} disabled={exporting}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-70 flex-shrink-0">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            Export Excel
          </button>
        )}
      </div>

      {/* ── DESKTOP Filter Card ──────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-amber-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
        </div>

        <div className="p-5 space-y-4">
          {/* Row 1 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="Session" error={errors.session} required>
              <NativeSelect value={session} onChange={e => { setSession(e.target.value); setErrors(p => ({ ...p, session: undefined })) }}
                placeholder="-- Select Session --" error={errors.session}>
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Class" error={errors.cls} required>
              <NativeSelect value={cls} onChange={e => { setCls(e.target.value); setSections([]); setErrors(p => ({ ...p, cls: undefined })) }}
                placeholder="-- Select Class --" error={errors.cls}>
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Term" error={errors.term} required>
              <NativeSelect value={term} onChange={e => { setTerm(e.target.value); setErrors(p => ({ ...p, term: undefined })) }}
                placeholder="-- Select Term --" error={errors.term}>
                {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Report Type">
              <NativeSelect value={type} onChange={e => setType(e.target.value)}>
                <option value="ClassWise">Class Wise</option>
                <option value="SectionWise">Section Wise</option>
              </NativeSelect>
            </Field>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-start">
            {availableSections.length > 0 && (
              <div className="col-span-2 lg:col-span-1">
                <Field label="Section (Multi-select)">
                  <SectionMultiSelect sections={availableSections} selected={sections} onChange={setSections} />
                </Field>
              </div>
            )}
            <Field label="% Criteria">
              <input value={percentage} onChange={e => setPercentage(e.target.value)} type="number" min="0" max="100" placeholder="e.g. 60"
                className="w-full px-3 py-2 text-[13px] rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.25)] bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400" />
            </Field>
            <Field label="Top N Students">
              <input value={topN} onChange={e => setTopN(e.target.value)} type="number" min="1" max="50" placeholder="e.g. 10"
                className="w-full px-3 py-2 text-[13px] rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.25)] bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400" />
            </Field>
            <Field label="Date">
              <input value={date} onChange={e => setDate(e.target.value)} type="date"
                className="w-full px-3 py-2 text-[13px] rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.25)] bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400" />
            </Field>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-1">
            <button type="button" onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </button>
            <button type="button" onClick={handleShow} disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-70">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
              Show Report
            </button>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ─────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {activeFiltersCount > 0 ? `${activeFiltersCount} Filter${activeFiltersCount > 1 ? 's' : ''} Set` : 'Set Filters'}
          {activeFiltersCount > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFiltersCount}</span>
          )}
        </button>
        {hasResults && (
          <button type="button" onClick={handleExcel} disabled={exporting}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm disabled:opacity-70">
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
        sections={sections} setSections={setSections}
        term={term} setTerm={setTerm}
        type={type} setType={setType}
        percentage={percentage} setPercentage={setPercentage}
        topN={topN} setTopN={setTopN}
        date={date} setDate={setDate}
        onShow={handleShow} loading={loading} errors={errors}
        availableSections={availableSections}
      />

      {/* ── Loading Skeleton ─────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.1 }} />
          ))}
        </div>
      )}

      {/* ── Results ───────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* School Header */}
          <SchoolHeader
            session={shownMeta.session}
            term={shownMeta.term}
            date={shownMeta.date ? new Date(shownMeta.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
          />

          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={Users}      label="Total Toppers"   value={totalToppers}            color="blue"    />
            <SummaryCard icon={Crown}      label={`Top ${shownMeta.topN} Per Group`} value={shownMeta.topN}  color="amber"   />
            <SummaryCard icon={TrendingUp} label="Avg Percentage"  value={`${avgPct}%`}            color="emerald" />
            <SummaryCard icon={Star}       label="Highest Score"   value={`${topScore}%`}          color="violet"  />
          </div>

          {/* Search + result count */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, admission no., roll no…"
                className="w-full pl-8 pr-8 py-2 text-[13px] rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.25)] bg-white dark:bg-[#1e2238] text-slate-700 dark:text-slate-200 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400 placeholder-slate-300 dark:placeholder-slate-600"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 text-[12px] text-slate-500 dark:text-slate-400 flex-shrink-0">
              <Hash className="w-3.5 h-3.5" />
              <span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{totalToppers}</span> students
                {' · '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{filteredGroups.length}</span> group{filteredGroups.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Info hint */}
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-amber-100 dark:border-amber-500/20 bg-amber-50/60 dark:bg-amber-500/[0.05]">
            <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <p className="text-[12px] text-amber-700 dark:text-amber-400">
              <span className="font-semibold">{shownMeta.type === 'SectionWise' ? 'Section Wise' : 'Class Wise'}</span> ranking
              {' · '}{shownMeta.cls}{' · '}{shownMeta.term}{' · '}Top {shownMeta.topN} students per group.
            </p>
          </div>

          {/* Groups */}
          {filteredGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
              <Search className="w-8 h-8 opacity-30" />
              <div className="text-center">
                <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No results match your search</p>
                <button onClick={() => setSearch('')} className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline mt-1">Clear search</button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredGroups.map(g => (
                <TopperGroup key={g.key} title={g.title} subtitle={g.subtitle} rows={g.rows} type={shownMeta.type} />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Empty State ───────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
            <Trophy className="w-8 h-8 text-amber-400 dark:text-amber-500" />
          </div>
          <div className="text-center max-w-xs">
            <p className="text-[15px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[13px] text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
              Select session, class, and term, then click <strong>Show Report</strong> to see top performers.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
