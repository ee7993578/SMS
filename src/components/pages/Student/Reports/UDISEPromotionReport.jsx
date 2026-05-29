/**
 * UDISEPromotionReport.jsx
 * Folder: src/pages/Reports/Exam/UDISEPromotionReport.jsx
 *
 * Converts legacy ASPX "UDISE Promotion Report" to fully-responsive React + Tailwind.
 *
 * Filters: Session, Class, Section (multi-select), Term, Order By
 * Features:
 *  - Validation on Submit
 *  - Loading skeleton
 *  - Desktop: dense ERP-style table with sticky header
 *  - Mobile: collapsible cards with expandable breakdown
 *  - Grand total footer row
 *  - Excel export placeholder
 *  - Search / filter
 *  - Toast notifications
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  Filter, RefreshCw, Eye, AlertCircle, X, Check,
  Loader2, ChevronDown, ChevronRight, Users, TrendingUp,
  SlidersHorizontal, Info, Search, FileSpreadsheet,
  BookOpen, School2, MapPin, Building2, BarChart3,
  Award, UserCheck, UserX, ArrowUpDown, GraduationCap,
  ClipboardList, CheckCircle2, XCircle, Percent, ChevronUp
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ─────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X',
  'Class XI', 'Class XII',
]

const SECTIONS_BY_CLASS = {
  'Nursery': ['A', 'B'],
  'LKG': ['A', 'B'],
  'UKG': ['A', 'B'],
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

const TERMS = [
  { value: '1', label: 'Term 1 (April – September)' },
  { value: '2', label: 'Term 2 (October – March)' },
  { value: 'annual', label: 'Annual Examination' },
]

const ORDER_BY_OPTIONS = [
  { value: 'class',           label: 'Class' },
  { value: 'overallper desc', label: 'Percentage ↓ (Descending)' },
  { value: 'overallper asc',  label: 'Percentage ↑ (Ascending)' },
]

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

// ── Generate dummy report data ────────────────────────────────────────────────
const generateData = (cls, sections, term) => {
  const seed = (cls.charCodeAt(0) + (term || '1').charCodeAt(0)) % 7
  return sections.map(sec => {
    const total     = 30 + seed * 3 + (sec === 'A' ? 2 : 0)
    const appeared  = total - (seed % 3)
    const passed    = appeared - (seed + 1)
    const failed    = appeared - passed
    const promoted  = passed
    const detained  = failed
    const overallPer = appeared ? Math.round((passed / appeared) * 100) : 0
    return {
      class:       cls,
      section:     sec,
      total,
      appeared,
      absent:      total - appeared,
      passed,
      failed,
      promoted,
      detained,
      overallPer,
      distinction: Math.max(0, Math.floor(passed * 0.18)),
      firstDiv:    Math.max(0, Math.floor(passed * 0.35)),
      secondDiv:   Math.max(0, Math.floor(passed * 0.30)),
      thirdDiv:    Math.max(0, passed - Math.floor(passed * 0.18) - Math.floor(passed * 0.35) - Math.floor(passed * 0.30)),
    }
  })
}

// ─── COLOR HELPERS ────────────────────────────────────────────────────────────
const CLASS_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' },
  { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#0891b2', bg: '#cffafe' },
  { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' },
  { fg: '#dc2626', bg: '#fee2e2' },
  { fg: '#0369a1', bg: '#e0f2fe' },
]
const classColor = (name = '') =>
  CLASS_COLORS[(name.charCodeAt(0) ?? 0) % CLASS_COLORS.length]

const formatAbbr = (name = '') =>
  name.replace('Class ', '').slice(0, 3).toUpperCase()

const perColor = (p) => {
  if (p >= 90) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'
  if (p >= 75) return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10'
  if (p >= 60) return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10'
  return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10'
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

function Field({ label, error, required, children, hint }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-[11px] text-slate-400 dark:text-slate-500">{hint}</p>
      )}
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
      style={{ animation: 'slideUpT .25s ease' }}
    >
      <style>{`@keyframes slideUpT{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
      {type === 'success'
        ? <Check className="w-4 h-4 flex-shrink-0" />
        : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
    </div>
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
    cyan:    'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
        {sub && <p className="text-[10px] text-slate-400 dark:text-slate-500">{sub}</p>}
      </div>
    </div>
  )
}

// ─── SCHOOL HEADER BANNER ─────────────────────────────────────────────────────
function SchoolHeader({ session, cls, term }) {
  const termLabel = TERMS.find(t => t.value === term)?.label || term
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
        <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25">
          <span className="text-[12px] font-bold text-amber-700 dark:text-amber-400">Session: {session}</span>
        </span>
        <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-blue-100 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/25">
          <span className="text-[12px] font-bold text-blue-700 dark:text-blue-400">{cls}</span>
        </span>
        <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-violet-100 dark:bg-violet-500/15 border border-violet-200 dark:border-violet-500/25">
          <span className="text-[12px] font-bold text-violet-700 dark:text-violet-400">{termLabel}</span>
        </span>
      </div>
      <p className="mt-2 text-[13px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400">
        UDISE Promotion Report
      </p>
    </div>
  )
}

// ─── DESKTOP TABLE ────────────────────────────────────────────────────────────
const TABLE_HEADS = [
  'S.No.', 'Class', 'Sec', 'Total', 'Appeared', 'Absent',
  'Passed', 'Failed', 'Promoted', 'Detained', 'Pass %',
  'Distinction', '1st Div', '2nd Div', '3rd Div',
]

function DesktopRow({ row, idx, isTotal }) {
  const { fg, bg } = classColor(row.class)
  const pc = perColor(row.overallPer)

  const cell = (val, extra = '') => (
    <td className={`px-3 py-2.5 text-center text-[12px] tabular-nums font-medium text-slate-600 dark:text-slate-300 ${extra}`}>
      {val}
    </td>
  )

  if (isTotal) {
    return (
      <tr className="bg-blue-50 dark:bg-indigo-500/[0.07] border-t-2 border-blue-200 dark:border-indigo-500/30">
        <td className="px-3 py-3 text-center text-[12px] text-blue-400">—</td>
        <td className="px-3 py-3" colSpan={2}>
          <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Grand Total
          </span>
        </td>
        {[row.total, row.appeared, row.absent].map((v, i) => (
          <td key={i} className="px-3 py-2.5 text-center">
            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[12px] font-bold bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 tabular-nums">{v}</span>
          </td>
        ))}
        <td className="px-3 py-2.5 text-center">
          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[12px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 tabular-nums">{row.passed}</span>
        </td>
        <td className="px-3 py-2.5 text-center">
          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[12px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 tabular-nums">{row.failed}</span>
        </td>
        <td className="px-3 py-2.5 text-center">
          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[12px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 tabular-nums">{row.promoted}</span>
        </td>
        <td className="px-3 py-2.5 text-center">
          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[12px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 tabular-nums">{row.detained}</span>
        </td>
        <td className="px-3 py-2.5 text-center">
          <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[12px] font-bold tabular-nums ${pc}`}>
            {row.appeared ? Math.round((row.passed / row.appeared) * 100) : 0}%
          </span>
        </td>
        {[row.distinction, row.firstDiv, row.secondDiv, row.thirdDiv].map((v, i) => (
          <td key={i} className="px-3 py-2.5 text-center">
            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[12px] font-bold bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-300 tabular-nums">{v}</span>
          </td>
        ))}
      </tr>
    )
  }

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      <td className="px-3 py-2.5 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-10">{idx}</td>
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[9px] font-bold"
            style={{ background: bg, color: fg }}>
            {formatAbbr(row.class)}
          </span>
          <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.class}</span>
        </div>
      </td>
      <td className="px-3 py-2.5 text-center">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          {row.section}
        </span>
      </td>
      {cell(row.total)}
      {cell(row.appeared)}
      <td className="px-3 py-2.5 text-center">
        <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[11px] font-semibold tabular-nums
          ${row.absent > 0 ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' : 'text-slate-400'}`}>
          {row.absent}
        </span>
      </td>
      <td className="px-3 py-2.5 text-center">
        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 tabular-nums">
          {row.passed}
        </span>
      </td>
      <td className="px-3 py-2.5 text-center">
        <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[11px] font-semibold tabular-nums
          ${row.failed > 0 ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400' : 'text-slate-400'}`}>
          {row.failed}
        </span>
      </td>
      <td className="px-3 py-2.5 text-center">
        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 tabular-nums">
          {row.promoted}
        </span>
      </td>
      <td className="px-3 py-2.5 text-center">
        <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[11px] font-semibold tabular-nums
          ${row.detained > 0 ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400' : 'text-slate-400'}`}>
          {row.detained}
        </span>
      </td>
      <td className="px-3 py-2.5 text-center">
        <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[11px] font-bold tabular-nums ${pc}`}>
          {row.overallPer}%
        </span>
      </td>
      {[row.distinction, row.firstDiv, row.secondDiv, row.thirdDiv].map((v, i) => (
        <td key={i} className="px-3 py-2.5 text-center text-[12px] text-slate-500 dark:text-slate-400 tabular-nums">{v}</td>
      ))}
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row, idx }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = classColor(row.class)
  const pc = perColor(row.overallPer)
  const passPct = row.appeared ? Math.round((row.passed / row.appeared) * 100) : 0

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        <span className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
          style={{ background: bg, color: fg }}>
          {formatAbbr(row.class)}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight">
            {row.class}
            <span className="ml-2 text-[12px] font-semibold text-slate-400 dark:text-slate-500">Sec {row.section}</span>
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Total: <span className="font-semibold text-slate-600 dark:text-slate-300">{row.total}</span>
            &nbsp;·&nbsp;
            Passed: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{row.passed}</span>
            &nbsp;·&nbsp;
            Failed: <span className={`font-semibold ${row.failed > 0 ? 'text-rose-500 dark:text-rose-400' : 'text-slate-400'}`}>{row.failed}</span>
          </p>
        </div>
        <div className="flex flex-col items-end flex-shrink-0 mr-1">
          <span className={`text-[15px] font-bold tabular-nums px-2 py-0.5 rounded-lg ${pc}`}>{row.overallPer}%</span>
          <span className="text-[10px] text-slate-400 mt-0.5">pass rate</span>
        </div>
        <span className={`w-5 h-5 flex items-center justify-center text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Pass bar */}
      <div className="px-4 pb-3">
        <div className="flex text-[10px] font-semibold justify-between mb-1">
          <span className="text-emerald-600 dark:text-emerald-400">Passed {passPct}%</span>
          <span className="text-rose-500 dark:text-rose-400">Failed {100 - passPct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-rose-200 dark:bg-rose-500/20 overflow-hidden">
          <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${passPct}%` }} />
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4 space-y-3">
          {/* Attendance + Result Row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 p-2.5 text-center">
              <p className="text-[18px] font-bold text-slate-700 dark:text-slate-200 tabular-nums">{row.total}</p>
              <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 mt-0.5">Total</p>
            </div>
            <div className="rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-2.5 text-center">
              <p className="text-[18px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{row.appeared}</p>
              <p className="text-[10px] font-semibold uppercase text-blue-600 dark:text-blue-400 mt-0.5">Appeared</p>
            </div>
            <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 p-2.5 text-center">
              <p className="text-[18px] font-bold text-amber-700 dark:text-amber-300 tabular-nums">{row.absent}</p>
              <p className="text-[10px] font-semibold uppercase text-amber-600 dark:text-amber-400 mt-0.5">Absent</p>
            </div>
          </div>

          {/* Passed / Failed / Promoted / Detained */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">Passed / Promoted</span>
              </div>
              <p className="text-[22px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">{row.passed}</p>
            </div>
            <div className="rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span className="text-[10px] font-bold uppercase text-rose-600 dark:text-rose-400">Failed / Detained</span>
              </div>
              <p className="text-[22px] font-bold text-rose-700 dark:text-rose-300 tabular-nums">{row.failed}</p>
            </div>
          </div>

          {/* Divisions */}
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />Division Breakdown
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { label: 'Dist.', val: row.distinction, color: 'text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-500/10 border-yellow-100 dark:border-yellow-500/20' },
                { label: '1st',   val: row.firstDiv,   color: 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20' },
                { label: '2nd',   val: row.secondDiv,  color: 'text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-500/10 border-violet-100 dark:border-violet-500/20' },
                { label: '3rd',   val: row.thirdDiv,   color: 'text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 border-slate-100 dark:border-slate-600' },
              ].map(({ label, val, color }) => (
                <div key={label} className={`rounded-xl border p-2 text-center ${color}`}>
                  <p className="text-[16px] font-bold tabular-nums">{val}</p>
                  <p className="text-[9px] font-bold uppercase mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MULTI-SELECT SECTIONS ────────────────────────────────────────────────────
function SectionMultiSelect({ sections, selected, onChange, error }) {
  const toggle = (sec) => {
    if (selected.includes(sec)) {
      onChange(selected.filter(s => s !== sec))
    } else {
      onChange([...selected, sec])
    }
  }
  const allSelected = sections.length > 0 && selected.length === sections.length
  const toggleAll = () => onChange(allSelected ? [] : [...sections])

  return (
    <div>
      <div className={`min-h-[38px] flex flex-wrap gap-1.5 p-2 rounded-lg border bg-white dark:bg-[#1e2238] transition-all
        ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}>
        {sections.length === 0 ? (
          <span className="text-[12px] text-slate-400 dark:text-slate-500 self-center px-1">Select a class first</span>
        ) : (
          <>
            <button type="button" onClick={toggleAll}
              className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-all
                ${allSelected
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-200'}`}>
              All
            </button>
            {sections.map(sec => (
              <button key={sec} type="button" onClick={() => toggle(sec)}
                className={`px-2.5 py-0.5 rounded text-[11px] font-bold border transition-all
                  ${selected.includes(sec)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                {sec}
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, filters, setFilter, sections, onShow, loading, errors }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ animation: 'drawerUp .25s ease' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-white dark:bg-[#1a1f35] z-10">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] sticky top-4 bg-white dark:bg-[#1a1f35] z-10">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Report Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <Field label="Session" error={errors.session} required>
            <NativeSelect value={filters.session} onChange={e => setFilter('session', e.target.value)}
              placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Class" error={errors.cls} required>
            <NativeSelect value={filters.cls} onChange={e => { setFilter('cls', e.target.value); setFilter('sections', []) }}
              placeholder="-- Select Class --" error={errors.cls}>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Section" hint="Select one or more sections" error={errors.sections}>
            <SectionMultiSelect
              sections={sections}
              selected={filters.sections}
              onChange={v => setFilter('sections', v)}
              error={errors.sections}
            />
          </Field>
          <Field label="Term" error={errors.term} required>
            <NativeSelect value={filters.term} onChange={e => setFilter('term', e.target.value)}
              placeholder="-- Select Term --" error={errors.term}>
              {TERMS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Order By">
            <NativeSelect value={filters.orderBy} onChange={e => setFilter('orderBy', e.target.value)}>
              {ORDER_BY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
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

// ─── LOADING SKELETON ─────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
      <div className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        ))}
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse"
          style={{ opacity: 1 - i * 0.15 }} />
      ))}
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function UDISEPromotionReport() {
  const [filters, setFilters] = useState({
    session:  '',
    cls:      '',
    sections: [],
    term:     '',
    orderBy:  'class',
  })
  const [rows,        setRows]        = useState([])
  const [loading,     setLoading]     = useState(false)
  const [exporting,   setExporting]   = useState(false)
  const [filterOpen,  setFilterOpen]  = useState(false)
  const [search,      setSearch]      = useState('')
  const [errors,      setErrors]      = useState({})
  const [toast,       setToast]       = useState(null)
  const [shown,       setShown]       = useState(false)
  const [shownMeta,   setShownMeta]   = useState({})

  const setFilter = useCallback((key, val) => {
    setFilters(p => ({ ...p, [key]: val }))
    setErrors(p => ({ ...p, [key]: undefined }))
  }, [])

  const availSections = useMemo(() =>
    filters.cls ? (SECTIONS_BY_CLASS[filters.cls] || []) : [],
    [filters.cls]
  )

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Validate + Fetch ──────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!filters.session) err.session = 'Please select a session'
    if (!filters.cls)     err.cls     = 'Please select a class'
    if (!filters.term)    err.term    = 'Please select a term'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      const secs = filters.sections.length > 0
        ? filters.sections
        : (SECTIONS_BY_CLASS[filters.cls] || [])

      let data = generateData(filters.cls, secs, filters.term)

      // Apply ordering
      if (filters.orderBy === 'overallper desc')
        data = [...data].sort((a, b) => b.overallPer - a.overallPer)
      else if (filters.orderBy === 'overallper asc')
        data = [...data].sort((a, b) => a.overallPer - b.overallPer)

      setRows(data)
      setShownMeta({ session: filters.session, cls: filters.cls, term: filters.term })
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} section record(s) successfully.`)
    }, 700)
  }, [filters])

  const handleReset = () => {
    setFilters({ session: '', cls: '', sections: [], term: '', orderBy: 'class' })
    setRows([]); setSearch(''); setErrors({}); setShown(false); setShownMeta({})
  }

  const handleExcel = () => {
    if (rows.length === 0) { showToast('No data to export. Show report first.', 'error'); return }
    setExporting(true)
    setTimeout(() => { setExporting(false); showToast('Excel export ready! (API integration pending)') }, 1200)
  }

  // ── Search ────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      r.class.toLowerCase().includes(q) ||
      r.section.toLowerCase().includes(q)
    )
  }, [rows, search])

  // ── Totals ────────────────────────────────────────────────────────────────
  const totals = useMemo(() => {
    const sum = (k) => filtered.reduce((s, r) => s + (r[k] || 0), 0)
    return {
      total: sum('total'), appeared: sum('appeared'), absent: sum('absent'),
      passed: sum('passed'), failed: sum('failed'),
      promoted: sum('promoted'), detained: sum('detained'),
      distinction: sum('distinction'), firstDiv: sum('firstDiv'),
      secondDiv: sum('secondDiv'), thirdDiv: sum('thirdDiv'),
      overallPer: 0,
    }
  }, [filtered])

  const hasResults = shown && rows.length > 0
  const activeFiltersCount = [filters.session, filters.cls, filters.term].filter(Boolean).length

  return (
    <div className="space-y-4 pb-10">

      {/* ── Breadcrumbs ──────────────────────────────────────────────────── */}
      <nav className="flex items-center gap-1.5 text-[12px] text-slate-400 dark:text-slate-500 flex-wrap">
        {['Home', 'Reports', 'Exam Report', 'UDISE Report'].map((crumb, i, arr) => (
          <span key={crumb} className="flex items-center gap-1.5">
            <span className={i === arr.length - 1 ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer'}>
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
            <GraduationCap className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            UDISE Promotion Report
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Class-wise promotion, result & division breakdown for UDISE compliance.
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
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Report Filters</span>
          {activeFiltersCount > 0 && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
              {activeFiltersCount} active
            </span>
          )}
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            {/* Session */}
            <Field label="Session" error={errors.session} required>
              <NativeSelect value={filters.session}
                onChange={e => setFilter('session', e.target.value)}
                placeholder="-- Select Session --" error={errors.session}>
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            {/* Class */}
            <Field label="Class" error={errors.cls} required>
              <NativeSelect value={filters.cls}
                onChange={e => { setFilter('cls', e.target.value); setFilter('sections', []) }}
                placeholder="-- Select Class --" error={errors.cls}>
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            {/* Section */}
            <Field label="Section" hint="Tap to toggle sections">
              <SectionMultiSelect
                sections={availSections}
                selected={filters.sections}
                onChange={v => setFilter('sections', v)}
              />
            </Field>

            {/* Term */}
            <Field label="Term" error={errors.term} required>
              <NativeSelect value={filters.term}
                onChange={e => setFilter('term', e.target.value)}
                placeholder="-- Select Term --" error={errors.term}>
                {TERMS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </NativeSelect>
            </Field>

            {/* Order By */}
            <Field label="Order By">
              <NativeSelect value={filters.orderBy}
                onChange={e => setFilter('orderBy', e.target.value)}>
                {ORDER_BY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </NativeSelect>
            </Field>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
            <button type="button" onClick={handleShow} disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-semibold text-white
                bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
                transition-all active:scale-95 disabled:opacity-70">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
              Show Report
            </button>
            <button type="button" onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ─────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            <span>
              {filters.session && filters.cls && filters.term
                ? `${filters.cls} · ${filters.session}`
                : 'Set Filters'}
            </span>
          </div>
          {activeFiltersCount > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </button>
        {hasResults && (
          <>
            <button type="button" onClick={handleExcel} disabled={exporting}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold
                bg-emerald-600 text-white shadow-sm disabled:opacity-70">
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            </button>
            <button type="button" onClick={handleReset}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <RefreshCw className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* ── Mobile Filter Drawer ─────────────────────────────────────────── */}
      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        setFilter={setFilter}
        sections={availSections}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading ──────────────────────────────────────────────────────── */}
      {loading && <LoadingSkeleton />}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* School Header */}
          <SchoolHeader session={shownMeta.session} cls={shownMeta.cls} term={shownMeta.term} />

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <SummaryCard icon={Users}       label="Total Enrolled"  value={totals.total}      color="blue"    />
            <SummaryCard icon={ClipboardList}label="Appeared"        value={totals.appeared}   color="cyan"    />
            <SummaryCard icon={CheckCircle2} label="Passed"          value={totals.passed}     color="emerald" />
            <SummaryCard icon={XCircle}      label="Failed"          value={totals.failed}     color="rose"    />
            <SummaryCard icon={UserCheck}    label="Promoted"        value={totals.promoted}   color="emerald" />
            <SummaryCard icon={Award}        label="Distinction"     value={totals.distinction}color="violet"  />
          </div>

          {/* Results Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Section-wise Result</span>
                <span className="text-[13px] text-slate-400">· {shownMeta.session}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
                  {filtered.length} section{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>
              {/* Search */}
              <div className="relative w-full sm:w-48 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search class or section…"
                  className="w-full pl-8 pr-7 py-1.5 text-[12px] rounded-lg border outline-none transition-all
                    bg-white text-slate-700 border-slate-200 placeholder-slate-300
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                    dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                    dark:placeholder-slate-600"
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
                Promotion = Passed students. Detention = Failed students. Pass % = (Passed / Appeared) × 100.
              </p>
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block overflow-x-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No records match your search.</span>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                      {TABLE_HEADS.map((h, i) => (
                        <th key={i} className="px-3 py-2.5 text-center text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <DesktopRow key={`${row.class}-${row.section}`} row={row} idx={i + 1} />
                    ))}
                    <DesktopRow row={totals} idx={0} isTotal />
                  </tbody>
                </table>
              )}
            </div>

            {/* ── MOBILE CARDS ── */}
            <div className="md:hidden p-4 space-y-3">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No records match your search.</span>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap a card to expand full result breakdown.
                  </p>
                  {filtered.map((row, i) => (
                    <MobileCard key={`${row.class}-${row.section}`} row={row} idx={i + 1} />
                  ))}

                  {/* Mobile Grand Total */}
                  <div className="rounded-xl border-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07] p-4 space-y-3">
                    <p className="text-[12px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Grand Total — {filtered.length} Sections
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Total',    val: totals.total,     cls: 'text-blue-700 dark:text-blue-300' },
                        { label: 'Appeared', val: totals.appeared,  cls: 'text-cyan-700 dark:text-cyan-300' },
                        { label: 'Absent',   val: totals.absent,    cls: 'text-amber-700 dark:text-amber-300' },
                        { label: 'Passed',   val: totals.passed,    cls: 'text-emerald-700 dark:text-emerald-300' },
                        { label: 'Failed',   val: totals.failed,    cls: 'text-rose-700 dark:text-rose-300' },
                        { label: 'Promoted', val: totals.promoted,  cls: 'text-emerald-700 dark:text-emerald-300' },
                      ].map(({ label, val, cls }) => (
                        <div key={label} className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                          <p className={`text-[18px] font-bold tabular-nums ${cls}`}>{val}</p>
                          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 pt-1 border-t border-blue-200 dark:border-indigo-500/20">
                      {[
                        { label: 'Dist.', val: totals.distinction },
                        { label: '1st',   val: totals.firstDiv },
                        { label: '2nd',   val: totals.secondDiv },
                        { label: '3rd',   val: totals.thirdDiv },
                      ].map(({ label, val }) => (
                        <div key={label} className="rounded-lg bg-white/70 dark:bg-white/5 p-2 text-center">
                          <p className="text-[15px] font-bold text-violet-700 dark:text-violet-300 tabular-nums">{val}</p>
                          <p className="text-[9px] font-semibold text-violet-600 dark:text-violet-400">{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{rows.length}</span> sections
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
              Select Session, Class &amp; Term, then click <strong>Show Report</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
