/**
 * StudentTypeReport.jsx
 * Folder: src/pages/Student/Reports/StudentTypeReport.jsx
 *
 * Converts legacy ASPX "Student Type" report to fully-responsive React + Tailwind.
 *
 * Filter: RadioButton toggle — Day School | Day Boarding
 * Columns: S.No, Adm No, Student Name, Father Name, D.O.B, Class
 * Features:
 *  - Instant toggle (no Show button needed — auto-loads on radio change, same as AutoPostBack=true)
 *  - Export Excel button
 *  - Search/filter
 *  - Summary stat cards
 *  - Mobile cards with expandable details
 *  - Desktop dense ERP table
 */

import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  RefreshCw, Eye,
  AlertCircle, X, Check, Loader2, ChevronDown,
  Users, SlidersHorizontal, Info, Search,
  BarChart3, FileSpreadsheet, BookOpen,
  School2, TrendingUp, ChevronRight,
  UserCircle2, Bus, Home, Calendar,
  GraduationCap, UserCheck, Hash
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────
const CLASSES = [
  'Nursery','LKG','UKG',
  'Class I','Class II','Class III','Class IV','Class V',
  'Class VI','Class VII','Class VIII','Class IX','Class X',
  'Class XI','Class XII',
]

const FIRST_NAMES = [
  'Aarav','Aditya','Akash','Ananya','Arjun','Bhavna','Chetan','Deepak',
  'Divya','Gaurav','Ishaan','Kavya','Kunal','Manish','Meera','Neha',
  'Nikhil','Pooja','Priya','Rahul','Ravi','Rohit','Sakshi','Shreya',
  'Siddharth','Sneha','Tanvi','Tushar','Uday','Varun','Vidya','Vivek',
  'Yash','Zara','Arnav','Dhruv','Esha','Farhan','Garima','Harshit',
]
const FATHER_FIRST = [
  'Ramesh','Suresh','Mahesh','Dinesh','Rajesh','Naresh','Umesh','Ganesh',
  'Vikas','Sanjeev','Pankaj','Amit','Anil','Vijay','Rakesh','Satish',
]
const LAST_NAMES = [
  'Sharma','Verma','Gupta','Singh','Kumar','Patel','Joshi','Mishra',
  'Tiwari','Pandey','Yadav','Chauhan','Rajput','Malik','Agarwal','Saxena',
]

function randDOB(seed) {
  const year  = 2005 + (seed % 12)
  const month = String(1 + (seed % 12)).padStart(2, '0')
  const day   = String(1 + (seed % 28)).padStart(2, '0')
  return `${day}/${month}/${year}`
}

function generateStudents(type) {
  // Day School: ~280 students, Day Boarding: ~120 students
  const count   = type === '1' ? 280 : 120
  const prefix  = type === '1' ? 'DS' : 'DB'
  const result  = []
  for (let i = 0; i < count; i++) {
    const seed     = i + (type === '1' ? 1 : 5000)
    const fname    = FIRST_NAMES[seed % FIRST_NAMES.length]
    const lname    = LAST_NAMES[(seed * 3) % LAST_NAMES.length]
    const ffname   = FATHER_FIRST[(seed * 7) % FATHER_FIRST.length]
    const cls      = CLASSES[seed % CLASSES.length]
    result.push({
      registration_no: `${prefix}${String(seed * 7 + 1001).slice(-4)}`,
      Student_Name:    `${fname} ${lname}`,
      father_name:     `${ffname} ${lname}`,
      DOB:             randDOB(seed),
      class_name:      cls,
    })
  }
  return result
}

// Pre-generate both datasets
const STUDENT_DATA = {
  '1': generateStudents('1'), // Day School
  '2': generateStudents('2'), // Day Boarding
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const CLASS_BADGE_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' },
  { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#0891b2', bg: '#cffafe' },
  { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' },
  { fg: '#dc2626', bg: '#fee2e2' },
  { fg: '#0369a1', bg: '#e0f2fe' },
]
const classBadgeColor = (name) =>
  CLASS_BADGE_COLORS[(name?.charCodeAt(0) ?? 0) % CLASS_BADGE_COLORS.length]

const formatAbbr = (name = '') =>
  name.replace('Class ', '').slice(0, 3).toUpperCase()

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

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
    blue:   'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald:'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
    amber:  'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    cyan:   'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color] ?? colors.blue}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value.toLocaleString()}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── STUDENT TYPE TOGGLE ──────────────────────────────────────────────────────
function TypeToggle({ value, onChange }) {
  const options = [
    { val: '1', label: 'Day School',    icon: Home,  color: 'blue'  },
    { val: '2', label: 'Day Boarding',  icon: Bus,   color: 'violet' },
  ]
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map(opt => {
        const Icon    = opt.icon
        const active  = value === opt.val
        const colorMap = {
          blue:   active
            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:border-indigo-600'
            : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600 dark:bg-[#1e2238] dark:text-slate-300 dark:border-[rgba(99,102,241,0.25)] dark:hover:border-indigo-400',
          violet: active
            ? 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-500/20'
            : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300 hover:text-violet-600 dark:bg-[#1e2238] dark:text-slate-300 dark:border-[rgba(99,102,241,0.25)] dark:hover:border-violet-400',
        }
        return (
          <button
            key={opt.val}
            type="button"
            onClick={() => onChange(opt.val)}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-[13px] font-semibold border transition-all duration-200 active:scale-95
              ${colorMap[opt.color]}`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {opt.label}
            {active && (
              <span className="w-1.5 h-1.5 rounded-full bg-white/70 flex-shrink-0" />
            )}
          </button>
        )
      })}
    </div>
  )
}

// ─── CLASS DISTRIBUTION MINI CHART ───────────────────────────────────────────
function ClassDistribution({ rows }) {
  const counts = useMemo(() => {
    const c = {}
    rows.forEach(r => { c[r.class_name] = (c[r.class_name] || 0) + 1 })
    return c
  }, [rows])

  const sorted = useMemo(() =>
    CLASSES.filter(c => counts[c] > 0)
      .map(c => ({ cls: c, count: counts[c] })),
    [counts]
  )
  const max = Math.max(...sorted.map(s => s.count), 1)

  return (
    <div className="rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] p-4 shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
        <GraduationCap className="w-3.5 h-3.5" /> Class-wise Distribution
      </p>
      <div className="space-y-1.5">
        {sorted.map(({ cls, count }) => {
          const { fg, bg } = classBadgeColor(cls)
          const pct = Math.round((count / max) * 100)
          return (
            <div key={cls} className="flex items-center gap-2">
              <span
                className="w-7 h-5 rounded flex-shrink-0 flex items-center justify-center text-[9px] font-bold"
                style={{ background: bg, color: fg }}
              >
                {formatAbbr(cls)}
              </span>
              <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: fg }}
                />
              </div>
              <span className="text-[11px] font-bold tabular-nums text-slate-500 dark:text-slate-400 w-6 text-right">{count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx, isTotal, totalCount }) {
  if (isTotal) {
    return (
      <tr className="bg-blue-50 dark:bg-indigo-500/[0.07] border-t-2 border-blue-200 dark:border-indigo-500/30">
        <td className="px-4 py-3 text-center text-[12px] text-blue-500">—</td>
        <td className="px-4 py-3" colSpan={4}>
          <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Grand Total
          </span>
        </td>
        <td className="px-4 py-3 text-center">
          <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-[13px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 tabular-nums">
            {totalCount} Students
          </span>
        </td>
      </tr>
    )
  }

  const { fg, bg } = classBadgeColor(row.class_name)

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 tabular-nums w-12">{idx}</td>

      {/* Adm No */}
      <td className="px-4 py-3">
        <span className="text-[12px] font-mono font-semibold text-slate-600 dark:text-slate-300">{row.registration_no}</span>
      </td>

      {/* Student Name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
            {row.Student_Name.charAt(0)}
          </div>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.Student_Name}</span>
        </div>
      </td>

      {/* Father Name */}
      <td className="px-4 py-3">
        <span className="text-[12px] text-slate-600 dark:text-slate-300">{row.father_name}</span>
      </td>

      {/* D.O.B */}
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center gap-1 text-[12px] font-medium text-slate-500 dark:text-slate-400 tabular-nums">
          <Calendar className="w-3 h-3 opacity-60 flex-shrink-0" />
          {row.DOB}
        </span>
      </td>

      {/* Class */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[9px] font-bold"
            style={{ background: bg, color: fg }}
          >
            {formatAbbr(row.class_name)}
          </span>
          <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.class_name}</span>
        </div>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row, idx }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = classBadgeColor(row.class_name)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0">
          {row.Student_Name.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 truncate leading-tight">{row.Student_Name}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1.5">
            <span className="font-mono">{row.registration_no}</span>
            <span>·</span>
            <span className="font-semibold" style={{ color: fg }}>{row.class_name}</span>
          </p>
        </div>

        {/* DOB chip */}
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex-shrink-0">
          <Calendar className="w-2.5 h-2.5" />
          {row.DOB}
        </span>

        <span className={`w-5 h-5 flex items-center justify-center ml-0.5 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4">
          <div className="grid grid-cols-2 gap-2">
            {/* Father Name */}
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2.5 col-span-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-0.5">Father's Name</p>
              <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{row.father_name}</p>
            </div>

            {/* Class */}
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1">Class</p>
              <div className="flex items-center gap-1.5">
                <span className="w-6 h-6 rounded-md text-[9px] font-bold flex items-center justify-center" style={{ background: bg, color: fg }}>
                  {formatAbbr(row.class_name)}
                </span>
                <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-200">{row.class_name}</span>
              </div>
            </div>

            {/* Adm No */}
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-0.5">Adm No</p>
              <p className="text-[13px] font-mono font-semibold text-slate-700 dark:text-slate-200">{row.registration_no}</p>
            </div>

            {/* DOB */}
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2.5 col-span-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-0.5">Date of Birth</p>
              <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {row.DOB}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function StudentTypeReport() {
  const [stuType,    setStuType]    = useState('1')   // '1' = Day School, '2' = Day Boarding
  const [rows,       setRows]       = useState([])
  const [loading,    setLoading]    = useState(false)
  const [exporting,  setExporting]  = useState(false)
  const [search,     setSearch]     = useState('')
  const [toast,      setToast]      = useState(null)
  const [classFilter,setClassFilter]= useState('')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Auto-load on type change (mirrors AutoPostBack=true) ─────────────────
  const loadData = useCallback((type) => {
    setLoading(true)
    setSearch('')
    setClassFilter('')
    setTimeout(() => {
      const data = STUDENT_DATA[type] || []
      setRows(data)
      setLoading(false)
      const label = type === '1' ? 'Day School' : 'Day Boarding'
      showToast(`Loaded ${data.length} ${label} students.`)
    }, 500)
  }, [])

  // Load Day School on mount (matches original which shows data on page load)
  useEffect(() => { loadData('1') }, [loadData])

  const handleTypeChange = (val) => {
    setStuType(val)
    loadData(val)
  }

  const handleReset = () => {
    setSearch('')
    setClassFilter('')
  }

  // ── Export ────────────────────────────────────────────────────────────────
  const handleExcel = () => {
    if (rows.length === 0) { showToast('No data to export.', 'error'); return }
    setExporting(true)
    setTimeout(() => {
      setExporting(false)
      showToast('Excel export ready! (API integration pending)')
    }, 1200)
  }

  // ── Unique classes for class filter dropdown ──────────────────────────────
  const uniqueClasses = useMemo(() => {
    const seen = new Set()
    const result = []
    rows.forEach(r => {
      if (!seen.has(r.class_name)) { seen.add(r.class_name); result.push(r.class_name) }
    })
    return CLASSES.filter(c => seen.has(c))
  }, [rows])

  // ── Search + class filter ─────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let data = rows
    if (classFilter) data = data.filter(r => r.class_name === classFilter)
    if (search) {
      const q = search.toLowerCase()
      data = data.filter(r =>
        r.Student_Name.toLowerCase().includes(q) ||
        r.registration_no.toLowerCase().includes(q) ||
        r.father_name.toLowerCase().includes(q) ||
        r.class_name.toLowerCase().includes(q)
      )
    }
    return data
  }, [rows, search, classFilter])

  const typeLabel = stuType === '1' ? 'Day School' : 'Day Boarding'
  const TypeIcon  = stuType === '1' ? Home : Bus
  const typeColor = stuType === '1' ? 'blue' : 'violet'

  // Unique classes in filtered
  const classCount = useMemo(() => {
    const s = new Set(filtered.map(r => r.class_name))
    return s.size
  }, [filtered])

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <School2 className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Student Type
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            View students by type — Day School or Day Boarding.
          </p>
        </div>
        {rows.length > 0 && (
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

      {/* ── Filter Card ──────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Select Student Type</span>
        </div>
        <div className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Radio Toggle */}
            <TypeToggle value={stuType} onChange={handleTypeChange} />

            {/* Secondary filters row */}
            {rows.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                {/* Class filter */}
                <div className="relative">
                  <select
                    value={classFilter}
                    onChange={e => setClassFilter(e.target.value)}
                    className="appearance-none pl-3 pr-7 py-1.5 text-[12px] rounded-lg border outline-none transition-all cursor-pointer
                      bg-white text-slate-700 border-slate-200
                      focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                      dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]"
                  >
                    <option value="">All Classes</option>
                    {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                </div>

                {/* Reset filters */}
                {(search || classFilter) && (
                  <button type="button" onClick={handleReset}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold
                      bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
                    <RefreshCw className="w-3 h-3" /> Reset
                  </button>
                )}

                {/* Mobile export */}
                <button type="button" onClick={handleExcel} disabled={exporting}
                  className="sm:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
                    bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-70 transition-colors">
                  {exporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileSpreadsheet className="w-3 h-3" />}
                  Export
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Loading Skeleton ─────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {!loading && rows.length > 0 && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={TypeIcon}     label={typeLabel}       value={rows.length}   color={typeColor} />
            <SummaryCard icon={Users}        label="Filtered Students" value={filtered.length} color="blue"  />
            <SummaryCard icon={GraduationCap}label="Classes"          value={classCount}    color="emerald"  />
            <SummaryCard icon={Hash}         label="Showing"          value={filtered.length} color="amber"  />
          </div>

          {/* Class Distribution */}
          <ClassDistribution rows={filtered} />

          {/* Results Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">{typeLabel} Students</span>
                {classFilter && (
                  <span className="text-[13px] text-slate-400 dark:text-slate-500">· {classFilter}</span>
                )}
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
                  placeholder="Search name, adm no, father…"
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
                Toggling the type above instantly updates the list. Use class dropdown or search to narrow results further.
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
                      {['S.No.', 'Adm No.', 'Student Name', 'Father Name', 'D.O.B', 'Class'].map((h, i) => (
                        <th key={i} className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-12">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <DesktopRow key={row.registration_no} row={row} idx={i + 1} />
                    ))}
                    <DesktopRow isTotal totalCount={filtered.length} />
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
                    Tap a card to see full student details.
                  </p>
                  {filtered.map((row, i) => (
                    <MobileCard key={row.registration_no} row={row} idx={i + 1} />
                  ))}

                  {/* Mobile Grand Total */}
                  <div className="rounded-xl border-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07] p-4">
                    <p className="text-[12px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Total — {filtered.length} Students
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{filtered.length}</p>
                        <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">{typeLabel}</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{classCount}</p>
                        <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Classes</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{rows.length}</span> students
              </p>
              {(search || classFilter) && (
                <button onClick={handleReset}
                  className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                  <X className="w-3 h-3" /> Clear filters
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Empty State (should not normally show since auto-loads) ──────── */}
      {!loading && rows.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <BarChart3 className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No students found</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a student type above to load the report.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
