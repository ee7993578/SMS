/**
 * StrengthReport.jsx
 * Folder: src/pages/Student/Reports/StrengthReport.jsx
 *
 * Converts legacy ASPX "Strength Report" to fully-responsive React + Tailwind.
 *
 * Features
 *  • Session + Class + Section cascading filters
 *  • Show button with loading state + validation
 *  • Excel export placeholder
 *  • Desktop: sticky-header data-dense table
 *  • Mobile: summary stat cards + collapsible detail cards
 *  • Grand total footer row
 *  • Search / filter bar in results
 *  • Toast notifications
 *  • Empty + loading states
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye, Download,
  AlertCircle, X, Check, Loader2, ChevronDown,
  Users, UserCheck, GraduationCap, BookOpen,
  SlidersHorizontal, ChevronRight, Info,
  Search, BarChart3, UserPlus, History,
  School, TrendingUp, FileSpreadsheet
} from 'lucide-react'

// ─── STATIC DATA ──────────────────────────────────────────────────────────────
const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CLASS_SECTION_MAP = {
  'Nursery':   ['A', 'B'],
  'LKG':       ['A', 'B'],
  'UKG':       ['A', 'B'],
  'Class I':   ['A', 'B', 'C'],
  'Class II':  ['A', 'B', 'C'],
  'Class III': ['A', 'B'],
  'Class IV':  ['A', 'B'],
  'Class V':   ['A', 'B'],
  'Class VI':  ['A', 'B', 'C'],
  'Class VII': ['A', 'B', 'C'],
  'Class VIII':['A', 'B'],
  'Class IX':  ['A', 'B'],
  'Class X':   ['A', 'B'],
  'Class XI':  ['Science', 'Commerce', 'Arts'],
  'Class XII': ['Science', 'Commerce', 'Arts'],
}

// Dummy strength data generator
const generateStrengthData = (cls, section) => {
  const base = {
    'Nursery':    { total: 28, boys: 15, girls: 13, new: 28, old: 0,  teacher: 'Mrs. Sunita Sharma'   },
    'LKG':        { total: 32, boys: 17, girls: 15, new: 20, old: 12, teacher: 'Mrs. Priya Verma'     },
    'UKG':        { total: 30, boys: 16, girls: 14, new: 14, old: 16, teacher: 'Mrs. Rekha Gupta'     },
    'Class I':    { total: 35, boys: 19, girls: 16, new: 12, old: 23, teacher: 'Mr. Ramesh Tiwari'    },
    'Class II':   { total: 38, boys: 20, girls: 18, new: 8,  old: 30, teacher: 'Mrs. Kavita Mishra'   },
    'Class III':  { total: 36, boys: 18, girls: 18, new: 6,  old: 30, teacher: 'Mr. Anil Dubey'       },
    'Class IV':   { total: 34, boys: 17, girls: 17, new: 5,  old: 29, teacher: 'Mrs. Meena Yadav'     },
    'Class V':    { total: 37, boys: 20, girls: 17, new: 7,  old: 30, teacher: 'Mr. Sunil Joshi'      },
    'Class VI':   { total: 40, boys: 22, girls: 18, new: 10, old: 30, teacher: 'Mrs. Anita Singh'     },
    'Class VII':  { total: 38, boys: 20, girls: 18, new: 8,  old: 30, teacher: 'Mr. Deepak Rastogi'   },
    'Class VIII': { total: 36, boys: 19, girls: 17, new: 5,  old: 31, teacher: 'Mrs. Pooja Agarwal'   },
    'Class IX':   { total: 42, boys: 23, girls: 19, new: 12, old: 30, teacher: 'Mr. Vikas Chauhan'    },
    'Class X':    { total: 44, boys: 24, girls: 20, new: 4,  old: 40, teacher: 'Mrs. Neha Srivastava' },
    'Class XI':   { total: 35, boys: 18, girls: 17, new: 35, old: 0,  teacher: 'Mr. Rohit Pandey'     },
    'Class XII':  { total: 33, boys: 17, girls: 16, new: 0,  old: 33, teacher: 'Mrs. Shweta Kumar'    },
  }
  const d = base[cls] ?? { total: 30, boys: 15, girls: 15, new: 10, old: 20, teacher: 'TBD' }
  // slight variation per section
  const offset = section === 'A' ? 0 : section === 'B' ? -3 : section === 'C' ? -5 : 2
  const t = Math.max(10, d.total + offset)
  const b = Math.round(t * (d.boys / d.total))
  const g = t - b
  const n = Math.min(t, Math.round(d.new + offset / 2))
  const o = t - n
  return {
    section: `${cls} - ${section}`,
    cls, sectionLabel: section,
    no_of_student:     t,
    no_of_boysstudent: b,
    no_of_girlstudent: g,
    new_students:      n,
    old_students:      o,
    ClassTeacher:      d.teacher,
  }
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const GENDER_COLORS = [
  ['#1d4ed8','#dbeafe'], ['#7c3aed','#ede9fe'], ['#0891b2','#cffafe'],
  ['#059669','#d1fae5'], ['#d97706','#fef3c7'],
]
const avatarColor = (name) =>
  GENDER_COLORS[(name?.charCodeAt(0) ?? 0) % GENDER_COLORS.length]

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────

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
      {type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// ─── MINI STAT PILL ───────────────────────────────────────────────────────────
function MiniStat({ label, value, color }) {
  const map = {
    blue:    'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
    violet:  'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400',
    rose:    'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
    emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber:   'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  }
  return (
    <div className={`flex flex-col items-center justify-center rounded-xl px-3 py-2 min-w-[64px] ${map[color]}`}>
      <span className="text-[16px] font-bold tabular-nums leading-tight">{value}</span>
      <span className="text-[10px] font-semibold opacity-75 mt-0.5 whitespace-nowrap">{label}</span>
    </div>
  )
}

// ─── SUMMARY STAT CARD (top) ──────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, sub, color }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    rose:    'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
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

// ─── PROGRESS BAR ─────────────────────────────────────────────────────────────
function GenderBar({ boys, girls, total }) {
  const bp = total ? Math.round((boys / total) * 100) : 50
  return (
    <div className="w-full">
      <div className="flex text-[10px] font-semibold justify-between mb-1 text-slate-500 dark:text-slate-400">
        <span className="text-blue-600 dark:text-blue-400">♂ {boys} ({bp}%)</span>
        <span className="text-rose-500 dark:text-rose-400">♀ {girls} ({100 - bp}%)</span>
      </div>
      <div className="h-2 rounded-full bg-rose-200 dark:bg-rose-500/20 overflow-hidden">
        <div className="h-full rounded-full bg-blue-500" style={{ width: `${bp}%` }} />
      </div>
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, session, setSession, cls, setCls, section, setSection, sections, onShow, loading, errors }) {
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
        <div className="px-5 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          <Field label="Session" error={errors.session} required>
            <NativeSelect value={session} onChange={e => setSession(e.target.value)} placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Class">
            <NativeSelect value={cls} onChange={e => { setCls(e.target.value); setSection('') }} placeholder="-- All Classes --">
              {Object.keys(CLASS_SECTION_MAP).map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Section">
            <NativeSelect value={section} onChange={e => setSection(e.target.value)} placeholder="-- All Sections --" disabled={!cls}>
              {sections.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
        </div>
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={() => { onShow(); onClose() }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-70">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show Report
          </button>
        </div>
      </div>
    </>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx, isTotal }) {
  const [fg, bg] = avatarColor(row.ClassTeacher)
  if (isTotal) {
    return (
      <tr className="bg-blue-50 dark:bg-indigo-500/[0.07] border-t-2 border-blue-200 dark:border-indigo-500/30 font-bold">
        <td className="px-3 py-3 text-center text-[12px] text-blue-700 dark:text-blue-400">—</td>
        <td className="px-3 py-3 text-[13px] text-blue-700 dark:text-blue-300 font-bold">Grand Total</td>
        <td className="px-3 py-3 text-center">
          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[13px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300">{row.no_of_student}</span>
        </td>
        <td className="px-3 py-3 text-center">
          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[13px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300">{row.no_of_boysstudent}</span>
        </td>
        <td className="px-3 py-3 text-center">
          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[13px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300">{row.no_of_girlstudent}</span>
        </td>
        <td className="px-3 py-3 text-center">
          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[13px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">{row.new_students}</span>
        </td>
        <td className="px-3 py-3 text-center">
          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[13px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">{row.old_students}</span>
        </td>
        <td className="px-3 py-3" />
      </tr>
    )
  }
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      <td className="px-3 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums">{idx}</td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-bold flex-shrink-0"
            style={{ background: bg, color: fg }}>
            {row.sectionLabel}
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.section}</span>
        </div>
      </td>
      <td className="px-3 py-3 text-center">
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-[13px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">{row.no_of_student}</span>
      </td>
      <td className="px-3 py-3 text-center">
        <span className="inline-flex items-center justify-center px-2 py-1 rounded-lg text-[12px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">{row.no_of_boysstudent}</span>
      </td>
      <td className="px-3 py-3 text-center">
        <span className="inline-flex items-center justify-center px-2 py-1 rounded-lg text-[12px] font-semibold bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">{row.no_of_girlstudent}</span>
      </td>
      <td className="px-3 py-3 text-center">
        <span className="inline-flex items-center justify-center px-2 py-1 rounded-lg text-[12px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">{row.new_students}</span>
      </td>
      <td className="px-3 py-3 text-center">
        <span className="inline-flex items-center justify-center px-2 py-1 rounded-lg text-[12px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">{row.old_students}</span>
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[8px] font-bold"
            style={{ background: bg, color: fg }}>
            {row.ClassTeacher.split(' ').slice(-1)[0]?.[0]}
          </span>
          <span className="text-[12px] text-slate-600 dark:text-slate-300 truncate max-w-[140px]">{row.ClassTeacher}</span>
        </div>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row, idx }) {
  const [expanded, setExpanded] = useState(false)
  const [fg, bg] = avatarColor(row.section)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden">
      {/* Card header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Index badge */}
        <span className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[11px] font-bold"
          style={{ background: bg, color: fg }}>
          {idx}
        </span>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 truncate">{row.section}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{row.ClassTeacher}</p>
        </div>

        {/* Quick stats */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[13px] font-bold text-blue-700 dark:text-blue-400 tabular-nums">{row.no_of_student}</span>
          <span className="text-[10px] text-slate-400">students</span>
        </div>

        <ChevronRight className={`w-4 h-4 text-slate-400 flex-shrink-0 ml-1 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {/* Quick mini-stats (always visible) */}
      <div className="flex gap-2 px-4 pb-3 overflow-x-hidden">
        <MiniStat label="Boys"    value={row.no_of_boysstudent} color="blue"    />
        <MiniStat label="Girls"   value={row.no_of_girlstudent} color="rose"    />
        <MiniStat label="New"     value={row.new_students}       color="emerald" />
        <MiniStat label="Old"     value={row.old_students}       color="amber"   />
      </div>

      {/* Gender bar (always visible) */}
      <div className="px-4 pb-3">
        <GenderBar boys={row.no_of_boysstudent} girls={row.no_of_girlstudent} total={row.no_of_student} />
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 py-3 space-y-3">
          <div className="rounded-xl bg-slate-50 dark:bg-[#1e2238] border border-slate-100 dark:border-[rgba(99,102,241,0.12)] p-3">
            <div className="flex items-center gap-2 mb-2">
              <School className="w-3.5 h-3.5 text-violet-500" />
              <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Class Teacher</span>
            </div>
            <p className="text-[14px] font-semibold text-slate-800 dark:text-slate-100">{row.ClassTeacher}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-3 flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">New Students</span>
              </div>
              <span className="text-[22px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">{row.new_students}</span>
            </div>
            <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 p-3 flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="text-[10px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">Old Students</span>
              </div>
              <span className="text-[22px] font-bold text-amber-700 dark:text-amber-300 tabular-nums">{row.old_students}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function StrengthReport() {
  // Filter state
  const [session, setSession] = useState('')
  const [cls,     setCls]     = useState('')
  const [section, setSection] = useState('')

  // Data state
  const [rows,    setRows]    = useState([])
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)

  // UI state
  const [filterOpen, setFilterOpen] = useState(false)
  const [search,     setSearch]     = useState('')
  const [errors,     setErrors]     = useState({})
  const [toast,      setToast]      = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Derived sections list based on selected class
  const sections = useMemo(() =>
    cls ? (CLASS_SECTION_MAP[cls] ?? []) : [], [cls])

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!session) err.session = 'Please select a session'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      let result = []

      if (cls && section) {
        // Single class-section
        result = [generateStrengthData(cls, section)]
      } else if (cls) {
        // All sections of a class
        result = (CLASS_SECTION_MAP[cls] ?? []).map(s => generateStrengthData(cls, s))
      } else {
        // All classes, all sections
        Object.entries(CLASS_SECTION_MAP).forEach(([c, secs]) => {
          secs.forEach(s => result.push(generateStrengthData(c, s)))
        })
      }

      setRows(result)
      setLoading(false)
      showToast(`Loaded ${result.length} record${result.length !== 1 ? 's' : ''} successfully.`)
    }, 700)
  }, [session, cls, section])

  const handleReset = () => {
    setSession(''); setCls(''); setSection('')
    setRows([]); setSearch(''); setErrors({})
  }

  // ── Excel Export ───────────────────────────────────────────────────────────
  const handleExcel = () => {
    if (rows.length === 0) { showToast('No data to export. Show report first.', 'error'); return }
    setExporting(true)
    // TODO: Replace with actual Excel export (SheetJS / API call)
    setTimeout(() => {
      setExporting(false)
      showToast('Excel export ready! (API integration pending)')
    }, 1200)
  }

  // ── Filtered view ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      r.section.toLowerCase().includes(q) ||
      r.ClassTeacher.toLowerCase().includes(q)
    )
  }, [rows, search])

  // ── Grand totals ───────────────────────────────────────────────────────────
  const totals = useMemo(() => ({
    no_of_student:     filtered.reduce((s, r) => s + r.no_of_student, 0),
    no_of_boysstudent: filtered.reduce((s, r) => s + r.no_of_boysstudent, 0),
    no_of_girlstudent: filtered.reduce((s, r) => s + r.no_of_girlstudent, 0),
    new_students:      filtered.reduce((s, r) => s + r.new_students, 0),
    old_students:      filtered.reduce((s, r) => s + r.old_students, 0),
  }), [filtered])

  const hasResults = rows.length > 0
  const activeFilters = [session, cls, section].filter(Boolean).length

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Strength Report
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            View class-wise student strength — total, boys, girls, new &amp; old admissions.
          </p>
        </div>
        {hasResults && (
          <button
            type="button"
            onClick={handleExcel}
            disabled={exporting}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all active:scale-95
              bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20 disabled:opacity-70 flex-shrink-0"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            Export Excel
          </button>
        )}
      </div>

      {/* ── DESKTOP Filter Card ─────────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-end">
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

            <Field label="Class">
              <NativeSelect
                value={cls}
                onChange={e => { setCls(e.target.value); setSection('') }}
                placeholder="-- All Classes --"
              >
                {Object.keys(CLASS_SECTION_MAP).map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Section">
              <NativeSelect
                value={section}
                onChange={e => setSection(e.target.value)}
                placeholder="-- All Sections --"
                disabled={!cls}
              >
                {sections.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            <div /> {/* spacer on xl */}

            <div className="flex gap-2">
              <button type="button" onClick={handleShow} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold text-white
                  bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
                  transition-all active:scale-95 disabled:opacity-70">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                Show
              </button>
              <button type="button" onClick={handleReset}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-semibold
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ────────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white hover:bg-blue-700 dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" /> Filters
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
            className="px-3.5 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Mobile Filter Drawer */}
      <FilterDrawer
        open={filterOpen} onClose={() => setFilterOpen(false)}
        session={session} setSession={setSession}
        cls={cls} setCls={setCls}
        section={section} setSection={setSection}
        sections={sections}
        onShow={handleShow} loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ─────────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* Summary stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <SummaryCard icon={Users}      label="Total Students" value={totals.no_of_student}     color="blue"    />
            <SummaryCard icon={UserCheck}  label="Total Boys"     value={totals.no_of_boysstudent}  color="violet"  />
            <SummaryCard icon={GraduationCap} label="Total Girls" value={totals.no_of_girlstudent}  color="rose"    />
            <SummaryCard icon={UserPlus}   label="New Students"   value={totals.new_students}        color="emerald" />
            <SummaryCard icon={History}    label="Old Students"   value={totals.old_students}        color="amber"   sub={`across ${filtered.length} sections`} />
          </div>

          {/* Results table card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Class Strength</span>
                {cls     && <span className="text-[13px] text-slate-400 dark:text-slate-500">· {cls}{section ? ` - ${section}` : ''}</span>}
                {session && <span className="text-[13px] text-slate-400 dark:text-slate-500">· {session}</span>}
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                  {filtered.length} sections
                </span>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-52 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search class / teacher…"
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

            {/* Info hint */}
            <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <p className="text-[12px] text-blue-700 dark:text-blue-400">
                Grand total row is shown at the bottom. Use filters above to narrow down by class or section.
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
                      {['S.No.', 'Class / Section', 'Total Students', 'Total Boys', 'Total Girls', 'New Students', 'Old Students', 'Class Teacher'].map((h, i) => (
                        <th key={i} className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:text-center">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <DesktopRow key={`${row.section}-${i}`} row={row} idx={i + 1} />
                    ))}
                    {/* Grand Total Row */}
                    <DesktopRow row={totals} idx={0} isTotal />
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
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap a card to see class teacher &amp; breakdown details.
                  </p>
                  {filtered.map((row, i) => (
                    <MobileCard key={`${row.section}-${i}`} row={row} idx={i + 1} />
                  ))}

                  {/* Mobile Grand Total */}
                  <div className="rounded-xl border-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07] p-4">
                    <p className="text-[12px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Grand Total
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-white/60 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[20px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{totals.no_of_student}</p>
                        <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">Total Students</p>
                      </div>
                      <div className="rounded-lg bg-white/60 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[20px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{totals.no_of_boysstudent} / {totals.no_of_girlstudent}</p>
                        <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">Boys / Girls</p>
                      </div>
                      <div className="rounded-lg bg-white/60 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[20px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">{totals.new_students}</p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">New Students</p>
                      </div>
                      <div className="rounded-lg bg-white/60 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[20px] font-bold text-amber-700 dark:text-amber-300 tabular-nums">{totals.old_students}</p>
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">Old Students</p>
                      </div>
                    </div>
                    {/* Grand gender bar */}
                    <div className="mt-3">
                      <GenderBar boys={totals.no_of_boysstudent} girls={totals.no_of_girlstudent} total={totals.no_of_student} />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
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

      {/* ── Empty State ──────────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <BarChart3 className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a session and click <strong>Show</strong> to generate the strength report.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
