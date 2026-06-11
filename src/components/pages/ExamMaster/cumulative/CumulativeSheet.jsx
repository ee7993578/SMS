/**
 * CumulativeSheet.jsx
 * Folder: src/pages/Reports/Exam/CumulativeSheet.jsx
 *
 * Converts legacy ASPX "Cumulative Sheet" exam report page to
 * fully-responsive React + Tailwind.
 *
 * Features:
 *  - Session & Class dropdowns with validation
 *  - Dynamic class load on session change (simulated API)
 *  - Term selector (hidden by default, matching ASPX behavior)
 *  - Submit → generates per-student cumulative marks table
 *  - Columns: Roll No, Student Name, then one col per subject (with max marks),
 *    Total, Percentage, Grade, Rank
 *  - Grand summary footer row
 *  - Desktop: sticky-header dense ERP table
 *  - Mobile: smart card layout with expandable subject breakdown
 *  - Excel export placeholder
 *  - Loading spinner, toast notifications, empty states
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  ChevronDown, AlertCircle, X, Check, Loader2,
  Filter, RefreshCw, Eye, FileSpreadsheet, Search,
  BookOpen, BarChart3, SlidersHorizontal, Info,
  ChevronRight, Users, TrendingUp, Award,
  GraduationCap, Building2, MapPin, Star, ClipboardList
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CLASSES_BY_SESSION = {
  '2022-23': ['Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'],
  '2023-24': ['Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'],
  '2024-25': ['Nursery', 'LKG', 'UKG', 'Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'],
  '2025-26': ['Nursery', 'LKG', 'UKG', 'Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'],
}

// Subjects by class group
const SUBJECTS_MAP = {
  primary: ['Hindi', 'English', 'Mathematics', 'EVS', 'Drawing'],
  middle:  ['Hindi', 'English', 'Mathematics', 'Science', 'Social Science', 'Sanskrit'],
  high:    ['Hindi', 'English', 'Mathematics', 'Science', 'Social Science', 'Sanskrit'],
  senior:  ['Hindi', 'English', 'Physics', 'Chemistry', 'Mathematics'],
}

const getSubjects = (cls) => {
  if (!cls) return []
  if (['Nursery', 'LKG', 'UKG', 'Class I', 'Class II', 'Class III', 'Class IV', 'Class V'].includes(cls)) return SUBJECTS_MAP.primary
  if (['Class VI', 'Class VII', 'Class VIII'].includes(cls)) return SUBJECTS_MAP.middle
  if (['Class IX', 'Class X'].includes(cls)) return SUBJECTS_MAP.high
  return SUBJECTS_MAP.senior
}

const MAX_MARKS = 100

// Random marks generator (deterministic by name+subject)
const seed = (str) => str.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
const pseudoRand = (n, lo, hi) => lo + (n % (hi - lo + 1))

const STUDENT_NAMES = [
  'Aarav Sharma', 'Priya Singh', 'Rohan Gupta', 'Ananya Mishra', 'Vikram Patel',
  'Sneha Joshi', 'Arjun Verma', 'Kavya Rao', 'Rahul Tiwari', 'Pooja Chauhan',
  'Dev Agarwal', 'Riya Dubey', 'Aditya Kumar', 'Simran Kaur', 'Yash Saxena',
  'Nisha Pandey', 'Karan Srivastava', 'Meghna Trivedi', 'Siddharth Bose', 'Tanya Ahuja',
  'Manav Shukla', 'Divya Nair', 'Harsh Khanna', 'Pallavi Jain', 'Nikhil Malhotra',
  'Shreya Bajaj', 'Kunal Desai', 'Ankita Reddy', 'Rishabh Mehta', 'Swati Pillai',
  'Gaurav Bansal', 'Kritika Bhatt', 'Vishal Chandra', 'Deepika Thakur', 'Arnav Sinha',
  'Ishita Kapoor', 'Tarun Rawat', 'Rashmi Yadav', 'Shubham Choudhary', 'Preeti Arora',
  'Mohit Garg', 'Neha Rastogi', 'Sumit Dixit', 'Vani Grover', 'Chirag Lal',
]

const generateStudents = (cls, session) => {
  const subjects = getSubjects(cls)
  const count = 25 + (seed(cls + session) % 20)
  return Array.from({ length: Math.min(count, STUDENT_NAMES.length) }, (_, i) => {
    const name = STUDENT_NAMES[i]
    const marks = {}
    let total = 0
    subjects.forEach(sub => {
      const s = seed(name + sub + session)
      const m = pseudoRand(s, 38, 98)
      marks[sub] = m
      total += m
    })
    const pct = Math.round((total / (subjects.length * MAX_MARKS)) * 100)
    const grade =
      pct >= 90 ? 'A+' :
      pct >= 80 ? 'A'  :
      pct >= 70 ? 'B+' :
      pct >= 60 ? 'B'  :
      pct >= 50 ? 'C'  :
      pct >= 40 ? 'D'  : 'F'
    return { rollNo: i + 1, name, marks, total, pct, grade }
  }).sort((a, b) => b.total - a.total)
   .map((s, i) => ({ ...s, rank: i + 1 }))
}

// ─── GRADE COLORS ─────────────────────────────────────────────────────────────
const gradeStyle = (g) => {
  const map = {
    'A+': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300',
    'A':  'bg-teal-100 text-teal-800 dark:bg-teal-500/20 dark:text-teal-300',
    'B+': 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300',
    'B':  'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300',
    'C':  'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
    'D':  'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300',
    'F':  'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300',
  }
  return map[g] || 'bg-slate-100 text-slate-600'
}

const rankStyle = (r) =>
  r === 1 ? 'text-amber-500' : r === 2 ? 'text-slate-400' : r === 3 ? 'text-orange-400' : 'text-slate-400'

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

// ─── SCHOOL HEADER ────────────────────────────────────────────────────────────
function SchoolHeader({ session, className }) {
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
        <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25 text-[12px] font-bold text-amber-700 dark:text-amber-400">
          Session: {session}
        </span>
        <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-blue-100 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/25 text-[12px] font-bold text-blue-700 dark:text-blue-400">
          {className}
        </span>
      </div>
      <p className="mt-2 text-[13px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400">
        Cumulative Sheet
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

// ─── MOBILE STUDENT CARD ──────────────────────────────────────────────────────
function MobileStudentCard({ student, subjects }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Rank badge */}
        <span className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[13px] font-extrabold border-2 ${
          student.rank === 1 ? 'border-amber-400 bg-amber-50 dark:bg-amber-500/10 text-amber-600' :
          student.rank === 2 ? 'border-slate-400 bg-slate-100 dark:bg-slate-800 text-slate-600' :
          student.rank === 3 ? 'border-orange-400 bg-orange-50 dark:bg-orange-500/10 text-orange-600' :
          'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-400'
        }`}>
          {student.rank <= 3
            ? <Star className={`w-3.5 h-3.5 ${rankStyle(student.rank)}`} fill="currentColor" />
            : student.rank}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">
            {student.name}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Roll No: <span className="font-semibold text-slate-600 dark:text-slate-300">{student.rollNo}</span>
            &nbsp;·&nbsp; Total: <span className="font-semibold text-blue-600 dark:text-blue-400">{student.total}</span>
          </p>
        </div>

        {/* Right: pct + grade */}
        <div className="flex flex-col items-end flex-shrink-0 gap-1">
          <span className={`px-2 py-0.5 rounded-lg text-[12px] font-bold ${gradeStyle(student.grade)}`}>
            {student.grade}
          </span>
          <span className="text-[12px] font-bold text-slate-600 dark:text-slate-300 tabular-nums">{student.pct}%</span>
        </div>

        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Progress bar */}
      <div className="px-4 pb-3">
        <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              student.pct >= 80 ? 'bg-emerald-500' :
              student.pct >= 60 ? 'bg-blue-500' :
              student.pct >= 40 ? 'bg-amber-500' : 'bg-rose-500'
            }`}
            style={{ width: `${student.pct}%` }}
          />
        </div>
      </div>

      {/* Expanded subject breakdown */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-2">Subject-wise Marks</p>
          <div className="grid grid-cols-2 gap-2">
            {subjects.map(sub => {
              const m = student.marks[sub]
              const subPct = Math.round((m / MAX_MARKS) * 100)
              return (
                <div key={sub} className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 p-2.5">
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide truncate mb-1">{sub}</p>
                  <div className="flex items-end justify-between gap-1">
                    <span className="text-[18px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{m}</span>
                    <span className="text-[10px] text-slate-400 mb-0.5">/{MAX_MARKS}</span>
                  </div>
                  <div className="mt-1.5 h-1 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${subPct >= 80 ? 'bg-emerald-500' : subPct >= 60 ? 'bg-blue-500' : subPct >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                      style={{ width: `${subPct}%` }}
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
function FilterDrawer({ open, onClose, session, setSession, selectedClass, setSelectedClass, classes, loading, errors, onSubmit }) {
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
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Select Filters</span>
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
          <Field label="Class" error={errors.selectedClass} required>
            <NativeSelect value={selectedClass} onChange={e => setSelectedClass(e.target.value)} placeholder="-- Select Class --" error={errors.selectedClass} disabled={!session}>
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>
        </div>
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={() => { onSubmit(); onClose() }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-70 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Generate Sheet
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function CumulativeSheet() {
  const [session,       setSession]       = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [students,      setStudents]      = useState([])
  const [subjects,      setSubjects]      = useState([])
  const [loading,       setLoading]       = useState(false)
  const [exporting,     setExporting]     = useState(false)
  const [filterOpen,    setFilterOpen]    = useState(false)
  const [search,        setSearch]        = useState('')
  const [errors,        setErrors]        = useState({})
  const [toast,         setToast]         = useState(null)
  const [shown,         setShown]         = useState(false)
  const [shownMeta,     setShownMeta]     = useState({ session: '', class: '' })
  const tableRef = useRef(null)

  // Available classes for selected session
  const classes = useMemo(() => CLASSES_BY_SESSION[session] || [], [session])

  // Reset class when session changes
  const handleSessionChange = (e) => {
    setSession(e.target.value)
    setSelectedClass('')
    setErrors(p => ({ ...p, session: undefined }))
  }

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    const err = {}
    if (!session)       err.session = 'Please select a session'
    if (!selectedClass) err.selectedClass = 'Please select a class'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      const subs = getSubjects(selectedClass)
      const data = generateStudents(selectedClass, session)
      setSubjects(subs)
      setStudents(data)
      setShownMeta({ session, class: selectedClass })
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} students for ${selectedClass} – Session ${session}.`)
    }, 750)
  }, [session, selectedClass])

  const handleReset = () => {
    setSession(''); setSelectedClass(''); setStudents([])
    setSubjects([]); setSearch(''); setErrors({})
    setShown(false); setShownMeta({ session: '', class: '' })
  }

  const handleExcel = () => {
    if (!students.length) { showToast('Generate the sheet first before exporting.', 'error'); return }
    setExporting(true)
    setTimeout(() => { setExporting(false); showToast('Excel export ready! (API integration pending)') }, 1200)
  }

  // ── Search / filter ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return students
    const q = search.toLowerCase()
    return students.filter(s =>
      s.name.toLowerCase().includes(q) ||
      String(s.rollNo).includes(q) ||
      s.grade.toLowerCase().includes(q)
    )
  }, [students, search])

  // ── Summary stats ──────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    if (!filtered.length) return null
    const avgPct = Math.round(filtered.reduce((a, s) => a + s.pct, 0) / filtered.length)
    const topStudent = filtered[0] // already sorted by rank
    const passed = filtered.filter(s => s.pct >= 40).length
    return { avgPct, topStudent, passed, total: filtered.length }
  }, [filtered])

  const hasResults  = shown && students.length > 0
  const activeCount = [session, selectedClass].filter(Boolean).length

  return (
    <div className="space-y-4 pb-10">

      {/* ── Breadcrumb ────────────────────────────────────────────────────── */}
      <nav className="flex items-center flex-wrap gap-1 text-[12px] text-slate-400 dark:text-slate-500">
        {['Home', 'Report', 'Exam Report', 'Cumulative Sheet'].map((crumb, i, arr) => (
          <span key={crumb} className="flex items-center gap-1">
            <span className={i === arr.length - 1
              ? 'text-blue-600 dark:text-indigo-400 font-semibold'
              : 'hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors'}>
              {crumb}
            </span>
            {i < arr.length - 1 && <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600" />}
          </span>
        ))}
      </nav>

      {/* ── Page Title ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Cumulative Sheet
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Subject-wise marks, totals, percentages, grades &amp; ranks per class.
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
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <Field label="Session" error={errors.session} required>
              <NativeSelect value={session} onChange={handleSessionChange} placeholder="-- Select Session --" error={errors.session}>
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Class" error={errors.selectedClass} required>
              <NativeSelect
                value={selectedClass}
                onChange={e => { setSelectedClass(e.target.value); setErrors(p => ({ ...p, selectedClass: undefined })) }}
                placeholder="-- Select Class --"
                error={errors.selectedClass}
                disabled={!session}
              >
                {classes.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            {/* Spacer */}
            <div />

            <div className="flex gap-2">
              <button type="button" onClick={handleSubmit} disabled={loading}
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

      {/* ── MOBILE Filter Bar ─────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {activeCount > 0 ? `${shownMeta.class || selectedClass || 'Class'} · ${shownMeta.session || session || 'Session'}` : 'Select Filters'}
          {activeCount > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeCount}</span>
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

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        session={session}
        setSession={(v) => { setSession(v); setSelectedClass('') }}
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
        classes={classes}
        loading={loading}
        errors={errors}
        onSubmit={handleSubmit}
      />

      {/* ── Loading Skeleton ──────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.1 }} />
          ))}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* School Header */}
          <SchoolHeader session={shownMeta.session} className={shownMeta.class} />

          {/* Summary Cards */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <SummaryCard icon={Users}        label="Total Students"  value={stats.total}                      color="blue"    />
              <SummaryCard icon={Award}        label="Class Average"   value={`${stats.avgPct}%`}               color="violet"  />
              <SummaryCard icon={GraduationCap}label="Students Passed" value={stats.passed}                     color="emerald" sub={`of ${stats.total}`} />
              <SummaryCard icon={Star}         label="Topper"          value={stats.topStudent?.name.split(' ')[0]} color="amber" sub={`${stats.topStudent?.pct}%`} />
            </div>
          )}

          {/* Results card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">
                  {shownMeta.class}
                </span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">· {shownMeta.session}</span>
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
                  placeholder="Search name, roll no, grade…"
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
                Each subject out of {MAX_MARKS} marks. Students sorted by rank (highest to lowest).
              </p>
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block" ref={tableRef}>
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No records match your search.</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-max">
                    <thead className="sticky top-0 z-10">
                      <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50 dark:bg-[#1e2238]">
                        {/* Fixed columns */}
                        <th className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap sticky left-0 bg-slate-50 dark:bg-[#1e2238] z-20 w-12">Rank</th>
                        <th className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap w-16">Roll</th>
                        <th className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap min-w-[140px]">Student Name</th>
                        {/* Subject cols */}
                        {subjects.map(sub => (
                          <th key={sub} className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {sub}<br />
                            <span className="text-[10px] font-normal normal-case tracking-normal text-slate-400">/{MAX_MARKS}</span>
                          </th>
                        ))}
                        <th className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400 whitespace-nowrap">Total</th>
                        <th className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">%</th>
                        <th className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((student) => (
                        <tr key={student.rollNo}
                          className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
                          {/* Rank */}
                          <td className="px-3 py-2.5 text-center sticky left-0 bg-white dark:bg-[#1a1f35] hover:bg-slate-50/60 dark:hover:bg-[#1e2238] z-10">
                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-[12px] font-bold ${
                              student.rank === 1 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                              student.rank === 2 ? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' :
                              student.rank === 3 ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400' :
                              'text-slate-400 dark:text-slate-500'
                            }`}>
                              {student.rank <= 3
                                ? <Star className={`w-3.5 h-3.5 ${rankStyle(student.rank)}`} fill="currentColor" />
                                : student.rank}
                            </span>
                          </td>
                          {/* Roll No */}
                          <td className="px-3 py-2.5 text-center text-[12px] text-slate-500 dark:text-slate-400 tabular-nums">{student.rollNo}</td>
                          {/* Name */}
                          <td className="px-3 py-2.5">
                            <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{student.name}</span>
                          </td>
                          {/* Subject marks */}
                          {subjects.map(sub => {
                            const m = student.marks[sub]
                            return (
                              <td key={sub} className="px-3 py-2.5 text-center">
                                <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-lg text-[12px] font-semibold tabular-nums ${
                                  m >= 80 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                                  m >= 60 ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' :
                                  m >= 40 ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' :
                                  'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
                                }`}>
                                  {m}
                                </span>
                              </td>
                            )
                          })}
                          {/* Total */}
                          <td className="px-3 py-2.5 text-center">
                            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-xl text-[13px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 tabular-nums">
                              {student.total}
                            </span>
                          </td>
                          {/* Pct */}
                          <td className="px-3 py-2.5 text-center">
                            <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 tabular-nums">{student.pct}%</span>
                          </td>
                          {/* Grade */}
                          <td className="px-3 py-2.5 text-center">
                            <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-lg text-[12px] font-bold ${gradeStyle(student.grade)}`}>
                              {student.grade}
                            </span>
                          </td>
                        </tr>
                      ))}

                      {/* Grand Average row */}
                      {stats && (
                        <tr className="bg-blue-50 dark:bg-indigo-500/[0.07] border-t-2 border-blue-200 dark:border-indigo-500/30">
                          <td className="px-3 py-3 text-center sticky left-0 bg-blue-50 dark:bg-[#1a2040] z-10">
                            <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400 mx-auto" />
                          </td>
                          <td className="px-3 py-3 text-center text-[12px] text-blue-400">—</td>
                          <td className="px-3 py-3">
                            <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300">Class Average</span>
                          </td>
                          {subjects.map(sub => {
                            const avg = Math.round(filtered.reduce((a, s) => a + s.marks[sub], 0) / filtered.length)
                            return (
                              <td key={sub} className="px-3 py-3 text-center">
                                <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{avg}</span>
                              </td>
                            )
                          })}
                          <td className="px-3 py-3 text-center">
                            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-xl text-[13px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 tabular-nums">
                              {Math.round(filtered.reduce((a, s) => a + s.total, 0) / filtered.length)}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{stats.avgPct}%</span>
                          </td>
                          <td className="px-3 py-3 text-center text-[12px] text-blue-400">—</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
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
                    Tap a card to see subject-wise breakdown.
                  </p>

                  {filtered.map(student => (
                    <MobileStudentCard key={student.rollNo} student={student} subjects={subjects} />
                  ))}

                  {/* Mobile class average */}
                  {stats && (
                    <div className="rounded-xl border-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07] p-4">
                      <p className="text-[12px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> Class Summary
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                          <p className="text-[22px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{stats.total}</p>
                          <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Total Students</p>
                        </div>
                        <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                          <p className="text-[22px] font-bold text-violet-700 dark:text-violet-300 tabular-nums">{stats.avgPct}%</p>
                          <p className="text-[10px] font-semibold text-violet-600 dark:text-violet-400">Class Average</p>
                        </div>
                        <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                          <p className="text-[22px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">{stats.passed}</p>
                          <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Passed</p>
                        </div>
                        <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                          <p className="text-[22px] font-bold text-rose-700 dark:text-rose-300 tabular-nums">{stats.total - stats.passed}</p>
                          <p className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">Failed</p>
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

      {/* ── Empty State ───────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <BarChart3 className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No sheet generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a session &amp; class, then click <strong>Show</strong> to generate the cumulative sheet.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
