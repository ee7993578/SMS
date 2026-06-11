/**
 * Report_ExamResultDiscussion.jsx
 * Folder: src/pages/Reports/Exam/Report_ExamResultDiscussion.jsx
 *
 * Converts legacy ASPX "Exam Result Discussion Report" to fully-responsive React + Tailwind.
 *
 * Filter flow: Session → Class → Term → Exam → Subject (multi-select)
 * Actions: Show Report (async) + Export Excel (full postback)
 * Desktop: ERP-style dense table report viewer
 * Mobile: stacked card layout, drawer filters, no horizontal scroll
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  ChevronDown, AlertCircle, X, Check, Loader2,
  SlidersHorizontal, Eye, FileSpreadsheet, RefreshCw,
  BookOpen, BarChart3, Search, Info, TrendingUp,
  GraduationCap, ClipboardList, Filter, ChevronRight,
  Award, Users, Percent, ArrowUpRight, Building2, MapPin,
  CheckSquare, Square, ChevronUp
} from 'lucide-react'

// ─── STATIC DATA ──────────────────────────────────────────────────────────────

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CLASSES_BY_SESSION = {
  '2022-23': ['Nursery', 'LKG', 'UKG', 'Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'],
  '2023-24': ['Nursery', 'LKG', 'UKG', 'Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'],
  '2024-25': ['Nursery', 'LKG', 'UKG', 'Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'],
  '2025-26': ['Nursery', 'LKG', 'UKG', 'Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'],
}

const TERMS = ['Term 1', 'Term 2', 'Annual']

const EXAMS_BY_TERM = {
  'Term 1':  ['Unit Test 1', 'Half Yearly'],
  'Term 2':  ['Unit Test 2', 'Pre-Board'],
  'Annual':  ['Annual Exam', 'Compartment'],
}

const SUBJECTS_BY_CLASS = {
  'Nursery':    ['GK', 'Drawing', 'Rhymes'],
  'LKG':        ['English', 'Hindi', 'Maths', 'GK'],
  'UKG':        ['English', 'Hindi', 'Maths', 'EVS', 'GK'],
  'Class I':    ['English', 'Hindi', 'Maths', 'EVS'],
  'Class II':   ['English', 'Hindi', 'Maths', 'EVS'],
  'Class III':  ['English', 'Hindi', 'Maths', 'EVS', 'Sanskrit'],
  'Class IV':   ['English', 'Hindi', 'Maths', 'Science', 'Social Science', 'Sanskrit'],
  'Class V':    ['English', 'Hindi', 'Maths', 'Science', 'Social Science', 'Sanskrit'],
  'Class VI':   ['English', 'Hindi', 'Maths', 'Science', 'Social Science', 'Sanskrit'],
  'Class VII':  ['English', 'Hindi', 'Maths', 'Science', 'Social Science', 'Sanskrit'],
  'Class VIII': ['English', 'Hindi', 'Maths', 'Science', 'Social Science', 'Sanskrit'],
  'Class IX':   ['English', 'Hindi', 'Maths', 'Science', 'Social Science', 'Sanskrit'],
  'Class X':    ['English', 'Hindi', 'Maths', 'Science', 'Social Science', 'Sanskrit'],
  'Class XI':   ['English', 'Physics', 'Chemistry', 'Maths', 'Biology', 'Computer Science', 'Accountancy', 'Economics', 'Business Studies'],
  'Class XII':  ['English', 'Physics', 'Chemistry', 'Maths', 'Biology', 'Computer Science', 'Accountancy', 'Economics', 'Business Studies'],
}

// Dummy report data generator
const generateReportData = (cls, term, exam, subjects) => {
  const names = [
    'Aarav Sharma', 'Priya Singh', 'Rohit Kumar', 'Ananya Gupta', 'Karan Mehta',
    'Sneha Patel', 'Arjun Verma', 'Pooja Yadav', 'Vikram Joshi', 'Neha Agarwal',
    'Amit Rawat', 'Kavya Negi', 'Rahul Bisht', 'Divya Chauhan', 'Suraj Thakur',
    'Riya Bhandari', 'Mohit Pandey', 'Simran Kapoor', 'Deepak Tiwari', 'Anjali Mishra',
  ]
  const sections = cls === 'Class VI' || cls === 'Class IX' || cls === 'Class XI' || cls === 'Class XII'
    ? ['A', 'B'] : ['A']

  return names.slice(0, 15).map((name, i) => {
    const section = sections[i % sections.length]
    const subjectMarks = {}
    subjects.forEach(sub => {
      subjectMarks[sub] = Math.floor(Math.random() * 40) + 55
    })
    const total = Object.values(subjectMarks).reduce((s, v) => s + v, 0)
    const max = subjects.length * 100
    const pct = max ? Math.round((total / max) * 100) : 0
    const grade = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : 'F'
    return { sno: i + 1, name, rollNo: `${cls.replace('Class ', '')}-${section}-${String(i + 1).padStart(3, '0')}`, section, subjectMarks, total, max, pct, grade }
  })
}

// ─── GRADE COLOR HELPER ───────────────────────────────────────────────────────
const gradeColor = (g) => ({
  'A+': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300',
  'A':  'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300',
  'B+': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-300',
  'B':  'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
  'C':  'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300',
  'F':  'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300',
}[g] || 'bg-slate-100 text-slate-700')

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
      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
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

// ─── MULTI-SELECT SUBJECT PICKER ──────────────────────────────────────────────
function SubjectMultiSelect({ subjects, selected, onChange, error, disabled }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const toggle = (sub) => {
    onChange(selected.includes(sub) ? selected.filter(s => s !== sub) : [...selected, sub])
  }
  const selectAll = () => onChange([...subjects])
  const clearAll  = () => onChange([])

  // Close on outside click
  const handleBlur = (e) => {
    if (ref.current && !ref.current.contains(e.relatedTarget)) setOpen(false)
  }

  const label = selected.length === 0
    ? '-- Select Subjects --'
    : selected.length === subjects.length
      ? 'All Subjects Selected'
      : selected.length === 1
        ? selected[0]
        : `${selected.length} subjects selected`

  return (
    <div ref={ref} className="relative" onBlur={handleBlur} tabIndex={-1}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(p => !p)}
        className={`w-full flex items-center justify-between pl-3 pr-2.5 py-2 text-[13px] rounded-lg border outline-none transition-all
          bg-white text-left
          dark:bg-[#1e2238]
          disabled:opacity-40 disabled:cursor-not-allowed
          ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}
          ${open ? 'border-blue-400 ring-2 ring-blue-100 dark:border-indigo-400 dark:ring-indigo-500/20' : ''}
          ${selected.length > 0 ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'}`}
      >
        <span className="truncate">{label}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 flex-shrink-0 ml-2 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {selected.length > 0 && !open && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {selected.slice(0, 3).map(s => (
            <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-100 text-blue-700 dark:bg-indigo-500/20 dark:text-indigo-300">
              {s}
              <button type="button" onClick={() => toggle(s)} className="hover:text-rose-500"><X className="w-2.5 h-2.5" /></button>
            </span>
          ))}
          {selected.length > 3 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-500 dark:bg-slate-800">
              +{selected.length - 3} more
            </span>
          )}
        </div>
      )}

      {open && (
        <div className="absolute z-30 top-full mt-1 left-0 right-0 rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.25)] bg-white dark:bg-[#1e2238] shadow-xl overflow-hidden">
          {/* Actions */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50 dark:bg-white/[0.02]">
            <button type="button" onClick={selectAll} className="text-[11px] font-bold text-blue-600 dark:text-indigo-400 hover:underline">Select All</button>
            <span className="text-[11px] text-slate-400">{selected.length}/{subjects.length}</span>
            <button type="button" onClick={clearAll} className="text-[11px] font-bold text-rose-500 hover:underline">Clear</button>
          </div>
          {/* Options */}
          <div className="max-h-48 overflow-y-auto py-1">
            {subjects.map(sub => {
              const checked = selected.includes(sub)
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => toggle(sub)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-left hover:bg-blue-50 dark:hover:bg-indigo-500/10 transition-colors
                    ${checked ? 'text-blue-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}
                >
                  {checked
                    ? <CheckSquare className="w-4 h-4 text-blue-600 dark:text-indigo-400 flex-shrink-0" />
                    : <Square className="w-4 h-4 text-slate-300 dark:text-slate-600 flex-shrink-0" />}
                  {sub}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {error && (
        <p className="flex items-center gap-1 text-[11px] text-rose-500 mt-0.5">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
        </p>
      )}
    </div>
  )
}

// ─── SCHOOL HEADER BANNER ─────────────────────────────────────────────────────
function SchoolHeader({ meta }) {
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
        {[
          { label: 'Session', value: meta.session },
          { label: 'Class',   value: meta.cls },
          { label: 'Term',    value: meta.term },
          { label: 'Exam',    value: meta.exam },
        ].map(({ label, value }) => (
          <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-white/10 border border-blue-100 dark:border-indigo-500/20 text-[12px] font-semibold text-slate-700 dark:text-slate-300 shadow-sm">
            <span className="text-blue-500 dark:text-indigo-400 font-bold">{label}:</span> {value}
          </span>
        ))}
      </div>
      <p className="mt-3 text-[13px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400">
        Result Discussion Report
      </p>
    </div>
  )
}

// ─── SUMMARY STAT CARD ────────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, sub, color }) {
  const palette = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
    rose:    'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${palette[color]}`}>
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

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, subjects }) {
  const passColor = row.pct >= 33 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      <td className="px-3 py-2.5 text-center text-[12px] text-slate-400 tabular-nums w-10">{row.sno}</td>
      <td className="px-3 py-2.5">
        <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap">{row.name}</p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500">{row.rollNo}</p>
      </td>
      <td className="px-3 py-2.5 text-center">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-[12px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{row.section}</span>
      </td>
      {subjects.map(sub => (
        <td key={sub} className="px-3 py-2.5 text-center text-[13px] tabular-nums text-slate-700 dark:text-slate-300">
          {row.subjectMarks[sub] ?? '—'}
        </td>
      ))}
      <td className="px-3 py-2.5 text-center">
        <span className="text-[13px] font-bold tabular-nums text-slate-800 dark:text-slate-100">{row.total}</span>
        <span className="text-[11px] text-slate-400 dark:text-slate-500">/{row.max}</span>
      </td>
      <td className="px-3 py-2.5 text-center">
        <span className={`text-[13px] font-bold tabular-nums ${passColor}`}>{row.pct}%</span>
      </td>
      <td className="px-3 py-2.5 text-center">
        <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[12px] font-bold ${gradeColor(row.grade)}`}>
          {row.grade}
        </span>
      </td>
    </tr>
  )
}

// ─── MOBILE STUDENT CARD ──────────────────────────────────────────────────────
function MobileStudentCard({ row, subjects }) {
  const [expanded, setExpanded] = useState(false)
  const passColor = row.pct >= 33 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header row */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Avatar */}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex-shrink-0 flex items-center justify-center text-white text-[12px] font-bold">
          {row.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{row.name}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">{row.rollNo} · Sec {row.section}</p>
        </div>

        {/* Grade + pct */}
        <div className="flex flex-col items-end flex-shrink-0 gap-1">
          <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-lg text-[12px] font-bold ${gradeColor(row.grade)}`}>
            {row.grade}
          </span>
          <span className={`text-[13px] font-bold tabular-nums ${passColor}`}>{row.pct}%</span>
        </div>

        <ChevronRight className={`w-4 h-4 text-slate-400 flex-shrink-0 ml-1 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {/* Progress bar */}
      <div className="px-4 pb-3">
        <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${row.pct >= 60 ? 'bg-emerald-500' : row.pct >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
            style={{ width: `${row.pct}%` }}
          />
        </div>
      </div>

      {/* Expanded subject marks */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">Subject-wise Marks</p>
          <div className="grid grid-cols-2 gap-2">
            {subjects.map(sub => (
              <div key={sub} className="rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-3 py-2">
                <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide truncate">{sub}</p>
                <p className="text-[18px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{row.subjectMarks[sub] ?? '—'}</p>
                <p className="text-[10px] text-slate-400">/100</p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 px-4 py-2.5">
            <span className="text-[12px] font-semibold text-blue-700 dark:text-blue-400">Total</span>
            <span className="text-[16px] font-bold text-blue-800 dark:text-blue-300 tabular-nums">{row.total}<span className="text-[12px] font-semibold opacity-60">/{row.max}</span></span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, filters, setFilters, availableData, errors, onShow, loading }) {
  const { session, cls, term, exam, subjects } = filters

  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl max-h-[92vh] overflow-y-auto"
        style={{ animation: 'drawerUp .25s ease' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div className="sticky top-0 bg-white dark:bg-[#1a1f35] z-10">
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
              <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Filter Report</span>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="px-5 py-5 space-y-4">
          <Field label="Session" error={errors.session} required>
            <NativeSelect value={session} onChange={e => setFilters(p => ({ ...p, session: e.target.value, cls: '', term: '', exam: '', subjects: [] }))} placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Class" error={errors.cls} required>
            <NativeSelect value={cls} onChange={e => setFilters(p => ({ ...p, cls: e.target.value, subjects: [] }))} placeholder="-- Select Class --" disabled={!session} error={errors.cls}>
              {(availableData.classes || []).map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Term" error={errors.term} required>
            <NativeSelect value={term} onChange={e => setFilters(p => ({ ...p, term: e.target.value, exam: '' }))} placeholder="-- Select Term --" disabled={!cls} error={errors.term}>
              {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Exam" error={errors.exam} required>
            <NativeSelect value={exam} onChange={e => setFilters(p => ({ ...p, exam: e.target.value }))} placeholder="-- Select Exam --" disabled={!term} error={errors.exam}>
              {(availableData.exams || []).map(e => <option key={e} value={e}>{e}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Subjects" error={errors.subjects}>
            <SubjectMultiSelect
              subjects={availableData.subjects || []}
              selected={subjects}
              onChange={val => setFilters(p => ({ ...p, subjects: val }))}
              error={errors.subjects}
              disabled={!cls}
            />
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
export default function ReportExamResultDiscussion() {
  const [filters, setFilters] = useState({ session: '', cls: '', term: '', exam: '', subjects: [] })
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [reportData, setReportData] = useState([])
  const [reportMeta, setReportMeta] = useState(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Derived available options (cascade) ───────────────────────────────────
  const availableData = useMemo(() => ({
    classes:  filters.session ? (CLASSES_BY_SESSION[filters.session] || []) : [],
    exams:    filters.term    ? (EXAMS_BY_TERM[filters.term] || [])        : [],
    subjects: filters.cls     ? (SUBJECTS_BY_CLASS[filters.cls] || [])    : [],
  }), [filters.session, filters.cls, filters.term])

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const err = {}
    if (!filters.session)          err.session  = 'Select a session'
    if (!filters.cls)              err.cls      = 'Select a class'
    if (!filters.term)             err.term     = 'Select a term'
    if (!filters.exam)             err.exam     = 'Select an exam'
    return err
  }

  // ── Show Report ───────────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = validate()
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    const subjectsToUse = filters.subjects.length > 0
      ? filters.subjects
      : availableData.subjects.slice(0, 5)  // default: first 5

    setTimeout(() => {
      const data = generateReportData(filters.cls, filters.term, filters.exam, subjectsToUse)
      setReportData(data)
      setReportMeta({ ...filters, subjects: subjectsToUse })
      setLoading(false)
      showToast(`Report generated — ${data.length} students found.`)
    }, 700)
  }, [filters, availableData.subjects])

  // ── Export ────────────────────────────────────────────────────────────────
  const handleExport = () => {
    if (!reportData.length) { showToast('Generate report first.', 'error'); return }
    setExporting(true)
    setTimeout(() => {
      setExporting(false)
      showToast('Excel export ready! (API integration pending)')
    }, 1200)
  }

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setFilters({ session: '', cls: '', term: '', exam: '', subjects: [] })
    setErrors({})
    setReportData([])
    setReportMeta(null)
    setSearch('')
  }

  // ── Search filter on report rows ──────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return reportData
    const q = search.toLowerCase()
    return reportData.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.rollNo.toLowerCase().includes(q) ||
      r.section.toLowerCase().includes(q) ||
      r.grade.toLowerCase().includes(q)
    )
  }, [reportData, search])

  // ── Summary stats ─────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    if (!filtered.length) return {}
    const pass   = filtered.filter(r => r.pct >= 33).length
    const avgPct = Math.round(filtered.reduce((s, r) => s + r.pct, 0) / filtered.length)
    const highest = Math.max(...filtered.map(r => r.pct))
    return { total: filtered.length, pass, fail: filtered.length - pass, avgPct, highest }
  }, [filtered])

  const hasReport     = !!reportMeta && reportData.length > 0
  const activeFilters = [filters.session, filters.cls, filters.term, filters.exam].filter(Boolean).length

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Result Discussion Report
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Exam-wise student performance — class, term, subject breakdown.
          </p>
        </div>
        {hasReport && (
          <button
            type="button"
            onClick={handleExport}
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

      {/* ── BREADCRUMB ────────────────────────────────────────────────────── */}
      <nav className="flex items-center gap-1.5 text-[12px] text-slate-400 dark:text-slate-500 flex-wrap">
        {['Home', 'Reports', 'Exam Report', 'Result Discussion'].map((crumb, i, arr) => (
          <span key={crumb} className="flex items-center gap-1.5">
            <span className={i === arr.length - 1 ? 'text-blue-600 dark:text-indigo-400 font-semibold' : 'hover:text-slate-600 cursor-pointer transition-colors'}>
              {crumb}
            </span>
            {i < arr.length - 1 && <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />}
          </span>
        ))}
      </nav>

      {/* ── DESKTOP FILTER CARD ───────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
          {activeFilters > 0 && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400">
              {activeFilters} active
            </span>
          )}
        </div>

        <div className="p-5">
          {/* Row 1: Session, Class, Term, Exam */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <Field label="Session" error={errors.session} required>
              <NativeSelect
                value={filters.session}
                onChange={e => {
                  setFilters(p => ({ ...p, session: e.target.value, cls: '', term: '', exam: '', subjects: [] }))
                  setErrors(p => ({ ...p, session: undefined }))
                }}
                placeholder="-- Select Session --"
                error={errors.session}
              >
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Class" error={errors.cls} required>
              <NativeSelect
                value={filters.cls}
                onChange={e => {
                  setFilters(p => ({ ...p, cls: e.target.value, subjects: [] }))
                  setErrors(p => ({ ...p, cls: undefined }))
                }}
                placeholder="-- Select Class --"
                disabled={!filters.session}
                error={errors.cls}
              >
                {availableData.classes.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Term" error={errors.term} required>
              <NativeSelect
                value={filters.term}
                onChange={e => {
                  setFilters(p => ({ ...p, term: e.target.value, exam: '' }))
                  setErrors(p => ({ ...p, term: undefined }))
                }}
                placeholder="-- Select Term --"
                disabled={!filters.cls}
                error={errors.term}
              >
                {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Exam" error={errors.exam} required>
              <NativeSelect
                value={filters.exam}
                onChange={e => {
                  setFilters(p => ({ ...p, exam: e.target.value }))
                  setErrors(p => ({ ...p, exam: undefined }))
                }}
                placeholder="-- Select Exam --"
                disabled={!filters.term}
                error={errors.exam}
              >
                {availableData.exams.map(e => <option key={e} value={e}>{e}</option>)}
              </NativeSelect>
            </Field>
          </div>

          {/* Row 2: Subject multi-select + action buttons */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="lg:col-span-3">
              <Field label="Subjects (optional — leave blank to include all)">
                <SubjectMultiSelect
                  subjects={availableData.subjects}
                  selected={filters.subjects}
                  onChange={val => setFilters(p => ({ ...p, subjects: val }))}
                  disabled={!filters.cls}
                  error={errors.subjects}
                />
              </Field>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleShow}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold text-white
                  bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20
                  dark:bg-indigo-600 dark:hover:bg-indigo-700
                  transition-all active:scale-95 disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                Show
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center justify-center px-3 py-2 rounded-xl text-[13px] font-semibold
                  bg-slate-100 text-slate-700 hover:bg-slate-200
                  dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ─────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {activeFilters > 0 ? `${activeFilters} Filter${activeFilters > 1 ? 's' : ''} Active` : 'Set Filters'}
          {activeFilters > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilters}</span>
          )}
        </button>
        {hasReport && (
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm disabled:opacity-70"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
          </button>
        )}
        {hasReport && (
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Mobile filter pills (summary) */}
      {activeFilters > 0 && (
        <div className="flex sm:hidden flex-wrap gap-1.5">
          {[filters.session, filters.cls, filters.term, filters.exam].filter(Boolean).map(val => (
            <span key={val} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 dark:bg-indigo-500/15 text-blue-700 dark:text-indigo-300 text-[11px] font-semibold border border-blue-200 dark:border-indigo-500/20">
              {val}
            </span>
          ))}
        </div>
      )}

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
        availableData={availableData}
        errors={errors}
        onShow={handleShow}
        loading={loading}
      />

      {/* ── Loading Skeleton ──────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
          </div>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      )}

      {/* ── REPORT RESULTS ───────────────────────────────────────────────── */}
      {hasReport && !loading && (
        <>
          {/* School header */}
          <SchoolHeader meta={reportMeta} />

          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={Users}      label="Total Students"  value={stats.total}    color="blue"    />
            <SummaryCard icon={Check}      label="Passed"          value={stats.pass}     color="emerald" />
            <SummaryCard icon={Percent}    label="Class Average"   value={`${stats.avgPct}%`} color="amber" />
            <SummaryCard icon={Award}      label="Highest Score"   value={`${stats.highest}%`} color="violet" />
          </div>

          {/* Report card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Student Results</span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">· {reportMeta.cls} · {reportMeta.exam}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                  {filtered.length} students
                </span>
              </div>
              {/* Search */}
              <div className="relative w-full sm:w-56 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search name, roll no…"
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
                Subjects shown: {reportMeta.subjects.join(', ')}. Pass mark: 33%.
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
                      {['S.No.', 'Student', 'Sec', ...reportMeta.subjects, 'Total', '%', 'Grade'].map((h, i) => (
                        <th key={i} className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-10">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(row => (
                      <DesktopRow key={row.rollNo} row={row} subjects={reportMeta.subjects} />
                    ))}
                    {/* Summary row */}
                    <tr className="bg-blue-50 dark:bg-indigo-500/[0.07] border-t-2 border-blue-200 dark:border-indigo-500/30">
                      <td className="px-3 py-3 text-center text-[12px] text-blue-500">—</td>
                      <td className="px-3 py-3" colSpan={2}>
                        <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" /> Class Average
                        </span>
                      </td>
                      {reportMeta.subjects.map(sub => {
                        const avg = Math.round(filtered.reduce((s, r) => s + (r.subjectMarks[sub] || 0), 0) / filtered.length)
                        return (
                          <td key={sub} className="px-3 py-3 text-center">
                            <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{avg}</span>
                          </td>
                        )
                      })}
                      <td className="px-3 py-3 text-center">
                        <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300">{Math.round(filtered.reduce((s, r) => s + r.total, 0) / filtered.length)}</span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300">{stats.avgPct}%</span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="text-[12px] font-bold text-blue-700 dark:text-blue-300">—</span>
                      </td>
                    </tr>
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
                  {/* Subjects info pill */}
                  <div className="flex flex-wrap gap-1 pb-1">
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <Info className="w-3 h-3" /> Subjects:
                    </span>
                    {reportMeta.subjects.map(sub => (
                      <span key={sub} className="text-[11px] px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-semibold border border-blue-100 dark:border-blue-500/20">
                        {sub}
                      </span>
                    ))}
                  </div>

                  {filtered.map(row => (
                    <MobileStudentCard key={row.rollNo} row={row} subjects={reportMeta.subjects} />
                  ))}

                  {/* Mobile class summary */}
                  <div className="rounded-xl border-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07] p-4">
                    <p className="text-[12px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Class Summary
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'Total', value: stats.total, color: 'text-slate-800 dark:text-slate-100' },
                        { label: 'Passed', value: stats.pass, color: 'text-emerald-700 dark:text-emerald-300' },
                        { label: 'Failed', value: stats.fail, color: 'text-rose-600 dark:text-rose-400' },
                        { label: 'Avg %', value: `${stats.avgPct}%`, color: 'text-blue-700 dark:text-blue-300' },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                          <p className={`text-[22px] font-bold tabular-nums leading-tight ${color}`}>{value}</p>
                          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{label}</p>
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
                <span className="font-semibold text-slate-700 dark:text-slate-300">{reportData.length}</span> students
              </p>
              <div className="flex items-center gap-2">
                {search && (
                  <button onClick={() => setSearch('')} className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                    <X className="w-3 h-3" /> Clear search
                  </button>
                )}
                <span className="text-[12px] text-slate-400 dark:text-slate-500 hidden sm:block">
                  Pass: <span className="font-bold text-emerald-600">{stats.pass}</span> · Fail: <span className="font-bold text-rose-500">{stats.fail}</span>
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── EMPTY STATE ───────────────────────────────────────────────────── */}
      {!hasReport && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <GraduationCap className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select session, class, term &amp; exam — then click <strong>Show</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
